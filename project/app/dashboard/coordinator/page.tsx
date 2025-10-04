"use client";
import React, { useEffect, useState, useMemo } from "react";
import Button from "@mui/material/Button";
import { Slider, Typography, Menu, MenuItem, Tab } from "@mui/material"; //unused import, delete
import { UnitBudgetRow, CoordinatorBudgetOverview } from "./types";
import Link from "next/link";
import UnitBudgetOverviewTable from "./UnitBudgetOverviewTable";
import CoordinatorApprovalTable from "./CoordinatorApprovalTable";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const pendingRequests = [
  {
    requestID: "REQ001",
    type: "Swap",
    relatedSession: "CS101 - 2025-09-10 2:00 PM",
    status: "Pending",
    creator: "John Doe",
    creatorRole: "Tutor",
    user_id: 123,
  },
  {
    requestID: "REQ003",
    type: "Swap",
    relatedSession: "BIO105 - 2025-09-14 1:00 PM",
    status: "Pending",
    creator: "Jane Smith",
    creatorRole: "TA",
    user_id: 456,
  },
  {
    requestID: "REQ005",
    type: "Swap",
    relatedSession: "PHYS110 - 2025-09-13 10:00 AM",
    status: "Pending",
    creator: "Alice Johnson",
    creatorRole: "Tutor",
    user_id: 789,
  },
];

const Page = () => {
  // State for dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const [data, setData] = useState<CoordinatorBudgetOverview | null>(null);
  const [error, setError] = useState<string | null>(null); //unused states, delete
  const [busy, setBusy] = useState(false);
  const [threshold, setThreshold] = useState(0.9);

  // function name not semantic enough, load what?
  async function load() {
    try {
      setBusy(true);
      setError(null);
      const res = await fetch(
        `/api/uc/overview?year=2025&session=S2&threshold=${threshold}`,
        { cache: "no-store" },
      ); //use axios instead
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: CoordinatorBudgetOverview = await res.json();
      setData(json);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Failed to load");
      } else {
        setError("Failed to load");
      }
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load(); /* initial */
  }, []);

  // Recompute status/alerts client-side so slider is live without refetching
  // function name not semantic enough, make the name intuitive so you don't need comments
  const computed = useMemo(() => {
    if (!data) return null;
    const rows = data.rows.map((r) => ({
      ...r,
      status: r.pctUsed >= threshold ? "Exceeding" : "Healthy",
    }));
    const alerts = rows
      .filter((r) => r.pctUsed >= threshold)
      .map((r) => ({
        message: `${r.unitCode} is at ${Math.round(r.pctUsed * 100)}% budget used.`,
        unitCode: r.unitCode,
      }));
    console.log(rows);
    return { rows, alerts };
  }, [data, threshold]);

  const ucApprovals = [
    {
      type: "Claim(diff)",
      role: "Tutor",
      by: "A. Singh",
      target: "INFO1910 * 2025-09-12 * 15:00",
      reason: "+0.5 over",
      status: "Review",
    },
    {
      type: "Claim(same)",
      role: "TA",
      by: "B. Wong",
      target: "INFO1110 * 2025-09-12 * 10:00",
      reason: "Roster mistmatch",
      status: "Review",
    },
  ]; //unused mock data, delete

  return (
    <div
      className="w-screen h-screen box-border bg-gray-100 px-5 flex flex-col"
      style={{ padding: "20px" }}
    >
      {/* Try and avoid using style and className together, className should have everything that style can do */}
      <div
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        {/* With mui components use sx not style */}
        <Typography variant="h2" style={{ display: "inline-block" }}>
          Unit Coordinator Dashboard
        </Typography>
        {/* Same, avoid style */}
        <div style={{ display: "inline-block", float: "right", gap: "10px" }}>
          {/* Implement refresh to do something */}
          <Button variant="secondary" style={{ marginRight: "10px" }}>
            Refresh
          </Button>
          <Button
            component={Link}
            href="/admin/allocations"
            variant="secondary"
            color="blue"
          >
            Add/Edit Allocations
          </Button>
        </div>
      </div>

      {/* Alerts */}

      <div>
        {/* Does this need to be wrapped in a div? */}
        <Typography variant="h4">Alerts</Typography>
      </div>
      {computed && computed.alerts.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {computed.alerts.map((a, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800"
            >
              {a.message}
            </span>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", marginBottom: "15px" }}>
          <Typography variant="body1">No alerts at this time.</Typography>
        </div>
      )}

      <div>
        <Typography variant="h4" style={{ marginTop: "20px" }}>
          Budget Overview
        </Typography>
        <Typography variant="body2" style={{ display: "inline" }}>
          Per unit offering
        </Typography>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={handleMenuClick}
            style={{
              width: "120px",
              height: "35px",
              textTransform: "none",
              outline: "1px solid",
              outlineColor: "lightgray",
              marginRight: "10px",
              color: "black",
            }}
          >
            This Session ⮟
          </Button>
          {/* Avoid raw unicode icons, they might be inconsistent or missing across browsers import from mui */}
          {/* Same, avoid style */}
          <Typography variant="body2" style={{ marginRight: "10px" }}>
            Budget % Threshold
          </Typography>
          <Slider
            value={threshold}
            onChange={(_, newValue) => setThreshold(newValue as number)}
            step={0.01}
            min={0.5}
            max={1}
            style={{ width: "100px", marginRight: "10px" }}
          ></Slider>
          <Typography variant="body1" style={{ marginRight: "10px" }}>
            {Math.round(threshold * 100)}%
          </Typography>
          <Button
            style={{
              height: "35px",
              textTransform: "none",
              color: "black",
              outline: "1px solid",
              outlineColor: "lightgray",
            }}
          >
            Save
          </Button>
        </div>

        <Menu open={open} anchorEl={anchorEl} onClose={handleMenuClose}>
          <MenuItem>This Session</MenuItem>
          <MenuItem>Last 7 days</MenuItem>
          <MenuItem>Last 30 days</MenuItem>
        </Menu>

        <div style={{ marginTop: "10px" }}>
          <UnitBudgetOverviewTable computedData={computed} />
        </div>
      </div>

      <div>
        <Typography variant="h4" style={{ marginTop: "20px" }}>
          UC Approvals
        </Typography>
        <Typography variant="body2">Items awaiting your review</Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          style={{ margin: "10px 0" }}
        >
          Approve All
        </Button>
        <CoordinatorApprovalTable pendingRequests={pendingRequests} />
      </div>

      <div>
        {/* Avoid style */}
        <Typography variant="h4" style={{ marginTop: "20px" }}>
          Requests Requiring Attention
        </Typography>
        <Typography variant="body2">Flagged queues</Typography>
        <div style={{ display: "flex" }}>
          <Typography variant="body1">No Requests.</Typography>
        </div>
      </div>

      <div>
        <Typography variant="h4" style={{ marginTop: "20px" }}>
          Marking Hours
        </Typography>
        <Typography variant="body2">Manual allocations</Typography>
        <div>
          <Typography variant="body1">No Hours Allocated.</Typography>
        </div>
      </div>
    </div>
  );
};

export default Page;
