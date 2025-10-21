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

    // Check for duplicate requests

    const dupCheckSQL = `
      SELECT request_id FROM request
      WHERE requester_id = $1
        AND allocation_id = $2
        AND request_type = $3
        AND request_status IN ('pending_ta', 'pending_uc');
    `;
    const { rows: existing } = await query(dupCheckSQL, [
      requesterId,
      allocationId,
      requestType,
    ]);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error:
            "Duplicate open request detected for this allocation and type.",
        },
        { status: 409 },
      );
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

// Define which statuses count as "open"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const allocationId = searchParams.get("allocationId");
    const requesterId = req.headers.get("x-user-id"); // optional filtering

    if (!allocationId) {
      return NextResponse.json(
        { error: "Missing allocationId query parameter" },
        { status: 400 },
      );
    }

    // Define which statuses count as "open"
    const OPEN_STATUSES = ["pending_uc", "pending_ta"];

    // Base SQL
    let sql = `
      SELECT request_id, requester_id, allocation_id, request_type, request_status, request_reason, created_at
      FROM request
      WHERE allocation_id = $1
        AND request_status = ANY($2)
    `;
    const params: (string | readonly string[])[] = [
      allocationId,
      OPEN_STATUSES,
    ];

    // Optionally scope to current user (frontend header: x-user-id)
    if (requesterId) {
      sql += " AND requester_id = $3";
      params.push(requesterId);
    }

    sql += " ORDER BY created_at DESC";

    const { rows } = await query(sql, params);

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Error fetching open requests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
