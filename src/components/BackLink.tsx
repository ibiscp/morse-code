import Link from "next/link";

// Fixed at the same top offset as the ThemeToggle so both sit on one row
// regardless of how each page's own content is laid out below them.
export function BackLink() {
  return (
    <Link
      href="/"
      className="fixed left-4 top-4 z-50 text-sm text-ink-muted transition-colors hover:text-ink"
    >
      ← Back
    </Link>
  );
}
