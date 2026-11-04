import { connection } from "next/server";
import { redirect } from "next/navigation";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { requireAdmin } from "@/lib/admin-auth";
import DeleteUserButton from "@/components/admin/delete-user-button";

import UserRoleSelector from "@/components/admin/user-role-selector";

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
    <section>
      <div>
        <h1>User Management</h1>
        <p>Manage ChopLingo users and their administrative permissions.</p>
      </div>

      <div>
        <article>
          <h2>Total Users</h2>
          <p>{totalUsers}</p>
        </article>

        <article>
          <h2>Administrators</h2>
          <p>{totalAdmins}</p>
        </article>

        <article>
          <h2>Regular Users</h2>
          <p>{totalRegularUsers}</p>
        </article>
      </div>

      {/* Search and role filters */}
      <form method="GET">
        <div>
          <label htmlFor="user-search">Search users</label>
          <input
            id="user-search"
            type="search"
            name="q"
            placeholder="Search by name or email..."
            defaultValue={searchTerm}
          />
        </div>

        <div>
          <label htmlFor="role-filter">Filter by role</label>
          <select id="role-filter" name="role" defaultValue={roleFilter ?? ""}>
            <option value="">All roles</option>
            <option value="user">Users</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        <button type="submit">Apply Filters</button>

        <a href="/admin/users">Clear Filters</a>
      </form>

      <p>Users found: {users.length}</p>

      {users.length === 0 ? (
        <p>
          {searchTerm || roleFilter
            ? "No users match your search or selected filter."
            : "No registered users found."}
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Date Registered</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.role}</td>
                <td>{item.createdAt.toLocaleDateString()}</td>
                <td>
                  <UserRoleSelector
                    userId={item.id}
                    currentRole={item.role as "user" | "admin"}
                    userName={item.name}
                    isCurrentUser={item.id === adminSession.session.user.id}
                  />

                  <DeleteUserButton
                    userId={item.id}
                    userName={item.name}
                    isCurrentUser={item.id === adminSession.session.user.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
