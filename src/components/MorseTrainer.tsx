"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useMorseTrainer } from "@/hooks/useMorseTrainer";
import { isSupportedChar, SPACE_CHAR } from "@/lib/morse-code";
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
    isReplaying,
    nextPhrase,
    replay,
    replayPhrase,
    stopPhrase,
    showHint,
    playChar,
    submitChar,
  } = useMorseTrainer();

  // Hidden field that summons the on-screen keyboard on touch devices, where
  // there is no physical keyboard to type the letter being heard.
  const keyboardInputRef = useRef<HTMLInputElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only environment probe; must run after mount to avoid an SSR hydration mismatch
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Reads the character the soft keyboard inserted, submits it, and clears the
  // field so it is ready for the next letter. Desktop typing is handled by the
  // hook's window listener (which preventDefaults, so this never double-fires).
  const handleSoftInput = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      const el = e.currentTarget;
      const raw = el.value.slice(-1);
      el.value = "";
      if (!raw) return;
      const key = raw === " " ? SPACE_CHAR : raw.toUpperCase();
      if (!isSupportedChar(key)) return;
      submitChar(key);
    },
    [submitChar]
  );

  const focusKeyboard = useCallback(() => {
    keyboardInputRef.current?.focus();
  }, []);

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
            onClick={isReplaying ? stopPhrase : replayPhrase}
            className="rounded-full border border-line px-5 py-2 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
          >
            {isReplaying ? "Stop" : "Replay phrase"}
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

      <div className="flex flex-wrap justify-center gap-4">
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
        {isTouch && (
          <button
            onClick={focusKeyboard}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
          >
            Open keyboard
          </button>
        )}
      </div>

      {/* Off-screen field: focusing it opens the mobile keyboard so the learner
          can type the letter they hear. Kept focusable (not display:none). */}
      <input
        ref={keyboardInputRef}
        onInput={handleSoftInput}
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Type the letter you hear"
        className="pointer-events-none absolute h-px w-px opacity-0"
        tabIndex={-1}
      />

      <p className="text-xs text-ink-faint">
        {isTouch
          ? "Tap Open keyboard, then type the letter you hear. Tap any typed letter to hear it again."
          : "Type the letter you hear on your keyboard. Click any typed letter to hear it again."}
      </p>
    </div>
  );
}
