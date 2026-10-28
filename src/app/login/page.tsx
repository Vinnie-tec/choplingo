
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/toast-provider";
import styles from "../auth.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Prevent duplicate submissions.
    if (isLoading) return;

    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        showToast(error.message ?? "Unable to sign in. Please try again.", "error");
        return;
      }

      showToast("Welcome back to ChopLingo!", "success");
      router.replace("/");
      router.refresh();
    } catch {
      showToast("We couldn't connect to the server. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section aria-labelledby="login-title" className={styles.shell}>
        <aside className={styles.aside}>
          <div className={styles.asideTop}>
            <span aria-hidden="true" className={styles.asideMark}>😍</span>
            <h2>Good to have you back.</h2>
            <p>Your next delicious discovery is only a little hello away.</p>
          </div>
          <div className={styles.asideBottom}>
            <span aria-label="5 out of 5 stars" className={styles.asideStars}>★★★★★</span>
            <span>A happy place for people who love good food.</span>
          </div>
        </aside>

        <div className={styles.formPanel}>
          <span className={styles.eyebrow}>
            <span aria-hidden="true" className={styles.eyebrowDot} />
            Your table is ready
          </span>
          <h1 className={styles.title} id="login-title">Welcome back</h1>
          <p className={styles.description}>
            Sign in to pick up where your good-food journey left off.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="email">Email address</label>
              <input
                autoComplete="email"
                disabled={isLoading}
                id="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input
                autoComplete="current-password"
                disabled={isLoading}
                id="password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type="password"
                value={password}
              />
            </div>

            <button className={styles.submitButton} disabled={isLoading} type="submit">
              {isLoading ? "Signing you in..." : "Sign in"}
              {!isLoading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className={styles.footnote}>
            New to ChopLingo? <Link href="/register">Create an account</Link>
          </p>
          <p className={styles.formNote}>
            By signing in, you agree to keep good food and good company close.
          </p>
        </div>
      </section>
    </main>
  );
}
