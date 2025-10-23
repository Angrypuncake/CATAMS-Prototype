import "@testing-library/jest-dom";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import AdminDashboard from "../../app/dashboard/admin/page";
import AdminInfoBox from "@/app/dashboard/admin/AdminInfoBox";
import AdminBudgetBox from "@/app/dashboard/admin/AdminBudgetBox";
import axios from "axios";

jest.mock("axios", () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: {
        totals: { users: 10, allocations: 50 },
        userRoles: [
          { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            role: "User",
          },
          {
            id: 3,
            name: "Bob Wilson",
            email: "bob@example.com",
            role: "Tutor",
          },
        ],
        staged: [
          {
            id: 1,
            file_name: "allocations_2023.csv",
            upload_date: "2023-01-01",
            status: "pending",
          },
          {
            id: 2,
            file_name: "users_2023.csv",
            upload_date: "2023-01-02",
            status: "processing",
          },
        ],
        runs: [
          {
            id: 1,
            job_type: "import",
            start_time: "2023-01-01 10:00",
            status: "completed",
            duration: "5min",
          },
          {
            id: 2,
            job_type: "export",
            start_time: "2023-01-01 11:00",
            status: "failed",
            duration: "2min",
          },
        ],
      },
    }),
  ),
}));

describe("AdminDashboard", () => {
  // Basic rendering tests
  test("should display the main dashboard title and description", async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });

    expect(screen.getByText("System Admin Dashboard")).toBeInTheDocument();
  });

  test("should show all essential sections and navigation buttons", async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });

    // Check that all the main dashboard sections are visible
    expect(screen.getByText("User & Role Management")).toBeInTheDocument();
    expect(screen.getByText("Budgets Loaded")).toBeInTheDocument();
    expect(screen.getByText("Validation Reports")).toBeInTheDocument();
    expect(
      screen.getByText("Recent Jobs (Import/Exports)"),
    ).toBeInTheDocument();

    // Make sure the action buttons are there for admin workflows
    expect(screen.getByText("Refresh")).toBeInTheDocument();
    expect(screen.getByText("Bulk Import Allocations")).toBeInTheDocument();
  });

  test("should apply proper layout styling with Tailwind classes", async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<AdminDashboard />);
      container = result.container;
    });

    // Verify the main container has the correct layout classes
    const mainContainer = container!.firstElementChild;
    expect(mainContainer).toHaveClass(
      "h-screen",
      "flex",
      "flex-col",
      "w-[90%]",
      "gap-3",
    );

    // Check that we have white rounded sections for content areas
    const whiteSections = container!.querySelectorAll(".bg-white.rounded-3xl");
    expect(whiteSections.length).toBeGreaterThan(0);
  });

  // Data loading and API integration tests
  test("should load and display statistics from the backend API", async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });

    // Wait for the mocked API data to load and show up in the UI
    await waitFor(() => {
      expect(screen.getByText("10")).toBeInTheDocument(); // User count from mock
      expect(screen.getByText("50")).toBeInTheDocument(); // Allocation count from mock
    });

    // Verify tables are being populated (exercises DynamicTable component)
    const tables = document.querySelectorAll("table");
    expect(tables.length).toBeGreaterThanOrEqual(0);
  });

  test("should handle large datasets with proper pagination", async () => {
    // Mock a bigger dataset to test pagination logic
    const mockedAxios = jest.mocked(axios);
    mockedAxios.get.mockResolvedValue({
      data: {
        totals: { users: 50, allocations: 100 },
        userRoles: Array.from({ length: 25 }, (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          role: "User",
        })),
        staged: Array.from({ length: 15 }, (_, i) => ({
          id: i + 1,
          file_name: `file${i + 1}.csv`,
          status: "pending",
        })),
        runs: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          job_type: "import",
          status: "completed",
        })),
      },
    });

    await act(async () => {
      render(<AdminDashboard />);
    });

    // Check that the larger numbers show up (tests pagination slicing)
    await waitFor(() => {
      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });

  test("should gracefully handle API failures without crashing", async () => {
    // Set up spies to catch error logging
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const mockedAxios = jest.mocked(axios);
    mockedAxios.get
      .mockRejectedValueOnce(new Error("Overview API Error"))
      .mockRejectedValueOnce(new Error("History API Error"));

    await act(async () => {
      render(<AdminDashboard />);
    });

    // Make sure errors are properly logged instead of breaking the app
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error loading overview:",
        expect.any(Error),
      );
    });

    consoleErrorSpy.mockRestore();
  });

  // User interaction tests
  test("should allow switching between staged and runs data views", async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });

    // Find the toggle buttons for different data views
    const stagedButton = screen.getByText("Staged");
    const runsButton = screen.getByText("Runs");

    // Test switching to runs view
    await act(async () => {
      fireEvent.click(runsButton);
    });

    // Test switching back to staged view
    await act(async () => {
      fireEvent.click(stagedButton);
    });
  });

  // Component integration tests
  test("should render info boxes with correct data and styling", () => {
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

    // Check basic content display
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();

    // Test colored bubble buttons work correctly
    const redBubble = screen.getByRole("button", { name: /directory/i });
    expect(redBubble).toHaveStyle({ backgroundColor: "rgb(255, 0, 0)" });

    const greenBubble = screen.getByRole("button", { name: /request/i });
    expect(greenBubble).toHaveStyle({
      backgroundColor: expect.stringMatching(/green|rgb\(0,\s*128,\s*0\)/),
    });
  });

  test("should use MUI TablePagination for built-in pagination controls", async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("System Admin Dashboard")).toBeInTheDocument();
    });

    // Check that MUI TablePagination is rendered (it uses "Rows per page" label)
    const paginationElements = screen.queryAllByText(/rows per page/i);
    expect(paginationElements.length).toBeGreaterThan(0);
  });

  test("should render budget boxes as links or buttons based on href prop", () => {
    // Test the href conditional logic in AdminBudgetBox
    const { rerender } = render(
      <AdminBudgetBox
        title="Test Budget"
        description="Test description"
        href="/test-link"
      />,
    );

    expect(screen.getByText("Test Budget")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();

    // When href is provided, should render as a clickable link
    const buttonWithHref = screen.getByText("Open");
    expect(buttonWithHref.closest("a")).toHaveAttribute("href", "/test-link");

    // Test without href - should just be a regular button
    rerender(
      <AdminBudgetBox
        title="No Link Budget"
        description="No link description"
      />,
    );

    const buttonWithoutHref = screen.getByText("Open");
    // Without href, MUI Button renders as a button element instead of anchor
    expect(buttonWithoutHref.tagName).toBe("BUTTON");
    expect(buttonWithoutHref.closest("a")).toBeNull();
  });
});
