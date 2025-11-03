import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import AlertBox from "../../components/AlertBox";

describe("AlertBox", () => {
  it("renders its children correctly", () => {
    render(<AlertBox>Warning message</AlertBox>);
    const box = screen.getByText("Warning message");
    expect(box).toBeInTheDocument();
  });

  it("applies the correct base styling classes", () => {
    render(<AlertBox>Check classes</AlertBox>);
    const box = screen.getByText("Check classes");
    expect(box).toHaveClass(
      "inline-flex",
      "items-center",
      "gap-2",
      "rounded-md",
      "border",
      "border-amber-300",
      "bg-amber-50",
      "px-3",
      "py-2",
      "text-amber-800"
    );
  });

  it("renders multiple children elements", () => {
    render(
      <AlertBox>
        <span>Part 1</span>
        <strong>Part 2</strong>
      </AlertBox>
    );
    expect(screen.getByText("Part 1")).toBeInTheDocument();
    expect(screen.getByText("Part 2")).toBeInTheDocument();
  });
});
