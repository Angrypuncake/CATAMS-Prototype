// app/api/allocations/[id]/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);
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
      return NextResponse.json(
        { error: "Allocation not found" },
        { status: 404 },
      );
    }

    // optional: update allocation status if provided
    if (status) {
      await query(
        `UPDATE allocation SET status = $1 WHERE allocation_id = $2;`,
        [status, id],
      );
    }

    return NextResponse.json({ status: "success", ...rows[0] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    console.error("PATCH /allocations/[id] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  try {
    await query(
      "UPDATE allocation SET status = 'cancelled' WHERE allocation_id = $1",
      [id],
    );
    return NextResponse.json({ status: "deleted" });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to delete allocation" },
      { status: 500 },
    );
  }
}
