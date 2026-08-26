import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductAttribution } from "@/components/ProductAttribution";

describe("ProductAttribution", () => {
  it("renders the official product and developer identity", () => {
    render(<ProductAttribution />);
    expect(screen.getByText("Publish-Lab")).toBeInTheDocument();
    expect(screen.getByText("Dikembangkan oleh Dr. Tofan Stofiana, M.Pd. © 2026")).toBeInTheDocument();
  });
});
