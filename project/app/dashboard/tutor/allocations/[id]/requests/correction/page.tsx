"use client";

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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function CorrectionRequestPage() {
  const [corrections, setCorrections] = useState({
    date: false,
    time: false,
    location: false,
    hours: false,
    session: false,
  });

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
            INFO1110 - Programming Fundamentals
          </Typography>
          <Chip label="Confirmed" color="success" size="small" />
        </Stack>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Date: 12/09/2025 • Time: 09:00 - 11:00 • Location: Room A • Hours:
          2.0h • Session: Tutorial
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
                fullWidth
                disabled={!corrections.time}
              />
              <TextField
                type="time"
                size="small"
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
              defaultValue="Tutorial"
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
              placeholder="Explain why the record is incorrect or what changed..."
              sx={{ mb: 2 }}
            />

            <Button variant="outlined" component="label" fullWidth>
              Choose File
              <input type="file" hidden />
            </Button>
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
        <Button variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button variant="outlined" color="primary">
          Save Draft
        </Button>
        <Button variant="contained" color="primary">
          Submit Correction Request
        </Button>
      </Box>
    </Container>
  );
}
