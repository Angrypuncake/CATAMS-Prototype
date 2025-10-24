import {
  pad2,
  toDisplayTime,
  toInputTime,
  fromInputTime,
  toInputDate,
  labelName,
  isoDateToDow,
  startOfWeekMonday,
  parseDateSafe,
  hoursFromTimes,
  weekKeyFor,
  activityKey,
  activityName,
  rowsToTimelineActivities,
} from "../../../app/admin/allocations/util";
import type { AllocationRow } from "../../../app/admin/allocations/types";

describe("Allocation Utility Functions", () => {
  describe("pad2", () => {
    test("should pad single digit numbers with leading zero", () => {
      expect(pad2(5)).toBe("05");
      expect(pad2(9)).toBe("09");
    });

    test("should not pad double digit numbers", () => {
      expect(pad2(10)).toBe("10");
      expect(pad2(23)).toBe("23");
    });

    test("should handle zero", () => {
      expect(pad2(0)).toBe("00");
    });
  });

  describe("toDisplayTime", () => {
    test("should convert 24-hour time to 12-hour AM format", () => {
      expect(toDisplayTime("09:30:00")).toBe("09:30 AM");
      expect(toDisplayTime("00:00:00")).toBe("12:00 AM");
      expect(toDisplayTime("01:15:00")).toBe("01:15 AM");
    });

    test("should convert 24-hour time to 12-hour PM format", () => {
      expect(toDisplayTime("13:45:00")).toBe("01:45 PM");
      expect(toDisplayTime("12:00:00")).toBe("12:00 PM");
      expect(toDisplayTime("23:59:00")).toBe("11:59 PM");
    });

    test("should return empty string for null", () => {
      expect(toDisplayTime(null)).toBe("");
    });
  });

  describe("toInputTime", () => {
    test("should convert time to HH:MM format", () => {
      expect(toInputTime("09:30:00")).toBe("09:30");
      expect(toInputTime("13:45:00")).toBe("13:45");
    });

    test("should return empty string for null", () => {
      expect(toInputTime(null)).toBe("");
    });
  });

  describe("fromInputTime", () => {
    test("should convert HH:MM to HH:MM:SS format", () => {
      expect(fromInputTime("09:30")).toBe("09:30:00");
      expect(fromInputTime("13:45")).toBe("13:45:00");
    });

    test("should pad single digit hours and minutes", () => {
      expect(fromInputTime("9:5")).toBe("09:05:00");
    });

    test("should return null for empty string", () => {
      expect(fromInputTime("")).toBeNull();
    });
  });

  describe("toInputDate", () => {
    test("should extract date portion from ISO string", () => {
      expect(toInputDate("2025-03-15T10:00:00")).toBe("2025-03-15");
      expect(toInputDate("2025-12-31T23:59:59")).toBe("2025-12-31");
    });

    test("should handle date-only strings", () => {
      expect(toInputDate("2025-03-15")).toBe("2025-03-15");
    });

    test("should return empty string for null", () => {
      expect(toInputDate(null)).toBe("");
    });
  });

  describe("labelName", () => {
    test("should combine first and last name", () => {
      expect(labelName({ first_name: "John", last_name: "Doe" })).toBe(
        "John Doe",
      );
    });

    test("should handle missing first name", () => {
      expect(labelName({ first_name: null, last_name: "Doe" })).toBe("Doe");
    });

    test("should handle missing last name", () => {
      expect(labelName({ first_name: "John", last_name: null })).toBe("John");
    });

    test("should return dash for both names missing", () => {
      expect(labelName({ first_name: null, last_name: null })).toBe("—");
    });
  });

  describe("isoDateToDow", () => {
    test("should convert ISO date to day of week", () => {
      expect(isoDateToDow("2025-03-17")).toBe("Mon");
      expect(isoDateToDow("2025-03-18")).toBe("Tue");
      expect(isoDateToDow("2025-03-19")).toBe("Wed");
      expect(isoDateToDow("2025-03-20")).toBe("Thu");
      expect(isoDateToDow("2025-03-21")).toBe("Fri");
      expect(isoDateToDow("2025-03-22")).toBe("Sat");
      expect(isoDateToDow("2025-03-23")).toBe("Sun");
    });

    test("should handle date with time portion", () => {
      expect(isoDateToDow("2025-03-17T10:00:00")).toBe("Mon");
    });

    test("should return empty string for null", () => {
      expect(isoDateToDow(null)).toBe("");
    });

    test("should return empty string for undefined", () => {
      expect(isoDateToDow(undefined)).toBe("");
    });
  });

  describe("startOfWeekMonday", () => {
    test("should return Monday of the week for a Wednesday", () => {
      const wed = new Date(2025, 2, 19); // Wednesday, March 19, 2025 (month is 0-indexed)
      const monday = startOfWeekMonday(wed);
      expect(monday.getFullYear()).toBe(2025);
      expect(monday.getMonth()).toBe(2); // March
      expect(monday.getDate()).toBe(17);
    });

    test("should return same date if already Monday", () => {
      const mon = new Date(2025, 2, 17); // Monday, March 17, 2025
      const monday = startOfWeekMonday(mon);
      expect(monday.getFullYear()).toBe(2025);
      expect(monday.getMonth()).toBe(2);
      expect(monday.getDate()).toBe(17);
    });

    test("should handle Sunday (go back to previous Monday)", () => {
      const sun = new Date(2025, 2, 23); // Sunday, March 23, 2025
      const monday = startOfWeekMonday(sun);
      expect(monday.getFullYear()).toBe(2025);
      expect(monday.getMonth()).toBe(2);
      expect(monday.getDate()).toBe(17);
    });

    test("should reset time to midnight", () => {
      const date = new Date(2025, 2, 19, 15, 30, 45);
      const monday = startOfWeekMonday(date);
      expect(monday.getHours()).toBe(0);
      expect(monday.getMinutes()).toBe(0);
      expect(monday.getSeconds()).toBe(0);
      expect(monday.getMilliseconds()).toBe(0);
    });
  });

  describe("parseDateSafe", () => {
    test("should parse valid ISO date string", () => {
      const result = parseDateSafe("2025-03-15");
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString().substring(0, 10)).toBe("2025-03-15");
    });

    test("should parse ISO datetime string", () => {
      const result = parseDateSafe("2025-03-15T10:30:00");
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString().substring(0, 10)).toBe("2025-03-15");
    });

    test("should return null for invalid date", () => {
      expect(parseDateSafe("invalid-date")).toBeNull();
      expect(parseDateSafe("2025-13-45")).toBeNull();
    });

    test("should return null for null input", () => {
      expect(parseDateSafe(null)).toBeNull();
    });
  });

  describe("hoursFromTimes", () => {
    test("should calculate hours between start and end times", () => {
      expect(hoursFromTimes("09:00:00", "11:00:00")).toBe(2);
      expect(hoursFromTimes("10:30:00", "12:30:00")).toBe(2);
    });

    test("should handle fractional hours", () => {
      expect(hoursFromTimes("09:00:00", "10:30:00")).toBe(1.5);
      expect(hoursFromTimes("09:15:00", "10:45:00")).toBe(1.5);
    });

    test("should return 2 as default if start time is null", () => {
      expect(hoursFromTimes(null, "11:00:00")).toBe(2);
    });

    test("should return 2 as default if end time is null", () => {
      expect(hoursFromTimes("09:00:00", null)).toBe(2);
    });

    test("should return 2 as default if both times are null", () => {
      expect(hoursFromTimes(null, null)).toBe(2);
    });
  });

  describe("weekKeyFor", () => {
    test("should return W0 for date in first week", () => {
      const termStart = new Date(2025, 2, 17); // March 17, 2025 (Monday)
      const date = new Date(2025, 2, 19); // March 19, 2025 (Wednesday)
      expect(weekKeyFor(date, termStart)).toBe("W0");
    });

    test("should return W1 for date in second week", () => {
      const termStart = new Date(2025, 2, 17); // March 17, 2025
      const date = new Date(2025, 2, 24); // March 24, 2025 (7 days later)
      expect(weekKeyFor(date, termStart)).toBe("W1");
    });

    test("should return W2 for date in third week", () => {
      const termStart = new Date(2025, 2, 17);
      const date = new Date(2025, 2, 31); // March 31, 2025 (14 days later)
      expect(weekKeyFor(date, termStart)).toBe("W2");
    });

    test("should handle dates exactly on week boundaries", () => {
      const termStart = new Date(2025, 2, 17);
      const weekLater = new Date(2025, 2, 24);
      expect(weekKeyFor(weekLater, termStart)).toBe("W1");
    });
  });

  describe("activityKey", () => {
    test("should combine unit code, activity type, and activity name", () => {
      const row = {
        unit_code: "INFO1110",
        activity_type: "Tutorial",
        activity_name: "Week 5",
      } as AllocationRow;
      expect(activityKey(row)).toBe("INFO1110 • Tutorial • Week 5");
    });

    test("should handle missing unit code", () => {
      const row = {
        unit_code: null,
        activity_type: "Tutorial",
        activity_name: "Week 5",
      } as AllocationRow;
      expect(activityKey(row)).toBe("Tutorial • Week 5");
    });

    test("should handle missing activity type", () => {
      const row = {
        unit_code: "INFO1110",
        activity_type: null,
        activity_name: "Week 5",
      } as AllocationRow;
      expect(activityKey(row)).toBe("INFO1110 • Week 5");
    });

    test("should handle missing activity name", () => {
      const row = {
        unit_code: "INFO1110",
        activity_type: "Tutorial",
        activity_name: null,
      } as AllocationRow;
      expect(activityKey(row)).toBe("INFO1110 • Tutorial");
    });

    test("should return empty string for all null values", () => {
      const row = {
        unit_code: null,
        activity_type: null,
        activity_name: null,
      } as AllocationRow;
      expect(activityKey(row)).toBe("");
    });
  });

  describe("activityName", () => {
    test("should combine unit code and activity name", () => {
      const row = {
        unit_code: "INFO1110",
        activity_name: "Week 5",
        activity_type: "Tutorial",
      } as AllocationRow;
      expect(activityName(row)).toBe("INFO1110 – Week 5");
    });

    test("should use activity type if activity name is missing", () => {
      const row = {
        unit_code: "INFO1110",
        activity_name: null,
        activity_type: "Tutorial",
      } as AllocationRow;
      expect(activityName(row)).toBe("INFO1110 – Tutorial");
    });

    test("should use 'Activity' as fallback if both name and type are missing", () => {
      const row = {
        unit_code: "INFO1110",
        activity_name: null,
        activity_type: null,
      } as AllocationRow;
      expect(activityName(row)).toBe("INFO1110 – Activity");
    });

    test("should handle missing unit code", () => {
      const row = {
        unit_code: null,
        activity_name: "Week 5",
        activity_type: "Tutorial",
      } as AllocationRow;
      expect(activityName(row)).toBe("Week 5");
    });
  });

  describe("rowsToTimelineActivities", () => {
    const termStart = new Date(2025, 2, 17); // March 17, 2025
    const opts = { termStart, termLabel: "Term 1 2025" };

    test("should convert scheduled rows to timeline activities", () => {
      const rows: AllocationRow[] = [
        {
          id: 1,
          mode: "scheduled",
          session_date: "2025-03-19",
          unit_code: "INFO1110",
          activity_type: "Tutorial",
          activity_name: "Week 1",
          first_name: "John",
          last_name: "Doe",
          start_at: "10:00:00",
          end_at: "12:00:00",
          teaching_role: "Tutor",
          location: "Room 101",
          paycode_id: "CASUAL",
        } as AllocationRow,
      ];

      const result = rowsToTimelineActivities(rows, opts);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("INFO1110 • Tutorial • Week 1");
      expect(result[0].name).toBe("INFO1110 – Week 1");
      expect(result[0].activityType).toBe("Tutorial");
      expect(result[0].paycode).toBe("CASUAL");
    });

    test("should skip unscheduled rows", () => {
      const rows: AllocationRow[] = [
        {
          id: 1,
          mode: "unscheduled",
          session_date: null,
          unit_code: "INFO1110",
        } as AllocationRow,
      ];

      const result = rowsToTimelineActivities(rows, opts);
      expect(result).toHaveLength(0);
    });

    test("should treat rows with null mode and session_date as scheduled", () => {
      const rows: AllocationRow[] = [
        {
          id: 1,
          mode: null,
          session_date: "2025-03-19",
          unit_code: "INFO1110",
          activity_name: "Week 1",
          first_name: "Jane",
          last_name: "Smith",
          start_at: "14:00:00",
          end_at: "16:00:00",
        } as AllocationRow,
      ];

      const result = rowsToTimelineActivities(rows, opts);
      expect(result).toHaveLength(1);
    });

    test("should skip rows with invalid dates", () => {
      const rows: AllocationRow[] = [
        {
          id: 1,
          mode: "scheduled",
          session_date: "invalid-date",
          unit_code: "INFO1110",
        } as AllocationRow,
      ];

      const result = rowsToTimelineActivities(rows, opts);
      expect(result).toHaveLength(0);
    });

    test("should group multiple rows by activity key", () => {
      const rows: AllocationRow[] = [
        {
          id: 1,
          mode: "scheduled",
          session_date: "2025-03-19",
          unit_code: "INFO1110",
          activity_type: "Tutorial",
          activity_name: "Week 1",
          first_name: "John",
          last_name: "Doe",
          start_at: "10:00:00",
          end_at: "12:00:00",
        } as AllocationRow,
        {
          id: 2,
          mode: "scheduled",
          session_date: "2025-03-26",
          unit_code: "INFO1110",
          activity_type: "Tutorial",
          activity_name: "Week 1",
          first_name: "Jane",
          last_name: "Smith",
          start_at: "10:00:00",
          end_at: "12:00:00",
        } as AllocationRow,
      ];

      const result = rowsToTimelineActivities(rows, opts);

      expect(result).toHaveLength(1);
      expect(result[0].allocations["W0"]).toBeDefined();
      expect(result[0].allocations["W1"]).toBeDefined();
    });

    test("should handle multiple tutors in same week (array allocation)", () => {
      const rows: AllocationRow[] = [
        {
          id: 1,
          mode: "scheduled",
          session_date: "2025-03-19",
          unit_code: "INFO1110",
          activity_name: "Week 1",
          first_name: "John",
          last_name: "Doe",
          start_at: "10:00:00",
          end_at: "12:00:00",
        } as AllocationRow,
        {
          id: 2,
          mode: "scheduled",
          session_date: "2025-03-19",
          unit_code: "INFO1110",
          activity_name: "Week 1",
          first_name: "Jane",
          last_name: "Smith",
          start_at: "14:00:00",
          end_at: "16:00:00",
        } as AllocationRow,
      ];

      const result = rowsToTimelineActivities(rows, opts);

      expect(result).toHaveLength(1);
      expect(Array.isArray(result[0].allocations["W0"])).toBe(true);
      expect(result[0].allocations["W0"]).toHaveLength(2);
      expect(result[0].allocations["W0"][0].tutor).toBe("John Doe");
      expect(result[0].allocations["W0"][1].tutor).toBe("Jane Smith");
    });

    test("should use row id as fallback when activity key is empty", () => {
      const rows: AllocationRow[] = [
        {
          id: 123,
          mode: "scheduled",
          session_date: "2025-03-19",
          unit_code: null,
          activity_type: null,
          activity_name: null,
          first_name: "John",
          last_name: "Doe",
          start_at: "10:00:00",
          end_at: "12:00:00",
        } as AllocationRow,
      ];

      const result = rowsToTimelineActivities(rows, opts);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("123");
    });

    test("should include teaching role and notes in cell allocation", () => {
      const rows: AllocationRow[] = [
        {
          id: 1,
          mode: "scheduled",
          session_date: "2025-03-19",
          unit_code: "INFO1110",
          activity_name: "Week 1",
          first_name: "John",
          last_name: "Doe",
          start_at: "10:00:00",
          end_at: "12:00:00",
          teaching_role: "Lead Tutor",
          location: "Room 101",
        } as AllocationRow,
      ];

      const result = rowsToTimelineActivities(rows, opts);

      expect(result[0].allocations["W0"][0].role).toBe("Lead Tutor");
      expect(result[0].allocations["W0"][0].notes).toBe("Room 101");
    });

    test("should use note field if location is missing", () => {
      const rows: AllocationRow[] = [
        {
          id: 1,
          mode: "scheduled",
          session_date: "2025-03-19",
          unit_code: "INFO1110",
          activity_name: "Week 1",
          first_name: "John",
          last_name: "Doe",
          start_at: "10:00:00",
          end_at: "12:00:00",
          location: null,
          note: "Special session",
        } as AllocationRow,
      ];

      const result = rowsToTimelineActivities(rows, opts);

      expect(result[0].allocations["W0"][0].notes).toBe("Special session");
    });

    test("should return empty array for empty input", () => {
      const result = rowsToTimelineActivities([], opts);
      expect(result).toHaveLength(0);
    });
  });
});
