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
      <h1>Dashboard Overview</h1>

      <section>
        <h2>Welcome to ChopLingo Administration</h2>
        <p>
          Manage recipes, ingredients, categories and other cooking content from
          one place.
        </p>
      </section>
    </main>
  );
}
