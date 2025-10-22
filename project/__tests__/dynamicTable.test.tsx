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

      const { container: emptyContainer } = render(<DynamicTable rows={[]} />);
      expect(emptyContainer.querySelector("table")).toBeInTheDocument();
      expect(screen.getByText("No data available")).toBeInTheDocument();
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

    test("searches date strings and numbers correctly", () => {
      const dataWithDateStringsAndNumbers = [
        {
          id: 1,
          name: "Alice",
          createdAt: "2023-01-15",
          score: 85,
          count: 100,
        },
        {
          id: 2,
          name: "Bob",
          createdAt: "2024-06-20",
          score: 92,
          count: 250,
        },
        {
          id: 3,
          name: "Charlie",
          createdAt: "2023-12-05",
          score: 78,
          count: 150,
        },
      ];

      render(
        <DynamicTable
          rows={dataWithDateStringsAndNumbers}
          enableSearch={true}
        />,
      );

      const searchInput = screen.getByPlaceholderText(
        "Search across all fields...",
      ) as HTMLInputElement;

      // Search by year in date string
      fireEvent.change(searchInput, { target: { value: "2023" } });
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
      expect(screen.queryByText("Bob")).not.toBeInTheDocument();

      // Search by number (exact)
      fireEvent.change(searchInput, { target: { value: "92" } });
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.queryByText("Alice")).not.toBeInTheDocument();
      expect(screen.queryByText("Charlie")).not.toBeInTheDocument();

      // Search by partial number
      fireEvent.change(searchInput, { target: { value: "5" } });
      expect(screen.getByText("Alice")).toBeInTheDocument(); // score 85
      expect(screen.getByText("Charlie")).toBeInTheDocument(); // score 78, count 150
      expect(screen.getByText("Bob")).toBeInTheDocument(); // count 250

      // Search by date month
      fireEvent.change(searchInput, { target: { value: "01" } });
      expect(screen.getByText("Alice")).toBeInTheDocument(); // 2023-01-15
      expect(screen.queryByText("Bob")).not.toBeInTheDocument();
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
  describe("Pagination", () => {
    let longData: Array<{ id: number; name: string }>;

    beforeEach(() => {
      longData = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
      }));
    });
    test("client-side pagination displays, navigates, and uses custom options", () => {
      const { unmount } = render(
        <DynamicTable
          rows={longData}
          enablePagination={true}
          rowsPerPageOptions={[5, 10, 15]}
          defaultRowsPerPage={5}
        />,
      );

      let rows = screen.getAllByRole("row");
      expect(rows.length).toBe(6);
      expect(screen.getByText("User 1")).toBeInTheDocument();
      expect(screen.queryByText("User 6")).not.toBeInTheDocument();

      const nextButton = screen.getByRole("button", { name: /next page/i });
      fireEvent.click(nextButton);
      expect(screen.queryByText("User 1")).not.toBeInTheDocument();
      expect(screen.getByText("User 6")).toBeInTheDocument();

      const rowsPerPageSelect = screen.getByRole("combobox");
      fireEvent.mouseDown(rowsPerPageSelect);
      const option = screen.getByRole("option", { name: "10" });
      fireEvent.click(option);
      rows = screen.getAllByRole("row");
      expect(rows.length).toBe(11);

      unmount();
      render(<DynamicTable rows={longData} enablePagination={false} />);
      rows = screen.getAllByRole("row");
      expect(rows.length).toBe(21);
    });

    test("server-side pagination triggers callbacks and uses totalCount", () => {
      const onPaginationChange = jest.fn();

      render(
        <DynamicTable
          rows={basicData}
          enableServerSidePagination={true}
          onPaginationChange={onPaginationChange}
          totalCount={100}
          defaultRowsPerPage={10}
        />,
      );

      expect(screen.getByText(/100/)).toBeInTheDocument();

      expect(screen.getByText("Elvis")).toBeInTheDocument();
      expect(screen.getByText("Alex")).toBeInTheDocument();

      const nextButton = screen.getByRole("button", { name: /next page/i });
      fireEvent.click(nextButton);
      expect(onPaginationChange).toHaveBeenCalledWith(1, 10);

      const rowsPerPageSelect = screen.getByRole("combobox");
      fireEvent.mouseDown(rowsPerPageSelect);
      const option = screen.getByRole("option", { name: "25" });
      fireEvent.click(option);
      expect(onPaginationChange).toHaveBeenCalledWith(0, 25);
    });
  });

  test("uses custom column labels and renderers", () => {
    const mockData = [{ user_name: "Elvis", status: "active" }];

    render(
      <DynamicTable
        rows={mockData}
        columns={[
          { key: "user_name", label: "Full Name" },
          { key: "status", label: "Status" },
        ]}
        columnRenderers={{
          status: (value) => (
            <span data-testid="custom-status">
              {String(value).toUpperCase()}
            </span>
          ),
        }}
      />,
    );

    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.queryByText("User Name")).not.toBeInTheDocument();

    const customElement = screen.getByTestId("custom-status");
    expect(customElement).toHaveTextContent("ACTIVE");
  });

  test("action buttons render, call callbacks, support conditions and custom labels", () => {
    const onClick = jest.fn();

    render(
      <DynamicTable
        rows={complexData}
        actions={[
          { label: "Edit", onClick, color: "primary" },
          {
            label: "Delete",
            onClick: jest.fn(),
            disabled: (row) => row.isActive,
          },
        ]}
        actionsLabel="Operations"
      />,
    );

    expect(screen.getByText("Operations")).toBeInTheDocument();

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    expect(editButtons).toHaveLength(2);

    fireEvent.click(editButtons[0]);
    expect(onClick).toHaveBeenCalledWith(complexData[0]);

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    expect(deleteButtons[0]).toBeDisabled();
    expect(deleteButtons[1]).not.toBeDisabled();
  });

  test("export shows buttons, triggers download, uses custom filename, and can be disabled", () => {
    const createElementSpy = jest.spyOn(document, "createElement");

    const { unmount } = render(
      <DynamicTable
        rows={basicData}
        enableExport={true}
        exportFilename="my_custom_export"
      />,
    );

    expect(screen.getByRole("button", { name: /csv/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /json/i })).toBeInTheDocument();

    const csvButton = screen.getByRole("button", { name: /csv/i });
    fireEvent.click(csvButton);
    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(global.URL.createObjectURL).toHaveBeenCalled();

    const links = createElementSpy.mock.results
      .filter((r) => r.value.tagName === "A")
      .map((r) => r.value);
    expect(links[links.length - 1].download).toBe("my_custom_export.csv");

    const jsonButton = screen.getByRole("button", { name: /json/i });
    fireEvent.click(jsonButton);
    expect(createElementSpy).toHaveBeenCalledWith("a");

    unmount();
    render(<DynamicTable rows={basicData} enableExport={false} />);
    expect(
      screen.queryByRole("button", { name: /csv/i }),
    ).not.toBeInTheDocument();
  });

  describe("Edge cases", () => {
    test("handles arrays with chips, objects, and complex nested data", () => {
      const arrayData = [{ id: 1, tags: ["react", "typescript", "testing"] }];

      const { unmount } = render(
        <DynamicTable rows={arrayData} maxChips={2} />,
      );

      expect(screen.getByText("react")).toBeInTheDocument();
      expect(screen.getByText("typescript")).toBeInTheDocument();
      expect(screen.getByText("+1 more")).toBeInTheDocument();

      unmount();

      const complexData = [
        { id: 2, user: { name: "Elvis", age: 30 } },
        {
          id: 3,
          items: [
            { name: "item1", value: 10 },
            { name: "item2", value: 20 },
          ],
        },
      ];

      const { container } = render(
        <DynamicTable
          rows={complexData}
          enableSearch={false}
          enablePagination={false}
        />,
      );

      expect(container.textContent).toContain("Elvis");

      const rows = screen.getAllByRole("row");
      expect(rows.length).toBe(3);

      const inspectButtons = container.querySelectorAll(
        'svg[data-testid="SearchIcon"]',
      );
      expect(inspectButtons.length).toBeGreaterThan(0);
    });

    test("handles null, undefined, and long string values", () => {
      const longString = "a".repeat(100);
      const mockData = [
        {
          id: 1,
          name: null,
          email: undefined,
          age: 25,
          description: longString,
        },
      ];

      render(<DynamicTable rows={mockData} />);

      expect(screen.getByText("25")).toBeInTheDocument();

      const dashElements = screen.getAllByText("—");
      expect(dashElements.length).toBe(2);

      const truncatedText = screen.getByText(/a+…/);
      expect(truncatedText).toBeInTheDocument();
      expect(truncatedText.textContent?.length).toBeLessThan(longString.length);
    });

    test("supports custom searchPlaceholder and works with all features disabled", () => {
      const { unmount } = render(
        <DynamicTable
          rows={basicData}
          enableSearch={true}
          searchPlaceholder="Type to search..."
        />,
      );

      expect(
        screen.getByPlaceholderText("Type to search..."),
      ).toBeInTheDocument();

      unmount();
      render(
        <DynamicTable
          rows={basicData}
          enableSearch={false}
          enableSorting={false}
          enablePagination={false}
          enableExport={false}
        />,
      );

      expect(screen.getAllByText("Elvis")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Alex")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Gemma")[0]).toBeInTheDocument();

      expect(
        screen.queryByPlaceholderText("Search across all fields..."),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /next page/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /csv/i }),
      ).not.toBeInTheDocument();
    });
  });
});
