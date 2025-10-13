import { AllocationRow } from "./types";
import { Dow } from "@/app/_types/allocations";

export function pad2(n: number) {
  return n.toString().padStart(2, "0");
}
export function toDisplayTime(hhmmss: string | null) {
  if (!hhmmss) return "";
  const [hh, mm] = hhmmss.split(":").map((t) => parseInt(t, 10));
  const ampm = hh >= 12 ? "PM" : "AM";
  const hr = ((hh + 11) % 12) + 1;
  return `${pad2(hr)}:${pad2(mm)} ${ampm}`;
}
export function toInputTime(hhmmss: string | null) {
  if (!hhmmss) return "";
  const [hh, mm] = hhmmss.split(":");
  return `${hh}:${mm}`;
}
export function fromInputTime(hhmm: string) {
  if (!hhmm) return null;
  const [hh, mm] = hhmm.split(":");
  return `${pad2(parseInt(hh, 10))}:${pad2(parseInt(mm, 10))}:00`;
}
export function toInputDate(isoDate: string | null) {
  if (!isoDate) return "";
  return isoDate.substring(0, 10);
}

export function labelName(
  row: Pick<AllocationRow, "first_name" | "last_name">,
) {
  const fn = row.first_name ?? "";
  const ln = row.last_name ?? "";
  return `${fn} ${ln}`.trim() || "—";
}

export function isoDateToDow(iso: string | null | undefined): Dow | "" {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const js = new Date(y, m - 1, d).getDay(); // local, but using exact parts
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

// Time line helpers

/* ======================= rows -> timeline helpers ======================= */
export function startOfWeekMonday(d: Date) {
  const day = d.getDay();
  const offset = (day + 6) % 7;
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - offset);
  return out;
}
export function parseDateSafe(iso: string | null) {
  if (!iso) return null;
  const dt = new Date(iso.slice(0, 10));
  return isNaN(dt.getTime()) ? null : dt;
}
export function hoursFromTimes(start_at: string | null, end_at: string | null) {
  if (!start_at || !end_at) return 2;
  const today = new Date().toISOString().slice(0, 10);
  const s = new Date(`${today}T${start_at.slice(0, 8)}`);
  const e = new Date(`${today}T${end_at.slice(0, 8)}`);
  const ms = e.getTime() - s.getTime();
  return ms > 0 ? Math.round((ms / 36e5) * 10) / 10 : 2;
}
export function weekKeyFor(date: Date, termStart: Date) {
  const diffDays = Math.floor(
    (date.getTime() - termStart.getTime()) / 86400000,
  );
  const wk = Math.floor(diffDays / 7);
  return `W${wk}`;
}
export function activityKey(r: AllocationRow) {
  return [r.unit_code ?? "", r.activity_type ?? "", r.activity_name ?? ""]
    .filter(Boolean)
    .join(" • ");
}
export function activityName(r: AllocationRow) {
  return [r.unit_code ?? "", r.activity_name ?? r.activity_type ?? "Activity"]
    .filter(Boolean)
    .join(" – ");
}

import { ActivityRow, CellAllocation } from "./components/TimelineView";
/** Convert table rows -> Timeline activities (scheduled rows only) */
export function rowsToTimelineActivities(
  rows: AllocationRow[],
  opts: { termStart: Date; termLabel: string },
): ActivityRow[] {
  const map = new Map<string, ActivityRow>();
  for (const r of rows) {
    const isScheduled =
      r.mode === "scheduled" || (r.mode == null && !!r.session_date);
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

    const cell: CellAllocation = {
      tutor: labelName(r),
      hours: hoursFromTimes(r.start_at, r.end_at),
      role: r.teaching_role ?? undefined,
      notes: r.location ?? r.note ?? undefined,
    };

    const existing = act.allocations[wk];
    if (!existing) act.allocations[wk] = [cell];
    else
      act.allocations[wk] = Array.isArray(existing)
        ? [...existing, cell]
        : [existing, cell];
  }
  return Array.from(map.values());
}
