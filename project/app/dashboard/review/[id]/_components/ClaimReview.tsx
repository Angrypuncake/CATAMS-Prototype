import { Typography, Box } from "@mui/material";
import type { TutorRequest } from "@/app/_types/request";
import ReviewLayout from "./ReviewLayout";

export default function ClaimReview({ data }: { data: TutorRequest }) {
  const details = data.details as { hours: number; paycode: string };

  return (
    <ReviewLayout title="Claim Request Review" data={data}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Claimed Hours
      </Typography>
      <Typography color="text.secondary">{details.hours} hour(s)</Typography>

      <Box mt={2}>
        <Typography variant="subtitle1" fontWeight={600}>
          Paycode
        </Typography>
        <Typography color="text.secondary">{details.paycode}</Typography>
      </Box>
    </ReviewLayout>
  );
}
