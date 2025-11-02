// app/api/admin/import/commit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { stagingId } = await req.json();
    if (!stagingId) {
      return NextResponse.json({ error: "Missing stagingId" }, { status: 400 });
    }

    // Optional: refuse if blocking issues exist for this batch
    const { rows: chk } = await query(
      `
      WITH s AS (SELECT * FROM public.allocations_staging WHERE batch_id = $1)
      SELECT
        count(*) FILTER (WHERE unit_code IS NULL)        AS missing_unit_code,
        count(*) FILTER (WHERE activity_name IS NULL)    AS missing_activity_name,
        count(*) FILTER (WHERE activity_date IS NULL)    AS missing_date
      FROM s
      `,
      [stagingId]
    );
    const blocking =
      Number(chk[0].missing_unit_code) +
      Number(chk[0].missing_activity_name) +
      Number(chk[0].missing_date);
    if (blocking > 0) {
      return NextResponse.json(
        { error: "Fix validation issues before commit", issues: chk[0] },
        { status: 400 }
      );
    }

    // Run ETL
    const { rows } = await query(`SELECT * FROM public.etl_commit_staging($1)`, [stagingId]);

    // (Nice to have) mark batch committed
    await query(`UPDATE public.import_batch SET status='committed' WHERE batch_id=$1`, [stagingId]);

    return NextResponse.json({
      committed: true,
      stagingId,
      inserted: rows?.[0] ?? {
        teaching_activity: 0,
        session_occurrence: 0,
        allocation: 0,
      },
    });
  } catch (err) {
    console.error("Commit error:", err);
    return NextResponse.json({ error: "Failed to commit import" }, { status: 500 });
  }
}
