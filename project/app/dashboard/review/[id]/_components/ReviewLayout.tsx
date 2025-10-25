import { Paper, Typography, Divider, Box } from "@mui/material";
import type { TutorRequest } from "@/app/_types/request";

export default function ReviewLayout({
  title,
  data,
  children,
}: {
  title: string;
  data: TutorRequest;
  children: React.ReactNode;
}) {
  return (
    <Paper elevation={2} sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {title}
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ mb: 2, fontSize: "0.9rem", color: "text.secondary" }}>
        <div>Request ID: {data.requestId}</div>
        <div>Requester ID: {data.requesterId}</div>
        <div>Status: {data.requestStatus}</div>
        <div>
          Date: {new Date(data.requestDate ?? data.createdAt).toLocaleString()}
        </div>
      </Box>

      {children}
    </Paper>
  );
}
