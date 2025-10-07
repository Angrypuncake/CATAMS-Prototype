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
  location?: string | null;
  status?: string | null;
  note?: string | null;
}

export interface TutorAllocationRow extends AllocationBase {
  actions?: string | null;
}

export interface AdminAllocationRow extends AllocationBase {
  user_id: number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  unit_name: string | null;
  activity_type: string | null;
  activity_name: string | null;
  paycode_id?: string | null;
  teaching_role?: string | null;
  mode?: "scheduled" | "unscheduled" | string | null;
  allocated_hours?: number | string | null;
  allocation_activity_id?: number | null;
}
