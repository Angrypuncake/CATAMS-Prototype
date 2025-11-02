import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ReviewFallback from "../../../app/dashboard/review/[id]/_components/ReviewFallback";
import type { TutorRequest } from "../../../app/_types/request";

describe("ReviewFallback Component", () => {
  const mockUnknownRequest: TutorRequest = {
    requestId: 5,
    requesterId: 10,
    reviewerId: 5,
    requestDate: "2025-03-15",
    allocationId: 1,
    requestStatus: "pending",
    requestReason: null,
    createdAt: "2025-03-15T10:00:00",
    updatedAt: "2025-03-15T10:00:00",
    requestType: "query",
    details: null,
  };

  test("should render fallback message for unknown request type", () => {
    render(<ReviewFallback data={mockUnknownRequest} />);

    expect(screen.getByText("Unknown Request Type")).toBeInTheDocument();
    expect(
      screen.getByText("This request type is not recognized or supported yet.")
    ).toBeInTheDocument();
  });
});
