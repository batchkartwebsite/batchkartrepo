import { describe, it, expect, vi, beforeEach } from "vitest";
import { signAdminToken } from "./admin-session";

const SUB = "22222222-2222-2222-2222-222222222222";
const getUser = vi.fn();
const single = vi.fn();
const cookieGet = vi.fn();

vi.mock("next/headers", () => ({ cookies: async () => ({ get: cookieGet }) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser },
    from: () => ({ select: () => ({ eq: () => ({ single }) }) }),
  }),
}));

beforeEach(() => { getUser.mockReset(); single.mockReset(); cookieGet.mockReset(); });

describe("getAdminContext", () => {
  it("returns context for an admin with a valid unlock token", async () => {
    getUser.mockResolvedValue({ data: { user: { id: SUB } } });
    single.mockResolvedValue({ data: { id: SUB, role: "admin", full_name: "A", email: "a@x.dev" } });
    cookieGet.mockReturnValue({ value: signAdminToken(SUB) });
    const { getAdminContext } = await import("./require-admin");
    expect(await getAdminContext()).toMatchObject({ userId: SUB });
  });

  it("returns null when the profile is not an admin", async () => {
    getUser.mockResolvedValue({ data: { user: { id: SUB } } });
    single.mockResolvedValue({ data: { id: SUB, role: "student" } });
    cookieGet.mockReturnValue({ value: signAdminToken(SUB) });
    const { getAdminContext } = await import("./require-admin");
    expect(await getAdminContext()).toBeNull();
  });

  it("returns null when the unlock token is missing", async () => {
    getUser.mockResolvedValue({ data: { user: { id: SUB } } });
    single.mockResolvedValue({ data: { id: SUB, role: "admin" } });
    cookieGet.mockReturnValue(undefined);
    const { getAdminContext } = await import("./require-admin");
    expect(await getAdminContext()).toBeNull();
  });
});
