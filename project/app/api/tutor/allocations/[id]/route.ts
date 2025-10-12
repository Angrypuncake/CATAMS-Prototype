import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * GET /api/tutor/allocations/:id
 * Returns one allocation row joined with related session/unit info.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  // Keep column names consistent with the list route’s joins
  const sql = `
    SELECT
      a.allocation_id,
      a.user_id,
      u.first_name,
      u.last_name,
      u.email,
      cu.unit_code,
      cu.unit_name,
      so.start_at,
      so.end_at,
      so.hours,
      ta.activity_type,
      ta.activity_name,
      so.session_date,
      a.status,
      so.location,
      so.note,
      so.description,
      so.hours,
      a.paycode_id
    FROM allocation a
    LEFT JOIN users u ON u.user_id = a.user_id
    JOIN session_occurrence so ON so.occurrence_id = a.session_id
    JOIN teaching_activity ta  ON ta.activity_id = so.activity_id
    JOIN unit_offering uo      ON uo.offering_id = ta.unit_offering_id
    JOIN course_unit cu        ON cu.unit_code = uo.course_unit_id
    WHERE a.allocation_id = $1
    LIMIT 1;
  `;

  const { rows } = await query(sql, [id]);
  const row = rows[0];

  if (!row) {
    return NextResponse.json(
      { error: `Allocation ${id} not found` },
      { status: 404 },
    );
  }

  // Return raw DB-ish fields; the page maps them to its AllocationDetail shape
  return NextResponse.json({ data: row });
}
