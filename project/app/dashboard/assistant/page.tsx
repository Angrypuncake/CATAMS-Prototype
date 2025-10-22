"use client";
import React, { useState } from "react";
import { Button, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SelectField from "./SelectField";
import AllocationsTable from "./AllocationsTable";
import ClaimsTable from "./ClaimsTable";
import RequestsTable from "./RequestsTable";
import MinimalNav from "@/components/MinimalNav";
import axios from "axios";

/** Full-bleed helper */
const FullBleed: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
    {children}
  </div>
);

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
  const [termValue, setTermValue] = useState("S2 2025");
  const [unitValue, setUnitValue] = useState("All");
  const [viewValue, setViewValue] = useState("All");

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
      session: "INFO1110 • 13/09 • 5 pm",
      diff: "+0.5 h",
      submitted: "14/09 09:10",
    },
    {
      tutor: "A. Singh",
      session: "INFO1910 • 12/09 • 3 pm",
      diff: "Paycode",
      submitted: "13/09 18:41",
    },
  ];
  const requestsData: RequestData[] = [
    {
      tutor: "J. Tran",
      session: "INFO1110 • 13/09 • 5 pm",
      type: "Swap",
      submitted: "14/09 09:10",
    },
    {
      tutor: "A. Singh",
      session: "INFO1910 • 12/09 • 3 pm",
      type: "Correction",
      submitted: "13/09 18:41",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <FullBleed>
        <MinimalNav
          actions={[
            { label: "HELP", href: "/help" },
            {
              label: "Logout",
              onClick: async () => {
                try {
                  await axios.post(
                    "/api/auth/logout",
                    {},
                    { withCredentials: true },
                  );
                  window.location.href = "/login";
                } catch (e) {
                  console.error("Logout failed", e);
                }
              },
            },
          ]}
          rightTitle="CATAMS"
          edgeGapCm={0}
          logoSrc="/usyd_logo_white.png"
          showOrangeAccent
        />
      </FullBleed>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="bg-white border px-5 sm:px-6 py-5 rounded-xl shadow-sm mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Typography
                variant="h4"
                component="h1"
                fontWeight={800}
                sx={{ lineHeight: 1.15, letterSpacing: "-0.01em" }}
                className="break-words [text-wrap:balance]"
              >
                Teaching Operations
              </Typography>

              <div className="hidden md:block">
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon className="w-4 h-4" />}
                  sx={{
                    textTransform: "none",
                    bgcolor: "#000",
                    color: "#fff",
                    "&:hover": { bgcolor: "#111" },
                  }}
                >
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:gap-4">
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

              <div className="relative flex-1 min-w-[220px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tutors / requests / units"
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-black"
                />
              </div>

              <div className="md:hidden w-full sm:w-auto">
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                  sx={{
                    textTransform: "none",
                    bgcolor: "#000",
                    color: "#fff",
                    "&:hover": { bgcolor: "#111" },
                  }}
                >
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main grid */}
        <main className="grid grid-cols-12 gap-6 py-6">
          {/* LEFT: allocations + attention */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <section className="bg-white rounded-xl shadow-sm border">
              <div className="flex flex-wrap justify-between items-center gap-3 p-4 sm:p-5 border-b">
                <Typography variant="h5" component="h2" fontWeight={700}>
                  Allocations Overview
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    bgcolor: "#000",
                    color: "#fff",
                    "&:hover": { bgcolor: "#111" },
                  }}
                >
                  Manage Allocations
                </Button>
              </div>
              <div className="overflow-x-auto rounded-b-xl">
                <AllocationsTable data={allocationsData} />
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border">
              <div className="flex flex-wrap justify-between items-center gap-3 p-4 sm:p-5 border-b">
                <Typography variant="h5" component="h2" fontWeight={700}>
                  Needs Attention
                </Typography>
                <Button
                  variant="text"
                  endIcon={<ChevronRightIcon className="w-4 h-4" />}
                >
                  Open Unit Board
                </Button>
              </div>

              <div className="p-4 sm:p-5 space-y-3">
                {/* claim alert */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Claim
                    </span>
                    <span className="font-medium">
                      INFO1110 • 13/09 5 pm — 2 h → 2.5 h
                    </span>
                    <span className="text-sm text-gray-600">
                      Tutor: J. Tran
                    </span>
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Button variant="text" size="small">
                      Review
                    </Button>
                    <Button variant="text" size="small">
                      Open session
                    </Button>
                  </div>
                </div>

                {/* request alert */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Request
                    </span>
                    <span className="font-medium">
                      Swap — Tutor A ⇄ Tutor B (INFO1910)
                    </span>
                    <span className="text-sm text-gray-600">Pending 48 h</span>
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Button variant="text" size="small">
                      Review
                    </Button>
                    <Button variant="text" size="small">
                      Contact
                    </Button>
                  </div>
                </div>

                {/* unassigned alert */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Unassigned
                    </span>
                    <span className="font-medium">
                      INFO3333 • 16/09 10 am — No tutor
                    </span>
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        textTransform: "none",
                        bgcolor: "#000",
                        color: "#fff",
                        "&:hover": { bgcolor: "#111" },
                      }}
                    >
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

          {/* RIGHT: claims + requests */}
          <aside className="col-span-12 lg:col-span-5 space-y-6">
            <section className="bg-white rounded-xl shadow-sm border">
              <div className="flex flex-wrap justify-between items-center gap-3 p-4 sm:p-5 border-b">
                <Typography variant="h5" component="h2" fontWeight={700}>
                  Claims Pending
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    bgcolor: "#000",
                    color: "#fff",
                    "&:hover": { bgcolor: "#111" },
                  }}
                >
                  View all claims
                </Button>
              </div>
              <div className="overflow-x-auto rounded-b-xl">
                <ClaimsTable data={claimsData} />
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border">
              <div className="flex flex-wrap justify-between items-center gap-3 p-4 sm:p-5 border-b">
                <Typography variant="h5" component="h2" fontWeight={700}>
                  Requests Pending
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    bgcolor: "#000",
                    color: "#fff",
                    "&:hover": { bgcolor: "#111" },
                  }}
                >
                  View all requests
                </Button>
              </div>
              <div className="overflow-x-auto rounded-b-xl">
                <RequestsTable data={requestsData} />
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default TeachingOperations;
