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

  // Get search and sort parameters
  const searchTerm = searchParams.get("q");
  const sortColumn = searchParams.get("sort");
  const sortDirection = searchParams.get("dir") === "desc" ? "DESC" : "ASC";

  // Debug logging
  console.log("[Tutor Allocations API]", {
    userId,
    searchTerm,
    sortColumn,
    sortDirection,
    page,
    limit,
  });

  // Build WHERE clause
  const whereClauses: string[] = [];
  const whereParams: (string | number)[] = [];
  let paramIndex = 1;

  if (userId) {
    whereClauses.push(`a.user_id = $${paramIndex}`);
    whereParams.push(userId);
    paramIndex++;
  }

  // Add search clause if search term is provided
  if (searchTerm && searchTerm.trim()) {
    whereClauses.push(`(
      LOWER(cu.unit_code) LIKE LOWER($${paramIndex}) OR
      LOWER(cu.unit_name) LIKE LOWER($${paramIndex}) OR
      LOWER(ta.activity_type) LIKE LOWER($${paramIndex}) OR
      LOWER(ta.activity_name) LIKE LOWER($${paramIndex}) OR
      LOWER(u.first_name || ' ' || u.last_name) LIKE LOWER($${paramIndex}) OR
      LOWER(u.email) LIKE LOWER($${paramIndex}) OR
      LOWER(a.status) LIKE LOWER($${paramIndex}) OR
      LOWER(so.location) LIKE LOWER($${paramIndex})
    )`);
    whereParams.push(`%${searchTerm.trim()}%`);
    paramIndex++;
  }

  const where =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Build ORDER BY clause - map frontend column names to SQL columns
  const columnMapping: Record<string, string> = {
    session_date: "so.session_date",
    start_at: "so.start_at",
    unit_code: "cu.unit_code",
    location: "so.location",
    hours: "(EXTRACT(EPOCH FROM (so.end_at - so.start_at)) / 3600)",
    status: "a.status",
    activity_type: "ta.activity_type",
    activity_name: "ta.activity_name",
  };

  const orderByColumn =
    sortColumn && columnMapping[sortColumn]
      ? columnMapping[sortColumn]
      : "so.session_date";

  const orderBy = `ORDER BY ${orderByColumn} ${sortDirection}, a.allocation_id`;

  // Build params for main query (WHERE params + limit + offset)
  const limitOffsetParams = `$${paramIndex} OFFSET $${paramIndex + 1}`;
  const params = [...whereParams, limit, offset];

  // Count query uses only WHERE params (no limit/offset)
  const countParams = whereParams;

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
      so.note
    FROM allocation a
    LEFT JOIN users u ON u.user_id = a.user_id
    JOIN session_occurrence so ON so.occurrence_id = a.session_id
    JOIN teaching_activity ta  ON ta.activity_id = so.activity_id
    JOIN unit_offering uo      ON uo.offering_id = ta.unit_offering_id
    JOIN course_unit cu        ON cu.unit_code = uo.course_unit_id
    ${where}
    ${orderBy}
    LIMIT ${limitOffsetParams}
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM allocation a
    LEFT JOIN users u ON u.user_id = a.user_id
    JOIN session_occurrence so ON so.occurrence_id = a.session_id
    JOIN teaching_activity ta  ON ta.activity_id = so.activity_id
    JOIN unit_offering uo      ON uo.offering_id = ta.unit_offering_id
    JOIN course_unit cu        ON cu.unit_code = uo.course_unit_id
    ${where}
  `;
  const result = await query(sql, params);
  const countResult = await query(countQuery, countParams);

  console.log("[Tutor Allocations API] Results:", {
    rowsReturned: result.rows.length,
    totalCount: Number(countResult.rows[0].total),
  });

  return NextResponse.json({
    page,
    limit,
    data: result.rows,
    total: Number(countResult.rows[0].total),
  });
}
