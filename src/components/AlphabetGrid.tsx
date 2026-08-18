"use client";

import { useState } from "react";
import { useAlphabetPlayer, BROWSE_UNIT_MS } from "@/hooks/useAlphabetPlayer";
import { usePatternReveal } from "@/hooks/usePatternReveal";
import { getMorsePattern } from "@/lib/morse-code";
import { MNEMONIC_WORDS, LETTERS, DIGITS } from "@/lib/morse-mnemonics";
import { MorsePattern } from "./MorsePattern";
import { MorseIllustration } from "./MorseIllustration";

export function AlphabetGrid() {
  const { playChar } = useAlphabetPlayer();
  const [playing, setPlaying] = useState<string | null>(null);

  async function handleClick(char: string) {
    setPlaying(char);
    await playChar(char);
    setPlaying((current) => (current === char ? null : current));
  }

  return (
    <div className="flex flex-col gap-10">
      <CharGrid chars={LETTERS} playing={playing} onClick={handleClick} />
      <div className="space-y-4">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-ink-faint">
          Numbers
        </h2>
        <CharGrid chars={DIGITS} playing={playing} onClick={handleClick} />
      </div>
    </div>
  );
}

function CharGrid({
  chars,
  playing,
  onClick,
}: {
  chars: string[];
  playing: string | null;
  onClick: (char: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {chars.map((char) => (
        <CharTile key={char} char={char} isPlaying={playing === char} onClick={() => onClick(char)} />
      ))}
    </div>
  );
}

function CharTile({
  char,
  isPlaying,
  onClick,
}: {
  char: string;
  isPlaying: boolean;
  onClick: () => void;
}) {
  const pattern = getMorsePattern(char);
  const revealedCount = usePatternReveal(pattern, BROWSE_UNIT_MS, isPlaying);
  const displayedCount = isPlaying ? revealedCount : pattern.length;

  return (
    <button
      onClick={onClick}
      aria-label={`Play the sound for ${char}`}
      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
        isPlaying
          ? "border-accent shadow-[0_0_12px_var(--color-accent)] scale-105"
          : "border-line hover:border-ink-faint"
      }`}
    >
      <div className="rounded-xl bg-illustration-surface p-3 shadow-[0_0_16px_var(--color-illustration-shadow)]">
        <MorseIllustration
          letter={char}
          label={MNEMONIC_WORDS[char]}
          revealedCount={displayedCount}
          size={96}
        />
      </div>
      <span className="text-lg font-bold text-ink">{char}</span>
      <span className="text-xs text-ink-muted">{MNEMONIC_WORDS[char]}</span>
      <MorsePattern pattern={pattern} revealedCount={displayedCount} />
    </button>
  );
}
