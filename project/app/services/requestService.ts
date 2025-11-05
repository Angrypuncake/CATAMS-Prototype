import type {
  BasicRequest,
  CancellationDetails,
  ClaimDetails,
  CorrectionDetails,
  CreateRequestPayload,
  PaginatedRequests,
  SwapDetails,
  TutorCorrectionPayload,
  TutorRequest,
  UCApproval,
  UCApprovalResponse,
} from "@/app/_types/request";
import axios from "@/lib/axios";
import { getCoordinatorUnits } from "./unitService";
import {
  PatchDetailsUnion,
  PatchTutorResponseData,
} from "../_types/requestsPatch";

export async function getRequestByRequestId(id: string): Promise<TutorRequest> {
  const res = await axios.get(`requests/${id}`);
  return res.data.data;
}

export async function getRequestById(id: string): Promise<TutorRequest> {
  const mock = "true";
  if (mock === "true") {
    const now = new Date().toISOString();

    const base = {
      requestId: Number(id),
      requesterId: 8,
      reviewerId: 10,
      requestDate: now,
      allocationId: 21,
      requestStatus: "pending" as const,
      requestReason: null,
      createdAt: now,
      updatedAt: now,
    };

    // Rotate between types for demo
    const typeIndex = Number(id) % 5;
    const types: TutorRequest["requestType"][] = [
      "claim",
      "swap",
      "cancellation",
      "correction",
      "query",
    ];
    const requestType = types[typeIndex];

    switch (requestType) {
      case "claim":
        return {
          ...base,
          requestType,
          details: { hours: 2, paycode: "TUT01" },
        };

      case "swap":
        return {
          ...base,
          requestType,
          details: { suggested_tutor_id: 10, suggested_alloc_id: null },
        };

      case "correction":
        return {
          ...base,
          requestType,
          details: {
            date: "2025-10-12",
            start_at: "09:00",
            end_at: "11:00",
            location: "Room 302, Engineering Building",
            hours: "2",
            session_type: "Tutorial",
          },
        };

      case "cancellation":
      case "query":
        return {
          ...base,
          requestType,
          details: null,
        };
    }
  }

  // fallback in case mock disabled
  throw new Error("Real API not implemented for getRequestById");
}

export async function postCorrectionRequest(
  allocationId: string | number,
  payload: TutorCorrectionPayload,
) {
  const res = await axios.post(
    `/tutor/allocations/${allocationId}/requests/correction`,
    payload,
  );
  return res.data;
}

export async function createRequestService(payload: CreateRequestPayload) {
  const res = await axios.post("/requests", payload);
  return res.data;
}

/**
 * ================================================
 *  Tutor Request Service — Unified Request Creator
 * ================================================
 *
 * PURPOSE:
 * --------
 * Provides a single, strongly-typed entry point for
 * creating any tutor request:
 *   → "claim" | "swap" | "correction" | "cancellation" | "query"
 *
 * The requestService enforces compile-time safety
 * between `requestType` and its `details` payload
 * using a discriminated union (see _types/requests.ts).
 *
 * --------------------------------
 * USAGE OVERVIEW
 * --------------------------------
 * import { createRequestService } from "@/app/services/requestService";
 *
 * // 1️⃣  CLAIM
 * await createRequestService({
 *   requesterId: 12,
 *   allocationId: 45,
 *   requestType: "claim",
 *   requestReason: "Claiming unpaid session",
 *   details: {
 *     paycode: "TUT102",
 *     hours: 2,
 *   },
 * });
 *
 * // 2️⃣  CORRECTION
 * await createRequestService({
 *   requesterId: 12,
 *   allocationId: 45,
 *   requestType: "correction",
 *   requestReason: "Incorrect session time",
 *   details: {
 *     date: "2025-10-15",
 *     start_at: "09:00",
 *     end_at: "11:00",
 *     location: "Room A",
 *     hours: 2,
 *     session_type: "tutorial",
 *   },
 * });
 *
 * // 3️⃣  CANCELLATION
 * await createRequestService({
 *   requesterId: 12,
 *   allocationId: 45,
 *   requestType: "cancellation",
 *   requestReason: "Illness",
 *   details: {
 *     suggestedUserId: 34, // optional replacement tutor
 *   },
 * });
 *
 * // 4️⃣  SWAP
 * await createRequestService({
 *   requesterId: 12,
 *   allocationId: 45,
 *   requestType: "swap",
 *   requestReason: "Scheduling conflict",
 *   details: {
 *     targetAllocationId: 99,
 *     targetTutorId: 18,
 *   },
 * });
 *
 * // 5️⃣  QUERY
 * await createRequestService({
 *   requesterId: 12,
 *   allocationId: 45,
 *   requestType: "query",
 *   requestReason: "Clarification on allocation hours",
 *   details: {}, // EmptyDetails enforced
 * });
 *
 * --------------------------------
 * DEV NOTES
 * --------------------------------
 * - Backend route:  POST /api/requests
 * - Auto-assigns request_status using a default map
 * - `details` is JSON-encoded; shape varies per requestType
 * - Throws if backend returns non-200
 * - Frontend pages should obtain requesterId from
 *   /api/dev/whoami or middleware headers.
 *
 * This service replaces older specialised helpers
 * (cancelRequestService, correctionRequestService, etc.)
 * for a unified and maintainable workflow.
 */

/**
 * Fetches all open requests for a specific allocation.
 * Returns an array of open request types (e.g. ["query", "swap"]).
 */
export interface RawRequestRow {
  request_id: number;
  requester_id: number;
  allocation_id: number;
  request_type: string | null;
  request_status: string;
  request_reason: string | null;
  created_at: string;
}

export async function getOpenRequestTypes(
  allocationId: number,
): Promise<string[]> {
  const response = await axios.get<{ data: RawRequestRow[] }>(
    `/requests?allocationId=${allocationId}`,
  );

  const openTypes = Array.from(
    new Set(
      response.data.data
        .map((r) => r.request_type?.toLowerCase())
        .filter((v): v is string => Boolean(v)),
    ),
  );

  return openTypes;
}

/**
 * Fetch all requests for a given allocation and normalize to camelCase.
 */
export async function getRequestsByAllocation(
  allocationId: number,
  userId?: number,
): Promise<BasicRequest[]> {
  const config = userId
    ? { headers: { "x-user-id": String(userId) } }
    : undefined;

  const response = await axios.get<{ data: RawRequestRow[] }>(
    `/requests?allocationId=${allocationId}`,
    config,
  );

  const normalized: BasicRequest[] = response.data.data
    .filter((r) => r.request_type !== null)
    .map((r) => ({
      requestId: r.request_id,
      requesterId: r.requester_id,
      allocationId: r.allocation_id,
      requestType: r.request_type as
        | "claim"
        | "swap"
        | "correction"
        | "cancellation"
        | "query",
      requestStatus: r.request_status,
      requestReason: r.request_reason,
      createdAt: r.created_at,
    }));

  return normalized;
}

export async function getTutorRequests(
  page = 1,
  limit = 50,
  userId?: number,
): Promise<PaginatedRequests> {
  const response = await axios.get<PaginatedRequests>("/tutor/requests", {
    params: { page, limit },
  });
  return response.data;
}
export async function getRequestsByUnit(
  offeringId: number,
): Promise<UCApprovalResponse> {
  const res = await axios.get(`/offerings/${offeringId}/requests`);
  return res.data as UCApprovalResponse;
}

export async function getRequestsByUC(): Promise<UCApproval[]> {
  // 1 Get all unit offering IDs for this UC
  const rawOfferings = await getCoordinatorUnits();
  const offeringIds = rawOfferings.map((r) => r.offering_id);

  if (offeringIds.length === 0) return [];

  // 2 Fetch all requests in parallel
  const results = await Promise.all(
    offeringIds.map((id) => getRequestsByUnit(id)),
  );

  // 3 Flatten into a single array of UCApproval
  const allRequests = results.flatMap((r) => r.approvals);

  return allRequests;
}
export type PatchTutorRequest =
  | {
      requestId: number;
      requestStatus?:
        | "pending_ta"
        | "pending_uc"
        | "approved"
        | "rejected"
        | "cancelled";
      reviewer?: number | null;
      requestReason?: string | null;
      reviewerNote?: string | null;
    }
  | ({
      requestId: number;
      requestStatus?:
        | "pending_ta"
        | "pending_uc"
        | "approved"
        | "rejected"
        | "cancelled";
      reviewer?: number | null;
      requestReason?: string | null;
      reviewerNote?: string | null;
    } & PatchDetailsUnion);

export interface PatchTutorResponse {
  success: boolean;
  data?: {
    request_id: number;
    request_status: string;
    reviewer: number | null;
    request_reason: string | null;
    reviewer_note: string | null; // 🆕 included in return
    updated_at: string;
  };
  error?: string;
}

// -------------------------------------------------------------
// 🔹 Base PATCH call (non-breaking)
// -------------------------------------------------------------
export async function patchTutorRequest(
  payload: PatchTutorRequest,
): Promise<PatchTutorResponse> {
  const res = await axios.patch<PatchTutorResponse>("/requests", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// Optional: small helper to throw on error and return data directly
function expectSuccess(res: PatchTutorResponse): PatchTutorResponseData {
  if (!res.success || !res.data) {
    throw new Error(res.error ?? "Unknown error patching request");
  }
  return res.data;
}

// =============================================================
//  A) DETAILS PATCHERS (typed, no `any`)
// =============================================================

/**
 * Partially patch Claim details. Pass `null` to clear.
 */
export async function patchClaimDetails(
  requestId: number,
  details: Partial<ClaimDetails> | null,
) {
  const res = await patchTutorRequest({
    requestId,
    requestType: "claim",
    details,
  });
  return expectSuccess(res);
}

/**
 * Partially patch Swap details. Pass `null` to clear.
 */
export async function patchSwapDetails(
  requestId: number,
  details: Partial<SwapDetails> | null,
) {
  const res = await patchTutorRequest({
    requestId,
    requestType: "swap",
    details,
  });
  return expectSuccess(res);
}

/**
 * Partially patch Correction details. Pass `null` to clear.
 */
export async function patchCorrectionDetails(
  requestId: number,
  details: Partial<CorrectionDetails> | null,
) {
  const res = await patchTutorRequest({
    requestId,
    requestType: "correction",
    details,
  });
  return expectSuccess(res);
}

/**
 * Partially patch Cancellation details. Pass `null` to clear.
 */
export async function patchCancellationDetails(
  requestId: number,
  details: Partial<CancellationDetails> | null,
) {
  const res = await patchTutorRequest({
    requestId,
    requestType: "cancellation",
    details,
  });
  return expectSuccess(res);
}

/**
 * Ensure Query requests have no details (sets to NULL).
 */
export async function clearQueryDetails(requestId: number) {
  const res = await patchTutorRequest({
    requestId,
    requestType: "query",
    details: null,
  });
  return expectSuccess(res);
}

/**
 * Clear details for any request type explicitly.
 */
export async function clearDetailsFor(
  requestId: number,
  requestType: "claim" | "swap" | "correction" | "cancellation" | "query",
) {
  const res = await patchTutorRequest({
    requestId,
    requestType,
    details: null,
  });
  return expectSuccess(res);
}

// =============================================================
//  B) GENERIC FIELD PATCHERS
// =============================================================

export async function setRequestStatus(
  requestId: number,
  requestStatus:
    | "pending_ta"
    | "pending_uc"
    | "approved"
    | "rejected"
    | "cancelled",
) {
  const res = await patchTutorRequest({ requestId, requestStatus });
  return expectSuccess(res);
}

export async function setReviewer(requestId: number, reviewer: number | null) {
  const res = await patchTutorRequest({ requestId, reviewer });
  return expectSuccess(res);
}

export async function setRequestReason(
  requestId: number,
  requestReason: string | null,
) {
  const res = await patchTutorRequest({ requestId, requestReason });
  return expectSuccess(res);
}

export async function setReviewerNote(
  requestId: number,
  reviewerNote: string | null,
) {
  const res = await patchTutorRequest({ requestId, reviewerNote });
  return expectSuccess(res);
}

// =============================================================
//  C) UC HELPERS (keep existing signatures)
// =============================================================

/**
 * UC: Approves a tutor request.
 */
export async function ucApproveRequest(
  requestId: number,
  reviewerId: number,
  reviewerNote?: string,
) {
  const res = await patchTutorRequest({
    requestId,
    requestStatus: "approved",
    reviewer: reviewerId,
    reviewerNote: reviewerNote ?? null,
  });
  return expectSuccess(res);
}

/**
 * UC: Rejects a tutor request.
 */
export async function ucRejectRequest(
  requestId: number,
  reviewerId: number,
  reason?: string,
  reviewerNote?: string,
) {
  const res = await patchTutorRequest({
    requestId,
    requestStatus: "rejected",
    reviewer: reviewerId,
    requestReason: reason ?? null,
    reviewerNote: reviewerNote ?? null,
  });
  return expectSuccess(res);
}

/**
 * UC: Approve + patch details in one atomic call (optional).
 */
export async function ucApproveWithDetails(
  requestId: number,
  reviewerId: number,
  details:
    | (PatchDetailsUnion & {
        /* force details presence on non-query */
      })
    | { requestType: "query"; details: null },
  reviewerNote?: string,
) {
  const res = await patchTutorRequest({
    requestId,
    requestStatus: "approved",
    reviewer: reviewerId,
    reviewerNote: reviewerNote ?? null,
    ...(details as PatchDetailsUnion),
  });
  return expectSuccess(res);
}

/**
 * UC: Reject + patch reviewer note / reason + optional details clear.
 */
export async function ucRejectWithNoteAndOptionalDetailsClear(
  requestId: number,
  reviewerId: number,
  reason: string | null,
  reviewerNote: string | null,
  clearDetails?: boolean,
  requestTypeForClear?:
    | "claim"
    | "swap"
    | "correction"
    | "cancellation"
    | "query",
) {
  const base = await patchTutorRequest({
    requestId,
    requestStatus: "rejected",
    reviewer: reviewerId,
    requestReason: reason,
    reviewerNote,
  });
  const data = expectSuccess(base);

  if (clearDetails && requestTypeForClear) {
    await clearDetailsFor(requestId, requestTypeForClear);
  }

  return data;
}

// =============================================================
//  D) TA HELPERS (keep existing signatures)
// =============================================================

/**
 * TA: Forwards a request to UC for approval (their version of “approve”).
 */
export async function taForwardToUC(
  requestId: number,
  taReviewerId: number,
  reason?: string,
  reviewerNote?: string,
) {
  const res = await patchTutorRequest({
    requestId,
    requestStatus: "pending_uc",
    reviewer: taReviewerId,
    requestReason: reason ?? null,
    reviewerNote: reviewerNote ?? null,
  });
  return expectSuccess(res);
}

/**
 * TA: Rejects a tutor request directly (e.g., invalid claim before UC review).
 */
export async function taRejectRequest(
  requestId: number,
  taReviewerId: number,
  reason?: string,
  reviewerNote?: string,
) {
  const res = await patchTutorRequest({
    requestId,
    requestStatus: "rejected",
    reviewer: taReviewerId,
    requestReason: reason ?? null,
    reviewerNote: reviewerNote ?? null,
  });
  return expectSuccess(res);
}

/**
 * TA: Edits claim/correction/swap details without changing status.
 */
export async function taEditClaimDetails(
  requestId: number,
  partial: Partial<ClaimDetails>,
) {
  return patchClaimDetails(requestId, partial);
}

export async function taEditCorrectionDetails(
  requestId: number,
  partial: Partial<CorrectionDetails>,
) {
  return patchCorrectionDetails(requestId, partial);
}

export async function taEditSwapDetails(
  requestId: number,
  partial: Partial<SwapDetails>,
) {
  return patchSwapDetails(requestId, partial);
}

/**
 * TA: Forward + details edit in one call (optional).
 */
export async function taForwardWithDetails(
  requestId: number,
  taReviewerId: number,
  details:
    | { requestType: "claim"; details: Partial<ClaimDetails> }
    | { requestType: "swap"; details: Partial<SwapDetails> }
    | { requestType: "correction"; details: Partial<CorrectionDetails> }
    | { requestType: "cancellation"; details: Partial<CancellationDetails> }
    | { requestType: "query"; details: null },
  reason?: string,
  reviewerNote?: string,
) {
  const res = await patchTutorRequest({
    requestId,
    requestStatus: "pending_uc",
    reviewer: taReviewerId,
    requestReason: reason ?? null,
    reviewerNote: reviewerNote ?? null,
    ...details,
  });
  return expectSuccess(res);
}

// =============================================================
//  E) REQUESTER/GENERAL HELPERS (optional)
// =============================================================

/**
 * Requester: withdraw/cancel their request (maps to your DB enum).
 */
export async function cancelRequest(requestId: number) {
  const res = await patchTutorRequest({
    requestId,
    requestStatus: "cancelled",
  });
  return expectSuccess(res);
}

/**
 * Clear all details safely for known types.
 */
export async function clearAllDetailsKnown(
  requestId: number,
  types: Array<"claim" | "swap" | "correction" | "cancellation" | "query">,
) {
  for (const t of types) {
    await clearDetailsFor(requestId, t);
  }
}

/**
 * Convenience: set multiple core fields without touching details.
 */
export async function updateCoreFields(
  requestId: number,
  opts: {
    status?:
      | "pending_ta"
      | "pending_uc"
      | "approved"
      | "rejected"
      | "cancelled";
    reviewer?: number | null;
    reason?: string | null;
    note?: string | null;
  },
) {
  const res = await patchTutorRequest({
    requestId,
    requestStatus: opts.status,
    reviewer: opts.reviewer,
    requestReason: opts.reason,
    reviewerNote: opts.note,
  });
  return expectSuccess(res);
}
