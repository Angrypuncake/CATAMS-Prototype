import React from "react";
import { TableHead, TableRow, TableCell, TableSortLabel } from "@mui/material";

interface TableHeaderProps<T> {
  columns: { key: keyof T & string; label?: string }[];
  enableSorting: boolean;
  sortColumn: (keyof T & string) | null;
  sortDirection: "asc" | "desc";
  onSort: (column: keyof T & string) => void;
  hasActions: boolean;
  actionsLabel: string;
}

export const TableHeader = <T,>({
  columns,
  enableSorting,
  sortColumn,
  sortDirection,
  onSort,
  hasActions,
  actionsLabel,
}: TableHeaderProps<T>) => {
  return (
    <TableHead>
      <TableRow>
        {columns.map((col) => (
          <TableCell key={String(col.key)} sx={{ fontWeight: 600 }}>
            {enableSorting ? (
              <TableSortLabel
                active={sortColumn === col.key}
                direction={sortColumn === col.key ? sortDirection : "asc"}
                onClick={() => onSort(col.key)}
              >
                {col.label ?? String(col.key)}
              </TableSortLabel>
            ) : (
              (col.label ?? String(col.key))
            )}
          </TableCell>
        ))}
        {hasActions && (
          <TableCell sx={{ fontWeight: 600 }} align="right">
            {actionsLabel}
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
};
