// app/api/tutor/allocations/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const pageRaw = searchParams.get("page") ?? "1";
    const limitRaw = searchParams.get("limit") ?? "50";
    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(limitRaw, 10) || 50), 100);
    const offset = (page - 1) * limit;

    // be forgiving: only accept pure digits, else ignore filter
    const userIdRaw = searchParams.get("userId") ?? "";
    const userId = /^\d+$/.test(userIdRaw) ? Number(userIdRaw) : null;

    const where = userId ? "WHERE a.user_id = $3" : "";

    const sql = `
      SELECT
        a.allocation_id AS id,
        a.user_id,
        u.first_name,
        u.last_name,
        u.email,
        cu.unit_code,
        cu.unit_name,
        so.session_date,
        so.start_at,
        so.end_at,
        so.location,
        so.note,
        ta.activity_type,
        ta.activity_name,
        a.status
      FROM public.allocation a
      JOIN public.session_occurrence so ON so.occurrence_id = a.session_id
      JOIN public.teaching_activity  ta ON ta.activity_id      = so.activity_id
      JOIN public.unit_offering      uo ON uo.offering_id      = ta.unit_offering_id
      JOIN public.course_unit        cu ON cu.unit_code        = uo.course_unit_id
      LEFT JOIN public.users          u ON u.user_id           = a.user_id
      ${where}
      ORDER BY so.session_date NULLS LAST, so.start_at NULLS LAST, a.allocation_id
      LIMIT $1 OFFSET $2
    `;

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM public.allocation a
      JOIN public.session_occurrence so ON so.occurrence_id = a.session_id
      JOIN public.teaching_activity  ta ON ta.activity_id      = so.activity_id
      JOIN public.unit_offering      uo ON uo.offering_id      = ta.unit_offering_id
      JOIN public.course_unit        cu ON cu.unit_code        = uo.course_unit_id
      ${userId ? "WHERE a.user_id = $1" : ""}
    `;

    const params = userId ? [limit, offset, userId] : [limit, offset];
    const countParams = userId ? [userId] : [];

    const [result, countResult] = await Promise.all([
      query(sql, params),
      query(countSql, countParams),
    ]);

    return NextResponse.json({
      page,
      limit,
      total: countResult.rows[0]?.total ?? 0,
      data: result.rows,
    });
  } catch (err: any) {
    console.error("GET /api/tutor/allocations failed:", err);
    return NextResponse.json(
      { error: "Internal error", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
