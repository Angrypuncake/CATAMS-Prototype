import { Typography } from "@mui/material";
import type { TutorRequest } from "@/app/_types/request";
import ReviewLayout from "./ReviewLayout";

export default function CancelReview({ data }: { data: TutorRequest }) {
  return (
    <ReviewLayout title="Cancellation Request Review" data={data}>
      <Typography variant="subtitle1" fontWeight={600}>
        Reason
      </Typography>
      <Typography color="text.secondary">
        {data.requestReason || "No reason provided."}
      </Typography>
    </ReviewLayout>
  );
}
