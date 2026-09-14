# Release hardening

`pnpm hardening:audit` (`scripts/hardening-audit.mjs`). Feature work is closed, so this is the audit for the
things a 1.0 can fail on without any of them being a bug in a motion: whether the package resolves the way it
claims, whether tracked generated artifacts are current, whether the scripts the manifest names exist, whether
the docs name what Jumi ships, and whether the records claim classes that resolve.

## Summary

```text
fixed   package.json module → dist/index.js      pointed at dist/index.esm.js, which is never built
fixed   package.json main → dist/index.cjs       was the ESM file, under a field legacy tools require()
fixed   documented 8 controls the docs never named
fixed   registered spike:real-page               a spike the records cite, unrunnable by name
fixed   one stale class example in naming.md     the scanner found it; nothing else was stale
open    files lists LICENSE, and there is no LICENSE file
```

## 1 · The package resolved to a file that is never built

| field | before | after |
| --- | --- | --- |
| `module` | `dist/index.esm.js` — **missing** | `dist/index.js` (the ESM build) |
| `main` | `dist/index.js` — the ESM file | `dist/index.cjs` (what `require()` can load) |
| `types` | `dist/index.d.ts` — present | unchanged |

The build emits `index.js` + `index.cjs` per entry, with matching `.d.ts`/`.d.cts`, so `module` was a phantom
path and `main` named an ESM file under the field legacy tooling reads as CommonJS. The `exports` map was
correct throughout and is what modern resolvers use, which is exactly why this survived: every tool that
respects `exports` was fine, and only a bundler falling back to `module` would have failed.

All four subpaths (`.`, `./postcss`, `./vite`, `./view-transition`) were loaded both ways — `import()` and
`require()` — and each returned the same number of exports from both, so the entry points themselves are sound.

**Open:** `files` promises `LICENSE` and no such file exists. The manifest declares `license: MIT` and an
author, so this needs the licence text rather than a decision about which licence — written by hand, not
generated, which is why it is reported here instead of fixed.

## 2 · Artifacts and scripts

| reading | result |
| --- | --- |
| tracked artifacts a build can regenerate | 6 — `docs/vendor`, `examples`, the CSS snapshot |
| stale after regenerating | **none** — `docs:prepare` and `examples:build` changed nothing |
| scripts naming a node file | 38 of 52 |
| tracked node files not registered | 1 — `spike-real-page.mjs`, cited by `style-cost.md`, now `spike:real-page` |

Nothing generated is tracked that a rebuild disagrees with, which is the reading that matters most here: the
snapshot that guards the emitter and the vendor bundle the docs load are both current.

## 3 · Documentation coverage

Effects are generated from the data the library ships, so the check is exact: **228 shipped, 0 unnamed**.
Controls are the bounded set an author chooses between, and eight were never named anywhere in the docs:

```text
animation-timeline-axis          which axis a timeline follows
animation-timeline-inset-start   where tracking starts inside the scrollport
animation-timeline-inset-end     where it stops
animation-timeline-scroller      which scroller a scroll() timeline takes (nearest | root | self)
transition-behavior              whether a discrete property may flip at all
transition-delay                 the delay half of the transition controls
transition-timing-function       the easing half
animation-range-end-offset       the end half of the offset utilities
```

All eight are now documented where they belong — the timeline four in the scroll-driven section of
`controls.md`, the transition three in `transitions.md` beside a worked `allow-discrete` example, and the
range offset next to its start twin. Property utilities are reported as a count and not as a gap: 395 shipped,
327 never named, because the docs teach those by category and by example rather than one class at a time.

## 4 · Records that claim classes

The scanner extracts backticked spans that are *entirely* a class-like token, builds them, and reports the ones
no build resolves. It found one genuine stale example — `animate-background-color-red/reveal` in `naming.md`,
where `red` is not a value Jumi has — and otherwise returned the refusals the records deliberately teach:
validation examples (`animate-width-abc`, `animate-offset-distance-[abc]`), absences the scope settled
(`animate-perspective-400`, `animate-will-change-[transform]`, `view-transition-group`) and spellings the
records specifically rejected (`animation-range-start-timeline-entry`, `animation-timeline---feed`).

That split is the point of the section: a record *should* contain class names that resolve to nothing when the
record is about them resolving to nothing, so the output is a list to read rather than a gate to pass.

## 5 · What is still to audit

| area | state |
| --- | --- |
| fresh install and clean build | **done** — see §6 |
| unsupported-browser behaviour | **done** — see §7 |
| release and migration notes | **done** — `CHANGELOG.md` plus §8 |
| DevTools behaviour and CSS size | to do: the existing `measure:real-page` and `style-cost` instruments, recorded as a release baseline |

## 6 · Clean build, from nothing

| reading | result |
| --- | --- |
| `pnpm install --frozen-lockfile` | lockfile up to date, resolution skipped |
| `dist/` and `docs/.astro` removed first | the gate's first stage rebuilt everything |
| `pnpm check` afterwards | **16/16** |
| `pnpm run docs:build` | 13 pages, clean |

No committed artifact is load-bearing: with `dist/` absent, the bundle step produces it and every stage runs.
The docs build is the second half of that — it is the only path that runs the bundler, the vendor step and every
page together, and it is the one a broken example would break.

## 7 · What holds when the browser lacks the feature

Section G of the audit builds one candidate per feature and reports, for each, whether it is emitted and what
travels with it. Only one feature carries a CSS guard; the rest degrade through behaviour that is defined rather
than guarded, which is a legitimate choice and now a written one:

| feature | if the browser does not have it |
| --- | --- |
| `sibling-index()` (adaptive stagger) | **guarded** — the `/[count]` modifier emits `:nth-child` enumeration inside `@supports not (…)` |
| `@property` | keyframes write real properties, so values interpolate anyway |
| `animation-timeline` / `animation-range` | the document timeline; a dropped range leaves the motion on the default range. `supports-[…]` is the strict form |
| `interpolate-size` | the keyword change becomes discrete rather than interpolated |
| `transition-behavior` | a discrete property does not transition at all — the change happens instantly |
| `linear()` | an unsupported easing function leaves the animation on its initial easing |
| `@view-transition` | the runtime reports unsupported and performs the update anyway (asserted in the view-transition stage) |

The `transition-behavior` row was the one degradation the docs did not state, and it does now — the sentence sits
where the control is taught, because that is where someone would look for it.

## 8 · Release tooling, and where the boundary goes

The tooling question had a precondition — is the hand-written section the canonical history — and two
measurements answered it:

| reading | result |
| --- | --- |
| tags in the repository | **0**, so the generator has nothing to stop at and would rewrite the whole history |
| commits that are Conventional Commits | **83 of the last 100** |
| what `pnpm exec conventional-changelog -p conventionalcommits -f --stdout` produces | a complete release entry with Features, Bug Fixes and **two BREAKING CHANGES the hand-written notes had missed** |
| where the release version comes from | `package.json` — so the bump has to happen *before* generation |

So the boundary is a **tag**, and the curated notes are the history up to it. The generator's own output made the
case better than an argument could: it surfaced `animation-range-{start,end}-timeline` being replaced by
`animation-range-start-entry`/`-end-exit`, and the phrase separator changing from a comma to a pipe — both real,
both absent from the notes I had written by re-reading the records. Those are now in `CHANGELOG.md`, and the file
says which half is which.

Wired, following the CTO's preference for explicit versions and a separated concern:

```text
changelog generation   conventional-changelog + conventional-changelog-conventionalcommits (maintained)
version decision       pnpm run release:patch | minor | major   → pnpm version <bump> --no-git-tag-version
release automation     not yet — optional, and later
```

`standard-version` was not used: deprecated, and it bundles the bump, the generated file, the commit and the tag
into one command, which is exactly the control worth keeping. Two corrections to the sketch that came out of
reading the CLI's own help:

- **`-s` is not a flag on this CLI.** It is `standard-version`'s. The real pair is `-i CHANGELOG.md -o CHANGELOG.md`,
  which prepends by default.
- **`-r 0` overwrites the whole file** rather than prepending. This is not theoretical: a stray inspection run of
  mine rewrote `CHANGELOG.md` and destroyed the hand-written notes, and the damage was found by *content*, not by
  the line count I had checked first — which had coincidentally been similar.

Hence `scripts/changelog.mjs`: it refuses without a tag (there is no boundary), never passes `-r 0`, and reports
the version it stamped so the order can be verified rather than trusted. The flow, and the reasons for its order,
are in `CONTRIBUTING.md`.

## Instrument notes

Four ways this audit was wrong before it was right, all of them producing *false findings* — the expensive
direction, because each one invites work:

- **Ignore-blind walking.** A filesystem walk reported nine harness temp directories as unreachable code.
  `.gitignore` already covers them (`scripts/tmp-*`, `scripts/.*-*/`), so the check now reads tracked files
  only and lets the ignore rules decide what is scratch.
- **A catalogue left out.** The effects check demanded the docs name 216 effects that *are* documented, because
  the page is generated from JSON and the walk only read `.md`/`.astro`/`.ts`.
- **Bare property names read as class claims.** `transition-property` on its own is never a candidate, so the
  records looked full of dead classes. Property and control names are now excluded, and a family named without
  a value is separated from a finished example.
- **Prose read as classes.** `transitions`, `transitioned`, `animationstart` and the `view-transition` at-rule
  prefix are words, not classes; they are filtered by name rather than by pattern, because the pattern that
  would exclude them would also exclude real ones.
- **A guard check that spanned blocks.** The first version of §7 asked the stylesheet *text* whether a feature
  appeared inside an `@supports` block, with a `[^@]*` scan, and reported four features as guarded that are not.
  It now walks the parsed tree for `@supports` rules and tests each one in isolation — the same repair this
  repository has made twice before, textual search replaced by the structure it was trying to describe.

And one that was not the audit at all: a `grep` for registered script paths searched for the quoted path while
the manifest stores `node scripts/x.mjs`, so *every* script looked unregistered. The check parses the command
the way npm does instead — a reminder that a report of "all of them are broken" is usually the instrument.
