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
  Alert,
  Snackbar,
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

  const ddmmyyyyFormatter = (origDate: string): string => {
    const newDate = new Date(origDate);

    const day = String(newDate.getUTCDate()).padStart(2, "0");
    const month = String(newDate.getUTCMonth() + 1).padStart(2, "0");
    const year = String(newDate.getUTCFullYear());

    return `${day}-${month}-${year}`;
  };

  const [correctionsString, setCorrectionsString] = useState({
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    hours: "",
    session: "",
    justification: "",
  });

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

  const sessionTypeFormatter = (text: string): string => {
    return sessionTypeMap[text] ?? "Missing Session Type";
  };

  const [allocation, setAllocation] = useState<AllocationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const params = useParams<{ id: string }>(); // gets id for query /api/tutor/allocations/{allocationID}
  const allocationId = params.id;
  const router = useRouter();

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

  const submitHandler = async () => {
    setSuccess(false);
    setError("");

    const formJson: Record<string, string> = {};
    formJson["allocation_id"] = allocationId;
    corrections.date
      ? (formJson["date"] = correctionsString.date)
      : (formJson["date"] = allocation?.session_date ?? "No Date");
    corrections.hours
      ? (formJson["hours"] = correctionsString.hours)
      : (formJson["hours"] = String(allocation?.hours) ?? "No Hours");
    corrections.location
      ? (formJson["location"] = correctionsString.location)
      : (allocation?.location ?? "No Location");
    corrections.session
      ? (formJson["session_type"] = correctionsString.session)
      : (allocation?.description ?? "No Session Type");
    corrections.time
      ? ((formJson["start_at"] = correctionsString.startTime),
        (formJson["end_at"] = correctionsString.endTime))
      : ((formJson["start_at"] = allocation?.start_at ?? "No Start Time"),
        (formJson["end_at"] = allocation?.end_at ?? "No End Time"));

    formJson["justification"] = correctionsString.justification;

    console.log(formJson);

    try {
      const res = await fetch(
        `/api/tutor/allocations/${allocationId}/requests/correction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formJson),
        },
      );

      if (!res.ok) throw new Error("Failed to submit correction");

      const data = await res.json();

      setSuccess(true);

      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error("Submit error:", error);
      setError("Something went wrong while submitting.");
    }
  };
  // If correction not made on specific catagory possibly fill json with current values unchanged
  // Also might need to change hours in json form to 24 hour time if thats what the allocation has

  if (loading) return <p>Loading...</p>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ zIndex: 1400 }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Correction submitted successfully.
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ zIndex: 1400 }}
      >
        <Alert
          onClose={() => setError("")}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

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
          <Chip
            label={statusMap[allocation?.status ?? "None"]?.label ?? "Unknown"}
            color={statusMap[allocation?.status ?? "None"]?.color ?? "default"}
            size="small"
          />
        </Stack>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Date: {ddmmyyyyFormatter(allocation?.session_date ?? "None")} • Time:{" "}
          {allocation?.start_at ?? "Missing Start Time"} -{" "}
          {allocation?.end_at ?? "Missing End Time"} • Location:{" "}
          {allocation?.location ?? "Missing Location"} • Hours:{" "}
          {allocation?.hours ?? "Missing Hours"} • Session:{" "}
          {sessionTypeFormatter(allocation?.description ?? "None")}
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
            <Typography variant="body2">
              Date: {ddmmyyyyFormatter(allocation?.session_date ?? "None")}
            </Typography>
            <Typography variant="body2">
              Start / End: {allocation?.start_at ?? "Missing Start Time"} —{" "}
              {allocation?.end_at ?? "Missing End Time"}
            </Typography>
            <Typography variant="body2">
              Location: {allocation?.location ?? "Missing Location"}
            </Typography>
            <Typography variant="body2">
              Hours: {allocation?.hours ?? "Missing Hours"}
            </Typography>
            <Typography variant="body2">
              Session: {sessionTypeFormatter(allocation?.description ?? "None")}
            </Typography>
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
        <Button variant="contained" color="primary" onClick={submitHandler}>
          Submit Correction Request
        </Button>
      </Box>
    </Container>
  );
}
