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

export async function getAdminOverview() {
  const res = await axios.get("/admin/overview");
  return res.data;
}

export async function getBudgetOverview(
  year: number,
  session: string,
  threshold: number,
) {
  const res = await axios.get("/uc/overview", {
    params: { year, session, threshold },
  });
  return res.data;
}
export async function getTutorById(id: string | number): Promise<Tutor> {
  const res = await axios.get(`/admin/tutors/${id}`);
  return res.data.data as Tutor;
}

// Returns general user info by id, not tutor related by user id
export async function getUserById(id: number) {
  const res = await axios.get(`/users/${id}`);
  return res.data;
}

// Get all the roles details for this user  by user id
export async function getUserRoles(id: number) {
  const res = await axios.get(`/users/${id}/roles`);
  return res.data.data;
}

// Get all of the units that this user is in by user id
export async function getUserUnits(id: number) {
  const res = await axios.get(`/users/${id}/units`);
  return res.data.data;
}
interface RawCoordinatorUnit {
  offering_id: number;
}

/**
 * Fetches users with optional search and filtering.
 *
 * Usage:
 * ------
 * - `getUsers()` → fetches up to 1000 users (default limit)
 * - `getUsers({ q: "nguyen" })` → searches by name or email
 * - `getUsers({ role: "tutor" })` → filters by role
 * - `getUsers({ q: "alex", role: "admin" })` → combines filters
 *
 * Returns:
 * --------
 * Array of user objects: [{ user_id, first_name, last_name, email }]
 *
 * Notes:
 * ------
 * - Mirrors the `/api/users` USERDF route.
 * - Can be reused by admin dashboards, assignment modals, or autocomplete fields.
 */
export async function getUsers(filters?: Record<string, string | number>) {
  const params = filters
    ? new URLSearchParams(
        Object.entries(filters).map(([k, v]) => [k, String(v)]),
      )
    : "";
  const res = await axios.get(`/users${params ? "?" + params : ""}`);
  return res.data.data;
}
