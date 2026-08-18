"use client";

import { useMorseTrainer } from "@/hooks/useMorseTrainer";
import { PhraseDisplay } from "./PhraseDisplay";
import { HintPanel } from "./HintPanel";
import { StatsBar } from "./StatsBar";

export function MorseTrainer() {
  const {
    phrase,
    index,
    results,
    status,
    hintVisible,
    wpm,
    accuracy,
    correctCount,
    totalCount,
    playbackIndex,
    nextPhrase,
    replay,
    replayPhrase,
    showHint,
    playChar,
  } = useMorseTrainer();

  if (status === "idle") {
    return null;
  }

  if (status === "complete") {
    return (
      <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <h2 className="text-2xl font-semibold text-ink">Phrase complete</h2>
        <PhraseDisplay
          results={results}
          currentIndex={-1}
          hintVisible={false}
          playbackIndex={playbackIndex}
          onPlayChar={playChar}
        />
        <StatsBar wpm={wpm} accuracy={accuracy} progress={correctCount} total={totalCount} />
        <div className="flex gap-4">
          <button
            onClick={replayPhrase}
            className="rounded-full border border-line px-5 py-2 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
          >
            Replay phrase
          </button>
          <button
            onClick={nextPhrase}
            className="rounded-full bg-accent px-8 py-2 font-semibold text-accent-ink transition-opacity hover:opacity-90"
          >
            Next phrase
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-8">
      <StatsBar wpm={wpm} accuracy={accuracy} progress={index} total={phrase.length} />

      <PhraseDisplay
        results={results}
        currentIndex={index}
        hintVisible={hintVisible}
        playbackIndex={playbackIndex}
        onPlayChar={playChar}
      />

      <div className="flex min-h-[9rem] items-center justify-center">
        {hintVisible && phrase[index] ? (
          <HintPanel char={phrase[index]} />
        ) : (
          <button
            onClick={showHint}
            className="rounded-full border border-hint-line px-5 py-2 text-sm text-hint-ink transition-opacity hover:opacity-80"
          >
            Show hint
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={replay}
          className="rounded-full border border-line px-5 py-2 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
        >
          Replay sound
        </button>
        <button
          onClick={nextPhrase}
          className="rounded-full border border-line px-5 py-2 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
        >
          Skip phrase
        </button>
      </div>

      <p className="text-xs text-ink-faint">
        Type the letter you hear on your keyboard. Click any typed letter to hear it again.
      </p>
    </div>
  );
}
