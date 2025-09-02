"use client";
import { Stack, Typography } from "@mui/material";

export default function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.25 }}>
      <Typography variant="body2" sx={{ width: 120, color: "text.secondary" }}>
        {label}:
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}
