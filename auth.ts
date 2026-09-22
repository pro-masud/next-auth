import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        const customers = await readCustomers();
        const customer = customers.find((item) => item.email === email);
        if (
          !customer ||
          !(await passwordMatches(password, customer.passwordHash))
        ) {
          return null;
        }

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.customerId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.customerId) {
        session.user.id = token.customerId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
