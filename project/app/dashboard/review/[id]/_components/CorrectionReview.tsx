import { Typography, Box } from "@mui/material";
import type { TutorRequest } from "@/app/_types/request";
import ReviewLayout from "./ReviewLayout";

export default function CorrectionReview({ data }: { data: TutorRequest }) {
  const details = data.details as {
    corrected_hours: number;
    note: string;
  };

  return (
    <ReviewLayout title="Correction Request Review" data={data}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Corrected Hours
      </Typography>
      <Typography color="text.secondary">{details.corrected_hours}</Typography>

      <Box mt={2}>
        <Typography variant="subtitle1" fontWeight={600}>
          Note
        </Typography>
        <Typography color="text.secondary">{details.note}</Typography>
      </Box>
    </ReviewLayout>
  );
}
