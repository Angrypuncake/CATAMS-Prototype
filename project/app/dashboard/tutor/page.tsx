"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import StyledBox from "./components";
import Button from "@mui/material/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Chip,
  Box,
  Divider,
} from "@mui/material";

/* ========= Export helpers (unchanged) ========= */
const exportJSON = (
  data: Record<string, string | number>[],
  filename = "tutor_allocations.json",
) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

const CSVRowFormatter = (dataRow: string | number) => {
  let v = String(dataRow);
  if (v.includes(",")) {
    if (v[0] !== '"') v = '"' + v;
    if (v[v.length - 1] !== '"') v += '"';
  }
  return v;
};

const exportCSV = (
  data: Record<string, string | number>[],
  filename = "tutor_allocations.csv",
) => {
  if (!data?.length) return;
  const keys = Object.keys(data[0]);
  let csvString = keys.join(",") + "\n";
  for (const row of data) {
    csvString +=
      keys.map((k) => CSVRowFormatter(row[k] ?? "")).join(",") + "\n";
  }

  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

/* ========= Types ========= */
type TutorSession = {
  id: string;
  session_date: string | null; // ISO date-time string
  start_at: string | null; // "HH:MM:SS"
  end_at?: string | null; // "HH:MM:SS"
  unit_code: string | null;
  location?: string | null;
  status?: string | null; // "Confirmed" | "Pending" | "Rejected" | "Reschedule" | etc.
  actions?: string | null; // UI label for the table button
  note?: string | null;
};

/* ========= Helpers ========= */
function hoursBetween(start?: string | null, end?: string | null) {
  if (!start || !end) return 0;
  const [sh, sm, ss] = start.split(":").map(Number);
  const [eh, em, es] = end.split(":").map(Number);
  const a = new Date(0, 0, 0, sh || 0, sm || 0, ss || 0);
  const b = new Date(0, 0, 0, eh || 0, em || 0, es || 0);
  let diff = (b.getTime() - a.getTime()) / (1000 * 60 * 60);
  if (diff < 0) diff += 24;
  return Number(diff.toFixed(2));
}

function toDate(dateStr?: string | null, time?: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  if (time) {
    const [h, m, s] = time.split(":").map(Number);
    // Treat incoming ISO as UTC so comparisons are stable
    d.setUTCHours(h || 0, m || 0, s || 0, 0);
  }
  return d;
}

function niceTime(hms?: string | null) {
  if (!hms) return "—";
  return hms.slice(0, 5); // HH:MM
}

/* ========= Page ========= */
const Page = () => {
  const [tutorSessions, setTutorSessions] = useState<TutorSession[]>([]);
  const [loading, setLoading] = useState(true);

  // modal (ONLY for "My Allocations")
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<TutorSession | null>(null);

  useEffect(() => {
    const fetchTutorSessions = async () => {
      try {
        const res = await fetch(
          "/api/tutor/allocations?userId=6&page=1&limit=10",
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
  }, []);

  // derived values for modal button logic
  const statusLower = (session?.status || "").toLowerCase();
  const isConfirmed = statusLower === "confirmed";
  const isPending = statusLower === "pending";
  const isRejected = statusLower === "rejected" || statusLower === "reschedule";

  const endOrStart = toDate(
    session?.session_date ?? null,
    session?.end_at || session?.start_at || null,
  );
  const hasEnded = endOrStart ? endOrStart.getTime() <= Date.now() : false;

  const claimDisabledReason = !hasEnded
    ? `You can submit a claim after this session ends (${niceTime(session?.end_at || session?.start_at)})`
    : "";

  const hours = 20;
  const sessions = 10;
  const requests = 2;

  // mock sections below remain unchanged
  const actions = [
    {
      date: "2025-09-09",
      time: "10:00 AM - 12:00 PM",
      unit: "MATH201",
      hours: 2,
      desc: "Calculus II tutorial",
      status: "Available",
      actions: "Claim",
    },
    {
      date: "2025-09-10",
      time: "1:00 PM - 3:00 PM",
      unit: "CS102",
      hours: 2,
      desc: "Intro to Programming lab",
      status: "Pending Request",
      actions: "View/Edit Request",
    },
    {
      date: "2025-09-11",
      time: "9:00 AM - 11:00 AM",
      unit: "CHEM110",
      hours: 2,
      desc: "Organic Chemistry tutorial",
      status: "Available",
      actions: "Claim",
    },
    {
      date: "2025-09-12",
      time: "3:00 PM - 5:00 PM",
      unit: "PHYS150",
      hours: 2,
      desc: "Classical Mechanics session",
      status: "Pending Request",
      actions: "View/Edit Request",
    },
    {
      date: "2025-09-13",
      time: "11:00 AM - 1:00 PM",
      unit: "PSYC101",
      hours: 2,
      desc: "Introduction to Psychology tutorial",
      status: "Available",
      actions: "Claim",
    },
  ];

  const request = [
    {
      requestID: "REQ001",
      type: "Swap",
      relatedSession: "CS101 - 2025-09-10 2:00 PM",
      status: "Pending",
      actions: "View/Edit Request",
    },
    {
      requestID: "REQ002",
      type: "Correction",
      relatedSession: "MATH202 - 2025-09-12 9:00 AM",
      status: "Approved",
      actions: "View/Edit Request",
    },
    {
      requestID: "REQ003",
      type: "Swap",
      relatedSession: "BIO105 - 2025-09-14 1:00 PM",
      status: "Pending",
      actions: "View/Edit Request",
    },
    {
      requestID: "REQ004",
      type: "Correction",
      relatedSession: "CHEM101 - 2025-09-09 11:00 AM",
      status: "Approved",
      actions: "View/Edit Request",
    },
    {
      requestID: "REQ005",
      type: "Swap",
      relatedSession: "PHYS110 - 2025-09-13 10:00 AM",
      status: "Pending",
      actions: "View/Edit Request",
    },
  ];

  const claimed = [
    {
      date: "2025-09-09",
      time: "10:00 AM - 12:00 PM",
      unit: "MATH201",
      hours: 2,
      desc: "Calculus II tutorial",
      status: "Available",
      actions: "View Claim",
    },
    {
      date: "2025-09-10",
      time: "1:00 PM - 3:00 PM",
      unit: "CS102",
      hours: 2,
      desc: "Intro to Programming lab",
      status: "Pending Request",
      actions: "View Claim",
    },
  ];

  const notices = [
    {
      date: "2025-09-09",
      type: "Reject",
      message: "TA Rejected REQ008",
      actions: "View/Edit Request",
    },
    {
      date: "2025-09-09",
      type: "Approve",
      message: "UC Approved REQ009",
      actions: "View/Edit Request",
    },
  ];

  return (
    <div className="w-screen h-screen box-border bg-gray-100 px-5 flex flex-col items-start justify-start">
      <p className="m-5 font-bold text-xl">Tutor Dashboard</p>

      <div className="flex w-full gap-5">
        <StyledBox>
          <p>Allocated Hours</p>
          <p className="font-bold">{hours}</p>
        </StyledBox>
        <StyledBox>
          <p>Upcoming Sessions</p>
          <p className="font-bold">{sessions}</p>
        </StyledBox>
        <StyledBox>
          <p>Pending Requests</p>
          <p className="font-bold">{requests}</p>
        </StyledBox>
      </div>

      {/* ---------- My Allocations (ONLY this table opens a modal) ---------- */}
      <StyledBox>
        <p className="font-bold text-xl mb-2">My Allocations</p>
        <TableContainer component={Paper} className="shadow-sm">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="font-bold text-center">Date</TableCell>
                <TableCell className="font-bold text-center">Time</TableCell>
                <TableCell className="font-bold text-center">Unit</TableCell>
                <TableCell className="font-bold text-center">
                  Location
                </TableCell>
                <TableCell className="font-bold text-center">Hours</TableCell>
                <TableCell className="font-bold text-center">Status</TableCell>
                <TableCell className="font-bold text-center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tutorSessions.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {row.session_date ? row.session_date.slice(0, 10) : "N/A"}
                  </TableCell>
                  <TableCell>
                    {row.start_at
                      ? `${niceTime(row.start_at)}–${niceTime(row.end_at)}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{row.unit_code ?? "N/A"}</TableCell>
                  <TableCell>{row.location ?? "N/A"}</TableCell>
                  <TableCell>
                    {hoursBetween(row.start_at, row.end_at)}
                  </TableCell>
                  <TableCell>{row.status ?? "N/A"}</TableCell>
                  <TableCell className="text-left">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        setSession(row);
                        setOpen(true);
                      }}
                    >
                      {row.actions ?? "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="justify-end items-center flex gap-5 mt-5">
          <p>You can export the above data in CSV or JSON formats</p>
          <Button
            variant="contained"
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
                <TableCell className="font-bold text-center">Date</TableCell>
                <TableCell className="font-bold text-center">Time</TableCell>
                <TableCell className="font-bold text-center">Unit</TableCell>
                <TableCell className="font-bold text-center">Hours</TableCell>
                <TableCell className="font-bold text-center">
                  Description
                </TableCell>
                <TableCell className="font-bold text-center">Status</TableCell>
                <TableCell className="font-bold text-center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {actions.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>{row.hours}</TableCell>
                  <TableCell>{row.desc}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell className="text-left">
                    <Button variant="contained" size="small">
                      {row.actions}
                    </Button>
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
                <TableCell className="font-bold text-center">Status</TableCell>
                <TableCell className="font-bold text-center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {request.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.requestID}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.relatedSession}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell className="text-left">
                    <Button variant="contained" size="small">
                      {row.actions}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledBox>

      <StyledBox>
        <p className="font-bold text-xl mb-2">Claimed Sessions</p>
        <TableContainer component={Paper} className="shadow-sm">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="font-bold text-center">Date</TableCell>
                <TableCell className="font-bold text-center">Time</TableCell>
                <TableCell className="font-bold text-center">Unit</TableCell>
                <TableCell className="font-bold text-center">Hours</TableCell>
                <TableCell className="font-bold text-center">
                  Description
                </TableCell>
                <TableCell className="font-bold text-center">Status</TableCell>
                <TableCell className="font-bold text-center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {claimed.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>{row.hours}</TableCell>
                  <TableCell>{row.desc}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell className="text-left">
                    <Button variant="contained" size="small">
                      {row.actions}
                    </Button>
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
                <TableCell className="font-bold text-center">Date</TableCell>
                <TableCell className="font-bold text-center">Type</TableCell>
                <TableCell className="font-bold text-center">Message</TableCell>
                <TableCell className="font-bold text-center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notices.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.message}</TableCell>
                  <TableCell className="text-left">
                    <Button variant="contained" size="small">
                      {row.actions}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledBox>

      {/* ---------- Allocation Quick View Modal (ONLY for My Allocations) ---------- */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Allocation quick view</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Typography variant="subtitle2" component="span">
                Status:
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                color={
                  isConfirmed ? "success" : isPending ? "warning" : "default"
                }
                label={session?.status ?? "Unknown"}
              />
            </Stack>

            <Divider />

            <Stack direction="row" spacing={1.25}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 120 }}
              >
                Date
              </Typography>
              <Box>{session?.session_date?.slice(0, 10) ?? "—"}</Box>
            </Stack>

            <Stack direction="row" spacing={1.25}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 120 }}
              >
                Time
              </Typography>
              <Box>
                {session?.start_at
                  ? `${niceTime(session?.start_at)} – ${niceTime(session?.end_at)}`
                  : "—"}
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.25}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 120 }}
              >
                Location
              </Typography>
              <Box>{session?.location ?? "—"}</Box>
            </Stack>

            <Stack direction="row" spacing={1.25}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 120 }}
              >
                Unit
              </Typography>
              <Box>{session?.unit_code ?? "—"}</Box>
            </Stack>

            <Stack direction="row" spacing={1.25}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 120 }}
              >
                Hours
              </Typography>
              <Box>{hoursBetween(session?.start_at, session?.end_at)}</Box>
            </Stack>

            <Stack direction="row" spacing={1.25}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 120 }}
              >
                Description
              </Typography>
              <Box>{session?.note ?? "—"}</Box>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between" }}>
          {/* LEFT side kept empty to match wireframe spacing */}
          <Box />

          {/* RIGHT side buttons per rules */}
          <Stack direction="row" spacing={1}>
            {/* Confirmed → show Submit Claim (disabled until session ends) */}
            {isConfirmed && (
              <Button
                variant="contained"
                disabled={!hasEnded}
                title={
                  !hasEnded
                    ? claimDisabledReason
                    : "Submit your claim for this session"
                }
                onClick={() => setOpen(false)}
              >
                Submit Claim
              </Button>
            )}

            {/* All statuses → Create Request */}
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Create Request
            </Button>

            {/* All statuses → View details */}
            <Button
              variant="outlined"
              component={Link}
              href={`/dashboard/tutor/allocations/${session?.id}`}
            >
              View details
            </Button>

            {/* Close */}
            <Button variant="text" onClick={() => setOpen(false)}>
              Close
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Page;
