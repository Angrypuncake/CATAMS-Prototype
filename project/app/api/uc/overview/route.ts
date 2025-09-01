// app/api/uc/overview/route.ts
import { NextResponse } from "next/server";
import { query as rawQuery } from "@/lib/db";
import { z } from "zod";

// Runtime schema for a row coming from SQL
const OverviewRowSchema = z.object({
  offeringId: z.number().int(),
  unitCode: z.string(),
  unitName: z.string(),
  year: z.number().int(),
  session: z.string(),
  budget: z.number(),
  spent: z.number(), // absolute spent
  pctUsed: z.number(), // 0..1
  variance: z.number(),
});
type OverviewRow = z.infer<typeof OverviewRowSchema>;

type BudgetAlert = {
  type: "budget";
  offeringId: number;
  unitCode: string;
  pctUsed: number;
  message: string;
};

// Local, type-safe wrapper (doesn't change lib/db signature globally)
async function dbRows(sql: string, params?: unknown[]): Promise<unknown[]> {
  const res = await (
    rawQuery as unknown as (
      q: string,
      p?: unknown[],
    ) => Promise<
      { rows: unknown[] } | { rows: unknown[]; [k: string]: unknown }
    >
  )(sql, params);
  // some apps wrap pool.query, some return QueryResult — both have .rows
  // ensure we always return an array
  return Array.isArray(res?.rows) ? (res as { rows: unknown[] }).rows : [];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const yearParam = searchParams.get("year");
    const sessionParam = searchParams.get("session");
    const thresholdParam = searchParams.get("threshold");

    const year = Number.isFinite(Number(yearParam))
      ? Number(yearParam)
      : new Date().getFullYear();
    const session = (sessionParam && sessionParam.trim()) || "S2"; // e.g. 'S2' or 'S2%'
    const threshold = Number.isFinite(Number(thresholdParam))
      ? Number(thresholdParam)
      : 0.9; // 0..1

    const sessionLike = session.includes("%") ? session : `${session}%`;

    // Cast numeric expressions to float8 to avoid pg returning strings for NUMERIC
    const sql = /* sql */ `
      WITH tx AS (
        SELECT
          bt.offering_id,
          COALESCE(SUM(bt.delta_amount), 0)::float8 AS raw_spent
        FROM budget_transaction bt
        GROUP BY bt.offering_id
      )
      SELECT
        u.offering_id                                  AS "offeringId",
        cu.unit_code                                   AS "unitCode",
        cu.unit_name                                   AS "unitName",
        u.year                                         AS "year",
        u.session_code                                 AS "session",
        u.budget::float8                               AS "budget",
        ABS(COALESCE(tx.raw_spent, 0))::float8         AS "spent",
        CASE
          WHEN u.budget > 0
            THEN (ABS(COALESCE(tx.raw_spent,0)) / u.budget)::float8
          ELSE 0::float8
        END                                            AS "pctUsed",
        (u.budget - ABS(COALESCE(tx.raw_spent,0)))::float8 AS "variance"
      FROM unit_offering u
      JOIN course_unit cu ON cu.unit_code = u.course_unit_id
      LEFT JOIN tx ON tx.offering_id = u.offering_id
      WHERE u.year = $1
        AND u.session_code LIKE $2
      ORDER BY cu.unit_code;
    `;

    const raw = await dbRows(sql, [year, sessionLike]);

    // Runtime validation & parsing to typed rows
    const rows: OverviewRow[] = z.array(OverviewRowSchema).parse(raw);

    const alerts: BudgetAlert[] = rows
      .filter((r) => r.pctUsed >= threshold)
      .map((r) => ({
        type: "budget",
        offeringId: r.offeringId,
        unitCode: r.unitCode,
        pctUsed: r.pctUsed,
        message: `${r.unitCode} is at ${Math.round(r.pctUsed * 100)}% budget used.`,
      }));

    return NextResponse.json({
      year,
      session: sessionLike,
      threshold,
      rows,
      alerts,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // Keep server logs useful but concise
    console.error("UC overview error:", msg);
    return NextResponse.json(
      { error: "Failed to load UC overview." },
      { status: 500 },
    );
  }
}
