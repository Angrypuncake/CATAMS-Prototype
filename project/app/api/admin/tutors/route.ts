// app/api/admin/tutors/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * GET /api/admin/tutors
 *
 * Retrieves tutors with optional search and filtering.
 *
 * Supported Query Parameters (all optional):
 * -------------------------------------------
 * - q:          Free-text search across first_name, last_name, and email.
 * - unit_code:  Filter tutors assigned to a specific unit (via allocation joins).
 *
 * Behavior:
 * ----------
 * - If neither param is provided, returns up to 1000 tutors (ordered by name/email).
 * - If `q` is provided, performs case-insensitive partial matches (ILIKE).
 * - If `unit_code` is provided, joins allocations → teaching_activity → unit_offering → course_unit
 *   to restrict results to tutors allocated within that unit.
 * - When both `q` and `unit_code` are provided, both filters are applied.
 *
 * Example Requests:
 * -----------------
 *   /api/admin/tutors                      → all tutors (limit 1000)
 *   /api/admin/tutors?q=nguyen            → tutors matching “nguyen”
 *   /api/admin/tutors?unit_code=INFO1111  → tutors linked to INFO1111
 *   /api/admin/tutors?q=alex&unit_code=INFO1111 → filtered intersection
 *
 * Notes:
 * ------
 * - This route currently returns distinct tutors (one row per unique user_id).
 * - Extendable for pagination or additional filters (status, role, etc.).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const unitCode = searchParams.get("unit_code")?.trim();

    const params = [];
    const whereParts: string[] = [];

    if (q && q.length > 0) {
      params.push(`%${q}%`);
      whereParts.push(`
        (u.first_name ILIKE $${params.length}
         OR u.last_name ILIKE $${params.length}
         OR u.email ILIKE $${params.length})
      `);
    }

    if (unitCode && unitCode.length > 0) {
      params.push(unitCode);
      whereParts.push(`cu.unit_code = $${params.length}`);
    }

    const whereSQL = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    const sql = `
      SELECT DISTINCT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email
      FROM users u
      LEFT JOIN allocation a       ON a.user_id = u.user_id
      LEFT JOIN session_occurrence so ON so.occurrence_id = a.session_id
      LEFT JOIN teaching_activity ta  ON ta.activity_id = so.activity_id
      LEFT JOIN unit_offering uo      ON uo.offering_id = ta.unit_offering_id
      LEFT JOIN course_unit cu        ON cu.unit_code = uo.course_unit_id
      ${whereSQL}
      ORDER BY u.last_name NULLS LAST, u.first_name NULLS LAST, u.email ASC
      LIMIT 1000
    `;
    const { rows } = await query(sql, params);
    return NextResponse.json({ data: rows });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
