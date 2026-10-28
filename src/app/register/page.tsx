
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/toast-provider";
import styles from "../auth.module.scss";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (error) {
        showToast(error.message ?? "Registration failed. Please try again.", "error");
        return;
      }

      showToast("Your ChopLingo account is ready!", "success");
      router.replace("/");
      router.refresh();
    } catch {
      showToast(
        "Something went wrong. Please check your connection and try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section aria-labelledby="register-title" className={styles.shell}>
        <aside className={styles.aside}>
          <div className={styles.asideTop}>
            <span aria-hidden="true" className={styles.asideMark}>😍</span>
            <h2>Make room for something delicious.</h2>
            <p>Fresh inspiration, new favourites, and a little more joy at your table.</p>
          </div>
          <div className={styles.asideBottom}>
            <span aria-label="5 out of 5 stars" className={styles.asideStars}>★★★★★</span>
            <span>Good food tastes even better together.</span>
          </div>
        </aside>

        <div className={styles.formPanel}>
          <span className={styles.eyebrow}>
            <span aria-hidden="true" className={styles.eyebrowDot} />
            Come on in
          </span>
          <h1 className={styles.title} id="register-title">Create your account</h1>
          <p className={styles.description}>
            Join ChopLingo and find your next feel-good favourite.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="name">Full name</label>
              <input
                autoComplete="name"
                disabled={isLoading}
                id="name"
                maxLength={100}
                name="name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
                type="text"
                value={name}
              />
            </div>

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
                autoComplete="new-password"
                disabled={isLoading}
                id="password"
                minLength={8}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
                type="password"
                value={password}
              />
            </div>

            <button className={styles.submitButton} disabled={isLoading} type="submit">
              {isLoading ? "Creating your account..." : "Create account"}
              {!isLoading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className={styles.footnote}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
          <p className={styles.formNote}>
            By joining, you agree to keep good food and good company close.
          </p>
        </div>
      </section>
    </main>
  );
}
