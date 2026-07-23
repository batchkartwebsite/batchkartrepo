import { describe, it, expectTypeOf } from "vitest";
import type { Database } from "./database.types";

describe("generated database types", () => {
  it("exposes the profiles row with a role enum", () => {
    type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
    expectTypeOf<ProfileRow["role"]>().toEqualTypeOf<
      Database["public"]["Enums"]["user_role"]
    >();
  });

  it("exposes the batches row with a moderation_status enum", () => {
    type BatchRow = Database["public"]["Tables"]["batches"]["Row"];
    expectTypeOf<BatchRow["moderation_status"]>().toEqualTypeOf<
      Database["public"]["Enums"]["moderation_status"]
    >();
  });
});
