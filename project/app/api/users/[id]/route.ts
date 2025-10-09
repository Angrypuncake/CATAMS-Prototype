import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const role = searchParams.get("role")?.trim();
    const limit = Number(searchParams.get("limit")) || 1000;

    const params: (string | number | boolean | null)[] = [];
    const whereParts: string[] = [];

    if (q) {
      params.push(`%${q}%`);
      whereParts.push(`
        (u.first_name ILIKE $${params.length}
        OR u.last_name ILIKE $${params.length}
        OR u.email ILIKE $${params.length})
      `);
    }

    if (role) {
      params.push(role);
      whereParts.push(`r.role_name = $${params.length}`);
    }

    const whereSQL = whereParts.length
      ? `WHERE ${whereParts.join(" AND ")}`
      : "";

    const sql = `
      SELECT DISTINCT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email
      FROM users u
      LEFT JOIN user_role ur ON ur.user_id = u.user_id
      LEFT JOIN role r ON r.role_id = ur.role_id
      ${whereSQL}
      ORDER BY u.last_name NULLS LAST, u.first_name ASC
      LIMIT ${limit};
    `;

    const { rows } = await query(sql, params);
    return NextResponse.json({ data: rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
