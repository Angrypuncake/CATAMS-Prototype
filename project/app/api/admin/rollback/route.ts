// app/api/admin/rollback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { runId } = await req.json();
    if (!runId) return NextResponse.json({ error: "Missing runId" }, { status: 400 });
    const { rows } = await query(`SELECT * FROM public.etl_rollback_run($1)`, [runId]);
    return NextResponse.json({
      rolledBack: true,
      runId,
      deleted: rows?.[0] ?? {},
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Rollback failed" }, { status: 500 });
  }
}
