"use client";
import {
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import type { TutorRequest } from "@/app/_types/request";
import ReviewLayout from "./ReviewLayout";
import { useEffect, useState } from "react";
import { Tutor } from "@/app/_types/tutor";
import { getTutorById } from "@/app/services/userService";
import {
  ucRejectRequest,
  taForwardToUC,
  taRejectRequest,
} from "@/app/services/requestService";

type ReviewRole = "UC" | "TA" | "USER";

export default function QueryReview({
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
  const { requesterId, requestReason, createdAt, requestStatus, requestId } =
    data;
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [response, setResponse] = useState("");
  const [reviewerNote, setReviewerNote] = useState("");

  const isReadOnly = readOnly || role === "USER";
  const canAct = !isReadOnly && (role === "UC" || role === "TA");

  useEffect(() => {
    async function fetchTutor() {
      try {
        const tutorData = await getTutorById(String(requesterId));
        setTutor(tutorData);
      } catch (err) {
        console.error("Failed to fetch tutor:", err);
      }
    }
    fetchTutor();
  }, [requesterId]);

  // Actions:
  // For UC on "Query", a typical flow is to respond out-of-band + optionally mark resolved/rejected.
  // Here we provide 'Reject' (close) for UC, and TA can forward or reject.
  const rejectUC = async () => {
    if (!currentUserId) return;
    await ucRejectRequest(
      Number(requestId),
      currentUserId,
      undefined,
      reviewerNote || response || undefined,
    );
  };
  const forwardTA = async () => {
    if (!currentUserId) return;
    await taForwardToUC(
      Number(requestId),
      currentUserId,
      requestReason ?? undefined,
      reviewerNote || response || undefined,
    );
  };
  const rejectTA = async () => {
    if (!currentUserId) return;
    await taRejectRequest(
      Number(requestId),
      currentUserId,
      requestReason ?? undefined,
      reviewerNote || response || undefined,
    );
  };

  return (
    <ReviewLayout title="Query Request Review" data={data}>
      {/* Top Section — Tutor + Query Overview */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Tutor Info */}
        <Paper variant="outlined" sx={{ flex: 1, p: 3, minWidth: 280 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Tutor Details
          </Typography>
          {tutor ? (
            <Stack spacing={0.5}>
              <Typography color="text.secondary">
                <strong>ID:</strong> {tutor.user_id}
              </Typography>
              <Typography color="text.secondary">
                <strong>Name:</strong> {tutor.first_name} {tutor.last_name}
              </Typography>
              <Typography color="text.secondary">
                <strong>Email:</strong> {tutor.email}
              </Typography>
            </Stack>
          ) : (
            <Typography color="text.secondary">
              Loading tutor info...
            </Typography>
          )}
        </Paper>

        {/* Query Block */}
        <Paper
          variant="outlined"
          sx={{
            flex: 2,
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Tutor Query
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
            >
              {requestReason || "No query message provided."}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ alignSelf: "flex-end" }}
          >
            Submitted on: {new Date(createdAt).toLocaleString()} • Status:{" "}
            {requestStatus}
          </Typography>
        </Paper>
      </Box>

      {/* Reviewer Response (note: disabled if readOnly/USER) */}
      <Paper
        variant="outlined"
        sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Reviewer Response / Note
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="Write your response or note..."
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          disabled={isReadOnly}
        />
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder="Private reviewer note (not shown to tutor)"
          value={reviewerNote}
          onChange={(e) => setReviewerNote(e.target.value)}
          disabled={isReadOnly}
        />
        {canAct && (
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            {role === "UC" ? (
              <Button variant="outlined" color="error" onClick={rejectUC}>
                Close / Reject
              </Button>
            ) : (
              <>
                <Button variant="outlined" color="error" onClick={rejectTA}>
                  Reject
                </Button>
                <Button variant="contained" color="primary" onClick={forwardTA}>
                  Forward to UC
                </Button>
              </>
            )}
          </Stack>
        )}
      </Paper>
    </ReviewLayout>
  );
}
