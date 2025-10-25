import { UCApproval } from "@/app/_types/request";
import DynamicTable from "@/components/DynamicTable/DynamicTable";
import { Chip } from "@mui/material";

// Suppose this is inside your UCRequestsPage.tsx
export default function UCRequestsTable({
  requests,
}: {
  requests: UCApproval[];
}) {
  // -------------------------------------------------
  // 🔹 Define columns (these are the table headers)
  // -------------------------------------------------
  const columns: { key: keyof UCApproval; label: string }[] = [
    { key: "requestId", label: "Request ID" },
    { key: "activityName", label: "Activity" },
    { key: "sessionDate", label: "Date" },
    { key: "startAt", label: "Start" },
    { key: "endAt", label: "End" },
    { key: "requesterName", label: "Requester" },
    { key: "reviewerName", label: "Reviewer" },
    { key: "requestStatus", label: "Status" },
  ];

  const columnRenderers: Partial<
    Record<
      keyof UCApproval,
      (value: UCApproval[keyof UCApproval]) => JSX.Element | string
    >
  > = {
    requestStatus: (value) => {
      if (typeof value !== "string") return "";
      const color =
        value === "approved"
          ? "success"
          : value === "rejected"
            ? "error"
            : "warning";
      return <Chip label={value.replace("_", " ")} color={color} />;
    },

    sessionDate: (value) => {
      if (typeof value !== "string") return "";
      return new Date(value).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    startAt: (value) => (typeof value === "string" ? value.slice(0, 5) : ""),
    endAt: (value) => (typeof value === "string" ? value.slice(0, 5) : ""),
  };

  // -------------------------------------------------
  // 🔹 Render DynamicTable
  // -------------------------------------------------
  return (
    <DynamicTable<UCApproval>
      rows={requests}
      columns={columns}
      columnRenderers={columnRenderers}
      defaultSortColumn="sessionDate"
      defaultSortDirection="asc"
      enablePagination
      enableSearch
      exportFilename="uc_requests"
    />
  );
}
