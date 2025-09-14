import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }

    console.log("User logged in:", username.trim());

    return NextResponse.json({
      success: true,
      message: "Login successful",
      username: username.trim(),
    });
  } catch (error) {
    console.error("Error in login request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
