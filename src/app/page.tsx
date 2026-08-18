import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-ink">Learn Morse Code</h1>
        <p className="max-w-md text-ink-muted">Choose where you want to start.</p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/alphabet"
          className="rounded-full border border-line px-8 py-3 font-semibold text-ink transition-colors hover:border-ink-faint"
        >
          Browse the alphabet
        </Link>
        <Link
          href="/practice"
          className="rounded-full bg-accent px-8 py-3 font-semibold text-accent-ink transition-opacity hover:opacity-90"
        >
          Listen &amp; type
        </Link>
        <Link
          href="/send"
          className="rounded-full border border-line px-8 py-3 font-semibold text-ink transition-colors hover:border-ink-faint"
        >
          Send Morse code
        </Link>
      </div>
    </div>
  );
}
