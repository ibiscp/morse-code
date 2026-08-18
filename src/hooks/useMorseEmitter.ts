"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MorseAudioPlayer } from "@/lib/morse-audio";
import { getMorsePattern, SPACE_CHAR } from "@/lib/morse-code";
import { getRandomPhrase } from "@/lib/phrases";

const TAP_THRESHOLD_MS = 180; // hold shorter than this => dot, longer => dash
const COMMIT_GAP_MS = 600; // silence after release before the buffered symbols are scored as one letter
const DOT_SAMPLE_WINDOW = 8;
const DEFAULT_WPM_ESTIMATE = Math.round(1200 / TAP_THRESHOLD_MS);

export type EmitCharStatus = "pending" | "correct" | "incorrect";

export interface EmitResult {
  char: string;
  status: EmitCharStatus;
  inputPattern: string | null;
}

export type EmitStatus = "idle" | "active" | "complete";

// Drives the "send" practice: the learner sees the target phrase and keys
// it out on a single key (typically Space), holding it briefly for a dot
// and longer for a dash. A pause after release commits the buffered
// symbols as one letter and scores them against the expected pattern.
export function useMorseEmitter() {
  const playerRef = useRef<MorseAudioPlayer | null>(null);
  const pressStartRef = useRef<number | null>(null);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bufferRef = useRef<string[]>([]);
  const dotDurationsRef = useRef<number[]>([]);
  const phraseRef = useRef("");
  const indexRef = useRef(0);
  const resultsRef = useRef<EmitResult[]>([]);

  const [phrase, setPhrase] = useState("");
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<EmitResult[]>([]);
  const [status, setStatus] = useState<EmitStatus>("idle");
  const [isKeyDown, setIsKeyDown] = useState(false);
  const [buffer, setBuffer] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [wpmEstimate, setWpmEstimate] = useState(DEFAULT_WPM_ESTIMATE);

  useEffect(() => {
    playerRef.current = new MorseAudioPlayer();
    return () => {
      playerRef.current?.dispose();
    };
  }, []);

  const clearCommitTimer = useCallback(() => {
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
  }, []);

  const syncIndex = useCallback((next: number) => {
    indexRef.current = next;
    setIndex(next);
  }, []);

  const syncResults = useCallback((next: EmitResult[]) => {
    resultsRef.current = next;
    setResults(next);
  }, []);

  // Spaces carry no Morse pattern of their own, so they're marked correct
  // and skipped over automatically as soon as they're reached.
  const skipSpaces = useCallback((text: string, from: number, draft: EmitResult[]) => {
    let i = from;
    while (i < text.length && text[i] === SPACE_CHAR) {
      draft[i] = { char: SPACE_CHAR, status: "correct", inputPattern: null };
      i++;
    }
    return i;
  }, []);

  const beginPhrase = useCallback(
    (text: string) => {
      clearCommitTimer();
      bufferRef.current = [];
      dotDurationsRef.current = [];
      pressStartRef.current = null;
      phraseRef.current = text;
      setBuffer("");
      setIsKeyDown(false);
      setWpmEstimate(DEFAULT_WPM_ESTIMATE);
      setPhrase(text);
      setCorrectCount(0);
      setTotalCount(0);
      setStatus("active");

      const draft: EmitResult[] = text.split("").map((char) => ({
        char,
        status: "pending",
        inputPattern: null,
      }));
      const startIndex = skipSpaces(text, 0, draft);
      syncResults(draft);
      syncIndex(startIndex);
    },
    [clearCommitTimer, skipSpaces, syncIndex, syncResults]
  );

  const nextPhrase = useCallback(async () => {
    await playerRef.current?.resume();
    beginPhrase(getRandomPhrase());
  }, [beginPhrase]);

  // Starts automatically on mount: navigating here from the menu already
  // counts as the user gesture the browser needs to unlock audio, so no
  // extra "Start" click is needed.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate one-time kickoff of audio + the first phrase on mount, not a derived-state sync
    void nextPhrase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scores the buffered dots/dashes against the current target character,
  // then advances (skipping any spaces) or finishes the phrase.
  const commitLetter = useCallback(() => {
    clearCommitTimer();
    if (bufferRef.current.length === 0) return;

    const text = phraseRef.current;
    const i = indexRef.current;
    const inputPattern = bufferRef.current.join("");
    bufferRef.current = [];
    setBuffer("");

    if (i >= text.length) return;

    const expectedPattern = getMorsePattern(text[i]).join("");
    const isCorrect = inputPattern === expectedPattern;

    const draft = [...resultsRef.current];
    draft[i] = { char: text[i], status: isCorrect ? "correct" : "incorrect", inputPattern };

    setTotalCount((c) => c + 1);
    if (isCorrect) setCorrectCount((c) => c + 1);

    const nextIndex = skipSpaces(text, i + 1, draft);
    syncResults(draft);
    syncIndex(nextIndex);

    if (nextIndex >= text.length) {
      setStatus("complete");
    }
  }, [clearCommitTimer, skipSpaces, syncIndex, syncResults]);

  const pressKey = useCallback(() => {
    if (status !== "active" || pressStartRef.current !== null) return;
    clearCommitTimer();
    pressStartRef.current = Date.now();
    setIsKeyDown(true);
    void playerRef.current?.toneOn();
  }, [status, clearCommitTimer]);

  const releaseKey = useCallback(() => {
    if (pressStartRef.current === null) return;
    const duration = Date.now() - pressStartRef.current;
    pressStartRef.current = null;
    setIsKeyDown(false);
    playerRef.current?.toneOff();

    const symbol = duration < TAP_THRESHOLD_MS ? "." : "-";
    bufferRef.current.push(symbol);
    setBuffer(bufferRef.current.join(""));

    if (symbol === ".") {
      const dots = dotDurationsRef.current;
      dots.push(duration);
      if (dots.length > DOT_SAMPLE_WINDOW) dots.shift();
      const avg = dots.reduce((a, b) => a + b, 0) / dots.length;
      setWpmEstimate(Math.round(1200 / avg));
    }

    clearCommitTimer();
    commitTimerRef.current = setTimeout(commitLetter, COMMIT_GAP_MS);
  }, [clearCommitTimer, commitLetter]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      e.preventDefault();
      pressKey();
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      e.preventDefault();
      releaseKey();
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    // Safety net: if focus leaves the window mid-press, the keyup can be
    // missed entirely, leaving the sidetone stuck on.
    window.addEventListener("blur", releaseKey);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseKey);
    };
  }, [pressKey, releaseKey]);

  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;

  return {
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
  };
}
