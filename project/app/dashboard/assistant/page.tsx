import React, { ReactNode, useState } from "react";
import { Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
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

interface ButtonProps {
  variant?: "text" | "contained" | "outlined";
  children: ReactNode;
  className?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  size?: "small" | "medium";
  onClick?: () => void;
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
          <h1 className="text-3xl font-bold text-gray-900">
            Teaching Operations
          </h1>
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
    </div>
  );
};

export default TeachingOperations;
