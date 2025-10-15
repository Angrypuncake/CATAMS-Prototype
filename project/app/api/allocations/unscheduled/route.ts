import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * POST /api/allocations/unscheduled
 * Creates an unscheduled allocation (Marking / Consultation / etc.)
 *
 * Body:
 * {
 *   offeringId: number,
 *   tutorId: number,
 *   hours: number,
 *   activityType?: string,
 *   note?: string
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      offeringId,
      tutorId,
      hours,
      activityType = "Marking",
      note = null,
    } = body;

    if (!offeringId || !tutorId) {
      return NextResponse.json(
        { error: "Missing required fields (offeringId, tutorId)" },
        { status: 400 },
      );
    }

    // 🧠 1️⃣ Map activity type → paycode
    const paycodeMap: Record<string, { code: string; description: string }> = {
      Marking: {
        code: "MARK",
        description: "Hours allocated for manual assessment marking",
      },
      Consultation: {
        code: "CONS",
        description: "Student consultation hours (unscheduled)",
      },
      Tutorial: {
        code: "TU2",
        description: "Unscheduled tutorial allocation",
      },
      Laboratory: {
        code: "LAB2",
        description: "Unscheduled laboratory allocation",
      },
    };

    const mapping = paycodeMap[activityType] || paycodeMap["Marking"];
    const paycodeId = mapping.code;
    const activityDescription = mapping.description;

    // 🧠 2️⃣ Find or create unscheduled teaching_activity
    const findActivitySQL = `
      SELECT activity_id
      FROM teaching_activity
      WHERE unit_offering_id = $1
        AND activity_type = $2
        AND mode = 'unscheduled'
      LIMIT 1;
    `;
    const { rows: existingActivities } = await query(findActivitySQL, [
      offeringId,
      activityType,
    ]);

    let activityId: number;
    if (existingActivities.length > 0) {
      activityId = existingActivities[0].activity_id;
    } else {
      const insertActivitySQL = `
        INSERT INTO teaching_activity (
          unit_offering_id, activity_type, activity_name, activity_description, mode
        )
        VALUES ($1, $2, $3, $4, 'unscheduled')
        RETURNING activity_id;
      `;
      const { rows } = await query(insertActivitySQL, [
        offeringId,
        activityType,
        `Manual ${activityType}`,
        activityDescription,
      ]);
      activityId = rows[0].activity_id;
    }

    // 🧠 3️⃣ Create session_occurrence
    const insertOccurrenceSQL = `
      INSERT INTO session_occurrence (
        activity_id, session_date, is_cancelled, description, hours, note
      )
      VALUES ($1, NULL, false, $2, $3, $4)
      RETURNING occurrence_id;
    `;

    const { rows: occurrenceRows } = await query(insertOccurrenceSQL, [
      activityId,
      `${activityType} (no fixed session)`,
      hours || null,
      note,
    ]);
    const occurrenceId = occurrenceRows[0].occurrence_id;

    // 🧠 4️⃣ Create allocation (with note)
    const insertAllocationSQL = `
      INSERT INTO allocation (
        user_id, session_id, paycode_id, teaching_role, status, created_by_run_id
      )
      VALUES ($1, $2, $3, 'Marker', 'active', NULL)
      RETURNING allocation_id;
    `;
    const { rows: allocationRows } = await query(insertAllocationSQL, [
      tutorId,
      occurrenceId,
      paycodeId,
    ]);
    const allocationId = allocationRows[0].allocation_id;

    return NextResponse.json({
      activityId,
      occurrenceId,
      allocationId,
      paycodeId,
      activityType,
      note,
      status: "success",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    console.error("Unscheduled Allocation Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const offeringId = searchParams.get("offeringId");
  const tutorId = searchParams.get("tutorId");
  const activityType = searchParams.get("activityType") || "Marking";
  const status = searchParams.get("status");

  if (!offeringId) {
    return NextResponse.json({ error: "Missing offeringId" }, { status: 400 });
  }

  let sql = `
    SELECT 
      a.allocation_id,
      a.user_id,
      u.first_name,
      u.last_name,
      u.email,
      so.hours,
      so.note,
      so.location,
      ta.activity_type,
      a.status
    FROM allocation a
    JOIN session_occurrence so ON a.session_id = so.occurrence_id
    JOIN teaching_activity ta ON so.activity_id = ta.activity_id
    JOIN users u ON u.user_id = a.user_id
    WHERE ta.unit_offering_id = $1
      AND ta.mode = 'unscheduled'
      AND ta.activity_type = $2
  `;
  const params: (string | number)[] = [offeringId, activityType];

  if (tutorId) {
    sql += " AND u.user_id = $3";
    params.push(tutorId);
  }

  if (status) {
    sql += tutorId ? " AND a.status = $4" : " AND a.status = $3";
    params.push(status);
  }

  sql += " ORDER BY u.last_name ASC;";

  const { rows } = await query(sql, params);
  return NextResponse.json(rows);
}
