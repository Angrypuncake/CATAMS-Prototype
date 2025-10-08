// ------------ Shared Types for Allocations ------------

export type RequestType = "Swap" | "Correction" | "Extension" | "Cancellation";
export type RequestState = "Pending Review" | "Approved" | "Rejected";

export interface RequestItem {
  id: string;
  type: RequestType;
  state: RequestState;
  relatedSession: string;
  creator: string;
  creatorRole: string;
  user_id: number;
}

export interface CommentItem {
  id: string;
  author: string;
  role: string;
  time: string;
  body: string;
  mine?: boolean; // whether current user wrote this comment
}

// lib/types/allocation.ts
export interface AllocationBase {
  id: number | string;
  session_date: string | null;
  start_at: string | null;
  end_at: string | null;
  unit_code: string | null;
  location: string | null;
  status?: string | null;
  note?: string | null;
  unit_name: string | null;
  allocated_hours: number | string | null;
  activity_name: string | null;
}

export interface TutorAllocationRow extends AllocationBase {
  actions?: string | null;
}

export interface AdminAllocationRow extends AllocationBase {
  user_id: number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  activity_type: string | null;
  paycode_id?: string | null;
  teaching_role?: string | null;
  mode?: "scheduled" | "unscheduled" | string | null;
  allocation_activity_id?: number | null;
}

export const DOWS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Dow = (typeof DOWS)[number];

export interface SaveAllocationPayload extends Partial<AdminAllocationRow> {
  apply_all_for_activity?: boolean;
  propagate_occurrence_ids?: number[] | null;
  propagate_fields?: Array<
    "tutor" | "paycode" | "start" | "end" | "note" | "status" | "location"
  >;
  propagate_notes_mode?: "overwrite" | "append";
  propagate_dow?: Dow;
}

export type RollbackResponse = {
  rolledBack: boolean;
  runId: number;
  deleted: {
    d_alloc: number; // number of allocations deleted
    d_sess: number; // number of session_occurrence deleted
    d_teach: number; // number of teaching_activity deleted
  };
};

export type CommitResponse = {
  committed: true;
  stagingId: number;
  inserted: {
    teaching_activity: number;
    session_occurrence: number;
    allocation: number;
  };
};

export type DiscardResponse =
  | {
      discarded: true;
      batchId: number;
    }
  | {
      error: string;
      detail?: string;
      committedRuns?: number;
    };

export type PreviewResponse = {
  stagingId: number;
  preview: {
    raw: unknown[];
    issues: Record<string, unknown> | null;
    timetable: Record<string, unknown>;
  };
  error: string;
};
