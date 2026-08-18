export type MorseSymbol = "." | "-";

// International Morse Code map for letters and digits. Space is handled
// separately by callers since it has no dit/dah pattern of its own.
export const MORSE_CODE: Record<string, MorseSymbol[]> = {
  A: [".", "-"],
  B: ["-", ".", ".", "."],
  C: ["-", ".", "-", "."],
  D: ["-", ".", "."],
  E: ["."],
  F: [".", ".", "-", "."],
  G: ["-", "-", "."],
  H: [".", ".", ".", "."],
  I: [".", "."],
  J: [".", "-", "-", "-"],
  K: ["-", ".", "-"],
  L: [".", "-", ".", "."],
  M: ["-", "-"],
  N: ["-", "."],
  O: ["-", "-", "-"],
  P: [".", "-", "-", "."],
  Q: ["-", "-", ".", "-"],
  R: [".", "-", "."],
  S: [".", ".", "."],
  T: ["-"],
  U: [".", ".", "-"],
  V: [".", ".", ".", "-"],
  W: [".", "-", "-"],
  X: ["-", ".", ".", "-"],
  Y: ["-", ".", "-", "-"],
  Z: ["-", "-", ".", "."],
  "0": ["-", "-", "-", "-", "-"],
  "1": [".", "-", "-", "-", "-"],
  "2": [".", ".", "-", "-", "-"],
  "3": [".", ".", ".", "-", "-"],
  "4": [".", ".", ".", ".", "-"],
  "5": [".", ".", ".", ".", "."],
  "6": ["-", ".", ".", ".", "."],
  "7": ["-", "-", ".", ".", "."],
  "8": ["-", "-", "-", ".", "."],
  "9": ["-", "-", "-", "-", "."],
};

export const SPACE_CHAR = " ";

export function isSupportedChar(char: string): boolean {
  return char === SPACE_CHAR || char.toUpperCase() in MORSE_CODE;
}

export function getMorsePattern(char: string): MorseSymbol[] {
  if (char === SPACE_CHAR) return [];
  return MORSE_CODE[char.toUpperCase()] ?? [];
}

export function patternToString(pattern: MorseSymbol[]): string {
  return pattern.join(" ");
}

// Cumulative offset (ms) at which each symbol in `pattern` starts, given
// the same dit/dah/gap timing used to schedule the audio (dash = 3 units,
// gap between symbols = 1 unit). Lets UI reveal animations stay in step
// with the tone without needing the Web Audio clock itself.
export function getSymbolTimings(pattern: MorseSymbol[], unitMs: number): number[] {
  const timings: number[] = [];
  let t = 0;
  for (const symbol of pattern) {
    timings.push(t);
    t += (symbol === "-" ? unitMs * 3 : unitMs) + unitMs;
  }
  return timings;
}
