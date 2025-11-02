// app/api/admin/preview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const stagingId = Number(new URL(req.url).searchParams.get("stagingId"));
  if (!stagingId) return NextResponse.json({ error: "Missing stagingId" }, { status: 400 });

  // Raw grid preview
  const { rows: raw } = await query(
    `SELECT * FROM allocations_staging WHERE batch_id=$1 ORDER BY id LIMIT 100`,
    [stagingId]
  );

  // Lightweight validation (server-side double check)
  const { rows: issues } = await query(
    `
    WITH s AS (SELECT * FROM allocations_staging WHERE batch_id=$1)
    SELECT
      count(*) FILTER (WHERE unit_code IS NULL)                    AS missing_unit_code,
      count(*) FILTER (WHERE activity_name IS NULL)                AS missing_activity_name,
      count(*) FILTER (WHERE activity_date IS NULL)                AS missing_date,
      count(*) FILTER (WHERE activity_start IS NULL OR activity_end IS NULL) AS missing_times
    FROM s
    `,
    [stagingId]
  );

  // Timetable aggregation (what users care about)
  const { rows: timetable } = await query(
    `
    SELECT
      activity_date        AS date,
      activity_start       AS start_time,
      activity_end         AS end_time,
      activity_name,
      activity_type,
      activity_description,
      staff_id, staff_name,
      count(*)                          AS row_count,
      sum(coalesce(units_hours,0))      AS total_hours
    FROM allocations_staging
    WHERE batch_id=$1
    GROUP BY 1,2,3,4,5,6,7,8
    ORDER BY date, start_time, activity_name
    `,
    [stagingId]
  );

  return NextResponse.json({
    stagingId,
    preview: { raw, issues: issues[0], timetable },
  });
}
