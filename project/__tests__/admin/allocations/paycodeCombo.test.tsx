import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaycodeCombo } from "../../../app/admin/allocations/components/PaycodeCombo";
import { PaycodeOption } from "../../../app/admin/allocations/types";

describe("PaycodeCombo Component", () => {
  const mockOptions: PaycodeOption[] = [
    { code: "CASUAL", paycode_description: "Casual hourly rate", amount: 50 },
    { code: "MARKING", paycode_description: "Marking rate", amount: 45 },
    { code: "TUTORING", paycode_description: "Tutorial rate", amount: 55 },
  ];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render with placeholder text when no value selected", () => {
    render(
      <PaycodeCombo
        options={mockOptions}
        valueCode={null}
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByText("Select paycode…")).toBeInTheDocument();
  });

  test("should display selected paycode", () => {
    render(
      <PaycodeCombo
        options={mockOptions}
        valueCode="CASUAL"
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByText("CASUAL — Casual hourly rate")).toBeInTheDocument();
  });

  test("should open dropdown when button is clicked", () => {
    render(
      <PaycodeCombo
        options={mockOptions}
        valueCode={null}
        onChange={mockOnChange}
      />,
    );

    const button = screen.getByText("Select paycode…");
    fireEvent.click(button);

    expect(
      screen.getByPlaceholderText("Search code or description…"),
    ).toBeInTheDocument();
    expect(screen.getByText("CASUAL")).toBeInTheDocument();
    expect(screen.getByText("MARKING")).toBeInTheDocument();
    expect(screen.getByText("TUTORING")).toBeInTheDocument();
  });

  test("should filter options based on search query", () => {
    render(
      <PaycodeCombo
        options={mockOptions}
        valueCode={null}
        onChange={mockOnChange}
      />,
    );

    const button = screen.getByText("Select paycode…");
    fireEvent.click(button);

    const searchInput = screen.getByPlaceholderText(
      "Search code or description…",
    );
    fireEvent.change(searchInput, { target: { value: "mark" } });

    expect(screen.getByText("MARKING")).toBeInTheDocument();
    expect(screen.queryByText("CASUAL")).not.toBeInTheDocument();
    expect(screen.queryByText("TUTORING")).not.toBeInTheDocument();
  });

  test("should call onChange when option is selected", () => {
    render(
      <PaycodeCombo
        options={mockOptions}
        valueCode={null}
        onChange={mockOnChange}
      />,
    );

    const button = screen.getByText("Select paycode…");
    fireEvent.click(button);

    const casualOption = screen.getByText("CASUAL");
    fireEvent.click(casualOption);

    expect(mockOnChange).toHaveBeenCalledWith(mockOptions[0]);
  });

  test("should close dropdown after selection", () => {
    render(
      <PaycodeCombo
        options={mockOptions}
        valueCode={null}
        onChange={mockOnChange}
      />,
    );

    const button = screen.getByText("Select paycode…");
    fireEvent.click(button);

    expect(
      screen.getByPlaceholderText("Search code or description…"),
    ).toBeInTheDocument();

    const casualOption = screen.getByText("CASUAL");
    fireEvent.click(casualOption);

    expect(
      screen.queryByPlaceholderText("Search code or description…"),
    ).not.toBeInTheDocument();
  });

  test("should handle paycode with null description", () => {
    const optionsWithNull: PaycodeOption[] = [
      { code: "NULL_DESC", paycode_description: null, amount: 60 },
      { code: "CASUAL", paycode_description: "Casual rate", amount: 50 },
    ];

    render(
      <PaycodeCombo
        options={optionsWithNull}
        valueCode="NULL_DESC"
        onChange={mockOnChange}
      />,
    );

    // Should display just the code without description (line 48)
    expect(screen.getByText("NULL_DESC")).toBeInTheDocument();
  });

  test("should filter by null description using fallback empty string", () => {
    const optionsWithNull: PaycodeOption[] = [
      { code: "NULL_DESC", paycode_description: null, amount: 60 },
      { code: "CASUAL", paycode_description: "Casual rate", amount: 50 },
    ];

    render(
      <PaycodeCombo
        options={optionsWithNull}
        valueCode={null}
        onChange={mockOnChange}
      />,
    );

    const button = screen.getByText("Select paycode…");
    fireEvent.click(button);

    // Search for something that won't match null description (line 32)
    const searchInput = screen.getByPlaceholderText(
      "Search code or description…",
    );
    fireEvent.change(searchInput, { target: { value: "casual" } });

    // Should only show CASUAL, not NULL_DESC
    expect(screen.getByText("CASUAL")).toBeInTheDocument();
    expect(screen.queryByText("NULL_DESC")).not.toBeInTheDocument();
  });

  test("should display amount with dollar sign in dropdown", () => {
    render(
      <PaycodeCombo
        options={mockOptions}
        valueCode={null}
        onChange={mockOnChange}
      />,
    );

    const button = screen.getByText("Select paycode…");
    fireEvent.click(button);

    // Check that amount is displayed with dollar sign (lines 74-77)
    expect(screen.getByText(/Casual hourly rate.*\$50/)).toBeInTheDocument();
    expect(screen.getByText(/Marking rate.*\$45/)).toBeInTheDocument();
  });

  test("should handle paycode with only amount and no description", () => {
    const optionsWithAmountOnly: PaycodeOption[] = [
      { code: "AMOUNT_ONLY", paycode_description: null, amount: 65 },
    ];

    render(
      <PaycodeCombo
        options={optionsWithAmountOnly}
        valueCode={null}
        onChange={mockOnChange}
      />,
    );

    const button = screen.getByText("Select paycode…");
    fireEvent.click(button);

    // Should show amount even without description (lines 74-77)
    expect(screen.getByText("AMOUNT_ONLY")).toBeInTheDocument();
    expect(screen.getByText(/\$65/)).toBeInTheDocument();
  });

  test("should handle paycode with description but no amount", () => {
    const optionsWithDescOnly: PaycodeOption[] = [
      { code: "DESC_ONLY", paycode_description: "Description only", amount: 0 },
    ];

    render(
      <PaycodeCombo
        options={optionsWithDescOnly}
        valueCode={null}
        onChange={mockOnChange}
      />,
    );

    const button = screen.getByText("Select paycode…");
    fireEvent.click(button);

    // Should show description but not amount when amount is 0/falsy (lines 74-77)
    expect(screen.getByText("DESC_ONLY")).toBeInTheDocument();
    expect(screen.getByText("Description only")).toBeInTheDocument();
  });
});
