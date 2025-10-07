import api from "@/lib/axios";
import type { Tutor } from "@/app/_types/tutor";

export async function getTutors(page = 1, limit = 50) {
  const res = await api.get("/admin/tutors", { params: { page, limit } });
  return res.data.data as Tutor[];
}

/**
 * Fetch all tutors (optionally filtered by unit_code)
 *
 * @param unitCode - Optional unit code (e.g. "INFO1111")
 * @returns Array of Tutor objects
 */
export async function getTutorsByUnit(unitCode: string): Promise<Tutor[]> {
  const res = await api.get("/admin/tutors", {
    params: { unit_code: unitCode },
  });
  return res.data.data as Tutor[];
}
