# Learn Morse Code

An interactive Next.js app for learning Morse code by ear and by hand: browse the alphabet, listen to characters and type what you hear, or key phrases out yourself on a single button.

## Features

- **Browse the alphabet** (`/alphabet`) — click any letter or digit to hear its Morse pattern, shown with a mnemonic illustration that builds up dot by dot, dash by dash, in sync with the sound.
- **Listen & type** (`/practice`) — the app plays a character, you type the letter you heard. Playback speed adapts to your typing rhythm, a hint button reveals the letter and its pattern on demand, and the finished phrase replays at a faster, fluent pace.
- **Send Morse code** (`/send`) — the reverse exercise. You see the phrase and key it out yourself: hold Space briefly for a dot, longer for a dash, then pause to move to the next letter. Includes a live sidetone while the key is held and an estimated WPM based on your own tap timing.
- **Light / dark theme**, persisted across visits.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4
- Web Audio API for tone generation (no audio files or external services)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## Project structure

```
src/
  app/
    page.tsx            # home menu
    alphabet/page.tsx    # alphabet browser
    practice/page.tsx    # listen & type
    send/page.tsx         # send (key it out)
    icon.tsx, apple-icon.tsx, opengraph-image.tsx  # generated app icons/social image
  components/            # UI components for each mode
  hooks/
    useMorseTrainer.ts    # listen & type state machine
    useMorseEmitter.ts    # send-mode state machine (tap timing, scoring)
    useAlphabetPlayer.ts  # single-character playback for the alphabet page
  lib/
    morse-code.ts         # Morse code map + helpers
    morse-audio.ts         # Web Audio tone player (scheduled + live sidetone)
    morse-mnemonics.ts     # letter -> mnemonic word map
    phrases.ts             # practice phrase bank
    phrase-segments.ts      # shared word-wrapping/grouping logic
public/images/morse/       # per-letter mnemonic illustrations
```

## Credits

The per-letter mnemonic illustrations (`public/images/morse/*.png`) originate from Google Creative Lab's [morse-learn](https://github.com/googlecreativelab/morse-learn) project, licensed under [Apache 2.0](public/images/morse/LICENSE.txt). The 5-frame sprite sheet versions used here, which let the highlighted dot/dash shape build up frame by frame, were prepared by [zmorse](https://github.com/zsphinxyz/zmorse). See [NOTICE.txt](public/images/morse/NOTICE.txt) for details.
