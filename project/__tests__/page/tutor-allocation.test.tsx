import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import AllocationPage from "../../app/dashboard/tutor/allocations/[id]/page";

// Mock Next.js navigation hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/dashboard/tutor/allocations/1",
    query: {},
  })),
  useParams: jest.fn(() => ({ id: "1" })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock API services
jest.mock("../../app/services/allocationService", () => ({
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
    })
  ),
}));

jest.mock("../../app/services/requestService", () => ({
  getOpenRequestTypes: jest.fn(() => Promise.resolve([])),
  getRequestsByAllocation: jest.fn(() => Promise.resolve([])),
}));

jest.mock("../../app/services/authService", () => ({
  getUserFromAuth: jest.fn(() =>
    Promise.resolve({
      userId: 10,
      firstName: "John",
      lastName: "Doe",
      email: "john@test.com",
    })
  ),
}));

describe("AdminDashboard", () => {
  // Basic rendering tests
  test("should display the main dashboard title and description", async () => {
    await act(async () => {
      render(<AllocationPage />);
    });

    // Wait for the component to load
    await screen.findByText("Allocation");

    expect(screen.getByText("Allocation")).toBeInTheDocument();
  });
});
