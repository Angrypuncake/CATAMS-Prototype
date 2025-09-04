import { NextRequest, NextResponse } from "next/server";
import { parse as parseCsv } from "csv-parse/sync";
import * as XLSX from "xlsx";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const file = fd.get("file") as File | null;
    if (!file)
      return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const name = file.name.toLowerCase();
    let records: unknown[] = [];

    if (name.endsWith(".csv")) {
      records = parseCsv(await file.text(), {
        columns: true,
        skip_empty_lines: true,
      });
    } else if (name.endsWith(".xlsx")) {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const sh = wb.Sheets[wb.SheetNames[0]];
      records = XLSX.utils.sheet_to_json(sh, { raw: true, range: 2 });
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 },
      );
    }

    const MAX_INSERT = 50;
    const limited = records.slice(0, MAX_INSERT);

    // --- NEW: create batch + insert ---
    await query("BEGIN");
    const { rows: b } = await query(
      `INSERT INTO import_batch DEFAULT VALUES RETURNING batch_id`,
    );
    const stagingId: number = b[0].batch_id;

    if (limited.length) {
      const json = JSON.stringify(limited);
      await query(
        `
        WITH p AS (SELECT $1::jsonb AS j)
        INSERT INTO allocations_staging (
          unit_code, unit_name, session, anticipated_enrolments, actual_enrolments,
          allocation_status, error_text, activity_type, activity_description, activity_name,
          activity_date, activity_start, activity_end, paycode, teaching_role, staff_id,
          staff_name, faculty, school, department, units_hours, batch_id
        )
        SELECT
          x.unit_code, x.unit_name, x.session,
          NULLIF(x.anticipated_enrolments,'')::int,
          NULLIF(x.actual_enrolments,'')::int,
          x.allocation_status, x.error_text,
          x.activity_type, x.activity_description, x.activity_name,
          NULLIF(x.activity_date,'')::date,
          NULLIF(x.activity_start,'')::time,
          NULLIF(x.activity_end,'')::time,
          x.paycode, x.teaching_role, x.staff_id, x.staff_name,
          x.faculty, x.school, x.department,
          NULLIF(x.units_hours,'')::numeric,
          $2
        FROM jsonb_to_recordset((SELECT j FROM p)) AS x(
          unit_code text, unit_name text, session text,
          anticipated_enrolments text, actual_enrolments text,
          allocation_status text, error_text text,
          activity_type text, activity_description text, activity_name text,
          activity_date text, activity_start text, activity_end text,
          paycode text, teaching_role text, staff_id text, staff_name text,
          faculty text, school text, department text, units_hours text
        );
        `,
        [json, stagingId],
      );
    }

    await query("COMMIT");

    return NextResponse.json({
      ok: true,
      stagingId,
      rows: records.length,
      inserted: limited.length,
      preview: limited.slice(0, 20), // safe to show small preview
    });
  } catch (err) {
    console.error("Import error:", err);
    try {
      await query("ROLLBACK");
    } catch {}
    return NextResponse.json(
      { error: "Failed to import file" },
      { status: 500 },
    );
  }
}
