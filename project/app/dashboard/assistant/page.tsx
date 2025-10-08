"use client";
import React, { ReactNode, useState } from "react";
import { Button, Typography } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SelectField from "./SelectField";
import Chip from "./Chip";

interface AllocationRow {
  unit: string;
  week: string;
  sessions: number;
  assigned: number;
  unassigned: number;
  hours: number;
  lastChange: string;
  status: "Open" | "Attention";
}

interface ClaimData {
  tutor: string;
  session: string;
  diff: string;
  submitted: string;
}

interface RequestData {
  tutor: string;
  session: string;
  type: "Swap" | "Correction";
  submitted: string;
}

const TeachingOperations: React.FC = () => {
  const [termValue, setTermValue] = useState<string>("S2 2025");
  const [unitValue, setUnitValue] = useState<string>("All");
  const [viewValue, setViewValue] = useState<string>("All");

  const allocationsData: AllocationRow[] = [
    {
      unit: "INFO1110",
      week: "03",
      sessions: 22,
      assigned: 21,
      unassigned: 1,
      hours: 44,
      lastChange: "14/09 09:10",
      status: "Open",
    },
    {
      unit: "INFO1910",
      week: "03",
      sessions: 18,
      assigned: 18,
      unassigned: 0,
      hours: 36,
      lastChange: "13/09 17:22",
      status: "Open",
    },
    {
      unit: "INFO3333",
      week: "03",
      sessions: 20,
      assigned: 18,
      unassigned: 2,
      hours: 40,
      lastChange: "13/09 18:05",
      status: "Attention",
    },
  ];

  const claimsData: ClaimData[] = [
    {
      tutor: "J. Tran",
      session: "INFO1110 • 13/09 • 5pm",
      diff: "+0.5h",
      submitted: "14/09 09:10",
    },
    {
      tutor: "A. Singh",
      session: "INFO1910 • 12/09 • 3pm",
      diff: "Paycode",
      submitted: "13/09 18:41",
    },
  ];

  const requestsData: RequestData[] = [
    {
      tutor: "J. Tran",
      session: "INFO1110 • 13/09 • 5pm",
      type: "Swap",
      submitted: "14/09 09:10",
    },
    {
      tutor: "A. Singh",
      session: "INFO1910 • 12/09 • 3pm",
      type: "Correction",
      submitted: "13/09 18:41",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-[80%]">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            color="text.primary"
          >
            Teaching Operations
          </Typography>
          <div className="flex items-center gap-4">
            <SelectField
              value={termValue}
              label="Term"
              options={["S1 2025", "S2 2025", "S1 2026"]}
              onChange={setTermValue}
            />
            <SelectField
              value={unitValue}
              label="Unit"
              options={["All", "INFO1110", "INFO1910", "INFO3333"]}
              onChange={setUnitValue}
            />
            <SelectField
              value={viewValue}
              label="View"
              options={["All", "Allocations", "Claims", "Requests"]}
              onChange={setViewValue}
            />

            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tutors / requests / units"
                className="pl-10 pr-4 py-2 w-72 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="flex gap-6 p-6">
        <div className="flex-1 space-y-6">
          <section className="bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center p-4 border-b">
              <Typography variant="h5" component="h2" fontWeight="600">
                Allocations Overview
              </Typography>
              <Button variant="text">Manage Allocations</Button>
            </div>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Unit</TableCell>
                    <TableCell>Week</TableCell>
                    <TableCell>Sessions</TableCell>
                    <TableCell>Assigned</TableCell>
                    <TableCell>Unassigned</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Last Change</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allocationsData.map((row: AllocationRow, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell style={{ fontWeight: "bold" }}>
                        {row.unit}
                      </TableCell>
                      <TableCell>{row.week}</TableCell>
                      <TableCell>{row.sessions}</TableCell>
                      <TableCell>{row.assigned}</TableCell>
                      <TableCell>{row.unassigned}</TableCell>
                      <TableCell>{row.hours}</TableCell>
                      <TableCell>{row.lastChange}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={
                            row.status === "Attention" ? "warning" : "success"
                          }
                          variant={
                            row.status === "Attention" ? "filled" : "outlined"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </section>

          <section className="bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center p-4 border-b">
              <Typography variant="h5" component="h2" fontWeight="600">
                Needs Attention
              </Typography>
              <Button
                variant="text"
                endIcon={<ChevronRightIcon className="w-4 h-4" />}
              >
                Open Unit Board
              </Button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Claim
                  </span>
                  <span className="font-medium">
                    INFO1110 • 13/09 5pm — 2h → 2.5h
                  </span>
                  <span className="text-sm text-gray-600">Tutor: J. Tran</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="text" size="small">
                    Review
                  </Button>
                  <Button variant="text" size="small">
                    Open session
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Request
                  </span>
                  <span className="font-medium">
                    Swap — Tutor A ⇄ Tutor B (INFO1910)
                  </span>
                  <span className="text-sm text-gray-600">Pending 48h</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="text" size="small">
                    Review
                  </Button>
                  <Button variant="text" size="small">
                    Contact
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Unassigned
                  </span>
                  <span className="font-medium">
                    INFO3333 • 16/09 10am — No tutor
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button variant="contained" size="small">
                    Fill
                  </Button>
                  <Button variant="text" size="small">
                    View options
                  </Button>
                </div>
              </div>

              <div className="text-right pt-2">
                <Button variant="text">View all items</Button>
              </div>
            </div>
          </section>
        </div>

        <div className="w-96 space-y-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center p-4 border-b">
              <Typography variant="h5" component="h2" fontWeight="600">
                Claims Pending
              </Typography>
              <Button variant="text" className="text-sm">
                View all claims
              </Button>
            </div>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tutor</TableCell>
                    <TableCell>Session</TableCell>
                    <TableCell>Diff</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claimsData.map((claim: ClaimData, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{claim.tutor}</TableCell>
                      <TableCell>{claim.session}</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>
                        {claim.diff}
                      </TableCell>
                      <TableCell>{claim.submitted}</TableCell>
                      <TableCell>
                        <Button variant="text" size="small">
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center p-4 border-b">
              <Typography variant="h5" component="h2" fontWeight="600">
                Requests Pending
              </Typography>
              <Button variant="text" className="text-sm">
                View all requests
              </Button>
            </div>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tutor</TableCell>
                    <TableCell>Session</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requestsData.map((request: RequestData, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{request.tutor}</TableCell>
                      <TableCell>{request.session}</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>
                        {request.type}
                      </TableCell>
                      <TableCell>{request.submitted}</TableCell>
                      <TableCell>
                        <Button variant="text" size="small">
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachingOperations;
