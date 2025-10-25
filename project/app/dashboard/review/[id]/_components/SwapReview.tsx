"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";
import type { TutorRequest } from "@/app/_types/request";

import {
  getAllocationById,
  getAllocationsByUnitAndActivityType,
} from "@/app/services/allocationService";
import {
  AdminAllocationRow,
  TutorAllocationRow,
} from "@/app/_types/allocations";
import { Tutor } from "@/app/_types/tutor";
import { getTutorById } from "@/app/services/userService";
import {
  ucApproveRequest,
  ucRejectRequest,
  taForwardToUC,
  taRejectRequest,
} from "@/app/services/requestService";
import SwapSummary from "./SwapSummary";
import EligibleAllocationsTable from "./EligibleAllocationsTable";

export function formatDate(isoString?: string | null): string {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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

  const [loadingEligible, setLoadingEligible] = useState(true);
  const [reviewerNote, setReviewerNote] = useState("");
  const [sourceTutor, setSourcetutor] = useState<Tutor | null>(null);
  const [suggestedTutor, setSuggestedTutor] = useState<Tutor | null>(null);
  const [sourceAllocation, setsourceAllocationAllocation] =
    useState<TutorAllocationRow | null>(null);
  const [eligibleAllocations, setEligibleAllocations] = useState<
    AdminAllocationRow[]
  >([]);
  const [selectedAllocation, setSelectedAllocation] =
    useState<AdminAllocationRow | null>(null);

  const isReadOnly = readOnly || role === "USER";
  const canAct = !isReadOnly && (role === "UC" || role === "TA");

  // Fetch eligible tutors
  useEffect(() => {
    async function loadEligible() {
      try {
        const source = await getAllocationById(String(allocationId));
        const unitCode = source.unit_code;
        const activityType = source.activity_type;

        const tutor = await getTutorById(String(requesterId));

        if (data.requestType === "swap" && data.details) {
          const { details } = data;
          if (details?.suggested_tutor_id) {
            const sug = await getTutorById(String(details.suggested_tutor_id));
            setSuggestedTutor(sug);
          }
        }

        setSourcetutor(tutor);
        setsourceAllocationAllocation(source);

        const allocations = await getAllocationsByUnitAndActivityType(
          unitCode,
          activityType,
          requesterId,
        );
        setEligibleAllocations(allocations);
      } catch (err) {
        console.error("Failed to fetch eligible allocations:", err);
      } finally {
        setLoadingEligible(false);
      }
    }
    loadEligible();
  }, [allocationId, requesterId, data]);

  if (data.requestType !== "swap") return null;

  // Actions
  const approveUC = async () => {
    if (!currentUserId) return;
    // You might extend your backend to accept selectedAllocation if needed.
    await ucApproveRequest(Number(requestId), currentUserId, reviewerNote);
  };
  const rejectUC = async () => {
    if (!currentUserId) return;
    await ucRejectRequest(
      Number(requestId),
      currentUserId,
      undefined,
      reviewerNote,
    );
  };
  const forwardTA = async () => {
    if (!currentUserId) return;
    await taForwardToUC(
      Number(requestId),
      currentUserId,
      undefined,
      reviewerNote,
    );
  };
  const rejectTA = async () => {
    if (!currentUserId) return;
    await taRejectRequest(
      Number(requestId),
      currentUserId,
      undefined,
      reviewerNote,
    );
  };

  const { details } = data;

  // ------------------------------- Render -------------------------------
  return (
    <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={600}>
          Swap Request Review
        </Typography>
        <Chip
          label={requestStatus.toUpperCase()}
          color={
            requestStatus === "approved"
              ? "success"
              : requestStatus === "rejected"
                ? "error"
                : "warning"
          }
        />
      </Box>

      <Typography variant="body2" color="text.secondary" mt={0.5}>
        Request ID: {requestId} • Created:{" "}
        {new Date(createdAt).toLocaleString()}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* COMPARISON BLOCK */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        alignItems="stretch"
        justifyContent="space-between"
        gap={3}
        mb={3}
      >
        {/* Initiator */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            INITIATOR
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Tutor ID: {data.requesterId}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Allocation ID: {allocationId}
          </Typography>

          {sourceAllocation && (
            <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {sourceAllocation.unit_code} – {sourceAllocation.unit_name}
              </Typography>

              <Typography
                variant="caption"
                color="success.main"
                fontWeight={600}
              >
                Approved Allocation
              </Typography>

              <Box mt={1.5}>
                <Typography variant="body2">
                  <strong>Date:</strong>{" "}
                  {formatDate(sourceAllocation.session_date)}
                </Typography>
                <Typography variant="body2">
                  <strong>Start:</strong> {sourceAllocation.start_at}
                </Typography>
                <Typography variant="body2">
                  <strong>End:</strong> {sourceAllocation.end_at}
                </Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {sourceAllocation.location}
                </Typography>
                <Typography variant="body2">
                  <strong>Hours:</strong> {sourceAllocation.hours}
                </Typography>
                <Typography variant="body2">
                  <strong>Session:</strong> {sourceAllocation.activity_name}
                </Typography>
              </Box>

              {sourceAllocation.note && (
                <Box
                  mt={2}
                  p={1.5}
                  sx={{ bgcolor: "action.hover", borderRadius: 1 }}
                >
                  <Typography variant="subtitle2">Notes</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sourceAllocation.note}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <SwapHoriz fontSize="large" />
        </Box>

        {/* Suggested Tutor */}
        <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Suggested Tutor
          </Typography>

          {details?.suggested_tutor_id && suggestedTutor ? (
            <>
              <Typography color="text.secondary">
                ID: {suggestedTutor.user_id}
              </Typography>
              <Typography color="text.secondary">
                Name: {suggestedTutor.first_name} {suggestedTutor.last_name}
              </Typography>
              <Typography color="text.secondary">
                Email: {suggestedTutor.email}
              </Typography>

              {suggestedTutor.units && suggestedTutor.units.length > 0 && (
                <Box mt={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Units:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {suggestedTutor.units.join(", ")}
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Typography color="text.disabled">No suggested tutor</Typography>
          )}
        </Paper>
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

      {/* REVIEWER NOTE */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Reviewer Note
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={3}
        value={reviewerNote}
        onChange={(e) => setReviewerNote(e.target.value)}
        placeholder="Add notes for this decision..."
        sx={{ mb: 3 }}
        disabled={isReadOnly}
      />

      {/* ACTION BUTTONS */}
      {canAct && (
        <Box display="flex" gap={2}>
          {role === "UC" ? (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={approveUC}
                disabled={loadingEligible}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={rejectUC}
                disabled={loadingEligible}
              >
                Reject
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={forwardTA}
                disabled={loadingEligible}
              >
                Forward to UC
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={rejectTA}
                disabled={loadingEligible}
              >
                Reject
              </Button>
            </>
          )}
        </Box>
      )}
    </Paper>
  );
}
