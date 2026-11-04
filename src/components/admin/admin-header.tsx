
"use client";

import { usePathname } from "next/navigation";

import styles from "./admin-header.module.scss";

type AdminHeaderProps = {
  adminName: string;
};

export default function AdminHeader({
  adminName,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const sectionName = pathname.startsWith("/admin/recipes")
    ? "Recipe management"
    : "Dashboard";

  return (
    <header className={styles.header}>
      <div className={styles.section}>
        <span className={styles.indicator} aria-hidden="true" />
        <span>Admin workspace</span>
        <span className={styles.separator}>/</span>
        <strong>{sectionName}</strong>
      </div>
      <p className={styles.greeting}>
        Welcome back, <strong>{adminName}</strong>
      </p>
    </header>
  );
}
