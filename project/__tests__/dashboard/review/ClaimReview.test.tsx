import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import ClaimReview from "../../../app/dashboard/review/[id]/_components/ClaimReview";
import type { TutorRequest } from "../../../app/_types/request";

const mockGetAllocationById = jest.fn();
const mockGetTutorById = jest.fn();

jest.mock("../../../app/services/allocationService", () => ({
  getAllocationById: (...args: unknown[]) => mockGetAllocationById(...args),
}));

jest.mock("../../../app/services/userService", () => ({
  getTutorById: (...args: unknown[]) => mockGetTutorById(...args),
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

describe("ClaimReview Component", () => {
  const mockClaimRequest: TutorRequest = {
    requestId: 1,
    requesterId: 10,
    reviewerId: 5,
    requestDate: "2025-03-15",
    allocationId: 1,
    requestStatus: "pending",
    requestReason: "Need to claim hours for extra work",
    createdAt: "2025-03-15T10:00:00",
    updatedAt: "2025-03-15T10:00:00",
    requestType: "claim",
    details: {
      hours: 2,
      paycode: "CASUAL",
    },
  };

  beforeEach(() => {
    mockGetAllocationById.mockResolvedValue(mockAllocation);
    mockGetTutorById.mockResolvedValue(mockTutor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render claim review with all details and action buttons", async () => {
    render(<ClaimReview data={mockClaimRequest} />);

    expect(screen.getByText("Claim Request Review")).toBeInTheDocument();
    expect(screen.getByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("CASUAL")).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Paycode/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Hours/i).length).toBeGreaterThan(0);
  });
});
