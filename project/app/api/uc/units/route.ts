import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  // Extract from middleware-injected headers
  const userIdHeader = req.headers.get("x-user-id");

  console.log(userIdHeader);

  if (!userIdHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(userIdHeader);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const sql = `
    SELECT 
      u.offering_id
    FROM user_role ur
    JOIN role r ON ur.role_id = r.role_id
    JOIN unit_offering u ON ur.unit_offering_id = u.offering_id
    WHERE ur.user_id = $1
      AND r.role_name = 'uc';
  `;

  const res = await query(sql, [userId]);
  return NextResponse.json({ data: res.rows });
}
