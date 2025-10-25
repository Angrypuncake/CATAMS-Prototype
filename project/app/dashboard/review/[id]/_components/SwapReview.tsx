"use client";
import { Box, Paper, Divider } from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";

import EligibleAllocationsTable from "./EligibleAllocationsTable";
import SwapSummary from "./SwapSummary";
import {
  ucApproveRequest,
  ucRejectRequest,
  taForwardToUC,
  taRejectRequest,
} from "@/app/services/requestService";
import type { TutorRequest } from "@/app/_types/request";
import type { AdminAllocationRow } from "@/app/_types/allocations";
import { useSwapReview } from "./swapcomponents/useSwapReview";
import { useState } from "react";
import SwapHeader from "./swapcomponents/SwapHeader";
import InitiatorCard from "./swapcomponents/InitiatorCard";
import SuggestedTutorCard from "./swapcomponents/SuggestedTutorCard";
import ReviewerActions from "./swapcomponents/ReviewerActions";

type ReviewRole = "UC" | "TA" | "USER";

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
    data;

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

  const isReadOnly = readOnly || role === "USER";

  const actions = {
    approveUC: () =>
      ucApproveRequest(Number(requestId), currentUserId!, reviewerNote),
    rejectUC: () =>
      ucRejectRequest(
        Number(requestId),
        currentUserId!,
        undefined,
        reviewerNote,
      ),
    forwardTA: () =>
      taForwardToUC(Number(requestId), currentUserId!, undefined, reviewerNote),
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
        onForward={actions.forwardTA}
        role={role}
        readOnly={isReadOnly}
        loading={loadingEligible}
      />
    </Paper>
  );
}
