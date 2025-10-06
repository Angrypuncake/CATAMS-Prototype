import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Chip,
  Divider,
  Box,
  Button,
} from "@mui/material";
import Link from "next/link";
import type { AllocationRow } from "./types";
import { niceTime, hoursBetween } from "./utils";

interface AllocationQuickviewModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  session?: AllocationRow | null;
}

const AllocationQuickviewModal: React.FC<AllocationQuickviewModalProps> = ({
  open,
  setOpen,
  session,
}) => {
  const isConfirmed = session?.status === "Confirmed";
  const isPending = session?.status === "Pending";
  const hasEnded = session?.end_at
    ? new Date(session.end_at) < new Date()
    : false;
  const claimDisabledReason = "Session has not ended yet";
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Allocation quick view</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Typography variant="subtitle2" component="span">
              Status:
            </Typography>
            <Chip
              size="small"
              variant="outlined"
              color={
                isConfirmed ? "success" : isPending ? "warning" : "default"
              }
              label={session?.status ?? "Unknown"}
            />
          </Stack>

          <Divider />

          <Stack direction="row" spacing={1.25}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ minWidth: 120 }}
            >
              Date
            </Typography>
            <Box>{session?.session_date?.slice(0, 10) ?? "—"}</Box>
          </Stack>

          <Stack direction="row" spacing={1.25}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ minWidth: 120 }}
            >
              Time
            </Typography>
            <Box>
              {session?.start_at
                ? `${niceTime(session?.start_at)} – ${niceTime(session?.end_at)}`
                : "—"}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.25}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ minWidth: 120 }}
            >
              Location
            </Typography>
            <Box>{session?.location ?? "—"}</Box>
          </Stack>

          <Stack direction="row" spacing={1.25}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ minWidth: 120 }}
            >
              Unit
            </Typography>
            <Box>{session?.unit_code ?? "—"}</Box>
          </Stack>

          <Stack direction="row" spacing={1.25}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ minWidth: 120 }}
            >
              Hours
            </Typography>
            <Box>{hoursBetween(session?.start_at, session?.end_at)}</Box>
          </Stack>

          <Stack direction="row" spacing={1.25}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ minWidth: 120 }}
            >
              Description
            </Typography>
            <Box>{session?.note ?? "—"}</Box>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        {/* LEFT side kept empty to match wireframe spacing */}
        <Box />

        {/* RIGHT side buttons per rules */}
        <Stack direction="row" spacing={1}>
          {/* Confirmed → show Submit Claim (disabled until session ends) */}
          {isConfirmed && (
            <Button
              variant="contained"
              disabled={!hasEnded}
              title={
                !hasEnded
                  ? claimDisabledReason
                  : "Submit your claim for this session"
              }
              onClick={() => setOpen(false)}
            >
              Submit Claim
            </Button>
          )}

          {/* All statuses → Create Request */}
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Create Request
          </Button>

          {/* All statuses → View details */}
          <Button
            variant="outlined"
            component={Link}
            href={`/dashboard/tutor/allocations/${session?.id}`}
          >
            View details
          </Button>

          {/* Close */}
          <Button variant="text" onClick={() => setOpen(false)}>
            Close
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default AllocationQuickviewModal;
