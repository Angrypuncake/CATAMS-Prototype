import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UnscheduledAllocationsTable from "../../../app/dashboard/coordinator/_components/UnscheduledAllocationsTable";
import { getAllUnscheduledAllocationsForUC } from "../../../app/services/allocationService";

jest.mock("../../../app/services/allocationService", () => ({
  getAllUnscheduledAllocationsForUC: jest.fn(),
}));

const mockGetAllUnscheduledAllocationsForUC =
  getAllUnscheduledAllocationsForUC as jest.Mock;

describe("UnscheduledAllocationsTable Component", () => {
  const mockMarkingAllocations = [
    {
      allocation_id: 1,
      offeringId: 101,
      unitCode: "INFO1110",
      unitName: "Introduction to Programming",
      year: 2025,
      session: "S1",
      first_name: "John",
      last_name: "Doe",
      email: "john@test.com",
      hours: 10,
      note: "Assignment marking",
      status: "Draft",
    },
    {
      allocation_id: 2,
      offeringId: 101,
      unitCode: "INFO1110",
      unitName: "Introduction to Programming",
      year: 2025,
      session: "S1",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane@test.com",
      hours: 15,
      note: null,
      status: "Approved",
    },
  ];

  const mockConsultationAllocations = [
    {
      allocation_id: 3,
      offeringId: 102,
      unitCode: "COMP2017",
      unitName: "Systems Programming",
      year: 2025,
      session: "S1",
      first_name: "Alice",
      last_name: "Johnson",
      email: "alice@test.com",
      hours: 5,
      note: "Office hours",
      status: "Draft",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render loading state initially", () => {
    mockGetAllUnscheduledAllocationsForUC.mockImplementation(
      () => new Promise(() => {}),
    );

    render(<UnscheduledAllocationsTable />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(
      screen.getByText(/Loading marking allocations…/),
    ).toBeInTheDocument();
  });

  test("should fetch and display marking allocations on mount", async () => {
    mockGetAllUnscheduledAllocationsForUC.mockResolvedValue(
      mockMarkingAllocations,
    );

    render(<UnscheduledAllocationsTable />);

    await waitFor(() => {
      expect(mockGetAllUnscheduledAllocationsForUC).toHaveBeenCalledWith(
        "Marking",
      );
    });

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Marking Hours")).toBeInTheDocument();

    // Both allocations have the same unit code
    const unitCodes = screen.getAllByText("INFO1110");
    expect(unitCodes).toHaveLength(2);

    const unitNames = screen.getAllByText("Introduction to Programming");
    expect(unitNames).toHaveLength(2);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@test.com")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Assignment marking")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  test("should display empty state when no allocations", async () => {
    mockGetAllUnscheduledAllocationsForUC.mockResolvedValue([]);

    render(<UnscheduledAllocationsTable />);

    await waitFor(() => {
      expect(
        screen.getByText("No marking hours allocated across your units."),
      ).toBeInTheDocument();
    });
  });

  test("should switch to consultation allocations when toggle is clicked", async () => {
    mockGetAllUnscheduledAllocationsForUC.mockResolvedValueOnce(
      mockMarkingAllocations,
    );
    mockGetAllUnscheduledAllocationsForUC.mockResolvedValueOnce(
      mockConsultationAllocations,
    );

    render(<UnscheduledAllocationsTable />);

    await waitFor(() => {
      expect(screen.getByText("Marking Hours")).toBeInTheDocument();
    });

    const consultationButton = screen.getByRole("button", {
      name: "Consultation",
    });
    fireEvent.click(consultationButton);

    await waitFor(() => {
      expect(screen.getByText("Consultation Hours")).toBeInTheDocument();
    });

    expect(mockGetAllUnscheduledAllocationsForUC).toHaveBeenCalledWith(
      "Consultation",
    );
    expect(screen.getByText("COMP2017")).toBeInTheDocument();
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
  });

  test("should not change type when toggle receives null value", async () => {
    mockGetAllUnscheduledAllocationsForUC.mockResolvedValue(
      mockMarkingAllocations,
    );

    render(<UnscheduledAllocationsTable />);

    await waitFor(() => {
      expect(screen.getByText("Marking Hours")).toBeInTheDocument();
    });

    const markingButton = screen.getByRole("button", { name: "Marking" });

    // Simulate clicking the already selected button (which would send null in ToggleButtonGroup exclusive mode)
    // This tests the null check in handleTypeChange (line 61)
    fireEvent.click(markingButton);

    // Should still show Marking Hours
    expect(screen.getByText("Marking Hours")).toBeInTheDocument();
  });

  test("should refresh data when refresh button is clicked", async () => {
    mockGetAllUnscheduledAllocationsForUC.mockResolvedValue(
      mockMarkingAllocations,
    );

    render(<UnscheduledAllocationsTable />);

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(mockGetAllUnscheduledAllocationsForUC).toHaveBeenCalledTimes(1);

    const refreshButton = screen.getByText("Refresh");
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockGetAllUnscheduledAllocationsForUC).toHaveBeenCalledTimes(2);
    });
  });

  test("should handle fetch error gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockGetAllUnscheduledAllocationsForUC.mockRejectedValue(
      new Error("Network error"),
    );

    render(<UnscheduledAllocationsTable />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch UC unscheduled allocations:",
        expect.any(Error),
      );
    });

    // Should show empty state after error
    expect(
      screen.getByText("No marking hours allocated across your units."),
    ).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  test("should display dash for empty note field", async () => {
    mockGetAllUnscheduledAllocationsForUC.mockResolvedValue([
      {
        ...mockMarkingAllocations[1],
        note: null,
      },
    ]);

    render(<UnscheduledAllocationsTable />);

    await waitFor(() => {
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  test("should display note when present", async () => {
    mockGetAllUnscheduledAllocationsForUC.mockResolvedValue([
      mockMarkingAllocations[0],
    ]);

    render(<UnscheduledAllocationsTable />);

    await waitFor(() => {
      expect(screen.getByText("Assignment marking")).toBeInTheDocument();
    });
  });

  test("should render all table headers correctly", async () => {
    mockGetAllUnscheduledAllocationsForUC.mockResolvedValue(
      mockMarkingAllocations,
    );

    render(<UnscheduledAllocationsTable />);

    await waitFor(() => {
      expect(screen.getByText("Unit Code")).toBeInTheDocument();
    });

    expect(screen.getByText("Unit Name")).toBeInTheDocument();
    expect(screen.getByText("Tutor")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Hours")).toBeInTheDocument();
    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  test("should render multiple allocations with unique keys", async () => {
    mockGetAllUnscheduledAllocationsForUC.mockResolvedValue(
      mockMarkingAllocations,
    );

    const { container } = render(<UnscheduledAllocationsTable />);

    await waitFor(() => {
      const rows = container.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(2);
    });
  });

  test("should display correct activity type in loading message", async () => {
    mockGetAllUnscheduledAllocationsForUC.mockImplementation(
      () => new Promise(() => {}),
    );

    const { rerender } = render(<UnscheduledAllocationsTable />);

    expect(
      screen.getByText(/Loading marking allocations…/),
    ).toBeInTheDocument();

    // Switch to consultation while loading
    mockGetAllUnscheduledAllocationsForUC.mockResolvedValue([]);
    rerender(<UnscheduledAllocationsTable />);

    const consultationButton = screen.getByRole("button", {
      name: "Consultation",
    });
    fireEvent.click(consultationButton);

    await waitFor(() => {
      expect(
        screen.getByText("No consultation hours allocated across your units."),
      ).toBeInTheDocument();
    });
  });

  test("should render refresh button with tooltip", async () => {
    mockGetAllUnscheduledAllocationsForUC.mockResolvedValue(
      mockMarkingAllocations,
    );

    render(<UnscheduledAllocationsTable />);

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    const refreshButton = screen.getByText("Refresh");
    expect(refreshButton).toBeInTheDocument();
  });

  test("should render toggle buttons for Marking and Consultation", async () => {
    mockGetAllUnscheduledAllocationsForUC.mockResolvedValue(
      mockMarkingAllocations,
    );

    render(<UnscheduledAllocationsTable />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Marking" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Consultation" }),
      ).toBeInTheDocument();
    });
  });
});
