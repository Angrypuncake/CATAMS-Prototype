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
} from "@mui/material";

interface RequestData {
  tutor: string;
  session: string;
  type: "Swap" | "Correction";
  submitted: string;
}

interface RequestsTableProps {
  data: RequestData[];
}

const RequestsTable: React.FC<RequestsTableProps> = ({ data }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Tutor</TableCell>
            <TableCell>Session</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Submitted</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((request: RequestData, idx: number) => (
            <TableRow key={idx}>
              <TableCell>{request.tutor}</TableCell>
              <TableCell>{request.session}</TableCell>
              <TableCell style={{ fontWeight: 700 }}>{request.type}</TableCell>
              <TableCell>{request.submitted}</TableCell>
              <TableCell>
                <Button variant="text" size="small">
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RequestsTable;
