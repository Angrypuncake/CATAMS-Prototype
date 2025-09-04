// app/api/admin/discard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const batchId = Number(body.batchId ?? body.stagingId); // handle both keys

  console.log("batchId value:", batchId, "type:", typeof batchId);

  if (!Number.isInteger(batchId)) {
    return NextResponse.json(
      { error: "Missing or invalid batchId/stagingId", got: body },
      { status: 400 },
    );
  }

  try {
    await query("BEGIN");

    // Is there any committed run for this batch?
    const { rows: r } = await query(
      `SELECT COUNT(*)::int AS n
         FROM import_run
        WHERE batch_id = $1 AND status = 'committed'`,
      [batchId],
    );
    const committedCount = r?.[0]?.n ?? 0;

    if (committedCount > 0) {
      await query("ROLLBACK");
      return NextResponse.json(
        {
          error: "Batch has committed data",
          detail:
            "Use /api/admin/rollback to revert committed runs before discarding the batch.",
          committedRuns: committedCount,
        },
        { status: 409 },
      );
    }

    // No committed runs: safe to discard staging
    await query(`DELETE FROM allocations_staging WHERE batch_id = $1`, [
      batchId,
    ]);
    await query(
      `UPDATE import_batch SET status = 'discarded' WHERE batch_id = $1`,
      [batchId],
    );

    await query("COMMIT");
    return NextResponse.json({ discarded: true, batchId });
  } catch (err) {
    await query("ROLLBACK");
    return NextResponse.json(
      { error: "Discard failed", detail: String(err) },
      { status: 500 },
    );
  }
}
