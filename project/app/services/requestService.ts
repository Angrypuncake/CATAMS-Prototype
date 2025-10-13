import type {
  CreateRequestPayload,
  TutorCorrectionPayload,
  TutorRequest,
} from "@/app/_types/request";
import axios from "@/lib/axios";

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

//query request for an allocation
export async function submitQueryRequest(
  allocationId: string,
  data: {
    subject: string;
    details: string;
    attachment?: File;
  },
): Promise<void> {
  const formData = new FormData();
  formData.append("type", "query");
  formData.append("subject", data.subject);
  formData.append("details", data.details);
  if (data.attachment) {
    formData.append("attachment", data.attachment);
  }

  await axios.post(
    `/tutor/allocations/${allocationId}/requests/query`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
}
