
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";
import styles from "./admin.module.scss";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const result = await requireAdmin();

  if (!result.authorized) {
    if (result.reason === "unauthenticated") {
      redirect("/login");
    }

    redirect("/");
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <div className={styles.workspace}>
        <AdminHeader adminName={result.session.user.name} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
