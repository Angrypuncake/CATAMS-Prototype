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
  CircularProgress,
} from "@mui/material";
import DevLoginButton from "@/components/DevLoginButton"; // <— added

// ---- Mock header data (keep until you have a header API) ----
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

type EligibleTutor = { userId: number; label: string; email: string };

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const allocationId = String(params?.id || "");

  // form state
  const [reason, setReason] = React.useState("");
  const [replacementMode, setReplacementMode] =
    React.useState<"suggest" | "coordinator">("suggest");
  const [tutor, setTutor] = React.useState<EligibleTutor | null>(null);
  const [timing, setTiming] = React.useState(">48h");
  const [ack, setAck] = React.useState(false);

  // data state
  const [eligibleTutors, setEligibleTutors] = React.useState<EligibleTutor[]>([]);
  const [loadingTutors, setLoadingTutors] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{ reason?: string; ack?: string; tutor?: string }>({});

  // load tutors for this allocation
  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!allocationId) return;
      setLoadingTutors(true);
      try {
        const res = await fetch(`/api/tutor/allocations/${allocationId}/cancel/eligible`);
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || "Failed to load tutors");
        if (!active) return;
        setEligibleTutors(j.data ?? []);
      } catch (e) {
        console.error(e);
        if (active) setEligibleTutors([]);
      } finally {
        active = false; // prevents a double setLoading race in React strict mode
        setLoadingTutors(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [allocationId]);

  // simple client-side validation
  const validate = () => {
    const next: typeof errors = {};
    if (!reason.trim()) next.reason = "Please provide a brief reason.";
    if (!ack) next.ack = "You must acknowledge this statement.";
    if (replacementMode === "suggest" && !tutor)
      next.tutor = "Please pick a tutor or choose coordinator option.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tutor/allocations/${allocationId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          replacementMode,
          timing,
          ack,
          suggestedUserId:
            replacementMode === "suggest" ? tutor?.userId ?? null : null,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to submit cancellation");
      // success → navigate back to allocation page (adjust route if needed)
      router.push(`/dashboard/tutor/allocations/${allocationId}`);
    } catch (e) {
      console.error(e);
      alert("Could not submit cancellation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mx: "auto", width: "100%", maxWidth: 1000, p: { xs: 2, md: 3 } }}>
      
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

      {/* Cancellation form */}
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
                error={Boolean(errors.reason)}
                helperText={
                  errors.reason ||
                  "Examples: illness, exam clash, unexpected work/placement, personal emergency."
                }
              />
            </Stack>
            <Divider />

            {/* Replacement options */}
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Replacement Options</Typography>
              <RadioGroup
                row
                value={replacementMode}
                onChange={(e) =>
                  setReplacementMode(e.target.value as "suggest" | "coordinator")
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

              {/* Find Tutor (only when suggest) */}
              <Autocomplete
                options={eligibleTutors}
                loading={loadingTutors}
                getOptionLabel={(o) => `${o.label} (${o.email})`}
                value={tutor}
                onChange={(_, v) => setTutor(v)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Find Tutor"
                    placeholder="Type a name or email..."
                    error={Boolean(errors.tutor)}
                    helperText={errors.tutor || undefined}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingTutors ? (
                            <CircularProgress size={18} sx={{ mr: 1 }} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                disabled={replacementMode !== "suggest"}
              />
              <Typography variant="caption" color="text.secondary">
                This lists tutors already teaching in the same unit offering (excluding you).
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
                <MenuItem value=">48h">More than 48 hours before session</MenuItem>
                <MenuItem value="24-48h">Between 24–48 hours</MenuItem>
                <MenuItem value="<24h">Less than 24 hours</MenuItem>
              </TextField>
              <Typography variant="caption" color="text.secondary">
                Used to prioritise escalation and notifications.
              </Typography>
            </Stack>

            {/* Acknowledgement */}
            <FormControlLabel
              control={<Checkbox checked={ack} onChange={(e) => setAck(e.target.checked)} />}
              label={
                <Typography variant="body2">
                  I understand this cancellation may leave the session unassigned and the
                  coordinator may contact me for clarification.
                </Typography>
              }
            />
            {errors.ack ? (
              <Typography variant="caption" color="error">
                {errors.ack}
              </Typography>
            ) : null}

            {/* Actions */}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button component={Link} href={`/dashboard/tutor/allocations/${allocationId}`} variant="text">
                Cancel
              </Button>
              <Button variant="outlined" onClick={() => console.log("Saved draft (client-only).")}>
                Save Draft
              </Button>
              <Button variant="contained" onClick={onSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Cancellation Request"}
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
