import axios from "@/lib/axios";

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
