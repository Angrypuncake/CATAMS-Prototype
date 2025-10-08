import axios from "@/lib/axios";
import type {
  SaveAllocationPayload,
  RollbackResponse,
  CommitResponse,
  DiscardResponse,
  PreviewResponse,
} from "@/app/_types/allocations";

export interface Allocation {
  id: string;
  unit_code: string;
  unit_name: string;
  status: string;
  session_date: string | null;
  start_at: string | null;
  end_at: string | null;
  location: string | null;
  activity_name: string | null;
}

export async function getTutorAllocations(
  userId: string,
  page = 1,
  limit = 10,
): Promise<Allocation[]> {
  const res = await axios.get("/tutor/allocations", {
    params: { userId, page, limit },
  });
  return res.data.data;
}

export async function getAllocationsByUnit(
  unitCode: string,
  page = 1,
  limit = 50,
): Promise<Allocation[]> {
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
