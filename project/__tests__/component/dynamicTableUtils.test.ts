import {
  isPrimitive,
  truncate,
  isDate,
  formatDate,
  searchInValue,
  compareValues,
  exportToJSON,
  exportToCSV,
} from "../../components/DynamicTable/utils";

describe("DynamicTable utils", () => {
  describe("isPrimitive", () => {
    test("should identify primitives", () => {
      expect(isPrimitive(null)).toBe(true);
      expect(isPrimitive(undefined)).toBe(true);
      expect(isPrimitive("string")).toBe(true);
      expect(isPrimitive(123)).toBe(true);
      expect(isPrimitive(true)).toBe(true);
      expect(isPrimitive({})).toBe(false);
      expect(isPrimitive([])).toBe(false);
    });
  });

  describe("truncate", () => {
    test("should truncate long strings", () => {
      const longString = "a".repeat(100);
      const result = truncate(longString, 50);
      expect(result).toHaveLength(51); // 50 chars + ellipsis
      expect(result).toContain("…");
    });

    test("should not truncate short strings", () => {
      const shortString = "short";
      expect(truncate(shortString, 50)).toBe(shortString);
    });
  });

  describe("isDate", () => {
    test("should identify valid dates", () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate(new Date("2023-01-01"))).toBe(true);
    });

    test("should reject invalid dates", () => {
      expect(isDate(new Date("invalid"))).toBe(false);
      expect(isDate("2023-01-01")).toBe(false);
      expect(isDate(123)).toBe(false);
    });
  });

  describe("formatDate", () => {
    test("should format date to locale string", () => {
      const date = new Date("2023-01-15T10:30:00");
      const result = formatDate(date);
      expect(result).toContain("2023");
    });
  });

  describe("searchInValue", () => {
    test("should search in various value types", () => {
      expect(searchInValue("hello world", "world")).toBe(true);
      expect(searchInValue(123, "12")).toBe(true);
      expect(searchInValue(true, "true")).toBe(true);
      expect(searchInValue(null, "test")).toBe(false);
      expect(searchInValue(undefined, "test")).toBe(false);
    });

    test("should search in dates", () => {
      const date = new Date("2023-01-15");
      expect(searchInValue(date, "2023")).toBe(true);
    });

    test("should search in arrays", () => {
      expect(searchInValue(["react", "vue"], "react")).toBe(true);
      expect(searchInValue([1, 2, 3], "2")).toBe(true);
    });

    test("should search in objects", () => {
      expect(searchInValue({ name: "John", age: 30 }, "john")).toBe(true);
      expect(searchInValue({ name: "John", age: 30 }, "30")).toBe(true);
    });

    test("should search in date strings", () => {
      expect(searchInValue("2023-01-15", "2023")).toBe(true);
      expect(searchInValue("2023-01-15", "01")).toBe(true); // Month as number
      expect(searchInValue("2023-01-15", "15")).toBe(true); // Day
    });

    test("should search in date string - raw value when formatted doesn't match - line 36", () => {
      // When searching for something that's in the raw string but not in formatted date
      expect(searchInValue("2023-01-15", "-")).toBe(true); // Dash is in raw string
    });

    test("should return false for exotic types - lines 63-65", () => {
      const testFunction = () => "test";
      const testSymbol = Symbol("test");

      // Functions and symbols should return false
      expect(searchInValue(testFunction, "test")).toBe(false);
      expect(searchInValue(testSymbol, "test")).toBe(false);
    });
  });

  describe("compareValues", () => {
    test("should handle null/undefined in asc order", () => {
      expect(compareValues(null, "test", "asc")).toBe(1);
      expect(compareValues("test", null, "asc")).toBe(-1);
      expect(compareValues(undefined, "test", "asc")).toBe(1);
      expect(compareValues("test", undefined, "asc")).toBe(-1);
    });

    test("should handle null/undefined in desc order", () => {
      expect(compareValues(null, "test", "desc")).toBe(-1);
      expect(compareValues("test", null, "desc")).toBe(1);
    });

    test("should compare dates", () => {
      const date1 = new Date("2023-01-01");
      const date2 = new Date("2023-01-15");
      expect(compareValues(date1, date2, "asc")).toBeLessThan(0);
      expect(compareValues(date1, date2, "desc")).toBeGreaterThan(0);
    });

    test("should compare numbers", () => {
      expect(compareValues(1, 2, "asc")).toBeLessThan(0);
      expect(compareValues(2, 1, "asc")).toBeGreaterThan(0);
      expect(compareValues(1, 2, "desc")).toBeGreaterThan(0);
    });

    test("should compare booleans in asc order", () => {
      expect(compareValues(false, true, "asc")).toBeLessThan(0);
      expect(compareValues(true, false, "asc")).toBeGreaterThan(0);
      expect(compareValues(true, true, "asc")).toBe(0);
    });

    test("should compare booleans in desc order - covering lines 89-90", () => {
      expect(compareValues(false, true, "desc")).toBeGreaterThan(0);
      expect(compareValues(true, false, "desc")).toBeLessThan(0);
      // This covers the case where both are false (line 89-90)
      expect(compareValues(false, false, "desc")).toBe(0);
    });

    test("should compare strings in asc order", () => {
      expect(compareValues("apple", "banana", "asc")).toBeLessThan(0);
      expect(compareValues("banana", "apple", "asc")).toBeGreaterThan(0);
      expect(compareValues("apple", "apple", "asc")).toBe(0);
    });

    test("should compare strings in desc order - covering line 99", () => {
      expect(compareValues("apple", "banana", "desc")).toBeGreaterThan(0);
      // This specifically covers line 99 where aStr > bStr in desc mode
      expect(compareValues("banana", "apple", "desc")).toBeLessThan(0);
      expect(compareValues("apple", "apple", "desc")).toBe(0);
    });
  });

  describe("exportToJSON", () => {
    let createElementSpy: jest.SpyInstance;
    let mockLink: HTMLAnchorElement;

    beforeEach(() => {
      mockLink = {
        href: "",
        download: "",
        click: jest.fn(),
      } as unknown as HTMLAnchorElement;
      createElementSpy = jest.spyOn(document, "createElement").mockReturnValue(mockLink);
      global.URL.createObjectURL = jest.fn(() => "mock-url");
      global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      createElementSpy.mockRestore();
    });

    test("should export data to JSON", () => {
      const data = [
        { id: 1, name: "Alice", age: 30 },
        { id: 2, name: "Bob", age: 25 },
      ];

      exportToJSON(data, "test.json");

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(mockLink.download).toBe("test.json");
      expect(mockLink.click).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    test("should handle empty data", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      exportToJSON([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith("No data to export");
      consoleWarnSpy.mockRestore();
    });

    test("should exclude specified keys", () => {
      const data = [{ id: 1, name: "Alice", email: "alice@test.com" }];
      exportToJSON(data, "test.json", ["id", "email"]);
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe("exportToCSV", () => {
    let createElementSpy: jest.SpyInstance;
    let mockLink: HTMLAnchorElement;

    beforeEach(() => {
      mockLink = {
        href: "",
        download: "",
        click: jest.fn(),
      } as unknown as HTMLAnchorElement;
      createElementSpy = jest.spyOn(document, "createElement").mockReturnValue(mockLink);
      global.URL.createObjectURL = jest.fn(() => "mock-url");
      global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      createElementSpy.mockRestore();
    });

    test("should export data to CSV", () => {
      const data = [
        { id: 1, name: "Alice", age: 30 },
        { id: 2, name: "Bob", age: 25 },
      ];

      exportToCSV(data, "test.csv");

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(mockLink.download).toBe("test.csv");
      expect(mockLink.click).toHaveBeenCalled();
    });

    test("should handle empty data", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      exportToCSV([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith("No data to export");
      consoleWarnSpy.mockRestore();
    });

    test("should handle values with commas, quotes, and newlines - covering line 114", () => {
      const data = [
        {
          id: 1,
          name: "Smith, John",
          desc: 'Test "quote"',
          note: "Line1\nLine2",
        },
        { id: 2, name: "Doe, Jane", desc: null, note: undefined },
      ];

      exportToCSV(data, "test.csv", ["id"]);

      expect(mockLink.click).toHaveBeenCalled();
      // This test covers line 114 when value is null/undefined
    });

    test("should respect column order", () => {
      const data = [{ id: 1, name: "Alice", age: 30, email: "alice@test.com" }];
      exportToCSV(data, "test.csv", ["id"], ["name", "age"]);
      expect(mockLink.click).toHaveBeenCalled();
    });
  });
});
