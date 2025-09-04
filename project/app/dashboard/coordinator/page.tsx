"use client";

import React, { useState } from "react";
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

const Page = () => {
  // State for dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [value, setValue] = useState<number>(30);

  const changeSlider = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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

      <div>
        <Typography variant="h4">Alerts</Typography>
        <div style={{ display: "flex" }}>
          <Typography variant="body1">No alerts at this time.</Typography>
        </div>
      </div>

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
            value={value}
            onChange={changeSlider}
            step={1}
            min={0}
            max={100}
            style={{ width: "100px", marginRight: "10px" }}
          ></Slider>
          <Typography variant="body1" style={{ marginRight: "10px" }}>
            90%
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
                {budgetRows.map((row) => (
                  <TableRow key={row.unit}>
                    <TableCell style={{ fontWeight: "bold" }}>
                      {row.unit}
                    </TableCell>
                    <TableCell>{row.year}</TableCell>
                    <TableCell>{row.session}</TableCell>
                    <TableCell>{row.budget}</TableCell>
                    <TableCell>{row.spent}</TableCell>
                    <TableCell>{row.percentUsed}</TableCell>
                    <TableCell>{row.forecast}</TableCell>
                    <TableCell>{row.variance}</TableCell>
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
