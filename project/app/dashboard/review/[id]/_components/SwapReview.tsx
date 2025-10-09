import { Typography } from "@mui/material";
import type { TutorRequest } from "@/app/_types/request";
import ReviewLayout from "./ReviewLayout";

export default function SwapReview({ data }: { data: TutorRequest }) {
  const details = data.details as { suggested_tutor_id: number };

  return (
    <ReviewLayout title="Swap Request Review" data={data}>
      <Typography variant="subtitle1" fontWeight={600}>
        Suggested Tutor ID
      </Typography>
      <Typography color="text.secondary">
        {details.suggested_tutor_id}
      </Typography>
    </ReviewLayout>
  );
}
