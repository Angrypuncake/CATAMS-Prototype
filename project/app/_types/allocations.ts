// ------------ Shared Types for Allocations ------------

export type RequestType = "Swap" | "Correction" | "Extension" | "Cancellation";
export type RequestState = "Pending Review" | "Approved" | "Rejected";

export interface AllocationDetail {
  id: string;
  courseCode: string;
  courseName: string;
  status: "Confirmed" | "Pending" | "Cancelled";
  date: string;
  time: string;
  location: string;
  hours: string;
  session: string;
  notes?: string;
}

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
