import {
  passwordMatches,
  readCustomers,
  writeCustomers,
} from "@/lib/customers";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

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
        const customerIndex = customers.findIndex(
          (item) => item.email === email,
        );
        const customer = customers[customerIndex];
        if (
          !customer ||
          !(await passwordMatches(password, customer.passwordHash))
        ) {
          return null;
        }
        if (customer.emailVerificationRequired && !customer.emailVerifiedAt) {
          return null;
        }

        const role =
          process.env.AUTH_ADMIN_EMAIL?.trim().toLowerCase() === email
            ? "administrator"
            : (customer.role ?? "customer");
        customers[customerIndex] = {
          ...customer,
          role,
          loginCount: (customer.loginCount ?? 0) + 1,
          lastLoginAt: new Date().toISOString(),
        };
        await writeCustomers(customers);

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.customerId = user.id;
        token.role = user.role as "customer" | "administrator";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.customerId) {
        session.user.id = token.customerId as string;
        session.user.role = token.role as "customer" | "administrator";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
