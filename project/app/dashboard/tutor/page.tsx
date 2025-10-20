"use client";
import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import StyledBox from "./components";
import ActionRequiredTable from "./ActionRequiredTable";
import RequestsTable from "./RequestsTable";
import NoticesTable from "./NoticesTable";
import {
  getTutorAllocations,
  getCurrentUser,
} from "@/app/services/allocationService";
import AllocationQuickviewModal from "./AllocationQuickviewModal";
import type {
  AllocationRow,
  ActionRequiredRow,
  NoticeRow,
  SortableColumns,
} from "./types";
import {
  mapToRequestRow,
  useColumnSorter,
  hoursBetween,
  niceTime,
} from "./utils";
import { actions, notices } from "./mockData";
import { getTutorRequests } from "@/app/services/requestService";
import { RequestRow } from "@/app/_types/request";
import DynamicTable, {
  TableRowData,
} from "@/components/DynamicTable/DynamicTable";

/* ========= Page ========= */
const Page = () => {
  const [tutorSessions, setTutorSessions] = useState<AllocationRow[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [, setLoading] = useState(true);
  const [sortActionsConfig, setSortActionsConfig] = useState<{
    column: SortableColumns;
    direction: "asc" | "desc";
  } | null>(null);
  const [sortRequestsConfig, setSortRequestsConfig] = useState<{
    column: SortableColumns;
    direction: "asc" | "desc";
  } | null>(null);
  const [sortNoticesConfig, setSortNoticesConfig] = useState<{
    column: SortableColumns;
    direction: "asc" | "desc";
  } | null>(null);

  // Pagination states for allocations table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tutorRequests, setTutorRequests] = useState<RequestRow[]>([]);

  // Fetch allocations and requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionUser = await getCurrentUser();

        // 1 Allocations
        const allocationsData = await getTutorAllocations(
          sessionUser.userId,
          page + 1,
          rowsPerPage,
        );
        setTutorSessions(allocationsData.data);
        setTotalSessions(allocationsData.total);

        // 2 Requests (real API)
        const requestsData = await getTutorRequests(page + 1, rowsPerPage);
        const mappedRequests: RequestRow[] =
          requestsData.data.map(mapToRequestRow);
        setTutorRequests(mappedRequests);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, rowsPerPage]);

  // Sorting for other tables (Actions, Requests, Notices)
  const sortedActions: ActionRequiredRow[] = useColumnSorter<ActionRequiredRow>(
    actions,
    sortActionsConfig,
  );
  const sortedRequests: RequestRow[] = tutorRequests; // bypass sorter
  const sortedNotices: NoticeRow[] = useColumnSorter<NoticeRow>(
    notices,
    sortNoticesConfig,
  );

  // Modal for allocations
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<AllocationRow | null>(null);

  // Sort handlers for other tables
  type SortConfig = {
    column: SortableColumns;
    direction: "asc" | "desc";
  } | null;

  const createSortHandler = (
    setConfig: React.Dispatch<React.SetStateAction<SortConfig>>,
  ) => {
    return (column: SortableColumns) => {
      setConfig((prev) =>
        prev?.column === column
          ? { column, direction: prev.direction === "asc" ? "desc" : "asc" }
          : { column, direction: "asc" },
      );
    };
  };

  const handleSortActions = createSortHandler(setSortActionsConfig);
  const handleSortRequests = createSortHandler(setSortRequestsConfig);
  const handleSortNotices = createSortHandler(setSortNoticesConfig);

  const hours = 20;
  const sessions = 10;
  const requests = 2;

  return (
    <div className="max-w-6xl w-full mx-auto">
      <Typography variant="h5" fontWeight="bold" sx={{ m: 2.5 }}>
        Tutor Dashboard
      </Typography>

      <div className="flex w-full gap-5">
        <StyledBox accentColor="border-l-blue-500">
          <Typography>Allocated Hours</Typography>
          <Typography fontWeight="bold">{hours}</Typography>
        </StyledBox>
        <StyledBox accentColor="border-l-blue-500">
          <Typography>Upcoming Sessions</Typography>
          <Typography fontWeight="bold">{sessions}</Typography>
        </StyledBox>
        <StyledBox accentColor="border-l-blue-500">
          <Typography>Pending Requests</Typography>
          <Typography fontWeight="bold">{requests}</Typography>
        </StyledBox>
      </div>

      {/* ---------- My Allocations (ONLY this table opens a modal) ---------- */}
      <StyledBox>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          My Allocations
        </Typography>
        <DynamicTable<AllocationRow>
          rows={tutorSessions as TableRowData<AllocationRow>[]}
          columns={[
            { key: "session_date", label: "Date" },
            { key: "start_at", label: "Time" },
            { key: "unit_code", label: "Unit" },
            { key: "location", label: "Location" },
            { key: "hours", label: "Hours" },
            { key: "status", label: "Status" },
          ]}
          columnRenderers={{
            session_date: (value) => (
              <span>{value ? String(value).slice(0, 10) : "N/A"}</span>
            ),
            start_at: (_value, row) => (
              <span>
                {row.start_at && row.end_at
                  ? `${niceTime(row.start_at)}-${niceTime(row.end_at)}`
                  : "N/A"}
              </span>
            ),
            hours: (_value, row) => (
              <span>
                {hoursBetween(
                  row.start_at ?? undefined,
                  row.end_at ?? undefined,
                )}
              </span>
            ),
          }}
          enableServerSidePagination={true}
          onPaginationChange={(newPage, newRowsPerPage) => {
            setPage(newPage);
            setRowsPerPage(newRowsPerPage);
          }}
          totalCount={totalSessions}
          defaultRowsPerPage={5}
          rowsPerPageOptions={[5, 10, 25]}
          enableSearch={false}
          enableExport={true}
          exportFilename="tutor_allocations"
          exportExcludeKeys={["id", "user_id"]}
          actions={[
            {
              label: "View",
              onClick: (row) => {
                setSession(row);
                setOpen(true);
              },
              color: "primary",
              variant: "contained",
            },
          ]}
        />
      </StyledBox>

      {/* ---------- Other sections (unchanged, no modals) ---------- */}
      <StyledBox>
        <ActionRequiredTable
          actions={sortedActions}
          sortConfig={sortActionsConfig}
          onSort={handleSortActions}
        />
      </StyledBox>

      <StyledBox>
        <RequestsTable
          requests={sortedRequests}
          sortConfig={sortRequestsConfig}
          onSort={handleSortRequests}
        />
      </StyledBox>

      <StyledBox>
        <NoticesTable
          notices={sortedNotices}
          sortConfig={sortNoticesConfig}
          onSort={handleSortNotices}
        />
      </StyledBox>

      {/* ---------- Allocation Quick View Modal (ONLY for My Allocations) ---------- */}
      <AllocationQuickviewModal
        open={open}
        setOpen={setOpen}
        session={session}
      />
    </div>
  );
};

export default Page;
