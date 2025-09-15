import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// Helper: map "Mon...Sun" -> 0..6 offset from week's Monday
type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const DOW_OFFSETS: Record<Weekday, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const allocationId = Number(id);
  if (!allocationId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));

  const {
    user_id,
    paycode_id,
    status,
    note,
    session_date,
    start_at,
    end_at,
    propagate_fields, // ["tutor","paycode","start","end","notes"]
    propagate_notes_mode, // "overwrite" | "append"
    propagate_dow, // Weekday | undefined
    propagate_occurrence_ids, // number[]
  } = body as {
    user_id?: number;
    paycode_id?: string;
    status?: string;
    note?: string;
    session_date?: string;
    start_at?: string;
    end_at?: string;
    propagate_fields?: ("tutor" | "paycode" | "start" | "end" | "notes")[];
    propagate_notes_mode?: "overwrite" | "append";
    propagate_dow?: Weekday;
    propagate_occurrence_ids?: number[];
  };

  try {
    // Load current allocation + its occurrence + its activity
    const {
      rows: [alloc],
    } = await query(
      `
      SELECT a.allocation_id, a.user_id AS tutor_user_id, a.paycode_id, a.status,
             a.note AS alloc_note, a.session_id, a.activity_id,
             so.session_date AS cur_date, so.start_at AS cur_start, so.end_at AS cur_end, so.notes AS cur_occ_note
        FROM allocation a
   LEFT JOIN session_occurrence so ON so.occurrence_id = a.session_id
       WHERE a.allocation_id = $1
      `,
      [allocationId],
    );
    if (!alloc)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 1) Update allocation row core fields if present
    {
      const sets = [];
      const vals = [];
      if (user_id !== undefined) {
        sets.push(`user_id = $${vals.length + 1}`);
        vals.push(user_id);
      }
      if (paycode_id !== undefined) {
        sets.push(`paycode_id = $${vals.length + 1}`);
        vals.push(paycode_id);
      }
      if (status !== undefined) {
        sets.push(`status = $${vals.length + 1}`);
        vals.push(status);
      }

      // unscheduled notes
      if (note !== undefined) {
        sets.push(`note = $${vals.length + 1}`);
        vals.push(note);
      }

      if (sets.length) {
        vals.push(allocationId);
        await query(
          `UPDATE allocation SET ${sets.join(", ")} WHERE allocation_id = $${vals.length}`,
          vals,
        );
      }
    }

    // 2) If time fields provided AND this is scheduled, update *this* occurrence
    const hasAnyTime = session_date || start_at || end_at;
    const hasAllTime = session_date && start_at && end_at;
    if (hasAnyTime && !hasAllTime) {
      return NextResponse.json(
        { error: "Provide session_date, start_at and end_at together." },
        { status: 400 },
      );
    }
    if (hasAllTime) {
      if (!alloc.session_id) {
        return NextResponse.json(
          { error: "Cannot set schedule on an unscheduled allocation." },
          { status: 400 },
        );
      }
      await query(
        `UPDATE session_occurrence
            SET session_date = $2::date,
                start_at     = $3::time,
                end_at       = $4::time
          WHERE occurrence_id = $1`,
        [alloc.session_id, session_date, start_at, end_at],
      );
    }

    // 4) Propagation (optional)
    const doProp =
      Array.isArray(propagate_occurrence_ids) &&
      propagate_occurrence_ids.length > 0;
    if (doProp) {
      // Filter target occurrences to the same activity for safety
      const { rows: validTargets } = await query(
        `
        SELECT occurrence_id, session_date, start_at, end_at, notes
          FROM session_occurrence
         WHERE activity_id = $1
           AND occurrence_id = ANY($2::int[])
        ORDER BY session_date, start_at, occurrence_id
        `,
        [alloc.activity_id, propagate_occurrence_ids],
      );

      // Derive “new time” from payload (if start/end selected). If not selected, keep each row’s existing time.
      const changeStart = propagate_fields?.includes("start") && start_at;
      const changeEnd = propagate_fields?.includes("end") && end_at;
      const changeTutor =
        propagate_fields?.includes("tutor") && user_id !== undefined;
      const changePay =
        propagate_fields?.includes("paycode") && paycode_id !== undefined;
      const changeNotes =
        propagate_fields?.includes("notes") && note !== undefined;

      for (const t of validTargets) {
        // 4a) Move to chosen weekday within the same week (if requested)
        let newDate = t.session_date;
        if (
          propagate_dow &&
          DOW_OFFSETS[propagate_dow] !== undefined &&
          t.session_date
        ) {
          // Monday-of-week + offset
          const {
            rows: [{ monday }],
          } = await query(
            `SELECT date_trunc('week', $1::date)::date AS monday`,
            [t.session_date],
          );
          const offset = DOW_OFFSETS[propagate_dow]; // 0..6
          const {
            rows: [{ d }],
          } = await query(
            `SELECT ($1::date + ($2||' days')::interval)::date AS d`,
            [monday, String(offset)],
          );
          newDate = d;
        }

        // 4b) Apply occurrence-level changes (date/start/end only — no notes now)
        if (propagate_dow || changeStart || changeEnd) {
          await query(
            `
            UPDATE session_occurrence
              SET session_date = COALESCE($2::date, session_date),
                  start_at     = COALESCE($3::time, start_at),
                  end_at       = COALESCE($4::time, end_at)
            WHERE occurrence_id = $1
            `,
            [
              t.occurrence_id,
              newDate,
              changeStart ? start_at : null,
              changeEnd ? end_at : null,
            ],
          );
        }

        // 4c) Apply allocation-level changes (tutor/paycode) for that occurrence
        if (changeTutor || changePay) {
          await query(
            `
            UPDATE allocation
               SET user_id   = COALESCE($3, user_id),
                   paycode_id= COALESCE($4, paycode_id)
             WHERE activity_id = $1
               AND session_id  = $2
            `,
            [
              alloc.activity_id,
              t.occurrence_id,
              changeTutor ? user_id : null,
              changePay ? paycode_id : null,
            ],
          );
        }
        // 4c) Apply allocation-level NOTE changes across selected occurrences
        if (changeNotes) {
          await query(
            `
            UPDATE allocation
              SET note = CASE
                            WHEN $3::text = 'append' THEN
                              COALESCE(NULLIF(note,''),'') ||
                              CASE WHEN note IS NULL OR note = '' THEN '' ELSE E'\n\n' END ||
                              $2::text
                            ELSE $2::text
                          END
            WHERE activity_id = $1
              AND session_id  = $4
            `,
            [
              alloc.activity_id, // $1
              note, // $2
              propagate_notes_mode || "overwrite", // $3
              t.occurrence_id, // $4
            ],
          );
        }
      }
    }

    // 5) Return refreshed row (same shape your page renders)
    const {
      rows: [updated],
    } = await query(
      `
      SELECT a.allocation_id AS id,
             a.user_id,
             u.first_name, u.last_name, u.email,
             cu.unit_code, cu.unit_name,
             so.session_date, so.start_at, so.end_at, a.note AS note,
             ta.activity_type, ta.activity_name,
             a.status, a.paycode_id, a.activity_id AS allocation_activity_id,
             a.mode, a.allocated_hours
        FROM allocation a
   LEFT JOIN users u             ON u.user_id = a.user_id
   LEFT JOIN session_occurrence so ON so.occurrence_id = a.session_id
   LEFT JOIN teaching_activity ta ON ta.activity_id = a.activity_id
   LEFT JOIN unit_offering uo      ON uo.offering_id = ta.unit_offering_id
   LEFT JOIN course_unit cu        ON cu.unit_code = uo.course_unit_id
       WHERE a.allocation_id = $1
      `,
      [allocationId],
    );

    return NextResponse.json({ ok: true, row: updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
