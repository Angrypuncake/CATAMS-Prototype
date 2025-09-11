// app/api/admin/overview/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const [usersRes, allocationsRes, tableRes] = await Promise.all([
    query(`SELECT COUNT(*)::int AS total_users FROM public.users`),
    query(`SELECT COUNT(*)::int AS total_allocations FROM public.allocation`),
    query(`
      SELECT
        u.first_name || ' ' || u.last_name AS name,
        u.email,
        COALESCE(
          ARRAY_AGG(DISTINCT x.role_name) FILTER (WHERE x.role_name IS NOT NULL),
          '{}'
        ) AS roles,
        COALESCE(
          JSONB_OBJECT_AGG(x.role_name, x.role_units) FILTER (WHERE x.role_name IS NOT NULL),
          '{}'::jsonb
        ) AS units_by_role,
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM public.user_role ur2
            WHERE ur2.user_id = u.user_id
          )
          THEN 'Active'
          ELSE 'No roles'
        END AS status
      FROM public.users u
      LEFT JOIN (
        SELECT
          ur.user_id,
          r.role_name,
          COUNT(DISTINCT ur.unit_offering_id) AS role_units
        FROM public.user_role ur
        JOIN public.role r ON r.role_id = ur.role_id
        GROUP BY ur.user_id, r.role_name
      ) x ON x.user_id = u.user_id
      GROUP BY u.user_id, name, u.email
      ORDER BY name
      LIMIT 10;
    `),
  ]);

  return NextResponse.json({
    totals: {
      users: Number(usersRes.rows[0].total_users),
      allocations: Number(allocationsRes.rows[0].total_allocations),
    },
    userRoles: tableRes.rows,
  });
}
