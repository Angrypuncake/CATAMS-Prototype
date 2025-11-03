import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(_req: Request, context: { params: Promise<{ offeringId: string }> }) {
  const { offeringId } = await context.params;
  const id = Number(offeringId);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid offeringId" }, { status: 400 });
  }

  try {
    const result = await query(
      `
      SELECT 
        COALESCE(SUM(c.claimed_amount), 0)::float8 AS total_claimed
      FROM claims c
      JOIN allocation a ON c.allocation_id = a.allocation_id
      JOIN session_occurrence s ON a.session_id = s.occurrence_id
      JOIN teaching_activity t ON s.activity_id = t.activity_id
      JOIN unit_offering u ON t.unit_offering_id = u.offering_id
      WHERE u.offering_id = $1;
      `,
      [id]
    );

    const totalClaimed = Number(result.rows[0]?.total_claimed ?? 0);

    return NextResponse.json({ totalClaimed });
  } catch (err) {
    console.error("Error fetching total claimed amount:", err);
    return NextResponse.json({ error: "Failed to fetch total claimed amount" }, { status: 500 });
  }
}
