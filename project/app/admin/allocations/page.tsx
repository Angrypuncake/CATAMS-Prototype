// File: app/dashboard/admin/allocations/page.tsx
"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  Chip,
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";

type Row = {
  id: number;
  user_id: number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  unit_code: string;
  unit_name: string;
  date: string; // yyyy-mm-dd
  start_at: string; // HH:MM:SS
  end_at: string; // HH:MM:SS
  location: string | null;
  activity_type: string;
  activity_name: string;
  status: string | null;
  override_note: string | null;
};

const STATUS = ["Confirmed", "Pending", "Cancelled"] as const;

// --------- helpers ----------
async function getJSON<T>(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GET ${url} failed`);
  return (await r.json()) as T;
}
async function patchJSON<T, B>(url: string, body: B) {
  const r = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as T;
}
const toHHMMSS = (t: string) => (t && t.length === 5 ? `${t}:00` : t);
const isValidDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const isValidTime = (s: string) =>
  /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(s);

// Only these fields are editable
type Edits = {
  date?: string; // yyyy-mm-dd
  start_at?: string; // HH:MM or HH:MM:SS
};

export default function AdminAllAllocationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);

  // Filters/search
  const [q, setQ] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [activityType, setActivityType] = useState("");
  const [status, setStatus] = useState("");

  // Local edit buffer per row id
  const [edits, setEdits] = useState<Record<number, Edits>>({});
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error" | null;
  }>({ msg: "", type: null });

  const isDirty = (id: number) =>
    !!edits[id] && Object.keys(edits[id]).length > 0;
  const isFieldDirty = (id: number, key: keyof Edits) => !!edits[id]?.[key];

  const stage = (id: number, patch: Edits) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (q) params.set("q", q);
    if (unitCode) params.set("unit_code", unitCode);
    if (activityType) params.set("activity_type", activityType);
    if (status) params.set("status", status);

    const { data, total: t } = await getJSON<{ data: Row[]; total: number }>(
      `/api/admin/allocations?${params.toString()}`,
    );
    setRows(data ?? []);
    setTotal(t ?? 0);
    setLoading(false);
  }, [page, limit, q, unitCode, activityType, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  // Accept optional inline patch so Enter can save immediately without waiting for state
  const updateRow = async (id: number, inlinePatch?: Edits) => {
    const staged = edits[id] ?? {};
    const payload = { ...staged, ...inlinePatch };

    if (!payload || Object.keys(payload).length === 0) return;

    // normalize + validate
    if (payload.start_at) payload.start_at = toHHMMSS(payload.start_at);
    if (payload.date && !isValidDate(payload.date)) {
      setToast({ msg: "Invalid date format", type: "error" });
      return;
    }
    if (payload.start_at && !isValidTime(payload.start_at)) {
      setToast({ msg: "Invalid time format", type: "error" });
      return;
    }

    if (savingIds.has(id)) return;
    setSavingIds((s) => new Set(s).add(id));
    try {
      await patchJSON(`/api/admin/allocations/${id}`, payload);
      setToast({ msg: "Saved", type: "success" });
      await fetchData();
      setEdits((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setToast({ msg: msg || "Failed to update", type: "error" });
    } finally {
      setSavingIds((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  };

  return (
    <Box p={2} className="flex flex-col gap-3">
      <Typography variant="h4">All Allocations</Typography>

      {/* Search & filters */}
      <Paper className="p-3">
        <form onSubmit={onSearch} className="flex flex-wrap gap-3 items-end">
          <TextField
            label="Search"
            placeholder="name, unit, activity…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            size="small"
            InputProps={{ endAdornment: <SearchIcon /> }}
          />
          <TextField
            label="Unit Code"
            value={unitCode}
            onChange={(e) => setUnitCode(e.target.value)}
            size="small"
          />
          <TextField
            label="Activity Type"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            size="small"
          />
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            size="small"
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">Any</MenuItem>
            {STATUS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Limit"
            type="number"
            value={limit}
            onChange={(e) =>
              setLimit(Math.max(1, Number(e.target.value) || 25))
            }
            size="small"
            sx={{ width: 100 }}
          />
          <Button type="submit" variant="contained">
            Apply
          </Button>
        </form>
      </Paper>

      <Paper>
        <TableContainer sx={{ maxHeight: 640 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {[
                  "Date*",
                  "Start*",
                  "Unit",
                  "Activity",
                  "Tutor",
                  "Status",
                  "Override",
                  "Save",
                ].map((h) => (
                  <TableCell key={h}>
                    <b>{h}</b>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <CircularProgress size={18} /> Loading…
                  </TableCell>
                </TableRow>
              )}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>No rows</TableCell>
                </TableRow>
              )}

              {rows.map((r) => {
                const tutorName =
                  [r.first_name, r.last_name].filter(Boolean).join(" ") || "—";
                const saving = savingIds.has(r.id);
                return (
                  <TableRow key={r.id} hover>
                    {/* Editable: date */}
                    <TableCell sx={{ minWidth: 160 }}>
                      <TextField
                        type="date"
                        size="small"
                        defaultValue={r.date}
                        onBlur={(e) => stage(r.id, { date: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const v = (e.target as HTMLInputElement).value;
                            updateRow(r.id, { date: v });
                          }
                        }}
                        sx={{
                          ...(isFieldDirty(r.id, "date") && {
                            bgcolor: "rgba(255,215,0,0.15)",
                          }),
                        }}
                      />
                    </TableCell>

                    {/* Editable: start time */}
                    <TableCell sx={{ minWidth: 130 }}>
                      <TextField
                        type="time"
                        size="small"
                        inputProps={{ step: 60 }}
                        defaultValue={r.start_at.slice(0, 5)}
                        onBlur={(e) =>
                          stage(r.id, { start_at: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const v = (e.target as HTMLInputElement).value;
                            updateRow(r.id, { start_at: v });
                          }
                        }}
                        sx={{
                          ...(isFieldDirty(r.id, "start_at") && {
                            bgcolor: "rgba(255,215,0,0.15)",
                          }),
                        }}
                      />
                      <div className="text-xs text-gray-500">
                        End: {r.end_at}
                      </div>
                    </TableCell>

                    {/* Read-only context */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{r.unit_code}</span>
                        <span className="text-xs text-gray-600">
                          {r.unit_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{r.activity_type}</span>
                        <span className="text-xs text-gray-600">
                          {r.activity_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{tutorName}</span>
                        <span className="text-xs text-gray-600">
                          {r.email ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{r.status ?? "—"}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 360,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {r.override_note ?? "—"}
                    </TableCell>

                    {/* Save */}
                    <TableCell width={110}>
                      <Tooltip
                        title={
                          isDirty(r.id)
                            ? "Save changes to this row"
                            : "No changes"
                        }
                      >
                        <span>
                          <IconButton
                            aria-label="save"
                            onClick={() => updateRow(r.id)}
                            disabled={!isDirty(r.id) || saving}
                          >
                            {saving ? (
                              <CircularProgress size={18} />
                            ) : (
                              <SaveIcon />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                      {isDirty(r.id) && (
                        <Chip size="small" label="edited" sx={{ ml: 1 }} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      <Box className="flex items-center gap-2">
        <Button
          variant="outlined"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>
        <span>
          Page {page} of {Math.max(1, Math.ceil(total / limit))} • {total} total
        </span>
        <Button
          variant="outlined"
          disabled={page * limit >= total}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={!!toast.type}
        autoHideDuration={2200}
        onClose={() => setToast({ msg: "", type: null })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.type ?? "info"}
          variant="filled"
          onClose={() => setToast({ msg: "", type: null })}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
