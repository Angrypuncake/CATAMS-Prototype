import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import NewCommentBox from "../../../../app/dashboard/tutor/allocations/_components/NewCommentBox";

describe("NewCommentBox Component", () => {
  const mockOnChange = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render text field with placeholder", () => {
    render(
      <NewCommentBox
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByPlaceholderText("Write a comment…")).toBeInTheDocument();
  });

  test("should render comment button", () => {
    render(
      <NewCommentBox
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByText("Comment")).toBeInTheDocument();
  });

  test("should display current value in text field", () => {
    render(
      <NewCommentBox
        value="Test comment text"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const textField = screen.getByPlaceholderText(
      "Write a comment…",
    ) as HTMLTextAreaElement;
    expect(textField.value).toBe("Test comment text");
  });

  test("should call onChange when text field value changes", () => {
    render(
      <NewCommentBox
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const textField = screen.getByPlaceholderText("Write a comment…");
    fireEvent.change(textField, { target: { value: "New comment" } });

    expect(mockOnChange).toHaveBeenCalledWith("New comment");
  });

  test("should call onSubmit when comment button is clicked", () => {
    render(
      <NewCommentBox
        value="Some comment"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const button = screen.getByText("Comment");
    fireEvent.click(button);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  test("should render multiline text field", () => {
    render(
      <NewCommentBox
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const textField = screen.getByPlaceholderText("Write a comment…");
    expect(textField.tagName).toBe("TEXTAREA");
  });

  test("should handle empty value", () => {
    render(
      <NewCommentBox
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const textField = screen.getByPlaceholderText(
      "Write a comment…",
    ) as HTMLTextAreaElement;
    expect(textField.value).toBe("");
  });

  test("should call onChange multiple times for multiple edits", () => {
    render(
      <NewCommentBox
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const textField = screen.getByPlaceholderText("Write a comment…");

    fireEvent.change(textField, { target: { value: "First" } });
    fireEvent.change(textField, { target: { value: "First edit" } });
    fireEvent.change(textField, { target: { value: "First edit complete" } });

    expect(mockOnChange).toHaveBeenCalledTimes(3);
    expect(mockOnChange).toHaveBeenLastCalledWith("First edit complete");
  });
});
