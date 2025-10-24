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

interface ClaimData {
  tutor: string;
  session: string;
  diff: string;
  submitted: string;
}

interface ClaimsTableProps {
  data: ClaimData[];
}

const ClaimsTable: React.FC<ClaimsTableProps> = ({ data }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Tutor</TableCell>
            <TableCell>Session</TableCell>
            <TableCell>Diff</TableCell>
            <TableCell>Submitted</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((claim: ClaimData, idx: number) => (
            <TableRow key={idx}>
              <TableCell>{claim.tutor}</TableCell>
              <TableCell>{claim.session}</TableCell>
              <TableCell style={{ fontWeight: 700 }}>{claim.diff}</TableCell>
              <TableCell>{claim.submitted}</TableCell>
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

export default ClaimsTable;
