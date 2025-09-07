import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import DynamicTable from "../components/DynamicTable";

describe("DynamicTable", () => {
  test("renders table with data", () => {
    const mockData = [
      { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
    ];

    render(<DynamicTable rows={mockData} />);

    // Check headers are formatted correctly (capitalize and replace underscores)
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();

    // Check data rows
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  test("formats column headers correctly", () => {
    const mockData = [
      { user_name: "Test User", created_at: "2023-01-01", is_active: true },
    ];

    render(<DynamicTable rows={mockData} />);

    // Check underscore replacement and capitalization
    expect(screen.getByText("User Name")).toBeInTheDocument();
    expect(screen.getByText("Created At")).toBeInTheDocument();
    expect(screen.getByText("Is Active")).toBeInTheDocument();
  });

  test("excludes id column from display", () => {
    const mockData = [{ id: 123, name: "Test", value: "Sample" }];

    render(<DynamicTable rows={mockData} />);

    // Should not display ID column header
    expect(screen.queryByText("Id")).not.toBeInTheDocument();
    expect(screen.queryByText("ID")).not.toBeInTheDocument();

    // Should not display ID value
    expect(screen.queryByText("123")).not.toBeInTheDocument();

    // Should display other columns
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Value")).toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("Sample")).toBeInTheDocument();
  });

  test("returns null when no rows provided", () => {
    const { container } = render(<DynamicTable rows={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("handles different data types", () => {
    const mockData = [
      {
        name: "Test",
        count: 42,
        status: "active",
        description: null,
        score: undefined,
      },
    ];

    render(<DynamicTable rows={mockData} />);

    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Count")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
  });
});
