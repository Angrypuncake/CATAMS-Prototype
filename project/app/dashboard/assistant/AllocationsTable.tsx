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
} from "@mui/material";

interface AllocationRow {
  unit: string;
  week: string;
  sessions: number;
  assigned: number;
  unassigned: number;
  hours: number;
  lastChange: string;
  status: "Open" | "Attention";
}

interface AllocationsTableProps {
  data: AllocationRow[];
}

const AllocationsTable: React.FC<AllocationsTableProps> = ({ data }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Unit</TableCell>
            <TableCell>Week</TableCell>
            <TableCell>Sessions</TableCell>
            <TableCell>Assigned</TableCell>
            <TableCell>Unassigned</TableCell>
            <TableCell>Hours</TableCell>
            <TableCell>Last Change</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row: AllocationRow, idx: number) => (
            <TableRow key={idx}>
              <TableCell style={{ fontWeight: 700 }}>{row.unit}</TableCell>
              <TableCell>{row.week}</TableCell>
              <TableCell>{row.sessions}</TableCell>
              <TableCell>{row.assigned}</TableCell>
              <TableCell>{row.unassigned}</TableCell>
              <TableCell>{row.hours}</TableCell>
              <TableCell>{row.lastChange}</TableCell>
              <TableCell>
                {/* Minimal monochrome pill (orange only when attention) */}
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: 9999,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    border: "1px solid",
                    borderColor:
                      row.status === "Attention" ? "#F97316" : "#111111",
                    color: row.status === "Attention" ? "#F97316" : "#111111",
                    background:
                      row.status === "Attention"
                        ? "rgba(249,115,22,0.06)"
                        : "transparent",
                  }}
                >
                  {row.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AllocationsTable;
