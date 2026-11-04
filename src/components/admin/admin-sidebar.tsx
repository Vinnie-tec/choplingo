"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./admin-sidebar.module.scss";

const adminLinks = [
  {
    label: "Dashboard",
    href: "/admin",
  },
  {
    label: "Recipes",
    href: "/admin/recipes",
  },
  {
    label: "Categories",
    href: "/admin/categories",
  },
  {
    label: "Ingredients",
    href: "/admin/ingredients",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <Link
        className={styles.brand}
        href="/admin"
        aria-label="ChopLingo admin home"
      >
        <span className={styles.brandMark} aria-hidden="true">
          C
        </span>
        <span>
          <strong>ChopLingo</strong>
          <small>ADMIN STUDIO</small>
        </span>
      </Link>

      <p className={styles.navLabel}>WORKSPACE</p>
      <nav className={styles.nav} aria-label="Admin navigation">
        {adminLinks.map((link) => (
          <Link
            className={styles.navLink}
            key={link.href}
            href={link.href}
            aria-current={
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(`${link.href}/`))
                ? "page"
                : undefined
            }
          >
            <span className={styles.navDot} aria-hidden="true" />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className={styles.sidebarNote}>
        <span className={styles.noteIcon} aria-hidden="true">
          💡
        </span>
        <p>Good food starts with a great recipe.</p>
      </div>
    </aside>
  );
}
