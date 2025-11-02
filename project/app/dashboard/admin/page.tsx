"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import axios from "axios";

import DynamicTable from "../../../components/DynamicTable/DynamicTable";
import AdminInfoBox from "./AdminInfoBox";
import AdminBudgetBox from "./AdminBudgetBox";

/* ========= Types ========= */
type TableRowData = {
  id?: string | number | null;
  [key: string]: unknown;
};
interface HistoryState {
  staged: TableRowData[];
  runs: TableRowData[];
}

/* ========= Helpers ========= */
const statusColor = (s?: string): "default" | "success" | "warning" | "error" => {
  switch ((s || "").toLowerCase()) {
    case "confirmed":
    case "committed":
      return "success";
    case "pending":
    case "staged":
      return "warning";
    case "failed":
    case "rolled_back":
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const fmtDateTime = (v: unknown) => {
  const d = v ? new Date(String(v)) : null;
  return d && !isNaN(d.getTime()) ? d.toLocaleString() : "—";
};

const kvPreview = (obj: unknown, limit = 4) => {
  if (!obj || typeof obj !== "object") return <>—</>;
  const entries = Object.entries(obj as Record<string, unknown>).slice(0, limit);
  return (
    <Stack spacing={0.25}>
      {entries.map(([k, v]) => (
        <Typography key={k} variant="body2">
          {k}: {String(v)}
        </Typography>
      ))}
      {Object.keys(obj as object).length > limit && (
        <Typography variant="caption" color="text.secondary">
          …more
        </Typography>
      )}
    </Stack>
  );
};

/* ========= Page ========= */
export default function AdminPage() {
  const [adminView, setAdminView] = useState({
    numUsers: 0,
    numAllocations: 0,
  });
  const [tutorRows, setTutorRows] = useState<TableRowData[]>([]);
  const [tutorTotal, setTutorTotal] = useState(0);
  const [historyRows, setHistoryRows] = useState<HistoryState>({
    staged: [],
    runs: [],
  });
  const [historyTotals, setHistoryTotals] = useState({ staged: 0, runs: 0 });
  const [alignment, setAlignment] = useState<"staged" | "runs">("staged");

  const handleChange = (_: React.MouseEvent<HTMLElement>, next: "staged" | "runs" | null) => {
    if (next) setAlignment(next);
  };

  const loadOverview = useCallback(async () => {
    try {
      const result = await axios.get("/api/admin/overview");
      setAdminView({
        numUsers: Number(result.data.totals.users),
        numAllocations: Number(result.data.totals.allocations),
      });
      setTutorRows(result.data.userRoles);
      setTutorTotal(Number(result.data.userRolesTotal || 0));
    } catch (err) {
      console.error("Error loading overview:", err);
    }
  }, []);

  const loadImportHistory = useCallback(async () => {
    try {
      const res = await axios.get("/api/admin/history", {
        params: { limit: 200 },
      });
      const dropBy = <T extends { by?: unknown }>(rows: T[]): Omit<T, "by">[] =>
        rows.map(({ by, ...rest }) => rest);
      const dropCounts = <T extends { counts?: unknown }>(rows: T[]): Omit<T, "counts">[] =>
        rows.map(({ counts, ...rest }) => rest);

      setHistoryRows({
        staged: dropBy(res.data.staged),
        runs: dropCounts(res.data.runs),
      });
      setHistoryTotals({
        staged: Number(res.data.stagedTotal || 0),
        runs: Number(res.data.runsTotal || 0),
      });
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }, []);

  useEffect(() => {
    loadOverview();
    loadImportHistory();
  }, [loadOverview, loadImportHistory]);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Small spacer under nav */}
      <Box sx={{ height: 16 }} />

      {/* ✅ Full-width content, centered */}
      <Box sx={{ width: "100%", px: { xs: 3, sm: 5, md: 8 }, pb: 8 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ minWidth: 320 }}>
              <Typography variant="h4">System Admin Dashboard</Typography>
              <Typography variant="body1" color="text.secondary">
                Data operations, integrity checks, and system configuration.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Button variant="secondary">Refresh</Button>
              <Button variant="secondary" color="blue" href="/admin/import">
                Bulk Import Allocations
              </Button>
              <Button variant="secondary" href="/admin/allocations">
                Edit allocations
              </Button>
            </Stack>
          </Box>

          {/* ===== Grid layout ===== */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 3fr" },
              gap: 2.5,
              alignItems: "start",
            }}
          >
            {/* Left column */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Budgets Loaded
              </Typography>
              <AdminBudgetBox
                title="Allocations CSV"
                description="Upload + preview in timetable"
                href=""
              />
            </Paper>

            {/* Right column */}
            <Stack spacing={2.5}>
              {/* KPI row (moved here, above Validation) */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  alignItems: "stretch",
                }}
              >
                <AdminInfoBox
                  adminStatistic={adminView.numUsers}
                  title="Users"
                  bubbleText="directory"
                />
                <AdminInfoBox
                  adminStatistic={adminView.numAllocations}
                  title="Allocations"
                  bubbleText="current term"
                />
              </Box>

              {/* Validation */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  Validation Reports
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Button variant="secondary" color="red">
                    Invalid Tutor Emails (0)
                  </Button>
                </Box>
              </Paper>

              {/* User & Role Management */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  User &amp; Role Management
                </Typography>

                <DynamicTable
                  rows={tutorRows}
                  enablePagination
                  totalCount={tutorTotal}
                  columnRenderers={{
                    roles: (value) =>
                      Array.isArray(value) ? (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {value.map((r, i) => (
                            <Chip key={i} size="small" variant="outlined" label={String(r)} />
                          ))}
                        </Stack>
                      ) : (
                        <>{String(value ?? "—")}</>
                      ),
                    active: (value) =>
                      typeof value === "boolean" ? (
                        <Chip
                          size="small"
                          label={value ? "Active" : "Inactive"}
                          color={value ? "success" : "default"}
                        />
                      ) : (
                        <>{String(value ?? "—")}</>
                      ),
                    created_at: (value) => <>{fmtDateTime(value)}</>,
                    updated_at: (value) => <>{fmtDateTime(value)}</>,
                  }}
                />
              </Paper>

              {/* Import/Export Jobs */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Recent Jobs (Import/Exports)
                  </Typography>
                  <ToggleButtonGroup
                    color="primary"
                    value={alignment}
                    exclusive
                    onChange={handleChange}
                    aria-label="History group"
                    sx={{
                      "& .MuiToggleButton-root": {
                        px: 0.75,
                        minHeight: 24,
                        fontSize: "0.75rem",
                        lineHeight: 1.2,
                      },
                    }}
                  >
                    <ToggleButton value="staged">Staged</ToggleButton>
                    <ToggleButton value="runs">Runs</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>

                <DynamicTable
                  key={alignment}
                  rows={alignment === "staged" ? historyRows.staged : historyRows.runs}
                  enablePagination
                  totalCount={alignment === "staged" ? historyTotals.staged : historyTotals.runs}
                  columnRenderers={{
                    status: (value) => (
                      <Chip
                        size="small"
                        color={statusColor(String(value))}
                        label={String(value ?? "—")}
                      />
                    ),
                    issues: (value) => kvPreview(value),
                    counts: (value) => kvPreview(value),
                    created_at: (value) => <>{fmtDateTime(value)}</>,
                    started_at: (value) => <>{fmtDateTime(value)}</>,
                    finished_at: (value) => <>{fmtDateTime(value)}</>,
                    warnings: (value) =>
                      Array.isArray(value) ? (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {value.map((w, i) => (
                            <Chip key={i} size="small" label={String(w)} />
                          ))}
                        </Stack>
                      ) : (
                        <>{String(value ?? "—")}</>
                      ),
                  }}
                />
              </Paper>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
