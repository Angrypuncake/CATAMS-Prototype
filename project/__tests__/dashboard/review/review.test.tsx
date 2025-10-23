import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ReviewPage from "../../../app/dashboard/review/[id]/page";

// Mock Next.js navigation hooks
jest.mock("next/navigation", () => ({
  useParams: jest.fn(() => ({ id: "123" })),
}));

// Mock API services
jest.mock("../../../app/services/requestService", () => ({
  getRequestById: jest.fn(() =>
    Promise.resolve({
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
    }),
  ),
}));

jest.mock("../../../app/services/allocationService", () => ({
  getFormattedAllocationById: jest.fn(() =>
    Promise.resolve({
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
    }),
  ),
}));

jest.mock("../../../app/services/userService", () => ({
  getTutorsByUnit: jest.fn(() => Promise.resolve([])),
}));

describe("ReviewPage", () => {
  test("should render loading state initially", () => {
    render(<ReviewPage />);

    // The loading spinner should be visible initially
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("should render review page after loading", async () => {
    render(<ReviewPage />);

    // Wait for the review content to load
    await screen.findByText("Claim Request Review");

    // Verify the review page is displayed
    expect(screen.getByText("Claim Request Review")).toBeInTheDocument();
  });
});
