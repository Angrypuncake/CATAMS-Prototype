"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Stack,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";

import { getFormattedAllocationById } from "@/app/services/allocationService";
import AllocationDetails from "../../_components/AllocationDetails";
import { getUserFromAuth } from "@/app/services/authService";
import { createRequestService } from "@/app/services/requestService";
import type { CreateRequestPayload } from "@/app/_types/request";
import type { AllocationBase } from "@/app/_types/allocations";

export default function QueryRequestPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const router = useRouter();
  const [allocation, setAllocation] = useState<AllocationBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* ------------------------------- Fetch Allocation ------------------------------- */
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const mapped = await getFormattedAllocationById(id);
        if (!cancelled) setAllocation(mapped);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setErr(msg || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* -------------------------------- Handle Submit -------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !details.trim()) {
      setErr("Please provide both a subject and detailed description.");
      return;
    }

    if (!allocation || !id) return;

    try {
      setSubmitting(true);
      const user = await getUserFromAuth();
      if (!user?.userId) throw new Error("Unable to fetch current user.");

      const payload: CreateRequestPayload<"query"> = {
        requesterId: Number(user.userId),
        allocationId: Number(id),
        requestType: "query",
        requestReason: `${subject.trim()} — ${details.trim()}`,
        details: null, // EmptyDetails enforced for query
      };

      await createRequestService(payload);
      setSuccess("Query submitted successfully!");
      setTimeout(() => router.push(`/dashboard/tutor/allocations/${id}`), 2000);
    } catch (error) {
      console.error("Error submitting query:", error);
      setErr("Something went wrong while submitting your query.");
      setTimeout(() => router.push(`/dashboard/tutor/allocations/${id}`), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------------------- Loading States -------------------------------- */
  if (loading) {
    return (
      <Box sx={{ p: 3, maxWidth: 960, mx: "auto" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={20} />
          <Typography variant="body2">Loading allocation…</Typography>
        </Stack>
      </Box>
    );
  }

  if (err && !allocation) {
    return (
      <Box p={3}>
        <Typography color="error">{err}</Typography>
      </Box>
    );
  }

  const isSubmitDisabled = !subject.trim() || !details.trim();

  /* -------------------------------- Render Form -------------------------------- */
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Query Request
      </Typography>

      {allocation && <AllocationDetails allocation={allocation} />}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Subject"
          placeholder="Short title for your query"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Details"
          placeholder="Write your question or clarification in detail"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => router.push("../")}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Tooltip
            title={
              isSubmitDisabled
                ? "Please complete both fields before submitting"
                : ""
            }
            placement="top"
          >
            <span>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitDisabled || submitting}
              >
                Submit Query
              </Button>
            </span>
          </Tooltip>
        </Box>
      </form>

      {/* Feedback Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccess(null)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!err}
        autoHideDuration={4000}
        onClose={() => setErr(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErr(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {err}
        </Alert>
      </Snackbar>
    </Container>
  );
}
