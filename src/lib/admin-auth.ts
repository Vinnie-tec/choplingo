
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Returns the authenticated session only when
 * the current user has the admin role.
 *
 * Returns null for unauthenticated users
 * and ordinary users.
 */

export async function getAdminSession(requestHeaders?: Headers) {
  const currentHeaders = requestHeaders ?? await headers();

  const session = await auth.api.getSession({
    headers: currentHeaders,
  });

  return session;
}

export async function requireAdmin(requestHeaders?: Headers) {
  const session = await getAdminSession(requestHeaders);

  // User is not authenticated.
  if (!session) {
    return {
      authorized: false as const,
      reason: "unauthenticated" as const,
    };
  }

  // User is authenticated but lacks admin privileges.
  if (session.user.role !== "admin") {
    return {
      authorized: false as const,
      reason: "forbidden" as const,
    };
  }

  return {
    authorized: true as const,
    session,
  };
}
