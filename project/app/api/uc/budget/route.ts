import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const offeringId = searchParams.get("offering_id");

  if (!offeringId)
    return NextResponse.json({ error: "Missing offering_id" }, { status: 400 });

  const res = await query(
    `SELECT budget::float8 FROM unit_offering WHERE offering_id = $1`,
    [offeringId],
  );

  return NextResponse.json({ budget: res.rows[0]?.budget ?? 0 });
}
