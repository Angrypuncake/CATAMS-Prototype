"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Box,
  Autocomplete,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";

// --- Services ---
import { getFormattedAllocationById } from "@/app/services/allocationService";
import { getTutorsByUnit } from "@/app/services/userService";
import { createRequestService } from "@/app/services/requestService";

// --- Types ---
import { TutorAllocationRow } from "@/app/_types/allocations";
import { Tutor } from "@/app/_types/tutor";
import AllocationDetails from "../../_components/AllocationDetails";

export default function CancelRequestPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  // --- Data state ---
  const [allocation, setAllocation] = useState<TutorAllocationRow | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // --- Form state ---
  const [cancelType, setCancelType] = useState<"suggest" | "coordinator">(
    "suggest",
  );
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  /** ============================
   *  Load allocation + tutors
   *  ============================ */
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function run() {
      try {
        if (!cancelled) {
          setLoading(true);
          setErr(null);
        }

        const alloc = await getFormattedAllocationById(id);
        let tutorsForUnit: Tutor[] = [];

        if (alloc?.unit_code) {
          tutorsForUnit = await getTutorsByUnit(alloc.unit_code);
        }

        if (!cancelled) {
          setAllocation(alloc);
          setTutors(tutorsForUnit);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setErr(msg || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  /** ============================
   *  Fetch current user (from headers)
   *  ============================ */
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Failed to get user");
        const data = await res.json();
        console.log("Current user:", data);
        setUserId(data.userId);
      } catch (err) {
        console.error(err);
      }
    }

    fetchUser();
  }, []);

  /** ============================
   *  Submit handler
   *  ============================ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- Validation ---
    if (!reason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }
    if (!allocation) {
      alert("Missing allocation data.");
      return;
    }
    if (!userId) {
      alert("Could not resolve user ID. Please re-login.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        requesterId: Number(userId),
        allocationId: Number(allocation.id),
        requestType: "cancellation" as const,
        requestReason: reason,
        details: {
          suggestedUserId:
            cancelType === "suggest" ? (selectedTutor?.user_id ?? null) : null,
        },
      };

      const response = await createRequestService(payload);
      console.log("Cancellation request created:", response);

      // Optional: toast / snackbar notification
      // enqueueSnackbar("Cancellation submitted successfully", { variant: "success" });

      router.push(`/dashboard/tutor/allocations/${allocation.id}`);
    } catch (err) {
      console.error("Failed to submit cancellation:", err);
      alert("Failed to submit cancellation request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  /** ============================
   *  Render
   *  ============================ */
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

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Cancellation Request
      </Typography>

      <AllocationDetails allocation={allocation} />

      <form onSubmit={handleSubmit}>
        {/* Reason */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Reason for Cancellation"
          placeholder="e.g., Illness, timetable clash, or personal emergency."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ mb: 3 }}
          required
        />

        {/* Replacement option */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel>Replacement Option</FormLabel>
          <RadioGroup
            value={cancelType}
            onChange={(e) =>
              setCancelType(e.target.value as "suggest" | "coordinator")
            }
          >
            <FormControlLabel
              value="suggest"
              control={<Radio />}
              label="I will suggest a tutor"
            />
            <FormControlLabel
              value="coordinator"
              control={<Radio />}
              label="Let coordinator assign replacement"
            />
          </RadioGroup>
        </FormControl>

        {/* Tutor Autocomplete */}
        <Autocomplete
          disabled={cancelType !== "suggest"}
          options={tutors}
          getOptionLabel={(tutor) =>
            `${tutor.first_name} ${tutor.last_name} (${tutor.email})`
          }
          value={selectedTutor}
          onChange={(e, newValue) => setSelectedTutor(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Find Tutor (if suggesting)"
              sx={{ mb: 3 }}
            />
          )}
        />

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => router.push("../")}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Cancellation"}
          </Button>
        </Box>
      </form>
    </Container>
  );
}
