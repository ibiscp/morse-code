interface MorseIllustrationProps {
  letter: string;
  label: string;
  revealedCount: number;
  size?: number;
}

// Every letter sprite sheet is a fixed 2500x500 strip (5 slots of 500x500:
// a blank frame plus one per symbol, since the longest letter pattern has
// 4 symbols). Every digit sprite is a fixed 3000x500 strip (6 slots, since
// every digit pattern has exactly 5 symbols). Shorter patterns simply
// leave their trailing slots blank in the source file, so the slot count
// used for the CSS math must match the file's actual layout, not that
// particular character's own pattern length.
const LETTER_FRAMES = 5;
const DIGIT_FRAMES = 6;

// Renders one frame of the character's sprite sheet (frame 0 = plain
// outline, frame N = N symbols highlighted), selected via a CSS
// background-position step so the illustration can "build up" alongside
// usePatternReveal.
export function MorseIllustration({ letter, label, revealedCount, size = 80 }: MorseIllustrationProps) {
  const totalFrames = /^[0-9]$/.test(letter) ? DIGIT_FRAMES : LETTER_FRAMES;
  const frame = Math.min(revealedCount, totalFrames - 1);
  const positionPercent = (frame / (totalFrames - 1)) * 100;

  return (
    <div
      role="img"
      aria-label={label}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(/images/morse/${letter.toUpperCase()}.png)`,
        backgroundSize: `${totalFrames * 100}% 100%`,
        backgroundPosition: `${positionPercent}% 0%`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
