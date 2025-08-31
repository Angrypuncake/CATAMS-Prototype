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

  // dynamically take column headers from keys of first row
  const columns = Object.keys(rows[0]).filter((key) => key !== "id");

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col}>{col}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={col}>{row[col]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DynamicTable;
