import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "./logo";

describe("Logo", () => {
  it("renders the BatchKart wordmark as one accessible label", () => {
    render(<Logo />);
    expect(screen.getByLabelText("BatchKart")).toBeInTheDocument();
  });

  it("can hide the wordmark for icon-only use", () => {
    render(<Logo showWordmark={false} />);
    expect(screen.queryByText(/Batch/)).not.toBeInTheDocument();
  });
});
