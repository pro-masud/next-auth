import { clearSessionCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "You have been signed out." });
  clearSessionCookie(response);
  return response;
}
