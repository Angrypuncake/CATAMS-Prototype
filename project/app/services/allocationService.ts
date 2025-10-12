import axios from "@/lib/axios";
import type {
  SaveAllocationPayload,
  RollbackResponse,
  CommitResponse,
  DiscardResponse,
  PreviewResponse,
  TutorAllocationRow,
} from "@/app/_types/allocations";

type By = {
  id: number | null;
  name: string | null;
  email: string | null;
} | null;

export type Staged = {
  batch_id: number;
  created_at: string;
  status: string;
  row_count: number | null;
  issues: Record<string, number> | null;
  by: By;
};

export type Run = {
  run_id: number;
  batch_id: number;
  started_at: string;
  finished_at: string | null;
  status: "committed" | "rolled_back" | "failed";
  counts: {
    teaching_activity?: number;
    session_occurrence?: number;
    allocation?: number;
  } | null;
  staged_rows: number | null;
  batch_created_at: string;
  by: By;
};

export async function getTutorAllocations(
  userId: string,
  page = 1,
  limit = 10,
): Promise<TutorAllocationRow[]> {
  const res = await axios.get("/tutor/allocations", {
    params: { userId, page, limit },
  });
  return res.data.data;
}

function toDDMMYYYY(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// DB status → UI union type normalization
type UIStatus = TutorAllocationRow["status"]; // "Confirmed" | "Pending" | "Cancelled"
function normalizeStatus(s?: string | null): UIStatus {
  const v = (s ?? "").trim().toLowerCase();

  // Treat as Confirmed
  if (
    v === "confirmed" ||
    v === "approved" ||
    v === "accepted" ||
    v === "allocated" ||
    v === "active" ||
    v === "assigned"
  ) {
    return "Confirmed";
  }

  // Treat as Pending
  if (
    v === "pending" ||
    v === "in_progress" ||
    v === "requested" ||
    v.includes("pending") ||
    v.includes("review") ||
    v.includes("await")
  ) {
    return "Pending";
  }

  // Fallback
  return "Cancelled";
}

function computeHours(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startDate = new Date(0, 0, 0, sh, sm);
  const endDate = new Date(0, 0, 0, eh, em);
  let diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  if (diff < 0) diff += 24;
  return `${diff.toFixed(2)}h`;
}

export async function getAllocationById(
  id: string,
): Promise<TutorAllocationRow> {
  const res = await axios.get(`/tutor/allocations/${encodeURIComponent(id)}`);
  const row = res.data?.data;
  if (!row) throw new Error(`Allocation ${id} not found`);

  return {
    id: row.allocation_id,
    session_date: row.session_date,
    start_at: row.start_at,
    end_at: row.end_at,
    unit_code: row.unit_code,
    unit_name: row.unit_name,
    activity_name: row.activity_name,
    activity_type: row.activity_type,
    location: row.location,
    status: row.status,
    note: row.note,
    allocated_hours: row.hours,
    paycode_id: row.paycode_id,
  };
}

/**
 * Higher-level formatter that wraps getAllocationById
 * and returns a ready-to-display object.
 */
export async function getFormattedAllocationById(
  id: string,
): Promise<TutorAllocationRow> {
  const a = await getAllocationById(id);
  return {
    id: a.id,
    unit_code: a.unit_code ?? "—",
    unit_name: a.unit_name ?? "—",
    status: normalizeStatus(a.status),
    session_date: toDDMMYYYY(a.session_date),
    start_at: a.start_at,
    end_at: a.end_at,
    location: a.location ?? "—",
    allocated_hours: computeHours(a.start_at, a.end_at),
    activity_name: a.activity_name ?? "—",
    activity_type: a.activity_type ?? "—",
    note: a.note ?? undefined,
    paycode_id: a.paycode_id ?? "—",
  };
}

export async function getAllocationsByUnit(
  unitCode: string,
  page = 1,
  limit = 50,
): Promise<TutorAllocationRow[]> {
  const res = await axios.get("/admin/allocations", {
    params: { unit_code: unitCode, page, limit },
  });
  return res.data.data;
}

// Create a new allocation Admin, UnitCoordinator only

// Update an existing allocation

// Delete an allocation

// Update allocation status

/* ------------------ ADMIN ------------------ */
export async function getAdminAllocations(params: {
  page?: number;
  limit?: number;
  tab?: string;
  q?: string;
  unitCode?: string;
  activityType?: string;
  status?: string;
}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.tab) search.set("mode", params.tab);
  if (params.q) search.set("q", params.q);
  if (params.unitCode) search.set("unit_code", params.unitCode);
  if (params.activityType) search.set("activity_type", params.activityType);
  if (params.status) search.set("status", params.status);

  const res = await axios.get(`/admin/allocations?${search.toString()}`);
  return res.data;
}

export async function patchAdminAllocation(
  id: string | number,
  updated: SaveAllocationPayload,
) {
  const res = await axios.patch(`/admin/allocations/${id}`, updated);
  return res.data;
}

// IMPORT pipeline

export async function importAdminData(fd: FormData) {
  const res = await axios.post("/admin/import", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function rollbackRun(runId: number): Promise<RollbackResponse> {
  const res = await axios.post<RollbackResponse>("/admin/rollback", { runId });
  return res.data;
}

export async function commitImport(stagingId: number): Promise<CommitResponse> {
  const res = await axios.post<CommitResponse>("/admin/import/commit", {
    stagingId,
  });
  return res.data;
}

export async function discardImport(
  stagingId: number,
): Promise<DiscardResponse> {
  const res = await axios.post<DiscardResponse>("/admin/discard", {
    stagingId,
  });
  return res.data;
}

export async function getPreview(stagingId: number): Promise<PreviewResponse> {
  const res = await axios.get<PreviewResponse>(`/admin/preview`, {
    params: { stagingId },
    // optional: disable cache via headers
    headers: { "Cache-Control": "no-store" },
  });
  return res.data;
}

export async function getImportHistory(limit = 100): Promise<{
  staged: Staged[];
  runs: Run[];
}> {
  const res = await axios.get(`/admin/history`, {
    params: { limit },
    headers: { "Cache-Control": "no-store" },
  });
  return res.data;
}
