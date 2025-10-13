import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { allocation_id, requester_id, paycode, claimed_hours } = body;

    if (!allocation_id || !requester_id || !paycode || !claimed_hours) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1Fetch paycode rate for the current financial year
    const { rows: payrateRows } = await query(
      `
      SELECT amount
      FROM paycode_rate_history
      WHERE paycode = $1
        AND CURRENT_DATE >= make_date(start_year, 7, 1)
        AND CURRENT_DATE <= make_date(end_year, 6, 30)
      LIMIT 1;
      `,
      [paycode],
    );

    if (payrateRows.length === 0) {
      return NextResponse.json({ error: "No pay rate found" }, { status: 400 });
    }

    const rate = Number(payrateRows[0].amount);
    const claimed_amount = rate * claimed_hours;
    console.log("claimed amount", claimed_amount);

    // 2️Insert new claim (created_at auto-filled by DEFAULT NOW())
    const { rows } = await query(
      `
      INSERT INTO claims (allocation_id, user_id, paycode, claimed_hours, claimed_amount)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [allocation_id, requester_id, paycode, claimed_hours, claimed_amount],
    );

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Error creating claim:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
