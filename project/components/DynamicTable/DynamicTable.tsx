"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Box,
  Button,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import type { TableRowData, ActionButton, DynamicTableProps } from "./types";
import {
  searchInValue,
  compareValues,
  defaultRender,
  exportToCSV,
  exportToJSON,
} from "./utils";
import { SearchBar } from "./components/SearchBar";
import { TableHeader } from "./components/TableHeader";
import { ActionButtons } from "./components/ActionButtons";

export type { TableRowData, ActionButton };

function DynamicTable<T = Record<string, unknown>>({
  rows,
  columns,
  columnRenderers,
  maxChips = 4,
  actions,
  actionsLabel = "Actions",
  enableSearch = true,
  searchPlaceholder = "Search across all fields...",
  enableSorting = true,
  defaultSortColumn,
  defaultSortDirection = "asc",
  enablePagination = true,
  rowsPerPageOptions = [5, 10, 25, 50],
  defaultRowsPerPage = 5,
  totalCount,
  enableServerSidePagination = false,
  onPaginationChange,
  onSearchChange,
  onSortChange,
  enableExport = false,
  exportFilename = "export",
  exportExcludeKeys = ["id"],
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
    // If columns are explicitly provided, use them
    if (columns) return columns;

    // Otherwise, try to infer from data
    if (!rows || rows.length === 0) return [];

    return Object.keys(rows[0])
      .filter((k) => k !== "id")
      .map((key) => ({
        key: key as keyof T & string,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      })) as { key: keyof T & string; label?: string }[];
  }, [rows, columns]);

  const filteredRows = useMemo(() => {
    if (!rows || rows.length === 0) return [];

    // If server-side pagination is enabled, skip client-side filtering
    // The server should handle filtering
    if (enableServerSidePagination) return rows;

    if (!searchTerm.trim()) return rows;

    return rows.filter((row) => {
      return inferredColumns.some((col) => {
        const value = row[col.key];
        return searchInValue(value, searchTerm);
      });
    });
  }, [rows, searchTerm, inferredColumns, enableServerSidePagination]);

  const sortedRows = useMemo(() => {
    // If server-side pagination is enabled, skip client-side sorting
    // The server should handle sorting
    if (enableServerSidePagination) return filteredRows;

    if (!sortColumn) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      return compareValues(aValue, bValue, sortDirection);
    });
  }, [filteredRows, sortColumn, sortDirection, enableServerSidePagination]);

  const paginatedRows = useMemo(() => {
    // If server-side pagination is enabled, don't slice the rows
    // The parent component is responsible for sending the correct page of data
    if (enableServerSidePagination) {
      return sortedRows;
    }

    // Client-side pagination: slice the sorted rows
    return enablePagination
      ? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : sortedRows;
  }, [
    sortedRows,
    enablePagination,
    enableServerSidePagination,
    page,
    rowsPerPage,
  ]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    // Notify parent component of pagination change for server-side pagination
    if (enableServerSidePagination && onPaginationChange) {
      onPaginationChange(newPage, rowsPerPage);
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    // Notify parent component of pagination change for server-side pagination
    if (enableServerSidePagination && onPaginationChange) {
      onPaginationChange(0, newRowsPerPage);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    setPage(0); // Reset to first page when searching

    // Notify parent component for server-side search
    if (enableServerSidePagination && onSearchChange) {
      onSearchChange(newSearchTerm);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(0);

    // Notify parent component for server-side search
    if (enableServerSidePagination && onSearchChange) {
      onSearchChange("");
    }
  };

  const handleSort = (column: keyof T & string) => {
    let newDirection: "asc" | "desc";

    if (sortColumn === column) {
      // Toggle direction if same column
      newDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newDirection);
    } else {
      // New column, start with ascending
      setSortColumn(column);
      newDirection = "asc";
      setSortDirection(newDirection);
    }
    setPage(0); // Reset to first page when sorting

    // Notify parent component for server-side sorting
    if (enableServerSidePagination && onSortChange) {
      onSortChange(column, newDirection);
    }
  };

  const handleExportCSV = () => {
    // Export all filtered/sorted rows, not just current page
    exportToCSV(sortedRows, `${exportFilename}.csv`, exportExcludeKeys);
  };

  const handleExportJSON = () => {
    // Export all filtered/sorted rows, not just current page
    exportToJSON(sortedRows, `${exportFilename}.json`, exportExcludeKeys);
  };

  return (
    <Paper>
      {enableSearch && (
        <SearchBar
          searchTerm={searchTerm}
          searchPlaceholder={searchPlaceholder}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          filteredCount={
            enableServerSidePagination
              ? paginatedRows.length
              : filteredRows.length
          }
          totalCount={
            enableServerSidePagination
              ? (totalCount ?? 0)
              : (totalCount ?? rows.length)
          }
        />
      )}

      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHeader
            columns={inferredColumns}
            enableSorting={enableSorting}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            hasActions={!!(actions && actions.length > 0)}
            actionsLabel={actionsLabel}
          />
          <TableBody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, rIdx) => (
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
                  {actions && actions.length > 0 && (
                    <ActionButtons actions={actions} row={row} />
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={
                    inferredColumns.length +
                    (actions && actions.length > 0 ? 1 : 0)
                  }
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography color="text.secondary">
                    {searchTerm ? "No results found" : "No data available"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {enablePagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={
            enableServerSidePagination
              ? (totalCount ?? 0)
              : (totalCount ?? filteredRows.length)
          }
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {enableExport && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Export data:
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
          >
            CSV
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleExportJSON}
          >
            JSON
          </Button>
        </Box>
      )}
    </Paper>
  );
}

export default DynamicTable;
