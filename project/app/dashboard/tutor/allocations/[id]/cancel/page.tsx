// app/dashboard/tutor/allocations/[id]/cancel/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  Checkbox,
} from "@mui/material";

/**
 * NOTE:
 * - This page is FRONT-END ONLY. It does not upload or save anything.
 * - "Submit" will just noop (console.log) so nothing breaks while backend/DB is sorted.
 * - No third-party libs (zod/react-hook-form) to avoid new imports.
 * - If your project’s TS types for React aren’t ready, @ts-nocheck prevents red squiggles.
 */

// ---- Mock header data (replace with real data later) ----
const header = {
  unitCode: "INFO1110",
  unitName: "Programming Fundamentals",
  date: "12/09/2025",
  time: "09:00 – 11:00",
  location: "Room A",
  hours: "2h",
  session: "Tutorial",
  timeCritical: true,
  userRole: "Tutor",
};

// ---- Mock tutors for autocomplete (replace with API later) ----
const eligibleTutors = [
  { label: "Alice Rao", email: "alice.rao@uni.edu" },
  { label: "Ben Li", email: "ben.li@uni.edu" },
  { label: "Chirag Patel", email: "chirag.p@uni.edu" },
];

export default function Page() {
  const params = useParams();
  const router = useRouter();

  // minimal state
  const [reason, setReason] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [replacementMode, setReplacementMode] = React.useState(
    "suggest" as "suggest" | "coordinator",
  );
  const [tutor, setTutor] = React.useState(
    null as null | { label: string; email: string },
  );
  const [timing, setTiming] = React.useState(">48h");
  const [ack, setAck] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async () => {
    // FRONT-END ONLY: do nothing irreversible; just log and stay on page.
    setSubmitting(true);
    try {
      console.log("Cancellation draft (NOT SENT):", {
        allocationId: params?.id,
        reason,
        replacementMode,
        tutor,
        timing,
        acknowledge: ack,
      });
      // You can navigate back if you want instead:
      // router.push(`/dashboard/tutor/allocations/${params?.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{ mx: "auto", width: "100%", maxWidth: 1000, p: { xs: 2, md: 3 } }}
    >
      {/* Header / Allocation summary */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          titleTypographyProps={{ variant: "h6" }}
          title={
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <span>
                {header.unitCode} — {header.unitName}
              </span>
              {header.timeCritical && (
                <Chip size="small" color="error" label="Time-critical" />
              )}
            </Stack>
          }
        />
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            useFlexGap
            flexWrap="wrap"
            sx={{ color: "text.secondary", fontSize: 14 }}
          >
            <Info label="Date" value={header.date} />
            <Info label="Time" value={header.time} />
            <Info label="Location" value={header.location} />
            <Info label="Hours" value={header.hours} />
            <Info label="Session" value={header.session} />
            <Info label="User role" value={header.userRole} />
          </Stack>
        </CardContent>
      </Card>

      {/* Form (WITHOUT the crossed-out Impact Preview) */}
      <Card>
        <CardHeader
          titleTypographyProps={{ variant: "h6" }}
          title="Cancellation Details"
          subheader="Use this when you cannot attend the allocated session. You may suggest a replacement or ask the coordinator to assign."
        />
        <CardContent>
          <Stack spacing={3}>
            {/* Reason */}
            <Stack spacing={1}>
              <Typography variant="subtitle2">Reason</Typography>
              <TextField
                placeholder="Briefly explain why you cannot attend (required)"
                minRows={4}
                multiline
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Typography variant="caption" color="text.secondary">
                Examples: illness, exam clash, unexpected work/placement,
                personal emergency.
              </Typography>
            </Stack>
            <Divider />

            {/* Replacement options */}
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Replacement Options</Typography>
              <RadioGroup
                row
                value={replacementMode}
                onChange={(e) =>
                  setReplacementMode(
                    e.target.value as "suggest" | "coordinator",
                  )
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
                  label="Ask coordinator to assign"
                />
              </RadioGroup>

              {/* Find Tutor (enabled only when suggest) */}
              <Autocomplete
                options={eligibleTutors}
                getOptionLabel={(o) => `${o.label} (${o.email})`}
                value={tutor}
                onChange={(_, v) => setTutor(v)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Find Tutor"
                    placeholder="Type a name or email..."
                  />
                )}
                disabled={replacementMode !== "suggest"}
              />
              <Typography variant="caption" color="text.secondary">
                Search eligible tutors in this unit. Selecting a tutor will be
                stored locally for now.
              </Typography>
            </Stack>

            {/* Timing */}
            <Stack spacing={1}>
              <Typography variant="subtitle2">Timing</Typography>
              <TextField
                select
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                sx={{ maxWidth: 360 }}
              >
                <MenuItem value=">48h">
                  More than 48 hours before session
                </MenuItem>
                <MenuItem value="24-48h">Between 24–48 hours</MenuItem>
                <MenuItem value="<24h">Less than 24 hours</MenuItem>
              </TextField>
              <Typography variant="caption" color="text.secondary">
                Used to prioritise escalation and notifications (later).
              </Typography>
            </Stack>

            {/* Acknowledgement */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={ack}
                  onChange={(e) => setAck(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  I understand this cancellation may leave the session
                  unassigned and the coordinator may contact me for
                  clarification.
                </Typography>
              }
            />

            {/* Actions */}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                component={Link}
                href={`/dashboard/tutor/allocations/${params?.id}`}
                variant="text"
              >
                Cancel
              </Button>
              <Button
                variant="outlined"
                onClick={() => console.log("Saved draft (client-only).")}
              >
                Save Draft
              </Button>
              <Button
                variant="contained"
                onClick={onSubmit}
                disabled={submitting}
              >
                Submit Cancellation Request
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1.25}>
      <Typography fontWeight={700}>{label}:</Typography>
      <Typography color="text.primary">{value}</Typography>
    </Stack>
  );
}
