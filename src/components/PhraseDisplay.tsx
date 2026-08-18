import type { CharResult } from "@/hooks/useMorseTrainer";
import { toPhraseSegments } from "@/lib/phrase-segments";

type BoxStatus = CharResult["status"] | "current" | "hint";

const STATUS_CLASSES: Record<BoxStatus, string> = {
  pending: "border-line text-ink-faint",
  current: "border-accent text-accent shadow-[0_0_12px_var(--color-accent)]",
  hint: "border-hint-line text-hint-ink bg-hint-surface shadow-[0_0_12px_var(--color-hint-line)]",
  correct: "border-correct-line text-correct-ink bg-correct-surface",
  incorrect: "border-incorrect-line text-incorrect-ink bg-incorrect-surface",
};

const GAP_BORDER_CLASSES: Record<BoxStatus, string> = {
  pending: "border-line",
  current: "border-accent",
  hint: "border-hint-line",
  correct: "border-correct-line",
  incorrect: "border-incorrect-line",
};

const PLAYING_RING_CLASSES = "ring-2 ring-accent ring-offset-2 ring-offset-surface scale-110";

interface PhraseDisplayProps {
  results: CharResult[];
  currentIndex: number;
  hintVisible: boolean;
  playbackIndex: number | null;
  onPlayChar: (char: string) => void;
}

function CharBox({
  result,
  isCurrent,
  isPlaying,
  hintVisible,
  onPlayChar,
}: {
  result: CharResult;
  isCurrent: boolean;
  isPlaying: boolean;
  hintVisible: boolean;
  onPlayChar: (char: string) => void;
}) {
  const revealed = result.status !== "pending" || (isCurrent && hintVisible);
  const status: BoxStatus = isCurrent
    ? hintVisible
      ? "hint"
      : "current"
    : result.hintUsed
      ? "hint"
      : result.status;
  const clickable = revealed && !isCurrent;

  return (
    <span
      role={clickable ? "button" : undefined}
      aria-label={clickable ? `Play the sound for ${result.char}` : undefined}
      onClick={clickable ? () => onPlayChar(result.char) : undefined}
      className={`flex h-10 w-8 items-center justify-center rounded border-2 uppercase transition-all ${STATUS_CLASSES[status]} ${
        clickable ? "cursor-pointer hover:opacity-80 active:scale-95" : ""
      } ${isPlaying ? PLAYING_RING_CLASSES : ""}`}
    >
      {revealed ? result.char : ""}
    </span>
  );
}

export function PhraseDisplay({
  results,
  currentIndex,
  hintVisible,
  playbackIndex,
  onPlayChar,
}: PhraseDisplayProps) {
  const segments = toPhraseSegments(results);

  return (
    <div className="flex flex-wrap items-end justify-center gap-x-1.5 gap-y-1.5 font-mono text-lg">
      {segments.map((segment, segmentIndex) => {
        if (segment.type === "gap") {
          const result = segment.item.data;
          const isCurrent = segment.item.index === currentIndex;
          const isPlaying = segment.item.index === playbackIndex;
          const status: BoxStatus = isCurrent
            ? hintVisible
              ? "hint"
              : "current"
            : result.hintUsed
              ? "hint"
              : result.status;
          return (
            <span
              key={segmentIndex}
              className={`mx-1 mb-1.5 h-0 w-3 border-b-2 transition-all ${GAP_BORDER_CLASSES[status]} ${
                isPlaying ? "scale-y-150" : ""
              }`}
            />
          );
        }

        return (
          <span key={segmentIndex} className="flex flex-nowrap gap-1.5">
            {segment.items.map(({ data: result, index }) => (
              <CharBox
                key={index}
                result={result}
                isCurrent={index === currentIndex}
                isPlaying={index === playbackIndex}
                hintVisible={hintVisible}
                onPlayChar={onPlayChar}
              />
            ))}
          </span>
        );
      })}
    </div>
  );
}
