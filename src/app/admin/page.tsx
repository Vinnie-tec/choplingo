import { redirect } from "next/navigation";
import { connection } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";

export const instant = false;

export default async function AdminPage() {
  // Tell Next.js this page depends on an incoming request.
  await connection();

  const adminSession = await requireAdmin();

  if (!adminSession.authorized) {
    if (adminSession.reason === "unauthenticated") {
      redirect("/login");
    }

    // We'll replace this with a proper forbidden page shortly.
    redirect("/");
  }
  return (
    <main>
      <h1>ChopLingo Admin Dashboard</h1>

      <p>Welcome, {adminSession.session.user.name}</p>

      <p>Administrator access granted.</p>
    </main>
  );
}
