// types/request_patch.ts (or append to types/request.ts)

// Reuse your existing RequestDetailsMap
import type { RequestDetailsMap } from "./request";

// Build a "partial-or-null" map for details patching
type PartialOrNull<T> = T extends null ? null : Partial<T> | null;

export type PatchRequestDetailsMap = {
  [K in keyof RequestDetailsMap]: PartialOrNull<RequestDetailsMap[K]>;
};

// Discriminated union for details patching by requestType
export type PatchDetailsUnion =
  | { requestType: "claim"; details: PatchRequestDetailsMap["claim"] }
  | { requestType: "swap"; details: PatchRequestDetailsMap["swap"] }
  | {
      requestType: "correction";
      details: PatchRequestDetailsMap["correction"];
    }
  | {
      requestType: "cancellation";
      details: PatchRequestDetailsMap["cancellation"];
    }
  | { requestType: "query"; details: PatchRequestDetailsMap["query"] };

// Base fields you might patch irrespective of details
export interface PatchTutorRequestBase {
  requestId: number;
  requestStatus?: "pending_ta" | "pending_uc" | "approved" | "rejected" | "cancelled";
  reviewer?: number | null;
  requestReason?: string | null;
  reviewerNote?: string | null;
}

// Final request payload you send from the client:
// - Either base-only (no details), or base + properly-typed details
export type PatchTutorRequestPayload =
  | PatchTutorRequestBase
  | (PatchTutorRequestBase & PatchDetailsUnion);

// ——— Response types (non-breaking, additive) ———

export interface PatchTutorResponseData {
  request_id: number;
  request_status: string;
  reviewer: number | null;
  request_reason: string | null;
  reviewer_note: string | null;
  details?: unknown | null; // echo from DB; keep unknown to avoid coupling
  updated_at: string;
}

export interface PatchTutorResponse {
  success: boolean;
  data?: PatchTutorResponseData;
  error?: string;
}
