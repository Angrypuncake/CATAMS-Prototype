import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || 50), 200);

    // ---- STAGED BATCHES (not yet committed/discarded) ----
    const [stagedResult, stagedCountResult, runsResult, runsCountResult] = await Promise.all([
      query(
        `
      SELECT
        b.batch_id,
        b.created_at,
        b.status,
        b.row_count,
        b.issues,
        jsonb_build_object(
          'id', u.user_id,
          'name', u.first_name || ' ' || u.last_name,
          'email', u.email
        ) AS "by"
      FROM public.import_batch b
      LEFT JOIN public.users u ON u.user_id = b.creator
      WHERE b.status = 'staged'
      ORDER BY b.batch_id DESC
      LIMIT $1
      `,
        [limit]
      ),
      query(
        `
      SELECT COUNT(*)::int AS total
      FROM public.import_batch
      WHERE status = 'staged'
      `
      ),
      query(
        `
      SELECT
        r.run_id,
        r.batch_id,
        r.started_at,
        r.finished_at,
        r.status,
        r.counts,
        b.row_count       AS staged_rows,
        b.created_at      AS batch_created_at,
        jsonb_build_object(
          'id', u.user_id,
          'name', u.first_name || ' ' || u.last_name,
          'email', u.email
        ) AS "by"
      FROM public.import_run r
      JOIN public.import_batch b USING (batch_id)
      LEFT JOIN public.users u ON u.user_id = b.creator
      ORDER BY r.run_id DESC
      LIMIT $1
      `,
        [limit]
      ),
      query(
        `
      SELECT COUNT(*)::int AS total
      FROM public.import_run
      `
      ),
    ]);

    return NextResponse.json({
      staged: stagedResult.rows,
      stagedTotal: Number(stagedCountResult.rows[0].total),
      runs: runsResult.rows,
      runsTotal: Number(runsCountResult.rows[0].total),
    });
  } catch (e) {
    console.error("history error", e);
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }
}
