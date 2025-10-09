// api/users/[id]/roles
// Get all the roles for a user
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const userId = Number(params.id);
    const sql = `
      SELECT r.role_name, cu.unit_code, cu.unit_name
      FROM user_role ur
      JOIN role r ON ur.role_id = r.role_id
      JOIN unit_offering uo ON ur.unit_offering_id = uo.offering_id
      JOIN course_unit cu ON uo.course_unit_id = cu.unit_code
      WHERE ur.user_id = $1
      ORDER BY cu.unit_code;
    `;
    const { rows } = await query(sql, [userId]);
    return NextResponse.json({ data: rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
