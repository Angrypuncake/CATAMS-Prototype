// app/api/admin/allocations/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * GET /api/admin/allocations
 * Query params (all optional):
 * - page, limit, sort, dir, q
 * - unit_code, unit_name, activity_type, activity_name, status, user_id, mode
 *
 * Notes:
 * - Schema link fixed: unit_offering.course_unit_id (text) -> course_unit.unit_code (text PK)
 * - Support both scheduled (via session_occurrence.activity_id) and unscheduled (via allocation.activity_id)
 * - Use LEFT JOINs where nullable so rows aren't dropped
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(
      Math.max(1, Number(searchParams.get("limit") ?? 25)),
      200,
    );
    const offset = (page - 1) * limit;

    const sort = (searchParams.get("sort") ?? "so.session_date").toString();
    const dir =
      (searchParams.get("dir") ?? "asc").toLowerCase() === "desc"
        ? "DESC"
        : "ASC";
    const q = searchParams.get("q");

    // Collect exact-match filters
    const filters: Array<{ col: string; val: string | number }> = [];
    const pushFilter = (key: string, col: string) => {
      const v = searchParams.get(key);
      if (v && v !== "") filters.push({ col, val: v });
    };
    pushFilter("unit_code", "cu.unit_code");
    pushFilter("unit_name", "cu.unit_name");
    pushFilter("activity_type", "ta.activity_type");
    pushFilter("activity_name", "ta.activity_name");
    pushFilter("status", "a.status");
    pushFilter("user_id", "a.user_id");
    pushFilter("mode", "ta.mode"); // NEW

    const whereParts: string[] = [];
    const params: unknown[] = [];

    // Free-text search across a few columns
    if (q) {
      params.push(`%${q}%`);
      whereParts.push(`(
        cu.unit_code      ILIKE $${params.length} OR
        cu.unit_name      ILIKE $${params.length} OR
        ta.activity_name  ILIKE $${params.length} OR
        ta.activity_type  ILIKE $${params.length} OR
        u.first_name      ILIKE $${params.length} OR
        u.last_name       ILIKE $${params.length}
      )`);
    }

    // Exact filters
    for (const f of filters) {
      params.push(f.val);
      whereParts.push(`${f.col} = $${params.length}`);
    }

    const whereSQL = whereParts.length
      ? `WHERE ${whereParts.join(" AND ")}`
      : "";

    // Whitelist sortable columns (UI may send aliases like "date")
    const sortable: Record<string, string> = {
      date: "so.session_date",
      start_at: "so.start_at",
      unit_code: "cu.unit_code",
      unit_name: "cu.unit_name",
      activity_type: "ta.activity_type",
      activity_name: "ta.activity_name",
      status: "a.status",
      mode: "ta.mode", // NEW
      allocated_hours: "a.allocated_hours", // NEW
    };
    const orderBy = sortable[sort.replace(/^.*\./, "")] ?? "so.session_date";

    // Support scheduled (via so.activity_id) and unscheduled (via a.activity_id)
    // All downstream joins LEFT to avoid dropping rows when nullable
    const baseSQL = `
      FROM allocation a
      LEFT JOIN users u               ON u.user_id = a.user_id
      LEFT JOIN session_occurrence so ON so.occurrence_id = a.session_id
      LEFT JOIN teaching_activity ta  ON ta.activity_id = so.activity_id
      LEFT JOIN unit_offering uo      ON uo.offering_id = ta.unit_offering_id
      LEFT JOIN course_unit cu        ON cu.unit_code = uo.course_unit_id
      ${whereSQL}
    `;

    const dataSQL = `
      SELECT
        a.allocation_id AS id,
        a.user_id,
        u.first_name,
        u.last_name,
        u.email,

        ta.mode,
       
        so.hours as hours,

        cu.unit_code,
        cu.unit_name,

        so.session_date,
        so.start_at,
        so.end_at,
        so.location,
        so.activity_id       AS allocation_activity_id, -- avoid name clash with ta.activity_id

        ta.activity_type,
        ta.activity_name,

        a.status,
        so.note,
        a.teaching_role,
        a.paycode_id
      ${baseSQL}
      ORDER BY ${orderBy} ${dir} NULLS LAST
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    const countSQL = `SELECT COUNT(*)::int AS total ${baseSQL}`;

    const [{ rows }, totalRes] = await Promise.all([
      query(dataSQL, [...params, limit, offset]),
      query(countSQL, params),
    ]);

    const total = totalRes.rows?.[0]?.total ?? 0;

    return NextResponse.json({ page, limit, total, data: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
