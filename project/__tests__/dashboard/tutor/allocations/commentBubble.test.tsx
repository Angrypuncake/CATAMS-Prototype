import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import CommentBubble from "../../../../app/dashboard/tutor/allocations/_components/CommentBubble";
import type { CommentItem } from "../../../../app/_types/allocations";

describe("CommentBubble Component", () => {
  const mockComment: CommentItem = {
    author: "John Doe",
    role: "Tutor",
    time: "2 hours ago",
    body: "This is a test comment",
    mine: false,
  };

  test("should render comment with author, role, and time", () => {
    render(<CommentBubble comment={mockComment} />);

    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/– Tutor/)).toBeInTheDocument();
    expect(screen.getByText(/2 hours ago/)).toBeInTheDocument();
  });

  test("should render comment body", () => {
    render(<CommentBubble comment={mockComment} />);

    expect(screen.getByText("This is a test comment")).toBeInTheDocument();
  });

  test("should render author without role when role is null", () => {
    const commentWithoutRole: CommentItem = {
      ...mockComment,
      role: null,
    };

    render(<CommentBubble comment={commentWithoutRole} />);

    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.queryByText(/– Tutor/)).not.toBeInTheDocument();
  });

  test("should not show edit and delete buttons when mine is false", () => {
    render(<CommentBubble comment={mockComment} />);

    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  test("should show edit and delete buttons when mine is true", () => {
    const myComment: CommentItem = {
      ...mockComment,
      mine: true,
    };

    render(<CommentBubble comment={myComment} />);

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  test("should render edit button with edit icon", () => {
    const myComment: CommentItem = {
      ...mockComment,
      mine: true,
    };

    render(<CommentBubble comment={myComment} />);

    const editButton = screen.getByText("Edit").closest("button");
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("MuiButton-outlined");
  });

  test("should render delete button with error color", () => {
    const myComment: CommentItem = {
      ...mockComment,
      mine: true,
    };

    render(<CommentBubble comment={myComment} />);

    const deleteButton = screen.getByText("Delete").closest("button");
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("MuiButton-colorError");
  });

  test("should handle empty role string", () => {
    const commentEmptyRole: CommentItem = {
      ...mockComment,
      role: "",
    };

    render(<CommentBubble comment={commentEmptyRole} />);

    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.queryByText(/– /)).not.toBeInTheDocument();
  });
});
