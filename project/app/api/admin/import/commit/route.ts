// POST commit staging → normalized tables
import { NextRequest, NextResponse } from "next/server";
// import { query } from "@/lib/db"; // will use Alex's ETL SQL

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stagingId } = body;

    if (!stagingId) {
      return NextResponse.json({ error: "Missing stagingId" }, { status: 400 });
    }

    // TODO: run ETL script here (Alex’s SQL pipeline)
    // await query("CALL etl_commit_staging($1)", [stagingId]);

    return NextResponse.json({
      committed: true,
      inserted: {
        unit_offering: 2,
        teaching_activity: 4,
        session_occurrence: 10,
        allocation: 25,
      },
    });
  } catch (err) {
    console.error("Commit error:", err);
    return NextResponse.json(
      { error: "Failed to commit import" },
      { status: 500 },
    );
  }
}
