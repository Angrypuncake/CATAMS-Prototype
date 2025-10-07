"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Drawer } from "./components/allocationDrawer";

import { AllocationRow, PaycodeOption } from "./types";

import { SaveAllocationPayload } from "@/app/_types/allocations";
import { Tutor } from "@/app/_types/tutor";

import {
  getAdminAllocations,
  patchAdminAllocation,
} from "@/app/services/allocationService";

import { getTutors } from "@/app/services/userService";

import { getPaycodes } from "@/app/services/paycodeService";

import { toDisplayTime, toInputDate, labelName } from "./util";

/** ------------------------------ Main Page ------------------------------ */
export default function AdminAllAllocationsPage() {
  // Filters
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

  // options
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [paycodes, setPaycodes] = useState<PaycodeOption[]>([]);

  // drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<AllocationRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const j = await getAdminAllocations({
        page,
        limit,
        tab,
        q,
        unitCode,
        activityType,
        status,
      });
      setRows(j.data || []);
      setTotal(j.total || 0);
    } catch (e) {
      console.error(e);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, tab, q, unitCode, activityType, status]);
  // Trigger reload when tab changes
  useEffect(() => {
    setPage(1);
    fetchData();
  }, [tab, fetchData]);

  useEffect(() => {
    (async () => {
      try {
        const [t, p] = await Promise.all([getTutors(), getPaycodes()]);
        setTutors(t || []);
        setPaycodes(p || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Prefer 'mode' to split rows; fall back to session_date
  const { scheduledRows, unscheduledRows } = useMemo(() => {
    const sched: AllocationRow[] = [];
    const unsched: AllocationRow[] = [];
    for (const r of rows) {
      const isScheduled =
        r.mode === "scheduled" || (r.mode == null && !!r.session_date);
      if (isScheduled) sched.push(r);
      else unsched.push(r);
    }
    return { scheduledRows: sched, unscheduledRows: unsched };
  }, [rows]);

  const visible = tab === "scheduled" ? scheduledRows : unscheduledRows;

  function onEdit(row: AllocationRow) {
    setActiveRow(row);
    setDrawerOpen(true);
  }

  async function onSave(updated: SaveAllocationPayload) {
    if (!activeRow) return;
    try {
      await patchAdminAllocation(activeRow.id, updated);
      await fetchData();
    } catch (err) {
      console.error("Error saving allocation", err);
    }
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
          <label className="block text-sm text-gray-600 mb-1">
            Activity Type
          </label>
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
            className={`px-4 py-1 text-sm ${tab === "scheduled" ? "bg-blue-600 text-white" : "bg-white"}`}
            onClick={() => setTab("scheduled")}
          >
            Scheduled
          </button>
          <button
            className={`px-4 py-1 text-sm border-l ${tab === "unscheduled" ? "bg-blue-600 text-white" : "bg-white"}`}
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
            {tab === "scheduled" ? (
              <tr className="text-left">
                <th className="px-3 py-2 w-[140px]">Date*</th>
                <th className="px-3 py-2 w-[110px]">Start*</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Activity</th>
                <th className="px-3 py-2">Tutor</th>
                <th className="px-3 py-2">Paycode</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Note</th>
                <th className="px-3 py-2 w-[80px]">Edit</th>
              </tr>
            ) : (
              <tr className="text-left">
                <th className="px-3 py-2 w-[180px]">Allocated Hours*</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Activity</th>
                <th className="px-3 py-2">Tutor</th>
                <th className="px-3 py-2">Paycode</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Note</th>
                <th className="px-3 py-2 w-[80px]">Edit</th>
              </tr>
            )}
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
                  {tab === "scheduled" ? (
                    <>
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
                    </>
                  ) : (
                    <td className="px-3 py-2">
                      <div className="text-gray-900">
                        {r.allocated_hours != null && r.allocated_hours !== ""
                          ? String(r.allocated_hours)
                          : "—"}
                      </div>
                    </td>
                  )}
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
                    <div className="font-medium">{r.paycode_id ?? "—"}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="whitespace-pre-line">{r.status ?? "—"}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="whitespace-pre-line">
                      {r.location ?? "—"}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="truncate max-w-[360px]">
                      {r.note ?? "—"}
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
        tutors={tutors}
        paycodes={paycodes}
        onSave={onSave}
      />
    </div>
  );
}
