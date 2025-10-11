import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
    const allocationId = Number(params.id);
    if (!Number.isFinite(allocationId)) {
        return NextResponse.json({ error: "Bad allocation id" }, { status: 400 });
    }

    const sql = `
    WITH target AS (
    SELECT a.allocation_id, a.user_id AS current_tutor_id, uo.offering_id
    FROM public.allocation a
    JOIN public.session_occurrence so ON so.occurrence_id = a.session_id
    JOIN public.teaching_activity ta ON ta.activity_id = so.activity_id
    JOIN public.unit_offering uo ON uo.offering_id = ta.unit_offering_id
    WHERE a.allocation_id = $1
    )
    SELECT DISTINCT u.user_id, u.first_name, u.last_name, u.email
    FROM target t
    JOIN public.allocation a2 ON a2.allocation_id <> t.allocation_id
    JOIN public.session_occurrence so2 ON so2.occurrence_id = a2.session_id
    JOIN public.teaching_activity ta2 ON ta2.activity_id = so2.activity_id
    JOIN public.unit_offering uo2 ON uo2.offering_id = ta2.unit_offering_id
    JOIN public.users u ON u.user_id = a2.user_id
    WHERE uo2.offering_id = t.offering_id
    AND u.user_id <> t.current_tutor_id
    ORDER BY u.last_name, u.first_name;
`;

    const { rows } = await query(sql, [allocationId]);
    return NextResponse.json({
        data: rows.map((r: any) => ({
            userId: r.user_id,
            label: `${r.first_name} ${r.last_name}`,
            email: r.email,
        })),
    });
}
