import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import AdminDashboard from "../app/dashboard/admin/page";

// Mock axios to prevent actual API calls during tests
jest.mock("axios", () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: {
        totals: { users: 10, allocations: 50 },
        userRoles: [],
        staged: [],
        runs: [],
      },
    }),
  ),
}));

describe("AdminDashboard", () => {
  test("renders admin dashboard title", () => {
    render(<AdminDashboard />);

    expect(screen.getByText("System Admin Dashboard")).toBeInTheDocument();
  });

  test("renders main sections", () => {
    render(<AdminDashboard />);

    expect(screen.getByText("User & Role Management")).toBeInTheDocument();
    expect(screen.getByText("Budgets Loaded")).toBeInTheDocument();
    expect(screen.getByText("Validation Reports")).toBeInTheDocument();
    expect(
      screen.getByText("Recent Jobs (Import/Exports)"),
    ).toBeInTheDocument();
  });

  test("renders action buttons", () => {
    render(<AdminDashboard />);

    expect(screen.getByText("Refresh")).toBeInTheDocument();
    expect(screen.getByText("Bulk Import Allocations")).toBeInTheDocument();
  });
});
