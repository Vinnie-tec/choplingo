"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/toast-provider";
import ThemeToggle from "@/app/ThemeToggle";
import styles from "./site-nav.module.scss";

type InitialSession = typeof authClient.$Infer.Session | null;

export default function SiteNavClient({
  initialSession,
}: {
  initialSession: InitialSession;
}) {
  const { data: session, isPending } = authClient.useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Prefer the server-fetched session while the client hook initializes.
  const currentSession = isPending ? initialSession : session;
  const user = currentSession?.user;

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        showToast(
          error.message ?? "Unable to sign out. Please try again.",
          "error",
        );
        return;
      }

      showToast("You have been signed out.", "success");
      router.replace("/");
      router.refresh();
    } catch {
      showToast("We couldn't sign you out. Please try again.", "error");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link aria-label="ChopLingo home" className={styles.brand} href="/">
          <span aria-hidden="true" className={styles.brandMark}>
            <svg viewBox="0 0 32 32">
              <path d="M5 17h22c-.7 6.1-4.9 10-11 10S5.7 23.1 5 17Z" />
              <path d="M8 13.5c1.7-1.6 3.4-1.6 5.1 0m3.3 0c1.7-1.6 3.4-1.6 5.1 0M16 8V5m-4 4-2-2m10 2 2-2" />
            </svg>
          </span>
          <span>
            chop<span className={styles.brandAccent}>lingo</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className={styles.nav}>
          <Link className={styles.navLink} href="/#menu">
            Discover
          </Link>
          <Link className={styles.navLink} href="/#how-it-works">
            Our story
          </Link>
          <Link className={styles.navLink} href="/#reviews">
            Reviews
          </Link>
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          {isPending && !initialSession ? (
            <div
              aria-busy="true"
              aria-label="Checking your account"
              className={styles.authLoading}
              role="status"
            >
              <span className={styles.loadingGreeting} />
              <span className={styles.loadingButton} />
              <span className={styles.loadingButtonPrimary} />
            </div>
          ) : (
            <>
              {user && (
                <span className={styles.greeting}>
                  Hi <strong>{user.name.trim()}</strong>
                </span>
              )}
              {user ? (
                <button
                  className={styles.authButton}
                  onClick={handleSignOut}
                  type="button"
                  disabled={isSigningOut}
                >
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </button>
              ) : (
                <>
                  <Link className={styles.authButton} href="/login">
                    Sign in
                  </Link>
                  <Link className={styles.primaryButton} href="/register">
                    Get started <span aria-hidden="true">↗</span>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
