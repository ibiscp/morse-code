import type { MorseSymbol } from "@/lib/morse-code";

interface MorsePatternProps {
  pattern: MorseSymbol[];
  revealedCount: number;
}

// Renders dots and dashes as circle/pill shapes (matching the mnemonic
// illustrations' own visual language) that pop in as `revealedCount`
// increases, instead of showing the whole pattern at once.
export function MorsePattern({ pattern, revealedCount }: MorsePatternProps) {
  return (
    <div className="flex items-center gap-2">
      {pattern.map((symbol, i) => {
        const lit = i < revealedCount;
        const isDash = symbol === "-";
        return (
          <span
            key={i}
            className={`inline-block rounded-full transition-all duration-200 ease-out ${
              isDash ? "h-3 w-7" : "h-3 w-3"
            } ${lit ? "scale-100 bg-accent opacity-100" : "scale-50 bg-line opacity-50"}`}
          />
        );
      })}
    </div>
  );
}
