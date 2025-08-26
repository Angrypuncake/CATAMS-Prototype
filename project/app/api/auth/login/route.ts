//This file would be used to contain the route for user login API
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("Backend received a request");
    return NextResponse.json({ reply: "Hello from backend!" });
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
