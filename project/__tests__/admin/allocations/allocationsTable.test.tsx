import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { AllocationsTable } from "../../../app/admin/allocations/components/AllocationsTable";
import { AdminAllocationRow } from "@/app/_types/allocations";

describe("AllocationsTable", () => {
  const mockScheduledRows: AdminAllocationRow[] = [
    {
      id: 1,
      user_id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      unit_code: "INFO1110",
      unit_name: "Introduction to Programming",
      activity_type: "Tutorial",
      activity_name: "Week 5",
      allocation_activity_id: 101,
      session_date: "2025-03-15",
      start_at: "10:00:00",
      end_at: "12:00:00",
      location: "Room 101",
      note: null,
      status: "Confirmed",
      paycode_id: "CASUAL",
      hours: 2,
      teaching_role: "Tutor",
      mode: "scheduled",
    },
  ];

  const mockUnscheduledRows: AdminAllocationRow[] = [
    {
      id: 2,
      user_id: 2,
      first_name: "Jane",
      last_name: "Smith",
      email: "jane@example.com",
      unit_code: "COMP2123",
      unit_name: "Data Structures",
      activity_type: "Marking",
      activity_name: "Assignment 1",
      allocation_activity_id: null,
      session_date: null,
      start_at: null,
      end_at: null,
      location: null,
      note: "Marking task",
      status: "Pending",
      paycode_id: "MARKING",
      hours: 10,
      teaching_role: "Marker",
      mode: "unscheduled",
    },
  ];

  const mockOnEdit = jest.fn();
  const mockOnPageChange = jest.fn();
  const mockOnSort = jest.fn();

  const renderTable = (
    props?: Partial<React.ComponentProps<typeof AllocationsTable>>,
  ) =>
    render(
      <AllocationsTable
        tab="scheduled"
        loading={false}
        visible={mockScheduledRows}
        page={1}
        limit={25}
        total={1}
        onEdit={mockOnEdit}
        onPageChange={mockOnPageChange}
        sort="so.session_date"
        sortDir="asc"
        onSort={mockOnSort}
        {...props}
      />,
    );

  beforeEach(() => jest.clearAllMocks());

  test("renders scheduled and unscheduled tables", () => {
    renderTable();
    expect(screen.getByText("INFO1110")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();

    renderTable({
      tab: "unscheduled",
      visible: mockUnscheduledRows,
      sort: "u.unit_code",
    });
    expect(screen.getAllByText("Unit").length).toBeGreaterThan(0); // fix: use getAllByText
    expect(screen.getByText("COMP2123")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it.each([
    [{ loading: true }, "table"],
    [{ visible: [], loading: false }, "table"],
  ])("renders table when %o", (props, selector) => {
    const { container } = renderTable(props);
    expect(container.querySelector(selector)).toBeInTheDocument();
  });

  test("calls onSort when header clicked", () => {
    renderTable();
    fireEvent.click(screen.getByText("Date*"));
    expect(mockOnSort).toHaveBeenCalledWith("so.session_date");
  });

  test("shows sort indicators correctly", () => {
    const { rerender } = renderTable();
    expect(screen.getByTestId("ArrowUpwardIcon")).toBeInTheDocument();
    rerender(
      <AllocationsTable
        tab="scheduled"
        loading={false}
        visible={mockScheduledRows}
        page={1}
        limit={25}
        total={1}
        onEdit={mockOnEdit}
        onPageChange={mockOnPageChange}
        sort="so.session_date"
        sortDir="desc"
        onSort={mockOnSort}
      />,
    );
    expect(screen.getByTestId("ArrowDownwardIcon")).toBeInTheDocument();
  });

  test("renders null field placeholders", () => {
    const nullRow: AdminAllocationRow = {
      ...mockScheduledRows[0],
      session_date: null,
      start_at: null,
      end_at: null,
      unit_code: null,
      unit_name: null,
      activity_type: null,
      activity_name: null,
      paycode_id: null,
      status: null,
      location: null,
      note: null,
    };
    renderTable({ visible: [nullRow] });
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it.each([
    ["unit name", "Introduction to Programming"],
    ["activity name", "Week 5"],
    ["email", "john@example.com"],
    ["location", "Room 101"],
  ])("renders %s", (_, expected) => {
    renderTable();
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  test("renders end time", () => {
    renderTable();
    expect(
      screen.getByText((content) => content.includes("End:")),
    ).toBeInTheDocument(); // fix: partial matcher
  });

  test("renders unscheduled row hours and note", () => {
    renderTable({
      tab: "unscheduled",
      visible: mockUnscheduledRows,
      sort: "u.unit_code",
    });
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Marking task")).toBeInTheDocument();
  });

  test("hides location column for unscheduled tab", () => {
    renderTable({ tab: "unscheduled", visible: mockUnscheduledRows });
    expect(screen.queryByText("Location")).not.toBeInTheDocument();
  });

  test("calls onEdit when edit clicked", () => {
    renderTable();
    fireEvent.click(screen.getAllByTestId("EditIcon")[0]);
    expect(mockOnEdit).toHaveBeenCalledWith(mockScheduledRows[0]);
  });
});
