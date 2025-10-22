import { Typography, Box } from "@mui/material";
import type { TutorRequest, CorrectionDetails } from "@/app/_types/request";
import ReviewLayout from "./ReviewLayout";

export default function CorrectionReview({ data }: { data: TutorRequest }) {
  if (data.requestType !== "correction") {
    return null;
  }

  const details = data.details as CorrectionDetails;

  return (
    <ReviewLayout title="Correction Request Review" data={data}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Date
      </Typography>
      <Typography color="text.secondary">{details.date}</Typography>

      <Box mt={2}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Time
        </Typography>
        <Typography color="text.secondary">
          {details.start_at} - {details.end_at}
        </Typography>
      </Box>

      <Box mt={2}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Location
        </Typography>
        <Typography color="text.secondary">{details.location}</Typography>
      </Box>

      <Box mt={2}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Hours
        </Typography>
        <Typography color="text.secondary">{details.hours}</Typography>
      </Box>

      <Box mt={2}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Session Type
        </Typography>
        <Typography color="text.secondary">{details.session_type}</Typography>
      </Box>
    </ReviewLayout>
  );
}
