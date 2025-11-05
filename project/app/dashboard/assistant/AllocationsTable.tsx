"use client";

import { AdminAllocationRow } from "@/app/_types/allocations";
import DynamicTable from "@/components/DynamicTable/DynamicTable";
import { Chip, Button } from "@mui/material";
import { JSX } from "react";
import { useRouter } from "next/navigation";

export default function TAAllocationsTable({
  allocations,
}: {
  allocations: AdminAllocationRow[];
}) {
  const router = useRouter();

  // -------------------------------------------------
  // 🔹 Define columns to show
  // -------------------------------------------------
  const columns = [
    { key: "activity_name", label: "Activity" },
    { key: "activity_type", label: "Type" },
    { key: "session_date", label: "Date" },
    { key: "start_at", label: "Start" },
    { key: "end_at", label: "End" },
    { key: "location", label: "Location" },
    { key: "hours", label: "Hours" },
    { key: "status", label: "Status" },
    { key: "teaching_role", label: "Role" },
    { key: "view", label: "Details" },
  ];

  // -------------------------------------------------
  // 🔹 Status display map
  // -------------------------------------------------
  const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
  };

  // -------------------------------------------------
  // 🔹 Column renderers
  // -------------------------------------------------
  const columnRenderers: Partial<
    Record<
      keyof AdminAllocationRow | "view",
      (
        value: AdminAllocationRow[keyof AdminAllocationRow],
        row: AdminAllocationRow,
      ) => JSX.Element | string
    >
  > = {
    status: (value) => {
      if (typeof value !== "string") return "";
      const label = STATUS_LABELS[value] ?? value;
      const color =
        value === "approved"
          ? "success"
          : value === "pending"
            ? "warning"
            : value === "rejected"
              ? "error"
              : "default";
      return <Chip label={label} color={color} variant="outlined" />;
    },

    session_date: (value) => {
      if (typeof value !== "string") return "";
      return new Date(value).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    start_at: (value) => (typeof value === "string" ? value.slice(0, 5) : ""),
    end_at: (value) => (typeof value === "string" ? value.slice(0, 5) : ""),

    view: (_, row) => (
      <Button
        variant="outlined"
        size="small"
        color="primary"
        onClick={() => router.push(`/dashboard/ta/allocations/${row.id}`)}
      >
        View
      </Button>
    ),
  };

  // -------------------------------------------------
  // 🔹 Render table
  // -------------------------------------------------
  return (
    <DynamicTable<AdminAllocationRow>
      rows={allocations}
      columns={
        columns as { key: keyof AdminAllocationRow & string; label?: string }[]
      }
      columnRenderers={columnRenderers}
      defaultSortColumn="session_date"
      defaultSortDirection="asc"
      enablePagination
      enableSearch
      exportFilename="ta_allocations"
    />
  );
}
