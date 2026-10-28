import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/lib/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  // Enable email-and-password registration and login.
  emailAndPassword: {
    enabled: true,
  },

  // Better Auth reads this secret to protect authentication data.
  secret: process.env.BETTER_AUTH_SECRET,

  // We'll add Google OAuth after the basic authentication flow works.
});