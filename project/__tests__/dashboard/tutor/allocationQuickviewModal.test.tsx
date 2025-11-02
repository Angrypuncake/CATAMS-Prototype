import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import AllocationQuickviewModal from "@/app/dashboard/tutor/AllocationQuickviewModal";
import type { AllocationRow } from "@/app/dashboard/tutor/types";

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockNextLink";
  return MockLink;
});

describe("AllocationQuickviewModal", () => {
  const mockSetOpen = jest.fn();

  const mockSession: AllocationRow = {
    id: 1,
    allocation_id: 1,
    session_date: "2025-03-15T00:00:00Z",
    start_at: "2025-03-15T10:00:00Z",
    end_at: "2025-03-15T12:00:00Z",
    location: "Room 101",
    unit_code: "COMP1511",
    status: "Confirmed",
    note: "Programming tutorial",
    activity_type: "Tutorial",
    unit_name: "Programming Fundamentals",
    activity_name: "Week 5",
    hours: 2,
  } as AllocationRow;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render modal when open is true", () => {
    render(<AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={mockSession} />);

    expect(screen.getByText("Allocation quick view")).toBeInTheDocument();
  });

  test("should not render modal when open is false", () => {
    render(<AllocationQuickviewModal open={false} setOpen={mockSetOpen} session={mockSession} />);

    expect(screen.queryByText("Allocation quick view")).not.toBeInTheDocument();
  });

  test("should display session details correctly", () => {
    render(<AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={mockSession} />);

    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText("2025-03-15")).toBeInTheDocument();
    expect(screen.getByText("Room 101")).toBeInTheDocument();
    expect(screen.getByText("COMP1511")).toBeInTheDocument();
    expect(screen.getByText("Programming tutorial")).toBeInTheDocument();
  });

  test("should display time range when start_at exists (line 77)", () => {
    render(<AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={mockSession} />);

    expect(screen.getByText(/–/)).toBeInTheDocument();
  });

  test("should display dash when start_at is missing", () => {
    const sessionWithoutTime = { ...mockSession, start_at: null, end_at: null };
    render(
      <AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={sessionWithoutTime} />
    );

    const timeBoxes = screen.getAllByText("—");
    expect(timeBoxes.length).toBeGreaterThan(0);
  });

  test("should check if session has ended (line 32)", () => {
    const pastSession: AllocationRow = {
      ...mockSession,
      end_at: "2020-01-01T10:00:00Z",
    };

    render(<AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={pastSession} />);

    const submitClaimButton = screen.getByText("Submit Claim");
    expect(submitClaimButton).not.toBeDisabled();
  });

  test("should disable Submit Claim button when session has not ended", () => {
    const futureSession: AllocationRow = {
      ...mockSession,
      end_at: "2099-12-31T23:59:59Z",
    };

    render(<AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={futureSession} />);

    const submitClaimButton = screen.getByText("Submit Claim");
    expect(submitClaimButton).toBeDisabled();
  });

  test("should only show Submit Claim button for Confirmed status", () => {
    render(<AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={mockSession} />);

    expect(screen.getByText("Submit Claim")).toBeInTheDocument();
  });

  test("should not show Submit Claim button for Pending status", () => {
    const pendingSession = { ...mockSession, status: "Pending" };
    render(<AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={pendingSession} />);

    expect(screen.queryByText("Submit Claim")).not.toBeInTheDocument();
  });

  test("should not show Submit Claim button for Cancelled status", () => {
    const cancelledSession = { ...mockSession, status: "Cancelled" };
    render(
      <AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={cancelledSession} />
    );

    expect(screen.queryByText("Submit Claim")).not.toBeInTheDocument();
  });

  test("should close modal when Close button is clicked", () => {
    render(<AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={mockSession} />);

    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  test("should close modal when Submit Claim button is clicked", () => {
    const pastSession = { ...mockSession, end_at: "2020-01-01T10:00:00Z" };
    render(<AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={pastSession} />);

    const submitButton = screen.getByText("Submit Claim");
    fireEvent.click(submitButton);

    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  test("should render View details link with correct href", () => {
    render(<AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={mockSession} />);

    const viewDetailsLink = screen.getByText("View details");
    expect(viewDetailsLink).toHaveAttribute("href", "/dashboard/tutor/allocations/1");
  });

  test("should display fallback values when session data is missing", () => {
    const emptySession = {
      id: 1,
      allocation_id: 1,
      session_date: null,
      start_at: null,
      end_at: null,
      location: null,
      unit_code: null,
      status: null,
      note: null,
      activity_type: null,
      unit_name: null,
    } as unknown as AllocationRow;

    render(<AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={emptySession} />);

    const dashSymbols = screen.getAllByText("—");
    expect(dashSymbols.length).toBeGreaterThan(0);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  test("should handle null session gracefully", () => {
    render(<AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={null} />);

    expect(screen.getByText("Allocation quick view")).toBeInTheDocument();
  });

  test("should display warning chip for Pending status", () => {
    const pendingSession = { ...mockSession, status: "Pending" };
    render(<AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={pendingSession} />);

    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  test("should handle session without end_at (hasEnded should be false)", () => {
    const sessionWithoutEndAt = { ...mockSession, end_at: null };
    render(
      <AllocationQuickviewModal open={true} setOpen={mockSetOpen} session={sessionWithoutEndAt} />
    );

    const submitButton = screen.getByText("Submit Claim");
    expect(submitButton).toBeDisabled();
  });
});
