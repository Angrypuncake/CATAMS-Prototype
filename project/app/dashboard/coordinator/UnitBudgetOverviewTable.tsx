"use client";

import React from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
} from "@mui/material";
import { UnitBudgetRow } from "./types";

interface BudgetOverviewTableProps {
  computedData: {
    rows: (UnitBudgetRow & { status: string })[];
    alerts: { message: string; unitCode: string }[];
  } | null;
}

const UnitBudgetOverviewTable = ({ computedData }: BudgetOverviewTableProps) => {
  const AUD = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
  const PCT = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <TableContainer
      component={Paper}
      sx={{
        mt: 1,
        borderRadius: 3,
        border: "1px solid #000",
        overflow: "hidden",
        boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow sx={{ "& th": { fontWeight: 700, backgroundColor: "grey.100", borderColor: "#000", whiteSpace: "nowrap" } }}>
            <TableCell>Unit</TableCell>
            <TableCell>Year</TableCell>
            <TableCell>Session</TableCell>
            <TableCell align="right">Total Course Budget</TableCell>
            <TableCell align="right">Allocated Amount</TableCell>
            <TableCell align="right">Claimed Amount</TableCell>
            <TableCell align="right">% Used</TableCell>
            <TableCell align="right">Variance</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {computedData?.rows.map((row) => (
            <TableRow key={row.unitCode} hover sx={{ "& td": { borderColor: "#000" } }}>
              <TableCell sx={{ fontWeight: 600 }}>{row.unitCode}</TableCell>
              <TableCell>{row.year}</TableCell>
              <TableCell>{row.session}</TableCell>
              <TableCell align="right">{AUD.format(row.budget)}</TableCell>
              <TableCell align="right">{AUD.format(row.allocated)}</TableCell>
              <TableCell align="right">{AUD.format(row.claimed)}</TableCell>
              <TableCell align="right">{PCT(row.pctUsed)}</TableCell>
              <TableCell align="right">{AUD.format(row.variance)}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={row.status}
                  sx={{ borderColor: "#000", color: "#000" }}
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ))}
          {!computedData && (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                Loading…
              </TableCell>
            </TableRow>
          )}
          {computedData && computedData.rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                No data for this session.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UnitBudgetOverviewTable;
