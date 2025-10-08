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
import Chip from "./Chip";

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
              <TableCell style={{ fontWeight: "bold" }}>{row.unit}</TableCell>
              <TableCell>{row.week}</TableCell>
              <TableCell>{row.sessions}</TableCell>
              <TableCell>{row.assigned}</TableCell>
              <TableCell>{row.unassigned}</TableCell>
              <TableCell>{row.hours}</TableCell>
              <TableCell>{row.lastChange}</TableCell>
              <TableCell>
                <Chip
                  label={row.status}
                  size="small"
                  color={row.status === "Attention" ? "warning" : "success"}
                  variant={row.status === "Attention" ? "filled" : "outlined"}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AllocationsTable;
