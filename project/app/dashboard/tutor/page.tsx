import React from "react";
import Button from "@mui/material/Button";
import { Typography } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const page = () => {
  const rows = [
    { name: "Alice", role: "Tutor" },
    { name: "Bob", role: "Teaching Assistant" },
    { name: "Charlie", role: "Coordinator" },
    { name: "Dana", role: "System Admin" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="body1">Tutor Page starts here</Typography>
      <Button variant="secondary">Click</Button>
      <Button variant="secondary" color="blue">
        Click
      </Button>
      <Button variant="secondary" color="red">
        Click
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default page;
