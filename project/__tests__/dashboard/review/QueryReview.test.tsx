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
    expect(screen.getByText("Send Response")).toBeInTheDocument();
    expect(screen.getByText("Dismiss Query")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write your response to the tutor..."),
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

    const responseField = screen.getByPlaceholderText(
      "Write your response to the tutor...",
    );

    fireEvent.change(responseField, {
      target: { value: "Thank you for your query" },
    });

    expect(responseField).toHaveValue("Thank you for your query");
  });

  test("should call handleRespond when Send Response button is clicked with valid response", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    render(<QueryReview data={mockQueryRequest} />);

    const responseField = screen.getByPlaceholderText(
      "Write your response to the tutor...",
    );
    const sendButton = screen.getByText("Send Response");

    // Initially button should be disabled
    expect(sendButton).toBeDisabled();

    // Type a response (lines 34-37)
    fireEvent.change(responseField, {
      target: { value: "This is my response" },
    });

    // Button should now be enabled
    expect(sendButton).not.toBeDisabled();

    // Click the send button
    fireEvent.click(sendButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Submitting response:",
      "This is my response",
    );

    consoleSpy.mockRestore();
  });

  test("should not submit response when input is empty or whitespace", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    render(<QueryReview data={mockQueryRequest} />);

    const responseField = screen.getByPlaceholderText(
      "Write your response to the tutor...",
    );
    const sendButton = screen.getByText("Send Response");

    // Type only whitespace (line 34 - early return)
    fireEvent.change(responseField, { target: { value: "   " } });

    // Button should be disabled
    expect(sendButton).toBeDisabled();

    // Try clicking anyway (won't fire because disabled, but tests the condition)
    // The handleRespond function checks !response.trim() and returns early

    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test("should call handleDismiss when Dismiss Query button is clicked", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    render(<QueryReview data={mockQueryRequest} />);

    const dismissButton = screen.getByText("Dismiss Query");

    // Click the dismiss button (lines 40-42)
    fireEvent.click(dismissButton);

    expect(consoleSpy).toHaveBeenCalledWith("Query dismissed.");

    consoleSpy.mockRestore();
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
