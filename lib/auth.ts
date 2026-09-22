import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

const sessionCookie = "nikboni_session";
const sessionDuration = 1000 * 60 * 60 * 24 * 7;
const sessionSecret =
  process.env.AUTH_SECRET ?? "nikboni-local-development-secret";

type SessionPayload = {
  customerId: string;
  expiresAt: number;
};

function sign(value: string) {
  return createHmac("sha256", sessionSecret).update(value).digest("hex");
}

export function createSessionValue(customerId: string) {
  const payload: SessionPayload = {
    customerId,
    expiresAt: Date.now() + sessionDuration,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifySessionValue(value: string | undefined): SessionPayload | null {
  if (!value) return null;

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = sign(encodedPayload);
  const receivedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as SessionPayload;
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export async function getSessionCustomerId() {
  const cookieStore = await cookies();
  return (
    verifySessionValue(cookieStore.get(sessionCookie)?.value)?.customerId ??
    null
  );
}

export function setSessionCookie(response: NextResponse, customerId: string) {
  response.cookies.set(sessionCookie, createSessionValue(customerId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDuration / 1000,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(sessionCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
