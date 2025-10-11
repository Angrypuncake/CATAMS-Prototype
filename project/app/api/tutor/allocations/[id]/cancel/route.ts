export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthedUserRow } from "@/lib/auth";

type Body = {
    reason: string;
    replacementMode: "suggest" | "coordinator";
    timing: ">48h" | "24-48h" | "<24h";
    suggestedUserId?: number | null;
    ack: boolean;
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const me = await getAuthedUserRow();
    if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const allocationId = Number(params.id);
    const body = (await req.json()) as Body;

    if (!Number.isFinite(allocationId) || !body.reason?.trim() || !body.ack) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const details = {
        replacement_mode: body.replacementMode,
        timing: body.timing,
        suggested_user_id: body.replacementMode === "suggest" ? body.suggestedUserId ?? null : null,
        ack: body.ack,
    };

    const sql = `
    INSERT INTO public.request
      (requester_id, allocation_id, request_type, request_status,
       request_reason, details, created_at, updated_at)
    VALUES
      ($1, $2, 'cancellation', 'pending_uc',
       $3, $4, NOW(), NOW())
    RETURNING request_id
  `;

    const { rows } = await query(sql, [me.user_id, allocationId, body.reason.trim(), details]);
    return NextResponse.json({ ok: true, requestId: rows[0].request_id });
}
