import type {
  BasicRequest,
  CreateRequestPayload,
  PaginatedRequests,
  TutorCorrectionPayload,
  TutorRequest,
  UCApproval,
  UCApprovalResponse,
} from "@/app/_types/request";
import axios from "@/lib/axios";
import { getCoordinatorUnits } from "./unitService";

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
          details: { suggested_tutor_id: 10 },
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
