// components/DynamicTable.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export type TableRowData = {
  id?: string | number | null;
  [key: string]: unknown;
};

type ColumnRenderer = (
  value: unknown,
  row: TableRowData,
  key: string,
) => React.ReactNode;

type DynamicTableProps = {
  rows: TableRowData[];
  // Optional: force column order / labels
  columns?: { key: string; label?: string }[];
  // Optional: override renderers per column key
  columnRenderers?: Record<string, ColumnRenderer>;
  // Optional: max chips to show before "+N more"
  maxChips?: number;
};

const isPrimitive = (v: unknown) =>
  v === null ||
  v === undefined ||
  ["string", "number", "boolean"].includes(typeof v);

const truncate = (s: string, n = 80) =>
  s.length > n ? s.slice(0, n) + "…" : s;

const DefaultArrayRenderer = ({
  arr,
  maxChips = 4,
}: {
  arr: unknown[];
  maxChips?: number;
}) => {
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
      {remaining > 0 && (
        <Chip size="small" variant="outlined" label={`+${remaining} more`} />
      )}
    </Stack>
  );
};

const InspectButton = ({ value }: { value: unknown }) => {
  const [open, setOpen] = useState(false);
  const stringified = useMemo(() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }, [value]);

  return (
    <>
      <Tooltip title="Expand">
        <IconButton size="small" onClick={() => setOpen(true)}>
          <SearchIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Cell details</DialogTitle>
        <DialogContent dividers>
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: 12,
            }}
          >
            {stringified}
          </pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const defaultRender = (value: unknown, maxChips?: number): React.ReactNode => {
  // Primitive
  if (isPrimitive(value)) {
    if (value === null || value === undefined)
      return <Typography color="text.secondary">—</Typography>;
    if (typeof value === "boolean")
      return <Chip size="small" label={value ? "True" : "False"} />;
    if (typeof value === "string")
      return <span title={value}>{truncate(value)}</span>;
    return String(value);
  }

  // Array
  if (Array.isArray(value)) {
    // If array of primitives → chips
    const allPrim = value.every(isPrimitive);
    if (allPrim)
      return <DefaultArrayRenderer arr={value} maxChips={maxChips} />;
    // Mixed/objects → short preview + expand
    const preview = truncate(
      (() => {
        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      })(),
      80,
    );
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2">{preview}</Typography>
        <InspectButton value={value} />
      </Stack>
    );
  }

  // Object
  if (typeof value === "object") {
    const preview = truncate(
      (() => {
        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      })(),
      80,
    );
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2">{preview}</Typography>
        <InspectButton value={value} />
      </Stack>
    );
  }

  // Fallback
  return String(value);
};

const DynamicTable: React.FC<DynamicTableProps> = ({
  rows,
  columns,
  columnRenderers,
  maxChips = 4,
}) => {
  if (!rows || rows.length === 0) return null;

  const inferredColumns =
    columns ??
    Object.keys(rows[0])
      .filter((k) => k !== "id")
      .map((key) => ({
        key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      }));

  return (
    <TableContainer component={Paper} sx={{ height: "100%", overflow: "auto" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {inferredColumns.map((col) => (
              <TableCell key={col.key} sx={{ fontWeight: 600 }}>
                {col.label ?? col.key}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rIdx) => (
            <TableRow key={(row.id as React.Key) ?? rIdx}>
              {inferredColumns.map((col) => {
                const value = (row as Record<string, unknown>)[col.key];
                const custom = columnRenderers?.[col.key];
                return (
                  <TableCell key={col.key}>
                    {custom
                      ? custom(value, row, col.key)
                      : defaultRender(value, maxChips)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DynamicTable;
