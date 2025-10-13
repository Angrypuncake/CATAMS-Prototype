import type { TutorAllocationRow } from "@/app/_types/allocations";

export type AllocationRow = TutorAllocationRow;

export type ActionRequiredRow = {
  session_date: string | null;
  time: string | null;
  unit: string | null;
  hours: number | null;
  desc: string | null;
  status: string | null;
  actions: string | null;
};

export type RequestRow = {
  requestID: string | null;
  type: string | null;
  relatedSession: string | null;
  status: string | null;
  actions: string | null;
};

export type NoticeRow = {
  session_date: string | null;
  type: string | null;
  message: string | null;
  actions: string | null;
};

export type SortableColumns =
  | "session_date"
  | "start_at"
  | "location"
  | "status"
  | "unit_code";

export interface SortConfig {
  column: string;
  direction: "asc" | "desc";
}

export interface AllocationTableRow {
  session_date?: string | null;
  start_at?: string | null;
  location?: string | null;
  status?: string | null;
  unit_code?: string | null;
  [key: string]: unknown;
}
