// \api\offerings\[offeringId]\route.ts

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
    const res = await query(
      `
      SELECT
        u.offering_id,
        u.course_unit_id,
        u.year,
        u.session_code,
        u.budget::float8 AS budget,
        cu.unit_code,
        cu.unit_name
        FROM unit_offering u
        JOIN course_unit cu
        ON cu.unit_code = u.course_unit_id
        WHERE u.offering_id = $1
        LIMIT 1;
      `,
      [id],
    );

    // Extract single row
    const offering = res.rows?.[0];

    if (!offering) {
      return NextResponse.json(
        { error: "Offering not found" },
        { status: 404 },
      );
    }

    // Return clean JSON
    return NextResponse.json({
      offeringId: offering.offering_id,
      unitCode: offering.unit_code,
      unitName: offering.unit_name,
      year: offering.year,
      session: offering.session_code,
      budget: offering.budget,
    });
  } catch (err) {
    console.error("Error fetching offering:", err);
    return NextResponse.json(
      { error: "Failed to fetch offering" },
      { status: 500 },
    );
  }
}
