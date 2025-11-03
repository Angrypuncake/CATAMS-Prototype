import { mapLegacyStatus, type SimplifiedStatus } from "../../app/utils/statusMapper";

describe("statusMapper", () => {
  describe("mapLegacyStatus", () => {
    describe("Approved status mappings", () => {
      test('should map "approved allocation" to Approved', () => {
        expect(mapLegacyStatus("approved allocation")).toBe("Approved");
      });

      test('should map "Approved Allocation" (case insensitive) to Approved', () => {
        expect(mapLegacyStatus("Approved Allocation")).toBe("Approved");
      });

      test('should map "APPROVED ALLOCATION" (uppercase) to Approved', () => {
        expect(mapLegacyStatus("APPROVED ALLOCATION")).toBe("Approved");
      });

      test('should map "variation complete" to Approved', () => {
        expect(mapLegacyStatus("variation complete")).toBe("Approved");
      });

      test('should map "Variation Complete" (case insensitive) to Approved', () => {
        expect(mapLegacyStatus("Variation Complete")).toBe("Approved");
      });
    });

    describe("Draft status mappings", () => {
      test('should map "hours for approval" to Draft', () => {
        expect(mapLegacyStatus("hours for approval")).toBe("Draft");
      });

      test('should map "Hours For Approval" (case insensitive) to Draft', () => {
        expect(mapLegacyStatus("Hours For Approval")).toBe("Draft");
      });

      test('should map "hours for review" to Draft', () => {
        expect(mapLegacyStatus("hours for review")).toBe("Draft");
      });

      test('should map "Hours For Review" (case insensitive) to Draft', () => {
        expect(mapLegacyStatus("Hours For Review")).toBe("Draft");
      });

      test('should map "draft casual" to Draft', () => {
        expect(mapLegacyStatus("draft casual")).toBe("Draft");
      });

      test('should map "Draft Casual" (case insensitive) to Draft', () => {
        expect(mapLegacyStatus("Draft Casual")).toBe("Draft");
      });
    });

    describe("Cancelled status mappings", () => {
      test('should map "rejected by approval" to Cancelled', () => {
        expect(mapLegacyStatus("rejected by approval")).toBe("Cancelled");
      });

      test('should map "Rejected By Approval" (case insensitive) to Cancelled', () => {
        expect(mapLegacyStatus("Rejected By Approval")).toBe("Cancelled");
      });

      test('should map "ignore class" to Cancelled', () => {
        expect(mapLegacyStatus("ignore class")).toBe("Cancelled");
      });

      test('should map "Ignore Class" (case insensitive) to Cancelled', () => {
        expect(mapLegacyStatus("Ignore Class")).toBe("Cancelled");
      });

      test('should map "academic staff" to Cancelled (non-claimable)', () => {
        expect(mapLegacyStatus("academic staff")).toBe("Cancelled");
      });

      test('should map "Academic Staff" (case insensitive) to Cancelled', () => {
        expect(mapLegacyStatus("Academic Staff")).toBe("Cancelled");
      });
    });

    describe("Fallback to Draft", () => {
      test("should return Draft for null input", () => {
        expect(mapLegacyStatus(null)).toBe("Draft");
      });

      test("should return Draft for undefined input", () => {
        expect(mapLegacyStatus(undefined)).toBe("Draft");
      });

      test("should return Draft for empty string", () => {
        expect(mapLegacyStatus("")).toBe("Draft");
      });

      test("should return Draft for unknown status", () => {
        expect(mapLegacyStatus("unknown status")).toBe("Draft");
      });

      test("should return Draft for random text", () => {
        expect(mapLegacyStatus("random text")).toBe("Draft");
      });

      test("should return Draft for unrecognized legacy status", () => {
        expect(mapLegacyStatus("pending review")).toBe("Draft");
      });
    });

    describe("Edge cases", () => {
      test("should not trim whitespace (function does exact lowercase match)", () => {
        // The function does not trim, so extra whitespace causes fallback to Draft
        expect(mapLegacyStatus("  approved allocation  ")).toBe("Draft");
      });

      test("should handle mixed case variations", () => {
        expect(mapLegacyStatus("VaRiAtIoN CoMpLeTe")).toBe("Approved");
      });

      test("should handle status with different casing patterns", () => {
        expect(mapLegacyStatus("HOURS FOR APPROVAL")).toBe("Draft");
        expect(mapLegacyStatus("REJECTED BY APPROVAL")).toBe("Cancelled");
      });

      test("should handle exact match with proper casing", () => {
        expect(mapLegacyStatus("approved allocation")).toBe("Approved");
        expect(mapLegacyStatus("hours for approval")).toBe("Draft");
        expect(mapLegacyStatus("rejected by approval")).toBe("Cancelled");
      });
    });

    describe("Type safety", () => {
      test("should return valid SimplifiedStatus type", () => {
        const statuses: SimplifiedStatus[] = ["Draft", "Approved", "Claimed", "Cancelled"];
        const result = mapLegacyStatus("approved allocation");

        expect(statuses).toContain(result);
      });
    });
  });
});
