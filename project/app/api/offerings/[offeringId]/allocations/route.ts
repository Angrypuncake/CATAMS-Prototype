import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { AdminAllocationRow } from "@/app/_types/allocations";

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
        a.allocation_id AS id,
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        so.session_date,
        so.start_at,
        so.end_at,
        so.location,
        so.note,
        so.hours,
        cu.unit_code,
        cu.unit_name,
        ta.activity_name,
        ta.activity_type,
        ta.mode,
        a.paycode_id,
        a.status,
        a.teaching_role,
        ta.activity_id AS allocation_activity_id
      FROM allocation a
      JOIN users u ON a.user_id = u.user_id
      JOIN session_occurrence so ON a.session_id = so.occurrence_id
      JOIN teaching_activity ta ON so.activity_id = ta.activity_id
      JOIN unit_offering uo ON ta.unit_offering_id = uo.offering_id
      JOIN course_unit cu ON uo.course_unit_id = cu.unit_code
      WHERE uo.offering_id = $1
      ORDER BY so.session_date, so.start_at;
      `,
      [id],
    );

    const allocations: AdminAllocationRow[] = res.rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      first_name: r.first_name,
      last_name: r.last_name,
      email: r.email,
      session_date: r.session_date,
      start_at: r.start_at,
      end_at: r.end_at,
      location: r.location,
      note: r.note,
      hours: r.hours,
      unit_code: r.unit_code,
      unit_name: r.unit_name,
      activity_name: r.activity_name,
      activity_type: r.activity_type,
      mode: r.mode,
      paycode_id: r.paycode_id,
      status: r.status,
      teaching_role: r.teaching_role,
      allocation_activity_id: r.allocation_activity_id,
    }));

    return NextResponse.json(allocations);
  } catch (err) {
    console.error("Error fetching allocations by offering:", err);
    return NextResponse.json(
      { error: "Failed to fetch allocations" },
      { status: 500 },
    );
  }
}
