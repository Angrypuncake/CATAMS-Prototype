import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import CorrectionReview from "../../../app/dashboard/review/[id]/_components/CorrectionReview";
import type { TutorRequest } from "../../../app/_types/request";

describe("CorrectionReview Component", () => {
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
});
