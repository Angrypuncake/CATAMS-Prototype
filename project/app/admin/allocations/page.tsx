"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  AllocationRow,
  PaycodeOption,
  OccurrenceRow,
  PropagationPayload,
  STATUS_OPTIONS,
} from "./types";

import { SaveAllocationPayload, Dow } from "@/app/_types/allocations";
import { Tutor } from "@/app/_types/tutor";

import {
  getAdminAllocations,
  patchAdminAllocation,
} from "@/app/services/allocationService";

import { getTutors } from "@/app/services/userService";

import { getPaycodes } from "@/app/services/paycodeService";

import {
  toDisplayTime,
  toInputTime,
  fromInputTime,
  toInputDate,
  isoDateToDow,
  labelName,
} from "./util";
/** ----------------------- Small searchable comboboxes ---------------------- */
function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T | null>, // allow null
  onClickAway: () => void,
) {
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onClickAway();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [ref, onClickAway]);
}

function TutorCombo({
  options,
  valueId,
  onChange,
}: {
  options: Tutor[];
  valueId: number | null;
  onChange: (opt: Tutor | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = React.useRef<HTMLDivElement | null>(null);
  useOutsideClick(boxRef, () => setOpen(false));
  const selected = useMemo(
    () => options.find((t) => t.user_id === valueId) || null,
    [options, valueId],
  );

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return options.slice(0, 50);
    return options
      .filter((t) => {
        const name = `${t.first_name ?? ""} ${t.last_name ?? ""}`.toLowerCase();
        return name.includes(ql) || (t.email ?? "").toLowerCase().includes(ql);
      })
      .slice(0, 50);
  }, [q, options]);

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full border rounded px-3 py-2 text-left"
      >
        {selected
          ? `${selected.first_name ?? ""} ${selected.last_name ?? ""}`.trim() +
            (selected.email ? ` (${selected.email})` : "")
          : "Select tutor…"}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg">
          <div className="p-2 border-b">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full border rounded px-2 py-1"
              placeholder="Search name or email…"
            />
          </div>
          <ul className="max-h-72 overflow-auto">
            {filtered.map((t) => {
              const key = `${t.user_id}`;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(t);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  >
                    <div className="font-medium">
                      {(t.first_name ?? "") + " " + (t.last_name ?? "")}
                    </div>
                    {t.email && (
                      <div className="text-xs text-gray-500">{t.email}</div>
                    )}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function PaycodeCombo({
  options,
  valueCode,
  onChange,
}: {
  options: PaycodeOption[];
  valueCode: string | null;
  onChange: (opt: PaycodeOption | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = React.useRef<HTMLDivElement>(null);
  useOutsideClick(boxRef, () => setOpen(false));

  const selected = options.find((p) => p.code === valueCode) || null;

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return options.slice(0, 100);
    return options
      .filter((p) => {
        return (
          p.code.toLowerCase().includes(ql) ||
          (p.paycode_description ?? "").toLowerCase().includes(ql)
        );
      })
      .slice(0, 100);
  }, [q, options]);

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full border rounded px-3 py-2 text-left"
      >
        {selected
          ? `${selected.code}` +
            (selected.paycode_description
              ? ` — ${selected.paycode_description}`
              : "")
          : "Select paycode…"}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg">
          <div className="p-2 border-b">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full border rounded px-2 py-1"
              placeholder="Search code or description…"
            />
          </div>
          <ul className="max-h-72 overflow-auto">
            {filtered.map((p) => (
              <li key={p.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(p);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50"
                >
                  <div className="font-medium">{p.code}</div>
                  {(p.paycode_description || p.amount) && (
                    <div className="text-xs text-gray-500">
                      {p.paycode_description ?? ""}{" "}
                      {p.amount ? `• $${p.amount}` : ""}
                    </div>
                  )}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function PropagationPanel({
  activityId,
  disabled,
  derivedDow,
  onChange,
}: {
  activityId: number;
  disabled?: boolean;
  derivedDow: Dow | "";
  onChange: (p: PropagationPayload) => void;
}) {
  const [weeks, setWeeks] = React.useState<OccurrenceRow[]>([]);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [fields, setFields] = React.useState<PropagationPayload["fields"]>([]);
  const [notesMode, setNotesMode] = React.useState<"overwrite" | "append">(
    "overwrite",
  );
  const [moveDow, setMoveDow] = React.useState<boolean>(false);

  // Fetch occurrences for this activity
  React.useEffect(() => {
    if (!activityId) {
      setWeeks([]);
      setSelected(new Set());
      return;
    }
    (async () => {
      try {
        const r = await fetch(
          `/api/admin/activities/${activityId}/occurrences`,
        );
        if (!r.ok) throw new Error("Failed to load occurrences");
        const data = (await r.json()) as { data: OccurrenceRow[] };
        setWeeks(data.data || []);
        setSelected(new Set()); // reset selection on activity change
      } catch (e) {
        console.error(e);
        setWeeks([]);
        setSelected(new Set());
      }
    })();
  }, [activityId]);

  // Lift state up
  React.useEffect(() => {
    onChange({
      fields,
      notesMode: fields.includes("note") ? notesMode : undefined,
      dow: moveDow && derivedDow ? derivedDow : undefined, // <-- only when checked
      occurrenceIds: Array.from(selected),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, notesMode, derivedDow, selected]);

  const toggleAll = (check: boolean) => {
    if (check) setSelected(new Set(weeks.map((w) => w.occurrence_id)));
    else setSelected(new Set());
  };

  const toggleOne = (id: number, check: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (check) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleField = (name: PropagationPayload["fields"][number]) => {
    setFields((prev) => {
      const has = prev.includes(name);
      if (has) return prev.filter((f) => f !== name);
      return [...prev, name];
    });
  };

  const isDisabled = !!disabled;

  return (
    <fieldset className={isDisabled ? "opacity-60 pointer-events-none" : ""}>
      <legend className="block text-base font-semibold mb-1">
        Propagate across existing sessions
      </legend>
      <p className="text-xs text-gray-500 mb-3">
        Tick weeks below to apply changes. Leave all unticked for “this session
        only”.
      </p>

      <div className="grid grid-cols-5 gap-3">
        {/* DoW section */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            Day of Week (derived)
          </label>

          {/* NEW: checkbox to include/exclude DOW propagation */}
          <label className="inline-flex items-center gap-2 mb-1 text-sm">
            <input
              type="checkbox"
              checked={moveDow}
              onChange={(e) => setMoveDow(e.target.checked)}
              disabled={!derivedDow} // if no date selected yet
            />
            Move to this weekday
          </label>

          <input
            className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-700"
            value={derivedDow || "—"}
            readOnly
            aria-readonly="true"
            title="Derived from Date (this session)"
          />
          <div className="text-xs text-gray-500 mt-1">
            Propagation uses the weekday derived from “Date (this session)”.
            Change the date above to update this value.
          </div>
        </div>

        {/* Fields to propagate */}
        <div className="col-span-3">
          <div className="text-sm font-medium mb-1">Fields to propagate</div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fields.includes("tutor")}
                onChange={() => toggleField("tutor")}
              />
              Tutor
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fields.includes("paycode")}
                onChange={() => toggleField("paycode")}
              />
              Paycode
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fields.includes("start")}
                onChange={() => toggleField("start")}
              />
              Start
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fields.includes("end")}
                onChange={() => toggleField("end")}
              />
              End
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fields.includes("note")}
                onChange={() => toggleField("note")}
              />
              Notes
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fields.includes("status")}
                onChange={() => toggleField("status" as const)}
              />
              Status
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fields.includes("location")}
                onChange={() => toggleField("location" as const)}
              />
              Location
            </label>

            {/* Notes mode */}
            {fields.includes("note") && (
              <div className="flex items-center gap-3 text-xs">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="note-mode"
                    checked={notesMode === "overwrite"}
                    onChange={() => setNotesMode("overwrite")}
                  />
                  overwrite
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="note-mode"
                    checked={notesMode === "append"}
                    onChange={() => setNotesMode("append")}
                  />
                  append
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weeks table */}
      <div className="mt-4 border rounded">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 rounded-t">
          <div className="font-medium">Choose existing weeks</div>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1 border rounded"
              onClick={() => toggleAll(true)}
            >
              Select All
            </button>
            <button
              type="button"
              className="px-3 py-1 border rounded"
              onClick={() => toggleAll(false)}
            >
              Clear All
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-3 py-2 w-[48px]"></th>
              <th className="px-3 py-2 w-[120px]">Week</th>
              <th className="px-3 py-2 w-[160px]">Date</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w, idx) => {
              const checked = selected.has(w.occurrence_id);
              return (
                <tr key={w.occurrence_id} className="border-t">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        toggleOne(w.occurrence_id, e.target.checked)
                      }
                    />
                  </td>
                  <td className="px-3 py-2">Week {idx + 1}</td>
                  <td className="px-3 py-2">{w.session_date}</td>
                  <td className="px-3 py-2">
                    {w.status ? (
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 border">
                        {w.status}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">existing</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {weeks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                  No existing weeks found for this activity.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="px-3 py-2 text-xs text-gray-500 border-t rounded-b">
          Tip: leaving all weeks unticked means “this session only”.
        </div>
      </div>

      {/* Tiny summary */}
      <div className="mt-3 text-xs text-gray-600">
        {selected.size > 0
          ? `Will apply to ${selected.size} occurrence(s).`
          : `No occurrences selected — this session only.`}
      </div>
    </fieldset>
  );
}

/** ------------------------------ Drawer ------------------------------ */
function Drawer({
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
      allocatedHours:
        row.allocated_hours != null ? String(row.allocated_hours) : "",
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
        const r = await fetch(
          `/api/admin/activities/${activityId}/occurrences`,
        );
        if (!r.ok) throw new Error("Failed to load occurrences");
        const data = (await r.json()) as { data: OccurrenceRow[] };
        setWeeksForActivity(data.data || []);
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
                console.log("prop payload", propPayload);
                console.log("propagate fields", propPayload.fields);
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
                  allocated_hours: form.allocatedHours
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
