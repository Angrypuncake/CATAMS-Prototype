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
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Eligible Allocations for Swap
      </Typography>

      {loadingEligible ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ overflowX: "auto" }}>
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th className="px-3 py-2 text-left font-semibold">Tutor</th>
                <th className="px-3 py-2 text-left font-semibold">Role</th>
                <th className="px-3 py-2 text-left font-semibold">Unit</th>
                <th className="px-3 py-2 text-left font-semibold">Activity</th>
                <th className="px-3 py-2 text-left font-semibold">Date</th>
                <th className="px-3 py-2 text-left font-semibold">Hours</th>
                <th className="px-3 py-2 text-left font-semibold">Location</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {eligibleAllocations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-3 text-center text-gray-500"
                  >
                    No eligible allocations found
                  </td>
                </tr>
              ) : (
                eligibleAllocations.map((a) => (
                  <tr
                    key={a.id ?? `${a.user_id}-${a.session_date}`}
                    style={{
                      backgroundColor:
                        selectedAllocation?.id === a.id
                          ? "#e8f5e9"
                          : "transparent",
                    }}
                  >
                    <td className="px-3 py-2">
                      {a.first_name} {a.last_name}
                    </td>
                    <td className="px-3 py-2">{a.teaching_role ?? "-"}</td>
                    <td className="px-3 py-2">{a.unit_code ?? "-"}</td>
                    <td className="px-3 py-2">{a.activity_name ?? "-"}</td>
                    <td className="px-3 py-2">{a.session_date ?? "-"}</td>
                    <td className="px-3 py-2">{a.hours ?? "-"}</td>
                    <td className="px-3 py-2">{a.location ?? "-"}</td>
                    <td className="px-3 py-2 text-right">
                      {!isReadOnly && (
                        <Button
                          size="small"
                          variant={
                            selectedAllocation?.id === a.id
                              ? "contained"
                              : "outlined"
                          }
                          color="primary"
                          onClick={() => setSelectedAllocation(a)}
                        >
                          {selectedAllocation?.id === a.id
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

      {/* SWAP SUMMARY */}
      {selectedAllocation && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Swap Summary
          </Typography>

          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              You&apos;re reviewing a swap between:
            </Typography>

            <Box
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              alignItems="stretch"
              justifyContent="space-between"
              gap={3}
            >
              {/* From (Initiator) */}
              <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  From
                </Typography>
                <Typography color="text.secondary">
                  Tutor Name:{" "}
                  {`${sourceTutor?.first_name ?? "-"} ${sourceTutor?.last_name ?? "-"}`}
                </Typography>
                <Typography color="text.secondary">
                  Tutor ID: {data.requesterId}
                </Typography>
                <Typography color="text.secondary">
                  Allocation ID: {allocationId}
                </Typography>
                <Typography variant="body2" mt={1}>
                  {sourceAllocation?.activity_name ?? "—"}
                </Typography>
              </Paper>

              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <SwapHoriz fontSize="large" />
              </Box>

              {/* To (Selected Allocation) */}
              <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  To
                </Typography>
                <Typography color="text.secondary">
                  Tutor: {selectedAllocation.first_name}{" "}
                  {selectedAllocation.last_name}
                </Typography>
                <Typography color="text.secondary">
                  Allocation ID: {selectedAllocation.id ?? "—"}
                </Typography>
                <Typography variant="body2" mt={1}>
                  {selectedAllocation.activity_name ?? "—"}
                </Typography>
              </Paper>
            </Box>

            <Typography variant="body2" color="text.secondary" mt={2}>
              <strong>Heads-up:</strong> This will replace the initiator’s
              allocation with{" "}
              <strong>
                {selectedAllocation.first_name} {selectedAllocation.last_name}
              </strong>{" "}
              for the same session (
              {selectedAllocation.session_date ?? "date unknown"}).
            </Typography>
          </Paper>
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
