import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminDashboard from "../app/dashboard/admin/page";
import axios from "axios";
import AdminBudgetBox from "@/app/dashboard/admin/AdminBudgetBox";
import AdminInfoBox from "@/app/dashboard/admin/AdminInfoBox";

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

  test("applies correct CSS classes and styling", () => {
    const { container } = render(<AdminDashboard />);

    const mainContainer = container.firstElementChild;
    expect(mainContainer).toHaveClass(
      "h-screen",
      "flex",
      "flex-col",
      "w-[90%]",
      "gap-3",
    );

    const whiteSections = container.querySelectorAll(".bg-white.rounded-3xl");
    expect(whiteSections.length).toBeGreaterThan(0);

    expect(screen.getByText("Budgets Loaded")).toBeInTheDocument();
    expect(screen.getByText("Validation Reports")).toBeInTheDocument();
  });
});
