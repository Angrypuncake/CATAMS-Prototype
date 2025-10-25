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
        r.request_id         AS "requestId",
        r.request_type      AS "requestType",
        so.session_date      AS "sessionDate",
        so.start_at          AS "startAt",
        so.end_at            AS "endAt",
        ta.activity_name     AS "activityName",
        requester.first_name || ' ' || requester.last_name AS "requesterName",
        reviewer.first_name || ' ' || reviewer.last_name   AS "reviewerName",
        r.request_status     AS "requestStatus"
      FROM request r
      JOIN allocation a
        ON r.allocation_id = a.allocation_id
      JOIN session_occurrence so
        ON a.session_id = so.occurrence_id
      JOIN teaching_activity ta
        ON so.activity_id = ta.activity_id
      JOIN unit_offering uo
        ON ta.unit_offering_id = uo.offering_id
      LEFT JOIN approval ap
        ON ap.request_id = r.request_id
      LEFT JOIN users reviewer
        ON ap.approver_id = reviewer.user_id
      JOIN users requester
        ON r.requester_id = requester.user_id
      WHERE uo.offering_id = $1
      ORDER BY so.session_date, so.start_at;
      `,
      [id],
    );

    const approvals = res.rows.map((row) => ({
      requestId: row.requestId,
      requestType: row.requestType,
      sessionDate: row.sessionDate,
      startAt: row.startAt,
      endAt: row.endAt,
      activityName: row.activityName,
      requesterName: row.requesterName,
      reviewerName: row.reviewerName,
      requestStatus: row.requestStatus,
    }));

    return NextResponse.json({ approvals });
  } catch (err) {
    console.error("Error fetching UC approvals:", err);
    return NextResponse.json(
      { error: "Failed to fetch UC approvals" },
      { status: 500 },
    );
  }
}
