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
    const limitedRecords = records.slice(0, MAX_INSERT);

    // Placeholder for SQL insert — not functional yet
    // for (const row of limitedRecords) {
    //   await query(
    //     `INSERT INTO allocations_staging (...) VALUES (...)`,
    //     [...]
    //   );
    // }

    // Just return preview for now
    return NextResponse.json({
      rows: records.length,
      inserted: 0, // no DB writes yet
      preview: limitedRecords,
    });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json(
      { error: "Failed to import file" },
      { status: 500 },
    );
  }
}
