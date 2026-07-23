import { describe, it, expect } from "vitest";
import { hashPin, verifyPin } from "./pin";

describe("pin hashing", () => {
  it("verifies a correct pin and rejects a wrong one", () => {
    const stored = hashPin("12345678");
    expect(stored.startsWith("scrypt$")).toBe(true);
    expect(verifyPin("12345678", stored)).toBe(true);
    expect(verifyPin("87654321", stored)).toBe(false);
  });

  it("rejects malformed stored values", () => {
    expect(verifyPin("12345678", "garbage")).toBe(false);
  });
});
