"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import MinimalNav from "@/components/MinimalNav";
import StyledBox from "./components";
import {
  getTutorAllocations,
  getCurrentUser,
} from "@/app/services/allocationService";
import AllocationQuickviewModal from "./AllocationQuickviewModal";
import type { AllocationRow, ActionRequiredRow, NoticeRow } from "./types";
import { mapToRequestRow, hoursBetween, niceTime } from "./utils";
import { actions, notices } from "./mockData";
import { getTutorRequests } from "@/app/services/requestService";
import { RequestRow } from "@/app/_types/request";
import DynamicTable, {
  TableRowData,
} from "@/components/DynamicTable/DynamicTable";

/* Shared styling */
const cardSx = {
  p: { xs: 2, md: 2.5 },
  borderRadius: 3,
  border: "1px solid #000",
  boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
  bgcolor: "#fff",
};

const Page = () => {
  const [tutorSessions, setTutorSessions] = useState<AllocationRow[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tutorRequests, setTutorRequests] = useState<RequestRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // modal
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<AllocationRow | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionUser = await getCurrentUser();

        const allocationsData = await getTutorAllocations(
          sessionUser.userId,
          page + 1,
          rowsPerPage,
          searchTerm,
          sortColumn,
          sortDirection,
        );
        setTutorSessions(allocationsData.data);
        setTotalSessions(allocationsData.total);

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
  }, [page, rowsPerPage, searchTerm, sortColumn, sortDirection]);

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setPage(0);
  };

  const handleSortChange = (column: string, direction: "asc" | "desc") => {
    setSortColumn(column);
    setSortDirection(direction);
    setPage(0);
  };

  const hours = 20;
  const sessions = 10;
  const requests = 2;

  return (
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh" }}>
      {/* Nav */}
      <MinimalNav
        actions={[{ label: "HELP", href: "/help" }]}
        rightTitle="CATAMS"
        edgeGapCm={0}
        logoSrc="/usyd_logo_white.png"
        showOrangeAccent
      />

      <Box
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
        {/* Header */}
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
          Tutor Dashboard
        </Typography>

        {/* Stats Summary */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
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
        </Stack>

        {/* My Allocations */}
        <Paper sx={{ ...cardSx, mb: 3 }}>
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
            enableServerSidePagination
            onPaginationChange={(newPage, newRowsPerPage) => {
              setPage(newPage);
              setRowsPerPage(newRowsPerPage);
            }}
            totalCount={totalSessions}
            defaultRowsPerPage={5}
            rowsPerPageOptions={[5, 10, 25]}
            enableSearch
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            enableExport
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
        </Paper>

        {/* Action Required */}
        <Paper sx={{ ...cardSx, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Action Required
          </Typography>
          <DynamicTable<ActionRequiredRow>
            rows={actions as TableRowData<ActionRequiredRow>[]}
            columns={[
              { key: "session_date", label: "Date" },
              { key: "time", label: "Time" },
              { key: "unit", label: "Unit" },
              { key: "hours", label: "Hours" },
              { key: "desc", label: "Description" },
              { key: "status", label: "Status" },
              { key: "actions", label: "Actions" },
            ]}
            columnRenderers={{
              actions: (value) => (
                <Box display="flex" justifyContent="center">
                  <Button variant="contained" size="small">
                    {value}
                  </Button>
                </Box>
              ),
            }}
            defaultRowsPerPage={5}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>

        {/* Requests */}
        <Paper sx={{ ...cardSx, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            My Requests
          </Typography>
          <DynamicTable<RequestRow>
            rows={tutorRequests as TableRowData<RequestRow>[]}
            columns={[
              { key: "type", label: "Type" },
              { key: "relatedSession", label: "Session" },
              { key: "status", label: "Status" },
              { key: "createdAt", label: "Requested On" },
              { key: "actions", label: "Actions" },
            ]}
            columnRenderers={{
              createdAt: (value) => (
                <span>{value ? String(value).slice(0, 10) : "N/A"}</span>
              ),
              actions: (value) => (
                <Box display="flex" justifyContent="center">
                  <Button variant="contained" size="small">
                    {value}
                  </Button>
                </Box>
              ),
            }}
            defaultRowsPerPage={5}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>

        {/* Notices */}
        <Paper sx={{ ...cardSx }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Notices
          </Typography>
          <DynamicTable<NoticeRow>
            rows={notices as TableRowData<NoticeRow>[]}
            columns={[
              { key: "session_date", label: "Date" },
              { key: "type", label: "Type" },
              { key: "message", label: "Message" },
              { key: "actions", label: "Actions" },
            ]}
            columnRenderers={{
              actions: (value) => (
                <Box display="flex" justifyContent="center">
                  <Button variant="contained" size="small">
                    {value}
                  </Button>
                </Box>
              ),
            }}
            defaultRowsPerPage={5}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>

        {/* Modal */}
        <AllocationQuickviewModal
          open={open}
          setOpen={setOpen}
          session={session}
        />
      </Box>
    </Box>
  );
};

export default Page;
