import { setSessionCookie } from "@/lib/auth";
import { NextResponse } from "next/server";
import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const customersFile = path.join(
  process.cwd(),
  ".data",
  "registration",
  "customers.json",
);

type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

type LoginPayload = {
  email?: unknown;
  password?: unknown;
};

async function readCustomers(): Promise<CustomerRecord[]> {
  try {
    const file = await fs.readFile(customersFile, "utf8");
    const parsed = JSON.parse(file);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function passwordMatches(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(key, "hex");
  return (
    storedKey.length === derivedKey.length &&
    timingSafeEqual(storedKey, derivedKey)
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginPayload;
    const email =
      typeof payload.email === "string"
        ? payload.email.trim().toLowerCase()
        : "";
    const password =
      typeof payload.password === "string" ? payload.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter your email and password." },
        { status: 400 },
      );
    }

    const customers = await readCustomers();
    const customer = customers.find((item) => item.email === email);
    const validPassword = customer
      ? await passwordMatches(password, customer.passwordHash)
      : false;

    if (!customer || !validPassword) {
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      message: `Welcome back, ${customer.name}.`,
      customer: { id: customer.id, name: customer.name, email: customer.email },
    });
    setSessionCookie(response, customer.id);
    return response;
  } catch {
    return NextResponse.json(
      { error: "We could not sign you in right now." },
      { status: 500 },
    );
  }
}
