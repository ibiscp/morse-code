"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MorseAudioPlayer } from "@/lib/morse-audio";
import { isSupportedChar, SPACE_CHAR } from "@/lib/morse-code";
import { getRandomPhrase } from "@/lib/phrases";

const MIN_UNIT_MS = 40; // ~30 WPM
const MAX_UNIT_MS = 220; // ~5.5 WPM
const START_UNIT_MS = 130; // ~9 WPM, comfortable for beginners
const INTERVAL_WINDOW = 5;
const SOUND_SPEEDUP = 2; // tones (both while listening and the end-of-phrase replay) play this many times faster than the adaptive pace
const REPLAY_START_DELAY_MS = 600;
const REPLAY_WORD_GAP_UNITS = 4;
const REPLAY_CHAR_GAP_UNITS = 2;

export type CharStatus = "pending" | "current" | "correct" | "incorrect";

export interface CharResult {
  char: string;
  status: CharStatus;
  typed: string | null;
  hintUsed: boolean;
}

export type TrainerStatus = "idle" | "active" | "complete";

// Drives the interactive Morse practice session: plays the current
// character, listens for the matching keystroke, adapts playback speed to
// the learner's typing rhythm, and reveals a hint on demand.
export function useMorseTrainer() {
  const playerRef = useRef<MorseAudioPlayer | null>(null);
  const lastAdvanceAtRef = useRef<number | null>(null);
  const intervalsRef = useRef<number[]>([]);
  const unitMsRef = useRef(START_UNIT_MS);
  const playbackTokenRef = useRef(0);

  const [phrase, setPhrase] = useState("");
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<CharResult[]>([]);
  const [unitMs, setUnitMs] = useState(START_UNIT_MS);
  const [hintVisible, setHintVisible] = useState(false);
  const [status, setStatus] = useState<TrainerStatus>("idle");
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);

  useEffect(() => {
    playerRef.current = new MorseAudioPlayer();
    return () => {
      playerRef.current?.dispose();
    };
  }, []);

  const showHint = useCallback(() => {
    setHintVisible(true);
  }, []);

  // The tone duration actually used for playback: faster than the adaptive
  // pace tracked from typing rhythm, so listening feels closer to the
  // fluent cadence heard in the end-of-phrase replay.
  const getSoundUnitMs = useCallback(() => {
    return Math.max(MIN_UNIT_MS, unitMsRef.current / SOUND_SPEEDUP);
  }, []);

  // Plays a single character's tone. Used both to auto-play the current
  // character and to let the learner click any already-typed letter to
  // hear it again; either use interrupts an in-flight auto-replay.
  const playChar = useCallback(
    (char: string) => {
      playbackTokenRef.current += 1;
      setPlaybackIndex(null);
      if (char === SPACE_CHAR) return;
      void playerRef.current?.playChar(char, getSoundUnitMs());
    },
    [getSoundUnitMs]
  );

  const beginPhrase = useCallback(
    (text: string) => {
      intervalsRef.current = [];
      lastAdvanceAtRef.current = Date.now();
      setPhrase(text);
      setIndex(0);
      setResults(
        text.split("").map((char) => ({
          char,
          status: "pending",
          typed: null,
          hintUsed: false,
        }))
      );
      setCorrectCount(0);
      setTotalCount(0);
      setStatus("active");
      setHintVisible(false);
      playChar(text[0]);
    },
    [playChar]
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

  const replay = useCallback(() => {
    if (status !== "active") return;
    playChar(phrase[index]);
  }, [status, playChar, phrase, index]);

  // Updates the adaptive playback speed from the interval between the
  // learner's last two keystrokes, smoothed to avoid jittery speed jumps.
  const updateSpeedFromInterval = useCallback((intervalMs: number) => {
    const intervals = intervalsRef.current;
    intervals.push(intervalMs);
    if (intervals.length > INTERVAL_WINDOW) intervals.shift();
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const target = Math.min(MAX_UNIT_MS, Math.max(MIN_UNIT_MS, avg / 8));
    const blended = unitMsRef.current * 0.6 + target * 0.4;
    unitMsRef.current = blended;
    setUnitMs(blended);
  }, []);

  const submitChar = useCallback(
    (typed: string) => {
      if (status !== "active") return;
      const target = phrase[index];
      const isCorrect = typed.toUpperCase() === target.toUpperCase();
      const now = Date.now();
      const hintWasUsed = hintVisible;

      if (lastAdvanceAtRef.current !== null) {
        updateSpeedFromInterval(now - lastAdvanceAtRef.current);
      }
      lastAdvanceAtRef.current = now;

      setResults((prev) => {
        const next = [...prev];
        next[index] = {
          char: target,
          status: isCorrect ? "correct" : "incorrect",
          typed,
          hintUsed: hintWasUsed,
        };
        return next;
      });
      setTotalCount((c) => c + 1);
      if (isCorrect) setCorrectCount((c) => c + 1);

      const nextIndex = index + 1;
      if (nextIndex >= phrase.length) {
        setStatus("complete");
        setIndex(nextIndex);
        return;
      }

      setIndex(nextIndex);
      setHintVisible(false);
      playChar(phrase[nextIndex]);
    },
    [status, phrase, index, hintVisible, updateSpeedFromInterval, playChar]
  );

  // Plays the whole finished phrase back at a faster, fluent pace,
  // highlighting each character as it sounds. Cancels itself if the token
  // changes (a new phrase starts or the learner clicks a letter).
  const playPhraseFast = useCallback(
    async (text: string) => {
      const token = ++playbackTokenRef.current;
      const fastUnit = getSoundUnitMs();
      const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

      await sleep(REPLAY_START_DELAY_MS);

      for (let i = 0; i < text.length; i++) {
        if (token !== playbackTokenRef.current) return;
        const char = text[i];
        setPlaybackIndex(i);

        if (char === SPACE_CHAR) {
          await sleep(fastUnit * REPLAY_WORD_GAP_UNITS);
        } else {
          await playerRef.current?.playChar(char, fastUnit);
          if (token !== playbackTokenRef.current) return;
          await sleep(fastUnit * REPLAY_CHAR_GAP_UNITS);
        }
      }

      if (token === playbackTokenRef.current) setPlaybackIndex(null);
    },
    [getSoundUnitMs]
  );

  useEffect(() => {
    if (status === "complete" && phrase) {
      void playPhraseFast(phrase);
    }
  }, [status, phrase, playPhraseFast]);

  // Lets the learner replay the whole phrase on demand, e.g. from a
  // "Replay phrase" button, reusing the same fluent fast pace.
  const replayPhrase = useCallback(() => {
    if (!phrase) return;
    void playPhraseFast(phrase);
  }, [phrase, playPhraseFast]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (status !== "active") return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;

      const key = e.key === " " ? SPACE_CHAR : e.key.toUpperCase();
      if (key.length !== 1) return;
      if (!isSupportedChar(key)) return;

      e.preventDefault();
      submitChar(key);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, submitChar]);

  const wpm = useMemo(() => Math.round(1200 / unitMs), [unitMs]);
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;

  return {
    phrase,
    index,
    results,
    status,
    hintVisible,
    wpm,
    correctCount,
    totalCount,
    accuracy,
    playbackIndex,
    nextPhrase,
    replay,
    replayPhrase,
    showHint,
    playChar,
  };
}
