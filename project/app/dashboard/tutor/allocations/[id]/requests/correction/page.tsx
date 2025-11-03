"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  FormControlLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getAllocationById } from "@/app/services/allocationService";
import { TutorAllocationRow } from "@/app/_types/allocations";
import { Tooltip } from "@mui/material";
import { CreateRequestPayload } from "@/app/_types/request";
import { createRequestService } from "@/app/services/requestService";

export default function CorrectionRequestPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const allocationId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [allocation, setAllocation] = useState<TutorAllocationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  /** Correction toggles + input state */
  const [corrections, setCorrections] = useState({
    date: false,
    time: false,
    location: false,
    hours: false,
    session: false,
  });

  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    hours: "",
    session: "",
    justification: "",
  });

  /** Session type mapping for display */
  const sessionTypeMap: Record<string, string> = {
    "Workshop session": "Lab",
    "Tutorial session": "Tutorial",
    "Lecture session": "Lecture",
  };

  const statusMap: {
    [key: string]: { label: string; color: "success" | "warning" | "default" };
  } = {
    "Approved Allocation": { label: "Approved", color: "success" },
    "Hours for Review": { label: "Pending", color: "warning" },
    "Ignore class": { label: "Cancelled", color: "default" },
  };

  /** Format date → dd-mm-yyyy */
  const formatDate = (origDate: string): string => {
    const d = new Date(origDate);
    if (isNaN(d.getTime())) return "—";
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${d.getFullYear()}`;
  };

  // Fetch the current logged in user

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

  /** Fetch allocation */
  useEffect(() => {
    if (!allocationId) return;
    let cancelled = false;

    async function run() {
      try {
        if (!cancelled) {
          setLoading(true);
          setError(null);
        }

        const data = await getAllocationById(allocationId);
        if (!cancelled) setAllocation(data);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setError(msg || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [allocationId]);

  /** Input handlers */
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key: keyof typeof corrections, checked: boolean) => {
    setCorrections((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = async () => {
    if (!form.justification.trim()) {
      setError("Please provide a justification before submitting.");
      return;
    }

    if (!allocationId || !allocation || !userId) return;

    const payload: CreateRequestPayload<"correction"> = {
      requesterId: Number(userId),
      allocationId,
      requestType: "correction",
      requestReason: form.justification.trim(),
      details: {
        date: corrections.date ? form.date : (allocation.session_date ?? ""),
        start_at: corrections.time ? form.startTime : (allocation.start_at ?? ""),
        end_at: corrections.time ? form.endTime : (allocation.end_at ?? ""),
        location: corrections.location ? form.location : (allocation.location ?? ""),
        hours: corrections.hours ? form.hours : String(allocation.hours ?? ""),
        session_type: corrections.session ? form.session : (allocation.activity_type ?? ""),
      },
    };

    try {
      await createRequestService(payload);
      setSuccess(true);
      setTimeout(() => router.back(), 2000);
    } catch (e) {
      console.error(e);
      setError("Something went wrong while submitting.");
    }
  };

  /** Loading & Error states */
  if (loading)
    return (
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <CircularProgress size={20} />
        <Typography>Loading allocation...</Typography>
      </Box>
    );
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;
  if (!allocation) return <p>No allocation found</p>;

  // Detect whether the justification text is filled out, if it isnt we're going to prevent clicking on submission
  const isSubmitDisabled = !form.justification.trim();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Snackbars */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          Correction submitted successfully.
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error && !success}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Link
          href="/dashboard/tutor/"
          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <ArrowBackIcon fontSize="small" /> Back to Allocation
        </Link>
      </Stack>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Correction Request
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        Use this when allocation details are incorrect (date, time, location, hours, or session
        type).
      </Typography>

      {/* Summary */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: "#f9f9f9" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={600}>
            {allocation.unit_code} – {allocation.unit_name}
          </Typography>
          <Chip
            label={statusMap[allocation.status ?? ""]?.label ?? "Unknown"}
            color={statusMap[allocation.status ?? ""]?.color ?? "default"}
            size="small"
          />
        </Stack>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Date: {formatDate(allocation.session_date ?? "—")} • Time: {allocation.start_at ?? "—"} –{" "}
          {allocation.end_at ?? "—"} • Location: {allocation.location ?? "—"} • Hours:{" "}
          {allocation.hours ?? "—"} • Session:{" "}
          {sessionTypeMap[allocation.activity_type ?? ""] ?? allocation.activity_type ?? "—"}
        </Typography>
      </Paper>

      {/* System vs Correction */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="stretch">
        {/* System Record */}
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            System Record
          </Typography>
          <dl className="grid grid-cols-2 text-sm gap-y-1">
            <dt>Date:</dt>
            <dd>{formatDate(allocation.session_date ?? "—")}</dd>
            <dt>Start Time:</dt>
            <dd>{allocation.start_at ?? "—"}</dd>
            <dt>End Time:</dt>
            <dd>{allocation.end_at ?? "—"}</dd>
            <dt>Location:</dt>
            <dd>{allocation.location ?? "—"}</dd>
            <dt>Hours:</dt>
            <dd>{allocation.hours ?? "—"}</dd>
            <dt>Session:</dt>
            <dd>
              {sessionTypeMap[allocation.activity_type ?? ""] ?? allocation.activity_type ?? "—"}
            </dd>
          </dl>
        </Paper>

        {/* Proposed Correction */}
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Proposed Correction
          </Typography>

          {/* Date */}
          <FormControlLabel
            control={
              <Checkbox
                checked={corrections.date}
                onChange={(e) => handleToggle("date", e.target.checked)}
              />
            }
            label="Date"
          />
          <TextField
            fullWidth
            type="date"
            size="small"
            name="date"
            onChange={handleTextChange}
            value={form.date}
            disabled={!corrections.date}
            sx={{ mb: 2 }}
          />

          {/* Time */}
          <FormControlLabel
            control={
              <Checkbox
                checked={corrections.time}
                onChange={(e) => handleToggle("time", e.target.checked)}
              />
            }
            label="Start / End"
          />
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <TextField
              type="time"
              size="small"
              name="startTime"
              onChange={handleTextChange}
              value={form.startTime}
              fullWidth
              disabled={!corrections.time}
            />
            <TextField
              type="time"
              size="small"
              name="endTime"
              onChange={handleTextChange}
              value={form.endTime}
              fullWidth
              disabled={!corrections.time}
            />
          </Stack>

          {/* Location */}
          <FormControlLabel
            control={
              <Checkbox
                checked={corrections.location}
                onChange={(e) => handleToggle("location", e.target.checked)}
              />
            }
            label="Location"
          />
          <TextField
            fullWidth
            size="small"
            name="location"
            onChange={handleTextChange}
            value={form.location}
            placeholder="Room A"
            sx={{ mb: 2 }}
            disabled={!corrections.location}
          />

          {/* Hours */}
          <FormControlLabel
            control={
              <Checkbox
                checked={corrections.hours}
                onChange={(e) => handleToggle("hours", e.target.checked)}
              />
            }
            label="Hours"
          />
          <TextField
            fullWidth
            type="number"
            size="small"
            name="hours"
            onChange={handleTextChange}
            value={form.hours}
            inputProps={{ step: "0.1" }}
            sx={{ mb: 2 }}
            disabled={!corrections.hours}
          />

          {/* Session */}
          <FormControlLabel
            control={
              <Checkbox
                checked={corrections.session}
                onChange={(e) => handleToggle("session", e.target.checked)}
              />
            }
            label="Session"
          />
          <Select
            fullWidth
            size="small"
            name="session"
            onChange={handleSelectChange}
            value={form.session}
            disabled={!corrections.session}
            sx={{ mb: 2 }}
          >
            <MenuItem value="Tutorial">Tutorial</MenuItem>
            <MenuItem value="Lecture">Lecture</MenuItem>
            <MenuItem value="Lab">Lab</MenuItem>
          </Select>

          {/* Justification */}
          <TextField
            label="Justification"
            multiline
            rows={3}
            name="justification"
            value={form.justification}
            onChange={handleTextChange}
            required
            placeholder="Explain why the record is incorrect or what changed..."
          />
        </Paper>
      </Stack>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Tooltip
          title={isSubmitDisabled ? "Please enter a justification to enable submission" : ""}
          placement="top"
        >
          {/* span is needed because disabled buttons don't trigger tooltips */}
          <span>
            <Button variant="contained" onClick={handleSubmit} disabled={isSubmitDisabled}>
              Submit Correction Request
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Container>
  );
}
