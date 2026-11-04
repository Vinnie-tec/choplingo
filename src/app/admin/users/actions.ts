
"use server";

import { eq, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { requireAdmin } from "@/lib/admin-auth";

type UserRole = "user" | "admin";

export async function updateUserRole(
  targetUserId: unknown,
  newRole: unknown
) {
  // First, verify that the request comes from an authenticated admin.
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return {
      success: false,
      message: "You are not authorized to perform this action.",
    };
  }

  // Validate the supplied values before touching the database.
  if (
    typeof targetUserId !== "string" ||
    !targetUserId.trim() ||
    (newRole !== "user" && newRole !== "admin")
  ) {
    return {
      success: false,
      message: "Invalid user ID or role.",
    };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // Serialize role changes using a PostgreSQL transaction-level lock.
      // The lock is automatically released when the transaction finishes.
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(7281946201)`
      );

      // Recheck that the requesting admin still has admin privileges.
      const [currentAdmin] = await tx
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, admin.session.user.id))
        .limit(1);

      if (!currentAdmin || currentAdmin.role !== "admin") {
        return {
          success: false,
          message: "Your admin privileges are no longer valid.",
        };
      }

      // Find the user whose role is being changed.
      const [targetUser] = await tx
        .select({
          id: user.id,
          role: user.role,
        })
        .from(user)
        .where(eq(user.id, targetUserId))
        .limit(1);

      if (!targetUser) {
        return {
          success: false,
          message: "User not found.",
        };
      }

      // Prevent an admin from demoting themselves.
      if (
        targetUser.id === admin.session.user.id &&
        newRole !== "admin"
      ) {
        return {
          success: false,
          message: "You cannot remove your own admin privileges.",
        };
      }

      if (targetUser.role === newRole) {
        return {
          success: true,
          message: "This user already has that role.",
        };
      }

      // Prevent the last remaining admin from being demoted.
      if (targetUser.role === "admin" && newRole === "user") {
        const [adminCount] = await tx
          .select({ total: count() })
          .from(user)
          .where(eq(user.role, "admin"));

        if (adminCount.total <= 1) {
          return {
            success: false,
            message: "You cannot demote the last remaining admin.",
          };
        }
      }

      // Apply the role change.
      await tx
        .update(user)
        .set({ role: newRole as UserRole })
        .where(eq(user.id, targetUserId));

      return {
        success: true,
        message: `User role successfully changed to ${newRole}.`,
      };
    });

    if (result.success) {
      revalidatePath("/admin/users");
      revalidatePath("/admin");
    }

    return result;
  } catch (error) {
    console.error("Update user role error:", error);

    return {
      success: false,
      message: "Something went wrong while updating the user role.",
    };
  }
}


export async function deleteUserAccount(targetUserId: unknown) {
  // Verify the requesting administrator.
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return {
      success: false,
      message: "You are not authorized to perform this action.",
    };
  }

  // Validate the target user ID.
  if (
    typeof targetUserId !== "string" ||
    !targetUserId.trim()
  ) {
    return {
      success: false,
      message: "Invalid user ID.",
    };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // Use the same lock as updateUserRole.
      // This serializes account deletion and role changes.
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(7281946201)`
      );

      // Confirm that the requesting administrator
      // still has admin privileges.
      const [currentAdmin] = await tx
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, admin.session.user.id))
        .limit(1);

      if (!currentAdmin || currentAdmin.role !== "admin") {
        return {
          success: false,
          message: "Your admin privileges are no longer valid.",
        };
      }

      // Find the account targeted for deletion.
      const [targetUser] = await tx
        .select({
          id: user.id,
          name: user.name,
          role: user.role,
        })
        .from(user)
        .where(eq(user.id, targetUserId))
        .limit(1);

      if (!targetUser) {
        return {
          success: false,
          message: "User not found.",
        };
      }

      // An administrator cannot delete their own account.
      if (targetUser.id === admin.session.user.id) {
        return {
          success: false,
          message: "You cannot delete your own account.",
        };
      }

      // Protect the last remaining administrator.
      if (targetUser.role === "admin") {
        const [adminCount] = await tx
          .select({ total: count() })
          .from(user)
          .where(eq(user.role, "admin"));

        if (adminCount.total <= 1) {
          return {
            success: false,
            message: "You cannot delete the last remaining administrator.",
          };
        }
      }

      // Permanently delete the account.
      // PostgreSQL handles associated records through CASCADE.
      await tx
        .delete(user)
        .where(eq(user.id, targetUserId));

      return {
        success: true,
        message: `${targetUser.name}'s account was successfully deleted.`,
      };
    });

    if (result.success) {
      revalidatePath("/admin/users");
      revalidatePath("/admin");
    }

    return result;
  } catch (error) {
    console.error("Delete user account error:", error);

    return {
      success: false,
      message: "Something went wrong while deleting this account.",
    };
  }
}
