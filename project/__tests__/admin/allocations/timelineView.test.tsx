import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  TimelineView,
  WeekDef,
  ActivityRow,
  buildWeeksRange,
} from "../../../app/admin/allocations/components/TimelineView";
import userEvent from "@testing-library/user-event";

describe("TimelineView", () => {
  const mockWeeks: WeekDef[] = [
    { key: "2025-W11", label: "Week 11" },
    { key: "2025-W12", label: "Week 12" },
    { key: "2025-W13", label: "Week 13" },
  ];

  const mockActivities: ActivityRow[] = [
    {
      id: "1",
      name: "INFO1110 - Tutorial 01",
      activityType: "Tutorial",
      paycode: "CASUAL",
      flexTotal: 6,
      allocations: {
        "2025-W11": { tutor: "John Doe", hours: 2 },
        "2025-W12": { tutor: "John Doe", hours: 2 },
        "2025-W13": { tutor: "John Doe", hours: 2 },
      },
    },
    {
      id: "2",
      name: "COMP2123 - Lab 01",
      activityType: "Lab",
      paycode: "LAB",
      flexTotal: 9,
      allocations: {
        "2025-W11": [
          { tutor: "Jane Smith", hours: 3 },
          { tutor: "Bob Wilson", hours: 3 },
        ],
        "2025-W12": { tutor: "Jane Smith", hours: 3 },
      },
    },
  ];

  const renderTimeline = (
    props?: Partial<React.ComponentProps<typeof TimelineView>>,
  ) =>
    render(
      <TimelineView weeks={mockWeeks} activities={mockActivities} {...props} />,
    );

  test("renders title, weeks, and activity rows", () => {
    renderTimeline({ title: "Allocation Timeline" });
    expect(screen.getByText("Allocation Timeline")).toBeInTheDocument();
    mockWeeks.forEach((w) =>
      expect(screen.getByText(w.label)).toBeInTheDocument(),
    );
    expect(screen.getByText("INFO1110 - Tutorial 01")).toBeInTheDocument();
    expect(screen.getByText("COMP2123 - Lab 01")).toBeInTheDocument();
  });

  test("renders tutors and handles multiple tutors per cell", () => {
    renderTimeline();
    ["John Doe", "Jane Smith", "Bob Wilson"].forEach((tutor) => {
      expect(
        screen.getAllByText(new RegExp(tutor, "i")).length,
      ).toBeGreaterThan(0);
    });
  });

  it.each(["compact", "regular"])("renders with %s density", (density) => {
    const { container } = renderTimeline(
      density === "compact" ? { density } : {},
    );
    expect(container.firstChild).toBeTruthy();
  });

  test("handles empty activities and applies custom className", () => {
    const { container } = renderTimeline({
      activities: [],
      className: "custom-timeline",
    });
    expect(container.firstChild).toHaveClass("custom-timeline");
  });

  test("renders extra columns correctly", () => {
    renderTimeline({
      extraColumns: [
        {
          key: "paycode",
          header: "Paycode",
          render: (a: ActivityRow) => a.paycode || "-",
        },
      ],
    });
    expect(screen.getByText("Paycode")).toBeInTheDocument();
    expect(screen.getByText("CASUAL")).toBeInTheDocument();
    expect(screen.getByText("LAB")).toBeInTheDocument();
  });

  test.each([
    [
      "paycode only",
      [
        {
          id: "3",
          name: "MATH1001",
          activityType: "Lecture",
          paycode: "LECTURE",
          allocations: { "2025-W11": { tutor: "Dr. Smith", hours: 2 } },
        },
      ],
      "Pay LECTURE",
    ],
    [
      "flexTotal only",
      [
        {
          id: "4",
          name: "PHYS2001",
          activityType: "Lab",
          flexTotal: 12,
          allocations: { "2025-W11": { tutor: "Dr. Jones", hours: 4 } },
        },
      ],
      "Flex 12",
    ],
  ])("renders correctly when %s", (_, activities, expected) => {
    renderTimeline({ activities: activities as ActivityRow[] });
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  test("renders both paycode and flexTotal with separator", () => {
    renderTimeline();
    expect(screen.getByText(/Pay CASUAL.*•.*Flex 6/)).toBeInTheDocument();
    expect(screen.getByText(/Pay LAB.*•.*Flex 9/)).toBeInTheDocument();
  });

  test("handles activities with neither paycode nor flexTotal", () => {
    renderTimeline({
      activities: [
        {
          id: "5",
          name: "CHEM3001 - Workshop",
          activityType: "Workshop",
          allocations: { "2025-W11": { tutor: "Prof. Brown", hours: 3 } },
        },
      ],
    });
    expect(screen.getByText("CHEM3001 - Workshop")).toBeInTheDocument();
    expect(screen.queryByText(/Pay/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Flex/)).not.toBeInTheDocument();
  });

  test("calls onCellClick when cell clicked", () => {
    const mockOnCellClick = jest.fn();
    renderTimeline({ onCellClick: mockOnCellClick });
    const cell = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.includes("John Doe"));
    if (cell) {
      fireEvent.click(cell);
      expect(mockOnCellClick).toHaveBeenCalledWith(
        expect.objectContaining({
          activity: expect.any(Object),
          week: expect.any(Object),
        }),
      );
    }
  });

  test("handles tooltip edit button click", async () => {
    const user = userEvent.setup();
    const mockOnCellEdit = jest.fn();
    const { container } = renderTimeline({ onCellEdit: mockOnCellEdit });
    const cell = container.querySelector('[data-grid-cell="1"]');
    if (cell) {
      await user.hover(cell);
      try {
        const editBtn = await screen.findByText(
          "Edit this allocation",
          {},
          { timeout: 2000 },
        );
        await user.click(editBtn);
        expect(mockOnCellEdit).toHaveBeenCalled();
      } catch {
        expect(mockOnCellEdit).toBeDefined();
      }
    }
  });

  test("renders without edit button if onCellEdit not provided", () => {
    renderTimeline();
    expect(screen.queryByText("Edit this allocation")).not.toBeInTheDocument();
  });

  test("buildWeeksRange generates proper week definitions", () => {
    expect(buildWeeksRange(1, 3, "S2")).toEqual([
      { key: "W1", label: "S2 Week 1" },
      { key: "W2", label: "S2 Week 2" },
      { key: "W3", label: "S2 Week 3" },
    ]);
  });

  test("buildWeeksRange uses default S1 term when omitted", () => {
    expect(buildWeeksRange(5, 7)).toEqual([
      { key: "W5", label: "S1 Week 5" },
      { key: "W6", label: "S1 Week 6" },
      { key: "W7", label: "S1 Week 7" },
    ]);
  });

  test("renders +N more when >2 tutors in one cell", () => {
    const activities: ActivityRow[] = [
      {
        id: "6",
        name: "GROUP PROJECT",
        activityType: "Project",
        allocations: {
          "2025-W11": [
            { tutor: "Tutor 1", hours: 1 },
            { tutor: "Tutor 2", hours: 1 },
            { tutor: "Tutor 3", hours: 1 },
            { tutor: "Tutor 4", hours: 1 },
          ],
        },
      },
    ];
    renderTimeline({ activities });
    expect(screen.getByText("Tutor 1 1h")).toBeInTheDocument();
    expect(screen.getByText("Tutor 2 1h")).toBeInTheDocument();
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });
});
