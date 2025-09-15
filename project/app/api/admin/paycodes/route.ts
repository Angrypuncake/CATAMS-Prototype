// app/api/admin/paycodes/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * GET /api/admin/paycodes
 */
export async function GET() {
try {
    const sql = `
    SELECT code, paycode_description, amount
    FROM paycode
    ORDER BY code ASC
    LIMIT 1000
    `;
    const { rows } = await query(sql);
    return NextResponse.json({ data: rows });
} catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
}
}
