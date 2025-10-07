import { AdminAllocationRow } from "@/app/_types/allocations";

export type AllocationRow = AdminAllocationRow;

export type ApiResult = {
  page: number;
  limit: number;
  total: number;
  data: AllocationRow[];
};

export type TutorOption = {
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

export type PaycodeOption = {
  code: string;
  paycode_description: string | null;
  amount: string | number;
};

// For the occurrences helper
export type OccurrenceRow = {
  occurrence_id: number;
  session_date: string; // "YYYY-MM-DD"
  status?: string | null; // optional, if you return it
};

export type SavePayload = Partial<AllocationRow> & {
  apply_all_for_activity?: boolean;
  propagate_occurrence_ids?: number[] | null;

  propagate_fields?: Array<
    "tutor" | "paycode" | "start" | "end" | "note" | "status" | "location"
  >;
  propagate_notes_mode?: "overwrite" | "append";
  propagate_dow?: Dow;
};

export type PropagationPayload = {
  fields: Array<
    "tutor" | "paycode" | "start" | "end" | "note" | "status" | "location"
  >;
  notesMode?: "overwrite" | "append";
  dow?: Dow;
  occurrenceIds: number[];
};

export const STATUS_OPTIONS = [
  "Academic Staff",
  "Approved Allocation",
  "Hours for Approval",
  "Ignore class",
  "Variation complete",
  "Draft Casual",
  "Hours for Review",
  "Rejected by Approver",
] as const;

export const DOWS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Dow = (typeof DOWS)[number];
