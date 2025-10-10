import { Typography, Box, Paper, Divider, Button, Stack } from "@mui/material";
import type { TutorRequest } from "@/app/_types/request";
import ReviewLayout from "./ReviewLayout";
import { useEffect, useState } from "react";
import { TutorAllocationRow } from "@/app/_types/allocations";
import { getAllocationById } from "@/app/services/allocationService";
import { formatDate } from "./SwapReview";

export default function ClaimReview({ data }: { data: TutorRequest }) {
  const {
    allocationId,
    requestStatus,
    requestId,
    createdAt,
    requesterId,
    requestReason,
  } = data;

  // Modified claim details (one of these must differ from system record)
  const details = data.details as { hours: number; paycode: string };

  const [allocation, setAllocation] = useState<TutorAllocationRow | null>(null);

  useEffect(() => {
    async function run() {
      try {
        const allocation = await getAllocationById(String(allocationId));
        setAllocation(allocation);
      } catch (err) {
        console.error("Failed to fetch allocation details:", err);
      }
    }
    run();
  }, [allocationId]);

  const handleApprove = () => {
    // TODO: integrate with backend approve endpoint
    console.log("Approved claim", requestId);
  };

  const handleReject = () => {
    // TODO: integrate with backend reject endpoint
    console.log("Rejected claim", requestId);
  };

  return (
    <ReviewLayout title="Claim Request Review" data={data}>
      {/* ========== INITIATOR DETAILS ========== */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          INITIATOR DETAILS
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tutor ID: {requesterId}
        </Typography>
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

      {/* ========== SYSTEM RECORD ========== */}
      {allocation && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            SYSTEM ALLOCATION RECORD
          </Typography>

          <Typography variant="body2" mb={1}>
            <strong>Unit:</strong> {allocation.unit_code} –{" "}
            {allocation.unit_name}
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
            <Box
              mt={2}
              p={1.5}
              sx={{ bgcolor: "action.hover", borderRadius: 1 }}
            >
              <Typography variant="subtitle2">Notes</Typography>
              <Typography variant="body2" color="text.secondary">
                {allocation.note}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* ========== ALTERED DETAILS ========== */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          CLAIMED (ALTERED) DETAILS
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Claimed Hours:</strong>{" "}
          <span
            style={{
              color:
                allocation?.hours !== details.hours ? "#d32f2f" : "inherit",
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
              color:
                allocation?.paycode_id !== details.paycode
                  ? "#d32f2f"
                  : "inherit",
              fontWeight:
                allocation?.paycode_id !== details.paycode ? 600 : "normal",
            }}
          >
            {details.paycode}
          </span>
        </Typography>
      </Paper>

      {/* ========== REASON BOX ========== */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          REQUEST REASON
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {requestReason || "No reason provided."}
        </Typography>
      </Paper>

      {/* ========== REVIEW ACTIONS ========== */}
      <Divider sx={{ my: 3 }} />
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" color="error" onClick={handleReject}>
          Reject
        </Button>
        <Button variant="contained" color="success" onClick={handleApprove}>
          Approve
        </Button>
      </Stack>
    </ReviewLayout>
  );
}
