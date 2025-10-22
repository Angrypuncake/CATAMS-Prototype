import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ offeringId: string }> },
) {
  const { offeringId } = await context.params;
  const id = Number(offeringId);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid offeringId" }, { status: 400 });
  }

  try {
    const res = await query(
      `
      SELECT
        r.request_id       AS "requestId",
        r.requester_id     AS "requesterId",
        r.request_date     AS "requestDate",
        r.allocation_id    AS "allocationId",
        r.request_type     AS "requestType",
        r.details,
        r.request_status   AS "requestStatus",
        r.request_reason   AS "requestReason",
        r.created_at       AS "createdAt",
        r.updated_at       AS "updatedAt",
        a.user_id          AS "tutorId",
        u.first_name       AS "firstName",
        u.last_name        AS "lastName"
      FROM request r
      JOIN allocation a
        ON a.allocation_id = r.allocation_id
      JOIN session_occurrence so
        ON so.occurrence_id = a.session_id
      JOIN teaching_activity ta
        ON ta.activity_id = so.activity_id
      JOIN unit_offering uo
        ON uo.offering_id = ta.unit_offering_id
      JOIN users u
        ON u.user_id = a.user_id
      WHERE uo.offering_id = $1
      ORDER BY r.created_at DESC;
      `,
      [id],
    );

    return NextResponse.json(res.rows);
  } catch (err) {
    console.error("❌ Error fetching offering requests:", err);
    return NextResponse.json(
      { error: "Failed to fetch offering requests" },
      { status: 500 },
    );
  }
}
