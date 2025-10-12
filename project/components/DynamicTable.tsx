"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Box,
  IconButton,
  TableSortLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

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

  enableSearch?: boolean;
  searchPlaceholder?: string;

  enableSorting?: boolean;
  defaultSortColumn?: keyof T & string;
  defaultSortDirection?: "asc" | "desc";

  enablePagination?: boolean;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
};

const isPrimitive = (v: unknown) =>
  v === null ||
  v === undefined ||
  ["string", "number", "boolean"].includes(typeof v);

const truncate = (s: string, n = 80) =>
  s.length > n ? s.slice(0, n) + "…" : s;

const searchInValue = (value: unknown, searchTerm: string): boolean => {
  if (value === null || value === undefined) return false;

  const lowerSearch = searchTerm.toLowerCase();

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value).toLowerCase().includes(lowerSearch);
  }

  if (Array.isArray(value)) {
    return value.some((item) => searchInValue(item, searchTerm));
  }

  if (typeof value === "object") {
    return Object.values(value).some((v) => searchInValue(v, searchTerm));
  }

  return false;
};

const compareValues = (
  a: unknown,
  b: unknown,
  direction: "asc" | "desc",
): number => {
  if (a === null || a === undefined) return direction === "asc" ? 1 : -1;
  if (b === null || b === undefined) return direction === "asc" ? -1 : 1;

  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  if (typeof a === "boolean" && typeof b === "boolean") {
    const aVal = a ? 1 : 0;
    const bVal = b ? 1 : 0;
    return direction === "asc" ? aVal - bVal : bVal - aVal;
  }

  const aStr = String(a).toLowerCase();
  const bStr = String(b).toLowerCase();

  if (aStr < bStr) return direction === "asc" ? -1 : 1;
  if (aStr > bStr) return direction === "asc" ? 1 : -1;
  return 0;
};

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
  if (value === null || value === undefined) {
    return <Typography color="text.secondary">—</Typography>;
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
    return truncate(JSON.stringify(value), 80);
  }

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
  enableSearch = true,
  searchPlaceholder = "Search across all fields...",
  enableSorting = true,
  defaultSortColumn,
  defaultSortDirection = "asc",
  enablePagination = true,
  rowsPerPageOptions = [5, 10, 25, 50],
  defaultRowsPerPage = 5,
}: DynamicTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<(keyof T & string) | null>(
    defaultSortColumn ?? null,
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    defaultSortDirection,
  );

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

  const filteredRows = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    if (!searchTerm.trim()) return rows;

    return rows.filter((row) => {
      return inferredColumns.some((col) => {
        const value = row[col.key];
        return searchInValue(value, searchTerm);
      });
    });
  }, [rows, searchTerm, inferredColumns]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      return compareValues(aValue, bValue, sortDirection);
    });
  }, [filteredRows, sortColumn, sortDirection]);

  const paginatedRows = useMemo(() => {
    return enablePagination
      ? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : sortedRows;
  }, [sortedRows, enablePagination, page, rowsPerPage]);

  if (!rows || rows.length === 0) return null;

  const handleChangePage = (_event: unknown, newPage: number) =>
    setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(0);
  };

  const handleSort = (column: keyof T & string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column, start with ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
    setPage(0); // Reset to first page when sorting
  };

  return (
    <Paper>
      {enableSearch && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {searchTerm && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Found {filteredRows.length} of {rows.length} results
            </Typography>
          )}
        </Box>
      )}

      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {inferredColumns.map((col) => (
                <TableCell key={String(col.key)} sx={{ fontWeight: 600 }}>
                  {enableSorting ? (
                    <TableSortLabel
                      active={sortColumn === col.key}
                      direction={sortColumn === col.key ? sortDirection : "asc"}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label ?? String(col.key)}
                    </TableSortLabel>
                  ) : (
                    (col.label ?? String(col.key))
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, rIdx) => (
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

      {enablePagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={sortedRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
}

export default DynamicTable;
