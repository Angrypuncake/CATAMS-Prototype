import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  // demouser@demo.edu 10
  try {
    const { useremail } = await request.json();
    console.log(useremail);
    try {
      const user = await query(
        `
            SELECT email, user_id
            FROM users
            WHERE email = $1
            `,
        [useremail],
      );
      console.log(user);
    } catch (e) {
      console.log(e);
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error in login request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
