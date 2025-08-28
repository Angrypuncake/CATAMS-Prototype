// GET list of allocations (with pagination)

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  const result = await query(
    `
  SELECT 
    a.allocation_id AS id,
    cu.unit_code,
    cu.unit_name,
    a.status,
    so.start_at,
    so.end_at,
    so.location,
    so.hours,
    ta.activity_type AS session_type,
    ta.activity_name,
    so.notes
  FROM allocation a
  JOIN session_occurrence so ON so.occurrence_id = a.session_id
  JOIN teaching_activity ta ON ta.activity_id = so.activity_id
  JOIN unit_offering uo ON uo.offering_id = ta.unit_offering_id
  JOIN course_unit cu ON cu.unit_code = uo.course_unit_id
  ORDER BY a.allocation_id
  LIMIT $1 OFFSET $2;
`,
    [limit, offset],
  );

  return NextResponse.json({
    page,
    limit,
    data: result.rows,
  });
}
