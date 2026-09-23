import {
  createEmailVerificationToken,
  hashPassword,
  readCustomers,
  writeCustomers,
  type CustomerRecord,
} from "@/lib/customers";
import { sendVerificationEmail } from "@/lib/email";
import { NextResponse } from "next/server";

type RegistrationPayload = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
};

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

    const verification = createEmailVerificationToken();

    const customer: CustomerRecord = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
      role: "customer",
      loginCount: 0,
      emailVerificationRequired: true,
      emailVerificationTokenHash: verification.tokenHash,
      emailVerificationExpiresAt: verification.expiresAt,
    };

    const emailResult = await sendVerificationEmail({
      email,
      name,
      token: verification.token,
    });
    customers.push(customer);
    await writeCustomers(customers);

    return NextResponse.json(
      {
        message: emailResult.sent
          ? "Account created. Check your email to verify it."
          : "Account created. Open the development verification link below.",
        verificationUrl: emailResult.sent
          ? undefined
          : emailResult.verificationUrl,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "We could not create your account right now." },
      { status: 500 },
    );
  }
}
