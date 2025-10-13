import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * Generic endpoint to create a tutor request (claim, swap, correction, cancellation, query)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      allocationId,
      requestType,
      requestReason,
      details, // should already be JSON-serializable
    } = body;

    const requesterId = req.headers.get("x-user-id");

    if (!requesterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: Validate requestType for safety
    const validTypes = ["claim", "swap", "correction", "cancellation", "query"];
    if (!validTypes.includes(requestType)) {
      return NextResponse.json(
        { error: "Invalid request type" },
        { status: 400 },
      );
    }

    // Assign status based on request type (you can refine later)
    const defaultStatusMap: Record<string, string> = {
      claim: "pending_ta",
      swap: "pending_uc",
      correction: "pending_ta",
      cancellation: "pending_uc",
      query: "pending_uc",
    };
    const requestStatus = defaultStatusMap[requestType] ?? "pending_uc";

    const sql = `
      INSERT INTO request
        (requester_id, request_date, allocation_id, request_type, details, request_status, request_reason, created_at, updated_at)
      VALUES
        ($1, NOW(), $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING request_id;
    `;

    const values = [
      requesterId,
      allocationId,
      requestType,
      JSON.stringify(details ?? {}),
      requestStatus,
      requestReason ?? null,
    ];

    const { rows } = await query(sql, values);
    const insertedId = rows[0]?.request_id;

    return NextResponse.json({ success: true, requestId: insertedId });
  } catch (error) {
    console.error("Error inserting request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
