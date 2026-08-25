"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MorseAudioPlayer } from "@/lib/morse-audio";
import { MORSE_CODE } from "@/lib/morse-code";

const DRILL_UNIT_MS = 100; // ~12 WPM, a steady pace for single-letter drills
const REVEAL_MS = 900; // how long the answer stays on screen before the next letter

// Weighted-selection tuning: every letter starts at BASE_WEIGHT; a miss bumps
// its weight (up to WEIGHT_MAX) so it recurs more often, and each later hit
// decays it back toward the base so mastered letters fade out again.
const BASE_WEIGHT = 1;
const WEIGHT_MAX = 8;
const WRONG_INCREMENT = 3;
const CORRECT_DECREMENT = 1;

// Only the A-Z letters (no digits) are drilled, matching "random letters".
const LETTERS = Object.keys(MORSE_CODE).filter((c) => /^[A-Z]$/.test(c));

export type DrillPhase = "listening" | "revealing";

// Picks a letter by weighted random (letters missed more often carry more
// weight), excluding the current one so the same tone never plays twice back
// to back.
function pickLetter(exclude: string, weights: Record<string, number>): string {
  const pool = LETTERS.filter((l) => l !== exclude);
  const total = pool.reduce((sum, l) => sum + weights[l], 0);
  let r = Math.random() * total;
  for (const letter of pool) {
    r -= weights[letter];
    if (r < 0) return letter;
  }
  return pool[pool.length - 1];
}

// Drives the "audio only" drill: plays a random letter's Morse tone, waits
// for the learner to type it, reveals whether they were right, then moves on
// to the next random letter. Only one letter is in play at a time.
export function useLetterDrill() {
  const playerRef = useRef<MorseAudioPlayer | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentRef = useRef("");
  const phaseRef = useRef<DrillPhase>("listening");
  // Per-letter selection weights for this session; missed letters get heavier.
  const weightsRef = useRef<Record<string, number>>(
    Object.fromEntries(LETTERS.map((l) => [l, BASE_WEIGHT]))
  );

  const [current, setCurrent] = useState("");
  const [phase, setPhase] = useState<DrillPhase>("listening");
  const [typed, setTyped] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  // Advances to a fresh random letter and plays its tone.
  const nextLetter = useCallback(() => {
    clearAdvanceTimer();
    const letter = pickLetter(currentRef.current, weightsRef.current);
    currentRef.current = letter;
    phaseRef.current = "listening";
    setCurrent(letter);
    setPhase("listening");
    setTyped(null);
    setLastCorrect(null);
    void playerRef.current?.playChar(letter, DRILL_UNIT_MS);
  }, [clearAdvanceTimer]);

  useEffect(() => {
    playerRef.current = new MorseAudioPlayer();
    nextLetter();
    return () => {
      clearAdvanceTimer();
      playerRef.current?.dispose();
    };
  }, [nextLetter, clearAdvanceTimer]);

  // Replays the current letter's tone on demand.
  const replay = useCallback(() => {
    if (currentRef.current) {
      void playerRef.current?.playChar(currentRef.current, DRILL_UNIT_MS);
    }
  }, []);

  // Scores a typed guess against the current letter, reveals the result, and
  // schedules the next letter. Ignores input while a result is being shown.
  const submit = useCallback(
    (raw: string) => {
      if (phaseRef.current !== "listening") return;
      const key = raw.toUpperCase();
      if (!/^[A-Z]$/.test(key)) return;

      const target = currentRef.current;
      const isCorrect = key === target;

      // Reweight the target so missed letters resurface more often and
      // mastered ones gradually fade back to the base rate.
      const weights = weightsRef.current;
      weights[target] = isCorrect
        ? Math.max(BASE_WEIGHT, weights[target] - CORRECT_DECREMENT)
        : Math.min(WEIGHT_MAX, weights[target] + WRONG_INCREMENT);

      phaseRef.current = "revealing";
      setPhase("revealing");
      setTyped(key);
      setLastCorrect(isCorrect);
      setTotalCount((c) => c + 1);
      if (isCorrect) setCorrectCount((c) => c + 1);

      advanceTimerRef.current = setTimeout(nextLetter, REVEAL_MS);
    },
    [nextLetter]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      const key = e.key.toUpperCase();
      if (!/^[A-Z]$/.test(key)) return;
      e.preventDefault();
      submit(key);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [submit]);

  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;

  return {
    current,
    phase,
    typed,
    lastCorrect,
    correctCount,
    totalCount,
    accuracy,
    replay,
    skip: nextLetter,
    submit,
  };
}
