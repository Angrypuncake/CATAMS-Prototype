"use client";
import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DetailRow from "../../_components/DetailRow";
import type { TutorAllocationRow } from "@/app/_types/allocations";

interface Props {
  allocation: TutorAllocationRow;
}

export default function AllocationDetails({ allocation }: Props) {
  const statusColor: "success" | "warning" | "default" =
    allocation.status === "Confirmed"
      ? "success"
      : allocation.status === "Pending"
        ? "warning"
        : "default";

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          sx={{ mb: 1 }}
        >
          <Typography variant="h6" fontWeight={700}>
            {allocation.unit_code} – {allocation.unit_name}
          </Typography>
          <Chip
            icon={<CheckCircleIcon fontSize="small" />}
            label={allocation.status}
            color={statusColor}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>

        <Divider sx={{ my: 1 }} />

        {/* Detail grid */}
        <Box sx={{ my: 1 }}>
          <DetailRow label="Date" value={allocation.session_date} />
          <DetailRow label="Start at" value={allocation.start_at} />
          <DetailRow label="End at" value={allocation.end_at} />
          <DetailRow label="Location" value={allocation.location} />
          <DetailRow label="Hours" value={allocation.allocated_hours} />
          <DetailRow label="Session" value={allocation.activity_name} />
        </Box>

        {/* Notes */}
        {allocation.note && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderLeft: "4px solid",
              borderColor: "grey.300",
              bgcolor: "grey.50",
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {allocation.note}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
