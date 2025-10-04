"use client";
import React, { useEffect, useState, useMemo } from "react";
import StyledBox from "./components";
import Button from "@mui/material/Button";
import { TablePagination } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import axios from "axios";
import AllocationQuickviewModal from "./AllocationQuickviewModal";
import type {
  AllocationRow,
  ActionRequiredRow,
  RequestRow,
  NoticeRow,
  SortableColumns,
} from "./types";
import {
  useColumnSorter,
  exportJSON,
  exportCSV,
  hoursBetween,
  niceTime,
} from "./utils";
import { actions, request, notices } from "./mockData";

/* ========= Page ========= */
const Page = () => {
  const [tutorSessions, setTutorSessions] = useState<AllocationRow[]>([]);
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

  const sortedSessions: AllocationRow[] = useColumnSorter<AllocationRow>(
    tutorSessions,
    sortAllocationsConfig,
  );
  // filter
  const filteredSessions = useMemo(() => {
    if (!search) return sortedSessions;
    return sortedSessions.filter((row) =>
      Object.values(row).some((v) =>
        String(v).toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [sortedSessions, search]);

  // pagination
  const paginatedSessions = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSessions.slice(start, start + rowsPerPage);
  }, [filteredSessions, page, rowsPerPage]);

  const sortedActions: ActionRequiredRow[] = useColumnSorter<ActionRequiredRow>(
    actions,
    sortActionsConfig,
  );
  const sortedRequests: RequestRow[] = useColumnSorter<RequestRow>(
    request,
    sortRequestsConfig,
  );
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
        const sessionUser = await axios.get("/api/auth/me", {
          withCredentials: true,
        });

        const res = await fetch(
          `/api/tutor/allocations?userId=${sessionUser.data.userId}&page=${page + 1}&limit=${rowsPerPage}`,
        );
        if (!res.ok) throw new Error("Failed to fetch tutor allocations");
        const data = await res.json();
        setTutorSessions(data.data);
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
      <p className="m-5 font-bold text-xl">Tutor Dashboard</p>

      <div className="flex w-full gap-5">
        <StyledBox accentColor="border-l-blue-500">
          <p>Allocated Hours</p>
          <p className="font-bold">{hours}</p>
        </StyledBox>
        <StyledBox accentColor="border-l-blue-500">
          <p>Upcoming Sessions</p>
          <p className="font-bold">{sessions}</p>
        </StyledBox>
        <StyledBox accentColor="border-l-blue-500">
          <p>Pending Requests</p>
          <p className="font-bold">{requests}</p>
        </StyledBox>
      </div>

      {/* ---------- My Allocations (ONLY this table opens a modal) ---------- */}
      <StyledBox>
        <p className="font-bold text-xl mb-2">My Allocations</p>

        {/* search box */}
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="border rounded px-2 py-1 mb-2 w-1/3"
        />

        <TableContainer component={Paper} className="shadow-sm">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  className="font-bold text-center cursor-pointer"
                  onClick={() => handleSortAllocations("session_date")}
                >
                  Date{" "}
                  {sortAllocationsConfig?.column === "session_date"
                    ? sortAllocationsConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </TableCell>
                <TableCell
                  className="font-bold text-center cursor-pointer"
                  onClick={() => handleSortAllocations("start_at")}
                >
                  Time{" "}
                  {sortAllocationsConfig?.column === "start_at"
                    ? sortAllocationsConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </TableCell>
                <TableCell
                  className="font-bold text-center cursor-pointer"
                  onClick={() => handleSortAllocations("unit_code")}
                >
                  Unit{" "}
                  {sortAllocationsConfig?.column === "unit_code"
                    ? sortAllocationsConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </TableCell>

                <TableCell
                  className="font-bold text-center cursor-pointer"
                  onClick={() => handleSortAllocations("location")}
                >
                  Location{" "}
                  {sortAllocationsConfig?.column === "location"
                    ? sortAllocationsConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </TableCell>
                <TableCell className="font-bold text-center">Hours</TableCell>
                <TableCell
                  className="font-bold text-center cursor-pointer"
                  onClick={() => handleSortAllocations("status")}
                >
                  Status{" "}
                  {sortAllocationsConfig?.column === "status"
                    ? sortAllocationsConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </TableCell>
                <TableCell className="font-bold text-center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSessions.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {row.session_date ? row.session_date.slice(0, 10) : "N/A"}
                  </TableCell>
                  <TableCell>
                    {row.start_at
                      ? `${niceTime(row.start_at)}-${niceTime(row.end_at)}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{row.unit_code ?? "N/A"}</TableCell>
                  <TableCell>{row.location ?? "N/A"}</TableCell>
                  <TableCell>
                    {hoursBetween(row.start_at, row.end_at)}
                  </TableCell>
                  <TableCell>{row.status ?? "N/A"}</TableCell>
                  <TableCell>
                    <Box display="flex" justifyContent="center">
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          borderRadius: "9999px",
                          textTransform: "none",
                          fontWeight: 500,
                          fontSize: "0.85rem",
                          px: 2.5,
                          py: 0.5,
                          minHeight: "30px",
                          background:
                            "linear-gradient(to right, #3b82f6, #6414c7)",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            background:
                              "linear-gradient(to right, #2563eb, #490d91)",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                          },
                          "&:active": { transform: "scale(0.98)" },
                        }}
                        size="small"
                        onClick={() => {
                          setSession(row);
                          setOpen(true);
                        }}
                      >
                        {row.actions ?? "View"}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredSessions.length}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
        <div className="justify-end items-center flex gap-5 mt-5">
          <p>You can export the above data in CSV or JSON formats</p>
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: "9999px",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.85rem",
              px: 2.5,
              py: 0.5,
              minHeight: "30px",
              background: "linear-gradient(to right, #3b82f6, #6414c7)",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                background: "linear-gradient(to right, #2563eb, #490d91)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
              },
              "&:active": { transform: "scale(0.98)" },
            }}
            size="medium"
            onClick={() =>
              exportCSV(
                tutorSessions as unknown as Record<string, string | number>[],
              )
            }
          >
            Export as CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: "9999px",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.85rem",
              px: 2.5,
              py: 0.5,
              minHeight: "30px",
              background: "linear-gradient(to right, #3b82f6, #6414c7)",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                background: "linear-gradient(to right, #2563eb, #490d91)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
              },
              "&:active": { transform: "scale(0.98)" },
            }}
            size="medium"
            onClick={() =>
              exportJSON(
                tutorSessions as unknown as Record<string, string | number>[],
              )
            }
          >
            Export as JSON
          </Button>
        </div>
      </StyledBox>

      {/* ---------- Other sections (unchanged, no modals) ---------- */}
      <StyledBox>
        <p className="font-bold text-xl mb-2">Action Required</p>
        <TableContainer component={Paper} className="shadow-sm">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  className="font-bold text-center cursor-pointer"
                  onClick={() => handleSortActions("session_date")}
                >
                  Date{" "}
                  {sortActionsConfig?.column === "session_date"
                    ? sortActionsConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </TableCell>
                <TableCell className="font-bold text-center">Time</TableCell>
                <TableCell className="font-bold text-center">Unit</TableCell>
                <TableCell className="font-bold text-center">Hours</TableCell>
                <TableCell className="font-bold text-center">
                  Description
                </TableCell>
                <TableCell
                  className="font-bold text-center cursor-pointer"
                  onClick={() => handleSortActions("status")}
                >
                  Status{" "}
                  {sortActionsConfig?.column === "status"
                    ? sortActionsConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </TableCell>
                <TableCell className="font-bold text-center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedActions.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.session_date}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>{row.hours}</TableCell>
                  <TableCell>{row.desc}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell className="text-left">
                    <Box display="flex" justifyContent="center">
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          borderRadius: "9999px", // pill shape
                          textTransform: "none", // don't uppercase text
                          fontWeight: 500, // semi-bold
                          fontSize: "0.85rem", // readable but compact
                          px: 2.5,
                          py: 0.5,
                          minHeight: "30px",
                          background:
                            "linear-gradient(to right, #3b82f6, #6414c7)", // gradient blue
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // soft shadow
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            background:
                              "linear-gradient(to right, #2563eb, #490d91)",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                          },
                          "&:active": {
                            transform: "scale(0.98)",
                          },
                        }}
                      >
                        {row.actions}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledBox>

      <StyledBox>
        <p className="font-bold text-xl mb-2">My Requests</p>
        <TableContainer component={Paper} className="shadow-sm">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="font-bold text-center">
                  Request ID
                </TableCell>
                <TableCell className="font-bold text-center">Type</TableCell>
                <TableCell className="font-bold text-center">
                  Related Session
                </TableCell>
                <TableCell
                  className="font-bold text-center cursor-pointer"
                  onClick={() => handleSortRequests("status")}
                >
                  Status{" "}
                  {sortRequestsConfig?.column === "status"
                    ? sortRequestsConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </TableCell>
                <TableCell className="font-bold text-center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRequests.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.requestID}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.relatedSession}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell className="text-left">
                    <Box display="flex" justifyContent="center">
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          borderRadius: "9999px", // pill shape
                          textTransform: "none", // don't uppercase text
                          fontWeight: 500, // semi-bold
                          fontSize: "0.85rem", // readable but compact
                          px: 2.5,
                          py: 0.5,
                          minHeight: "30px",
                          background:
                            "linear-gradient(to right, #3b82f6, #6414c7)", // gradient blue
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // soft shadow
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            background:
                              "linear-gradient(to right, #2563eb, #490d91)",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                          },
                          "&:active": {
                            transform: "scale(0.98)",
                          },
                        }}
                      >
                        {row.actions}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledBox>

      <StyledBox>
        <p className="font-bold text-xl mb-2">Notices</p>
        <TableContainer component={Paper} className="shadow-sm">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  className="font-bold text-center cursor-pointer"
                  onClick={() => handleSortNotices("session_date")}
                >
                  Date{" "}
                  {sortNoticesConfig?.column === "session_date"
                    ? sortNoticesConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </TableCell>
                <TableCell className="font-bold text-center">Type</TableCell>
                <TableCell className="font-bold text-center">Message</TableCell>
                <TableCell className="font-bold text-center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedNotices.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.session_date}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.message}</TableCell>
                  <TableCell className="text-left">
                    <Box display="flex" justifyContent="center">
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          borderRadius: "9999px", // pill shape
                          textTransform: "none", // don't uppercase text
                          fontWeight: 500, // semi-bold
                          fontSize: "0.85rem", // readable but compact
                          px: 2.5,
                          py: 0.5,
                          minHeight: "30px",
                          background:
                            "linear-gradient(to right, #3b82f6, #6414c7)", // gradient blue
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // soft shadow
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            background:
                              "linear-gradient(to right, #2563eb, #490d91)",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                          },
                          "&:active": {
                            transform: "scale(0.98)",
                          },
                        }}
                      >
                        {row.actions}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
