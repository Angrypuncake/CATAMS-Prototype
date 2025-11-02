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
import type { TutorRequest } from "@/app/_types/request";
import { getAllocationById } from "@/app/services/allocationService";
import { TutorAllocationRow } from "@/app/_types/allocations";
import { Tutor } from "@/app/_types/tutor";
import { getTutorById, getTutorsByUnit } from "@/app/services/userService";
import { formatDate } from "./swapcomponents/formatDate";
import {
  ucApproveRequest,
  ucRejectRequest,
  taForwardToUC,
  taRejectRequest,
} from "@/app/services/requestService";

type ReviewRole = "UC" | "TA" | "USER";

export default function CancellationReview({
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
  const {
    allocationId,
    requestStatus,
    requestReason,
    requestId,
    createdAt,
    requesterId,
  } = data;

  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [allocation, setAllocation] = useState<TutorAllocationRow | null>(null);
  const [reviewerNote, setReviewerNote] = useState("");
  const [availableTutors, setAvailableTutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  const isReadOnly = readOnly || role === "USER";
  const canAct = !isReadOnly && (role === "UC" || role === "TA");

  useEffect(() => {
    async function fetchData() {
      try {
        const [tutorData, alloc] = await Promise.all([
          getTutorById(String(requesterId)),
          getAllocationById(String(allocationId)),
        ]);
        setTutor(tutorData);
        setAllocation(alloc);

        if (alloc.unit_code) {
          const tutors = await getTutorsByUnit(alloc.unit_code);
          setAvailableTutors(tutors);
        } else {
          setAvailableTutors([]);
        }
      } catch (err) {
        console.error("Failed to load cancellation details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [allocationId, requesterId]);

  // ---- Actions ----
  const approveUC = async () => {
    if (!currentUserId) return;
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
      requestReason ?? undefined,
      reviewerNote,
    );
  };
  const rejectTA = async () => {
    if (!currentUserId) return;
    await taRejectRequest(
      Number(requestId),
      currentUserId,
      requestReason ?? undefined,
      reviewerNote,
    );
  };

  if (data.requestType !== "cancellation") return null;

  return (
    <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={600}>
          Cancellation Request Review
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

      {/* INITIATOR & ALLOCATION */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        gap={3}
        mb={3}
      >
        {/* Initiator */}
        <Paper variant="outlined" sx={{ flex: 1, p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Initiator Details
          </Typography>
          {tutor ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Name: {tutor.first_name} {tutor.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {tutor.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tutor ID: {tutor.user_id}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.disabled">
              Loading tutor details...
            </Typography>
          )}
        </Paper>

        {/* Allocation */}
        <Paper variant="outlined" sx={{ flex: 2, p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Allocation Scheduled for Cancellation
          </Typography>
          {allocation ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Unit: {allocation.unit_code} – {allocation.unit_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Session: {allocation.activity_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {formatDate(allocation.session_date)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Time: {allocation.start_at} – {allocation.end_at}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Location: {allocation.location}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hours: {allocation.hours}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.disabled">
              Loading allocation details...
            </Typography>
          )}
        </Paper>
      </Box>

      {/* REASON */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Request Reason
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "action.hover" }}>
        <Typography variant="body2" color="text.secondary">
          {requestReason || "No reason provided"}
        </Typography>
      </Paper>

      {/* Optional Replacement Tutor — only visible to UC/TA */}
      {role !== "USER" && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Optional Replacement Tutor
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Paper variant="outlined" sx={{ overflowX: "auto" }}>
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th className="px-3 py-2 text-left font-semibold">
                      Tutor ID
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">Name</th>
                    <th className="px-3 py-2 text-left font-semibold">Email</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {availableTutors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-3 text-center text-gray-500"
                      >
                        No available tutors found for this unit
                      </td>
                    </tr>
                  ) : (
                    availableTutors.map((t) => (
                      <tr
                        key={t.user_id}
                        style={{
                          backgroundColor:
                            selectedTutor?.user_id === t.user_id
                              ? "#e8f5e9"
                              : "transparent",
                        }}
                      >
                        <td className="px-3 py-2">{t.user_id}</td>
                        <td className="px-3 py-2">
                          {t.first_name} {t.last_name}
                        </td>
                        <td className="px-3 py-2">{t.email}</td>
                        <td className="px-3 py-2 text-right">
                          {!isReadOnly && (
                            <Button
                              size="small"
                              variant={
                                selectedTutor?.user_id === t.user_id
                                  ? "contained"
                                  : "outlined"
                              }
                              onClick={() => setSelectedTutor(t)}
                            >
                              {selectedTutor?.user_id === t.user_id
                                ? "Selected"
                                : "Select"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Paper>
          )}
        </>
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
        placeholder="Add notes or remarks..."
        sx={{ mb: 3 }}
        disabled={isReadOnly}
      />

      {/* ACTION BUTTONS */}
      {canAct && (
        <Box display="flex" gap={2}>
          {role === "UC" ? (
            <>
              <Button variant="contained" color="success" onClick={approveUC}>
                Approve Cancellation
              </Button>
              <Button variant="outlined" color="error" onClick={rejectUC}>
                Reject
              </Button>
            </>
          ) : (
            <>
              <Button variant="contained" color="primary" onClick={forwardTA}>
                Forward to UC
              </Button>
              <Button variant="outlined" color="error" onClick={rejectTA}>
                Reject
              </Button>
            </>
          )}
        </Box>
      )}
    </Paper>
  );
}
