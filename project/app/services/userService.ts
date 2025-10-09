import axios from "@/lib/axios";
import type { Tutor } from "@/app/_types/tutor";

export async function getTutors(page = 1, limit = 50) {
  const res = await axios.get("/admin/tutors", { params: { page, limit } });
  return res.data.data as Tutor[];
}

/**
 * Fetch all tutors (optionally filtered by unit_code)
 *
 * @param unitCode - Optional unit code (e.g. "INFO1111")
 * @returns Array of Tutor objects
 */
export async function getTutorsByUnit(unitCode: string): Promise<Tutor[]> {
  const res = await axios.get("/admin/tutors", {
    params: { unit_code: unitCode },
  });
  return res.data.data as Tutor[];
}

export async function getTutorById(id: string | number): Promise<Tutor> {
  const res = await axios.get(`/admin/tutors/${id}`);
  return res.data.data as Tutor;
}

// Returns general user info by id, not tutor related
export async function getUserById(id: number) {
  const res = await axios.get(`/api/users/${id}`);
  return res.data;
}

export async function getUserRoles(id: number) {
  const res = await axios.get(`/api/users/${id}/roles`);
  return res.data.data;
}
