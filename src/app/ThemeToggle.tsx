"use client";

import { useEffect } from "react";
import styles from "./page.module.scss";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem("choplingo-theme");
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const initialTheme = savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : preferredTheme;

    document.documentElement.dataset.theme = initialTheme;
  }, []);

  function toggleTheme() {
    const currentTheme = document.documentElement.dataset.theme;
    const nextTheme: Theme = currentTheme === "light" ? "dark" : "light";

    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("choplingo-theme", nextTheme);
  }

  return (
    <button
      aria-label="Toggle light and dark mode"
      className={styles.themeToggle}
      onClick={toggleTheme}
      title="Toggle light and dark mode"
      type="button"
    >
      <svg aria-hidden="true" className={styles.moonIcon} viewBox="0 0 24 24">
        <path d="M20.1 15.4A8.3 8.3 0 0 1 8.6 3.9 8.5 8.5 0 1 0 20.1 15.4Z" />
      </svg>
      <svg aria-hidden="true" className={styles.sunIcon} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3.7" />
        <path d="M12 2.5v2m0 15v2m9.5-9.5h-2m-15 0h-2m16.2-6.2-1.4 1.4M6.7 17.3l-1.4 1.4m13.4 0-1.4-1.4M6.7 6.7 5.3 5.3" />
      </svg>
    </button>
  );
}
