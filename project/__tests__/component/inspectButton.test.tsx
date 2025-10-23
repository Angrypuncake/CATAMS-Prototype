/**
 * @jest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InspectButton } from "@/components/DynamicTable/components/InspectButton";

describe("InspectButton", () => {
  test("should render with Search icon", () => {
    render(<InspectButton value={{ key: "value" }} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  test("should open dialog when clicked", () => {
    render(<InspectButton value={{ test: "data" }} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(screen.getByText("Cell details")).toBeInTheDocument();
  });

  test("should display JSON stringified value", () => {
    const testValue = { name: "John", age: 30 };
    render(<InspectButton value={testValue} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText(/"name": "John"/)).toBeInTheDocument();
    expect(screen.getByText(/"age": 30/)).toBeInTheDocument();
  });

  test("should close dialog when Close button is clicked", async () => {
    render(<InspectButton value={{ key: "value" }} />);
    const openButton = screen.getByRole("button");
    fireEvent.click(openButton);

    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Cell details")).not.toBeInTheDocument();
    });
  });

  test("should handle circular references by falling back to String()", () => {
    // Create an object with circular reference
    type Circular = { name: string; self?: unknown; [k: string]: unknown };
    const circularObj: Circular = { name: "test" };
    circularObj.self = circularObj;

    render(<InspectButton value={circularObj} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Lines 23-24: catch block should execute and call String(value)
    expect(screen.getByText("Cell details")).toBeInTheDocument();
    const preElement = screen.getByText(/object Object/i);
    expect(preElement).toBeInTheDocument();
  });

  test("should handle BigInt values that cannot be JSON stringified", () => {
    const bigIntValue = BigInt(9007199254740991);

    render(<InspectButton value={bigIntValue} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Lines 23-24: JSON.stringify throws on BigInt, so String(value) is used
    expect(screen.getByText("Cell details")).toBeInTheDocument();
    expect(screen.getByText("9007199254740991")).toBeInTheDocument();
  });

  test("should display primitive values correctly", () => {
    render(<InspectButton value="simple string" />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText('"simple string"')).toBeInTheDocument();
  });

  test("should display null value", () => {
    render(<InspectButton value={null} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("null")).toBeInTheDocument();
  });

  test("should display undefined value", () => {
    render(<InspectButton value={undefined} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    // JSON.stringify(undefined) returns undefined (not a string), which gets rendered as empty
    const preElement = screen.getByRole("dialog").querySelector("pre");
    expect(preElement).toBeInTheDocument();
  });

  test("should display arrays correctly", () => {
    const arrayValue = [1, 2, 3];
    render(<InspectButton value={arrayValue} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText(/1,/)).toBeInTheDocument();
    expect(screen.getByText(/2,/)).toBeInTheDocument();
  });
});
