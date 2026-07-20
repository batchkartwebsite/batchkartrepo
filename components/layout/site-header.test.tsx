import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("renders the logo and primary nav", () => {
    render(
      <ThemeProvider attribute="class">
        <SiteHeader />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText("BatchKart")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Batches" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });
});
