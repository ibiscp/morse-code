import { AlphabetGrid } from "@/components/AlphabetGrid";
import { BackLink } from "@/components/BackLink";

export default function AlphabetPage() {
  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <BackLink />
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-ink">The Alphabet</h1>
        <p className="text-sm text-ink-muted">Click any letter to hear its Morse code.</p>
      </div>
      <div className="w-full max-w-3xl">
        <AlphabetGrid />
      </div>
    </div>
  );
}
