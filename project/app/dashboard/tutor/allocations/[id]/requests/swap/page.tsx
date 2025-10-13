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
  Autocomplete,
} from "@mui/material";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { getFormattedAllocationById } from "@/app/services/allocationService";
import type { TutorAllocationRow } from "@/app/_types/allocations";
import AllocationDetails from "../../_components/AllocationDetails";
import { Tutor } from "@/app/_types/tutor";
import { getTutorsByUnit } from "@/app/services/userService";

const SwapRequestPage = () => {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [swapType, setSwapType] = useState("suggest");
  const [findTutor, setFindTutor] = useState("");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [reason, setReason] = useState("");
  const [allocation, setAllocation] = React.useState<TutorAllocationRow | null>(
    null,
  );

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      swapType,
      findTutor,
      reason,
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

        const mapped = await getFormattedAllocationById(id);

        let tutorsForUnit: Tutor[] = [];
        if (mapped?.unit_code) {
          tutorsForUnit = await getTutorsByUnit(mapped.unit_code);
          setTutors(tutorsForUnit);
        }

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
        Swap Request
      </Typography>

      <AllocationDetails allocation={allocation} />

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

        <Autocomplete
          disabled={swapType !== "suggest"}
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
              label="Find Tutor to Swap With"
              sx={{ mb: 3 }}
            />
          )}
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
