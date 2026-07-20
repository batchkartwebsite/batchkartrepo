import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders the brand description and legal links", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/most trusted platform/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByText(/© 2026 BatchKart/i)).toBeInTheDocument();
  });
});
