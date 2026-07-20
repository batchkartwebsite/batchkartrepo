import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Request Discount</Button>);
    expect(screen.getByRole("button", { name: "Request Discount" })).toBeInTheDocument();
  });

  it("applies the primary background token by default", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).className).toContain("bg-primary");
  });
});
