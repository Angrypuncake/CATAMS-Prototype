"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import type { ActionRequiredRow, SortableColumns } from "./types";
import StyledButton from "./StyledButton";

interface ActionRequiredTableProps {
  actions: ActionRequiredRow[];
  sortConfig: {
    column: SortableColumns;
    direction: "asc" | "desc";
  } | null;
  onSort: (column: SortableColumns) => void;
}

const ActionRequiredTable: React.FC<ActionRequiredTableProps> = ({
  actions,
  sortConfig,
  onSort,
}) => {
  return (
    <>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Action Required
      </Typography>
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
              <TableCell className="font-bold text-center">Time</TableCell>
              <TableCell className="font-bold text-center">Unit</TableCell>
              <TableCell className="font-bold text-center">Hours</TableCell>
              <TableCell className="font-bold text-center">
                Description
              </TableCell>
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
            {actions.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.session_date}</TableCell>
                <TableCell>{row.time}</TableCell>
                <TableCell>{row.unit}</TableCell>
                <TableCell>{row.hours}</TableCell>
                <TableCell>{row.desc}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell className="text-left">
                  <Box display="flex" justifyContent="center">
                    <StyledButton>{row.actions}</StyledButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ActionRequiredTable;
