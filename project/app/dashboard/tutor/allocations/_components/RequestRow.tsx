"use client";
import { Button, Divider, Stack, Typography } from "@mui/material";

type RequestType = "Swap" | "Correction" | "Extension" | "Cancellation";
type RequestState = "Pending Review" | "Approved" | "Rejected";

export interface RequestItem {
  id: string;
  type: RequestType;
  state: RequestState;
}

export default function RequestRow({ req }: { req: RequestItem }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1}
      sx={{
        p: 1,
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 1.5,
      }}
    >
      <Typography variant="body2" sx={{ minWidth: 56 }}>
        #{req.id}
      </Typography>
      <Divider
        orientation="vertical"
        flexItem
        sx={{ display: { xs: "none", sm: "block" } }}
      />
      <Typography variant="body2" sx={{ minWidth: 90 }}>
        {req.type}
      </Typography>
      <Divider
        orientation="vertical"
        flexItem
        sx={{ display: { xs: "none", sm: "block" } }}
      />
      <Typography variant="body2" sx={{ color: "text.secondary", flexGrow: 1 }}>
        {req.state}
      </Typography>
      <Button size="small" variant="outlined">
        View/Edit Request
      </Button>
    </Stack>
  );
}
