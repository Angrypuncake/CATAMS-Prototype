// app/api/admin/tutors/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * GET /api/admin/tutors
 * Optional: ?q=search  (matches first/last/email)
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q")?.trim();

        const params: any[] = [];
        let where = "";
        if (q && q.length > 0) {
            params.push(`%${q}%`);
            where = `
        WHERE first_name ILIKE $1
        OR last_name  ILIKE $1
        OR email      ILIKE $1
        `;
        }

        const sql = `
    SELECT user_id, first_name, last_name, email
    FROM users
    ${where}
    ORDER BY last_name NULLS LAST, first_name NULLS LAST, email ASC
    LIMIT 1000
    `;
        const { rows } = await query(sql, params);
        return NextResponse.json({ data: rows });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
    }
}
