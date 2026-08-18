"use client";

import { useMorseEmitter } from "@/hooks/useMorseEmitter";
import { SendPhraseDisplay } from "./SendPhraseDisplay";
import { StatsBar } from "./StatsBar";

export function MorseEmitter() {
  const {
    phrase,
    index,
    results,
    status,
    isKeyDown,
    buffer,
    correctCount,
    totalCount,
    accuracy,
    wpmEstimate,
    nextPhrase,
    pressKey,
    releaseKey,
  } = useMorseEmitter();

  if (status === "idle") {
    return null;
  }

  if (status === "complete") {
    return (
      <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <h2 className="text-2xl font-semibold text-ink">Phrase complete</h2>
        <SendPhraseDisplay results={results} currentIndex={-1} />
        <StatsBar wpm={wpmEstimate} accuracy={accuracy} progress={correctCount} total={totalCount} />
        <button
          onClick={nextPhrase}
          className="rounded-full bg-accent px-8 py-3 font-semibold text-accent-ink transition-opacity hover:opacity-90"
        >
          Next phrase
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-8">
      <StatsBar wpm={wpmEstimate} accuracy={accuracy} progress={index} total={phrase.length} />

      <SendPhraseDisplay results={results} currentIndex={index} />

      <div className="flex h-8 items-center justify-center font-mono text-2xl tracking-widest text-accent">
        {buffer.split("").join(" ")}
      </div>

      <button
        onMouseDown={pressKey}
        onMouseUp={releaseKey}
        onMouseLeave={releaseKey}
        onTouchStart={(e) => {
          e.preventDefault();
          pressKey();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          releaseKey();
        }}
        className={`flex h-24 w-24 select-none items-center justify-center rounded-full border-4 text-sm font-semibold uppercase transition-all ${
          isKeyDown
            ? "scale-95 border-accent bg-accent text-accent-ink shadow-[0_0_20px_var(--color-accent)]"
            : "border-line text-ink-muted hover:border-ink-faint"
        }`}
        style={{ touchAction: "none" }}
      >
        Key
      </button>

      <button
        onClick={nextPhrase}
        className="rounded-full border border-line px-5 py-2 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
      >
        Skip phrase
      </button>

      <p className="text-xs text-ink-faint">
        Hold SPACE (or the key above): short tap = dot, long tap = dash. Pause to move on.
      </p>
    </div>
  );
}
