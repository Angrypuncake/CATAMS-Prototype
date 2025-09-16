// GET list of allocations (with pagination)

// app/api/tutor/allocations/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(
    Math.max(1, Number(searchParams.get("limit") ?? 50)),
    100,
  );
  const offset = (page - 1) * limit;

  // For demo: just grab ?userId=... from the URL
  const userId = searchParams.get("userId");

  // If no userId, return everything (or you could choose to block)
  const where = userId ? "WHERE a.user_id = $3" : "";
  const params = userId ? [limit, offset, userId] : [limit, offset];

  const sql = `
    SELECT
      a.allocation_id AS id,
      a.user_id,
      u.first_name,
      u.last_name,
      u.email,
      cu.unit_code,
      cu.unit_name,
      so.start_at,
      so.end_at,
      ta.activity_type,
      ta.activity_name,
      so.session_date,
      a.status,
      so.location,
      a.note
    FROM allocation a
    LEFT JOIN users u ON u.user_id = a.user_id
    JOIN session_occurrence so ON so.occurrence_id = a.session_id
    JOIN teaching_activity ta  ON ta.activity_id = so.activity_id
    JOIN unit_offering uo      ON uo.offering_id = ta.unit_offering_id
    JOIN course_unit cu        ON cu.unit_code = uo.course_unit_id
    ${where}
    ORDER BY a.allocation_id
    LIMIT $1 OFFSET $2
  `;

  const result = await query(sql, params);

  return NextResponse.json({
    page,
    limit,
    data: result.rows,
  });
}
