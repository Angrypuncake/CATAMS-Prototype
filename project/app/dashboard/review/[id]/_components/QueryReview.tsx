import { Typography } from "@mui/material";
import type { TutorRequest } from "@/app/_types/request";
import ReviewLayout from "./ReviewLayout";

export default function QueryReview({ data }: { data: TutorRequest }) {
  return (
    <ReviewLayout title="Query Request Review" data={data}>
      <Typography color="text.secondary">
        No additional details for this query.
      </Typography>
    </ReviewLayout>
  );
}
