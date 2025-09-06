"use client";
import { Box, Stack, TextField, Button } from "@mui/material";
import React from "react";

export default function NewCommentBox({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Box
      sx={{
        mt: 1,
        p: 1.5,
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 1.5,
      }}
    >
      <Stack spacing={1}>
        <TextField
          multiline
          minRows={3}
          placeholder="Write a comment…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
        />
        <Stack direction="row" justifyContent="flex-end">
          <Button variant="contained" onClick={onSubmit}>
            Comment
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
