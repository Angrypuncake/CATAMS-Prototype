export const isPrimitive = (v: unknown) =>
  v === null ||
  v === undefined ||
  ["string", "number", "boolean"].includes(typeof v);

export const truncate = (s: string, n = 80) =>
  s.length > n ? s.slice(0, n) + "…" : s;

export const isDate = (v: unknown): v is Date =>
  v instanceof Date && !isNaN(v.getTime());

export const formatDate = (date: Date): string => {
  return date.toLocaleString();
};

export const searchInValue = (value: unknown, searchTerm: string): boolean => {
  if (value === null || value === undefined) return false;

  const lowerSearch = searchTerm.toLowerCase();

  // Handle Date objects
  if (isDate(value)) {
    return formatDate(value).toLowerCase().includes(lowerSearch);
  }

  // Handle strings - check if it's a date string and search both formatted and raw
  if (typeof value === "string") {
    const lowerValue = value.toLowerCase();

    // Try to parse as date
    const parsedDate = new Date(value);
    if (isDate(parsedDate)) {
      // Search in both the formatted date and the raw string
      return (
        formatDate(parsedDate).toLowerCase().includes(lowerSearch) ||
        lowerValue.includes(lowerSearch)
      );
    }

    // Regular string search
    return lowerValue.includes(lowerSearch);
  }

  // Handle numbers - convert to string for searching
  if (typeof value === "number") {
    return String(value).includes(searchTerm);
  }

  // Handle booleans
  if (typeof value === "boolean") {
    return String(value).toLowerCase().includes(lowerSearch);
  }

  // Handle arrays - recursively search items
  if (Array.isArray(value)) {
    return value.some((item) => searchInValue(item, searchTerm));
  }

  // Handle objects - recursively search values
  if (typeof value === "object") {
    return Object.values(value).some((v) => searchInValue(v, searchTerm));
  }

  return false;
};

export const compareValues = (
  a: unknown,
  b: unknown,
  direction: "asc" | "desc",
): number => {
  // Handle null/undefined
  if (a === null || a === undefined) return direction === "asc" ? 1 : -1;
  if (b === null || b === undefined) return direction === "asc" ? -1 : 1;

  // Handle dates
  if (isDate(a) && isDate(b)) {
    const comparison = a.getTime() - b.getTime();
    return direction === "asc" ? comparison : -comparison;
  }

  // Handle numbers
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  // Handle booleans
  if (typeof a === "boolean" && typeof b === "boolean") {
    const aVal = a ? 1 : 0;
    const bVal = b ? 1 : 0;
    return direction === "asc" ? aVal - bVal : bVal - aVal;
  }

  // Handle strings (default)
  const aStr = String(a).toLowerCase();
  const bStr = String(b).toLowerCase();

  if (aStr < bStr) return direction === "asc" ? -1 : 1;
  if (aStr > bStr) return direction === "asc" ? 1 : -1;
  return 0;
};

export { defaultRender } from "./renderUtils";

/**
 * Export utility functions for CSV and JSON
 */

/**
 * Format a cell value for CSV export
 * Wraps values containing commas in quotes
 */
const formatCSVCell = (value: unknown): string => {
  let str = String(value ?? "");
  // Wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    // Escape existing quotes by doubling them
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
};

/**
 * Export data to JSON file
 */
export function exportToJSON<T = Record<string, unknown>>(
  data: T[],
  filename = "export.json",
  excludeKeys: string[] = ["id"],
): void {
  if (!data?.length) {
    console.warn("No data to export");
    return;
  }

  // Clone and filter data
  const filteredData = data.map((row) => {
    const filtered = { ...row } as Record<string, unknown>;
    excludeKeys.forEach((key) => delete filtered[key]);
    return filtered;
  });

  const jsonString = JSON.stringify(filteredData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV file
 */
export function exportToCSV<T = Record<string, unknown>>(
  data: T[],
  filename = "export.csv",
  excludeKeys: string[] = ["id"],
  columnOrder?: string[],
): void {
  if (!data?.length) {
    console.warn("No data to export");
    return;
  }

  // Get all keys from the first row
  const allKeys = Object.keys(data[0] as object);

  // Filter out excluded keys
  const filteredKeys = allKeys.filter((key) => !excludeKeys.includes(key));

  // Use provided column order or default to filtered keys
  const keys = columnOrder
    ? columnOrder.filter((key) => filteredKeys.includes(key))
    : filteredKeys;

  // Create CSV header
  let csvString = keys.join(",") + "\n";

  // Add data rows
  for (const row of data) {
    const rowData = row as Record<string, unknown>;
    const values = keys.map((key) => formatCSVCell(rowData[key]));
    csvString += values.join(",") + "\n";
  }

  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
