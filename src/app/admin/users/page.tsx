import { connection } from "next/server";
import { redirect } from "next/navigation";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { requireAdmin } from "@/lib/admin-auth";
import AdminUserList from "@/components/admin/user-list";
import styles from "@/components/admin/user-management.module.scss";

export const instant = false;

type AdminUsersPageProps = {
  searchParams: Promise<{
    q?: string;
    role?: string;
  }>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  await connection();

  // Verify that the current user is an administrator.
  const adminSession = await requireAdmin();

  if (!adminSession.authorized) {
    if (adminSession.reason === "unauthenticated") {
      redirect("/login");
    }

    redirect("/");
  }

  // Fetch overall user statistics from PostgreSQL.
  const [totalUsersResult, adminUsersResult, regularUsersResult] =
    await Promise.all([
      db.select({ total: count() }).from(user),

      db.select({ total: count() }).from(user).where(eq(user.role, "admin")),

      db.select({ total: count() }).from(user).where(eq(user.role, "user")),
    ]);

  const totalUsers = totalUsersResult[0].total;
  const totalAdmins = adminUsersResult[0].total;
  const totalRegularUsers = regularUsersResult[0].total;

  // Read search and filter values from the URL.
  const params = await searchParams;

  const searchTerm = typeof params.q === "string" ? params.q.trim() : "";

  const roleFilter =
    params.role === "admin" || params.role === "user" ? params.role : undefined;

  // Fetch users using server-side search and filtering.
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(
      and(
        searchTerm
          ? or(
              ilike(user.name, `%${searchTerm}%`),
              ilike(user.email, `%${searchTerm}%`),
            )
          : undefined,
        roleFilter ? eq(user.role, roleFilter) : undefined,
      ),
    )
    .orderBy(desc(user.createdAt));

  return (
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>COMMUNITY & ACCESS</p>
          <h1>User management</h1>
          <p className={styles.subtitle}>
            Manage your community and keep administrative access up to date.
          </p>
        </div>
      </div>

      <section className={styles.stats} aria-label="User account statistics">
        <article className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.totalIcon}`} aria-hidden="true">◎</span>
          <div>
            <p>Total members</p>
            <strong>{totalUsers}</strong>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.adminIcon}`} aria-hidden="true">@</span>
          <div>
            <p>Administrators</p>
            <strong>{totalAdmins}</strong>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.memberIcon}`} aria-hidden="true">♡</span>
          <div>
            <p>Community members</p>
            <strong>{totalRegularUsers}</strong>
          </div>
        </article>
      </section>

      <section className={styles.filters} aria-label="User filters">
        <form className={styles.filterForm} method="GET">
          <div className={styles.searchField}>
            <label htmlFor="user-search">Search members</label>
            <input
              id="user-search"
              type="search"
              name="q"
              placeholder="Name or email address"
              defaultValue={searchTerm}
            />
          </div>

          <div className={styles.roleFilterField}>
            <label htmlFor="role-filter">Account role</label>
            <select id="role-filter" name="role" defaultValue={roleFilter ?? ""}>
              <option value="">All roles</option>
              <option value="user">Members</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className={styles.filterActions}>
            <button className={styles.applyButton} type="submit">
              Apply filters
            </button>
            {(searchTerm || roleFilter) && (
              <a className={styles.clearLink} href="/admin/users">
                Clear
              </a>
            )}
          </div>
        </form>

        <p className={styles.resultCount} aria-live="polite">
          <strong>{users.length}</strong>{" "}
          {users.length === 1 ? "member" : "members"} found
        </p>
      </section>

      <AdminUserList
        hasFilters={Boolean(searchTerm || roleFilter)}
        currentUserId={adminSession.session.user.id}
        users={users.map((item) => ({
          ...item,
          role: item.role === "admin" ? ("admin" as const) : ("user" as const),
          registeredAt: item.createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          }),
        }))}
      />
    </main>
  );
}
