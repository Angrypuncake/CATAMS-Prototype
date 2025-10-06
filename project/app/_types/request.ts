// types/request.ts

export type RequestType = "swap" | "correction" | "cancellation" | "general";
export type RequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "withdrawn"
  | "in_review";

export interface Request {
  id: string;
  type: RequestType;
  status: RequestStatus;
  created_by: string; // user_id
  created_at: string;
  updated_at?: string;
  reason?: string;
  unit_code?: string;
  related_allocation_id?: string;
  replacement_tutor_id?: string;
  approver_id?: string | null;
  comment?: string | null;
}

export interface RequestPayload {
  type: RequestType;
  reason: string;
  related_allocation_id?: string;
  replacement_tutor_id?: string;
  unit_code?: string;
}
