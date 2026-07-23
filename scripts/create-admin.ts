/* Usage: npx tsx scripts/create-admin.ts <email> <password> <8-digit-pin>
   Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in the environment
   (load them from .env.local before running). Idempotent.

   Uses the Supabase Auth Admin + REST APIs via fetch (no @supabase/supabase-js) so it
   runs on Node 20 without a native WebSocket. */
import { scryptSync, randomBytes } from "node:crypto";

function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

const [email, password, pin] = process.argv.slice(2);
if (!email || !password || !/^\d{8}$/.test(pin ?? "")) {
  console.error("Usage: tsx scripts/create-admin.ts <email> <password> <8-digit-pin>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

async function main() {
  // 1. Create the auth user (or find the existing one). email_confirm so they can sign in.
  let userId: string | undefined;
  const createRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (createRes.ok) {
    userId = (await createRes.json())?.id;
  } else {
    const text = await createRes.text();
    if (!/already|registered|exists/i.test(text) && createRes.status !== 422) {
      throw new Error(`createUser failed (${createRes.status}): ${text}`);
    }
    // Already exists — look it up, and reset the password so it is known.
    const listRes = await fetch(`${url}/auth/v1/admin/users?per_page=200`, { headers });
    const list = await listRes.json();
    userId = (list.users ?? []).find((u: { email?: string; id: string }) => u.email === email)?.id;
    if (userId) {
      await fetch(`${url}/auth/v1/admin/users/${userId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ password, email_confirm: true }),
      });
    }
  }
  if (!userId) throw new Error("Could not resolve user id");

  // 2. Promote the auto-created profile to admin.
  const pr = await fetch(`${url}/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ role: "admin" }),
  });
  if (!pr.ok) throw new Error(`profiles update failed (${pr.status}): ${await pr.text()}`);

  // 3. Upsert the admin_users row with the hashed PIN.
  const au = await fetch(`${url}/rest/v1/admin_users?on_conflict=profile_id`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ profile_id: userId, security_pin_hash: hashPin(pin!) }),
  });
  if (!au.ok) throw new Error(`admin_users upsert failed (${au.status}): ${await au.text()}`);

  console.log(`✓ Super admin ready: ${email}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
