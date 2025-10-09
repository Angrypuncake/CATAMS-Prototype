// api/users/[id]
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const userId = Number(params.id);
    const sql = `
      SELECT user_id, first_name, last_name, email
      FROM users
      WHERE user_id = $1;
    `;
    const { rows } = await query(sql, [userId]);
    if (!rows.length)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
