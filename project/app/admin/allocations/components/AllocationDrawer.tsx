// components/AllocationDrawer.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  AllocationRow,
  PaycodeOption,
  PropagationPayload,
  STATUS_OPTIONS,
  OccurrenceRow,
} from "@/app/admin/allocations/types";
import { SaveAllocationPayload } from "@/app/_types/allocations";
import { getActivityOccurrences } from "@/app/services/activityService";
import { Tutor } from "@/app/_types/tutor";
import {
  fromInputTime,
  toInputDate,
  toInputTime,
  isoDateToDow,
} from "@/app/admin/allocations/util";
import { TutorCombo } from "./TutorCombo";
import { PaycodeCombo } from "./PaycodeCombo";
import { PropagationPanel } from "./PropagationPanel";

export function Drawer({
  open,
  onClose,
  row,
  onSave,
  tutors,
  paycodes,
}: {
  open: boolean;
  onClose: () => void;
  row: AllocationRow | null;
  onSave: (updated: SaveAllocationPayload) => void;
  tutors: Tutor[];
  paycodes: PaycodeOption[];
}) {
  // If backend sends mode use it; otherwise infer from presence of session fields
  const isScheduled =
    row?.mode === "scheduled" || (row?.mode == null && !!row?.session_date);

  const [propPayload, setPropPayload] = useState<PropagationPayload>({
    fields: [],
    notesMode: "overwrite",
    occurrenceIds: [],
  });

  // console.log("Drawer row", row);

  const [form, setForm] = useState({
    tutorId: null as number | null,
    paycode: null as string | null,
    date: "",
    start: "",
    end: "",
    note: "",
    status: "",
    location: "",
    // Unscheduled UX
    allocatedHours: "" as string,
    manualHoursOnly: false,
    // Smart propagation (scheduled)
    applyAllForActivity: false,
  });

  // State for future occurrence-related features - currently set but not directly read
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [weeksForActivity, setWeeksForActivity] = useState<OccurrenceRow[]>([]);

  // Hydrate Drawer from the row
  useEffect(() => {
    if (!row) return;
    setForm((f) => ({
      ...f,
      tutorId: row.user_id ?? null,
      paycode: row.paycode_id ?? null,
      date: toInputDate(row.session_date),
      start: toInputTime(row.start_at),
      end: toInputTime(row.end_at),
      note: row.note ?? "",
      status: row.status ?? "",
      location: row.location ?? "",
      allocatedHours: row.hours != null ? String(row.hours) : "",
      manualHoursOnly: !row.session_date && !row.start_at && !row.end_at,
      applyAllForActivity: false,
    }));
  }, [row]);

  // Load occurrences for this activity when opening a scheduled allocation
  useEffect(() => {
    const activityId = row?.allocation_activity_id ?? null;
    const inferredScheduled = row
      ? row.mode === "scheduled" || (!!row.session_date && row.mode == null)
      : false;

    if (!open || !row || !inferredScheduled || !activityId) {
      setWeeksForActivity([]);
      setForm((f) => ({ ...f, applyAllForActivity: false }));
      return;
    }

    (async () => {
      try {
        const occurrences = await getActivityOccurrences(activityId);
        setWeeksForActivity(occurrences);
      } catch (e) {
        console.error(e);
        setWeeksForActivity([]);
      }
    })();
  }, [open, row]);
  const derivedDow = React.useMemo(() => {
    const dateFromForm = form.date?.trim();
    const fallbackDate = toInputDate(row?.session_date ?? null);
    return isoDateToDow(dateFromForm || fallbackDate);
  }, [form.date, row?.session_date]);

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
        className="fixed right-0 top-0 h-full w-[480px] max-w-[95vw] bg-white shadow-2xl z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold">
            {isScheduled
              ? "Edit Scheduled Allocation"
              : "Edit Unscheduled Allocation"}
          </h2>
          <p className="text-sm text-gray-500">
            Alloc #{row.id} • {row.unit_code ?? "—"} •{" "}
            {row.activity_name ?? row.activity_type ?? "Activity"}
          </p>
        </div>

        <div className="p-5 space-y-5">
          {/* Tutor */}
          <div>
            <label className="block text-sm font-medium mb-1">Tutor</label>
            <TutorCombo
              options={tutors}
              valueId={form.tutorId}
              onChange={(sel) =>
                setForm((f) => ({ ...f, tutorId: sel ? sel.user_id : null }))
              }
            />
          </div>

          {/* Paycode */}
          <div>
            <label className="block text-sm font-medium mb-1">Paycode</label>
            <PaycodeCombo
              options={paycodes}
              valueCode={form.paycode}
              onChange={(sel) =>
                setForm((f) => ({ ...f, paycode: sel ? sel.code : null }))
              }
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="">— Select status —</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* {location} */}
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-[20px]"
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
            />
          </div>

          {/* Scheduled: Date/Start/End; Unscheduled: Allocated Hours (+ optional time inputs) */}
          {isScheduled ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date (this session)
                  </label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={form.date}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, date: e.target.value }));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start
                  </label>
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
                    onChange={(e) =>
                      setForm((f) => ({ ...f, end: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Notes (this session) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Notes (this session)
                </label>
                <textarea
                  className="w-full border rounded px-3 py-2 min-h-[84px]"
                  value={form.note}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, note: e.target.value }))
                  }
                  placeholder="Anything specific about this occurrence…"
                />
                <div className="text-xs text-gray-500 mt-1">
                  These note save to this session. To copy them to other weeks,
                  tick <strong>Notes</strong> in “Fields to propagate” and
                  choose overwrite/append.
                </div>
              </div>

              {/* NEW: Propagation Panel */}
              <PropagationPanel
                activityId={row.allocation_activity_id ?? 0}
                derivedDow={derivedDow}
                onChange={(p) => setPropPayload(p)}
              />
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Allocated Hours*
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    className="w-full border rounded px-3 py-2"
                    value={form.allocatedHours}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, allocatedHours: e.target.value }))
                    }
                    placeholder="e.g. 2, 1.5"
                  />
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.manualHoursOnly}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          manualHoursOnly: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm">
                      Manual hours only (no date/time)
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  className="w-full border rounded px-3 py-2 min-h-[84px]"
                  value={form.note}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, note: e.target.value }))
                  }
                  placeholder="Internal note…"
                />
              </div>

              <div
                className={`grid grid-cols-3 gap-3 ${form.manualHoursOnly ? "opacity-60 pointer-events-none" : ""}`}
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    disabled={form.manualHoursOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start
                  </label>
                  <input
                    type="time"
                    className="w-full border rounded px-3 py-2"
                    value={form.start}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, start: e.target.value }))
                    }
                    disabled={form.manualHoursOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End</label>
                  <input
                    type="time"
                    className="w-full border rounded px-3 py-2"
                    value={form.end}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, end: e.target.value }))
                    }
                    disabled={form.manualHoursOnly}
                  />
                </div>
              </div>
            </>
          )}
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
              if (isScheduled) {
                onSave({
                  user_id: form.tutorId,
                  paycode_id: form.paycode,
                  status: form.status,
                  note: form.note,
                  session_date: form.date || null,
                  start_at: fromInputTime(form.start),
                  end_at: fromInputTime(form.end),
                  location: form.location,
                  // Smart propagation intent for backend write-path
                  propagate_fields: propPayload.fields,
                  propagate_notes_mode: propPayload.fields.includes("note")
                    ? propPayload.notesMode
                    : undefined,
                  propagate_dow: propPayload.dow || undefined, // keep current
                  propagate_occurrence_ids: propPayload.occurrenceIds.length
                    ? propPayload.occurrenceIds
                    : undefined,
                });
              } else {
                onSave({
                  user_id: form.tutorId,
                  paycode_id: form.paycode,
                  status: form.status,
                  note: form.note,
                  session_date: null,
                  start_at: null,
                  end_at: null,
                  location: form.location,
                  hours: form.allocatedHours
                    ? Number(form.allocatedHours)
                    : null,
                });
              }
              onClose();
            }}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </aside>
    </div>
  );
}
