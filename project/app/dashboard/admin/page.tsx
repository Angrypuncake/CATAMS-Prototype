"use client";
import React, { useCallback, useState, useEffect } from "react";
import {
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Chip, // NEW
  Stack, // NEW
} from "@mui/material";
import DynamicTable from "../../../components/DynamicTable/DynamicTable";
import AdminInfoBox from "./AdminInfoBox";
import AdminBudgetBox from "./AdminBudgetBox";
import AdminPagination from "./AdminPagination";
import axios from "axios";

// Allow non-primitives in rows (arrays/objects)
type TableRowData = {
  id?: string | number | null;
  [key: string]: unknown; // CHANGED
};
interface HistoryState {
  staged: TableRowData[];
  runs: TableRowData[];
}

// --- Helpers for renderers ---
const statusColor = (
  s?: string,
): "default" | "success" | "warning" | "error" => {
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
  const entries = Object.entries(obj as Record<string, unknown>).slice(
    0,
    limit,
  );
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

const AdminDashboard = () => {
  const [adminView, setAdminView] = useState({
    numUsers: 0,
    numAllocations: 0,
  });
  const LIMIT = 4;
  const [tutorPage, setTutorPage] = useState(1);
  const [tutorRows, setTutorRows] = useState<TableRowData[]>([]);
  const [historyRows, setHistoryRows] = useState<HistoryState>({
    staged: [],
    runs: [],
  });
  const [historyPage, setHistoryPage] = useState(1);
  const [alignment, setAlignment] = React.useState<"staged" | "runs">("staged");

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    next: "staged" | "runs" | null,
  ) => {
    if (!next) return;
    setAlignment(next);
    setHistoryPage(1);
  };

  const loadOverview = useCallback(async () => {
    try {
      const result = await axios.get("/api/admin/overview");
      setAdminView({
        numUsers: Number(result.data.totals.users),
        numAllocations: Number(result.data.totals.allocations),
      });
      setTutorRows(result.data.userRoles);
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
      const dropCounts = <T extends { counts?: unknown }>(
        rows: T[],
      ): Omit<T, "counts">[] => rows.map(({ counts, ...rest }) => rest);

      setHistoryRows({
        staged: dropBy(res.data.staged),
        runs: dropBy(dropCounts(res.data.runs)),
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
    <div className="h-screen flex flex-col w-[90%] gap-3">
      <div className="flex justify-around mt-6 w-full">
        <div>
          <div>
            <Typography variant="h3">System Admin Dashboard</Typography>
            <Typography variant="body1">
              Data operations, integrity checks, and system configuration.
            </Typography>
          </div>
        </div>

        <div className="gap-2 flex">
          <Button variant="secondary">Refresh</Button>
          <Button variant="secondary" color="blue" href="/admin/import">
            Bulk Import Allocations
          </Button>
          <Button variant="secondary" href="/admin/allocations">
            Edit allocations
          </Button>
        </div>
      </div>

      <div className="flex gap-2 justify-center w-full">
        <AdminInfoBox
          adminStatistic={adminView.numUsers}
          title="User"
          bubbleText="directory"
        />
        <AdminInfoBox
          adminStatistic={adminView.numAllocations}
          title="Allocations"
          bubbleText="current term"
        />
      </div>

      <div className="flex justify-center h-full gap-3 w-full">
        <div className="w-1/4 h-1/3 bg-white rounded-3xl p-3">
          <Typography variant="subtitle1">Budgets Loaded</Typography>
          <AdminBudgetBox
            title="Allocations CSV"
            description="Upload + preview in timetable"
            href=""
          />
        </div>

        <div className="w-3/4 h-full rounded-3xl flex flex-col gap-3">
          {/* Validation */}
          <div className="min-h-[85px] h-[10%] bg-white rounded-3xl p-3">
            <Typography variant="subtitle1">Validation Reports</Typography>
            <div>
              <Button variant="secondary" color="red">
                Invalid Tutor Emails {`(0)`}
              </Button>
            </div>
          </div>

          {/* User & Role Management */}
          <div className="h-[34%] bg-white rounded-3xl p-3">
            <div className="flex justify-between items-center">
              <Typography variant="subtitle1">
                User & Role Management
              </Typography>
              <AdminPagination
                page={tutorPage}
                setPage={setTutorPage}
                itemTotal={tutorRows.length}
                itemLimit={LIMIT}
              />
            </div>

            <DynamicTable
              rows={tutorRows.slice((tutorPage - 1) * LIMIT, tutorPage * LIMIT)}
              columnRenderers={{
                // roles: array → chips
                roles: (value) =>
                  Array.isArray(value) ? (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {value.map((r, i) => (
                        <Chip
                          key={i}
                          size="small"
                          variant="outlined"
                          label={String(r)}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <>{String(value ?? "—")}</>
                  ),

                // active: boolean → chip
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

                // created_at (if present)
                created_at: (value) => <>{fmtDateTime(value)}</>,
                updated_at: (value) => <>{fmtDateTime(value)}</>,
              }}
            />
          </div>

          {/* Import/Export Jobs */}
          <div className="h-[34%] bg-white rounded-3xl p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Typography variant="subtitle1">
                  Recent Jobs (Import/Exports)
                </Typography>
                <ToggleButtonGroup
                  color="primary"
                  value={alignment}
                  exclusive
                  onChange={handleChange}
                  aria-label="Platform"
                  sx={{
                    "& .MuiToggleButton-root": {
                      padding: "0px 6px",
                      minHeight: "22px",
                      fontSize: "0.7rem",
                      lineHeight: 1.2,
                    },
                  }}
                >
                  <ToggleButton value="staged">Staged</ToggleButton>
                  <ToggleButton value="runs">Runs</ToggleButton>
                </ToggleButtonGroup>
              </div>
              <AdminPagination
                page={historyPage}
                setPage={setHistoryPage}
                itemTotal={
                  alignment === "staged"
                    ? historyRows.staged.length
                    : historyRows.runs.length
                }
                itemLimit={LIMIT}
              />
            </div>

            <DynamicTable
              rows={
                alignment === "staged"
                  ? historyRows.staged.slice(
                      (historyPage - 1) * LIMIT,
                      historyPage * LIMIT,
                    )
                  : historyRows.runs.slice(
                      (historyPage - 1) * LIMIT,
                      historyPage * LIMIT,
                    )
              }
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
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
