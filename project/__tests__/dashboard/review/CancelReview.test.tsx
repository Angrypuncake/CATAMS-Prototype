import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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
  start_at: "10:00:00",
  end_at: "12:00:00",
  activity_type: "Tutorial",
  activity_name: "Week 5",
  session_date: "2025-03-15",
  status: "Confirmed",
  location: "Room 101",
  note: null,
  hours: 2,
};

const mockTutor = {
  user_id: 10,
  first_name: "John",
  last_name: "Doe",
  email: "john@test.com",
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

  test("should display allocation details when loaded", async () => {
    render(<CancelReview data={mockCancelRequest} />);

    // Wait for allocation details to load (lines 150-170)
    await waitFor(() => {
      expect(screen.getByText(/INFO1110/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Introduction to Programming/)).toBeInTheDocument();
    expect(screen.getByText(/Week 5/)).toBeInTheDocument();
    expect(screen.getByText(/Room 101/)).toBeInTheDocument();
    // Check for the time display in the allocation section
    const timeParagraphs = screen.getAllByText(/10:00:00/);
    expect(timeParagraphs.length).toBeGreaterThan(0);
  });

  test("should display tutor details when loaded", async () => {
    render(<CancelReview data={mockCancelRequest} />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    expect(screen.getByText(/john@test.com/)).toBeInTheDocument();
  });

  test("should display available tutors for replacement", async () => {
    const availableTutors = [
      {
        user_id: 20,
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@test.com",
      },
      {
        user_id: 30,
        first_name: "Bob",
        last_name: "Wilson",
        email: "bob@test.com",
      },
    ];

    mockGetTutorsByUnit.mockResolvedValue(availableTutors);

    render(<CancelReview data={mockCancelRequest} />);

    // Wait for tutors to load (lines 222-223)
    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
    expect(screen.getByText("jane@test.com")).toBeInTheDocument();
    expect(screen.getByText("bob@test.com")).toBeInTheDocument();
  });

  test("should allow selecting a replacement tutor", async () => {
    const availableTutors = [
      {
        user_id: 20,
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@test.com",
      },
    ];

    mockGetTutorsByUnit.mockResolvedValue(availableTutors);

    render(<CancelReview data={mockCancelRequest} />);

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Find and click the select button
    const selectButtons = screen.getAllByText("Select");
    fireEvent.click(selectButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Selected")).toBeInTheDocument();
    });
  });

  test("should handle comment input", async () => {
    render(<CancelReview data={mockCancelRequest} />);

    await waitFor(() => {
      expect(screen.getByText("Unable to attend session")).toBeInTheDocument();
    });

    const commentField = screen.getByPlaceholderText(/Add notes or remarks/);
    fireEvent.change(commentField, {
      target: { value: "Approved with replacement" },
    });

    expect(commentField).toHaveValue("Approved with replacement");
  });

  test("should handle approve button click", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    render(<CancelReview data={mockCancelRequest} />);

    await waitFor(() => {
      expect(screen.getByText("Unable to attend session")).toBeInTheDocument();
    });

    const approveButton = screen.getByText("Approve Cancellation");
    fireEvent.click(approveButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Approve cancellation:",
      expect.objectContaining({
        requestId: 4,
        comment: "",
      }),
    );

    consoleSpy.mockRestore();
  });

  test("should handle reject button click", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    render(<CancelReview data={mockCancelRequest} />);

    await waitFor(() => {
      expect(screen.getByText("Unable to attend session")).toBeInTheDocument();
    });

    const rejectButton = screen.getByText("Reject");
    fireEvent.click(rejectButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Reject cancellation:",
      expect.objectContaining({
        requestId: 4,
        comment: "",
      }),
    );

    consoleSpy.mockRestore();
  });

  test("should return null for non-cancellation request types", () => {
    const swapRequest: TutorRequest = {
      ...mockCancelRequest,
      requestType: "swap",
      details: {
        suggested_tutor_id: null,
      },
    };

    const { container } = render(<CancelReview data={swapRequest} />);

    expect(container.firstChild).toBeNull();
  });

  test("should handle allocation without unit_code", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    mockGetAllocationById.mockResolvedValue({
      ...mockAllocation,
      unit_code: null,
    });

    render(<CancelReview data={mockCancelRequest} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Allocation has no unit_code — skipping tutor fetch.",
      );
    });

    expect(mockGetTutorsByUnit).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test("should handle API errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    mockGetTutorById.mockRejectedValue(new Error("Failed to fetch tutor"));
    mockGetAllocationById.mockRejectedValue(
      new Error("Failed to fetch allocation"),
    );

    render(<CancelReview data={mockCancelRequest} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load cancellation details:",
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });

  test("should show loading state initially", () => {
    render(<CancelReview data={mockCancelRequest} />);

    expect(screen.getByText("Loading tutor details...")).toBeInTheDocument();
    expect(
      screen.getByText("Loading allocation details..."),
    ).toBeInTheDocument();
  });

  test("should display chip with correct status color", async () => {
    const approvedRequest = {
      ...mockCancelRequest,
      requestStatus: "approved" as const,
    };

    const { rerender } = render(<CancelReview data={approvedRequest} />);

    await waitFor(() => {
      expect(screen.getByText("APPROVED")).toBeInTheDocument();
    });

    const rejectedRequest = {
      ...mockCancelRequest,
      requestStatus: "rejected" as const,
    };

    rerender(<CancelReview data={rejectedRequest} />);

    await waitFor(() => {
      expect(screen.getByText("REJECTED")).toBeInTheDocument();
    });
  });
});
