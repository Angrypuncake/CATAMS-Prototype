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
