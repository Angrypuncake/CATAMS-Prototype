import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activityId = Number(id);

  if (!activityId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const url = new URL(req.url);
  const futureOnly = url.searchParams.get("futureOnly") === "1";

  try {
    const { rows } = await query(
      `
      SELECT occurrence_id, session_date, start_at, end_at, is_cancelled, description
      FROM session_occurrence
      WHERE activity_id = $1
        ${futureOnly ? "AND session_date >= CURRENT_DATE" : ""}
      ORDER BY session_date NULLS LAST, start_at NULLS LAST, occurrence_id
      `,
      [activityId]
    );

    const data = rows.map((r) => ({
      occurrence_id: r.occurrence_id,
      session_date: r.session_date,
      status: r.is_cancelled ? "cancelled" : null,
    }));

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
