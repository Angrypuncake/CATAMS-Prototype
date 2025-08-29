import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    let records: unknown[] = [];

    if (filename.endsWith(".csv")) {
      const text = await file.text();
      records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        from_line: 1, // ✔ skip 1 junk row; row 2 becomes headers
      });
    } else if (filename.endsWith(".xlsx")) {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
        cellDates: true,
      });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      records = XLSX.utils.sheet_to_json(sheet, {
        range: 2, // ✔ skip 1 junk row; row 2 is headers
      });
    }

    // Insert into staging
    // Limit how many rows to insert (e.g. 50 for MVP)
    const MAX_INSERT = 50;

    // Insert into staging (but cap)
    const limitedRecords = records.slice(0, MAX_INSERT);

    for (const row of limitedRecords) {
      await query(
        `
        INSERT INTO allocations_staging
        (unit_code, unit_name, session, anticipated_enrolments, actual_enrolments,
        allocation_status, error_text, activity_type, activity_description, activity_name,
        activity_date, activity_start, activity_end, paycode, teaching_role, staff_id,
        staff_name, faculty, school, department, units_hours)
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
        `,
        [
          row.unit_of_study_code || row.unit_code,
          row.unit_of_study_name || row.unit_name,
          row.session,
          row.anticipated_enrolments,
          row.actual_enrolments,
          row.allocation_status,
          row.error_text,
          row.activity_type,
          row.activity_description,
          row.activity_name,
          row.activity_date,
          row.activity_start,
          row.activity_end,
          row.paycode,
          row.teaching_role,
          row.staffid || row.staff_id,
          row.name || row.staff_name,
          row.faculty,
          row.school,
          row.department,
          row["units_(hrs)"] || row.units_hours,
        ],
      );
    }

    return NextResponse.json({
      rows: records.length,
      inserted: limitedRecords.length,
      preview: records.slice(0, 5),
    });
    return NextResponse.json({
      rows: records.length,
      preview: records.slice(0, 5),
    });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json(
      { error: "Failed to import file" },
      { status: 500 },
    );
  }
}
