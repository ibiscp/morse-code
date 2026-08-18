"use client";

import { useEffect, useState } from "react";
import { getSymbolTimings, type MorseSymbol } from "@/lib/morse-code";

const START_DELAY_UNITS = 1.5; // pause (in units) with nothing revealed yet, before the build-up starts

// Steps `revealedCount` up from 0 to pattern.length on the same timing as
// the tone (dash = 3 units, gap = 1 unit), so a UI element can "build up"
// a Morse pattern symbol by symbol in sync with what's being heard. Holds
// at 0 (nothing revealed) for a beat first, so the blank state is visible
// before the first dot/dash appears.
export function usePatternReveal(pattern: MorseSymbol[], unitMs: number, active: boolean) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting/restarting the reveal is the whole point when `active` or the pattern changes, not a derived-state sync
    setRevealedCount(0);
    if (!active || pattern.length === 0) {
      return;
    }

    const startDelay = unitMs * START_DELAY_UNITS;
    const timings = getSymbolTimings(pattern, unitMs);
    const timers = timings.map((t, i) =>
      setTimeout(() => setRevealedCount(i + 1), startDelay + t)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, pattern.join(""), unitMs]);

  return revealedCount;
}
