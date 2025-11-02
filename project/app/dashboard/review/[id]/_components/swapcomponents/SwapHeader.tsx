import { Box, Typography, Chip } from "@mui/material";

export default function SwapHeader({
  requestId,
  requestStatus,
  createdAt,
}: {
  requestId: number;
  requestStatus: string;
  createdAt: string;
}) {
  const color =
    requestStatus === "approved"
      ? "success"
      : requestStatus === "rejected"
        ? "error"
        : "warning";

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="h5" fontWeight={600}>
          Swap Request Review
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Request ID: {requestId} • Created:{" "}
          {new Date(createdAt).toLocaleString()}
        </Typography>
      </Box>
      <Chip label={requestStatus.toUpperCase()} color={color} />
    </Box>
  );
}
