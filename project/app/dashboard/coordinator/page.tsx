"use client";

import React, { useEffect, useState, useMemo } from "react";
import Button from "@mui/material/Button";
import { Slider, Typography, Menu, MenuItem } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

type Row = {
  offeringId: number;
  unitCode: string;
  unitName: string;
  year: number;
  session: string;
  budget: number;
  spent: number;
  pctUsed: number; // 0..1 from API
  variance: number;
};

type ApiResp = {
  year: number;
  session: string;
  threshold: number; // 0..1
  rows: Row[];
  alerts?: {
    message: string;
    offeringId: number;
    unitCode: string;
    pctUsed: number;
  }[];
};

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

  const [data, setData] = useState<ApiResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [threshold, setThreshold] = useState(0.9);

  async function load() {
    try {
      setBusy(true);
      setError(null);
      const res = await fetch(
        `/api/uc/overview?year=2025&session=S2&threshold=${threshold}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResp = await res.json();
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
  const computed = useMemo(() => {
    if (!data) return null;
    const rows = data.rows.map((r) => ({
      ...r,
      status: r.pctUsed >= threshold ? "Open" : "Healthy",
    }));
    const alerts = rows
      .filter((r) => r.pctUsed >= threshold)
      .map((r) => ({
        message: `${r.unitCode} is at ${Math.round(r.pctUsed * 100)}% budget used.`,
        unitCode: r.unitCode,
      }));
    return { rows, alerts };
  }, [data, threshold]);

  const AUD = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  });

  const PCT = (v: number) => `${(v * 100).toFixed(1)}%`;

  const budgetRows = [
    {
      unit: "INFO1110",
      year: "2025",
      session: "S2",
      budget: "$120,000",
      spent: "$108,500",
      percentUsed: "90.4%",
      forecast: "$4,200",
      variance: "-$7,300",
      status: "Open",
    },
    {
      unit: "INFO1910",
      year: "2025",
      session: "S1",
      budget: "$99,000",
      spent: "$144,500",
      percentUsed: "66.4%",
      forecast: "$6,200",
      variance: "$1,300",
      status: "Healthy",
    },
    {
      unit: "DATA2002",
      year: "2024",
      session: "S2",
      budget: "$202,000",
      spent: "$111,500",
      percentUsed: "101.4%",
      forecast: "$1,200",
      variance: "$6,300",
      status: "Open",
    },
  ];

  const ucApprovals = [
    {
      type: "Claim(diff)",
      by: "A. Singh",
      target: "INFO1910 * 2025-09-12 * 15:00",
      reason: "+0.5 over",
      status: "Review",
    },
    {
      type: "Claim(same)",
      by: "B. Wong",
      target: "INFO1110 * 2025-09-12 * 10:00",
      reason: "Roster mistmatch",
      status: "Review",
    },
  ];

  return (
    <div style={{ padding: "3vw", paddingTop: "20px" }}>
      <div
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <Typography variant="h2" style={{ display: "inline-block" }}>
          Unit Coordinator Dashboard
        </Typography>

        <div style={{ display: "inline-block", float: "right", gap: "10px" }}>
          <Button variant="secondary" style={{ marginRight: "10px" }}>
            Refresh
          </Button>
          <Button variant="secondary" color="blue">
            {" "}
            Assign Marking Hours
          </Button>
        </div>
      </div>

      {/* Alerts */}

      <div>
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
        <div style={{ display: "flex" }}>
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
          <Typography variant="body2" style={{ marginRight: "10px" }}>
            Open threshold
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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Unit</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Session</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Spent</TableCell>
                  <TableCell>% Used</TableCell>
                  <TableCell>Forecast (Wk)</TableCell>
                  <TableCell>Variance</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {computed?.rows.map((row) => (
                  <TableRow key={row.unitCode}>
                    <TableCell style={{ fontWeight: "bold" }}>
                      {row.unitCode}
                    </TableCell>
                    <TableCell>{row.year}</TableCell>
                    <TableCell>{row.session}</TableCell>
                    <TableCell>{AUD.format(row.budget)}</TableCell>
                    <TableCell>{AUD.format(row.spent)}</TableCell>
                    <TableCell>{PCT(row.pctUsed)}</TableCell>
                    <TableCell>---</TableCell>
                    <TableCell>{AUD.format(row.variance)}</TableCell>
                    <TableCell>
                      {" "}
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
                          (row.status === "Open"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800")
                        }
                      >
                        {row.status}
                      </span>{" "}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      <div>
        <Typography variant="h4" style={{ marginTop: "20px" }}>
          UC Approvals
        </Typography>
        <Typography variant="body2">Items awaiting your review</Typography>
        <div>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Submitted by</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ucApprovals.map((row) => (
                  <TableRow key={row.type}>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.by}</TableCell>
                    <TableCell>{row.target}</TableCell>
                    <TableCell>{row.reason}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      <div>
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
