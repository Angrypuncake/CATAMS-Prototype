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
      `SELECT budget::float8 AS budget FROM unit_offering WHERE offering_id = $1`,
      [id]
    );

    const budget = result.rows[0]?.budget ?? 0;
    return NextResponse.json({ id, budget });
  } catch (err) {
    console.error("Error fetching budget:", err);
    return NextResponse.json({ error: "Failed to fetch budget" }, { status: 500 });
  }
}
