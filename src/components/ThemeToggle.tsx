"use client";

import { useState } from "react";

const STORAGE_KEY = "morse-theme";

// The `dark` class is set on <html> before hydration by an inline script in
// the root layout, so reading it here (not in an effect) gives the right
// value on first client render. The content legitimately differs from the
// server-rendered default, hence suppressHydrationWarning below.
function getInitialTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light/dark theme"
      suppressHydrationWarning
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:text-ink"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
