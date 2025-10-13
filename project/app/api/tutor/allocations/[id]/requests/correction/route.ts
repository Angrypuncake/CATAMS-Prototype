import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const body = await req.json();

    const {
      allocation_id,
      date,
      start_at,
      end_at,
      location,
      hours,
      session_type,
      justification,
    } = body;

    const requester_id = req.headers.get("x-user-id");

    if (!requester_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const detailsJson = {
      date,
      start_at,
      end_at,
      location,
      hours,
      session_type,
    };

    const sql = `
      INSERT INTO request
      (requester_id, request_date, allocation_id, request_type, details, request_status, request_reason, created_at, updated_at)
      VALUES
      ($1, NOW(), $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING request_id;
    `;

    const requestType = "correction";
    const requestStatus = "pending_ta";

    const values = [
      requester_id,
      allocation_id,
      requestType,
      JSON.stringify(detailsJson),
      requestStatus,
      justification ?? null,
    ];

    const { rows } = await query(sql, values);
    const insertedId = rows[0]?.request_id;

    return NextResponse.json({ success: true, request_id: insertedId });
  } catch (error) {
    console.error("Error inserting correction:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
