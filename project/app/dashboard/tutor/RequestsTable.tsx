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
import type { RequestRow, SortableColumns } from "./types";
import StyledButton from "./StyledButton";

interface RequestsTableProps {
  requests: RequestRow[];
  sortConfig: {
    column: SortableColumns;
    direction: "asc" | "desc";
  } | null;
  onSort: (column: SortableColumns) => void;
}

const RequestsTable: React.FC<RequestsTableProps> = ({
  requests,
  sortConfig,
  onSort,
}) => {
  return (
    <>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        My Requests
      </Typography>
      <TableContainer component={Paper} className="shadow-sm">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="font-bold text-center">
                Request ID
              </TableCell>
              <TableCell className="font-bold text-center">Type</TableCell>
              <TableCell className="font-bold text-center">
                Related Session
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
            {requests.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.requestID}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.relatedSession}</TableCell>
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

export default RequestsTable;
