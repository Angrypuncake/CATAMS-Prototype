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
  Box,
  TablePagination,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import type { AllocationRow, SortableColumns } from "./types";
import { exportJSON, exportCSV, hoursBetween, niceTime } from "./utils";
import StyledButton from "./StyledButton";

interface AllocationsTableProps {
  sessions: AllocationRow[];
  sortConfig: {
    column: SortableColumns;
    direction: "asc" | "desc";
  } | null;
  onSort: (column: SortableColumns) => void;
  onRowClick: (row: AllocationRow) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  search: string;
  onSearchChange: (value: string) => void;
  filteredSessions: AllocationRow[];
}

const AllocationsTable: React.FC<AllocationsTableProps> = ({
  sessions,
  sortConfig,
  onSort,
  onRowClick,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  search,
  onSearchChange,
  filteredSessions,
}) => {
  const paginatedSessions = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSessions.slice(start, start + rowsPerPage);
  }, [filteredSessions, page, rowsPerPage]);

  return (
    <>
      <p className="font-bold text-xl mb-2">My Allocations</p>

      {/* search box */}
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => {
          onSearchChange(e.target.value);
        }}
        className="border rounded px-2 py-1 mb-2 w-1/3"
      />

      <TableContainer component={Paper} className="shadow-sm">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                className="font-bold text-center cursor-pointer"
                onClick={() => onSort("session_date")}
              >
                Date{" "}
                {sortConfig?.column === "session_date" &&
                  (sortConfig.direction === "asc" ? (
                    <ArrowUpwardIcon sx={{ fontSize: "0.9rem" }} />
                  ) : (
                    <ArrowDownwardIcon sx={{ fontSize: "0.9rem" }} />
                  ))}
              </TableCell>
              <TableCell
                className="font-bold text-center cursor-pointer"
                onClick={() => onSort("start_at")}
              >
                Time{" "}
                {sortConfig?.column === "start_at" &&
                  (sortConfig.direction === "asc" ? (
                    <ArrowUpwardIcon sx={{ fontSize: "0.9rem" }} />
                  ) : (
                    <ArrowDownwardIcon sx={{ fontSize: "0.9rem" }} />
                  ))}
              </TableCell>
              <TableCell
                className="font-bold text-center cursor-pointer"
                onClick={() => onSort("unit_code")}
              >
                Unit{" "}
                {sortConfig?.column === "unit_code" &&
                  (sortConfig.direction === "asc" ? (
                    <ArrowUpwardIcon sx={{ fontSize: "0.9rem" }} />
                  ) : (
                    <ArrowDownwardIcon sx={{ fontSize: "0.9rem" }} />
                  ))}
              </TableCell>

              <TableCell
                className="font-bold text-center cursor-pointer"
                onClick={() => onSort("location")}
              >
                Location{" "}
                {sortConfig?.column === "location" &&
                  (sortConfig.direction === "asc" ? (
                    <ArrowUpwardIcon sx={{ fontSize: "0.9rem" }} />
                  ) : (
                    <ArrowDownwardIcon sx={{ fontSize: "0.9rem" }} />
                  ))}
              </TableCell>
              <TableCell className="font-bold text-center">Hours</TableCell>
              <TableCell
                className="font-bold text-center cursor-pointer"
                onClick={() => onSort("status")}
              >
                Status{" "}
                {sortConfig?.column === "status" &&
                  (sortConfig.direction === "asc" ? (
                    <ArrowUpwardIcon sx={{ fontSize: "0.9rem" }} />
                  ) : (
                    <ArrowDownwardIcon sx={{ fontSize: "0.9rem" }} />
                  ))}
              </TableCell>
              <TableCell className="font-bold text-center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSessions.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  {row.session_date ? row.session_date.slice(0, 10) : "N/A"}
                </TableCell>
                <TableCell>
                  {row.start_at
                    ? `${niceTime(row.start_at)}-${niceTime(row.end_at)}`
                    : "N/A"}
                </TableCell>
                <TableCell>{row.unit_code ?? "N/A"}</TableCell>
                <TableCell>{row.location ?? "N/A"}</TableCell>
                <TableCell>{hoursBetween(row.start_at, row.end_at)}</TableCell>
                <TableCell>{row.status ?? "N/A"}</TableCell>
                <TableCell>
                  <Box display="flex" justifyContent="center">
                    <StyledButton onClick={() => onRowClick(row)}>
                      {row.actions ?? "View"}
                    </StyledButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredSessions.length}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </TableContainer>
      <div className="justify-end items-center flex gap-5 mt-5">
        <p>You can export the above data in CSV or JSON formats</p>
        <StyledButton
          size="medium"
          onClick={() =>
            exportCSV(sessions as unknown as Record<string, string | number>[])
          }
        >
          Export as CSV
        </StyledButton>
        <StyledButton
          size="medium"
          onClick={() =>
            exportJSON(sessions as unknown as Record<string, string | number>[])
          }
        >
          Export as JSON
        </StyledButton>
      </div>
    </>
  );
};

export default AllocationsTable;
