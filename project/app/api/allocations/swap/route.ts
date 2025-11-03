import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Incoming swap request body:", body);

    const { allocA_id, allocB_id } = body;

    const allocA = Number(allocA_id);
    const allocB = Number(allocB_id);
    console.log("🔢 Parsed allocation IDs:", { allocA, allocB });

    if (!allocA || !allocB || Number.isNaN(allocA) || Number.isNaN(allocB)) {
      console.warn("⚠️ Invalid allocation IDs detected");
      return NextResponse.json({ error: "Invalid allocation IDs" }, { status: 400 });
    }

    // 1️⃣ Fetch both allocations
    console.log("🕵️ Fetching allocations:", allocA, allocB);
    const fetchSQL = `
      SELECT allocation_id, user_id
      FROM allocation
      WHERE allocation_id IN ($1, $2);
    `;
    const { rows } = await query(fetchSQL, [allocA, allocB]);
    console.log("📦 Query result rows:", rows);

    if (rows.length !== 2) {
      console.warn("⚠️ Missing allocations for one or both IDs");
      return NextResponse.json({ error: "One or both allocations not found" }, { status: 404 });
    }

    // ✅ Convert user_ids to integers (fixes your error)
    const [a, b] = rows;
    const userA = Number(a.user_id);
    const userB = Number(b.user_id);

    console.log("👤 Swapping users:", {
      userA,
      userB,
      typeofUserA: typeof userA,
      typeofUserB: typeof userB,
    });

    if (Number.isNaN(userA) || Number.isNaN(userB)) {
      return NextResponse.json({ error: "Invalid user_id values" }, { status: 400 });
    }

    // 2️⃣ Perform swap
    const updateSQL = `
  UPDATE allocation
  SET user_id = CASE 
    WHEN allocation_id = $1 THEN $3::int
    WHEN allocation_id = $2 THEN $4::int
  END,
  status = 'swapped'
  WHERE allocation_id IN ($1, $2);
`;

    console.log("🧾 Final param types:", {
      allocA,
      typeA: typeof allocA,
      allocB,
      typeB: typeof allocB,
      userA,
      typeUserA: typeof userA,
      userB,
      typeUserB: typeof userB,
    });

    const updateRes = await query(updateSQL, [
      Number(allocA),
      Number(allocB),
      Number(userB),
      Number(userA),
    ]);
    console.log("✅ Update result:", updateRes.rowCount, "rows updated");
    // 3️⃣ Return response
    return NextResponse.json({
      status: "success",
      swapped: [
        { allocation_id: allocA, new_user_id: userB },
        { allocation_id: allocB, new_user_id: userA },
      ],
    });
  } catch (error) {
    console.error(" [SWAP ERROR]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
