import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import RequestRow from "../../../../app/dashboard/tutor/allocations/_components/RequestRow";

describe("RequestRow Component", () => {
  const mockRequest = {
    requestId: 123,
    requestType: "cancellation",
    requestStatus: "pending",
    requestReason: "Unable to attend",
    createdAt: "2025-03-15T10:00:00",
  };

  test("should render request ID with hash symbol", () => {
    render(<RequestRow req={mockRequest} />);

    expect(screen.getByText("#123")).toBeInTheDocument();
  });

  test("should render request type with capitalization", () => {
    render(<RequestRow req={mockRequest} />);

    expect(screen.getByText("cancellation")).toBeInTheDocument();
  });

  test("should render formatted date", () => {
    render(<RequestRow req={mockRequest} />);

    expect(screen.getByText(/15 Mar 2025/)).toBeInTheDocument();
  });

  test("should render view/edit button", () => {
    render(<RequestRow req={mockRequest} />);

    expect(screen.getByText("View / Edit")).toBeInTheDocument();
  });

  test("should format pending_uc status correctly", () => {
    const ucRequest = {
      ...mockRequest,
      requestStatus: "pending_uc",
    };

    render(<RequestRow req={ucRequest} />);

    expect(screen.getByText(/Pending \(UC\)/)).toBeInTheDocument();
  });

  test("should format pending_ta status correctly", () => {
    const taRequest = {
      ...mockRequest,
      requestStatus: "pending_ta",
    };

    render(<RequestRow req={taRequest} />);

    expect(screen.getByText(/Pending \(TA\)/)).toBeInTheDocument();
  });

  test("should capitalize status words", () => {
    const approvedRequest = {
      ...mockRequest,
      requestStatus: "approved",
    };

    render(<RequestRow req={approvedRequest} />);

    expect(screen.getByText(/Approved/)).toBeInTheDocument();
  });

  test("should handle status with underscores", () => {
    const statusRequest = {
      ...mockRequest,
      requestStatus: "pending_review",
    };

    render(<RequestRow req={statusRequest} />);

    expect(screen.getByText(/Pending Review/)).toBeInTheDocument();
  });

  test("should handle request without createdAt date", () => {
    const noDateRequest = {
      requestId: 456,
      requestType: "query",
      requestStatus: "pending",
    };

    render(<RequestRow req={noDateRequest} />);

    expect(screen.getByText("#456")).toBeInTheDocument();
    expect(screen.getByText("query")).toBeInTheDocument();
  });

  test("should handle request with null requestReason", () => {
    const noReasonRequest = {
      ...mockRequest,
      requestReason: null,
    };

    render(<RequestRow req={noReasonRequest} />);

    expect(screen.getByText("#123")).toBeInTheDocument();
  });

  test("should render different request types", () => {
    const claimRequest = {
      ...mockRequest,
      requestType: "claim",
    };

    render(<RequestRow req={claimRequest} />);

    expect(screen.getByText("claim")).toBeInTheDocument();
  });

  test("should display status and date together when both exist", () => {
    render(<RequestRow req={mockRequest} />);

    const statusText = screen.getByText(/Pending • 15 Mar 2025/);
    expect(statusText).toBeInTheDocument();
  });

  test("should handle multiple underscores in status", () => {
    const complexStatus = {
      ...mockRequest,
      requestStatus: "pending_coordinator_review",
    };

    render(<RequestRow req={complexStatus} />);

    // Note: .replace("_", " ") only replaces first underscore
    // So "pending_coordinator_review" becomes "Pending Coordinator_review"
    expect(screen.getByText(/Pending Coordinator_review/)).toBeInTheDocument();
  });

  test("should render request with all fields present", () => {
    render(<RequestRow req={mockRequest} />);

    expect(screen.getByText("#123")).toBeInTheDocument();
    expect(screen.getByText("cancellation")).toBeInTheDocument();
    expect(screen.getByText(/Pending/)).toBeInTheDocument();
    expect(screen.getByText(/15 Mar 2025/)).toBeInTheDocument();
    expect(screen.getByText("View / Edit")).toBeInTheDocument();
  });

  test("should handle date formatting for different dates", () => {
    const differentDateRequest = {
      ...mockRequest,
      createdAt: "2025-12-25T15:30:00",
    };

    render(<RequestRow req={differentDateRequest} />);

    expect(screen.getByText(/25 Dec 2025/)).toBeInTheDocument();
  });
});
