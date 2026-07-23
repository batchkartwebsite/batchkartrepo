import { describe, it, expect } from "vitest";
import { signAdminToken, verifyAdminToken, ADMIN_UNLOCK_COOKIE } from "./admin-session";

const SUB = "11111111-1111-1111-1111-111111111111";

describe("admin unlock token", () => {
  it("signs and verifies a token", () => {
    const t = signAdminToken(SUB, 1000);
    expect(verifyAdminToken(t, 2000)).toEqual({ sub: SUB });
  });

  it("rejects an expired token", () => {
    const t = signAdminToken(SUB, 1000);
    expect(verifyAdminToken(t, 1000 + 31 * 60 * 1000)).toBeNull();
  });

  it("rejects a tampered token", () => {
    const t = signAdminToken(SUB, 1000);
    expect(verifyAdminToken(t.slice(0, -2) + "xx", 2000)).toBeNull();
  });

  it("exposes the cookie name", () => {
    expect(ADMIN_UNLOCK_COOKIE).toBe("bk_admin_unlock");
  });
});
