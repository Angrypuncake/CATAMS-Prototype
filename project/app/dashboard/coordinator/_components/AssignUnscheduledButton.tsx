"use client";

import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function AssignUnscheduledButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/dashboard/coordinator/manual-allocation");
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleClick}
      sx={{ textTransform: "none" }}
    >
      Assign Unscheduled Allocations
    </Button>
  );
}
