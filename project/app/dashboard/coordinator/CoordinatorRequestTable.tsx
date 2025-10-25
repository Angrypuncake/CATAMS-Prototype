import { UCApproval } from "@/app/_types/request";
import DynamicTable from "@/components/DynamicTable/DynamicTable";
import { Chip, Button } from "@mui/material";
import { JSX } from "react";
import { useRouter } from "next/navigation";

// Suppose this is inside your UCRequestsPage.tsx
export default function UCRequestsTable({
  requests,
}: {
  requests: UCApproval[];
}) {
  const router = useRouter();

  // -------------------------------------------------
  // 🔹 Define base columns
  // -------------------------------------------------
  const columns: { key: keyof UCApproval | "review"; label: string }[] = [
    { key: "requestId", label: "Request ID" },
    { key: "activityName", label: "Activity" },
    { key: "sessionDate", label: "Date" },
    { key: "startAt", label: "Start" },
    { key: "endAt", label: "End" },
    { key: "requesterName", label: "Requester" },
    { key: "reviewerName", label: "Reviewer" },
    { key: "requestStatus", label: "Status" },
    { key: "review", label: "Review" }, // 👈 new column
  ];

  // -------------------------------------------------
  // 🔹 Status label map
  // -------------------------------------------------
  const STATUS_LABELS: Record<string, string> = {
    pending_uc: "Pending UC Review",
    approved: "Approved",
    rejected: "Rejected",
    pending_admin: "Pending Admin Review",
    pending_ta: "Pending TA Review",
  };

  // -------------------------------------------------
  // 🔹 Column renderers
  // -------------------------------------------------
  const columnRenderers: Partial<
    Record<
      keyof UCApproval | "review",
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
      const label = STATUS_LABELS[value] ?? value.replace("_", " ");
      return <Chip label={label} color={color} />;
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

    review: (_, row) => (
      <Button
        variant="outlined"
        size="small"
        onClick={() =>
          router.push(`/dashboard/coordinator/review/${row.requestId}`)
        }
      >
        Review
      </Button>
    ),
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
