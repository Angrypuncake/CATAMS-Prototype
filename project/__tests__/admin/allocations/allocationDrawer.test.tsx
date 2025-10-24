import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Drawer } from "../../../app/admin/allocations/components/AllocationDrawer";
import {
  AllocationRow,
  PaycodeOption,
} from "../../../app/admin/allocations/types";
import { Tutor } from "../../../app/_types/tutor";

const mockGetActivityOccurrences = jest.fn();

jest.mock("../../../app/services/activityService", () => ({
  getActivityOccurrences: (...args: unknown[]) =>
    mockGetActivityOccurrences(...args),
}));

describe("AllocationDrawer", () => {
  const mockTutors: Tutor[] = [
    {
      user_id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
    },
    {
      user_id: 2,
      first_name: "Jane",
      last_name: "Smith",
      email: "jane@example.com",
    },
  ];

  const mockPaycodes: PaycodeOption[] = [
    { code: "CASUAL", paycode_description: "Casual rate", amount: 50 },
    { code: "MARKING", paycode_description: "Marking rate", amount: 45 },
  ];

  const mockRow: AllocationRow = {
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
    note: "Test note",
    status: "Confirmed",
    paycode_id: "CASUAL",
    hours: 2,
    mode: "scheduled",
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetActivityOccurrences.mockResolvedValue([]);
  });

  test("does not render when closed", () => {
    const { container } = render(
      <Drawer
        open={false}
        onClose={mockOnClose}
        row={null}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders drawer when open with row data", async () => {
    render(
      <Drawer
        open
        row={mockRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() => expect(screen.getByText("Save")).toBeInTheDocument());
  });

  test("calls onClose when Cancel clicked", async () => {
    render(
      <Drawer
        open
        row={mockRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() => screen.getByText("Cancel"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("calls onSave when Save clicked", async () => {
    render(
      <Drawer
        open
        row={mockRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() => screen.getByText("Save"));
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => expect(mockOnSave).toHaveBeenCalledTimes(1));
  });

  test("fetches activity occurrences for scheduled allocation", async () => {
    render(
      <Drawer
        open
        row={mockRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() =>
      expect(mockGetActivityOccurrences).toHaveBeenCalledWith(101),
    );
  });

  test("does not fetch occurrences for unscheduled allocation", async () => {
    const unscheduledRow: AllocationRow = {
      ...mockRow,
      session_date: null,
      start_at: null,
      end_at: null,
      mode: "unscheduled",
      allocation_activity_id: null,
    };
    render(
      <Drawer
        open
        row={unscheduledRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() =>
      expect(mockGetActivityOccurrences).not.toHaveBeenCalled(),
    );
  });

  test("handles unscheduled allocation fields", async () => {
    const unscheduledRow: AllocationRow = {
      ...mockRow,
      session_date: null,
      start_at: null,
      end_at: null,
      mode: "unscheduled",
      hours: 3,
    };
    render(
      <Drawer
        open
        row={unscheduledRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() => expect(screen.getByText("Save")).toBeInTheDocument());
    expect(screen.queryByDisplayValue("3")).toBeInTheDocument();
  });

  test("saves unscheduled allocation with hours", async () => {
    const unscheduledRow: AllocationRow = {
      ...mockRow,
      mode: "unscheduled",
      session_date: null,
      start_at: null,
      end_at: null,
      allocation_activity_id: null,
      hours: 3,
    };
    render(
      <Drawer
        open
        row={unscheduledRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() => screen.getByText("Save"));
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnSave.mock.calls[0][0]).toHaveProperty("hours");
    });
  });

  test("saves scheduled allocation with propagation", async () => {
    render(
      <Drawer
        open
        row={mockRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() => screen.getByText("Save"));
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => {
      const payload = mockOnSave.mock.calls[0][0];
      expect(payload).toHaveProperty("propagate_fields");
      expect(payload).toHaveProperty("session_date");
    });
  });

  test("handles getActivityOccurrences error", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation();
    mockGetActivityOccurrences.mockRejectedValue(new Error("API Error"));
    render(
      <Drawer
        open
        row={mockRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() => expect(spy).toHaveBeenCalled());
    spy.mockRestore();
  });

  test("updates text fields", async () => {
    render(
      <Drawer
        open
        row={mockRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() => screen.getByText("Save"));
    const locationInputs = screen.getAllByDisplayValue("Room 101");
    const noteInputs = screen.getAllByDisplayValue("Test note");
    fireEvent.change(locationInputs[0], { target: { value: "Room 202" } });
    fireEvent.change(noteInputs[0], { target: { value: "Updated note" } });
  });

  test("handles date/time field updates", async () => {
    render(
      <Drawer
        open
        row={mockRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() => screen.getByText("Save"));
    const dateInput = screen.queryByDisplayValue("2025-03-15");
    if (dateInput)
      fireEvent.change(dateInput, { target: { value: "2025-03-20" } });
  });

  test("handles unscheduled date/time input changes", async () => {
    const unscheduledRow: AllocationRow = {
      ...mockRow,
      session_date: null,
      start_at: null,
      end_at: null,
      mode: "unscheduled",
      allocation_activity_id: null,
    };
    const { container } = render(
      <Drawer
        open
        row={unscheduledRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() => screen.getByText("Save"));
    const date = container.querySelector('input[type="date"]');
    const times = container.querySelectorAll('input[type="time"]');
    if (date) fireEvent.change(date, { target: { value: "2025-03-20" } });
    if (times.length >= 2) {
      fireEvent.change(times[0], { target: { value: "09:00" } });
      fireEvent.change(times[1], { target: { value: "11:00" } });
    }
  });

  test("handles status select change", async () => {
    render(
      <Drawer
        open
        row={mockRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() => screen.getByText("Save"));
    const selects = document.querySelectorAll("select");
    if (selects.length > 0)
      fireEvent.change(selects[0], { target: { value: "Draft" } });
  });

  test("handles checkbox toggle for manual hours", async () => {
    const unscheduledRow: AllocationRow = {
      ...mockRow,
      session_date: null,
      start_at: null,
      end_at: null,
      mode: "unscheduled",
      hours: 3,
    };
    render(
      <Drawer
        open
        row={unscheduledRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() => screen.getByText("Save"));
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length > 0) fireEvent.click(checkboxes[0]);
  });

  test("handles textarea note update in unscheduled mode", async () => {
    const unscheduledRow: AllocationRow = {
      ...mockRow,
      session_date: null,
      start_at: null,
      end_at: null,
      mode: "unscheduled",
      hours: 3,
      note: "",
    };
    render(
      <Drawer
        open
        row={unscheduledRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() => screen.getByText("Save"));
    const textareas = document.querySelectorAll("textarea");
    if (textareas.length > 1)
      fireEvent.change(textareas[1], { target: { value: "New note" } });
  });

  test("saves unscheduled allocation with null hours", async () => {
    const unscheduledRow: AllocationRow = {
      ...mockRow,
      mode: "unscheduled",
      session_date: null,
      start_at: null,
      end_at: null,
      allocation_activity_id: null,
      hours: null,
    };
    render(
      <Drawer
        open
        row={unscheduledRow}
        onClose={mockOnClose}
        onSave={mockOnSave}
        tutors={mockTutors}
        paycodes={mockPaycodes}
      />,
    );
    await waitFor(() => screen.getByText("Save"));
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => {
      const saved = mockOnSave.mock.calls[0][0];
      expect(saved.hours).toBeNull();
    });
  });
});
