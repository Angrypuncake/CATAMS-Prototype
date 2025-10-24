import {
  timeConverter,
  hoursBetween,
  toDate,
  niceTime,
  mapToRequestRow,
} from "../../app/dashboard/tutor/utils";
import type { RequestRow } from "@/app/_types/request";

describe("timeConverter", () => {
  test("converts valid HH:MM string to total minutes", () => {
    expect(timeConverter("00:00")).toBe(0);
    expect(timeConverter("01:30")).toBe(90);
    expect(timeConverter("23:59")).toBe(23 * 60 + 59);
  });
});

describe("hoursBetween", () => {
  test("returns 0 if start or end missing", () => {
    expect(hoursBetween(null, "10:00:00")).toBe(0);
    expect(hoursBetween("09:00:00", null)).toBe(0);
  });

  test("calculates correct positive difference", () => {
    expect(hoursBetween("09:00:00", "11:00:00")).toBe(2);
  });

  test("wraps around midnight correctly", () => {
    expect(hoursBetween("23:00:00", "01:00:00")).toBe(2);
  });

  test("handles seconds and fractional hours", () => {
    expect(hoursBetween("10:00:00", "10:30:00")).toBe(0.5);
  });
});

describe("toDate", () => {
  test("returns null if dateStr missing or invalid", () => {
    expect(toDate(undefined)).toBeNull();
    expect(toDate("invalid-date")).toBeNull();
  });

  test("creates valid date without time", () => {
    const d = toDate("2024-05-01");
    expect(d).toBeInstanceOf(Date);
  });

  test("creates valid date with time and sets UTC hours", () => {
    const d = toDate("2024-05-01", "12:30:15");
    expect(d?.getUTCHours()).toBe(12);
    expect(d?.getUTCMinutes()).toBe(30);
    expect(d?.getUTCSeconds()).toBe(15);
  });
});

describe("niceTime", () => {
  test("returns '—' if input is null or undefined", () => {
    expect(niceTime(null)).toBe("—");
    expect(niceTime(undefined)).toBe("—");
  });

  test("extracts HH:MM from ISO datetime string", () => {
    expect(niceTime("2025-01-01T08:45:00Z")).toBe("08:45");
  });

  test("extracts HH:MM from plain HH:MM:SS string", () => {
    expect(niceTime("07:30:59")).toBe("07:30");
  });
});

describe("mapToRequestRow + formatStatus", () => {
  const base: RequestRow = {
    requestId: 1,
    type: "claim",
    relatedSession: "Session A",
    status: "pending_uc",
    actions: "",
    reason: "some reason",
    createdAt: "today",
  };

  test("maps all properties and formats 'pending_uc'", () => {
    const mapped = mapToRequestRow({ ...base, status: "pending_uc" });
    expect(mapped.status).toBe("Pending (Unit Coordinator)");
    expect(mapped.actions).toBe("View/Edit");
  });

  test("formats 'pending_ta'", () => {
    const mapped = mapToRequestRow({ ...base, status: "pending_ta" });
    expect(mapped.status).toBe("Pending (Teaching Assistant)");
  });

  test("formats 'approved'", () => {
    const mapped = mapToRequestRow({ ...base, status: "approved" });
    expect(mapped.status).toBe("Approved");
  });

  test("formats 'rejected'", () => {
    const mapped = mapToRequestRow({ ...base, status: "rejected" });
    expect(mapped.status).toBe("Rejected");
  });

  test("returns original string for unknown status", () => {
    const mapped = mapToRequestRow({ ...base, status: "weird_status" });
    expect(mapped.status).toBe("weird_status");
  });
});
