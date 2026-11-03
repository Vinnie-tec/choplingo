
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
  // Use supplied request headers when called from an API route.
  // Otherwise, retrieve the current request headers.
  const currentHeaders = requestHeaders ?? await headers();

  const session = await auth.api.getSession({
    headers: currentHeaders,
  });

  // No active session.
  if (!session) {
    return null;
  }

  // Authenticated, but not an administrator.
  if (session.user.role !== "admin") {
    return null;
  }

  return session;
}
