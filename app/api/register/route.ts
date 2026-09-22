import { NextResponse } from "next/server";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
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

type RegistrationPayload = {
  name?: unknown;
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

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegistrationPayload;
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const email =
      typeof payload.email === "string"
        ? payload.email.trim().toLowerCase()
        : "";
    const password =
      typeof payload.password === "string" ? payload.password : "";

    if (
      name.length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 8
    ) {
      return NextResponse.json(
        { error: "Please provide valid registration details." },
        { status: 400 },
      );
    }

    const customers = await readCustomers();
    if (customers.some((customer) => customer.email === email)) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const customer: CustomerRecord = {
      id: randomBytes(12).toString("hex"),
      name,
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    customers.push(customer);
    await fs.mkdir(path.dirname(customersFile), { recursive: true });
    await fs.writeFile(
      customersFile,
      `${JSON.stringify(customers, null, 2)}\n`,
      "utf8",
    );

    return NextResponse.json(
      { message: "Your account has been created." },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "We could not create your account right now." },
      { status: 500 },
    );
  }
}
