// api/users/[id]

// Get basic info just for this user
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const userId = Number(id);

  const sql = `
      SELECT user_id, first_name, last_name, email
      FROM users
      WHERE user_id = $1;
    `;
  const { rows } = await query(sql, [userId]);

  if (!rows.length) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(rows[0]);
}
