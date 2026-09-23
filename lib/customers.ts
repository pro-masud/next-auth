import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
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

export type CustomerRole = "customer" | "administrator";

export type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  role?: CustomerRole;
  loginCount?: number;
  lastLoginAt?: string;
  emailVerificationRequired?: boolean;
  emailVerifiedAt?: string;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: string;
};

export async function readCustomers(): Promise<CustomerRecord[]> {
  try {
    const file = await fs.readFile(customersFile, "utf8");
    const parsed = JSON.parse(file);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function writeCustomers(customers: CustomerRecord[]) {
  await fs.mkdir(path.dirname(customersFile), { recursive: true });
  await fs.writeFile(
    customersFile,
    `${JSON.stringify(customers, null, 2)}\n`,
    "utf8",
  );
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function passwordMatches(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(key, "hex");
  return (
    storedKey.length === derivedKey.length &&
    timingSafeEqual(storedKey, derivedKey)
  );
}

export function createEmailVerificationToken() {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function verifyEmailToken(token: string) {
  if (!token) return "invalid" as const;

  const customers = await readCustomers();
  const tokenHash = hashVerificationToken(token);
  const customerIndex = customers.findIndex(
    (customer) => customer.emailVerificationTokenHash === tokenHash,
  );
  const customer = customers[customerIndex];

  if (!customer || !customer.emailVerificationExpiresAt)
    return "invalid" as const;
  if (new Date(customer.emailVerificationExpiresAt).getTime() < Date.now()) {
    return "expired" as const;
  }

  customers[customerIndex] = {
    ...customer,
    emailVerifiedAt: new Date().toISOString(),
    emailVerificationTokenHash: undefined,
    emailVerificationExpiresAt: undefined,
  };
  await writeCustomers(customers);
  return "verified" as const;
}
