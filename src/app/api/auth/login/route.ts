import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Standard hardcoded auth for demo/admin
    if (email === "admincma@gmail.com" && password === "@dm1nCM4") {
      const cookieStore = await cookies();
      cookieStore.set("adminAuth", "true", { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
