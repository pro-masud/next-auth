import "next-auth";
import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: "customer" | "administrator";
  }

  interface Session {
    user: {
      id: string;
      role: "customer" | "administrator";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    customerId?: string;
    role?: "customer" | "administrator";
  }
}
