import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { UnitBudgetRow } from "./types";

interface BudgetOverviewTableProps {
  computedData: {
    rows: (UnitBudgetRow & { status: string })[];
    alerts: { message: string; unitCode: string }[];
  } | null;
}

const UnitBudgetOverviewTable = ({
  computedData,
}: BudgetOverviewTableProps) => {
  const AUD = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  });
  const PCT = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Unit</TableCell>
            <TableCell>Year</TableCell>
            <TableCell>Session</TableCell>
            <TableCell>Allocated Amount (Budget) </TableCell>
            <TableCell>Claimed Amount (Spent) </TableCell>
            <TableCell>% Used</TableCell>
            <TableCell>Forecast (Wk)</TableCell>
            <TableCell>Variance</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {computedData?.rows.map((row) => (
            <TableRow key={row.unitCode}>
              <TableCell style={{ fontWeight: "bold" }}>
                {row.unitCode}
              </TableCell>
              <TableCell>{row.year}</TableCell>
              <TableCell>{row.session}</TableCell>
              <TableCell>{AUD.format(row.budget)}</TableCell>
              <TableCell>{AUD.format(row.spent)}</TableCell>
              <TableCell>{PCT(row.pctUsed)}</TableCell>
              <TableCell>---</TableCell>
              <TableCell>{AUD.format(row.variance)}</TableCell>
              <TableCell>
                {" "}
                <span
                  className={
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
                    (row.status === "Exceeding"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800")
                  }
                >
                  {row.status}
                </span>{" "}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UnitBudgetOverviewTable;
