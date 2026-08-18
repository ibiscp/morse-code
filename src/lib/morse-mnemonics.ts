// Mnemonic word for each character's illustration (letters from Google
// Creative Lab's morse-learn project, digits added by zmorse). The
// highlighted shape in each drawing traces the character's dot/dash
// pattern, e.g. the eye's pupil is the single dot of E.
export const MNEMONIC_WORDS: Record<string, string> = {
  A: "Archery",
  B: "Banjo",
  C: "Candy",
  D: "Dog",
  E: "Eye",
  F: "Firetruck",
  G: "Giraffe",
  H: "Hippo",
  I: "Insect",
  J: "Jet",
  K: "Kite",
  L: "Laboratory",
  M: "Mustache",
  N: "Net",
  O: "Orchestra",
  P: "Paddle",
  Q: "Quarterback",
  R: "Robot",
  S: "Submarine",
  T: "Tape",
  U: "Unicorn",
  V: "Vacuum",
  W: "Wand",
  X: "X-ray",
  Y: "Yard",
  Z: "Zebra",
  "0": "Zero",
  "1": "One",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Nine",
};

// Explicit display order: JS objects always enumerate integer-like keys
// ("0".."9") before letter keys regardless of insertion order, so callers
// that want "letters, then digits" need these instead of Object.keys().
export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const DIGITS = "0123456789".split("");

export function getMnemonicWord(char: string): string | null {
  return MNEMONIC_WORDS[char.toUpperCase()] ?? null;
}
