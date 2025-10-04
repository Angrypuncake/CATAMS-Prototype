"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Slider, Typography, Menu, MenuItem, Button } from "@mui/material";
import { CoordinatorBudgetOverview, UnitBudgetRow } from "./types";
import UnitBudgetOverviewTable from "./UnitBudgetOverviewTable";
import CoordinatorApprovalTable from "./CoordinatorApprovalTable";
import AlertBox from "@/components/AlertBox";
import Link from "next/link";
import axios from "axios";

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
  const [threshold, setThreshold] = useState(0.9);

  async function fetchBudgetOverview() {
    try {
      const { data: json } = await axios.get<CoordinatorBudgetOverview>(
        `/api/uc/overview`,
        {
          params: { year: 2025, session: "S2", threshold },
        },
      );
      setData(json);
    } catch (e: unknown) {
      console.error("Failed to load budget overview:", e);
    }
  }
  useEffect(() => {
    fetchBudgetOverview();
  }, []);

  const computedBudgetData = useMemo<{
    rows: (UnitBudgetRow & { status: string })[];
    alerts: { message: string; unitCode: string }[];
  } | null>(() => {
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
    return { rows, alerts };
  }, [data, threshold]);

  return (
    <div className="w-screen h-screen box-border bg-gray-100 px-5 flex flex-col p-20 [&>*:not(:first-child)]:mt-[25px]">
      <div className="w-full justify-between mb-20">
        <Typography variant="h2" sx={{ display: "inline-block" }}>
          Unit Coordinator Dashboard
        </Typography>
        <div className="inline-block float-right gap-[10px]">
          {/* Implement refresh to do something */}
          <Button variant="secondary" sx={{ marginRight: "10px" }}>
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
      <Typography variant="h4">Alerts</Typography>
      {computedBudgetData && computedBudgetData.alerts.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {computedBudgetData.alerts.map((a, i) => (
            <AlertBox key={i}>{a.message}</AlertBox>
          ))}
        </div>
      ) : (
        <div className="flex mb-15">
          <Typography variant="body1">No alerts at this time.</Typography>
        </div>
      )}

      <div>
        <Typography variant="h4">Budget Overview</Typography>
        <Typography variant="body2" sx={{ display: "inline" }}>
          Per unit offering
        </Typography>
        <div className="flex items-center justify-end">
          <Button
            onClick={handleMenuClick}
            variant="primary"
            sx={{
              textTransform: "none",
              marginRight: "10px",
              boxShadow: "none",
            }}
          >
            This Session ⮟
          </Button>
          <Typography variant="body2" sx={{ marginRight: "10px" }}>
            Budget % Threshold
          </Typography>
          <Slider
            value={threshold}
            onChange={(_, newValue) => setThreshold(newValue as number)}
            step={0.01}
            min={0.5}
            max={1}
            sx={{ width: "100px", marginRight: "10px" }}
          />
          <Typography variant="body1" sx={{ marginRight: "10px" }}>
            {Math.round(threshold * 100)}%
          </Typography>
          <Button
            variant="contained"
            color="primary"
            type="button"
            sx={{ textTransform: "none" }}
          >
            Save
          </Button>
        </div>

        <Menu open={open} anchorEl={anchorEl} onClose={handleMenuClose}>
          <MenuItem>This Session</MenuItem>
          <MenuItem>Last 7 days</MenuItem>
          <MenuItem>Last 30 days</MenuItem>
        </Menu>

        <div className="mt-[10px]">
          <UnitBudgetOverviewTable computedData={computedBudgetData} />
        </div>
      </div>

      <div>
        <Typography variant="h4">UC Approvals</Typography>
        <Typography variant="body2">Items awaiting your review</Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          sx={{ marginY: "10px" }}
        >
          Approve All
        </Button>
        <CoordinatorApprovalTable pendingRequests={pendingRequests} />
      </div>

      <div>
        <Typography variant="h4">Requests Requiring Attention</Typography>
        <Typography variant="body2">Flagged queues</Typography>
        <div className="flex">
          <Typography variant="body1">No Requests.</Typography>
        </div>
      </div>

      <div>
        <Typography variant="h4">Marking Hours</Typography>
        <Typography variant="body2">Manual allocations</Typography>
        <div>
          <Typography variant="body1">No Hours Allocated.</Typography>
        </div>
      </div>
    </div>
  );
};

export default Page;
