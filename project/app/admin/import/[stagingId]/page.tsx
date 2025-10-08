"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { commitImport, discardImport } from "@/app/services/allocationService";

/** ---------- Types ---------- */
type TimetableRow = {
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM(:SS)
  end_time: string; // HH:MM(:SS)
  activity_name: string;
  activity_type: string;
  activity_description: string | null;
  staff_id: string | null;
  staff_name: string | null;
  row_count: number;
  total_hours: number | null;
};

type PreviewPayload = {
  stagingId: number;
  preview: {
    raw: unknown[];
    issues: Record<string, number>;
    timetable: TimetableRow[];
  };
};

type ErrorResponse = { error: string };
type CommitResponse = { inserted: unknown };

/** ---------- Safe helpers / type guards ---------- */
const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object";

const hasError = (v: unknown): v is ErrorResponse =>
  isObject(v) && typeof v.error === "string";

const hasInserted = (v: unknown): v is CommitResponse =>
  isObject(v) && "inserted" in v;

const isPreviewPayload = (v: unknown): v is PreviewPayload =>
  isObject(v) &&
  typeof v.stagingId === "number" &&
  isObject(v.preview) &&
  Array.isArray(v.preview.raw) &&
  isObject(v.preview.issues) &&
  Array.isArray(v.preview.timetable);

/** ---------- Small UI helpers ---------- */
function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
}) {
  const map: Record<string, string> = {
    neutral: "bg-gray-100 text-gray-700",
    good: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-800",
    bad: "bg-rose-100 text-rose-700",
    info: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[tone]}`}
    >
      {children}
    </span>
  );
}

function Button({
  children,
  tone = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "danger" | "neutral";
}) {
  const map: Record<string, string> = {
    primary:
      "bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:hover:bg-emerald-600",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:hover:bg-rose-600",
    neutral:
      "bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:opacity-50 disabled:hover:bg-gray-200",
  };
  return (
    <button
      type="button"
      className={`px-3 py-2 rounded-md text-sm font-medium transition ${map[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="py-2 pr-4">
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </td>
      ))}
    </tr>
  );
}

/** ---------- Time & date utils (robust) ---------- */
const SYD_TZ = "Australia/Sydney"; // ensure consistent labels client-side

function safeInt(x: string | undefined) {
  const n = Number.parseInt(String(x ?? ""), 10);
  return Number.isFinite(n) ? n : NaN;
}

function timeToMinutes(s: string | null | undefined): number {
  // accepts HH:MM or HH:MM:SS; returns NaN if malformed
  if (!s || typeof s !== "string") return NaN;
  const parts = s.split(":");
  const h = safeInt(parts[0]);
  const m = safeInt(parts[1]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
  const hh = Math.max(0, Math.min(24, h));
  const mm = Math.max(0, Math.min(59, m));
  return hh * 60 + mm;
}

function minutesToLabel(mins: number) {
  if (!Number.isFinite(mins)) return "--:--";
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const mi = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
}

const dateFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: SYD_TZ,
});

function dateLabel(iso: string) {
  try {
    const [y, mo, d] = iso.split("-").map((x) => Number.parseInt(x, 10));
    if (!y || !mo || !d) return iso;
    const dt = new Date(Date.UTC(y, mo - 1, d));
    return dateFmt.format(dt);
  } catch {
    return iso;
  }
}

/** ---------- Page ---------- */
export default function PreviewPage() {
  const params = useParams<{ stagingId: string }>();
  const router = useRouter();
  const id = Number(params?.stagingId ?? NaN);

  const [data, setData] = useState<PreviewPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string>("");
  const [rawOpen, setRawOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof TimetableRow | "">("");
  const [sortAsc, setSortAsc] = useState(true);

  // UI: table vs timetable
  const [view, setView] = useState<"table" | "timetable">("timetable");
  const [groupBy, setGroupBy] = useState<"date" | "staff">("date");

  const discardRef = useRef<HTMLDialogElement>(null);
  const commitRef = useRef<HTMLDialogElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Guard bad id
  useEffect(() => {
    if (Number.isNaN(id) || id <= 0) setMsg("Invalid batch id");
  }, [id]);

  // Load preview with abort safety
  useEffect(() => {
    if (!id || Number.isNaN(id)) return;
    const ctrl = new AbortController();
    const run = async () => {
      setLoading(true);
      setMsg("");
      try {
        const res = await fetch(`/api/admin/preview?stagingId=${id}`, {
          cache: "no-store",
          signal: ctrl.signal,
        });
        const ct = res.headers.get("content-type") || "";
        const payload: unknown = ct.includes("application/json")
          ? await res.json()
          : await res.text();

        if (!res.ok) {
          const message =
            typeof payload === "string"
              ? payload
              : hasError(payload)
                ? payload.error
                : "Failed to load preview";
          throw new Error(message);
        }

        if (mountedRef.current) {
          if (isPreviewPayload(payload)) {
            setData(payload);
          } else {
            setMsg("Unexpected response format.");
          }
        }
      } catch (e: unknown) {
        const m = e instanceof Error ? e.message : String(e);
        if (m !== "AbortError" && mountedRef.current)
          setMsg(m || "Failed to load preview");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    run();
    return () => ctrl.abort();
  }, [id]);

  const issues = data?.preview.issues || {};
  const missingUnit = Number(issues["missing_unit_code"] ?? 0);
  const missingAct = Number(issues["missing_activity_name"] ?? 0);
  const missingDate = Number(issues["missing_date"] ?? 0);
  const missingTimes = Number(issues["missing_times"] ?? 0);

  const totalRows = data?.preview.raw?.length ?? 0;
  const totalSlots = data?.preview.timetable?.length ?? 0;

  /** ---------- Filter + sort (table) ---------- */
  function cmp<T extends string | number | null | undefined>(
    a: T,
    b: T,
  ): number {
    if (a === b) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    if (typeof a === "string" && typeof b === "string")
      return a.localeCompare(b);
    return a > b ? 1 : -1;
  }

  // scrub invalid time rows once here so all views are safer
  const cleanTimetable: TimetableRow[] = useMemo(() => {
    if (!data) return [];
    return data.preview.timetable.filter(
      (r) =>
        Number.isFinite(timeToMinutes(r.start_time)) &&
        Number.isFinite(timeToMinutes(r.end_time)),
    );
  }, [data]);

  const filteredTimetable = useMemo<TimetableRow[]>(() => {
    if (!cleanTimetable.length) return [];
    const q = filter.trim().toLowerCase();
    let rows = cleanTimetable;
    if (q) {
      rows = rows.filter(
        (r) =>
          r.activity_name.toLowerCase().includes(q) ||
          (r.activity_type || "").toLowerCase().includes(q) ||
          (r.activity_description || "").toLowerCase().includes(q) ||
          (r.staff_name || "").toLowerCase().includes(q) ||
          (r.staff_id || "").toLowerCase().includes(q) ||
          r.date.toLowerCase().includes(q),
      );
    }

    if (sortKey) {
      const key = sortKey as keyof TimetableRow;
      rows = [...rows].sort((a, b) => cmp(a[key], b[key]) * (sortAsc ? 1 : -1));
    }
    return rows;
  }, [cleanTimetable, filter, sortKey, sortAsc]);

  function toggleSort(key: keyof TimetableRow) {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  /** ---------- Overlap detection (blocking) ---------- */
  function intervalsOverlap(
    aStart: string,
    aEnd: string,
    bStart: string,
    bEnd: string,
  ) {
    const as = timeToMinutes(aStart),
      ae = timeToMinutes(aEnd);
    const bs = timeToMinutes(bStart),
      be = timeToMinutes(bEnd);
    if (![as, ae, bs, be].every(Number.isFinite)) return false;
    return (
      Math.max(as as number, bs as number) <
      Math.min(ae as number, be as number)
    );
  }

  const conflicts = useMemo(() => {
    type C = { date: string; staff: string; a: TimetableRow; b: TimetableRow };
    const res: C[] = [];
    if (!cleanTimetable.length) return res;

    const groups = new Map<string, TimetableRow[]>();
    for (const r of cleanTimetable) {
      const staff = (r.staff_name || r.staff_id || "Unassigned").toString();
      const key = `${r.date}__${staff}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }

    for (const [key, rows] of groups) {
      const [date, staff] = key.split("__");
      const sorted = rows
        .slice()
        .sort(
          (x, y) => timeToMinutes(x.start_time) - timeToMinutes(y.start_time),
        );
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        if (
          intervalsOverlap(
            prev.start_time,
            prev.end_time,
            curr.start_time,
            curr.end_time,
          )
        ) {
          res.push({ date, staff, a: prev, b: curr });
        }
      }
    }
    return res;
  }, [cleanTimetable]);

  const conflictCount = conflicts.length;

  const hasBlocking =
    missingUnit + missingAct + missingDate > 0 || conflictCount > 0;

  /** ---------- Mutations ---------- */
  async function onCommit() {
    if (conflictCount > 0) {
      setMsg(
        `❌ Cannot commit: ${conflictCount} timetable conflict${
          conflictCount > 1 ? "s" : ""
        } detected. Resolve overlaps first.`,
      );
      return;
    }

    setBusy(true);
    setMsg("");

    try {
      const data = await commitImport(id);

      const { teaching_activity, session_occurrence, allocation } =
        data.inserted;
      setMsg(
        `✅ Committed. 
         Inserted → teaching_activity=${teaching_activity}, 
         session_occurrence=${session_occurrence}, 
         allocation=${allocation}`,
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setMsg(`❌ ${message || "Commit failed"}`);
    } finally {
      setBusy(false);
    }
  }

  async function onDiscard() {
    setBusy(true);
    setMsg("");
    try {
      const data = await discardImport(id);
      if ("error" in data) {
        setMsg(`❌ ${data.error}${data.detail ? ` – ${data.detail}` : ""}`);
        return;
      }
      setMsg("🗑️ Discarded successfully.");
      router.push("/admin/import");
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      setMsg(`❌ ${m || "Discard failed"}`);
    } finally {
      setBusy(false);
    }
  }

  function copyId() {
    navigator.clipboard.writeText(String(id)).then(
      () => setMsg("Copied batch id"),
      () => setMsg("Failed to copy batch id"),
    );
  }

  /** ---------- Timetable (visual) helpers ---------- */
  const groupedByDate = useMemo(() => {
    const map = new Map<string, TimetableRow[]>();
    for (const r of filteredTimetable) {
      if (!map.has(r.date)) map.set(r.date, []);
      map.get(r.date)!.push(r);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, rows]) => ({ date, rows }));
  }, [filteredTimetable]);

  const groupedByStaff = useMemo(() => {
    const map = new Map<string, TimetableRow[]>();
    for (const r of filteredTimetable) {
      const key = (r.staff_name || r.staff_id || "Unassigned").toString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([staff, rows]) => ({ staff, rows }));
  }, [filteredTimetable]);

  function computeExtent(rows: TimetableRow[]) {
    const validStarts = rows
      .map((r) => timeToMinutes(r.start_time))
      .filter((n) => Number.isFinite(n)) as number[];
    const validEnds = rows
      .map((r) => timeToMinutes(r.end_time))
      .filter((n) => Number.isFinite(n)) as number[];
    let min = validStarts.length ? Math.min(...validStarts) : 8 * 60;
    let max = validEnds.length ? Math.max(...validEnds) : 18 * 60;
    if (max - min > 14 * 60) max = min + 14 * 60;
    min = Math.floor(min / 30) * 30;
    max = Math.ceil(max / 30) * 30;
    return { min, max };
  }

  function blockStyle(start: string, end: string, min: number, max: number) {
    const s = timeToMinutes(start);
    const e = timeToMinutes(end);
    const total = Math.max(1, max - min);
    const span =
      Number.isFinite(s) && Number.isFinite(e) ? Math.max(0, e - s) : 0;
    const leftPct = Number.isFinite(s)
      ? Math.max(0, Math.min(100, ((s - min) / total) * 100))
      : 0;
    const widthPct = Math.max(1, Math.min(100, (span / total) * 100));
    return {
      left: `${leftPct}%`,
      width: `${widthPct}%`,
    } as React.CSSProperties;
  }

  function collide(a: TimetableRow, b: TimetableRow) {
    const as = timeToMinutes(a.start_time);
    const ae = timeToMinutes(a.end_time);
    const bs = timeToMinutes(b.start_time);
    const be = timeToMinutes(b.end_time);
    if (![as, ae, bs, be].every((n) => Number.isFinite(n))) return false;
    return Math.max(as, bs) < Math.min(ae, be);
  }

  function assignLanes(rows: TimetableRow[]) {
    const sorted = [...rows].sort(
      (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time),
    );
    const lanes: TimetableRow[][] = [];
    const placement: Array<{ r: TimetableRow; lane: number }> = [];
    for (const r of sorted) {
      let placed = false;
      for (let i = 0; i < lanes.length; i++) {
        const last = lanes[i][lanes[i].length - 1];
        if (!collide(last, r)) {
          lanes[i].push(r);
          placement.push({ r, lane: i });
          placed = true;
          break;
        }
      }
      if (!placed) {
        lanes.push([r]);
        placement.push({ r, lane: lanes.length - 1 });
      }
    }
    return { lanesCount: lanes.length, placement };
  }

  /** ---------- Render ---------- */
  return (
    <main className="p-6 md:p-8 space-y-6">
      {/* Sticky action bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-semibold">
              Preview Import — Batch #{id}
            </h1>
            <button
              onClick={copyId}
              type="button"
              className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              title="Copy batch id"
            >
              Copy
            </button>
            <div className="hidden md:flex items-center gap-2">
              <Pill tone={hasBlocking ? "bad" : "good"}>
                {hasBlocking ? "Blocking issues" : "No blocking issues"}
              </Pill>
              <Pill tone="info">{totalRows} raw rows</Pill>
              <Pill tone="neutral">{totalSlots} timetable slots</Pill>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 mr-3">
              <button
                className={`rounded-md px-2 py-1 text-sm ${
                  view === "timetable"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setView("timetable")}
              >
                Timetable
              </button>
              <button
                className={`rounded-md px-2 py-1 text-sm ${
                  view === "table" ? "bg-gray-900 text-white" : "bg-gray-200"
                }`}
                onClick={() => setView("table")}
              >
                Table
              </button>
            </div>
            <Button
              tone="neutral"
              type="button"
              onClick={() => router.push("/admin/import")}
              disabled={busy}
            >
              Import New
            </Button>
            <Button
              tone="neutral"
              onClick={() => location.reload()}
              disabled={busy || loading}
            >
              Reload
            </Button>
            <Button
              tone="danger"
              type="button"
              onClick={() => discardRef.current?.showModal()}
              disabled={busy}
            >
              Discard
            </Button>
            <Button
              type="button"
              tone="primary"
              onClick={() => commitRef.current?.showModal()}
              disabled={busy || hasBlocking}
              title={
                hasBlocking
                  ? conflictCount
                    ? "Resolve timetable conflicts before commit"
                    : "Fix blocking issues before commit"
                  : ""
              }
            >
              Commit
            </Button>
          </div>
        </div>
      </div>

      {/* Status / messages */}
      {msg && (
        <div className="text-sm rounded-md border p-3 bg-gray-50">{msg}</div>
      )}

      {/* Validation panel */}
      <section className="border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Validation</h2>
          <div className="flex gap-2">
            <Pill tone={missingUnit ? "bad" : "good"}>
              missing_unit_code: {missingUnit}
            </Pill>
            <Pill tone={missingAct ? "bad" : "good"}>
              missing_activity_name: {missingAct}
            </Pill>
            <Pill tone={missingDate ? "bad" : "good"}>
              missing_date: {missingDate}
            </Pill>
            <Pill tone={missingTimes ? "warn" : "good"}>
              missing_times: {missingTimes}
            </Pill>
            <Pill tone={conflictCount ? "bad" : "good"}>
              conflicts: {conflictCount}
            </Pill>
          </div>
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded max-h-52 overflow-auto">
          {JSON.stringify(issues, null, 2)}
        </pre>

        {conflictCount > 0 && (
          <div className="mt-3 text-xs">
            <div className="font-medium mb-1">Conflicts detected:</div>
            <ul className="list-disc ml-5 space-y-1">
              {conflicts.slice(0, 10).map((c, i) => (
                <li key={i}>
                  {dateLabel(c.date)} · {c.staff}: “{c.a.activity_name}”{" "}
                  {c.a.start_time.slice(0, 5)}–{c.a.end_time.slice(0, 5)}{" "}
                  overlaps “{c.b.activity_name}” {c.b.start_time.slice(0, 5)}–
                  {c.b.end_time.slice(0, 5)}
                </li>
              ))}
              {conflictCount > 10 && <li>…and {conflictCount - 10} more</li>}
            </ul>
          </div>
        )}
      </section>

      {/* Controls shared */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">View</label>
          <select
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
            value={view}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setView(e.target.value === "table" ? "table" : "timetable")
            }
          >
            <option value="timetable">Timetable</option>
            <option value="table">Table</option>
          </select>
          {view === "timetable" && (
            <>
              <label className="ml-3 text-sm font-medium">Group by</label>
              <select
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                value={groupBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setGroupBy(e.target.value === "staff" ? "staff" : "date")
                }
              >
                <option value="date">Date</option>
                <option value="staff">Staff</option>
              </select>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="Filter by activity / staff / date…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </section>

      {/* Timetable visual view */}
      {view === "timetable" && (
        <section className="space-y-6">
          {groupedByDate.map(({ date, rows }) => {
            const { min, max } = computeExtent(rows);
            const hours: number[] = [];
            for (let t = min; t <= max; t += 60) hours.push(t);
            const { lanesCount, placement } = assignLanes(rows);
            return (
              <div key={date} className="border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                  <h3 className="font-medium">{dateLabel(date)}</h3>
                  <div className="text-xs text-gray-600">
                    {minutesToLabel(min)}–{minutesToLabel(max)} · {rows.length}{" "}
                    slots
                  </div>
                </div>

                {/* Grid header */}
                <div className="relative">
                  <div
                    className="grid"
                    style={{ gridTemplateColumns: "12rem 1fr" }}
                  >
                    <div className="border-r bg-white px-3 py-2 text-xs font-medium text-gray-700">
                      Staff Lanes
                    </div>
                    <div className="relative">
                      <div className="flex text-[11px] text-gray-500">
                        {hours.map((h) => (
                          <div
                            key={h}
                            className="relative border-l border-gray-200 flex-1 text-center py-2"
                          >
                            {minutesToLabel(h)}
                            <div className="absolute left-1/2 top-full h-3 w-px bg-gray-200" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Rows per lane */}
                  <div
                    className="grid"
                    style={{ gridTemplateColumns: "12rem 1fr" }}
                  >
                    {/* Left rail: lane labels */}
                    <div className="border-r">
                      {Array.from({ length: Math.max(lanesCount, 1) }).map(
                        (_, i) => (
                          <div
                            key={i}
                            className="h-16 border-b px-3 py-2 text-xs text-gray-600 flex items-center"
                          >
                            Lane {i + 1}
                          </div>
                        ),
                      )}
                    </div>

                    {/* Right: timeline rows */}
                    <div className="relative">
                      {/* vertical hour lines */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="flex h-full">
                          {hours.map((h, idx) => (
                            <div
                              key={h}
                              className={`flex-1 ${idx !== 0 ? "border-l" : ""} border-gray-100`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* lane rows */}
                      {Array.from({ length: Math.max(lanesCount, 1) }).map(
                        (_, lane) => (
                          <div
                            key={lane}
                            className="relative h-16 border-b border-gray-100"
                          >
                            {placement
                              .filter((p) => p.lane === lane)
                              .map(({ r }) => {
                                const style = blockStyle(
                                  r.start_time,
                                  r.end_time,
                                  min,
                                  max,
                                );
                                const conflict = rows.some(
                                  (x) =>
                                    x !== r &&
                                    (x.staff_id === r.staff_id ||
                                      x.staff_name === r.staff_name) &&
                                    collide(x, r),
                                );
                                return (
                                  <div
                                    key={`${r.activity_name}-${r.start_time}-${r.end_time}-${r.staff_id}-${r.date}`}
                                    className={`absolute top-1 bottom-1 rounded-md px-2 py-1 overflow-hidden shadow-sm ${
                                      conflict
                                        ? "bg-rose-100 ring-1 ring-rose-300"
                                        : "bg-emerald-100 ring-1 ring-emerald-300"
                                    }`}
                                    style={style}
                                    title={`${r.activity_name} • ${r.activity_type} • ${
                                      r.staff_name || r.staff_id || "Unassigned"
                                    } • ${r.start_time.slice(0, 5)}–${r.end_time.slice(0, 5)}`}
                                  >
                                    <div className="text-[11px] font-medium truncate">
                                      {r.activity_name}
                                    </div>
                                    <div className="text-[10px] text-gray-700 truncate">
                                      {(
                                        r.staff_name ||
                                        r.staff_id ||
                                        "Unassigned"
                                      ).toString()}{" "}
                                      · {r.start_time.slice(0, 5)}–
                                      {r.end_time.slice(0, 5)}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-emerald-200 ring-1 ring-emerald-300" />{" "}
                    OK
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-rose-200 ring-1 ring-rose-300" />{" "}
                    Conflict (same staff overlapping)
                  </span>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Table view */}
      {view === "table" && (
        <section className="border rounded-xl p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-medium">Timetable (table)</h2>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  {(
                    [
                      ["date", "Date"],
                      ["start_time", "Start"],
                      ["end_time", "End"],
                      ["activity_name", "Activity"],
                      ["activity_type", "Type"],
                      ["staff", "Staff"],
                      ["row_count", "Rows"],
                      ["total_hours", "Hours"],
                    ] as const
                  ).map(([key, label]) => {
                    const k =
                      key === "staff" ? "" : (key as keyof TimetableRow | "");
                    const active = k && sortKey === k;
                    return (
                      <th
                        key={key}
                        className={`py-2 pr-4 font-medium ${
                          k ? "cursor-pointer select-none" : ""
                        }`}
                        onClick={k ? () => toggleSort(k) : undefined}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {active && (
                            <span className="text-xs">
                              {sortAsc ? "▲" : "▼"}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                )}
                {!loading &&
                  filteredTimetable.map((r, i) => (
                    <tr
                      key={`${r.date}-${r.start_time}-${r.end_time}-${r.activity_name}-${i}`}
                      className="border-b"
                    >
                      <td className="py-2 pr-4">{r.date}</td>
                      <td className="py-2 pr-4">{r.start_time}</td>
                      <td className="py-2 pr-4">{r.end_time}</td>
                      <td className="py-2 pr-4">{r.activity_name}</td>
                      <td className="py-2 pr-4">{r.activity_type}</td>
                      <td className="py-2 pr-4">
                        {r.staff_name || r.staff_id || "—"}
                      </td>
                      <td className="py-2 pr-4">{r.row_count}</td>
                      <td className="py-2 pr-4">{r.total_hours ?? "—"}</td>
                    </tr>
                  ))}
                {!loading && filteredTimetable.length === 0 && (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={8}>
                      No rows match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Raw sample (collapsible) */}
      <section className="border rounded-xl">
        <button
          className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50"
          type="button"
          onClick={() => setRawOpen((v) => !v)}
        >
          <span className="font-medium">Raw Sample (first 100 rows)</span>
          <span className="text-sm">{rawOpen ? "Hide ▲" : "Show ▼"}</span>
        </button>
        {rawOpen && (
          <div className="p-4 pt-0">
            {loading ? (
              <div className="p-3 text-sm text-gray-500">Loading…</div>
            ) : (
              <pre className="text-xs overflow-auto max-h-96 bg-gray-50 p-3 rounded">
                {JSON.stringify(
                  (data?.preview.raw ?? []).slice(0, 100),
                  null,
                  2,
                )}
              </pre>
            )}
          </div>
        )}
      </section>

      {/* Confirm dialogs */}
      <dialog ref={discardRef} className="rounded-xl p-0">
        <div className="p-5 w-80">
          <h3 className="font-semibold mb-2">Discard this batch?</h3>
          <p className="text-sm text-gray-600 mb-4">
            This will remove all staged rows for batch #{id}. This action cannot
            be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              tone="neutral"
              type="button"
              onClick={() => discardRef.current?.close()}
            >
              Cancel
            </Button>
            <Button
              tone="danger"
              type="button"
              onClick={() => {
                discardRef.current?.close();
                onDiscard();
              }}
              disabled={busy}
            >
              Discard
            </Button>
          </div>
        </div>
      </dialog>

      <dialog ref={commitRef} className="rounded-xl p-0">
        <div className="p-5 w-80">
          <h3 className="font-semibold mb-2">Commit this batch?</h3>
          <p className="text-sm text-gray-600 mb-4">
            We’ll run the ETL and upsert data into normalized tables. Make sure
            validation looks good.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              tone="neutral"
              onClick={() => commitRef.current?.close()}
            >
              Cancel
            </Button>
            <Button
              type="button"
              tone="primary"
              onClick={() => {
                commitRef.current?.close();
                onCommit();
              }}
              disabled={busy || hasBlocking}
              title={
                hasBlocking
                  ? conflictCount
                    ? "Resolve timetable conflicts before commit"
                    : "Fix blocking issues before commit"
                  : ""
              }
            >
              Commit
            </Button>
          </div>
        </div>
      </dialog>
    </main>
  );
}
