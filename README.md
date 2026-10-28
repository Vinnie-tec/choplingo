# ChopLingo

A fresh food discovery app built with Next.js, React, and Sass.

## Getting started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Theme and Sass

The shared light and dark theme tokens live in `src/app/globals.scss` as CSS
custom properties. Use them in any Sass module so components automatically
adapt when the theme changes:

```scss
.card {
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 12px 30px var(--color-shadow);
}
```

Available tokens include:

- `--color-brand`, `--color-brand-strong`, `--color-brand-soft`, and `--color-accent`
- `--color-background`, `--color-background-secondary`, `--color-surface`, and `--color-surface-raised`
- `--color-text`, `--color-text-muted`, and `--color-border`
- `--color-shadow`, `--color-glass`, and `--color-glass-border`

Set `data-theme="light"` or `data-theme="dark"` on the root `<html>` element to
choose a palette. The navbar toggle follows the visitor's system preference on
their first visit and remembers their choice in local storage.

Keep page-specific Sass in colocated `.module.scss` files, and use the global
tokens rather than hard-coding theme colors in components.

## Authentication and notifications

The shared navigation reads the Better Auth session and displays a sign-in
link when signed out, or a personalized greeting and sign-out action when
signed in. Login and registration forms use the shared theme tokens and send
success or error feedback through the global toast provider.
