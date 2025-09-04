import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || 50), 200);

    // ---- STAGED BATCHES (not yet committed/discarded) ----
    const { rows: staged } = await query(
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
      [limit],
    );

    // ---- RECENT RUNS (commit/rollback history) ----
    // import_run itself doesn’t have a creator; use the batch’s creator as "by"
    const { rows: runs } = await query(
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
      [limit],
    );

    return NextResponse.json({ staged, runs });
  } catch (e) {
    console.error("history error", e);
    return NextResponse.json(
      { error: "Failed to load history" },
      { status: 500 },
    );
  }
}
