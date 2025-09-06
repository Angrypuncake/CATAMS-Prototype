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

type TableRowData = {
  id: string | number;
  [key: string]: string | number | boolean;
};

type TableProps = {
  rows: TableRowData[];
};

const DynamicTable: React.FC<TableProps> = ({ rows }) => {
  if (rows.length === 0) return null;

  // dynamically take column headers from keys of first row, replace underscores with spaces and capitalize first letters
  const columns = Object.keys(rows[0])
    .filter((key) => key !== "id")
    .map((key) => ({
      key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    }));

  return (
    <TableContainer
      component={Paper}
      sx={{
        transform: "scale(0.8)",
        transformOrigin: "top left",
        width: "125%",
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key}>{col.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={col.key}>{row[col.key]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DynamicTable;
