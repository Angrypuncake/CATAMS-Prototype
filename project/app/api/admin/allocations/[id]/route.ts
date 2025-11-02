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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allocationId = Number(id);
  if (!allocationId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));

  console.log("PATCH allocations/:id payload", body);

  const {
    user_id,
    paycode_id,
    status,
    note,
    session_date,
    start_at,
    end_at,
    location,
    propagate_fields, // ["tutor","paycode","start","end","note"]
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
    location?: string;
    propagate_fields?: ("tutor" | "paycode" | "start" | "end" | "note" | "status" | "location")[];
    propagate_notes_mode?: "overwrite" | "append";
    propagate_dow?: Weekday;
    propagate_occurrence_ids?: number[];
  };

  try {
    // Load current allocation + its occurrence + its activity
    console.log("test!!!!!");
    const {
      rows: [alloc],
    } = await query(
      `
      SELECT a.allocation_id, a.user_id AS tutor_user_id, a.paycode_id, a.status,
             so.note AS note, a.session_id, so.activity_id as allocation_activity_id,
             so.session_date AS cur_date, so.start_at AS cur_start, so.end_at AS cur_end
        FROM allocation a
   LEFT JOIN session_occurrence so ON so.occurrence_id = a.session_id
       WHERE a.allocation_id = $1
      `,
      [allocationId]
    );
    if (!alloc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 1) Update allocation row core fields if present
    console.log("test blah");
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

      if (sets.length) {
        vals.push(allocationId);
        console.log(
          "SQL:",
          `UPDATE allocation SET ${sets.join(", ")} WHERE allocation_id = $${vals.length}`
        );
        console.log("Values:", vals);
        await query(
          `UPDATE allocation SET ${sets.join(", ")} WHERE allocation_id = $${vals.length}`,
          vals
        );
      }
    }

    console.log("test2");
    // 2) If time fields provided AND this is scheduled, update *this* occurrence
    const hasAnyTime = session_date || start_at || end_at;
    const hasAllTime = session_date && start_at && end_at;
    if (hasAnyTime && !hasAllTime) {
      return NextResponse.json(
        { error: "Provide session_date, start_at and end_at together." },
        { status: 400 }
      );
    }
    if (hasAllTime) {
      if (!alloc.session_id) {
        return NextResponse.json(
          { error: "Cannot set schedule on an unscheduled allocation." },
          { status: 400 }
        );
      }
      console.log("Date read as", session_date);
      await query(
        `UPDATE session_occurrence
            SET session_date = $2::date,
                start_at     = $3::time,
                end_at       = $4::time
          WHERE occurrence_id = $1`,
        [alloc.session_id, session_date, start_at, end_at]
      );
    }

    if (location) {
      if (!alloc.session_id) {
        return NextResponse.json(
          { error: "Cannot set schedule on an unscheduled allocation." },
          { status: 400 }
        );
      }
      await query(
        `UPDATE session_occurrence
           SET location = $2
         WHERE occurrence_id = $1`,
        [alloc.session_id, location]
      );
    }

    if (note) {
      if (!alloc.session_id) {
        return NextResponse.json(
          { error: "Cannot set schedule on an unscheduled allocation." },
          { status: 400 }
        );
      }
      console.log(alloc.note);
      const result = await query(
        `UPDATE session_occurrence
           SET note = COALESCE($2, note)
         WHERE occurrence_id = $1`,
        [alloc.session_id, note]
      );
      console.log("Rows updated:", result.rowCount);
    }

    console.log("Propagation intent", {
      propagateFields: body.propagate_fields,
      propagateOccIds: body.propagate_occurrence_ids,
      propagateDow: body.propagate_dow,
    });

    // 4) Propagation (optional)
    const doProp = Array.isArray(propagate_occurrence_ids) && propagate_occurrence_ids.length > 0;
    if (doProp) {
      // Filter target occurrences to the same activity for safety
      const { rows: validTargets } = await query(
        `
        SELECT occurrence_id, session_date, start_at, end_at, description
          FROM session_occurrence
         WHERE activity_id = $1
           AND occurrence_id = ANY($2::int[])
        ORDER BY session_date, start_at, occurrence_id
        `,
        [alloc.allocation_activity_id, propagate_occurrence_ids]
      );

      console.log("Propagation request", {
        requested: propagate_occurrence_ids,
        activityId: alloc.allocation_activity_id,
        validTargets,
      });

      // Derive “new time” from payload (if start/end selected). If not selected, keep each row’s existing time.
      const changeStart = propagate_fields?.includes("start") && start_at;
      const changeEnd = propagate_fields?.includes("end") && end_at;
      const changeTutor = propagate_fields?.includes("tutor") && user_id !== undefined;
      const changePay = propagate_fields?.includes("paycode") && paycode_id !== undefined;
      const changeNotes = propagate_fields?.includes("note") && note !== undefined;
      const changeStatus = propagate_fields?.includes("status") && status != null;

      const changeLocation = propagate_fields?.includes("location") && location != null;

      console.log("Propagation change flags", {
        changeStart,
        changeEnd,
        changeTutor,
        changePay,
        changeNotes,
        changeLocation,
      });

      for (const t of validTargets) {
        // 4a) Move to chosen weekday within the same week (if requested)

        let newDate = t.session_date;
        console.log("Processing target occurrence", t.occurrence_id, {
          original: t,
          newDate,
          apply: {
            tutor: changeTutor,
            paycode: changePay,
            start: changeStart,
            end: changeEnd,
            note: changeNotes,
            location: changeLocation,
          },
        });

        if (propagate_dow && DOW_OFFSETS[propagate_dow] !== undefined && t.session_date) {
          // Monday-of-week + offset
          const {
            rows: [{ monday }],
          } = await query(`SELECT date_trunc('week', $1::date)::date AS monday`, [t.session_date]);
          console.log("Updated occurrence timing", {
            occurrenceId: t.occurrence_id,
            newDate,
            start_at,
            end_at,
          });
          console.log("Updated allocation tutor/paycode", {
            occurrenceId: t.occurrence_id,
            user_id,
            paycode_id,
          });

          const offset = DOW_OFFSETS[propagate_dow]; // 0..6
          const {
            rows: [{ d }],
          } = await query(`SELECT ($1::date + ($2||' days')::interval)::date AS d`, [
            monday,
            String(offset),
          ]);
          console.log("Updated occurrence timing", {
            occurrenceId: t.occurrence_id,
            newDate,
            start_at,
            end_at,
          });
          console.log("Updated allocation tutor/paycode", {
            occurrenceId: t.occurrence_id,
            user_id,
            paycode_id,
          });

          newDate = d;
        }

        // 4b) Apply occurrence-level changes (date/start/end and location — no note now)
        if (propagate_dow || changeStart || changeEnd || location) {
          await query(
            `
            UPDATE session_occurrence
              SET session_date = COALESCE($2::date, session_date),
                  start_at     = COALESCE($3::time, start_at),
                  end_at       = COALESCE($4::time, end_at),
                  location     = COALESCE($5, location) 
            WHERE occurrence_id = $1
            `,
            [
              t.occurrence_id,
              newDate,
              changeStart ? start_at : null,
              changeEnd ? end_at : null,
              changeLocation ? location : null,
            ]
          );
          console.log("Updated occurrence timing", {
            occurrenceId: t.occurrence_id,
            newDate,
            start_at,
            end_at,
          });
          console.log("Updated allocation tutor/paycode", {
            occurrenceId: t.occurrence_id,
            user_id,
            paycode_id,
          });
        }

        // 4c) Apply allocation-level changes (tutor/paycode) for that occurrence
        if (changeTutor || changePay || changeStatus) {
          await query(
            `
            UPDATE allocation a
              SET user_id    = COALESCE($3, a.user_id),
                  paycode_id = COALESCE($4, a.paycode_id),
                  status     = COALESCE($5, a.status)
              FROM session_occurrence so
            WHERE so.activity_id   = $1
              AND so.occurrence_id = $2
              AND a.session_id     = so.occurrence_id
            RETURNING a.allocation_id, a.session_id, a.user_id, a.paycode_id, a.status
            `,
            [
              alloc.allocation_activity_id,
              t.occurrence_id,
              changeTutor ? user_id : null,
              changePay ? paycode_id : null,
              changeStatus ? status : null,
            ]
          );
        }
        // 4c) Apply allocation-level NOTE changes across selected occurrences
        if (changeNotes) {
          console.log("changing notes");
          await query(
            `
              UPDATE session_occurrence so
              SET note = CASE
                            WHEN $3::text = 'append' THEN
                              COALESCE(NULLIF(so.note,''),'')
                              || CASE WHEN so.note IS NULL OR so.note = '' THEN '' ELSE E'\\n\\n' END
                              || $2::text
                            ELSE $2::text
                          END
            FROM allocation a
            WHERE so.activity_id    = $1
              AND so.occurrence_id  = $4
              AND a.session_id      = so.occurrence_id
            RETURNING a.allocation_id, a.session_id, so.note;
            `,
            [
              alloc.allocation_activity_id, // $1
              note, // $2
              propagate_notes_mode || "overwrite", // $3
              t.occurrence_id, // $4
            ]
          );
          console.log("Updated occurrence timing", {
            occurrenceId: t.occurrence_id,
            newDate,
            start_at,
            end_at,
          });
          console.log("Updated allocation tutor/paycode", {
            occurrenceId: t.occurrence_id,
            user_id,
            paycode_id,
          });
          console.log("Updated allocation note", {
            occurrenceId: t.occurrence_id,
            note,
            mode: propagate_notes_mode,
          });
        }
      }
    }
    console.log("about to submit");

    // 5) Return refreshed row (same shape your page renders)
    const {
      rows: [updated],
    } = await query(
      `
      SELECT a.allocation_id AS id,
             a.user_id,
             u.first_name, u.last_name, u.email,
             cu.unit_code, cu.unit_name,
             so.session_date, so.start_at, so.end_at, so.note AS note,
             ta.activity_type, ta.activity_name,
             a.status, a.paycode_id, so.activity_id AS allocation_activity_id,
             ta.mode, so.hours
        FROM allocation a
   LEFT JOIN users u             ON u.user_id = a.user_id
   LEFT JOIN session_occurrence so ON so.occurrence_id = a.session_id
   LEFT JOIN teaching_activity ta ON ta.activity_id = so.activity_id
   LEFT JOIN unit_offering uo      ON uo.offering_id = ta.unit_offering_id
   LEFT JOIN course_unit cu        ON cu.unit_code = uo.course_unit_id
       WHERE a.allocation_id = $1
      `,
      [allocationId]
    );
    console.log("Final updated row", updated);

    return NextResponse.json({ ok: true, row: updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
