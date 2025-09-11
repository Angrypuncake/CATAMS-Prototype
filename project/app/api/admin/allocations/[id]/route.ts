// File: app/api/admin/allocations/[id]/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { z } from "zod";

const Status = z.enum(["Confirmed", "Pending", "Cancelled"]);
const BodySchema = z
  .object({
    // Every field optional for partial patch:
    user_id: z.number().int().positive().optional(),
    session_id: z.number().int().positive().optional(),
    paycode_id: z.string().min(1).optional(),
    teaching_role: z.string().min(1).optional(),
    status: Status.optional(),
    note: z.string().nullable().optional(),
    override_note: z.string().nullable().optional(),
    // Optional optimistic lock:
    if_updated_at: z.string().datetime().optional(),
  })
  .strict();

const ALLOWED_COLS: Record<string, string> = {
  user_id: "user_id",
  session_id: "session_id",
  paycode_id: "paycode_id",
  teaching_role: "teaching_role",
  status: "status",
  note: "note",
  override_note: "override_note",
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const json = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const body = parsed.data;

  // Build SET list from whitelist
  const sets: string[] = [];
  const vals: Array<string | number | null> = [];
  for (const [k, v] of Object.entries(body)) {
    if (k === "if_updated_at") continue; // not a DB column
    const col = ALLOWED_COLS[k];
    if (!col) continue; // ignore unknowns (schema .strict() would already block)
    sets.push(`${col} = $${vals.length + 1}`);
    vals.push(v);
  }
  if (sets.length === 0) {
    return NextResponse.json({ ok: true, message: "No changes." });
  }

  // Optional optimistic concurrency guard
  let where = `allocation_id = $${vals.length + 1}`;
  vals.push(id);
  if (body.if_updated_at) {
    where += ` AND updated_at = $${vals.length + 1}`;
    vals.push(body.if_updated_at);
  }

  // Transaction with audit log
  const begin = "BEGIN";
  const lockSql = `
    SELECT to_jsonb(a.*) AS before
    FROM allocation a
    WHERE ${where}
    FOR UPDATE
  `;
  const updateSql = `
    UPDATE allocation
    SET ${sets.join(", ")}, updated_at = now()
    WHERE ${where}
    RETURNING to_jsonb(allocation.*) AS after
  `;
  const auditSql = `
    INSERT INTO audit_log (user_id, entity, entity_id, action, before_json, after_json)
    VALUES ($1, 'allocation', $2, 'update', $3, $4)
  `;

  try {
    await query(begin);
    const beforeRes = await query(lockSql, vals);
    if (beforeRes.rowCount === 0) {
      await query("ROLLBACK");
      return NextResponse.json(
        { error: body.if_updated_at ? "Conflict or not found" : "Not found" },
        { status: body.if_updated_at ? 409 : 404 },
      );
    }
    const before = beforeRes.rows[0].before;
    const afterRes = await query(updateSql, vals);
    const after = afterRes.rows[0]?.after;

    // Use your auth context for actor id; fallback to null
    const actorUserId = null;
    await query(auditSql, [actorUserId, id, before, after]);
    await query("COMMIT");

    return NextResponse.json({ ok: true, data: after });
  } catch (e) {
    await query("ROLLBACK");
    // Rely on DB constraints to block FK violations, relay a clean message
    return NextResponse.json(
      { error: "Update failed", detail: String(e) },
      { status: 400 },
    );
  }
}
