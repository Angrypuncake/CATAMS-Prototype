"use client";
import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
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
import { VISIBLE_STATUSES_FOR_TUTOR } from "@/app/_types/allocations";
import axios from "axios";
import MinimalNav from "@/components/MinimalNav";

/* full-bleed wrapper (ensures nav spans the entire viewport width) */
const FullBleed: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">{children}</div>
);

/** Local page theme (scoped) to override any lingering blue styles in nested components */
const localMonoTheme = createTheme({
  palette: {
    background: { default: "#F7F7F7", paper: "#FFFFFF" },
    text: { primary: "#111827", secondary: "#6B7280" },
    divider: "#E5E7EB",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: "none",
        },
        contained: {
          backgroundColor: "#000000",
          color: "#FFFFFF",
          "&:hover": { backgroundColor: "#111111" },
        },
        outlined: {
          color: "#111827",
          borderColor: "#000000",
          borderWidth: 1,
          "&:hover": { backgroundColor: "#F9FAFB", borderColor: "#000000" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 0 },
        notchedOutline: { borderColor: "#E5E7EB" },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#111111",
          },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000",
            borderWidth: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: "#6B7280" },
        outlined: { "&.Mui-focused": { color: "#111827" } },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&.Mui-selected": {
            backgroundColor: "#000000",
            color: "#FFFFFF",
            "&:hover": { backgroundColor: "#111111" },
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { "&:nth-of-type(even)": { backgroundColor: "#FAFAFA" } },
        head: {
          backgroundColor: "#F3F4F6",
          "& .MuiTableCell-root": { color: "#111827", fontWeight: 700 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderRight: "1px solid #E5E7EB",
          borderLeft: "none",
          "&:first-of-type": { borderLeft: "1px solid #E5E7EB" },
          "&:last-child": { borderRight: "1px solid #E5E7EB" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

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
  const [tutorRequests, setTutorRequests] = useState<RequestRow[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);

  /* ---------------- Data fetching ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionUser = await getCurrentUser();

        // Allocations
        const allocationsData = await getTutorAllocations(
          sessionUser.userId,
          page + 1,
          rowsPerPage
        );
        setTutorSessions(allocationsData.data);
        setTotalSessions(allocationsData.total);

        // Requests
        const requestsData = await getTutorRequests(page + 1, rowsPerPage);
        const mappedRequests: RequestRow[] = requestsData.data.map(mapToRequestRow);
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

  const filteredSessions = tutorSessions.filter((s) => {
    const unitCode = String(s.unitCode) ?? "";
    const status = s.status ?? "";
    if (search && !unitCode.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return VISIBLE_STATUSES_FOR_TUTOR.includes(status);
  });

  // sorting
  const sortedSessions: AllocationRow[] = useColumnSorter<AllocationRow>(
    filteredSessions,
    sortAllocationsConfig
  );
  const sortedActions: ActionRequiredRow[] = useColumnSorter<ActionRequiredRow>(
    actions,
    sortActionsConfig
  );
  const sortedRequests: RequestRow[] = tutorRequests;
  const sortedNotices: NoticeRow[] = useColumnSorter<NoticeRow>(
    notices,
    sortNoticesConfig
  );

  // modal
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<AllocationRow | null>(null);

  type SortConfig = {
    column: SortableColumns;
    direction: "asc" | "desc";
  } | null;

  const createSortHandler =
    (setConfig: React.Dispatch<React.SetStateAction<SortConfig>>) =>
    (column: SortableColumns) => {
      setConfig((prev) =>
        prev?.column === column
          ? { column, direction: prev.direction === "asc" ? "desc" : "asc" }
          : { column, direction: "asc" }
      );
    };

  const handleSortAllocations = createSortHandler(setSortAllocationsConfig);
  const handleSortActions = createSortHandler(setSortActionsConfig);
  const handleSortRequests = createSortHandler(setSortRequestsConfig);
  const handleSortNotices = createSortHandler(setSortNoticesConfig);

  const hours = 20;
  const sessions = 10;
  const requests = 2;

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Full-bleed MinimalNav (black strip, white bar, HELP + Logout, heavy CATAMS) */}
      <FullBleed>
        <MinimalNav
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
          rightTitle="CATAMS"
          edgeGapCm={1}
          maxWidthClass="max-w-screen-2xl"
          logoSrc="/usyd_logo_white.png"
          showOrangeAccent
        />
      </FullBleed>

      {/* Scope all subcomponents under the local theme so blue styles are overridden */}
      <ThemeProvider theme={localMonoTheme}>
        <div className="max-w-6xl w-full mx-auto px-4 py-6">
          <Typography variant="h5" fontWeight="bold" sx={{ m: 2.5 }}>
            Tutor Dashboard
          </Typography>

          <div className="flex w-full gap-5">
            <StyledBox accentColor="border-l-black">
              <Typography>Allocated Hours</Typography>
              <Typography fontWeight="bold">{hours}</Typography>
            </StyledBox>
            <StyledBox accentColor="border-l-black">
              <Typography>Upcoming Sessions</Typography>
              <Typography fontWeight="bold">{sessions}</Typography>
            </StyledBox>
            <StyledBox accentColor="border-l-black">
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

        {/* ---------- Allocation Quick View Modal ---------- */}
        <AllocationQuickviewModal open={open} setOpen={setOpen} session={session} />
      </ThemeProvider>
    </div>
  );
};

export default Page;
