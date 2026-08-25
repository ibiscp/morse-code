"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useLetterDrill } from "@/hooks/useLetterDrill";

// Audio-only practice: one random letter is played at a time and the learner
// types what they hear. The letter is hidden until they answer.
export function LetterDrill() {
  const {
    current,
    phase,
    typed,
    lastCorrect,
    correctCount,
    totalCount,
    accuracy,
    replay,
    skip,
    submit,
  } = useLetterDrill();

  // Hidden field that summons the on-screen keyboard on touch devices, where
  // there is no physical keyboard to type the letter being heard.
  const keyboardInputRef = useRef<HTMLInputElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only environment probe; must run after mount to avoid an SSR hydration mismatch
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Reads the character the soft keyboard inserted and submits it. Desktop
  // typing is handled by the hook's window listener (which preventDefaults,
  // so this never double-fires).
  const handleSoftInput = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      const el = e.currentTarget;
      const raw = el.value.slice(-1);
      el.value = "";
      if (raw) submit(raw);
    },
    [submit]
  );

  const focusKeyboard = useCallback(() => {
    keyboardInputRef.current?.focus();
  }, []);

  const revealing = phase === "revealing";
  const cardClasses = revealing
    ? lastCorrect
      ? "border-correct-line bg-correct-surface text-correct-ink"
      : "border-incorrect-line bg-incorrect-surface text-incorrect-ink"
    : "border-line text-ink-faint";

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <div className="flex justify-center gap-8 font-mono text-sm text-ink-muted">
        <Stat label="Correct" value={`${correctCount}/${totalCount}`} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
      </div>

      <div
        className={`flex h-40 w-40 items-center justify-center rounded-2xl border-2 font-mono text-7xl uppercase transition-colors ${cardClasses}`}
      >
        {revealing ? current : "?"}
      </div>

      <div className="flex min-h-[1.5rem] items-center justify-center text-sm">
        {revealing && !lastCorrect && typed ? (
          <p className="text-ink-muted">
            You typed <span className="font-semibold text-incorrect-ink">{typed}</span>
          </p>
        ) : revealing && lastCorrect ? (
          <p className="font-semibold text-correct-ink">Correct!</p>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={replay}
          className="rounded-full border border-line px-5 py-2 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
        >
          Replay sound
        </button>
        <button
          onClick={skip}
          className="rounded-full border border-line px-5 py-2 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
        >
          Skip
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
          ? "Tap Open keyboard, then type the letter you hear. Tap Replay sound to hear it again."
          : "Type the letter you hear. Press Replay sound to hear it again."}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg text-ink">{value}</span>
      <span className="text-xs uppercase tracking-widest text-ink-faint">{label}</span>
    </div>
  );
}
