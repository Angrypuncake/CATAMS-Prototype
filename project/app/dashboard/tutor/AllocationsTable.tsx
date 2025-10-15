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
  Typography,
  Button,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import type { AllocationRow, SortableColumns } from "./types";
import { exportJSON, exportCSV, hoursBetween, niceTime } from "./utils";
import StyledButton from "./StyledButton";

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  "Approved allocation": { color: "#d1fae5", label: "Approved" }, // green
  "Hours for approval": { color: "#fff7ed", label: "Pending Approval" }, // orange
  "Rejected by approval": { color: "#fee2e2", label: "Rejected" }, // red
  "Variation complete": { color: "#e0f2fe", label: "Updated" }, // blue
  "Claimed allocation": { color: "#f0fdf4", label: "Claimed" }, // soft green
  "Cancelled allocation": { color: "#f3f4f6", label: "Cancelled" }, // grey
};
export type ActionVariant = "primary" | "secondary" | "warning" | "info";

interface TutorAction {
  label: string;
  variant: ActionVariant;
}

function getTutorAction(status: string): TutorAction {
  switch (status) {
    case "Approved allocation":
      return { label: "Claim Hours", variant: "primary" };
    case "Hours for approval":
      return { label: "Awaiting Approval", variant: "info" };
    case "Rejected by approval":
      return { label: "View Details", variant: "warning" };
    case "Variation complete":
      return { label: "Review Changes", variant: "secondary" };
    case "Claimed allocation":
      return { label: "View Claim", variant: "secondary" };
    case "Cancelled allocation":
      return { label: "N/A", variant: "secondary" };
    default:
      return { label: "View", variant: "secondary" };
  }
}

interface AllocationsTableProps {
  sessions: AllocationRow[];
  totalCount: number;
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
}

const AllocationsTable: React.FC<AllocationsTableProps> = ({
  sessions,
  totalCount,
  sortConfig,
  onSort,
  onRowClick,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  search,
  onSearchChange,
}) => {
  return (
    <>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        My Allocations
      </Typography>

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
            {sessions.map((row, index) => {
              const status = row.status ?? "N/A";
              const { color, label } = STATUS_STYLES[status] || {
                color: "white",
                label: status,
              };
              const action = getTutorAction(status);

              return (
                <TableRow
                  key={index}
                  onClick={() => onRowClick(row)}
                  sx={{
                    backgroundColor: color,
                    "&:hover": {
                      backgroundColor: "#f9fafb",
                      cursor: "pointer",
                    },
                  }}
                >
                  <TableCell>
                    {row.session_date?.slice(0, 10) ?? "N/A"}
                  </TableCell>
                  <TableCell>
                    {row.start_at && row.end_at
                      ? `${niceTime(row.start_at)}-${niceTime(row.end_at)}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{row.unit_code ?? "N/A"}</TableCell>
                  <TableCell>{row.location ?? "N/A"}</TableCell>
                  <TableCell>
                    {hoursBetween(
                      row.start_at ?? undefined,
                      row.end_at ?? undefined,
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" textAlign="center">
                      {label}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" justifyContent="center">
                      <Button
                        variant="contained"
                        color={action.variant}
                        disabled={[
                          "Cancelled allocation",
                          "Hours for approval",
                        ].includes(row.status ?? "")}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick(row);
                        }}
                      >
                        {action.label}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </TableContainer>
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        gap={2.5}
        mt={2.5}
      >
        <Typography>
          You can export the above data in CSV or JSON formats
        </Typography>
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
      </Box>
    </>
  );
};

export default AllocationsTable;
