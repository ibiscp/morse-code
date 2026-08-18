import { SPACE_CHAR } from "./morse-code";

export type PhraseItem<T> = { data: T; index: number };
export type PhraseSegment<T> =
  | { type: "word"; items: PhraseItem<T>[] }
  | { type: "gap"; item: PhraseItem<T> };

// Groups a per-character array into word segments split on the space
// character, so a word can be rendered non-wrapping while only the gap
// between words is allowed to break to the next line.
export function toPhraseSegments<T extends { char: string }>(items: T[]): PhraseSegment<T>[] {
  const segments: PhraseSegment<T>[] = [];
  let word: PhraseItem<T>[] = [];

  items.forEach((data, index) => {
    if (data.char === SPACE_CHAR) {
      if (word.length) {
        segments.push({ type: "word", items: word });
        word = [];
      }
      segments.push({ type: "gap", item: { data, index } });
    } else {
      word.push({ data, index });
    }
  });
  if (word.length) segments.push({ type: "word", items: word });

  return segments;
}
