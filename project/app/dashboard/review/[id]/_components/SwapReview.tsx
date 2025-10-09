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
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";
import type { TutorRequest } from "@/app/_types/request";
import type { Tutor } from "@/app/_types/tutor";

import {
  getAllocationById,
  getAllocationsByUnitAndActivityType,
} from "@/app/services/allocationService";
import { AdminAllocationRow } from "@/app/_types/allocations";

export default function SwapReview({ data }: { data: TutorRequest }) {
  // -------------------------------
  //  State
  // -------------------------------
  const { allocationId, requestStatus, requestId, createdAt } = data;
  const [loadingEligible, setLoadingEligible] = useState(true);
  const [comment, setComment] = useState("");
  const [eligibleAllocations, setEligibleAllocations] = useState<
    AdminAllocationRow[]
  >([]);
  const [selectedAllocation, setSelectedAllocation] =
    useState<AdminAllocationRow | null>(null);

  // -------------------------------
  //  Fetch eligible tutors
  // -------------------------------
  useEffect(() => {
    async function loadEligible() {
      try {
        const source = await getAllocationById(String(allocationId));
        const unitCode = source.unit_code;
        const activityType = source.activity_type;

        const allocations = await getAllocationsByUnitAndActivityType(
          unitCode,
          activityType,
        );
        setEligibleAllocations(allocations);
      } catch (err) {
        console.error("Failed to fetch eligible allocations:", err);
      } finally {
        setLoadingEligible(false);
      }
    }
    loadEligible();
  }, [allocationId]);

  // -------------------------------
  //  Event handlers
  // -------------------------------
  const handleApprove = async () => {
    if (!selectedAllocation) {
      alert("Please select an allocation first.");
      return;
    }

    console.log("Approving swap:", {
      requestId,
      selectedAllocationId: selectedAllocation.id,
      selectedTutorId: selectedAllocation.user_id,
      comment,
    });

    // TODO: PATCH /api/requests/:id with selectedAllocation info
  };

  const handleReject = async () => {
    console.log("Rejecting swap:", { requestId, comment });
    // TODO: implement PATCH /api/requests/:id
  };
  if (data.requestType !== "swap") return null;

  // ✅ Everything below is narrowed to SwapRequest
  const { details } = data;

  // -------------------------------
  //  Render
  // -------------------------------
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
        <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Initiator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tutor ID: {data.requesterId}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2">Allocation ID: {allocationId}</Typography>
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
          <Typography color="text.secondary">
            ID: {details.suggested_tutor_id ?? "None"}
          </Typography>
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
                    <td className="px-3 py-2">{a.allocated_hours ?? "-"}</td>
                    <td className="px-3 py-2">{a.location ?? "-"}</td>
                    <td className="px-3 py-2 text-right">
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Paper>
      )}

      {/* REVIEWER COMMENT */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Reviewer Comment
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add notes for this decision..."
        sx={{ mb: 3 }}
      />

      {/* ACTION BUTTONS */}
      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          color="success"
          onClick={handleApprove}
          disabled={loadingEligible}
        >
          Approve
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleReject}
          disabled={loadingEligible}
        >
          Reject
        </Button>
      </Box>
    </Paper>
  );
}
