/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import SwapReview, {
  formatDate,
} from "../../../app/dashboard/review/[id]/_components/SwapReview";
import type { TutorRequest } from "../../../app/_types/request";

// ---- Mock dependencies ----
jest.mock("@/app/services/allocationService", () => ({
  getAllocationById: jest.fn(),
  getAllocationsByUnitAndActivityType: jest.fn(),
}));

jest.mock("@/app/services/userService", () => ({
  getTutorById: jest.fn(),
}));

// Mock MUI CircularProgress (so test doesn't hang on animation)
jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  const MockCircularProgress = () => <div data-testid="progress">Loading</div>;
  MockCircularProgress.displayName = "MockCircularProgress";
  return {
    ...actual,
    CircularProgress: MockCircularProgress,
  };
});

// Silence console logs to keep output clean
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

import {
  getAllocationById,
  getAllocationsByUnitAndActivityType,
} from "@/app/services/allocationService";
import { getTutorById } from "@/app/services/userService";

const mockAlloc = {
  id: 1,
  unit_code: "COMP1000",
  unit_name: "Software Construction",
  activity_type: "Lab",
  session_date: "2025-05-01",
  start_at: "09:00",
  end_at: "11:00",
  location: "K17-203",
  hours: 2,
  activity_name: "Lab 1",
  note: "Bring laptop",
};

const mockTutor = {
  user_id: 123,
  first_name: "Jane",
  last_name: "Doe",
  email: "jane@example.com",
  units: ["COMP1000"],
};

describe("formatDate()", () => {
  it("returns formatted AU date", () => {
    expect(formatDate("2025-01-01T00:00:00Z")).toMatch(/2025/);
  });
  it("returns '—' if null/undefined", () => {
    expect(formatDate(null)).toBe("—");
  });
  it("returns 'Invalid date' for bad input", () => {
    expect(formatDate("bad-date")).toBe("Invalid date");
  });
});

describe("SwapReview component", () => {
  const baseData: TutorRequest = {
    allocationId: 1,
    requestStatus: "pending",
    requestId: 9,
    createdAt: "2025-01-02T00:00:00Z",
    requesterId: 321,
    requestType: "swap",
    requestDate: "2025-01-02",
    reviewerId: 1,
    requestReason: null,
    updatedAt: "2025-01-02T00:00:00Z",
    details: { suggested_tutor_id: 123 },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (getAllocationById as jest.Mock).mockResolvedValue(mockAlloc);
    (getAllocationsByUnitAndActivityType as jest.Mock).mockResolvedValue([
      {
        ...mockAlloc,
        id: 999,
        user_id: 7,
        first_name: "Alex",
        last_name: "Smith",
      },
    ]);
    (getTutorById as jest.Mock).mockResolvedValue(mockTutor);
  });

  it("renders nothing if requestType != swap", () => {
    const otherData: TutorRequest = {
      ...baseData,
      requestType: "claim",
      details: { hours: 2, paycode: "CASUAL" },
    };
    const { container } = render(<SwapReview data={otherData} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders loading state and then eligible table", async () => {
    render(<SwapReview data={baseData} />);
    expect(screen.getByTestId("progress")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("Eligible Allocations for Swap"),
      ).toBeInTheDocument();
    });

    // Table row text
    expect(screen.getByText("Alex Smith")).toBeInTheDocument();

    // select allocation
    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    expect(screen.getByText("Selected")).toBeInTheDocument();

    // Swap summary now visible
    expect(screen.getByText(/Swap Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Heads-up/i)).toBeInTheDocument();

    // Update comment text field
    const commentField = screen.getByRole("textbox");
    fireEvent.change(commentField, { target: { value: "Looks good" } });
    expect(commentField).toHaveValue("Looks good");

    // Click approve / reject
    fireEvent.click(screen.getByRole("button", { name: /Approve/i }));
    fireEvent.click(screen.getByRole("button", { name: /Reject/i }));

    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/Approving swap/i),
      expect.any(Object),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/Rejecting swap/i),
      expect.any(Object),
    );
  });

  it("handles no eligible allocations found", async () => {
    (getAllocationsByUnitAndActivityType as jest.Mock).mockResolvedValueOnce(
      [],
    );
    render(<SwapReview data={baseData} />);
    await waitFor(() => {
      expect(
        screen.getByText("No eligible allocations found"),
      ).toBeInTheDocument();
    });
  });

  it("handles fetch error gracefully", async () => {
    (getAllocationById as jest.Mock).mockRejectedValueOnce(new Error("fail"));
    render(<SwapReview data={baseData} />);
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  it("alert appears if approving without selection", async () => {
    window.alert = jest.fn();
    (getAllocationsByUnitAndActivityType as jest.Mock).mockResolvedValueOnce(
      [],
    );
    render(<SwapReview data={baseData} />);
    await waitFor(() =>
      expect(screen.queryByTestId("progress")).not.toBeInTheDocument(),
    );
    // Approve without selecting
    fireEvent.click(screen.getByRole("button", { name: /Approve/i }));
    expect(window.alert).toHaveBeenCalledWith(
      "Please select an allocation first.",
    );
  });
});
