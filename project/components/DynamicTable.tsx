"use client";

import React, { useMemo } from "react";
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
  Typography,
} from "@mui/material";

export type TableRowData<T = Record<string, unknown>> = T & {
  id?: string | number | null;
};

type ColumnRenderer<T = Record<string, unknown>> = (
  value: T[keyof T],
  row: TableRowData<T>,
  key: keyof T & string,
) => React.ReactNode;

type DynamicTableProps<T = Record<string, unknown>> = {
  rows: TableRowData<T>[];
  columns?: { key: keyof T & string; label?: string }[];
  columnRenderers?: Partial<Record<keyof T, ColumnRenderer<T>>>;
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

const defaultRender = (value: unknown, maxChips?: number): React.ReactNode => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return <Typography color="text.secondary">—</Typography>;
  }

  // Handle primitives
  if (isPrimitive(value)) {
    if (typeof value === "boolean")
      return <Chip size="small" label={value ? "True" : "False"} />;
    if (typeof value === "string")
      return <span title={value}>{truncate(value)}</span>;
    return String(value);
  }

  // Handle arrays
  if (Array.isArray(value)) {
    const allPrim = value.every(isPrimitive);
    if (allPrim)
      return <DefaultArrayRenderer arr={value} maxChips={maxChips} />;
    return truncate(JSON.stringify(value), 80);
  }

  // Handle objects
  if (typeof value === "object") {
    return truncate(JSON.stringify(value), 80);
  }

  return String(value);
};

function DynamicTable<T = Record<string, unknown>>({
  rows,
  columns,
  columnRenderers,
  maxChips = 4,
}: DynamicTableProps<T>) {
  const inferredColumns = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    return (
      columns ??
      (Object.keys(rows[0])
        .filter((k) => k !== "id")
        .map((key) => ({
          key: key as keyof T & string,
          label: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
        })) as { key: keyof T & string; label?: string }[])
    );
  }, [rows, columns]);

  if (!rows || rows.length === 0) return null;

  return (
    <Paper>
      <TableContainer>
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
                  const value = row[col.key];
                  const custom = columnRenderers?.[col.key];
                  return (
                    <TableCell key={String(col.key)}>
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
    </Paper>
  );
}

export default DynamicTable;
