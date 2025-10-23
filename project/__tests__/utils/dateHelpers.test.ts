import { getCurrentYearAndSession } from "../../app/utils/dateHelpers";

describe("dateHelpers", () => {
  describe("getCurrentYearAndSession", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("should return S1 for January", () => {
      jest.setSystemTime(new Date(2025, 0, 15)); // January 15, 2025

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2025);
      expect(result.session).toBe("S1");
    });

    test("should return S1 for February", () => {
      jest.setSystemTime(new Date(2025, 1, 20)); // February 20, 2025

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2025);
      expect(result.session).toBe("S1");
    });

    test("should return S1 for March", () => {
      jest.setSystemTime(new Date(2025, 2, 10)); // March 10, 2025

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2025);
      expect(result.session).toBe("S1");
    });

    test("should return S1 for April", () => {
      jest.setSystemTime(new Date(2025, 3, 5)); // April 5, 2025

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2025);
      expect(result.session).toBe("S1");
    });

    test("should return S1 for May", () => {
      jest.setSystemTime(new Date(2025, 4, 25)); // May 25, 2025

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2025);
      expect(result.session).toBe("S1");
    });

    test("should return S1 for June (boundary)", () => {
      jest.setSystemTime(new Date(2025, 5, 30)); // June 30, 2025

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2025);
      expect(result.session).toBe("S1");
    });

    test("should return S2 for July (boundary)", () => {
      jest.setSystemTime(new Date(2025, 6, 1)); // July 1, 2025

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2025);
      expect(result.session).toBe("S2");
    });

    test("should return S2 for August", () => {
      jest.setSystemTime(new Date(2025, 7, 15)); // August 15, 2025

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2025);
      expect(result.session).toBe("S2");
    });

    test("should return S2 for September", () => {
      jest.setSystemTime(new Date(2025, 8, 20)); // September 20, 2025

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2025);
      expect(result.session).toBe("S2");
    });

    test("should return S2 for October", () => {
      jest.setSystemTime(new Date(2025, 9, 10)); // October 10, 2025

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2025);
      expect(result.session).toBe("S2");
    });

    test("should return S2 for November", () => {
      jest.setSystemTime(new Date(2025, 10, 5)); // November 5, 2025

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2025);
      expect(result.session).toBe("S2");
    });

    test("should return S2 for December", () => {
      jest.setSystemTime(new Date(2025, 11, 31)); // December 31, 2025

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2025);
      expect(result.session).toBe("S2");
    });

    test("should work for different years", () => {
      jest.setSystemTime(new Date(2024, 2, 15)); // March 15, 2024

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2024);
      expect(result.session).toBe("S1");
    });

    test("should work for year boundary in S1", () => {
      jest.setSystemTime(new Date(2026, 0, 1)); // January 1, 2026

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2026);
      expect(result.session).toBe("S1");
    });

    test("should work for year boundary in S2", () => {
      jest.setSystemTime(new Date(2024, 11, 31)); // December 31, 2024

      const result = getCurrentYearAndSession();

      expect(result.year).toBe(2024);
      expect(result.session).toBe("S2");
    });
  });
});
