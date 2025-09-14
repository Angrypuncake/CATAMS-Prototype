"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

/** ------------ Types that match /api/admin/allocations response ------------ */
type AllocationRow = {
  id: number;
  user_id: number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;

  unit_code: string | null;
  unit_name: string | null;

  session_date: string | null; // ISO date or null
  start_at: string | null; // HH:MM:SS or null
  end_at: string | null; // HH:MM:SS or null
  location: string | null;

  activity_type: string | null;
  activity_name: string | null;

  status: string | null;
  override_note: string | null;

  teaching_role?: string | null;
  paycode_id?: string | null;
};

type ApiResult = {
  page: number;
  limit: number;
  total: number;
  data: AllocationRow[];
};

/** ------------------------- Utility formatting ------------------------- */
function pad2(n: number) {
  return n.toString().padStart(2, "0");
}
function toDisplayTime(hhmmss: string | null) {
  if (!hhmmss) return "";
  // "13:00:00" -> "01:00 PM"
  const [hh, mm] = hhmmss.split(":").map((t) => parseInt(t, 10));
  const ampm = hh >= 12 ? "PM" : "AM";
  const hr = ((hh + 11) % 12) + 1;
  return `${pad2(hr)}:${pad2(mm)} ${ampm}`;
}
function toInputTime(hhmmss: string | null) {
  if (!hhmmss) return "";
  const [hh, mm] = hhmmss.split(":");
  return `${hh}:${mm}`;
}
function fromInputTime(hhmm: string) {
  if (!hhmm) return null;
  const [hh, mm] = hhmm.split(":");
  return `${pad2(parseInt(hh, 10))}:${pad2(parseInt(mm, 10))}:00`;
}
function toInputDate(isoDate: string | null) {
  // "2025-03-03T00:00:00.000Z" or "2025-03-03" -> "2025-03-03"
  if (!isoDate) return "";
  return isoDate.substring(0, 10);
}
function labelName(row: AllocationRow) {
  const fn = row.first_name ?? "";
  const ln = row.last_name ?? "";
  return `${fn} ${ln}`.trim() || "—";
}

/** ------------------------------ Drawer ------------------------------ */
function Drawer({
  open,
  onClose,
  row,
  onMockSave,
}: {
  open: boolean;
  onClose: () => void;
  row: AllocationRow | null;
  onMockSave: (updated: Partial<AllocationRow>) => void;
}) {
  const [form, setForm] = useState({
    tutor: "",
    paycode: "",
    date: "",
    start: "",
    end: "",
    scope: "this", // this | all | following
    dow: "", // for propagation (optional)
    propStart: "",
    propEnd: "",
    override: "",
    status: "",
  });

  useEffect(() => {
    if (!row) return;
    setForm({
      tutor: labelName(row),
      paycode: row.paycode_id ?? "",
      date: toInputDate(row.session_date),
      start: toInputTime(row.start_at),
      end: toInputTime(row.end_at),
      scope: "this",
      dow: "",
      propStart: "",
      propEnd: "",
      override: row.override_note ?? "",
      status: row.status ?? "",
    });
  }, [row]);

  if (!open || !row) return null;

  return (
    <div>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <aside
        className="fixed right-0 top-0 h-full w-[420px] max-w-[90vw] bg-white shadow-2xl z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold">Edit Scheduled Allocation</h2>
          <p className="text-sm text-gray-500">
            Alloc #{row.id} • {row.unit_code ?? "—"} •{" "}
            {row.activity_name ?? row.activity_type ?? "Activity"}
          </p>
        </div>

        <div className="p-5 space-y-5">
          {/* Tutor */}
          <div>
            <label className="block text-sm font-medium mb-1">Tutor</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.tutor}
              onChange={(e) => setForm((f) => ({ ...f, tutor: e.target.value }))}
              placeholder="Tutor name"
            />
            <p className="text-xs text-gray-500 mt-1">
              (Free text for now; hook up to a tutors list later.)
            </p>
          </div>

          {/* Paycode */}
          <div>
            <label className="block text-sm font-medium mb-1">Paycode</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.paycode}
              onChange={(e) =>
                setForm((f) => ({ ...f, paycode: e.target.value }))
              }
              placeholder="e.g. TUT-L2"
            />
          </div>

          {/* Date / Start / End */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Date (this session)
              </label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start</label>
              <input
                type="time"
                className="w-full border rounded px-3 py-2"
                value={form.start}
                onChange={(e) =>
                  setForm((f) => ({ ...f, start: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End</label>
              <input
                type="time"
                className="w-full border rounded px-3 py-2"
                value={form.end}
                onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
              />
            </div>
          </div>

          {/* Propagation */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Propagation Scope (for pattern changes)
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.scope}
              onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))}
            >
              <option value="this">This session only</option>
              <option value="all">All sessions in pattern</option>
              <option value="following">This and following sessions</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Day of Week (for propagation)
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.dow}
                onChange={(e) => setForm((f) => ({ ...f, dow: e.target.value }))}
              >
                <option value="">— keep current —</option>
                <option>Mon</option>
                <option>Tue</option>
                <option>Wed</option>
                <option>Thu</option>
                <option>Fri</option>
                <option>Sat</option>
                <option>Sun</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Start (for propagation)
              </label>
              <input
                type="time"
                className="w-full border rounded px-3 py-2"
                value={form.propStart}
                onChange={(e) =>
                  setForm((f) => ({ ...f, propStart: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                End (for propagation)
              </label>
              <input
                type="time"
                className="w-full border rounded px-3 py-2"
                value={form.propEnd}
                onChange={(e) =>
                  setForm((f) => ({ ...f, propEnd: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Status / Override */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                placeholder="e.g. pending / ok / Approved Allocation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Override</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.override}
                onChange={(e) =>
                  setForm((f) => ({ ...f, override: e.target.value }))
                }
                placeholder="Notes"
              />
            </div>
          </div>
        </div>

        <div className="p-5 border-t flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onMockSave({
                status: form.status,
                override_note: form.override,
                session_date: form.date || null,
                start_at: fromInputTime(form.start),
                end_at: fromInputTime(form.end),
                paycode_id: form.paycode || null,
              });
              onClose();
            }}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save (Mock)
          </button>
        </div>
      </aside>
    </div>
  );
}

/** ------------------------------ Main Page ------------------------------ */
export default function AdminAllAllocationsPage() {
  // Filters (keep it minimal; you can wire these to inputs later if needed)
  const [q, setQ] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [activityType, setActivityType] = useState("");
  const [status, setStatus] = useState("");
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(1);

  // scheduled toggle
  const [tab, setTab] = useState<"scheduled" | "unscheduled">("scheduled");

  // data
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AllocationRow[]>([]);
  const [total, setTotal] = useState(0);

  // drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<AllocationRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (q) params.set("q", q);
      if (unitCode) params.set("unit_code", unitCode);
      if (activityType) params.set("activity_type", activityType);
      if (status) params.set("status", status);

      const url = `/api/admin/allocations?${params.toString()}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`GET ${url} failed`);
      const j = (await r.json()) as ApiResult;
      setRows(j.data || []);
      setTotal(j.total || 0);
    } catch (e) {
      console.error(e);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, unitCode, activityType, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { scheduledRows, unscheduledRows } = useMemo(() => {
    const sched = rows.filter((r) => !!r.session_date);
    const unsched = rows.filter((r) => !r.session_date);
    return { scheduledRows: sched, unscheduledRows: unsched };
  }, [rows]);

  const visible = tab === "scheduled" ? scheduledRows : unscheduledRows;

  function onEdit(row: AllocationRow) {
    setActiveRow(row);
    setDrawerOpen(true);
  }

  function onMockSave(updated: Partial<AllocationRow>) {
    // Apply a local optimistic update (mock only)
    if (!activeRow) return;
    setRows((old) =>
      old.map((r) => (r.id === activeRow.id ? { ...r, ...updated } as any : r))
    );
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-semibold mb-4">All Allocations</h1>

      {/* Top controls */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm text-gray-600 mb-1">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tutor, unit, activity…"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="block text-sm text-gray-600 mb-1">Unit Code</label>
          <input
            value={unitCode}
            onChange={(e) => setUnitCode(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="min-w-[200px]">
          <label className="block text-sm text-gray-600 mb-1">Activity Type</label>
          <input
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="min-w-[200px]">
          <label className="block text-sm text-gray-600 mb-1">Status</label>
          <input
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="w-[100px]">
          <label className="block text-sm text-gray-600 mb-1">Limit</label>
          <input
            type="number"
            min={1}
            max={200}
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value || "25", 10))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          onClick={() => {
            setPage(1);
            fetchData();
          }}
          className="h-[38px] px-4 rounded bg-blue-600 text-white self-end"
        >
          APPLY
        </button>
      </div>

      {/* Scheduled / Unscheduled toggle */}
      <div className="mb-3">
        <div className="inline-flex rounded-full border overflow-hidden">
          <button
            className={`px-4 py-1 text-sm ${
              tab === "scheduled" ? "bg-blue-600 text-white" : "bg-white"
            }`}
            onClick={() => setTab("scheduled")}
          >
            Scheduled
          </button>
          <button
            className={`px-4 py-1 text-sm border-l ${
              tab === "unscheduled" ? "bg-blue-600 text-white" : "bg-white"
            }`}
            onClick={() => setTab("unscheduled")}
          >
            Unscheduled
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto border rounded">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-3 py-2 w-[140px]">Date*</th>
              <th className="px-3 py-2 w-[110px]">Start*</th>
              <th className="px-3 py-2">Unit</th>
              <th className="px-3 py-2">Activity</th>
              <th className="px-3 py-2">Tutor</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Override</th>
              <th className="px-3 py-2 w-[80px]">Edit</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                  No rows
                </td>
              </tr>
            )}
            {!loading &&
              visible.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="text-gray-900">
                      {toInputDate(r.session_date) || "—"}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-gray-900">
                      {toDisplayTime(r.start_at) || "—"}
                    </div>
                    {r.end_at && (
                      <div className="text-xs text-gray-500">
                        End: {r.end_at?.slice(0, 8)}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{r.unit_code ?? "—"}</div>
                    <div className="text-xs text-gray-500">
                      {r.unit_name ?? ""}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{r.activity_type ?? "—"}</div>
                    <div className="text-xs text-gray-500">
                      {r.activity_name ?? ""}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{labelName(r)}</div>
                    <div className="text-xs text-gray-500">{r.email ?? ""}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="whitespace-pre-line">
                      {r.status ?? "—"}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="truncate max-w-[360px]">
                      {r.override_note ?? "—"}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => onEdit(r)}
                      className="px-3 py-1 rounded border hover:bg-gray-50"
                      title="Edit"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (simple) */}
      <div className="mt-3 flex items-center gap-2">
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          PREV
        </button>
        <div className="text-sm text-gray-600">
          Page {page} of {Math.max(1, Math.ceil(total / limit))}
        </div>
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          disabled={page >= Math.ceil(total / limit)}
          onClick={() =>
            setPage((p) => Math.min(Math.ceil(total / limit) || 1, p + 1))
          }
        >
          NEXT
        </button>
      </div>

      {/* Right-side Edit Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        row={activeRow}
        onMockSave={onMockSave}
      />
    </div>
  );
}
