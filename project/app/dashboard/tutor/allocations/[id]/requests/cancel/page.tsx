// app/dashboard/tutor/allocations/[id]/cancel/page.tsx
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
  MenuItem,
  Autocomplete,
  Checkbox,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";

import { getFormattedAllocationById } from "@/app/services/allocationService";
import { getTutorsByUnit } from "@/app/services/userService";
import { TutorAllocationRow } from "@/app/_types/allocations";
import { Tutor } from "@/app/_types/tutor";
import AllocationDetails from "../../_components/AllocationDetails";

const CancelRequestPage = () => {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [allocation, setAllocation] = useState<TutorAllocationRow | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [cancelType, setCancelType] = useState<"suggest" | "coordinator">(
    "suggest",
  );
  const [findTutor, setFindTutor] = useState("");
  const [reason, setReason] = useState("");
  const [timing, setTiming] = useState(">48h");
  const [ack, setAck] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function run() {
      try {
        if (!cancelled) {
          setLoading(true);
          setErr(null);
        }

        const mapped = await getFormattedAllocationById(id);
        let tutorsForUnit: Tutor[] = [];

        if (mapped?.unit_code) {
          tutorsForUnit = await getTutorsByUnit(mapped.unit_code);
        }

        if (!cancelled) {
          setAllocation(mapped);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      cancelType,
      findTutor,
      reason,
      timing,
      acknowledge: ack,
      allocationId: id,
    });
    // TODO: integrate with /api/tutor/cancel when ready
  };

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
          value={
            tutors.find(
              (t) =>
                `${t.first_name} ${t.last_name} (${t.email})` === findTutor,
            ) || null
          }
          onChange={(e, newValue) =>
            setFindTutor(
              newValue
                ? `${newValue.first_name} ${newValue.last_name} (${newValue.email})`
                : "",
            )
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Find Tutor (if suggesting)"
              sx={{ mb: 3 }}
            />
          )}
        />

        {/* Timing */}
        <TextField
          select
          fullWidth
          label="Timing of Notification"
          value={timing}
          onChange={(e) => setTiming(e.target.value)}
          sx={{ mb: 3 }}
        >
          <MenuItem value=">48h">More than 48 hours before session</MenuItem>
          <MenuItem value="24-48h">Between 24–48 hours</MenuItem>
          <MenuItem value="<24h">Less than 24 hours</MenuItem>
        </TextField>

        {/* Acknowledgement */}
        <FormControlLabel
          control={
            <Checkbox
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
            />
          }
          label="I understand this cancellation may impact coordination and scheduling."
          sx={{ mb: 3 }}
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
          <Button variant="contained" color="primary" type="submit">
            Submit Cancellation
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default CancelRequestPage;
