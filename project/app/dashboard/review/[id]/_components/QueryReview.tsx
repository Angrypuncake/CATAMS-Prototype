import {
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import type { TutorRequest } from "@/app/_types/request";
import ReviewLayout from "./ReviewLayout";
import { useEffect, useState } from "react";
import { Tutor } from "@/app/_types/tutor";
import { getTutorById } from "@/app/services/userService";

export default function QueryReview({ data }: { data: TutorRequest }) {
  const { requesterId, requestReason, createdAt, requestStatus } = data;
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    async function fetchTutor() {
      try {
        const tutorData = await getTutorById(String(requesterId));
        setTutor(tutorData);
      } catch (err) {
        console.error("Failed to fetch tutor:", err);
      }
    }
    fetchTutor();
  }, [requesterId]);

  const handleRespond = () => {
    if (!response.trim()) return;
    console.log("Submitting response:", response);
    // TODO: integrate with backend endpoint, e.g. postReviewResponse(requestId, response)
  };

  const handleDismiss = () => {
    console.log("Query dismissed.");
    // TODO: integrate with backend endpoint for dismissing query
  };

  return (
    <ReviewLayout title="Query Request Review" data={data}>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Tutor Details
        </Typography>
        {tutor ? (
          <Box>
            <Typography color="text.secondary">
              <strong>ID:</strong> {tutor.user_id}
            </Typography>
            <Typography color="text.secondary">
              <strong>Name:</strong> {tutor.first_name} {tutor.last_name}
            </Typography>
            <Typography color="text.secondary">
              <strong>Email:</strong> {tutor.email}
            </Typography>
          </Box>
        ) : (
          <Typography color="text.secondary">Loading tutor info...</Typography>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Tutor Query
        </Typography>
        <Typography color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
          {requestReason || "No query message provided."}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Submitted on: {new Date(createdAt).toLocaleString()}
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Reviewer Response
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="Write your response to the tutor..."
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRespond}
            disabled={!response.trim()}
          >
            Send Response
          </Button>
          <Button variant="outlined" color="error" onClick={handleDismiss}>
            Dismiss Query
          </Button>
        </Stack>
      </Paper>
    </ReviewLayout>
  );
}
