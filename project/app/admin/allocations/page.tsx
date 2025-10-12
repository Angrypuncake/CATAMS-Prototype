"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

/* ===== Timeline import (relative from app/admin/allocations/page.tsx) ===== */
import {
  TimelineView,
  buildWeeksRange,
  type WeekDef,
  type ActivityRow as TLActivityRow,
  type CellAllocation as TLCellAllocation,
} from "../../../components/TimelineView";

/** ------------ Types that match /api/admin/allocations response ------------ */
type AllocationRow = {
  id: number;
  user_id: number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;

  unit_code: string | null;
  unit_name: string | null;

  session_date: string | null; // ISO "YYYY-MM-DD..." or null
  start_at: string | null; // "HH:MM:SS" or null
  end_at: string | null; // "HH:MM:SS" or null
  location: string | null;

  activity_type: string | null;
  activity_name: string | null;

  status: string | null;
  note: string | null;

  teaching_role?: string | null;
  paycode_id?: string | null;

  // NEW fields to support unscheduled allocations
  mode?: "scheduled" | "unscheduled" | string | null;
  allocated_hours?: number | string | null;
  allocation_activity_id?: number | null; // a.activity_id alias
};

type UpdatedRow = Partial<AllocationRow> & {
  apply_all_for_activity?: boolean;
  propagate_occurrence_ids?: number[] | null;
};

type ApiResult = {
  page: number;
  limit: number;
  total: number;
  data: AllocationRow[];
};

type TutorOption = {
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

type PaycodeOption = {
  code: string;
  paycode_description: string | null;
  amount: string | number;
};

// For the occurrences helper
type OccurrenceRow = {
  occurrence_id: number;
  session_date: string; // "YYYY-MM-DD"
  status?: string | null; // optional, if you return it
};

type SavePayload = Partial<AllocationRow> & {
  apply_all_for_activity?: boolean;
  propagate_occurrence_ids?: number[] | null;

  propagate_fields?: Array<
    "tutor" | "paycode" | "start" | "end" | "note" | "status" | "location"
  >;
  propagate_notes_mode?: "overwrite" | "append";
  propagate_dow?: Dow;
};

type PropagationPayload = {
  fields: Array<
    "tutor" | "paycode" | "start" | "end" | "note" | "status" | "location"
  >;
  notesMode?: "overwrite" | "append";
  dow?: Dow;
  occurrenceIds: number[];
};

const STATUS_OPTIONS = [
  "Academic Staff",
  "Approved Allocation",
  "Hours for Approval",
  "Ignore class",
  "Variation complete",
  "Draft Casual",
  "Hours for Review",
  "Rejected by Approver",
] as const;

/** ------------------------- Utility formatting ------------------------- */
function pad2(n: number) {
  return n.toString().padStart(2, "0");
}
function toDisplayTime(hhmmss: string | null) {
  if (!hhmmss) return "";
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
  if (!isoDate) return "";
  return isoDate.substring(0, 10);
}
function labelName(row: Pick<AllocationRow, "first_name" | "last_name">) {
  const fn = row.first_name ?? "";
  const ln = row.last_name ?? "";
  return `${fn} ${ln}`.trim() || "—";
}

const DOWS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Dow = (typeof DOWS)[number];

function isoDateToDow(iso: string | null | undefined): Dow | "" {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const js = new Date(y, m - 1, d).getDay();
  const map: Record<number, Dow> = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };
  return map[js] ?? "";
}

/** ----------------------- Small searchable comboboxes ---------------------- */
function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
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
  options: TutorOption[];
  valueId: number | null;
  onChange: (opt: TutorOption | null) => void;
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
  console.log("PropagationPanel activityId", activityId);

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
        setSelected(new Set());
      } catch (e) {
        console.error(e);
        setWeeks([]);
        setSelected(new Set());
      }
    })();
  }, [activityId]);

  React.useEffect(() => {
    onChange({
      fields,
      notesMode: fields.includes("note") ? notesMode : undefined,
      dow: moveDow && derivedDow ? derivedDow : undefined,
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

          <label className="inline-flex items-center gap-2 mb-1 text-sm">
            <input
              type="checkbox"
              checked={moveDow}
              onChange={(e) => setMoveDow(e.target.checked)}
              disabled={!derivedDow}
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
            {(["tutor", "paycode", "start", "end", "note", "status", "location"] as const).map((f) => (
              <label key={f} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={fields.includes(f)}
                  onChange={() => toggleField(f)}
                />
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </label>
            ))}
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
  onSave: (updated: SavePayload) => void;
  tutors: TutorOption[];
  paycodes: PaycodeOption[];
}) {
  const isScheduled =
    row?.mode === "scheduled" || (row?.mode == null && !!row?.session_date);

  const [propPayload, setPropPayload] = useState<PropagationPayload>({
    fields: [],
    notesMode: "overwrite",
    occurrenceIds: [],
  });

  const [form, setForm] = useState({
    tutorId: null as number | null,
    paycode: null as string | null,
    date: "",
    start: "",
    end: "",
    note: "",
    status: "",
    location: "",
    allocatedHours: "" as string,
    manualHoursOnly: false,
    applyAllForActivity: false,
  });

  const [weeksForActivity, setWeeksForActivity] = useState<OccurrenceRow[]>([]);

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
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
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
                  propagate_fields: propPayload.fields,
                  propagate_notes_mode: propPayload.fields.includes("note")
                    ? propPayload.notesMode
                    : undefined,
                  propagate_dow: propPayload.dow || undefined,
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

/* ======================= rows -> timeline helpers ======================= */
function startOfWeekMonday(d: Date) {
  const day = d.getDay();
  const offset = (day + 6) % 7;
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - offset);
  return out;
}
function parseDateSafe(iso: string | null) {
  if (!iso) return null;
  const dt = new Date(iso.slice(0, 10));
  return isNaN(dt.getTime()) ? null : dt;
}
function hoursFromTimes(start_at: string | null, end_at: string | null) {
  if (!start_at || !end_at) return 2;
  const today = new Date().toISOString().slice(0, 10);
  const s = new Date(`${today}T${start_at.slice(0, 8)}`);
  const e = new Date(`${today}T${end_at.slice(0, 8)}`);
  const ms = e.getTime() - s.getTime();
  return ms > 0 ? Math.round((ms / 36e5) * 10) / 10 : 2;
}
function weekKeyFor(date: Date, termStart: Date) {
  const diffDays = Math.floor((date.getTime() - termStart.getTime()) / 86400000);
  const wk = Math.floor(diffDays / 7);
  return `W${wk}`;
}
function activityKey(r: AllocationRow) {
  return [r.unit_code ?? "", r.activity_type ?? "", r.activity_name ?? ""]
    .filter(Boolean)
    .join(" • ");
}
function activityName(r: AllocationRow) {
  return [r.unit_code ?? "", r.activity_name ?? r.activity_type ?? "Activity"]
    .filter(Boolean)
    .join(" – ");
}

/** Convert table rows -> Timeline activities (scheduled rows only) */
function rowsToTimelineActivities(
  rows: AllocationRow[],
  opts: { termStart: Date; termLabel: string }
): TLActivityRow[] {
  const map = new Map<string, TLActivityRow>();
  for (const r of rows) {
    const isScheduled = r.mode === "scheduled" || (r.mode == null && !!r.session_date);
    if (!isScheduled) continue;
    const date = parseDateSafe(r.session_date);
    if (!date) continue;

    const id = activityKey(r) || String(r.id);
    if (!map.has(id)) {
      map.set(id, {
        id,
        name: activityName(r) || id,
        activityType: r.activity_type ?? undefined,
        paycode: r.paycode_id ?? undefined,
        allocations: {},
      });
    }
    const act = map.get(id)!;
    const wk = weekKeyFor(date, opts.termStart);

    const cell: TLCellAllocation = {
      tutor: labelName(r),
      hours: hoursFromTimes(r.start_at, r.end_at),
      role: r.teaching_role ?? undefined,
      notes: r.location ?? r.note ?? undefined,
    };

    const existing = act.allocations[wk];
    if (!existing) act.allocations[wk] = [cell];
    else act.allocations[wk] = Array.isArray(existing) ? [...existing, cell] : [existing, cell];
  }
  return Array.from(map.values());
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
  // view toggle
  const [viewMode, setViewMode] = useState<"table" | "timeline">("table");

  // data
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AllocationRow[]>([]);
  const [total, setTotal] = useState(0);

  // options
  const [tutors, setTutors] = useState<TutorOption[]>([]);
  const [paycodes, setPaycodes] = useState<PaycodeOption[]>([]);

  // drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<AllocationRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      params.set("mode", tab);
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
  }, [page, limit, tab, q, unitCode, activityType, status]);

  useEffect(() => {
    setPage(1);
    fetchData();
  }, [tab, fetchData]);

  useEffect(() => {
    (async () => {
      try {
        const [t, p] = await Promise.all([
          fetch("/api/admin/tutors").then((r) => r.json()),
          fetch("/api/admin/paycodes").then((r) => r.json()),
        ]);
        setTutors(t.data || []);
        setPaycodes(p.data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

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

  /* ------- Timeline derivations (only meaningful for scheduled tab) ------- */
  const termStart = useMemo(() => {
    const dts = visible
      .map((r) => parseDateSafe(r.session_date))
      .filter((d): d is Date => !!d);
    const min = dts.length ? new Date(Math.min(...dts.map((d) => d.getTime()))) : new Date();
    return startOfWeekMonday(min);
  }, [visible]);

  const weeks: WeekDef[] = useMemo(() => buildWeeksRange(-6, 13, "S1"), []);
  const timelineActivities: TLActivityRow[] = useMemo(
    () => rowsToTimelineActivities(visible, { termStart, termLabel: "S1" }),
    [visible, termStart]
  );

  function onEdit(row: AllocationRow) {
    setActiveRow(row);
    setDrawerOpen(true);
  }

  async function onSave(updated: SavePayload) {
    if (!activeRow) return;

    try {
      const res = await fetch(`/api/admin/allocations/${activeRow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        console.error("Failed to save allocation", await res.text());
        return;
      }

      await fetchData();
    } catch (err) {
      console.error("Error saving allocation", err);
    }
  }

  /** ========= NEW: map tooltip “Edit this allocation” -> open Drawer ========= */
  function handleTimelineCellEdit(args: {
    activity: TLActivityRow;
    week: WeekDef;
    cell: TLCellAllocation[];
  }) {
    // pick the first tutor in the cell stack
    const first = args.cell[0];
    const tutorName = (first?.tutor || "").trim();

    // Find a matching scheduled row by (activityKey, weekKey, tutor display name)
    // activity.name is built via activityName(); activityKey() uses unit+type+name joined by " • "
    const match = scheduledRows.find((r) => {
      const actKey = activityKey(r);
      const wk = r.session_date ? weekKeyFor(new Date(r.session_date.slice(0, 10)), termStart) : "";
      return (
        wk === args.week.key &&
        (labelName(r) === tutorName || tutorName === "") &&
        // Loose match: activity label prefix (unit – activity_name) equals activity.name
        activityName(r) === args.activity.name
      );
    });

    if (match) {
      onEdit(match);
    } else {
      // Fallback: open the first row of that activity in that week (if any)
      const fallback = scheduledRows.find((r) => {
        const wk = r.session_date ? weekKeyFor(new Date(r.session_date.slice(0, 10)), termStart) : "";
        return wk === args.week.key && activityName(r) === args.activity.name;
      });
      if (fallback) onEdit(fallback);
      else console.warn("No matching row found for timeline cell edit:", args);
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

      {/* Scheduled / Unscheduled + View toggle */}
      <div className="mb-3 flex items-center justify-between">
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

        <div className="inline-flex rounded-full border overflow-hidden">
          <button
            className={`px-4 py-1 text-sm ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-white"}`}
            onClick={() => setViewMode("table")}
          >
            Table
          </button>
          <button
            className={`px-4 py-1 text-sm border-l ${viewMode === "timeline" ? "bg-blue-600 text-white" : "bg-white"}`}
            onClick={() => setViewMode("timeline")}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Table or Timeline */}
      {viewMode === "table" || tab === "unscheduled" ? (
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
      ) : (
        /* Timeline (scheduled only) */
        <div className="rounded border">
          <div className="p-3">
            <TimelineView
              title="All Allocations — Timeline"
              weeks={weeks}
              activities={timelineActivities}
              extraColumns={[
                {
                  key: "staffCount",
                  header: "Staff",
                  render: (a) => {
                    const set = new Set(
                      Object.values(a.allocations)
                        .flatMap((v) => (Array.isArray(v) ? v : v ? [v] : []))
                        .map((x) => x.tutor),
                    );
                    return <span className="text-xs">{set.size}</span>;
                  },
                },
                {
                  key: "hoursTotal",
                  header: "Hours",
                  render: (a) => {
                    const sum = Object.values(a.allocations)
                      .flatMap((v) => (Array.isArray(v) ? v : v ? [v] : []))
                      .reduce((acc, x) => acc + (x.hours || 0), 0);
                    return <span className="text-xs">{sum}</span>;
                  },
                },
              ]}
              onCellClick={() => {
                /* optional click behaviour */
              }}
              onCellEdit={handleTimelineCellEdit}
            />
          </div>
        </div>
      )}

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
