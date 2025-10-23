import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import CancelReview from "../../../app/dashboard/review/[id]/_components/CancelReview";
import type { TutorRequest } from "../../../app/_types/request";

const mockGetTutorById = jest.fn();
const mockGetAllocationById = jest.fn();
const mockGetTutorsByUnit = jest.fn();

jest.mock("../../../app/services/userService", () => ({
  getTutorById: (...args: unknown[]) => mockGetTutorById(...args),
  getTutorsByUnit: (...args: unknown[]) => mockGetTutorsByUnit(...args),
}));

jest.mock("../../../app/services/allocationService", () => ({
  getAllocationById: (...args: unknown[]) => mockGetAllocationById(...args),
}));

const mockAllocation = {
  id: 1,
  user_id: 10,
  first_name: "John",
  last_name: "Doe",
  email: "john@test.com",
  unit_code: "INFO1110",
  unit_name: "Introduction to Programming",
  start_at: "2025-03-15T10:00:00",
  end_at: "2025-03-15T12:00:00",
  activity_type: "Tutorial",
  activity_name: "Week 5",
  session_date: "2025-03-15",
  status: "Confirmed",
  location: "Room 101",
  note: null,
};

const mockTutor = {
  userId: 10,
  firstName: "John",
  lastName: "Doe",
  email: "john@test.com",
  role: "tutor",
};

describe("CancelReview Component", () => {
  const mockCancelRequest: TutorRequest = {
    requestId: 4,
    requesterId: 10,
    reviewerId: 5,
    requestDate: "2025-03-15",
    allocationId: 1,
    requestStatus: "pending",
    requestReason: "Unable to attend session",
    createdAt: "2025-03-15T10:00:00",
    updatedAt: "2025-03-15T10:00:00",
    requestType: "cancellation",
    details: null,
  };

  beforeEach(() => {
    mockGetTutorById.mockResolvedValue(mockTutor);
    mockGetAllocationById.mockResolvedValue(mockAllocation);
    mockGetTutorsByUnit.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render cancellation reason after loading", async () => {
    render(<CancelReview data={mockCancelRequest} />);

    await waitFor(() => {
      expect(screen.getByText("Unable to attend session")).toBeInTheDocument();
    });
  });
});
