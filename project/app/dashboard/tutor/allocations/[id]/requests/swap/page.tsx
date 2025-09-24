"use client";

// pages/swap-request.tsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
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
} from "@mui/material";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

import type { AllocationDetail } from "@/app/_types/allocations";

const SwapRequestPage = () => {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [swapType, setSwapType] = useState("suggest");
  const [findTutor, setFindTutor] = useState("");
  const [manualTutor, setManualTutor] = useState("");
  const [reason, setReason] = useState("");
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [allocation, setAllocation] = React.useState<AllocationDetail | null>(
    null,
  );

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  const router = useRouter();

  //Helper functions
  function toHHMM(hms?: string | null) {
    if (!hms) return "—";
    return hms.slice(0, 5); // assumes "HH:MM:SS"
  }
  function toDDMMYYYY(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = d.getUTCFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  // DB status → UI union type normalization
  type UIStatus = AllocationDetail["status"]; // "Confirmed" | "Pending" | "Cancelled"
  function normalizeStatus(s?: string | null): UIStatus {
    const v = (s ?? "").trim().toLowerCase();

    // Treat as Confirmed
    if (
      v === "confirmed" ||
      v === "approved" ||
      v === "accepted" ||
      v === "allocated" ||
      v === "active" ||
      v === "assigned"
    ) {
      return "Confirmed";
    }

    // Treat as Pending
    if (
      v === "pending" ||
      v === "in_progress" ||
      v === "requested" ||
      v.includes("pending") ||
      v.includes("review") ||
      v.includes("await")
    ) {
      return "Pending";
    }

    // Fallback
    return "Cancelled";
  }

  // ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      swapType,
      findTutor,
      manualTutor,
      reason,
      attachments,
    });
    // Here you can send data to your API route
  };

  React.useEffect(() => {
    if (!id) return; // wait until router provides id
    let cancelled = false;

    async function run() {
      try {
        if (!cancelled) {
          setLoading(true);
          setErr(null);
        }

        const res = await fetch(
          `/api/tutor/allocations/${encodeURIComponent(id)}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(`Failed to fetch allocation ${id}`);
        const json = await res.json();

        const a = json.data as {
          allocation_id: string;
          unit_code: string | null;
          unit_name: string | null;
          status: string | null;
          session_date: string | null;
          start_at: string | null;
          end_at: string | null;
          location: string | null;
          activity_name: string | null;
          note: string | null;
        };

        const mapped: AllocationDetail = {
          id: a.allocation_id,
          courseCode: a.unit_code ?? "—",
          courseName: a.unit_name ?? "—",
          status: normalizeStatus(a.status),
          date: toDDMMYYYY(a.session_date),
          time:
            a.start_at || a.end_at
              ? `${toHHMM(a.start_at)} – ${toHHMM(a.end_at)}`
              : "—",
          location: a.location ?? "—",
          hours:
            a.start_at && a.end_at
              ? (() => {
                  const [sh, sm] = a.start_at.split(":").map(Number);
                  const [eh, em] = a.end_at.split(":").map(Number);
                  const start = new Date(0, 0, 0, sh || 0, sm || 0, 0);
                  const end = new Date(0, 0, 0, eh || 0, em || 0, 0);
                  let diff =
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  if (diff < 0) diff += 24;
                  return `${diff.toFixed(2)}h`;
                })()
              : "—",
          session: a.activity_name ?? "—",
          notes: a.note ?? undefined,
        };

        if (!cancelled) {
          setAllocation(mapped);
          //setRequests([]); // TODO: later wire to /requests
          //setComments([]); // TODO: later wire to /comments
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

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Swap Request
      </Typography>

      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 4, backgroundColor: "#f5f5f5" }}
      >
        <Typography variant="subtitle1">
          {allocation?.courseCode} - {allocation?.courseName}{" "}
        </Typography>
        <Typography variant="body2">
          {allocation?.date} • {allocation?.time} • {allocation?.location} •{" "}
          {allocation?.hours}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color:
              allocation?.status === "Confirmed"
                ? "green"
                : allocation?.status === "Pending"
                  ? "orange"
                  : "red",
          }}
        >
          Status: {allocation?.status}
        </Typography>
      </Paper>

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

        <TextField
          disabled={swapType !== "suggest"}
          fullWidth
          label="Find Tutor to Swap With"
          placeholder="Type a name or email..."
          value={findTutor}
          onChange={(e) => setFindTutor(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          disabled={swapType !== "suggest"}
          fullWidth
          label="Or enter tutor name manually"
          placeholder="Type tutor's full name or email..."
          value={manualTutor}
          onChange={(e) => setManualTutor(e.target.value)}
          sx={{ mb: 3 }}
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

        <Button variant="outlined" component="label" sx={{ mb: 3 }}>
          Choose Files
          <input
            type="file"
            hidden
            onChange={(e) => setAttachments(e.target.files)}
          />
        </Button>

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => router.push(`../`)}
          >
            Cancel
          </Button>
          <Button variant="contained" color="primary" type="submit">
            Submit Swap Request
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default SwapRequestPage;
