"use client";
import { Typography, Box, Paper, Divider, Button, Stack, TextField } from "@mui/material";
import type { TutorRequest } from "@/app/_types/request";
import ReviewLayout from "./ReviewLayout";
import { useEffect, useState } from "react";
import { TutorAllocationRow } from "@/app/_types/allocations";
import { getAllocationById } from "@/app/services/allocationService";
import { formatDate } from "./swapcomponents/formatDate";
import { Tutor } from "@/app/_types/tutor";
import { getTutorById } from "@/app/services/userService";
import {
  ucApproveRequest,
  ucRejectRequest,
  taForwardToUC,
  taRejectRequest,
} from "@/app/services/requestService";

type ReviewRole = "UC" | "TA" | "USER";

export default function ClaimReview({
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
  const { allocationId, requestStatus, requestId, createdAt, requesterId, requestReason } = data;

  const details = data.details as { hours: number; paycode: string };
  const [allocation, setAllocation] = useState<TutorAllocationRow | null>(null);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [reviewerNote, setReviewerNote] = useState("");

  const isReadOnly = readOnly || role === "USER";
  const canAct = !isReadOnly && (role === "UC" || role === "TA");

  useEffect(() => {
    async function run() {
      try {
        const allocation = await getAllocationById(String(allocationId));
        setAllocation(allocation);

        const tutor = await getTutorById(String(requesterId));
        setTutor(tutor);
      } catch (err) {
        console.error("Failed to fetch allocation details:", err);
      }
    }
    run();
  }, [allocationId, requesterId]);

  // ---- Actions ----
  const approve = async () => {
    if (!currentUserId) return;
    await ucApproveRequest(Number(requestId), currentUserId, reviewerNote);
  };
  const rejectAsUC = async () => {
    if (!currentUserId) return;
    await ucRejectRequest(Number(requestId), currentUserId, undefined, reviewerNote);
  };
  const taForward = async () => {
    if (!currentUserId) return;
    await taForwardToUC(Number(requestId), currentUserId, requestReason ?? undefined, reviewerNote);
  };
  const taReject = async () => {
    if (!currentUserId) return;
    await taRejectRequest(
      Number(requestId),
      currentUserId,
      requestReason ?? undefined,
      reviewerNote
    );
  };

  return (
    <ReviewLayout title="Claim Request Review" data={data}>
      {/* ======= TOP SECTION: INITIATOR + SYSTEM RECORD ======= */}
      <Box display="flex" flexWrap="wrap" gap={3} alignItems="stretch" sx={{ mb: 3 }}>
        {/* INITIATOR DETAILS */}
        <Paper variant="outlined" sx={{ flex: 1, p: 3, borderRadius: 2, minWidth: 320 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            INITIATOR DETAILS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tutor ID: {requesterId}
          </Typography>
          {tutor && (
            <>
              <Typography variant="body2" color="text.secondary">
                Name: {tutor.first_name} {tutor.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {tutor.email}
              </Typography>
            </>
          )}
          <Typography variant="body2" color="text.secondary">
            Request ID: {requestId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {requestStatus}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Submitted: {formatDate(createdAt)}
          </Typography>
        </Paper>

        {/* SYSTEM ALLOCATION RECORD */}
        {allocation && (
          <Paper variant="outlined" sx={{ flex: 2, p: 3, borderRadius: 2, minWidth: 400 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              SYSTEM ALLOCATION RECORD
            </Typography>

            <Typography variant="body2" mb={1}>
              <strong>Unit:</strong> {allocation.unit_code} – {allocation.unit_name}
            </Typography>
            <Typography variant="body2">
              <strong>Session:</strong> {allocation.activity_name}
            </Typography>
            <Typography variant="body2">
              <strong>Date:</strong> {formatDate(allocation.session_date)}
            </Typography>
            <Typography variant="body2">
              <strong>Start:</strong> {allocation.start_at}
            </Typography>
            <Typography variant="body2">
              <strong>End:</strong> {allocation.end_at}
            </Typography>
            <Typography variant="body2">
              <strong>Location:</strong> {allocation.location}
            </Typography>
            <Typography variant="body2">
              <strong>System Hours:</strong> {allocation.hours}
            </Typography>
            <Typography variant="body2">
              <strong>System Paycode:</strong> {allocation.paycode_id ?? "—"}
            </Typography>

            {allocation.note && (
              <Box mt={2} p={1.5} sx={{ bgcolor: "action.hover", borderRadius: 1 }}>
                <Typography variant="subtitle2">Notes</Typography>
                <Typography variant="body2" color="text.secondary">
                  {allocation.note}
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </Box>

      {/* ======= MID SECTION: CLAIMED + REASON ======= */}
      <Box display="flex" flexWrap="wrap" gap={3} alignItems="stretch" sx={{ mb: 3 }}>
        {/* ALTERED DETAILS */}
        <Paper variant="outlined" sx={{ flex: 1, p: 3, borderRadius: 2, minWidth: 320 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            CLAIMED (ALTERED) DETAILS
          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Claimed Hours:</strong>{" "}
            <span
              style={{
                color: allocation?.hours !== details.hours ? "#d32f2f" : "inherit",
                fontWeight: allocation?.hours !== details.hours ? 600 : "normal",
              }}
            >
              {details.hours} hour(s)
            </span>
          </Typography>

          <Typography variant="body2">
            <strong>Paycode:</strong>{" "}
            <span
              style={{
                color: allocation?.paycode_id !== details.paycode ? "#d32f2f" : "inherit",
                fontWeight: allocation?.paycode_id !== details.paycode ? 600 : "normal",
              }}
            >
              {details.paycode}
            </span>
          </Typography>
        </Paper>

        {/* REASON BOX */}
        <Paper variant="outlined" sx={{ flex: 1.5, p: 3, borderRadius: 2, minWidth: 320 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            REQUEST REASON
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {requestReason || "No reason provided."}
          </Typography>
        </Paper>
      </Box>

      {/* Reviewer note (disabled in read-only) */}
      <TextField
        fullWidth
        multiline
        minRows={3}
        placeholder="Reviewer note (optional)"
        value={reviewerNote}
        onChange={(e) => setReviewerNote(e.target.value)}
        sx={{ mt: 2, mb: 3 }}
        disabled={isReadOnly}
      />

      {/* ======= REVIEW ACTIONS ======= */}
      {canAct && (
        <>
          <Divider sx={{ my: 3 }} />
          {role === "UC" ? (
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" color="error" onClick={rejectAsUC}>
                Reject
              </Button>
              <Button variant="contained" color="success" onClick={approve}>
                Approve
              </Button>
            </Stack>
          ) : role === "TA" ? (
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" color="error" onClick={taReject}>
                Reject
              </Button>
              <Button variant="contained" color="primary" onClick={taForward}>
                Forward to UC
              </Button>
            </Stack>
          ) : null}
        </>
      )}
    </ReviewLayout>
  );
}
