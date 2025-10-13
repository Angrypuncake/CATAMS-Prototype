import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ offeringId: string }> },
) {
  const { offeringId } = await context.params;
  const id = Number(offeringId);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid offeringId" }, { status: 400 });
  }

  try {
    // Fetch total allocated amount for the current financial year
    const res = await query(
      `
      WITH valid_payrate AS (
        SELECT
          paycode,
          amount
        FROM paycode_rate_history
        WHERE CURRENT_DATE >= make_date(start_year, 7, 1)
          AND CURRENT_DATE <= make_date(end_year, 6, 30)
      )
      SELECT
        u.offering_id,
        COALESCE(SUM(s.hours * p.amount), 0)::float8 AS allocated_amount
      FROM unit_offering u
      JOIN teaching_activity t
        ON t.unit_offering_id = u.offering_id
      JOIN session_occurrence s
        ON s.activity_id = t.activity_id
      JOIN allocation a
        ON a.session_id = s.occurrence_id
      JOIN valid_payrate p
        ON p.paycode = a.paycode_id
      WHERE u.offering_id = $1
      GROUP BY u.offering_id;
      `,
      [id],
    );

    const allocatedAmount = res.rows?.[0]?.allocated_amount ?? 0;

    return NextResponse.json({
      allocatedAmount: Number(allocatedAmount),
    });
  } catch (err) {
    console.error("Error fetching allocated amount:", err);
    return NextResponse.json(
      { error: "Failed to fetch allocated amount" },
      { status: 500 },
    );
  }
}
