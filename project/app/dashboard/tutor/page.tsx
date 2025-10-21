"use client";
import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import StyledBox from "./components";
import AllocationsTable from "./AllocationsTable";
import ActionRequiredTable from "./ActionRequiredTable";
import RequestsTable from "./RequestsTable";
import NoticesTable from "./NoticesTable";
import axios from "axios";
import AllocationQuickviewModal from "./AllocationQuickviewModal";
import type {
  AllocationRow,
  ActionRequiredRow,
  RequestRow,
  NoticeRow,
  SortableColumns,
} from "./types";
import { useColumnSorter } from "./utils";
import { actions, request, notices } from "./mockData";

// NEW: the modern USYD nav for this page only
import TutorModernNav from "@/components/TutorModernNav";

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

  // pagination + search
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");

  const sortedSessions: AllocationRow[] = useColumnSorter<AllocationRow>(
    tutorSessions,
    sortAllocationsConfig
  );
  const sortedActions: ActionRequiredRow[] = useColumnSorter<ActionRequiredRow>(
    actions,
    sortActionsConfig
  );
  const sortedRequests: RequestRow[] = useColumnSorter<RequestRow>(
    request,
    sortRequestsConfig
  );
  const sortedNotices: NoticeRow[] = useColumnSorter<NoticeRow>(
    notices,
    sortNoticesConfig
  );

  // modal (ONLY for "My Allocations")
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<AllocationRow | null>(null);

  useEffect(() => {
    const fetchTutorSessions = async () => {
      try {
        const sessionUser = await axios.get("/api/auth/me", {
          withCredentials: true,
        });

        const res = await fetch(
          `/api/tutor/allocations?userId=${sessionUser.data.userId}&page=${
            page + 1
          }&limit=${rowsPerPage}`
        );
        if (!res.ok) throw new Error("Failed to fetch tutor allocations");
        const data = await res.json();
        setTutorSessions(data.data);
        setTotalSessions(data.total);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorSessions();
  }, [page, rowsPerPage]);

  type SortConfig = {
    column: SortableColumns;
    direction: "asc" | "desc";
  } | null;

  const createSortHandler = (
    setConfig: React.Dispatch<React.SetStateAction<SortConfig>>
  ) => {
    return (column: SortableColumns) => {
      setConfig((prev) =>
        prev?.column === column
          ? { column, direction: prev.direction === "asc" ? "desc" : "asc" }
          : { column, direction: "asc" }
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
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* New modern USYD nav — white logo, divider, HELP + Logout, black strip below  */}
      <TutorModernNav
        titleRight="TUTOR"
        actions={[
          { label: "HELP", href: "/help" },
          {
            label: "Logout",
            onClick: async () => {
              try {
                await axios.post("/api/auth/logout", {}, { withCredentials: true });
                window.location.href = "/login";
              } catch (e) {
                console.error("Logout failed", e);
              }
            },
          },
        ]}
        // Uncomment if you want a consistent 1cm edge gap on this page too:
        // edgeGapCm={1}
      />

      <div className="max-w-6xl w-full mx-auto px-4 py-6">
        <Typography variant="h5" fontWeight="bold" sx={{ m: 1.5 }}>
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

        {/* ---------- Other sections ---------- */}
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
      </div>

      {/* Allocation Quick View Modal (ONLY for My Allocations) */}
      <AllocationQuickviewModal open={open} setOpen={setOpen} session={session} />
    </div>
  );
};

export default Page;
