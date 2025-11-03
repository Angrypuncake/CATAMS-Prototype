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
  hours: 3,
  paycode_id: "FULL_TIME",
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

  test("should handle API errors gracefully", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    mockGetAllocationById.mockRejectedValue(new Error("Failed to fetch allocation"));
    mockGetTutorById.mockRejectedValue(new Error("Failed to fetch tutor"));

    render(<ClaimReview data={mockClaimRequest} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch allocation details:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test("should not highlight paycode when it matches allocation paycode", async () => {
    const allocationWithMatchingPaycode = {
      ...mockAllocation,
      paycode_id: "CASUAL",
      hours: 2,
    };

    // Reset the mock completely for this test
    mockGetAllocationById.mockReset();
    mockGetAllocationById.mockResolvedValue(allocationWithMatchingPaycode);

    const { container } = render(<ClaimReview data={mockClaimRequest} />);

    // Wait for allocation data to load
    await waitFor(() => {
      expect(mockGetAllocationById).toHaveBeenCalledWith("1");
    });

    await waitFor(() => {
      expect(screen.getByText("CASUAL")).toBeInTheDocument();
    });

    // Find the paycode span element
    const spans = container.querySelectorAll("span");
    const paycodeSpan = Array.from(spans).find((span) => span.textContent === "CASUAL");

    // When paycode matches, style should have color: "inherit" (not red)
    expect(paycodeSpan).toBeDefined();
    if (paycodeSpan) {
      const styleAttr = paycodeSpan.getAttribute("style");
      // Should contain "color: inherit" or not have color set to red
      expect(styleAttr).toContain("color: inherit");
      expect(styleAttr).not.toContain("#d32f2f");
    }
  });

  test("should display dash when allocation has no paycode_id", async () => {
    const allocationWithoutPaycode = {
      ...mockAllocation,
      paycode_id: null,
    };

    mockGetAllocationById.mockReset();
    mockGetAllocationById.mockResolvedValue(allocationWithoutPaycode);

    render(<ClaimReview data={mockClaimRequest} />);

    // Wait for allocation data to load
    await waitFor(() => {
      expect(mockGetAllocationById).toHaveBeenCalledWith("1");
    });

    // Should display dash for null paycode_id (line 118)
    await waitFor(() => {
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  test("should display 'No reason provided' when requestReason is empty", async () => {
    const requestWithoutReason: TutorRequest = {
      ...mockClaimRequest,
      requestReason: "",
    };

    render(<ClaimReview data={requestWithoutReason} />);

    // Should display fallback text when no reason (line 194)
    await waitFor(() => {
      expect(screen.getByText("No reason provided.")).toBeInTheDocument();
    });
  });

  test("should display 'No reason provided' when requestReason is null", async () => {
    const requestWithNullReason = {
      ...mockClaimRequest,
      requestReason: null,
    } as unknown as TutorRequest;

    render(<ClaimReview data={requestWithNullReason} />);

    // Should display fallback text when reason is null (line 194)
    await waitFor(() => {
      expect(screen.getByText("No reason provided.")).toBeInTheDocument();
    });
  });
});
