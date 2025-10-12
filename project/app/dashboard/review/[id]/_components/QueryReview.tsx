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
      {/* Top Section — Tutor + Query Overview */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Tutor Info */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            p: 3,
            minWidth: 280,
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Tutor Details
          </Typography>
          {tutor ? (
            <Stack spacing={0.5}>
              <Typography color="text.secondary">
                <strong>ID:</strong> {tutor.user_id}
              </Typography>
              <Typography color="text.secondary">
                <strong>Name:</strong> {tutor.first_name} {tutor.last_name}
              </Typography>
              <Typography color="text.secondary">
                <strong>Email:</strong> {tutor.email}
              </Typography>
            </Stack>
          ) : (
            <Typography color="text.secondary">
              Loading tutor info...
            </Typography>
          )}
        </Paper>

        {/* Query Block */}
        <Paper
          variant="outlined"
          sx={{
            flex: 2,
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Tutor Query
            </Typography>
            <Typography
              color="text.secondary"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
              }}
            >
              {requestReason || "No query message provided."}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ alignSelf: "flex-end" }}
          >
            Submitted on: {new Date(createdAt).toLocaleString()}
          </Typography>
        </Paper>
      </Box>

      {/* Reviewer Response Section */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
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
          sx={{
            mb: 3,
            "& .MuiInputBase-root": { borderRadius: 2 },
          }}
        />
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ mt: "auto" }}
        >
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
