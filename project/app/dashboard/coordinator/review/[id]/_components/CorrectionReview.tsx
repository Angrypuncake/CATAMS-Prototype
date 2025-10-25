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
import type { TutorAllocationRow } from "@/app/_types/allocations";
import type { Tutor } from "@/app/_types/tutor";
import { getTutorById } from "@/app/services/userService";
import { getAllocationById } from "@/app/services/allocationService";
import { formatDate } from "./SwapReview";
import { useRouter } from "next/navigation";
import { CurrentUser } from "@/app/_types/user";
import { getUserFromAuth } from "@/app/services/authService";
import {
  ucApproveRequest,
  ucRejectRequest,
} from "@/app/services/requestService";

export default function CorrectionReview({ data }: { data: TutorRequest }) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [allocation, setAllocation] = useState<TutorAllocationRow | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  const allocationId = data?.allocationId;
  const requesterId = data?.requesterId;

  useEffect(() => {
    if (!allocationId || !requesterId) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const [user, tutorData, alloc] = await Promise.all([
          getUserFromAuth(),
          getTutorById(String(requesterId)),
          getAllocationById(String(allocationId)),
        ]);
        setUser(user);
        setTutor(tutorData);
        setAllocation(alloc);
      } catch (err) {
        console.error("❌ Failed to load correction review:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [allocationId, requesterId]);

  // Ensure we render even if requestType differs
  if (!data) {
    return (
      <Typography variant="body2" color="text.secondary">
        No request data available.
      </Typography>
    );
  }

  const { requestStatus, requestReason, requestId, createdAt, requestType } =
    data;

  const details = data.details as {
    date: string;
    hours: string | number;
    end_at?: string;
    start_at?: string;
    location?: string;
    session_type?: string;
  };

  const handleApprove = async () => {
    if (!user) return alert("User not authenticated");

    try {
      setLoading(true);

      await ucApproveRequest(requestId, user.userId, `Approved. ${comment}`);

      alert("Request approved successfully.");
      setTimeout(() => router.push(`/dashboard/coordinator`), 2000);
    } catch (err) {
      console.error("Error approving Request:", err);
      alert("Approval failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };
  const handleReject = async () => {
    if (!user) return alert("User not authenticated");

    try {
      setLoading(true);

      await ucRejectRequest(requestId, user.userId, "UC rejection", comment);

      alert("Request Rejected successfully.");
      setTimeout(() => router.push(`/dashboard/coordinator`), 2000);
    } catch (err) {
      console.error("Error rejecting Request:", err);
      alert("Rejection failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Only render for correction request type
  if (requestType !== "correction") {
    return null;
  }

  // -------------------------------
  //  RENDER
  // -------------------------------
  return (
    <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={600}>
          Correction Request Review
        </Typography>
        <Chip
          label={(requestStatus || "pending").toUpperCase()}
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

      {/* REQUESTED CORRECTION DETAILS */}
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Requested Correction Details
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 3,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          <strong>Date</strong>
        </Typography>
        <Typography variant="body2" color="text.primary" mb={1}>
          {details.date}
        </Typography>

        {details.start_at && details.end_at && (
          <>
            <Typography variant="body2" color="text.secondary">
              <strong>Time</strong>
            </Typography>
            <Typography variant="body2" color="text.primary" mb={1}>
              {details.start_at} - {details.end_at}
            </Typography>
          </>
        )}

        {details.location && (
          <>
            <Typography variant="body2" color="text.secondary">
              <strong>Location</strong>
            </Typography>
            <Typography variant="body2" color="text.primary" mb={1}>
              {details.location}
            </Typography>
          </>
        )}

        <Typography variant="body2" color="text.secondary">
          <strong>Hours</strong>
        </Typography>
        <Typography variant="body2" color="text.primary" mb={1}>
          {details.hours}
        </Typography>

        {details.session_type && (
          <>
            <Typography variant="body2" color="text.secondary">
              <strong>Session Type</strong>
            </Typography>
            <Typography variant="body2" color="text.primary" mb={1}>
              {details.session_type}
            </Typography>
          </>
        )}
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          {/* INITIATOR + ALLOCATION */}
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            gap={3}
            mb={3}
          >
            {/* Initiator */}
            <Paper
              variant="outlined"
              sx={{
                flex: 1,
                p: 3,
                minWidth: { xs: "100%", md: "30%" },
              }}
            >
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
                  Tutor info not found
                </Typography>
              )}
            </Paper>

            {/* Original Allocation */}
            <Paper
              variant="outlined"
              sx={{
                flex: 2,
                p: 3,
                minWidth: { xs: "100%", md: "65%" },
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Original Allocation
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
                    Hours: {allocation.hours}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {allocation.location}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.disabled">
                  Loading allocation...
                </Typography>
              )}
            </Paper>
          </Box>

          {/* COMPARISON CARD */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Correction Comparison
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mb: 3,
              bgcolor: "background.default",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
            }}
          >
            {/* Original */}
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Original
              </Typography>
              {allocation ? (
                <>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      textDecoration: "line-through",
                    }}
                  >
                    Date: {formatDate(allocation.session_date)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      textDecoration: "line-through",
                    }}
                  >
                    Hours: {allocation.hours}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      textDecoration: "line-through",
                    }}
                  >
                    End: {allocation.end_at}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.disabled">
                  No allocation data
                </Typography>
              )}
            </Box>

            {/* Corrected */}
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Corrected
              </Typography>
              <Typography variant="body2" sx={{ color: "success.main" }}>
                Date:{" "}
                {details.date
                  ? new Date(details.date).toLocaleDateString()
                  : "N/A"}
              </Typography>
              <Typography variant="body2" sx={{ color: "success.main" }}>
                Hours: {details.hours ?? "N/A"} hrs
              </Typography>
              {details.end_at && (
                <Typography variant="body2" sx={{ color: "success.main" }}>
                  End: {details.end_at}
                </Typography>
              )}
            </Box>
          </Paper>

          {/* REASON */}
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Request Reason
          </Typography>
          <Paper
            variant="outlined"
            sx={{ p: 2, mb: 3, bgcolor: "action.hover" }}
          >
            <Typography variant="body2" color="text.secondary">
              {requestReason || "No reason provided"}
            </Typography>
          </Paper>

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
            placeholder="Add notes or remarks for this decision..."
            sx={{ mb: 3 }}
          />

          {/* ACTION BUTTONS */}
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="success"
              onClick={handleApprove}
              disabled={loading}
            >
              Approve Correction
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleReject}
              disabled={loading}
            >
              Reject
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
}
