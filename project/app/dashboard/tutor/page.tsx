"use client";

import React from "react";
import StyledBox from "./components";
import Button from "@mui/material/Button";
import Link from "next/link";
import { Typography } from "@mui/material";
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
} from "@mui/material";

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
  // Need to fix this to accommodate for unclosed quotations
  dataRow = String(dataRow);
  if (dataRow.includes(",")) {
    if (dataRow[0] != '"') {
      dataRow = '"' + dataRow;
    }
    if (dataRow[dataRow.length - 1] != '"') {
      dataRow += '"';
    }
  }
  return dataRow;
};

const exportCSV = (
  data: Record<string, string | number>[],
  filename = "tutor_allocations.csv",
) => {
  let csvString = "";
  const keys = Object.keys(data[0]);

  for (let i = 0; i < keys.length; i++) {
    if (i == keys.length - 1) {
      csvString += keys[i] + "\n";
      continue;
    }
    csvString += keys[i] + ",";
  }

  for (let i = 0; i < data.length; i++) {
    for (let k = 0; k < keys.length; k++) {
      const dataRow = CSVRowFormatter(data[i][keys[k]]);

      if (k == keys.length - 1) {
        csvString += dataRow + "\n";
        continue;
      }
      csvString += dataRow + ",";
    }
  }

  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

const page = () => {
  const tutorSessions = [
    {
      date: "2025-09-01",
      time: "10:00 AM - 12:00 PM",
      unit: "MATH101",
      location: "Room A1",
      hours: 2,
      status: "Confirmed",
      actions: "View",
    },
    {
      date: "2025-09-03",
      time: "2:00 PM - 4:00 PM",
      unit: "PHYS202",
      location: "Lab 3",
      hours: 2,
      status: "Pending",
      actions: "Edit",
    },
    {
      date: "2025-09-05",
      time: "9:00 AM - 11:00 AM",
      unit: "CS105",
      location: "Building B, Room 201",
      hours: 2,
      status: "Rejected",
      actions: "Reschedule",
    },
    {
      date: "2025-09-07",
      time: "1:00 PM - 3:00 PM",
      unit: "BIO110",
      location: "Room C2",
      hours: 2,
      status: "Confirmed",
      actions: "View",
    },
    {
      date: "2025-09-10",
      time: "11:00 AM - 1:00 PM",
      unit: "CHEM150",
      location: "Room D4",
      hours: 2,
      status: "Pending",
      actions: "Edit",
    },
  ];
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

  const hours = 13;
  const sessions = 6;
  const requests = 2;

  // --- Modal state for "My Allocations" row popup ---
  const [allocDialogOpen, setAllocDialogOpen] = React.useState(false);
  const [selectedAlloc, setSelectedAlloc] = React.useState<any>(null);

  const openAllocModal = (row: any) => {
    setSelectedAlloc(row);
    setAllocDialogOpen(true);
  };
  const closeAllocModal = () => setAllocDialogOpen(false);

  const canSubmitClaim = (row: any) => {
    if (!row || row.status !== "Confirmed") return false;
    try {
      // time format: "10:00 AM - 12:00 PM"
      const endStr = String(row.time).split("-")[1]?.trim() || "";
      const end = new Date(`${row.date} ${endStr}`);
      return Date.now() > end.getTime();
    } catch {
      return false;
    }
  };

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
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{row.hours}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell className="text-left">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => openAllocModal(row)}
                    >
                      {row.actions}
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
            onClick={() => exportCSV(tutorSessions)}
          >
            Export as CSV
          </Button>
          <Button
            variant="contained"
            size="medium"
            onClick={() => exportJSON(tutorSessions)}
          >
            Export as JSON
          </Button>
        </div>
      </StyledBox>

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

      {/* Allocation popup modal */}
      <Dialog open={allocDialogOpen} onClose={closeAllocModal} maxWidth="sm" fullWidth>
        <DialogTitle>Allocation</DialogTitle>
        <DialogContent dividers>
          {selectedAlloc && (
            <div className="space-y-1">
              <Typography><b>Unit:</b> {selectedAlloc.unit}</Typography>
              <Typography><b>Status:</b> {selectedAlloc.status}</Typography>
              <Typography><b>Date:</b> {selectedAlloc.date}</Typography>
              <Typography><b>Time:</b> {selectedAlloc.time}</Typography>
              <Typography><b>Location:</b> {selectedAlloc.location}</Typography>
              <Typography><b>Hours:</b> {selectedAlloc.hours}</Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button>View Details</Button>
          <Button variant="outlined">Make Request</Button>
          {selectedAlloc?.status === "Confirmed" && (
            <Button
              variant="contained"
              disabled={!canSubmitClaim(selectedAlloc)}
            >
              Submit Claim
            </Button>
          )}
          <Button onClick={closeAllocModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default page;
