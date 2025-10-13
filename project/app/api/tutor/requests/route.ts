import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    // Extract user id from request headers (set by middleware)
    const requesterId = req.headers.get("x-user-id");
    if (!requesterId) {
      return NextResponse.json(
        { error: "Missing user authentication" },
        { status: 401 },
      );
    }

    // Pagination
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(
      Math.max(1, Number(searchParams.get("limit") ?? 50)),
      100,
    );
    const offset = (page - 1) * limit;

    // Main query
    const sql = `
      SELECT
        r.request_id AS "requestId",
        r.request_type AS "type",
        r.request_status AS "status",
        r.request_reason AS "reason",
        r.created_at AS "createdAt",
        COALESCE(
            cu.unit_code || ' ' || ta.activity_type ||
            ' (' || TO_CHAR(so.session_date + so.start_at, 'Dy HH24:MI') || '–' ||
            TO_CHAR(so.session_date + so.end_at, 'HH24:MI') || ')',
            'Unlinked Session'
          ) AS "relatedSession"
      FROM request r
      LEFT JOIN allocation a ON a.allocation_id = r.allocation_id
      LEFT JOIN session_occurrence so ON so.occurrence_id = a.session_id
      LEFT JOIN teaching_activity ta ON ta.activity_id = so.activity_id
      LEFT JOIN unit_offering uo ON uo.offering_id = ta.unit_offering_id
      LEFT JOIN course_unit cu ON cu.unit_code = uo.course_unit_id
      WHERE r.requester_id = $3
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM request r
      WHERE r.requester_id = $1;
    `;

    // Execute
    const result = await query(sql, [limit, offset, requesterId]);
    const countResult = await query(countQuery, [requesterId]);

    return NextResponse.json({
      page,
      limit,
      total: Number(countResult.rows[0].total),
      data: result.rows,
    });
  } catch (err) {
    console.error("Failed to fetch tutor requests:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
