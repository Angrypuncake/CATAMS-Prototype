import { Typography } from "@mui/material";
import type { TutorRequest } from "@/app/_types/request";
import ReviewLayout from "./ReviewLayout";

export default function ReviewFallback({ data }: { data: TutorRequest }) {
  return (
    <ReviewLayout title="Unknown Request Type" data={data}>
      <Typography color="text.secondary">
        This request type is not recognized or supported yet.
      </Typography>
    </ReviewLayout>
  );
}
