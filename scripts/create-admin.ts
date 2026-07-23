/* Usage: npx tsx scripts/create-admin.ts <email> <password> <8-digit-pin>
   Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in the environment
   (load them from .env.local before running). Idempotent. */
import { createClient } from "@supabase/supabase-js";
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

const admin = createClient(url, serviceKey);

const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
if (error && !error.message.includes("already been registered")) throw error;

let userId = created?.user?.id;
if (!userId) {
  const { data: list } = await admin.auth.admin.listUsers();
  userId = list.users.find((u) => u.email === email)?.id;
}
if (!userId) throw new Error("Could not resolve user id");

await admin.from("profiles").update({ role: "admin" }).eq("id", userId);
await admin.from("admin_users").upsert(
  { profile_id: userId, security_pin_hash: hashPin(pin!) },
  { onConflict: "profile_id" },
);
console.log(`✓ Super admin ready: ${email}`);
