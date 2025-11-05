// project/app/api/requests/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const sql = `
  SELECT 
    r.request_id AS "requestId",
    r.requester_id AS "requesterId",
    r.request_date AS "requestDate",
    r.allocation_id AS "allocationId",
    r.request_type AS "requestType",
    r.details,
    r.request_status AS "requestStatus",
    r.request_reason AS "requestReason",
    r.created_at AS "createdAt",
    r.updated_at AS "updatedAt"
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
