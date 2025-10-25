import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(req: Request) {
  const client = await query("BEGIN").catch(() => null);
  if (!client) {
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 },
    );
  }

  try {
    const { allocA_id, allocB_id } = await req.json();

    if (!allocA_id || !allocB_id) {
      await query("ROLLBACK");
      return NextResponse.json(
        { error: "allocA_id and allocB_id are required" },
        { status: 400 },
      );
    }

    // 1️⃣ Get both allocations
    const fetchSQL = `
      SELECT allocation_id, user_id
      FROM allocation
      WHERE allocation_id IN ($1, $2);
    `;
    const { rows } = await query(fetchSQL, [allocA_id, allocB_id]);

    if (rows.length !== 2) {
      await query("ROLLBACK");
      return NextResponse.json(
        { error: "One or both allocations not found" },
        { status: 404 },
      );
    }

    const [a, b] = rows;
    const userA = a.user_id;
    const userB = b.user_id;

    // 2️⃣ Swap the user_ids atomically
    const updateSQL = `
      UPDATE allocation
      SET user_id = CASE 
        WHEN allocation_id = $1 THEN $3
        WHEN allocation_id = $2 THEN $4
      END
      WHERE allocation_id IN ($1, $2);
    `;
    await query(updateSQL, [allocA_id, allocB_id, userB, userA]);

    // 3️⃣ Optionally mark allocations as "swapped" (if status exists)
    await query(
      `UPDATE allocation SET status = 'swapped' WHERE allocation_id IN ($1, $2);`,
      [allocA_id, allocB_id],
    );

    await query("COMMIT");

    return NextResponse.json({
      status: "success",
      swapped: [
        { allocation_id: allocA_id, new_user_id: userB },
        { allocation_id: allocB_id, new_user_id: userA },
      ],
    });
  } catch (error) {
    await query("ROLLBACK");
    console.error("Error swapping allocations:", error);
    return NextResponse.json(
      { error: "Failed to swap allocations" },
      { status: 500 },
    );
  }
}
