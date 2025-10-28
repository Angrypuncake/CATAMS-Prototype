import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import QueryReview from "../../../app/dashboard/review/[id]/_components/QueryReview";
import type { TutorRequest } from "../../../app/_types/request";

const mockGetTutorById = jest.fn();

jest.mock("../../../app/services/userService", () => ({
  getTutorById: (...args: unknown[]) => mockGetTutorById(...args),
}));

const mockTutor = {
  user_id: 10,
  first_name: "John",
  last_name: "Doe",
  email: "john@test.com",
};

describe("QueryReview Component", () => {
  const mockQueryRequest: TutorRequest = {
    requestId: 3,
    requesterId: 10,
    reviewerId: 5,
    requestDate: "2025-03-15",
    allocationId: 1,
    requestStatus: "pending",
    requestReason: "Question about allocation schedule",
    createdAt: "2025-03-15T10:00:00",
    updatedAt: "2025-03-15T10:00:00",
    requestType: "query",
    details: null,
  };

  beforeEach(() => {
    mockGetTutorById.mockResolvedValue(mockTutor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render query review with reason and response controls", async () => {
    render(<QueryReview data={mockQueryRequest} />);

    expect(screen.getByText("Query Request Review")).toBeInTheDocument();
    expect(
      screen.getByText("Question about allocation schedule"),
    ).toBeInTheDocument();
    expect(screen.getByText("Close / Reject")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Reviewer response"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetTutorById).toHaveBeenCalled();
    });
  });

  test("should display tutor details when loaded", async () => {
    render(<QueryReview data={mockQueryRequest} />);

    // Wait for tutor data to load (lines 68-79)
    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    expect(screen.getByText(/john@test.com/)).toBeInTheDocument();
    expect(screen.getByText("Tutor Details")).toBeInTheDocument();

    // Check that user_id 10 is displayed
    const allText = screen.getAllByText(/10/);
    expect(allText.length).toBeGreaterThan(0);
  });

  test("should show loading state before tutor data loads", () => {
    mockGetTutorById.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<QueryReview data={mockQueryRequest} />);

    expect(screen.getByText("Loading tutor info...")).toBeInTheDocument();
  });

  test("should handle response input change", async () => {
    render(<QueryReview data={mockQueryRequest} />);

    const responseField = screen.getByPlaceholderText("Reviewer response");

    fireEvent.change(responseField, {
      target: { value: "Thank you for your query" },
    });

    expect(responseField).toHaveValue("Thank you for your query");
  });

  test("should render reviewer note field", async () => {
    render(<QueryReview data={mockQueryRequest} />);

    const reviewerNoteField = screen.getByPlaceholderText(
      "Reviewer note (not shown to tutor)",
    );

    expect(reviewerNoteField).toBeInTheDocument();

    fireEvent.change(reviewerNoteField, {
      target: { value: "Internal note for review" },
    });

    expect(reviewerNoteField).toHaveValue("Internal note for review");
  });

  test("should render Close / Reject button for UC role", async () => {
    render(<QueryReview data={mockQueryRequest} role="UC" />);

    const rejectButton = screen.getByText("Close / Reject");
    expect(rejectButton).toBeInTheDocument();
  });

  test("should render TA action buttons for TA role", async () => {
    render(<QueryReview data={mockQueryRequest} role="TA" />);

    expect(screen.getByText("Reject")).toBeInTheDocument();
    expect(screen.getByText("Forward to UC")).toBeInTheDocument();
  });

  test("should display 'No query message provided' when requestReason is empty", async () => {
    const requestWithoutReason: TutorRequest = {
      ...mockQueryRequest,
      requestReason: "",
    };

    render(<QueryReview data={requestWithoutReason} />);

    expect(screen.getByText("No query message provided.")).toBeInTheDocument();
  });

  test("should handle API error when fetching tutor", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    mockGetTutorById.mockRejectedValue(new Error("Failed to fetch tutor"));

    render(<QueryReview data={mockQueryRequest} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch tutor:",
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });
});
