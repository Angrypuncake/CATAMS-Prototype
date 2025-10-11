// app/api/dev/whoami/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getAuthedUserRow } from "@/lib/auth";

export async function GET() {
    const me = await getAuthedUserRow();
    return NextResponse.json({ me });
}