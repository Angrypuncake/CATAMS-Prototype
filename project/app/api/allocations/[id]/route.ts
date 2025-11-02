// app/api/allocations/[id]/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    const body = await req.json();
    const { hours, note, location, status } = body;

    const updateSQL = `
      UPDATE session_occurrence so
      SET
        hours = COALESCE($1, so.hours),
        note = COALESCE($2, so.note),
        location = COALESCE($3, so.location)
      FROM allocation a
      WHERE so.occurrence_id = a.session_id
        AND a.allocation_id = $4
      RETURNING so.occurrence_id, so.hours, so.note, so.location;
    `;

    const { rows } = await query(updateSQL, [hours, note, location, id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Allocation not found" }, { status: 404 });
    }

    // optional: update allocation status if provided
    if (status) {
      await query(`UPDATE allocation SET status = $1 WHERE allocation_id = $2;`, [status, id]);
    }

    return NextResponse.json({ status: "success", ...rows[0] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    console.error("PATCH /allocations/[id] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  try {
    await query("UPDATE allocation SET status = 'cancelled' WHERE allocation_id = $1", [id]);
    return NextResponse.json({ status: "deleted" });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete allocation" }, { status: 500 });
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid allocation ID" }, { status: 400 });
    }

    const text = `
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
      JOIN users u 
        ON a.user_id = u.user_id
      LEFT JOIN session_occurrence so 
        ON a.session_id = so.occurrence_id
      LEFT JOIN teaching_activity ta 
        ON so.activity_id = ta.activity_id
      LEFT JOIN unit_offering uo 
        ON ta.unit_offering_id = uo.offering_id
      LEFT JOIN course_unit cu 
        ON uo.course_unit_id = cu.unit_code
      WHERE a.allocation_id = $1
      LIMIT 1;
    `;

    const { rows } = await query(text, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Allocation not found" }, { status: 404 });
    }

    return NextResponse.json({ data: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching allocation by ID:", error);
    return NextResponse.json({ error: "Failed to fetch allocation" }, { status: 500 });
  }
}
