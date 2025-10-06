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
import type { NoticeRow, SortableColumns } from "./types";
import StyledButton from "./StyledButton";

interface NoticesTableProps {
  notices: NoticeRow[];
  sortConfig: {
    column: SortableColumns;
    direction: "asc" | "desc";
  } | null;
  onSort: (column: SortableColumns) => void;
}

const NoticesTable: React.FC<NoticesTableProps> = ({
  notices,
  sortConfig,
  onSort,
}) => {
  return (
    <>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Notices
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
              <TableCell className="font-bold text-center">Type</TableCell>
              <TableCell className="font-bold text-center">Message</TableCell>
              <TableCell className="font-bold text-center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notices.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.session_date}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.message}</TableCell>
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

export default NoticesTable;
