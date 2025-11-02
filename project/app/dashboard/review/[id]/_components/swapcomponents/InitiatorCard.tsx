import { Box, Paper, Typography } from "@mui/material";
import { TutorAllocationRow } from "@/app/_types/allocations";
import { formatDate } from "./formatDate";

export default function InitiatorCard({
  tutorId,
  allocationId,
  sourceAllocation,
}: {
  tutorId: number;
  allocationId: number;
  sourceAllocation: TutorAllocationRow | null;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        INITIATOR
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Tutor ID: {tutorId}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Allocation ID: {allocationId}
      </Typography>

      {sourceAllocation && (
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {sourceAllocation.unit_code} – {sourceAllocation.unit_name}
          </Typography>

          <Typography variant="caption" color="success.main" fontWeight={600}>
            Approved Allocation
          </Typography>

          <Box mt={1.5}>
            <Typography variant="body2">
              <strong>Date:</strong> {formatDate(sourceAllocation.session_date)}
            </Typography>
            <Typography variant="body2">
              <strong>Start:</strong> {sourceAllocation.start_at}
            </Typography>
            <Typography variant="body2">
              <strong>End:</strong> {sourceAllocation.end_at}
            </Typography>
            <Typography variant="body2">
              <strong>Location:</strong> {sourceAllocation.location}
            </Typography>
            <Typography variant="body2">
              <strong>Hours:</strong> {sourceAllocation.hours}
            </Typography>
            <Typography variant="body2">
              <strong>Session:</strong> {sourceAllocation.activity_name}
            </Typography>
          </Box>

          {sourceAllocation.note && (
            <Box
              mt={2}
              p={1.5}
              sx={{ bgcolor: "action.hover", borderRadius: 1 }}
            >
              <Typography variant="subtitle2">Notes</Typography>
              <Typography variant="body2" color="text.secondary">
                {sourceAllocation.note}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}
