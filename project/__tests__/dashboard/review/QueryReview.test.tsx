import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import QueryReview from "../../../app/dashboard/review/[id]/_components/QueryReview";
import type { TutorRequest } from "../../../app/_types/request";

const mockGetTutorById = jest.fn();

jest.mock("../../../app/services/userService", () => ({
  getTutorById: (...args: unknown[]) => mockGetTutorById(...args),
}));

const mockTutor = {
  userId: 10,
  firstName: "John",
  lastName: "Doe",
  email: "john@test.com",
  role: "tutor",
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
});
