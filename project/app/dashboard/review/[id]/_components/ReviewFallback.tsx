import { Typography } from "@mui/material";
import type { TutorRequest } from "@/app/_types/request";
import ReviewLayout from "./ReviewLayout";

type ReviewRole = "UC" | "TA" | "USER";

export default function ReviewFallback({
  data,
  // Accept but ignore for now (no actions here)
  role = "UC",
  readOnly = false,
}: {
  data: TutorRequest;
  role?: ReviewRole;
  readOnly?: boolean;
}) {
  return (
    <ReviewLayout title="Unknown Request Type" data={data}>
      <Typography color="text.secondary">
        This request type is not recognized or supported yet.
      </Typography>
    </ReviewLayout>
  );
}
