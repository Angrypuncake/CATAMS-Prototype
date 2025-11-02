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
  Button,
  Chip,
} from "@mui/material";
import { TutorRequestRow } from "./types";

const pillApprove = {
  borderColor: "#000",
  color: "#000",
  borderRadius: 9999,
  px: 2,
  "&:hover": { backgroundColor: "#000", color: "#fff", borderColor: "#111" },
};
const pillReject = {
  borderColor: "#000",
  color: "#000",
  borderRadius: 9999,
  px: 2,
  "&:hover": { backgroundColor: "#000", color: "#fff", borderColor: "#111" },
};

interface CoordinatorApprovalTableProps {
  pendingRequests: TutorRequestRow[];
}

const CoordinatorApprovalTable = ({ pendingRequests }: CoordinatorApprovalTableProps) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        border: "1px solid #000",
        overflow: "hidden",
        boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow
            sx={{
              "& th": {
                fontWeight: 700,
                backgroundColor: "grey.100",
                borderColor: "#000",
              },
            }}
          >
            <TableCell width={120}>Request ID</TableCell>
            <TableCell width={120}>Type</TableCell>
            <TableCell>Related Session</TableCell>
            <TableCell width={260}>By</TableCell>
            <TableCell align="center" width={120}>
              Approve
            </TableCell>
            <TableCell align="center" width={110}>
              Reject
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingRequests.map((row) => (
            <TableRow key={row.requestID} hover sx={{ "& td": { borderColor: "#000" } }}>
              <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>{row.requestID}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={row.type}
                  sx={{ borderColor: "#000", color: "#000" }}
                  variant="outlined"
                />
              </TableCell>
              <TableCell
                sx={{
                  maxWidth: 420,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {row.relatedSession}
              </TableCell>
              <TableCell>
                {row.creatorRole}: <strong>{row.creator}</strong> ({row.user_id})
              </TableCell>
              <TableCell align="center">
                <Button size="small" variant="outlined" sx={pillApprove}>
                  Approve
                </Button>
              </TableCell>
              <TableCell align="center">
                <Button size="small" variant="outlined" sx={pillReject}>
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {pendingRequests.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                No pending requests.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CoordinatorApprovalTable;
