"use client";

import { useCallback, useEffect, useRef } from "react";
import { MorseAudioPlayer } from "@/lib/morse-audio";

export const BROWSE_UNIT_MS = 110; // ~11 WPM, comfortable for browsing letter by letter

// Minimal audio player for the alphabet reference page: no adaptive speed
// or session state, just "click a letter, hear its Morse code".
export function useAlphabetPlayer() {
  const playerRef = useRef<MorseAudioPlayer | null>(null);

  useEffect(() => {
    playerRef.current = new MorseAudioPlayer();
    return () => {
      playerRef.current?.dispose();
    };
  }, []);

  const playChar = useCallback(async (char: string) => {
    await playerRef.current?.resume();
    await playerRef.current?.playChar(char, BROWSE_UNIT_MS);
  }, []);

  return { playChar };
}
