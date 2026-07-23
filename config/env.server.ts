import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_SESSION_SECRET: z.string().min(32),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid server environment variables: ${parsed.error.message}`);
  }
  return parsed.data;
}

let cachedServerEnv: ServerEnv | null = null;

function loadServerEnv(): ServerEnv {
  if (!cachedServerEnv) {
    cachedServerEnv = parseServerEnv({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
    });
  }
  return cachedServerEnv;
}

// Lazy proxy: validation runs on first property access (at runtime), not at import.
// This keeps `next build` from requiring these runtime secrets to be present at
// build time, while consumers still use `serverEnv.X` unchanged.
export const serverEnv: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, prop) {
    return loadServerEnv()[prop as keyof ServerEnv];
  },
});
