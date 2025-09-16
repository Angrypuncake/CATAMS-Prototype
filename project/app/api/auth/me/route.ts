import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  const email = request.headers.get("x-user-email");
  const roles = JSON.parse(request.headers.get("x-user-roles") || "[]");
  console.log(userId);
  return NextResponse.json({ userId, email, roles });
}
