"use client";
import { Box, Paper, Divider } from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";

import EligibleAllocationsTable from "./EligibleAllocationsTable";
import SwapSummary from "./SwapSummary";
import {
  ucApproveRequest,
  ucRejectRequest,
  taRejectRequest,
  taForwardWithDetails, // 🆕 import
} from "@/app/services/requestService";
import type { TutorRequest } from "@/app/_types/request";
import type { AdminAllocationRow } from "@/app/_types/allocations";
import { useSwapReview } from "./swapcomponents/useSwapReview";
import { useEffect, useState } from "react";
import SwapHeader from "./swapcomponents/SwapHeader";
import InitiatorCard from "./swapcomponents/InitiatorCard";
import SuggestedTutorCard from "./swapcomponents/SuggestedTutorCard";
import ReviewerActions from "./swapcomponents/ReviewerActions";
import {
  getAdminAllocationById,
  swapAllocations,
} from "@/app/services/allocationService";

type ReviewRole = "UC" | "TA" | "USER";

// Helper that extracts a tutor id from the selected allocation row without `any`
function getTutorIdFromAllocation(
  row: AdminAllocationRow | null,
): number | null {
  if (!row) return null;
  // Prefer explicit fields if you have them on AdminAllocationRow:
  // Try common candidates in a safe order:

  const candidateKeys: Array<keyof AdminAllocationRow> = [
    "user_id" as keyof AdminAllocationRow,
    "tutor_id" as keyof AdminAllocationRow,
    "tutorId" as keyof AdminAllocationRow,
  ];
  for (const k of candidateKeys) {
    const v = (row as Record<string, unknown>)[k];
    if (typeof v === "number") return v;
  }
  return null;
}

export default function SwapReview({
  data,
  role = "UC",
  readOnly = false,
  currentUserId,
}: {
  data: TutorRequest;
  role?: ReviewRole;
  readOnly?: boolean;
  currentUserId?: number;
}) {
  const { allocationId, requestStatus, requestId, createdAt, requesterId } =
    data || {};

  const {
    loadingEligible,
    sourceTutor,
    suggestedTutor,
    sourceAllocation,
    eligibleAllocations,
  } = useSwapReview(data);

  const [reviewerNote, setReviewerNote] = useState("");
  const [selectedAllocation, setSelectedAllocation] =
    useState<AdminAllocationRow | null>(null);

  useEffect(() => {
    if (!data) return;
    const suggestedAllocId = data.details?.suggested_alloc_id;
    console.log("DATA", data);
    console.log("DATA.details", data.details);
    console.log("DATA.suggested_alloc_id", data.details?.suggested_alloc_id);

    if (!suggestedAllocId) return;

    (async () => {
      try {
        const allocation = await getAdminAllocationById(
          String(suggestedAllocId),
        );
        console.log("Fetched allocation:", allocation);
        setSelectedAllocation(allocation);
      } catch (err) {
        console.error("Error fetching allocation:", err);
      }
    })();
  }, [data]);

  // Only render for swap requests (after all hooks are called)
  if (!data || data.requestType !== "swap") return null;

  const isReadOnly =
    readOnly || role === "USER" || requestStatus === "approved";

  // Resolve the suggested tutor id from either a selection or the pre-filled suggestion
  const resolvedSuggestedTutorId: number | null = (() => {
    const fromSelection = getTutorIdFromAllocation(selectedAllocation);
    if (fromSelection !== null) return fromSelection;
    // Fallback to suggestedTutor object (from hook) if it exists
    if (
      suggestedTutor &&
      typeof (suggestedTutor as Record<string, unknown>)["user_id"] === "number"
    ) {
      return (suggestedTutor as Record<string, number>)["user_id"];
    }
    if (
      suggestedTutor &&
      typeof (suggestedTutor as Record<string, unknown>)["tutor_id"] ===
        "number"
    ) {
      return (suggestedTutor as Record<string, number>)["tutor_id"];
    }
    if (
      suggestedTutor &&
      typeof (suggestedTutor as Record<string, unknown>)["id"] === "number"
    ) {
      return (suggestedTutor as Record<string, number>)["id"];
    }
    return null;
  })();

  const actions = {
    approveUC: async () => {
      try {
        // 1️⃣ Approve the request via UC API
        await ucApproveRequest(Number(requestId), currentUserId!, reviewerNote);

        // 2️⃣ Once approved, trigger allocation swap (only if details are complete)
        const allocA_id = Number(allocationId); // original allocation
        const allocB_id = Number(data.details?.suggested_alloc_id);

        if (allocA_id && allocB_id) {
          await swapAllocations(allocA_id, allocB_id);
          console.log("✅ Allocations swapped successfully.");
        } else {
          console.warn("⚠️ Skipped swap — missing allocation IDs.");
        }

        // 3️⃣ Optionally reload the request or mark read-only state
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (err) {
        console.error("Error approving UC request:", err);
      }
    },

    rejectUC: () =>
      ucRejectRequest(
        Number(requestId),
        currentUserId!,
        undefined,
        reviewerNote,
      ),

    // 🔹 TA forwards to UC AND includes swap details (suggested_tutor_id)
    forwardTA: async () => {
      // Require a concrete suggested tutor id to forward a swap
      if (resolvedSuggestedTutorId === null) {
        // Replace with your toast/snackbar
        throw new Error(
          "Please select a tutor to propose for the swap before forwarding.",
        );
      }
      return taForwardWithDetails(
        Number(requestId),
        11,
        {
          requestType: "swap",
          details: {
            suggested_tutor_id: resolvedSuggestedTutorId,
            suggested_alloc_id: Number(selectedAllocation.id),
          },
        },
        undefined, // reason
        reviewerNote ?? undefined,
      );
    },

    rejectTA: () =>
      taRejectRequest(
        Number(requestId),
        currentUserId!,
        undefined,
        reviewerNote,
      ),
  };

  return (
    <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
      <SwapHeader
        requestId={requestId}
        requestStatus={requestStatus}
        createdAt={createdAt}
      />
      <Divider sx={{ my: 3 }} />

      {/* INITIATOR + SUGGESTED TUTOR */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        alignItems="stretch"
        gap={3}
        mb={3}
      >
        <InitiatorCard
          tutorId={requesterId}
          allocationId={allocationId}
          sourceAllocation={sourceAllocation}
        />
        <Box display="flex" alignItems="center" justifyContent="center">
          <SwapHoriz fontSize="large" />
        </Box>
        <SuggestedTutorCard tutor={suggestedTutor} />
      </Box>

      {/* ELIGIBLE ALLOCATIONS */}
      {role !== "USER" && (
        <EligibleAllocationsTable
          eligibleAllocations={eligibleAllocations}
          selectedAllocation={selectedAllocation}
          onSelect={setSelectedAllocation}
          loading={loadingEligible}
          readOnly={isReadOnly}
        />
      )}

      {/* SWAP SUMMARY */}
      {selectedAllocation && (
        <SwapSummary
          sourceTutor={sourceTutor}
          sourceAllocation={sourceAllocation}
          selectedAllocation={selectedAllocation}
          requesterId={data.requesterId}
          allocationId={allocationId}
        />
      )}

      <Divider sx={{ my: 3 }} />

      {/* REVIEWER ACTIONS */}
      <ReviewerActions
        note={reviewerNote}
        onChange={setReviewerNote}
        onApprove={actions.approveUC}
        onReject={role === "UC" ? actions.rejectUC : actions.rejectTA}
        onForward={actions.forwardTA} // now forwards with details
        role={role}
        readOnly={isReadOnly}
        loading={loadingEligible}
      />
    </Paper>
  );
}
