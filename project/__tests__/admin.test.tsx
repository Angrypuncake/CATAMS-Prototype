import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
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
  test("renders admin dashboard title", async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });

    expect(screen.getByText("System Admin Dashboard")).toBeInTheDocument();
  });

  test("renders main sections", async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });

    expect(screen.getByText("User & Role Management")).toBeInTheDocument();
    expect(screen.getByText("Budgets Loaded")).toBeInTheDocument();
    expect(screen.getByText("Validation Reports")).toBeInTheDocument();
    expect(
      screen.getByText("Recent Jobs (Import/Exports)"),
    ).toBeInTheDocument();
  });

  test("renders action buttons", async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });

    expect(screen.getByText("Refresh")).toBeInTheDocument();
    expect(screen.getByText("Bulk Import Allocations")).toBeInTheDocument();
  });

  test("applies correct CSS classes and styling", async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<AdminDashboard />);
      container = result.container;
    });

    const mainContainer = container!.firstElementChild;
    expect(mainContainer).toHaveClass(
      "h-screen",
      "flex",
      "flex-col",
      "w-[90%]",
      "gap-3",
    );

    const whiteSections = container!.querySelectorAll(".bg-white.rounded-3xl");
    expect(whiteSections.length).toBeGreaterThan(0);

    expect(screen.getByText("Budgets Loaded")).toBeInTheDocument();
    expect(screen.getByText("Validation Reports")).toBeInTheDocument();
  });
  test("admin info boxes display correct statistics and styling", () => {
    render(
      <div>
        <AdminInfoBox
          adminStatistic={42}
          title="Users"
          bubbleText="directory"
          bubbleColor="red"
        />
        <AdminInfoBox
          adminStatistic={100}
          title="Success"
          bubbleText="request"
          bubbleColor="green"
        />
      </div>,
    );

    // Users box
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    const redBubble = screen.getByRole("button", { name: /directory/i });
    expect(redBubble).toHaveStyle({ backgroundColor: "rgb(255, 0, 0)" });

    // Success box
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    const greenBubble = screen.getByRole("button", { name: /request/i });
    // more lenient: accept "rgb(0, 128, 0)" or "green"
    expect(greenBubble).toHaveStyle({
      backgroundColor: expect.stringMatching(/green|rgb\(0,\s*128,\s*0\)/),
    });
  });
});
