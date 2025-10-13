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
} from "@mui/material";
import type { TableRowData, ActionButton, DynamicTableProps } from "./types";
import { searchInValue, compareValues, defaultRender } from "./utils";
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
        <SearchBar
          searchTerm={searchTerm}
          searchPlaceholder={searchPlaceholder}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          filteredCount={filteredRows.length}
          totalCount={rows.length}
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
