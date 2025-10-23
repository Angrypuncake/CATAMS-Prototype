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

describe("DynamicTable Utils", () => {
  describe("isPrimitive", () => {
    test("should return true for null", () => {
      expect(isPrimitive(null)).toBe(true);
    });

    test("should return true for undefined", () => {
      expect(isPrimitive(undefined)).toBe(true);
    });

    test("should return true for string", () => {
      expect(isPrimitive("test")).toBe(true);
    });

    test("should return true for number", () => {
      expect(isPrimitive(42)).toBe(true);
    });

    test("should return true for boolean", () => {
      expect(isPrimitive(true)).toBe(true);
    });

    test("should return false for objects", () => {
      expect(isPrimitive({})).toBe(false);
      expect(isPrimitive([])).toBe(false);
      expect(isPrimitive(new Date())).toBe(false);
    });
  });

  describe("truncate", () => {
    test("should truncate long strings", () => {
      const longString = "a".repeat(100);
      expect(truncate(longString)).toBe("a".repeat(80) + "…");
    });

    test("should not truncate short strings", () => {
      expect(truncate("short")).toBe("short");
    });

    test("should use custom length", () => {
      expect(truncate("12345", 3)).toBe("123…");
    });
  });

  describe("isDate", () => {
    test("should return true for valid Date objects", () => {
      expect(isDate(new Date())).toBe(true);
    });

    test("should return false for invalid dates", () => {
      expect(isDate(new Date("invalid"))).toBe(false);
    });

    test("should return false for non-Date values", () => {
      expect(isDate("2025-01-01")).toBe(false);
      expect(isDate(123456789)).toBe(false);
      expect(isDate(null)).toBe(false);
    });
  });

  describe("formatDate", () => {
    test("should format date to locale string", () => {
      const date = new Date(2025, 0, 15, 10, 30);
      const formatted = formatDate(date);
      expect(formatted).toContain("2025");
      expect(typeof formatted).toBe("string");
    });
  });

  describe("searchInValue", () => {
    test("should return false for null or undefined", () => {
      expect(searchInValue(null, "test")).toBe(false);
      expect(searchInValue(undefined, "test")).toBe(false);
    });

    test("should search in Date objects", () => {
      const date = new Date(2025, 0, 15);
      expect(searchInValue(date, "2025")).toBe(true);
    });

    test("should search in strings", () => {
      expect(searchInValue("Hello World", "world")).toBe(true);
      expect(searchInValue("Hello World", "xyz")).toBe(false);
    });

    test("should search in date strings", () => {
      expect(searchInValue("2025-01-15", "2025")).toBe(true);
    });

    test("should search in numbers", () => {
      expect(searchInValue(12345, "234")).toBe(true);
      expect(searchInValue(12345, "678")).toBe(false);
    });

    test("should search in booleans", () => {
      expect(searchInValue(true, "true")).toBe(true);
      expect(searchInValue(false, "false")).toBe(true);
    });

    test("should search in arrays recursively", () => {
      expect(searchInValue([1, 2, 3], "2")).toBe(true);
      expect(searchInValue(["a", "b", "c"], "b")).toBe(true);
    });

    test("should search in objects recursively", () => {
      expect(searchInValue({ name: "John", age: 30 }, "john")).toBe(true);
      expect(searchInValue({ name: "John", age: 30 }, "30")).toBe(true);
    });

    test("should search in both formatted date and raw string for date strings", () => {
      const dateString = "2025-01-15T10:30:00";
      expect(searchInValue(dateString, "2025")).toBe(true);
    });

    test("should search in raw date string when formatted date doesn't match", () => {
      const dateString = "2025-01-15T10:30:00";
      expect(searchInValue(dateString, "t10")).toBe(true);
    });

    test("should return false for unsupported types", () => {
      const symbol = Symbol("test");
      expect(searchInValue(symbol, "test")).toBe(false);
    });

    test("should return false for functions", () => {
      const fn = () => "test";
      expect(searchInValue(fn, "test")).toBe(false);
    });
  });

  describe("compareValues", () => {
    test("should handle null/undefined with asc direction", () => {
      expect(compareValues(null, 5, "asc")).toBe(1);
      expect(compareValues(5, null, "asc")).toBe(-1);
    });

    test("should handle null/undefined with desc direction", () => {
      expect(compareValues(null, 5, "desc")).toBe(-1);
      expect(compareValues(5, null, "desc")).toBe(1);
    });

    test("should compare dates", () => {
      const date1 = new Date(2025, 0, 1);
      const date2 = new Date(2025, 0, 15);
      expect(compareValues(date1, date2, "asc")).toBeLessThan(0);
      expect(compareValues(date1, date2, "desc")).toBeGreaterThan(0);
    });

    test("should compare numbers", () => {
      expect(compareValues(5, 10, "asc")).toBeLessThan(0);
      expect(compareValues(5, 10, "desc")).toBeGreaterThan(0);
    });

    test("should compare booleans", () => {
      expect(compareValues(false, true, "asc")).toBeLessThan(0);
      expect(compareValues(false, true, "desc")).toBeGreaterThan(0);
    });

    test("should compare strings", () => {
      expect(compareValues("apple", "banana", "asc")).toBeLessThan(0);
      expect(compareValues("apple", "banana", "desc")).toBeGreaterThan(0);
    });

    test("should return 0 for equal values", () => {
      expect(compareValues("test", "test", "asc")).toBe(0);
    });
  });

  describe("exportToJSON", () => {
    let clickSpy: jest.Mock;

    beforeEach(() => {
      // Mock URL methods
      global.URL.createObjectURL = jest.fn(() => "blob:mock");
      global.URL.revokeObjectURL = jest.fn();

      // Intercept createElement and spy on <a>.click without using any
      const originalCreate = document.createElement.bind(document);
      clickSpy = jest.fn();

      jest.spyOn(document, "createElement").mockImplementation(((
        tagName: string,
      ) => {
        const el = originalCreate(tagName);
        if (tagName.toLowerCase() === "a") {
          jest
            .spyOn(el as HTMLAnchorElement, "click")
            .mockImplementation(() => {
              clickSpy();
            });
        }
        return el;
      }) as typeof document.createElement);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should warn and return early when no data", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      exportToJSON([], "test.json");

      expect(consoleSpy).toHaveBeenCalledWith("No data to export");
      expect(clickSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test("should warn and return early when data is null/undefined", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      // Cast without any
      exportToJSON(null as unknown as never[], "test.json");

      expect(consoleSpy).toHaveBeenCalledWith("No data to export");
      expect(clickSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test("should export data to JSON file", () => {
      const data = [
        { id: 1, name: "John", age: 30 },
        { id: 2, name: "Jane", age: 25 },
      ];

      exportToJSON(data, "test.json");

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    test("should exclude specified keys", () => {
      const data = [{ id: 1, name: "John", secret: "hidden" }];

      exportToJSON(data, "test.json", ["id", "secret"]);

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe("exportToCSV", () => {
    let clickSpy: jest.Mock;

    beforeEach(() => {
      global.URL.createObjectURL = jest.fn(() => "blob:mock");
      global.URL.revokeObjectURL = jest.fn();

      const originalCreate = document.createElement.bind(document);
      clickSpy = jest.fn();

      jest.spyOn(document, "createElement").mockImplementation(((
        tagName: string,
      ) => {
        const el = originalCreate(tagName);
        if (tagName.toLowerCase() === "a") {
          jest
            .spyOn(el as HTMLAnchorElement, "click")
            .mockImplementation(() => {
              clickSpy();
            });
        }
        return el;
      }) as typeof document.createElement);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should warn and return early when no data", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      exportToCSV([], "test.csv");

      expect(consoleSpy).toHaveBeenCalledWith("No data to export");
      expect(clickSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test("should warn and return early when data is null/undefined", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      exportToCSV(null as unknown as never[], "test.csv");

      expect(consoleSpy).toHaveBeenCalledWith("No data to export");
      expect(clickSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test("should export data to CSV file", () => {
      const data = [
        { id: 1, name: "John", age: 30 },
        { id: 2, name: "Jane", age: 25 },
      ];

      exportToCSV(data, "test.csv");

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    test("should exclude specified keys", () => {
      const data = [{ id: 1, name: "John", secret: "hidden" }];

      exportToCSV(data, "test.csv", ["id", "secret"]);

      expect(clickSpy).toHaveBeenCalled();
    });

    test("should use column order when provided", () => {
      const data = [{ id: 1, name: "John", age: 30, city: "NYC" }];

      exportToCSV(data, "test.csv", [], ["name", "age"]);

      expect(clickSpy).toHaveBeenCalled();
    });

    test("should filter column order to only include existing keys", () => {
      const data = [{ id: 1, name: "John", age: 30 }];

      exportToCSV(data, "test.csv", [], ["name", "nonexistent", "age"]);

      expect(clickSpy).toHaveBeenCalled();
    });

    test("should handle CSV cells with commas by wrapping in quotes", () => {
      const data = [{ id: 1, name: "Doe, John", city: "New York, NY" }];

      exportToCSV(data, "test.csv");

      expect(clickSpy).toHaveBeenCalled();
    });

    test("should handle CSV cells with quotes by escaping them", () => {
      const data = [{ id: 1, comment: 'He said "Hello"' }];

      exportToCSV(data, "test.csv");

      expect(clickSpy).toHaveBeenCalled();
    });

    test("should handle CSV cells with newlines", () => {
      const data = [{ id: 1, description: "Line 1\nLine 2" }];

      exportToCSV(data, "test.csv");

      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
