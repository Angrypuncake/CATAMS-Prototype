// app/api/admin/overview/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const [usersRes, allocationsRes, tableRes] = await Promise.all([
    query(`SELECT COUNT(*) AS total_users FROM public.users`),
    query(`SELECT COUNT(*) AS total_allocations FROM public.allocation`),
    query(`
      SELECT
        u.first_name || ' ' || u.last_name AS name,
        u.email,
        r.role_name AS role,
        COUNT(DISTINCT ur.unit_offering_id) AS units,
        'Active'::text AS status
      FROM public.user_role ur
      JOIN public.users u ON u.user_id = ur.user_id
      JOIN public.role  r ON r.role_id  = ur.role_id
      GROUP BY u.user_id, u.first_name, u.last_name, u.email, r.role_name
      ORDER BY role, name
      LIMIT 10
    `),
  ]);

  return NextResponse.json({
    totals: {
      users: usersRes.rows[0].total_users,
      allocations: allocationsRes.rows[0].total_allocations,
    },
    userRoles: tableRes.rows,
  });
}
