/**
 * @jest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { DefaultArrayRenderer } from "@/components/DynamicTable/components/DefaultArrayRenderer";

describe("DefaultArrayRenderer", () => {
  test("renders primitive values as strings", () => {
    const arr = [1, 2, 3, "text", true];
    // Ensure all items render, including 'true'
    render(<DefaultArrayRenderer arr={arr} maxChips={5} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("text")).toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  test("renders objects as JSON strings (lines 26–27)", () => {
    const arr = [
      { name: "John", age: 30 },
      { name: "Jane", age: 25 },
    ];
    render(<DefaultArrayRenderer arr={arr} />);

    expect(screen.getByText('{"name":"John","age":30}')).toBeInTheDocument();
    expect(screen.getByText('{"name":"Jane","age":25}')).toBeInTheDocument();
  });

  test("limits number of chips to maxChips", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    render(<DefaultArrayRenderer arr={arr} maxChips={4} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();
    expect(screen.getByText("+4 more")).toBeInTheDocument();
  });

  test("shows remaining count when array exceeds maxChips", () => {
    const arr = [1, 2, 3, 4, 5, 6];
    render(<DefaultArrayRenderer arr={arr} maxChips={3} />);
    expect(screen.getByText("+3 more")).toBeInTheDocument();
  });

  test("does not show remaining count when array length equals maxChips", () => {
    const arr = [1, 2, 3, 4];
    render(<DefaultArrayRenderer arr={arr} maxChips={4} />);
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });

  test("handles empty array", () => {
    const arr: unknown[] = [];
    const { container } = render(<DefaultArrayRenderer arr={arr} />);
    const chips = container.querySelectorAll(".MuiChip-root");
    expect(chips.length).toBe(0);
  });

  test("handles array with null values", () => {
    const arr = [null, "test", null];
    render(<DefaultArrayRenderer arr={arr} />);
    // two "null" items
    const nulls = screen.getAllByText("null");
    expect(nulls).toHaveLength(2);
    expect(screen.getByText("test")).toBeInTheDocument();
  });

  test("handles array with undefined values", () => {
    const arr = [undefined, "test", undefined];
    render(<DefaultArrayRenderer arr={arr} />);
    // two "undefined" items
    const undefs = screen.getAllByText("undefined");
    expect(undefs).toHaveLength(2);
    expect(screen.getByText("test")).toBeInTheDocument();
  });

  test("handles mixed primitive and object array", () => {
    const arr = [1, { key: "value" }, "text", { id: 42 }];
    render(<DefaultArrayRenderer arr={arr} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("text")).toBeInTheDocument();
    expect(screen.getByText('{"key":"value"}')).toBeInTheDocument();
    expect(screen.getByText('{"id":42}')).toBeInTheDocument();
  });

  test("handles nested objects", () => {
    const arr = [{ user: { name: "John", age: 30 } }];
    render(<DefaultArrayRenderer arr={arr} />);
    expect(screen.getByText('{"user":{"name":"John","age":30}}')).toBeInTheDocument();
  });

  test("handles array of arrays", () => {
    const arr = [
      [1, 2],
      [3, 4],
    ];
    render(<DefaultArrayRenderer arr={arr} />);
    expect(screen.getByText("[1,2]")).toBeInTheDocument();
    expect(screen.getByText("[3,4]")).toBeInTheDocument();
  });

  test("uses default maxChips of 4 when not specified", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7];
    render(<DefaultArrayRenderer arr={arr} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();
    expect(screen.getByText("+3 more")).toBeInTheDocument();
  });

  test("handles Date objects (object branch uses JSON.stringify)", () => {
    const date = new Date("2025-01-15");
    render(<DefaultArrayRenderer arr={[date]} />);
    expect(screen.getByText(`"${date.toISOString()}"`)).toBeInTheDocument();
  });

  test("handles objects with special characters", () => {
    const arr = [{ message: 'Hello "World"' }];
    render(<DefaultArrayRenderer arr={arr} />);
    expect(screen.getByText('{"message":"Hello \\"World\\""}')).toBeInTheDocument();
  });

  // Explicitly exercise lines 26–28 branches:
  test("branch coverage: primitive/object/fallback label logic", () => {
    const fn = () => 123; // non-primitive, not an object (typeof === 'function')
    render(<DefaultArrayRenderer arr={[42, { a: 1 }, fn]} maxChips={3} />);

    // primitive → "42"
    expect(screen.getByText("42")).toBeInTheDocument();
    // object → JSON
    expect(screen.getByText('{"a":1}')).toBeInTheDocument();
    // fallback → String(fn) – match generic function text
    expect(screen.getByText(/function|\=\>/i)).toBeInTheDocument();
  });
});
