import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = await req.json();

  if (password === process.env.ACCESS_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("access_token", password, {
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });
    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
