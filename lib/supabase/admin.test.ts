import { describe, it, expect, vi } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ __marker: "admin-client" })),
}));

describe("createAdminClient", () => {
  it("builds a client with the service-role key and no session persistence", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const { createAdminClient } = await import("./admin");
    createAdminClient();
    expect(createClient).toHaveBeenCalledWith(
      expect.any(String),
      "test-svc",
      expect.objectContaining({ auth: expect.objectContaining({ persistSession: false }) }),
    );
  });
});
