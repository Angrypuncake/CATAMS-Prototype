import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { useremail, password } = await request.json();

    if (!useremail || typeof useremail !== "string" || !useremail.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    try {
      const user = await query(
        `
            SELECT email, user_id
            FROM users
            WHERE email = $1
            `,
        [useremail],
      );

      if (!user.rows || user.rows.length === 0) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 },
        );
      }

      const userData = user.rows[0];

      if (password === userData.id) {
        return NextResponse.json({
          success: true,
          message: "Login successful",
          userId: userData.user_id,
          email: userData.email,
        });
      } else {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 },
        );
      }
    } catch (e) {
      console.error("Database error:", e);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in login request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
