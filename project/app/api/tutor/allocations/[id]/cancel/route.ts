// app/api/tutor/allocations/[id]/cancel/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

type Body = {
    reason?: string;
    replacementMode?: "suggest" | "coordinator";
    timing?: ">48h" | "24-48h" | "<24h";
    suggestedUserId?: number | null;
    ack?: boolean;
};

// shared insert fn
async function insertCancellation(
    allocationId: number,
    requesterId: number,
    body: Body
) {
    const details = {
        replacement_mode: body.replacementMode ?? "coordinator",
        timing: body.timing ?? ">48h",
        suggested_user_id:
            (body.replacementMode ?? "coordinator") === "suggest"
                ? body.suggestedUserId ?? null
                : null,
        ack: body.ack ?? true,
    };

    // NOTE: we do NOT set request_status to avoid enum mismatches; null is fine
    const sql = `
    INSERT INTO public.request
      (requester_id, allocation_id, request_type, request_reason, details, created_at, updated_at)
    VALUES
      ($1, $2, 'cancellation', $3, $4, NOW(), NOW())
    RETURNING request_id
  `;

    const { rows } = await query(sql, [
        requesterId,
        allocationId,
        (body.reason ?? "Cancellation via cancel page").toString().slice(0, 500),
        details,
    ]);
    return rows[0].request_id as number;
}

// GET support so “visiting the URL” can also trigger it (use with care)
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const allocationId = Number(params.id);
        if (!Number.isFinite(allocationId)) {
            return NextResponse.json({ error: "Bad allocation id" }, { status: 400 });
        }

        // find the allocation + its current tutor
        const { rows: allocRows } = await query(
            `SELECT allocation_id, user_id FROM public.allocation WHERE allocation_id = $1 LIMIT 1`,
            [allocationId]
        );
        if (!allocRows.length) {
            return NextResponse.json({ error: "Allocation not found" }, { status: 404 });
        }

        const url = new URL(req.url);
        const body: Body = {
            reason: url.searchParams.get("reason") ?? undefined,
            replacementMode: (url.searchParams.get("mode") as any) ?? undefined,
            timing: (url.searchParams.get("timing") as any) ?? undefined,
            suggestedUserId: url.searchParams.get("suggestedUserId")
                ? Number(url.searchParams.get("suggestedUserId"))
                : undefined,
            ack: url.searchParams.get("ack") ? url.searchParams.get("ack") === "true" : undefined,
        };

        const requestId = await insertCancellation(allocationId, allocRows[0].user_id, body);
        return NextResponse.json({ ok: true, requestId });
    } catch (err: any) {
        console.error("GET cancel error:", err);
        return NextResponse.json(
            { error: "Internal error", detail: String(err?.message || err) },
            { status: 500 }
        );
    }
}

// normal POST (also no-auth), used by your form submit
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const allocationId = Number(params.id);
        if (!Number.isFinite(allocationId)) {
            return NextResponse.json({ error: "Bad allocation id" }, { status: 400 });
        }

        // find the allocation + its current tutor
        const { rows: allocRows } = await query(
            `SELECT allocation_id, user_id FROM public.allocation WHERE allocation_id = $1 LIMIT 1`,
            [allocationId]
        );
        if (!allocRows.length) {
            return NextResponse.json({ error: "Allocation not found" }, { status: 404 });
        }

        const body = (await req.json().catch(() => ({}))) as Body;
        const requestId = await insertCancellation(allocationId, allocRows[0].user_id, body);
        return NextResponse.json({ ok: true, requestId });
    } catch (err: any) {
        console.error("POST cancel error:", err);
        return NextResponse.json(
            { error: "Internal error", detail: String(err?.message || err) },
            { status: 500 }
        );
    }
}
