import { useMemo } from "react";
import type { SortConfig, AllocationTableRow } from "./types";
import { BasicRequest, RequestRow } from "@/app/_types/request";

export const timeConverter = (time: string): number => {
  const hours = parseInt(time.split(":")[0], 10);
  const minutes = parseInt(time.split(":")[1], 10);

  return hours * 60 + minutes;
};

export function useColumnSorter<T extends AllocationTableRow>(
  tableData: T[],
  sortConfig: SortConfig | null,
): T[] {
  return useMemo(() => {
    if (!sortConfig) return tableData;
    const sorted = [...tableData].sort((a, b) => {
      if (sortConfig["column"] == "session_date") {
        const dateA = toDate(a["session_date"], a["start_at"]);
        const dateB = toDate(b["session_date"], b["start_at"]);
        if (dateA && dateB) {
          if (sortConfig["direction"] == "asc") {
            return dateA.getTime() - dateB.getTime();
          } else {
            return dateB.getTime() - dateA.getTime();
          }
        }
      } else if (sortConfig["column"] == "start_at") {
        const timeA = timeConverter(a["start_at"] ?? "00:00");
        const timeB = timeConverter(b["start_at"] ?? "00:00");

        if (timeA && timeB) {
          return sortConfig["direction"] == "asc"
            ? timeA - timeB
            : timeB - timeA;
        }
      } else if (sortConfig["column"] === "unit_code") {
        const textA = String(a["unit_code"]).toLowerCase();
        const textB = String(b["unit_code"]).toLowerCase();
        if (textA < textB) return sortConfig["direction"] === "asc" ? -1 : 1;
        if (textA > textB) return sortConfig["direction"] === "asc" ? 1 : -1;
      } else if (
        sortConfig["column"] == "location" ||
        sortConfig["column"] == "status"
      ) {
        const textA = String(a[sortConfig["column"]]).toLowerCase();
        const textB = String(b[sortConfig["column"]]).toLowerCase();
        if (textA < textB) return sortConfig["direction"] === "asc" ? -1 : 1;
        if (textA > textB) return sortConfig["direction"] === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [tableData, sortConfig]);
}

export const exportJSON = (
  data: Record<string, string | number>[],
  filename = "tutor_allocations.json",
) => {
  for (const dictionary of data) {
    delete dictionary.id;
    delete dictionary.user_id;
  }
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

const CSVRowFormatter = (dataRow: string | number) => {
  let v = String(dataRow);
  if (v.includes(",")) {
    if (v[0] !== '"') v = '"' + v;
    if (v[v.length - 1] !== '"') v += '"';
  }
  return v;
};

export const exportCSV = (
  data: Record<string, string | number>[],
  filename = "tutor_allocations.csv",
) => {
  if (!data?.length) return;
  let keys = Object.keys(data[0]);
  keys = keys.slice(2, keys.length);
  let csvString = keys.join(",") + "\n";
  for (const row of data) {
    csvString +=
      keys.map((k) => CSVRowFormatter(row[k] ?? "")).join(",") + "\n";
  }

  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

export function hoursBetween(
  start?: string | null,
  end?: string | null,
): number | string {
  if (!start || !end) return 0;
  const [sh, sm, ss] = start.split(":").map(Number);
  const [eh, em, es] = end.split(":").map(Number);
  const a = new Date(0, 0, 0, sh || 0, sm || 0, ss || 0);
  const b = new Date(0, 0, 0, eh || 0, em || 0, es || 0);
  let diff = (b.getTime() - a.getTime()) / (1000 * 60 * 60);
  if (diff < 0) diff += 24;
  return Number(diff.toFixed(2));
}

export function toDate(
  dateStr?: string | null,
  time?: string | null,
): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  if (time) {
    const [h, m, s] = time.split(":").map(Number);
    // Treat incoming ISO as UTC so comparisons are stable
    d.setUTCHours(h || 0, m || 0, s || 0, 0);
  }
  return d;
}

export function niceTime(hms?: string | null) {
  if (!hms) return "—";
  // Handle both ISO datetime strings and HH:MM:SS format
  if (hms.includes("T")) return hms.slice(11, 16);
  return hms.slice(0, 5); // HH:MM
}

export function mapToRequestRow(r: RequestRow): RequestRow {
  return {
    requestId: r.requestId,
    type: r.type,
    relatedSession: r.relatedSession,
    status: formatStatus(r.status),
    actions: "View/Edit",
    reason: r.reason,
    createdAt: r.createdAt,
  };
}

function formatStatus(status: string): string {
  switch (status) {
    case "pending_uc":
      return "Pending (Unit Coordinator)";
    case "pending_ta":
      return "Pending (Teaching Assistant)";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}
