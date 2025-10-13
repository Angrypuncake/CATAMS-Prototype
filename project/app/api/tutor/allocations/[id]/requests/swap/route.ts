import { query } from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requester_id, allocation_id, details, request_reason } = body;

    // First, delete any existing requests for this requester_id and allocation_id
    const result = await query(
      `
        DELETE FROM request
        WHERE requester_id = $1
            AND allocation_id = $2
        RETURNING *;
        `,
      [requester_id, allocation_id],
    );

    const { rows } = await query(
      `
        INSERT INTO request (requester_id, request_date, allocation_id, request_type, details, request_status, request_reason, created_at, updated_at)
        VALUES ($1, $2::timestamptz, $3, 'swap', $4::jsonb, 'pending_ta', $5, $6::timestamptz, $7::timestamptz)
        RETURNING *;
        `,
      [
        requester_id,
        new Date().toISOString(),
        allocation_id,
        details,
        request_reason,
        new Date().toISOString(),
        new Date().toISOString(),
      ],
    );

    return new Response(
      JSON.stringify({ message: "Swap request created successfully" }),
      { status: 201 },
    );
  } catch (error) {
    console.error("Error processing swap request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
