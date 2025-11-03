import { RequestRow } from "@/app/_types/request";

export const timeConverter = (time: string): number => {
  const hours = parseInt(time.split(":")[0], 10);
  const minutes = parseInt(time.split(":")[1], 10);

  return hours * 60 + minutes;
};

export function hoursBetween(start?: string | null, end?: string | null): number | string {
  if (!start || !end) return 0;
  const [sh, sm, ss] = start.split(":").map(Number);
  const [eh, em, es] = end.split(":").map(Number);
  const a = new Date(0, 0, 0, sh || 0, sm || 0, ss || 0);
  const b = new Date(0, 0, 0, eh || 0, em || 0, es || 0);
  let diff = (b.getTime() - a.getTime()) / (1000 * 60 * 60);
  if (diff < 0) diff += 24;
  return Number(diff.toFixed(2));
}

export function toDate(dateStr?: string | null, time?: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  if (time) {
    const [h, m, s] = time.split(":").map(Number);
    // Treat incoming ISO as UTC so comparisons are stable
    d.setUTCHours(h || 0, m || 0, s || 0, 0);
  }
  return d;
}

export function niceTime(hms?: string | null) {
  if (!hms) return "—";
  // Handle both ISO datetime strings and HH:MM:SS format
  if (hms.includes("T")) return hms.slice(11, 16);
  return hms.slice(0, 5); // HH:MM
}

export function mapToRequestRow(r: RequestRow): RequestRow {
  return {
    requestId: r.requestId,
    type: r.type,
    relatedSession: r.relatedSession,
    status: formatStatus(r.status),
    actions: "View/Edit",
    reason: r.reason,
    createdAt: r.createdAt,
  };
}

function formatStatus(status: string): string {
  switch (status) {
    case "pending_uc":
      return "Pending (Unit Coordinator)";
    case "pending_ta":
      return "Pending (Teaching Assistant)";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}
