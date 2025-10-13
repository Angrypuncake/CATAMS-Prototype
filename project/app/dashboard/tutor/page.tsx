"use client";
import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import StyledBox from "./components";
import AllocationsTable from "./AllocationsTable";
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
import { mapToRequestRow, useColumnSorter } from "./utils";
import { actions, notices } from "./mockData";
import { getTutorRequests } from "@/app/services/requestService";
import { RequestRow } from "@/app/_types/request";

/* ========= Page ========= */
const Page = () => {
  const [tutorSessions, setTutorSessions] = useState<AllocationRow[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortAllocationsConfig, setSortAllocationsConfig] = useState<{
    column: SortableColumns;
    direction: "asc" | "desc";
  } | null>(null);
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

  // new states for pagination + search
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [tutorRequests, setTutorRequests] = useState<RequestRow[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);

  // Get requests
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
        setTotalRequests(requestsData.total);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, rowsPerPage]);

  const sortedSessions: AllocationRow[] = useColumnSorter<AllocationRow>(
    tutorSessions,
    sortAllocationsConfig,
  );

  const sortedActions: ActionRequiredRow[] = useColumnSorter<ActionRequiredRow>(
    actions,
    sortActionsConfig,
  );
  const sortedRequests: RequestRow[] = tutorRequests; // bypass sorter
  const sortedNotices: NoticeRow[] = useColumnSorter<NoticeRow>(
    notices,
    sortNoticesConfig,
  );

  // modal (ONLY for "My Allocations")
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<AllocationRow | null>(null);

  useEffect(() => {
    const fetchTutorSessions = async () => {
      try {
        const sessionUser = await getCurrentUser();
        const allocationsData = await getTutorAllocations(
          sessionUser.userId,
          page + 1,
          rowsPerPage,
        );

        setTutorSessions(allocationsData.data);
        setTotalSessions(allocationsData.total);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorSessions();
  }, [page, rowsPerPage]);

  // NEED MORE QUERIES FOR NOTICES, REQUESTS AND ACTIONS

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

  const handleSortAllocations = createSortHandler(setSortAllocationsConfig);
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
        <AllocationsTable
          sessions={sortedSessions}
          totalCount={totalSessions}
          sortConfig={sortAllocationsConfig}
          onSort={handleSortAllocations}
          onRowClick={(row) => {
            setSession(row);
            setOpen(true);
          }}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(0);
          }}
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
