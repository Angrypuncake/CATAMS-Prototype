import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import Page from "../../app/dashboard/coordinator/page";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/dashboard/coordinator",
    query: {},
  })),
  usePathname: jest.fn(() => "/dashboard/coordinator"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock API services to prevent network errors
jest.mock("../../app/services/budgetService", () => ({
  getUnitBudgetOverviews: jest.fn(() =>
    Promise.resolve({
      year: 2025,
      session: "S1",
      threshold: 0.9,
      rows: [],
      alerts: [],
    }),
  ),
}));

jest.mock("../../app/services/requestService", () => ({
  getRequestsByUC: jest.fn(() => Promise.resolve([])),
}));

jest.mock("../../app/services/unitService", () => ({
  getCoordinatorUnits: jest.fn(() => Promise.resolve([])),
}));

jest.mock("../../app/utils/dateHelpers", () => ({
  getCurrentYearAndSession: jest.fn(() => ({
    year: 2025,
    session: "S1",
  })),
}));

describe("TADashboard", () => {
  // Basic rendering tests
  test("should display the main dashboard title and description", async () => {
    await act(async () => {
      render(<Page />);
    });

    expect(screen.getByText("Unit Coordinator Dashboard")).toBeInTheDocument();
  });
});
