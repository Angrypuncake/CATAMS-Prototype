"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
  Box,
  FormLabel,
  FormControl,
  Stack,
  CircularProgress,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";

import type { AllocationBase } from "@/app/_types/allocations";
import { getFormattedAllocationById } from "@/app/services/allocationService";
import AllocationDetails from "../../_components/AllocationDetails";
import { Tutor } from "@/app/_types/tutor";
import { getTutorsByUnit } from "@/app/services/userService";
import { createRequestService } from "@/app/services/requestService";
import type { CreateRequestPayload } from "@/app/_types/request";
import { getUserFromAuth } from "@/app/services/authService";
import { Snackbar, Alert } from "@mui/material";

export default function SwapRequestPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [swapType, setSwapType] = useState("suggest");
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [reason, setReason] = useState("");
  const [allocation, setAllocation] = useState<AllocationBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  /* -------------------------------- Fetch Allocation & Tutors -------------------------------- */
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const mapped = await getFormattedAllocationById(id);
        let tutorsForUnit: Tutor[] = [];

        if (mapped?.unit_code) {
          tutorsForUnit = await getTutorsByUnit(mapped.unit_code);
        }

        if (!cancelled) {
          setTutors(tutorsForUnit);
          setAllocation(mapped);
        }
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

    if (!reason.trim()) {
      setErr("Please provide a reason for the swap.");
      return;
    }

    if (!allocation || !id) return;

    try {
      setSubmitting(true);
      const user = await getUserFromAuth();
      if (!user?.userId) throw new Error("Unable to fetch current user.");

      const payload: CreateRequestPayload<"swap"> = {
        requesterId: Number(user.userId),
        allocationId: Number(id),
        requestType: "swap",
        requestReason: reason.trim(),
        details: {
          suggested_tutor_id:
            swapType === "suggest" && selectedTutor
              ? selectedTutor.user_id
              : null,
          suggested_alloc_id: null,
        },
      };

      await createRequestService(payload);
      setSuccess("Swap request submitted successfully!"); // ← show banner or snackbar
      setTimeout(() => router.push(`/dashboard/tutor/allocations/${id}`), 2000);
    } catch (error) {
      console.error("Error submitting swap request:", error);
      setErr("Something went wrong while submitting.");
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

  if (err || !allocation) {
    return (
      <Box p={3}>
        <Typography color="error">{err ?? "Allocation not found"}</Typography>
      </Box>
    );
  }

  // check if the submission reason is set
  const isSubmitDisabled = !reason.trim();

  /* -------------------------------- Render Form -------------------------------- */
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Swap Request
      </Typography>

      <AllocationDetails allocation={allocation} />

      <form onSubmit={handleSubmit}>
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Swap Type</FormLabel>
          <RadioGroup
            value={swapType}
            onChange={(e) => setSwapType(e.target.value)}
          >
            <FormControlLabel
              value="suggest"
              control={<Radio />}
              label="Suggest another tutor to swap with"
            />
            <FormControlLabel
              value="coordinator"
              control={<Radio />}
              label="Let coordinator assign replacement"
            />
          </RadioGroup>
        </FormControl>

        <Autocomplete
          disabled={swapType !== "suggest"}
          options={tutors}
          getOptionLabel={(t) => `${t.first_name} ${t.last_name} (${t.email})`}
          value={selectedTutor}
          onChange={(e, newValue) => setSelectedTutor(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Find Tutor to Swap With"
              sx={{ mb: 3 }}
            />
          )}
        />

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Reason for Swap"
          placeholder="e.g., Clashes with INF01910 lab I am teaching."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
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
                ? "Please enter a justification to enable submission"
                : ""
            }
            placement="top"
          >
            {/* span is required because disabled buttons don't trigger tooltips */}
            <span>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitDisabled || submitting}
              >
                Submit Swap Request
              </Button>
            </span>
          </Tooltip>
        </Box>
      </form>
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
