// app/api/admin/tutors/[id]
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const sql = `
      SELECT 
      u.user_id,
      u.first_name,
      u.last_name,
      u.email,
      COUNT(a.allocation_id) AS total_allocations
    FROM users u
    LEFT JOIN allocation a ON a.user_id = u.user_id
    WHERE u.user_id = $1
    GROUP BY u.user_id
      `;
    const { rows } = await query(sql, [id]);
    if (rows.length === 0)
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
