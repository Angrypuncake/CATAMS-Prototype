import React from "react";
import { Typography, Chip, Stack } from "@mui/material";
import { isPrimitive, isDate, formatDate, truncate } from "./utils";
import { InspectButton } from "./components/InspectButton";
import { DefaultArrayRenderer } from "./components/DefaultArrayRenderer";

export const defaultRender = (
  value: unknown,
  maxChips?: number,
): React.ReactNode => {
  if (value === null || value === undefined) {
    return <Typography color="text.secondary">—</Typography>;
  }

  if (isDate(value)) {
    const formatted = formatDate(value);
    return <span title={(value as Date).toISOString()}>{formatted}</span>;
  }

  if (isPrimitive(value)) {
    if (typeof value === "boolean")
      return <Chip size="small" label={value ? "True" : "False"} />;
    if (typeof value === "string")
      return <span title={value}>{truncate(value)}</span>;
    return String(value);
  }

  if (Array.isArray(value)) {
    const allPrim = value.every(isPrimitive);
    if (allPrim)
      return <DefaultArrayRenderer arr={value} maxChips={maxChips} />;
    const preview = truncate(JSON.stringify(value), 80);
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2">{preview}</Typography>
        <InspectButton value={value} />
      </Stack>
    );
  }

  if (typeof value === "object") {
    const preview = truncate(JSON.stringify(value), 80);
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2">{preview}</Typography>
        <InspectButton value={value} />
      </Stack>
    );
  }

  return String(value);
};
