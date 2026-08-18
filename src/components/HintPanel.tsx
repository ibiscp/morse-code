"use client";

import { getMorsePattern, SPACE_CHAR } from "@/lib/morse-code";
import { getMnemonicWord } from "@/lib/morse-mnemonics";
import { usePatternReveal } from "@/hooks/usePatternReveal";
import { MorsePattern } from "./MorsePattern";
import { MorseIllustration } from "./MorseIllustration";

const REVEAL_UNIT_MS = 110;

interface HintPanelProps {
  char: string;
}

// Mnemonic illustrations originally from Google Creative Lab's morse-learn
// project (Apache 2.0), packaged as multi-frame sprite sheets by zmorse
// (github.com/zsphinxyz/zmorse) so the highlighted dot/dash shape can build
// up frame by frame. The artwork is gray-on-transparent, so it always sits
// on a light card regardless of theme, otherwise it disappears against a
// dark hint background.
export function HintPanel({ char }: HintPanelProps) {
  const pattern = getMorsePattern(char);
  const revealedCount = usePatternReveal(pattern, REVEAL_UNIT_MS, char !== SPACE_CHAR);

  if (char === SPACE_CHAR) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-lg border border-hint-line bg-hint-surface px-6 py-3 text-hint-ink">
        <span className="text-xs uppercase tracking-widest opacity-80">Hint</span>
        <span className="text-lg">Press space (word gap)</span>
      </div>
    );
  }

  const word = getMnemonicWord(char);

  return (
    <div
      key={char}
      className="flex flex-col items-center gap-3 rounded-lg border border-hint-line bg-hint-surface px-6 py-4 text-hint-ink"
    >
      <span className="text-xs uppercase tracking-widest opacity-80">Hint</span>
      {word && (
        <div className="animate-pop-in rounded-2xl bg-illustration-surface p-4 shadow-[0_0_20px_var(--color-illustration-shadow)]">
          <MorseIllustration letter={char} label={word} revealedCount={revealedCount} size={160} />
        </div>
      )}
      <span className="text-xl font-bold">{word ?? char.toUpperCase()}</span>
      <MorsePattern pattern={pattern} revealedCount={revealedCount} />
    </div>
  );
}
