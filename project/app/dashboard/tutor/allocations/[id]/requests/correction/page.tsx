"use client";

import {
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  FormControlLabel,
  SelectChangeEvent,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useState, ChangeEvent, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

type AllocationRow = {
  unit_code: string | null;
  unit_name: string | null;
  session_date: string | null;
  start_at: string | null; // "HH:MM:SS"
  end_at: string | null;
  activity_name: string | null;
  location: string | null;
  status: string | null;
  description: string | null;
  hours: string | null;
};

export default function CorrectionRequestPage() {
  const [corrections, setCorrections] = useState({
    date: false,
    time: false,
    location: false,
    hours: false,
    session: false,
  });

  const [correctionsString, setCorrectionsString] = useState({
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    hours: "",
    session: "",
    justification: "",
  });

  const [allocation, setAllocation] = useState<AllocationRow | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useParams<{ id: string }>(); // gets id for query /api/tutor/allocations/{allocationID}
  const allocationId = params.id;
  const router = useRouter();

  useEffect(() => {
    console.log(correctionsString);
    console.log(corrections);
  }, [correctionsString, corrections]);

  useEffect(() => {
    async function fetchAllocation() {
      try {
        const res = await fetch(`/api/tutor/allocations/${allocationId}`);
        if (!res.ok) throw new Error("Failed to fetch allocation");
        const json = (await res.json()) as { data?: AllocationRow };
        setAllocation(json.data ?? null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (allocationId) fetchAllocation();
  }, [allocationId]);

  const textFieldCorrectionsUpdater = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    setCorrectionsString((prev) => ({ ...prev, [name]: value }));
  };

  const selectFieldCorrectionsUpdater = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setCorrectionsString((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Correction Request
      </Typography>
      <Typography variant="body1" gutterBottom>
        Use this when allocation details are incorrect (date, time, location,
        hours, or session type).
      </Typography>

      {/* Course Summary Box */}
      <Paper
        variant="outlined"
        sx={{ p: 2, mt: 3, backgroundColor: "#f5f5f5" }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1">
            {allocation?.unit_code ?? "Missing Unit Code"}
          </Typography>
          <Chip label="Confirmed" color="success" size="small" />
        </Stack>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Date: {allocation?.session_date ?? "Missing Date"} • Time:{" "}
          {allocation?.start_at ?? "Missing Start Time"} -{" "}
          {allocation?.end_at ?? "Missing End Time"} • Location:{" "}
          {allocation?.location ?? "Missing Location"} • Hours:{" "}
          {allocation?.hours ?? "Missing Hours"} • Session:{" "}
          {allocation?.description ?? "Missing Description"}
        </Typography>
      </Paper>

      {/* Responsive Stack for Form Sections */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ mt: 3 }}
        alignItems="stretch"
      >
        {/* System Record */}
        <Box flex={1}>
          <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" gutterBottom>
              System Record
            </Typography>
            <Typography variant="body2">Date: 2025-09-12</Typography>
            <Typography variant="body2">Start / End: 09:00 — 11:00</Typography>
            <Typography variant="body2">Location: Room A</Typography>
            <Typography variant="body2">Hours: 2.0</Typography>
            <Typography variant="body2">Session: Tutorial</Typography>
            <Typography variant="caption" color="text.secondary">
              Snapshot of current allocation (immutable).
            </Typography>
          </Paper>
        </Box>

        {/* Proposed Correction */}
        <Box flex={1}>
          <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" gutterBottom>
              Proposed Correction
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={corrections.date}
                  onChange={(e) =>
                    setCorrections({ ...corrections, date: e.target.checked })
                  }
                />
              }
              label="Date"
            />
            <TextField
              fullWidth
              type="date"
              size="small"
              name="date"
              onChange={textFieldCorrectionsUpdater}
              value={correctionsString.date}
              sx={{ mb: 2 }}
              disabled={!corrections.date}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={corrections.time}
                  onChange={(e) =>
                    setCorrections({ ...corrections, time: e.target.checked })
                  }
                />
              }
              label="Start / End"
            />
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                type="time"
                size="small"
                name="startTime"
                onChange={textFieldCorrectionsUpdater}
                value={correctionsString.startTime}
                fullWidth
                disabled={!corrections.time}
              />
              <TextField
                type="time"
                size="small"
                name="endTime"
                onChange={textFieldCorrectionsUpdater}
                value={correctionsString.endTime}
                fullWidth
                disabled={!corrections.time}
              />
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  checked={corrections.location}
                  onChange={(e) =>
                    setCorrections({
                      ...corrections,
                      location: e.target.checked,
                    })
                  }
                />
              }
              label="Location"
            />
            <TextField
              fullWidth
              size="small"
              name="location"
              onChange={textFieldCorrectionsUpdater}
              value={correctionsString.location}
              placeholder="Room A"
              sx={{ mb: 2 }}
              disabled={!corrections.location}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={corrections.hours}
                  onChange={(e) =>
                    setCorrections({ ...corrections, hours: e.target.checked })
                  }
                />
              }
              label="Hours"
            />
            <TextField
              fullWidth
              type="number"
              size="small"
              name="hours"
              onChange={textFieldCorrectionsUpdater}
              value={correctionsString.hours}
              sx={{ mb: 2 }}
              disabled={!corrections.hours}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={corrections.session}
                  onChange={(e) =>
                    setCorrections({
                      ...corrections,
                      session: e.target.checked,
                    })
                  }
                />
              }
              label="Session"
            />
            <Select
              fullWidth
              size="small"
              name="session"
              onChange={selectFieldCorrectionsUpdater}
              defaultValue="Tutorial"
              value={correctionsString.session}
              disabled={!corrections.session}
              sx={{ mb: 2 }}
            >
              <MenuItem value="Tutorial">Tutorial</MenuItem>
              <MenuItem value="Lecture">Lecture</MenuItem>
              <MenuItem value="Lab">Lab</MenuItem>
            </Select>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Justification"
              name="justification"
              value={correctionsString.justification}
              onChange={textFieldCorrectionsUpdater}
              placeholder="Explain why the record is incorrect or what changed..."
              sx={{ mb: 2 }}
            />
          </Paper>
        </Box>
      </Stack>

      {/* Review Summary */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Review Summary
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label="No changes selected" variant="outlined" />
          <Chip label="Route: Coordinator" variant="outlined" />
          <Chip label="ETA: 1-2 business days" variant="outlined" />
        </Stack>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button variant="contained" color="primary">
          Submit Correction Request
        </Button>
      </Box>
    </Container>
  );
}
