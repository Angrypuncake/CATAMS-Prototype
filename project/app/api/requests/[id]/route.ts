// project/app/api/requests/[id]/route.ts

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  const sql = `
    SELECT 
      r.request_id,
      r.requester_id,
      r.request_date,
      r.allocation_id,
      r.request_type,
      r.details,
      r.request_status,
      r.request_reason,
      r.created_at,
      r.updated_at
    FROM request r
    WHERE r.request_id = $1
    LIMIT 1;
  `;

  const { rows } = await query(sql, [id]);
  const row = rows[0];

  if (!row) {
    return NextResponse.json(
      { error: `Request ${id} not found` },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: row });
}
