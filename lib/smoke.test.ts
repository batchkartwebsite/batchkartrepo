import { describe, it, expect } from "vitest";
import { sum } from "./smoke";

describe("test harness", () => {
  it("runs and imports app modules", () => {
    expect(sum(2, 3)).toBe(5);
  });
});
