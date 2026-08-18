import type { EmitResult } from "@/hooks/useMorseEmitter";
import { toPhraseSegments } from "@/lib/phrase-segments";

type BoxStatus = EmitResult["status"] | "current";

const STATUS_CLASSES: Record<BoxStatus, string> = {
  pending: "border-line text-ink",
  current: "border-accent text-accent shadow-[0_0_12px_var(--color-accent)]",
  correct: "border-correct-line text-correct-ink bg-correct-surface",
  incorrect: "border-incorrect-line text-incorrect-ink bg-incorrect-surface",
};

const GAP_BORDER_CLASSES: Record<BoxStatus, string> = {
  pending: "border-line",
  current: "border-accent",
  correct: "border-correct-line",
  incorrect: "border-incorrect-line",
};

interface SendPhraseDisplayProps {
  results: EmitResult[];
  currentIndex: number;
}

export function SendPhraseDisplay({ results, currentIndex }: SendPhraseDisplayProps) {
  const segments = toPhraseSegments(results);

  return (
    <div className="flex flex-wrap items-end justify-center gap-x-1.5 gap-y-1.5 font-mono text-lg">
      {segments.map((segment, segmentIndex) => {
        if (segment.type === "gap") {
          const status: BoxStatus =
            segment.item.index === currentIndex ? "current" : segment.item.data.status;
          return (
            <span
              key={segmentIndex}
              className={`mx-1 mb-1.5 h-0 w-3 border-b-2 transition-colors ${GAP_BORDER_CLASSES[status]}`}
            />
          );
        }

        return (
          <span key={segmentIndex} className="flex flex-nowrap gap-1.5">
            {segment.items.map(({ data: result, index }) => {
              const status: BoxStatus = index === currentIndex ? "current" : result.status;
              return (
                <span
                  key={index}
                  className={`flex h-10 w-8 items-center justify-center rounded border-2 uppercase transition-colors ${STATUS_CLASSES[status]}`}
                >
                  {result.char}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}
