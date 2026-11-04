import { redirect } from "next/navigation";
import { connection } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import styles from "./admin.module.scss";

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
    <main className={styles.dashboard}>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>YOUR KITCHEN, IN CONTROL</p>
          <h1>Dashboard overview</h1>
          <p className={styles.subtitle}>
            Manage the recipes and content that bring ChopLingo to life.
          </p>
        </div>
      </div>

      <section className={styles.welcomeCard}>
        <div className={styles.welcomeCopy}>
          <p className={styles.cardEyebrow}>WELCOME TO THE STUDIO</p>
          <h2>A little inspiration goes a long way.</h2>
          <p>
            Curate the collection, keep your recipes up to date, and make it
            easier for everyone to find their next favourite meal.
          </p>
          <Link className={styles.primaryButton} href="/admin/recipes">
            Explore recipes <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className={styles.welcomeArt} aria-hidden="true">
          <span className={styles.artHalo} />
          <span className={styles.artPlate}>😎</span>
          <span className={styles.artSparkle}>😘</span>
        </div>
      </section>

      <div className={styles.quickLinks}>
        <Link className={styles.quickLink} href="/admin/recipes">
          <span className={styles.quickIcon} aria-hidden="true">↗</span>
          <span>
            <strong>Manage recipes</strong>
            <small>Review, edit, and publish your collection</small>
          </span>
          <span className={styles.quickArrow} aria-hidden="true">→</span>
        </Link>
        <Link className={styles.quickLink} href="/admin/recipes/new">
          <span className={`${styles.quickIcon} ${styles.quickIconAccent}`} aria-hidden="true">＋</span>
          <span>
            <strong>Create a recipe</strong>
            <small>Add a new dish to the ChopLingo kitchen</small>
          </span>
          <span className={styles.quickArrow} aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
