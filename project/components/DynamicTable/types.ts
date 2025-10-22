import React from "react";

export type TableRowData<T = Record<string, unknown>> = T & {
  id?: string | number | null;
};

export type ColumnRenderer<T = Record<string, unknown>> = (
  value: T[keyof T],
  row: TableRowData<T>,
  key: keyof T & string,
) => React.ReactNode;

export type ActionButton<T = Record<string, unknown>> = {
  label: string;
  onClick: (row: TableRowData<T>) => void;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  variant?: "text" | "outlined" | "contained";
  disabled?: (row: TableRowData<T>) => boolean;
  icon?: React.ReactNode;
};

export type DynamicTableProps<T = Record<string, unknown>> = {
  rows: TableRowData<T>[];
  columns?: { key: keyof T & string; label?: string }[];
  columnRenderers?: Partial<Record<keyof T, ColumnRenderer<T>>>;
  maxChips?: number;

  /** Action buttons props */
  actions?: ActionButton<T>[];
  actionsLabel?: string;

  /** Search/filter props */
  enableSearch?: boolean;
  searchPlaceholder?: string;

  /** Sorting props */
  enableSorting?: boolean;
  defaultSortColumn?: keyof T & string;
  defaultSortDirection?: "asc" | "desc";

  /** Optional pagination props */
  enablePagination?: boolean;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  totalCount?: number;

  /** Server-side pagination props */
  enableServerSidePagination?: boolean;
  onPaginationChange?: (page: number, rowsPerPage: number) => void;
  onSearchChange?: (searchTerm: string) => void;
  onSortChange?: (column: keyof T & string, direction: "asc" | "desc") => void;

  /** Export props */
  enableExport?: boolean;
  exportFilename?: string;
  exportExcludeKeys?: string[];
};
