"use client";
import { Button, Divider, Stack, Typography } from "@mui/material";
import { format } from "date-fns"; // optional, for nice date formatting
import { useRouter } from "next/navigation";

type RequestRowProps = {
  req: {
    requestId: number;
    requestType: string;
    requestStatus: string;
    requestReason?: string | null;
    createdAt?: string;
  };
};

export default function RequestRow({ req }: RequestRowProps) {
  // Optional: pretty date formatting
  const router = useRouter();
  const formattedDate = req.createdAt ? format(new Date(req.createdAt), "dd MMM yyyy") : "";

  // Optional: make statuses more readable
  const statusLabel = req.requestStatus
    .replace("pending_uc", "Pending (UC)")
    .replace("pending_ta", "Pending (TA)")
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1}
      sx={{
        p: 1,
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 1.5,
      }}
    >
      {/* Request ID */}
      <Typography variant="body2" sx={{ minWidth: 56, fontWeight: 500 }}>
        #{req.requestId}
      </Typography>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

      {/* Request Type */}
      <Typography variant="body2" sx={{ minWidth: 100, textTransform: "capitalize" }}>
        {req.requestType}
      </Typography>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

      {/* Status */}
      <Typography variant="body2" sx={{ color: "text.secondary", flexGrow: 1 }}>
        {statusLabel}
        {formattedDate && ` • ${formattedDate}`}
      </Typography>

      {/* View/Edit Button */}
      <Button
        size="small"
        variant="outlined"
        onClick={() => router.push(`/dashboard/tutor/allocations/40/requests/${req.requestId}`)}
      >
        View
      </Button>
    </Stack>
  );
}
