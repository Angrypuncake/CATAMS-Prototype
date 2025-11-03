import React from "react";
import { Stack, Chip } from "@mui/material";
import { isPrimitive } from "../utils";

interface DefaultArrayRendererProps {
  arr: unknown[];
  maxChips?: number;
}

export const DefaultArrayRenderer = ({ arr, maxChips = 4 }: DefaultArrayRendererProps) => {
  const chips = arr.slice(0, maxChips);
  const remaining = arr.length - chips.length;

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap">
      {chips.map((item, idx) => (
        <Chip
          key={idx}
          size="small"
          label={
            isPrimitive(item)
              ? String(item)
              : typeof item === "object"
                ? JSON.stringify(item)
                : String(item)
          }
          sx={{ maxWidth: 180 }}
        />
      ))}
      {remaining > 0 && <Chip size="small" variant="outlined" label={`+${remaining} more`} />}
    </Stack>
  );
};
