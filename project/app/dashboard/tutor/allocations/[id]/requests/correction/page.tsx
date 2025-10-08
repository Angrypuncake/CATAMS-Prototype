"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Paper,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getAllocationById } from "@/app/services/allocationService";
import { TutorAllocationRow } from "@/app/_types/allocations";
import React from "react";

export default function CorrectionRequestPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [allocation, setAllocation] = useState<TutorAllocationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    date: "",
    start_at: "",
    end_at: "",
    location: "",
    hours: "",
    session: "",
    justification: "",
  });

  // Fetch allocation
  React.useEffect(() => {
    if (!id) return; // wait until router provides id
    let cancelled = false;

    async function run() {
      try {
        if (!cancelled) {
          setLoading(true);
          setError(null);
        }

        // fetch via service
        const mapped = await getAllocationById(id);

        if (!cancelled) {
          setAllocation(mapped);
        }
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
  }, [id]);

  useEffect(() => {
    if (allocation) {
      setForm({
        date: allocation.session_date
          ? new Date(allocation.session_date).toISOString().split("T")[0]
          : "",
        start_at: allocation.start_at || "",
        end_at: allocation.end_at || "",
        location: allocation.location || "",
        hours: String(allocation.allocated_hours || ""),
        session: allocation.activity_type || "",
        justification: "",
      });
    }
  }, [allocation]);

  if (loading) {
    return (
      <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={20} />
          <Typography variant="body2">Loading allocations¦</Typography>
        </Stack>
      </Box>
    );
  }

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted Correction:", form);
    // TODO: hook up to backend route /api/tutor/corrections
  };

  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;
  if (!allocation) return <p>No allocation found</p>;

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: "auto" }}>
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
        Use this when allocation details are incorrect (date, time, location,
        hours, or session type).
      </Typography>

      {/* Summary */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography fontWeight={600}>
          {allocation.unit_code} – {allocation.unit_name}
        </Typography>
        {allocation.session_date
          ? new Date(allocation.session_date).toLocaleDateString("en-AU", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—"}{" "}
        · {allocation.location}
        <Typography variant="body2">
          Hours: {allocation.allocated_hours} · Session:{" "}
          {allocation.activity_type}
        </Typography>
      </Paper>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        alignItems="stretch"
      >
        {/* Left column - System Record */}
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            System Record
          </Typography>

          <dl className="grid grid-cols-2 text-sm gap-y-1">
            <dt>Date:</dt>
            <dd>
              {allocation.session_date
                ? new Date(allocation.session_date).toLocaleDateString(
                    "en-AU",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )
                : "—"}
            </dd>

            <dt>Start Time:</dt>
            <dd>{allocation.start_at}</dd>

            <dt>End Time:</dt>
            <dd>{allocation.end_at}</dd>

            <dt>Location:</dt>
            <dd>{allocation.location}</dd>

            <dt>Hours:</dt>
            <dd>{allocation.allocated_hours}</dd>

            <dt>Session:</dt>
            <dd>{allocation.activity_type}</dd>
          </dl>
        </Paper>
        {/* Right column - Proposed Correction */}
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Proposed Correction
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                type="date"
                size="small"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />

              <Stack direction="row" spacing={1}>
                <TextField
                  type="time"
                  size="small"
                  value={form.end_at}
                  onChange={(e) => handleChange("end_at", e.target.value)}
                />
              </Stack>

              <TextField
                size="small"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />

              <TextField
                size="small"
                type="number"
                inputProps={{ step: "0.1" }}
                value={form.hours}
                onChange={(e) => handleChange("hours", e.target.value)}
              />

              <TextField
                size="small"
                value={form.session}
                onChange={(e) => handleChange("session", e.target.value)}
              />

              <TextField
                label="Justification"
                multiline
                rows={3}
                value={form.justification}
                required
                onChange={(e) => handleChange("justification", e.target.value)}
                placeholder="Explain why the record is incorrect or what changed (e.g., room change, session overran, timetable conflict)"
              />

              <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained">
                  Submit Correction Request
                </Button>
              </Stack>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Box>
  );
}
