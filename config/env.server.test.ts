import { describe, it, expect } from "vitest";
import { parseServerEnv } from "./env.server";

describe("parseServerEnv", () => {
  it("parses valid server env", () => {
    const env = parseServerEnv({
      SUPABASE_SERVICE_ROLE_KEY: "svc-key",
      ADMIN_SESSION_SECRET: "x".repeat(32),
    });
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe("svc-key");
  });

  it("rejects a short session secret", () => {
    expect(() =>
      parseServerEnv({ SUPABASE_SERVICE_ROLE_KEY: "k", ADMIN_SESSION_SECRET: "short" }),
    ).toThrow(/Invalid server environment/);
  });
});
