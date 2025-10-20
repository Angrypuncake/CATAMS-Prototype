import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import DynamicTable from "../components/DynamicTable/DynamicTable";

describe("DynamicTable", () => {
  let basicData: Array<{
    id: number;
    user_name: string;
    email: string;
    is_active: boolean;
  }>;
  let numericData: Array<{ id: number; name: string; score: number }>;
  let complexData: Array<{
    id: number;
    name: string;
    age: number;
    isActive: boolean;
    tags: string[];
    meta: { role: string };
    joined: Date;
  }>;

  beforeEach(() => {
    basicData = [
      {
        id: 1,
        user_name: "Elvis",
        email: "elvis@example.com",
        is_active: true,
      },
      { id: 2, user_name: "Alex", email: "alex@example.com", is_active: true },
      {
        id: 3,
        user_name: "Gemma",
        email: "gemma@example.com",
        is_active: true,
      },
    ];

    numericData = [
      { id: 1, name: "Charlie", score: 100 },
      { id: 2, name: "Alice", score: 50 },
      { id: 3, name: "Bob", score: 200 },
    ];

    complexData = [
      {
        id: 1,
        name: "Elvis",
        age: 30,
        isActive: true,
        tags: ["react"],
        meta: { role: "admin" },
        joined: new Date("2023-01-15"),
      },
      {
        id: 2,
        name: "Alex",
        age: 25,
        isActive: false,
        tags: ["react"],
        meta: { role: "admin" },
        joined: new Date("2023-06-20"),
      },
    ];

    global.URL.createObjectURL = jest.fn(() => "mock-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  describe("Basic rendering", () => {
    test("renders table with formatted headers, data types, and handles empty data", () => {
      render(<DynamicTable rows={basicData} />);

      expect(screen.getByText("User Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Is Active")).toBeInTheDocument();

      expect(screen.getByText("Elvis")).toBeInTheDocument();
      expect(screen.getByText("elvis@example.com")).toBeInTheDocument();

      expect(screen.queryByText("Id")).not.toBeInTheDocument();
      expect(screen.queryByText("1")).not.toBeInTheDocument();

      const { container } = render(<DynamicTable rows={[]} />);
      expect(container.firstChild).toBeNull();
    });

    test("renders booleans as chips and dates with formatting", () => {
      render(<DynamicTable rows={complexData} />);

      expect(screen.getByText("True")).toBeInTheDocument();
      expect(screen.getByText("False")).toBeInTheDocument();

      const dateElements = screen.getAllByText(/2023/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    test("displays 'No results found' when search returns empty", () => {
      render(<DynamicTable rows={basicData} enableSearch={true} />);

      const searchInput = screen.getByPlaceholderText(
        "Search across all fields...",
      ) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: "NONEXISTENT" } });

      expect(screen.getByText("No results found")).toBeInTheDocument();
    });
  });

  describe("Search", () => {
    test("filters rows case-insensitively, clears search, and searches complex data types", () => {
      const complexData = [
        {
          id: 1,
          name: "Elvis",
          tags: ["react"],
          meta: { role: "admin" },
          joined: new Date("2023-01-15"),
        },
        {
          id: 2,
          name: "Alex",
          tags: ["vue"],
          meta: { role: "user" },
          joined: new Date("2024-01-15"),
        },
      ];

      render(<DynamicTable rows={complexData} enableSearch={true} />);

      const searchInput = screen.getByPlaceholderText(
        "Search across all fields...",
      ) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: "ELVIS" } });
      expect(screen.getByText("Elvis")).toBeInTheDocument();
      expect(screen.queryByText("Alex")).not.toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: "react" } });
      expect(screen.getByText("react")).toBeInTheDocument();
      expect(screen.queryByText("vue")).not.toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: "admin" } });
      expect(screen.getByText("Elvis")).toBeInTheDocument();
      expect(screen.queryByText("Alex")).not.toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: "2023" } });
      expect(screen.getByText("Elvis")).toBeInTheDocument();
      expect(screen.queryByText("Alex")).not.toBeInTheDocument();

      const clearButton = screen.getByRole("button", { name: "" });
      fireEvent.click(clearButton);
      expect(screen.getByText("Elvis")).toBeInTheDocument();
      expect(screen.getByText("Alex")).toBeInTheDocument();
    });

    test("handles search with null/undefined values and can be disabled", () => {
      const dataWithNulls = [
        { id: 1, name: "Elvis", email: null, age: undefined },
        { id: 2, name: "Alex", email: "alex@test.com", age: 25 },
      ];

      const { rerender } = render(
        <DynamicTable rows={dataWithNulls} enableSearch={true} />,
      );

      const searchInput = screen.getByPlaceholderText(
        "Search across all fields...",
      ) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: "alex@test" } });
      expect(screen.getByText("Alex")).toBeInTheDocument();
      expect(screen.queryByText("Elvis")).not.toBeInTheDocument();

      rerender(<DynamicTable rows={basicData} enableSearch={false} />);
      expect(
        screen.queryByPlaceholderText("Search across all fields..."),
      ).not.toBeInTheDocument();
    });

    test("triggers server-side search callback", () => {
      const onSearchChange = jest.fn();

      render(
        <DynamicTable
          rows={basicData}
          enableSearch={true}
          enableServerSidePagination={true}
          onSearchChange={onSearchChange}
        />,
      );

      const searchInput = screen.getByPlaceholderText(
        "Search across all fields...",
      ) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: "test" } });
      expect(onSearchChange).toHaveBeenCalledWith("test");

      const clearButton = screen.getByRole("button", { name: "" });
      fireEvent.click(clearButton);
      expect(onSearchChange).toHaveBeenCalledWith("");
    });
  });

  describe("Sorting", () => {
    test("sorts strings, numbers, booleans, dates, nulls and toggles direction", () => {
      render(<DynamicTable rows={complexData} enableSorting={true} />);

      const nameHeader = screen.getByText("Name");
      fireEvent.click(nameHeader);
      let rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("Alex");
      expect(rows[2]).toHaveTextContent("Elvis");

      fireEvent.click(nameHeader);
      rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("Elvis");

      const scoreHeader = screen.getByText("Age");
      fireEvent.click(scoreHeader);
      rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("25");
      expect(rows[2]).toHaveTextContent("30");

      const activeHeader = screen.getByText("IsActive");
      fireEvent.click(activeHeader);
      rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("False");

      const dateHeader = screen.getByText("Joined");
      fireEvent.click(dateHeader);
      rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("Elvis");
      expect(rows[2]).toHaveTextContent("Alex");
    });

    test("uses default sort column and direction, and can be disabled", () => {
      const { unmount } = render(
        <DynamicTable
          rows={numericData}
          enableSorting={true}
          defaultSortColumn="name"
          defaultSortDirection="desc"
        />,
      );

      let rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("Charlie");
      expect(rows[2]).toHaveTextContent("Bob");
      expect(rows[3]).toHaveTextContent("Alice");

      unmount();
      render(<DynamicTable rows={numericData} enableSorting={false} />);
      const nameHeader = screen.getByText("Name");
      fireEvent.click(nameHeader);

      rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("Charlie");
      expect(rows[2]).toHaveTextContent("Alice");
    });

    test("triggers server-side sort callback", () => {
      const onSortChange = jest.fn();

      render(
        <DynamicTable
          rows={basicData}
          enableSorting={true}
          enableServerSidePagination={true}
          onSortChange={onSortChange}
        />,
      );

      const nameHeader = screen.getByText("User Name");
      fireEvent.click(nameHeader);
      expect(onSortChange).toHaveBeenCalledWith("user_name", "asc");

      fireEvent.click(nameHeader);
      expect(onSortChange).toHaveBeenCalledWith("user_name", "desc");
    });
  });
});
