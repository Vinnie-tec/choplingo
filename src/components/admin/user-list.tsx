"use client";

import { startTransition, useOptimistic, useState } from "react";
import { useRouter } from "next/navigation";

import { deleteUserAccount } from "@/app/admin/users/actions";
import { useToast } from "@/components/toast-provider";
import DeleteUserButton from "@/components/admin/delete-user-button";
import UserRoleSelector from "@/components/admin/user-role-selector";

import styles from "./user-management.module.scss";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  registeredAt: string;
};

type UserListProps = {
  users: AdminUser[];
  currentUserId: string;
  hasFilters: boolean;
};

export default function AdminUserList({
  users,
  currentUserId,
  hasFilters,
}: UserListProps) {
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [optimisticUsers, setOptimisticUsers] = useOptimistic(
    users,
    (currentUsers, deletedUserId: string) =>
      currentUsers.filter((item) => item.id !== deletedUserId),
  );
  const router = useRouter();
  const { showToast } = useToast();

  function handleDelete(userId: string) {
    setPendingUserId(userId);

    startTransition(async () => {
      setOptimisticUsers(userId);

      try {
        const result = await deleteUserAccount(userId);

        if (!result.success) {
          showToast(result.message, "error");
          return;
        }

        showToast(result.message, "success");
        router.refresh();
      } catch {
        showToast("Something went wrong. Please try again.", "error");
      } finally {
        setPendingUserId(null);
      }
    });
  }

  if (optimisticUsers.length === 0) {
    return (
      <section className={styles.emptyState}>
        <span className={styles.emptyIcon} aria-hidden="true">◎</span>
        <h2>{hasFilters ? "No members match these filters" : "No members yet"}</h2>
        <p>
          {hasFilters
            ? "Try another name, email address, or account role."
            : "Registered accounts will appear here."}
        </p>
      </section>
    );
  }

  return (
    <section className={styles.userList} aria-label="Registered users">
      <div className={styles.listHeader}>
        <div>
          <h2>Community accounts</h2>
          <p>Manage account roles and access to your admin workspace.</p>
        </div>
        <span className={styles.listCount}>
          {optimisticUsers.length}{" "}
          {optimisticUsers.length === 1 ? "member" : "members"}
        </span>
      </div>

      <div className={styles.tableScroller}>
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th scope="col">Member</th>
              <th scope="col">Account role</th>
              <th scope="col">Joined</th>
              <th scope="col"><span className={styles.srOnly}>Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {optimisticUsers.map((item) => {
              const isCurrentUser = item.id === currentUserId;
              const isPending = pendingUserId === item.id;

              return (
                <tr key={item.id} aria-busy={isPending}>
                  <td>
                    <div className={styles.member}>
                      <span className={styles.avatar} aria-hidden="true">
                        {item.name.trim().charAt(0).toUpperCase() || "?"}
                      </span>
                      <div className={styles.memberIdentity}>
                        <strong>
                          {item.name}
                          {isCurrentUser && <span className={styles.youBadge}>You</span>}
                        </strong>
                        <span>{item.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${styles.roleBadge} ${
                        item.role === "admin" ? styles.adminRole : styles.userRole
                      }`}
                    >
                      <span className={styles.roleDot} aria-hidden="true" />
                      {item.role === "admin" ? "Administrator" : "Member"}
                    </span>
                  </td>
                  <td className={styles.joinedDate}>{item.registeredAt}</td>
                  <td>
                    <div className={styles.actions}>
                      <UserRoleSelector
                        userId={item.id}
                        currentRole={item.role}
                        userName={item.name}
                        isCurrentUser={isCurrentUser}
                        disabled={pendingUserId !== null}
                      />
                      <DeleteUserButton
                        userId={item.id}
                        userName={item.name}
                        isCurrentUser={isCurrentUser}
                        disabled={pendingUserId !== null}
                        isPending={isPending}
                        onConfirm={() => handleDelete(item.id)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
