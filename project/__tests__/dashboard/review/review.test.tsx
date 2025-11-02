import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import ReviewShell from "../../../app/dashboard/review/[id]/page";

const mockGetRequestById = jest.fn();
const mockGetRequestByRequestId = jest.fn();
const mockGetFormattedAllocationById = jest.fn();
const mockGetTutorsByUnit = jest.fn();
const mockGetTutorById = jest.fn();
const mockGetAllocationById = jest.fn();

jest.mock("../../../app/services/requestService", () => ({
  getRequestById: (...args: unknown[]) => mockGetRequestById(...args),
  getRequestByRequestId: (...args: unknown[]) =>
    mockGetRequestByRequestId(...args),
}));

jest.mock("../../../app/services/allocationService", () => ({
  getFormattedAllocationById: (...args: unknown[]) =>
    mockGetFormattedAllocationById(...args),
  getAllocationById: (...args: unknown[]) => mockGetAllocationById(...args),
}));

jest.mock("../../../app/services/userService", () => ({
  getTutorsByUnit: (...args: unknown[]) => mockGetTutorsByUnit(...args),
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

describe("ReviewPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const requestData = {
      requestId: 123,
      requesterId: 10,
      reviewerId: 5,
      requestDate: "2025-03-15",
      allocationId: 1,
      requestStatus: "pending",
      requestReason: "Test reason",
      createdAt: "2025-03-15T10:00:00",
      updatedAt: "2025-03-15T10:00:00",
      requestType: "claim",
      details: {
        hours: 2,
        paycode: "CASUAL",
      },
    };
    mockGetRequestById.mockResolvedValue(requestData);
    mockGetRequestByRequestId.mockResolvedValue(requestData);
    mockGetFormattedAllocationById.mockResolvedValue(mockAllocation);
    mockGetTutorsByUnit.mockResolvedValue([]);
    mockGetTutorById.mockResolvedValue(mockTutor);
    mockGetAllocationById.mockResolvedValue(mockAllocation);
  });

  test("should render review page component with loading state", async () => {
    render(
      <ReviewShell
        role="UC"
        currentUserId={5}
        requestId="123"
        readOnly={false}
      />,
    );

    // Verify component mounts and shows loading state
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    // Wait for the correct mock to be called
    await waitFor(
      () => {
        expect(mockGetRequestByRequestId).toHaveBeenCalledWith("123");
      },
      { timeout: 3000 },
    );

    // Wait for loading to complete
    await waitFor(
      () => {
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Verify claim review content appears
    expect(screen.getByText("Claim Request Review")).toBeInTheDocument();
  });
});
