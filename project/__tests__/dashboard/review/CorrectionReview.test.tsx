import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CorrectionReview from "../../../app/dashboard/review/[id]/_components/CorrectionReview";
import type { TutorRequest } from "../../../app/_types/request";

// Mock the service functions
const mockGetTutorById = jest.fn();
const mockGetAllocationById = jest.fn();
const mockUcApproveRequest = jest.fn();
const mockUcRejectRequest = jest.fn();
const mockTaForwardToUC = jest.fn();
const mockTaRejectRequest = jest.fn();

jest.mock("../../../app/services/userService", () => ({
  getTutorById: (...args: unknown[]) => mockGetTutorById(...args),
}));

jest.mock("../../../app/services/allocationService", () => ({
  getAllocationById: (...args: unknown[]) => mockGetAllocationById(...args),
}));

jest.mock("../../../app/services/requestService", () => ({
  ucApproveRequest: (...args: unknown[]) => mockUcApproveRequest(...args),
  ucRejectRequest: (...args: unknown[]) => mockUcRejectRequest(...args),
  taForwardToUC: (...args: unknown[]) => mockTaForwardToUC(...args),
  taRejectRequest: (...args: unknown[]) => mockTaRejectRequest(...args),
}));

const mockTutor = {
  user_id: 10,
  first_name: "John",
  last_name: "Doe",
  email: "john@test.com",
};

const mockAllocation = {
  allocation_id: 1,
  user_id: 10,
  unit_code: "INFO1110",
  unit_name: "Introduction to Programming",
  activity_name: "Week 5 Tutorial",
  session_date: "2025-03-20",
  start_at: "14:00",
  end_at: "16:00",
  hours: 2,
  location: "Room 101",
};

describe("CorrectionReview Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTutorById.mockResolvedValue(mockTutor);
    mockGetAllocationById.mockResolvedValue(mockAllocation);
  });
  const mockCorrectionRequest: TutorRequest = {
    requestId: 2,
    requesterId: 10,
    reviewerId: 5,
    requestDate: "2025-03-15",
    allocationId: 1,
    requestStatus: "pending",
    requestReason: "Wrong session details",
    createdAt: "2025-03-15T10:00:00",
    updatedAt: "2025-03-15T10:00:00",
    requestType: "correction",
    details: {
      date: "2025-03-20",
      start_at: "14:00",
      end_at: "16:00",
      location: "Room 202",
      hours: "2",
      session_type: "Lab",
    },
  };

  test("should render correction review with all details", () => {
    render(<CorrectionReview data={mockCorrectionRequest} />);

    expect(screen.getByText("Correction Request Review")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("2025-03-20")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("14:00 - 16:00")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Room 202")).toBeInTheDocument();
    expect(screen.getByText("Hours")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Session Type")).toBeInTheDocument();
    expect(screen.getByText("Lab")).toBeInTheDocument();
  });

  test("should return null for non-correction request type", () => {
    const wrongTypeRequest: TutorRequest = {
      requestId: 2,
      requesterId: 10,
      reviewerId: 5,
      requestDate: "2025-03-15",
      allocationId: 1,
      requestStatus: "pending",
      requestReason: "Wrong session details",
      createdAt: "2025-03-15T10:00:00",
      updatedAt: "2025-03-15T10:00:00",
      requestType: "claim",
      details: {
        hours: 2,
        paycode: "CASUAL",
      },
    };

    const { container } = render(<CorrectionReview data={wrongTypeRequest} />);

    expect(container.firstChild).toBeNull();
  });

  test("should render nothing when data is null", () => {
    const { container } = render(
      <CorrectionReview data={null as unknown as TutorRequest} />,
    );

    expect(container.firstChild).toBeNull();
  });

  test("should render nothing when data is undefined", () => {
    const { container } = render(
      <CorrectionReview data={undefined as unknown as TutorRequest} />,
    );

    expect(container.firstChild).toBeNull();
  });

  test("should display approved status with success color", async () => {
    const approvedRequest: TutorRequest = {
      ...mockCorrectionRequest,
      requestStatus: "approved" as const,
    };

    render(<CorrectionReview data={approvedRequest} />);

    await waitFor(() => {
      expect(screen.getByText("APPROVED")).toBeInTheDocument();
    });
  });

  test("should display rejected status with error color", async () => {
    const rejectedRequest: TutorRequest = {
      ...mockCorrectionRequest,
      requestStatus: "rejected" as const,
    };

    render(<CorrectionReview data={rejectedRequest} />);

    await waitFor(() => {
      expect(screen.getByText("REJECTED")).toBeInTheDocument();
    });
  });

  test("should handle error when fetching tutor and allocation data", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGetTutorById.mockRejectedValue(new Error("Failed to fetch tutor"));
    mockGetAllocationById.mockRejectedValue(
      new Error("Failed to fetch allocation"),
    );

    render(<CorrectionReview data={mockCorrectionRequest} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ Failed to load correction review:",
        expect.any(Error),
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test("should call handleApprove when Approve button is clicked", async () => {
    mockUcApproveRequest.mockResolvedValue({});

    render(<CorrectionReview data={mockCorrectionRequest} currentUserId={5} />);

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    const approveButton = screen.getByText("Approve Correction");
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(mockUcApproveRequest).toHaveBeenCalledWith(2, 5, "");
    });
  });

  test("should call handleReject when Reject button is clicked", async () => {
    mockUcRejectRequest.mockResolvedValue({});

    render(<CorrectionReview data={mockCorrectionRequest} currentUserId={5} />);

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    const rejectButton = screen.getByText("Reject");
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(mockUcRejectRequest).toHaveBeenCalledWith(2, 5, undefined, "");
    });
  });

  test("should update comment state when typing in comment field", async () => {
    mockUcApproveRequest.mockResolvedValue({});

    render(<CorrectionReview data={mockCorrectionRequest} currentUserId={5} />);

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    const commentField = screen.getByPlaceholderText("Add notes or remarks...");
    fireEvent.change(commentField, {
      target: { value: "Looks good to approve" },
    });

    expect(commentField).toHaveValue("Looks good to approve");

    const approveButton = screen.getByText("Approve Correction");
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(mockUcApproveRequest).toHaveBeenCalledWith(
        2,
        5,
        "Looks good to approve",
      );
    });
  });

  test("should show loading state initially", () => {
    render(<CorrectionReview data={mockCorrectionRequest} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("should display tutor details after loading", async () => {
    render(<CorrectionReview data={mockCorrectionRequest} />);

    await waitFor(() => {
      expect(screen.getByText("Initiator Details")).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/john@test.com/)).toBeInTheDocument();
    });
  });

  test("should display original allocation details after loading", async () => {
    render(<CorrectionReview data={mockCorrectionRequest} />);

    await waitFor(() => {
      expect(screen.getByText("Original Allocation")).toBeInTheDocument();
      expect(screen.getByText(/INFO1110/)).toBeInTheDocument();
      expect(
        screen.getByText(/Introduction to Programming/),
      ).toBeInTheDocument();
    });
  });

  test("should disable buttons while loading", () => {
    // Set loading state by making the promise never resolve
    mockGetTutorById.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(<CorrectionReview data={mockCorrectionRequest} />);

    // Should show loading indicator
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("should render correction details without optional fields", () => {
    const minimalRequest = {
      ...mockCorrectionRequest,
      details: {
        date: "2025-03-20",
        hours: "2",
      },
    };

    render(<CorrectionReview data={minimalRequest} />);

    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("2025-03-20")).toBeInTheDocument();
    expect(screen.getByText("Hours")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // Optional fields should not be present
    expect(screen.queryByText("Time")).not.toBeInTheDocument();
    expect(screen.queryByText("Location")).not.toBeInTheDocument();
    expect(screen.queryByText("Session Type")).not.toBeInTheDocument();
  });
});
