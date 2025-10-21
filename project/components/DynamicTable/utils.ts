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

  if (isDate(value)) {
    return formatDate(value).toLowerCase().includes(lowerSearch);
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value).toLowerCase().includes(lowerSearch);
  }

  if (Array.isArray(value)) {
    return value.some((item) => searchInValue(item, searchTerm));
  }

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
