
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Prevent duplicate submissions.
    if (isLoading) return;

    setErrorMessage("");
    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(
          error.message ?? "Unable to sign in. Please try again."
        );
        return;
      }

      // The user is authenticated. Navigate to the recipes area.
      router.replace("/recipes");
      router.refresh();
    } catch {
      setErrorMessage(
        "We couldn't connect to the server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <h1>Welcome back</h1>
      <p>Sign in to continue exploring Nigerian recipes.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrorMessage("");
            }}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrorMessage("");
            }}
            required
            disabled={isLoading}
          />
        </div>

        {errorMessage && (
          <p role="alert" aria-live="polite">
            {errorMessage}
          </p>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing you in..." : "Sign in"}
        </button>
      </form>

      <p>
        Don&lsquo;t have an account? <Link href="/register">Create an account</Link>
      </p>
    </main>
  );
}
