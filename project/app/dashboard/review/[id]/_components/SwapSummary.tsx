"use client";
import { Box, Divider, Paper, Typography } from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";
import type { Tutor } from "@/app/_types/tutor";
import type {
  AdminAllocationRow,
  TutorAllocationRow,
} from "@/app/_types/allocations";

interface SwapSummaryProps {
  sourceTutor: Tutor | null;
  sourceAllocation: TutorAllocationRow | null;
  selectedAllocation: AdminAllocationRow | null;
  requesterId: number;
  allocationId: number;
}

export default function SwapSummary({
  sourceTutor,
  sourceAllocation,
  selectedAllocation,
  requesterId,
  allocationId,
}: SwapSummaryProps) {
  if (!selectedAllocation) return null;

  return (
    <>
      <Divider sx={{ my: 4 }} />
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Swap Summary
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          You&apos;re reviewing a swap between:
        </Typography>

        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          alignItems="stretch"
          justifyContent="space-between"
          gap={3}
        >
          {/* From (Initiator) */}
          <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              From
            </Typography>
            <Typography color="text.secondary">
              Tutor Name:{" "}
              {`${sourceTutor?.first_name ?? "-"} ${
                sourceTutor?.last_name ?? "-"
              }`}
            </Typography>
            <Typography color="text.secondary">
              Tutor ID: {requesterId}
            </Typography>
            <Typography color="text.secondary">
              Allocation ID: {allocationId}
            </Typography>
            <Typography variant="body2" mt={1}>
              {sourceAllocation?.activity_name ?? "—"}
            </Typography>
          </Paper>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <SwapHoriz fontSize="large" />
          </Box>

          {/* To (Selected Allocation) */}
          <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              To
            </Typography>
            <Typography color="text.secondary">
              Tutor: {selectedAllocation.first_name}{" "}
              {selectedAllocation.last_name}
            </Typography>
            <Typography color="text.secondary">
              Allocation ID: {selectedAllocation.id ?? "—"}
            </Typography>
            <Typography variant="body2" mt={1}>
              {selectedAllocation.activity_name ?? "—"}
            </Typography>
          </Paper>
        </Box>

        <Typography variant="body2" color="text.secondary" mt={2}>
          <strong>Heads-up:</strong> This will replace the initiator’s
          allocation with{" "}
          <strong>
            {selectedAllocation.first_name} {selectedAllocation.last_name}
          </strong>{" "}
          for the same session (
          {selectedAllocation.session_date ?? "date unknown"}).
        </Typography>
      </Paper>
    </>
  );
}
