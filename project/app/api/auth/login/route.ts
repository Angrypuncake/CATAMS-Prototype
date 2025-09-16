import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

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

    const user = await query(
      `SELECT email, user_id FROM users WHERE email = $1`,
      [useremail],
    );

    if (!user.rows || user.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const userData = user.rows[0];

    if (password === userData.user_id.toString()) {
      const token = jwt.sign(
        {
          userId: userData.user_id,
          email: userData.email,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" },
      );

      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        userId: userData.user_id,
        email: userData.email,
      });

      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 86400,
        path: "/",
      });

      return response;
    } else {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
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
