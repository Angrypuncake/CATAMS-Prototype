"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Slider,
  Typography,
  Menu,
  MenuItem,
  Button,
  Box,
  Paper,
  Grid,
  Stack,
  Divider,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { CoordinatorBudgetOverview, UnitBudgetRow } from "./types";
import UnitBudgetOverviewTable from "./UnitBudgetOverviewTable";
import CoordinatorApprovalTable from "./CoordinatorApprovalTable";
import AlertBox from "@/components/AlertBox";
import Link from "next/link";
import { pendingRequests } from "./mock";
import { getUnitBudgetOverviews } from "@/app/services/budgetService";
import { getCurrentYearAndSession } from "@/app/utils/dateHelpers";
import AssignUnscheduledButton from "./_components/AssignUnscheduledButton";
import UnscheduledAllocationsTable from "./_components/UnscheduledAllocationsTable";

/* Shared black-outline card style to match earlier pages */
const cardSx = {
  p: { xs: 2, md: 2.5 },
  borderRadius: 3, // ~24px
  border: "1px solid #000",
  boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
  bgcolor: "#fff",
};

const blackContained = {
  backgroundColor: "#000",
  color: "#fff",
  borderRadius: 9999,
  px: 2.5,
  "&:hover": { backgroundColor: "#111" },
};

const blackOutlined = {
  borderColor: "#000",
  color: "#000",
  borderRadius: 9999,
  px: 2.5,
  "&:hover": { backgroundColor: "#000", color: "#fff", borderColor: "#111" },
};

const Page = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [data, setData] = useState<CoordinatorBudgetOverview | null>(null);
  const [threshold, setThreshold] = useState(0.9);

  async function fetchBudgetOverview() {
    try {
      const { year, session } = getCurrentYearAndSession();
      const overview = await getUnitBudgetOverviews(year, session, threshold);
      setData(overview);
    } catch (e) {
      console.error("Failed to load budget overview:", e);
    }
  }

  useEffect(() => {
    fetchBudgetOverview();
  }, []); // eslint-disable-line

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
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh" }}>
      <Box
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Typography variant="h4" fontWeight={800}>
            Unit Coordinator Dashboard
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              sx={blackOutlined}
              onClick={fetchBudgetOverview}
            >
              Refresh
            </Button>
            <Button
              component={Link}
              href="/admin/allocations"
              variant="contained"
              size="small"
              sx={blackContained}
            >
              Add / Edit Allocations
            </Button>
          </Stack>
        </Stack>

        {/* Alerts */}
        <Paper sx={{ ...cardSx, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Alerts
          </Typography>
          {computedBudgetData && computedBudgetData.alerts.length > 0 ? (
            <Stack direction="row" flexWrap="wrap" gap={1.5}>
              {computedBudgetData.alerts.map((a, i) => (
                <AlertBox key={i}>{a.message}</AlertBox>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No alerts at this time.
            </Typography>
          )}
        </Paper>

        {/* Budget Overview */}
        <Paper sx={{ ...cardSx, mb: 3 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Box>
              <Typography variant="h6">Budget Overview</Typography>
              <Typography variant="body2" color="text.secondary">
                Per unit offering
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Button
                onClick={(e) => setAnchorEl(e.currentTarget)}
                variant="outlined"
                size="small"
                endIcon={<ArrowDropDownIcon />}
                sx={blackOutlined}
              >
                This Session
              </Button>
              <Typography variant="body2">Budget % Threshold</Typography>
              <Slider
                value={threshold}
                onChange={(_, v) => setThreshold(v as number)}
                step={0.01}
                min={0.5}
                max={1}
                sx={{ width: 120 }}
              />
              <Typography
                variant="body1"
                sx={{ width: 40, textAlign: "right" }}
              >
                {Math.round(threshold * 100)}%
              </Typography>
              <Button variant="contained" size="small" sx={blackContained}>
                Save
              </Button>
            </Stack>
          </Stack>

          <Menu
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => setAnchorEl(null)}>This Session</MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>Last 7 days</MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>Last 30 days</MenuItem>
          </Menu>

          <UnitBudgetOverviewTable computedData={computedBudgetData} />
        </Paper>

        <Grid container spacing={3}>
          {/* Approvals */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ ...cardSx, height: "100%" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Box>
                  <Typography variant="h6">UC Approvals</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Items awaiting your review
                  </Typography>
                </Box>
                <Button variant="contained" size="small" sx={blackContained}>
                  Approve All
                </Button>
              </Stack>
              <CoordinatorApprovalTable pendingRequests={pendingRequests} />
            </Paper>
          </Grid>

          {/* Requests requiring attention */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ ...cardSx, height: "100%" }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Requests Requiring Attention
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                Flagged queues
              </Typography>
              <Typography variant="body2">No Requests.</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Unscheduled allocations */}
        <Paper sx={{ ...cardSx, mt: 3 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Box>
              <Typography variant="h6">Unscheduled Allocations</Typography>
              <Typography variant="body2" color="text.secondary">
                Manual Marking and Consultation Hours
              </Typography>
            </Box>
            <AssignUnscheduledButton />
          </Stack>
          <Divider sx={{ my: 1.5, borderColor: "#000" }} />
          <UnscheduledAllocationsTable />
        </Paper>
      </Box>
    </Box>
  );
};

export default Page;
