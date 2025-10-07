import {
  AdminAllocationRow,
  SaveAllocationPayload,
  Dow,
} from "@/app/_types/allocations";

export type AllocationRow = AdminAllocationRow;

export type ApiResult = {
  page: number;
  limit: number;
  total: number;
  data: AllocationRow[];
};

// export type TutorOption = {
//   user_id: number;
//   first_name: string | null;
//   last_name: string | null;
//   email: string | null;
// };

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

export type SavePayload = SaveAllocationPayload;

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
