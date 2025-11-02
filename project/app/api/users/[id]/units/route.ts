//api/user/units

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const userId = Number(id);
    const sql = `
      SELECT DISTINCT
        cu.unit_code,
        cu.unit_name,
        uo.session_code,
        uo.year
      FROM user_role ur
      JOIN unit_offering uo ON ur.unit_offering_id = uo.offering_id
      JOIN course_unit cu ON cu.unit_code = uo.course_unit_id
      WHERE ur.user_id = $1
      ORDER BY uo.year DESC, uo.session_code;
    `;
    const { rows } = await query(sql, [userId]);
    return NextResponse.json({ data: rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
