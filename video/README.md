# The product video

A 60-second film for Jumi, made with Jumi. Every movement on screen is a Jumi class on an ordinary
HTML page; the page is the edit, and the renderer only turns it into frames.

| File              | What it is                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `index.html`      | The film: eight scenes, each a `<section class="scene" data-at data-until>`.             |
| `input.css`       | Its Tailwind entry. Scans `index.html`, registers Jumi from `dist/`.                     |
| `render.mjs`      | Compiles the stylesheet, records the page frame by frame, and encodes it with ffmpeg.    |
| `output.css`      | Generated. The finished stylesheet, after Jumi's post-build step.                        |
| `jumi.mp4`        | Generated. 1920×1080, 60 fps, H.264, silent.                                             |
| `voiceover.json`  | The narration: one line per scene, with its cue in milliseconds.                         |
| `voice.mjs`       | Reads the narration aloud, checks each line fits its scene, and mixes it under the film. |
| `jumi-voiced.mp4` | Generated. The film with the narration.                                                  |

## Render it

```sh
pnpm install
node video/render.mjs
```

That is the whole build: it bundles `dist/` if needed, runs Tailwind over `input.css`, finalizes the
CSS, and writes `video/jumi.mp4`. It needs `ffmpeg` on the path and the Chromium that Playwright
installs. A full render takes a few minutes; the log prints its pace.

Useful variations:

```sh
node video/render.mjs --fps 30 --out video/preview.mp4   # a faster, lighter cut
node video/render.mjs --stills                           # one PNG per second in video/stills/
node video/render.mjs --no-css                           # reuse output.css from the last run
```

## Watch it live

Open `video/index.html` in a browser after a render (it needs `output.css`). Without `?manual` in
the URL the page plays itself in real time, which is the quickest way to check a scene while editing.

## How the recording stays deterministic

Chromium's compositor runs transform and opacity animations on its own clock, so a screenshot loop
timed by the wall clock, or by the DevTools virtual clock, drifts: fast machines render early
frames, slow ones render late. The renderer avoids the clock altogether. For each frame it calls the
page's `__seek(t)`, which switches the scenes for time `t` and then pauses every animation on the
page and sets its `currentTime` to where it would be at `t`. The frame is a pure function of `t`,
so the render is identical on any machine and at any frame rate.

## Edit the cut

- A scene's `data-at` and `data-until` are its in and out points in milliseconds. The last 380 ms
  of a scene fade out.
- Inside a scene, delayed entrances use `animation-delay-[…]` with `animation-fill-mode-both`, so
  the element stays unrendered until its cue. A group that should arrive later as one unit (a
  staggered list, for instance) gets `class="cue" data-cue="<ms>"` and starts counting from then.
- The copy, palette, and type are the documentation site's own (`docs/src/styles/global.css`).
- The scene in and out points also drive the bed and the narration's cues, so after changing a
  scene's length, update that line's `at` and `until` in `voiceover.json` and run the three audio
  steps again.

## The voice-over

```sh
cd video && npm install && cd ..   # once: Kokoro's Node port, kept apart from the library's dependencies
node video/speak.mjs               # reads voiceover.json with Kokoro into video/voice/<scene>.wav
node video/music.mjs               # composes video/music.wav to the scene boundaries
node video/voice.mjs --keep        # fits each line, ducks the bed under it, writes jumi-voiced.mp4
```

`voice.mjs` uses `music.wav` when it exists and `--no-music` leaves it out. The bed is synthesized
from sines and noise at 122 BPM in A minor; each scene has an intensity in `music.mjs`, so the
arrangement builds under the catalogue, breaks down for "it costs nothing", and comes back for the
close. A sidechain compressor keyed from the narration pulls it down while she speaks.

The first `speak.mjs` run fetches the Kokoro-82M model (about 330 MB) into a cache inside
`video/node_modules`. The
voice is `af_heart` by default; `node video/speak.mjs --list` prints the others, `--voice bm_george`
picks one, `--speed 1.05` quickens the read, and `--only 03,07` re-reads lines after an edit. The
defaults live under `kokoro` in `voiceover.json`.

Each line in `voiceover.json` carries `at`, the millisecond it starts, and `until`, the cut it has to
finish before. `voice.mjs` refuses to mix if a read runs past its scene, so a rewrite is caught before
it is heard. `text` is the line as written; `say` is the spelling handed to the synthesizer when a
word needs help: Jumi is read as "Joomi", and the verb "lives" is spelled "livs", because the
phonemizer otherwise reads it as the plural of "life".

The narration is written as a talk, not a reading of the slides: the picture carries the headline,
the voice informs. It speaks about Jumi, never as its maker. Keep that split when editing a line.

To use a recorded narrator instead, save one file per line as `video/voice/<scene>.wav` and run
`node video/voice.mjs --keep`. Without `--keep`, `voice.mjs` falls back to Apple's built-in
synthesizer, which is only good enough to check timing.
