# SKILLS.md

Operating knowledge for an agent working in this repository. Everything here was measured in this
repository or is enforced by a check that runs in the gate, and the failures that produced each rule are
recorded next to it. Where a number is quoted, the command that produced it is named.

Read this before changing anything. Read `engineering/reviews/` when you need the reasoning behind a past
decision, and `CONTRIBUTING.md` for the human-facing version of the same material.

## 1. What this repository is

- `@ibnlanre/jumi` is a Tailwind CSS v4 plugin that writes CSS animations at build time. Nothing is shipped
  to the browser at runtime.
- **235 effects** live as keyframe timelines in `src/keyframes/effects.ts`. Property utilities, controls,
  phrases and stagger are generated from `src/properties/**`, `src/variables/**` and `src/theme/**`.
- Four published entries: the root plugin, `./postcss`, `./vite`, `./view-transition`.
- `0.1.0` is published. `0.1.1` is the next release and has not been cut.
- The library's most distinctive feature is authoring a keyframe **in a class name**, for example
  `animate-opacity-[0:0|50:1|100:1]`. Frames are separated by pipes. See section 7.

## 2. Commands

| Command                                  | What it does                                                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `pnpm check`                             | the gate: 19 stages, about 2.5 minutes of stage work                                                     |
| `node scripts/check.mjs css behaviour`   | a subset by stage label. `bundle` and `prepare` come along, because every stage below them loads `dist/` |
| `node scripts/check.mjs view-transition` | the documentation arm lives in this stage, which is why it is worth running alone while writing docs     |
| `pnpm bundle`                            | rebuilds `dist/`. This is the only thing that builds it                                                  |
| `pnpm test:run`                          | vitest                                                                                                   |
| `pnpm exec tsc --noEmit`                 | the `types` stage on its own                                                                             |
| `pnpm css:snapshot`                      | rewrites the recorded CSS snapshot after an intended emission change                                     |
| `pnpm changelog -- --preview`            | prints the generated release section and writes nothing                                                  |

The 19 stages, in dependency order: `bundle`, `prepare`, `types`, `lint`, `unit`, `theme`, `css`, `phrase`,
`incremental`, `behaviour`, `effects`, `view-transition`, `scroll-driven`, `vite`, `postcss`, `consumer`,
`legacy`, `stories`, `studio`.

Facts about the gate that change how you work:

- It is a list, not a chain. A failure names every stage and marks the untouched ones `not run`.
- `bundle` is `clean: true`, so stages call `ensureBundle()` and pooled stages receive
  `JUMI_BUNDLE=prebuilt`. Do not run `tsup` yourself while the gate is running: it empties the directory its
  peers are reading.
- `lint` runs `eslint --fix` across the repository, so it will reformat what you wrote. Run it before you
  read your own diff.
- The `consumer` stage packs the artifact and installs it into three isolated fixtures. It is the only stage
  that reads `package.json`'s `files`, `exports` or the published maps.

## 3. Invariants and what enforces them

| Invariant                                                                | Enforced or checked by                                    |
| ------------------------------------------------------------------------ | --------------------------------------------------------- |
| CSS property names are exact, with no invented abbreviations             | review, and `properties/match.ts` by example              |
| Utility variables are named `--jumi-<property>`                          | `scripts/dead-links.mjs --strict`, in the `css` stage     |
| A new effect name is added to the `Effect` union in `src/types/index.ts` | the `types` stage fails with TS2353                       |
| Effect counts agree across source, docs and stories                      | `pnpm effects:check`                                      |
| No carrier or legacy class in a shipped surface                          | `pnpm legacy:check`                                       |
| Every class the documentation names compiles                             | the documentation arm, currently 13 pages and 170 classes |
| The CSS snapshot is byte-exact                                           | the `css` stage                                           |
| Published declarations and maps are correct per condition                | the `consumer` stage, node16 and nodenext                 |

Two of those need a warning attached:

- **Effect edits do not move the CSS snapshot.** The snapshot corpus does not reference the effect names, so
  `pnpm css:snapshot` rewrites the files byte for byte and reports no change. Do not read that as "nothing
  changed"; diff the compiled keyframes instead.
- **Generated data must not be hand-edited.** `docs/src/data/effects.json` comes from `pnpm docs:prepare`,
  and the storybook story list from `pnpm stories:prepare`. Edit the source and re-run the script.

## 4. Keyframe authoring rules

These are library policy now, each one established by measuring the defect it removes.

1. **Declare `transform-origin` in every stop of an animation, not just the first.** A property declared in
   only some stops takes the underlying value in the others, so the pivot interpolates toward the element's
   own origin. Measured before the fix: `accordion` read `100px 0px`, then `30.8px`, `53.1px`, `58.5px`,
   `60px`; after it, one value at every sample.
2. **Declare an explicit `0%` rest state.** An animation that omits it inherits whatever transform the host
   element carries at creation time. `swing` read `20°` at `t=0` under a `rotate(20deg)` base and `0°`
   without one.
3. **A pose that loops must return to identity.** `lift` ended displaced by 5px and 2% scale, so every loop
   seam dropped it instantly. The pose is now the peak at `50%` and `100%` is identity.
4. **A clip reveal must cover the box at its final frame.** `diamond-in` and the `triangle-in` family ended
   at about 48% coverage, and the clip was then released, so the missing area popped in. They now grow past
   the corners and reach full coverage.
5. **Do not declare `transform-origin` where nothing transforms.** It is inert, and it reads as intent that
   is not there. Meantime `expand-left`/`expand-right` and `expand-up`/`expand-down` share one geometry:
   all four grow from the leading edge.

## 5. Recipes

**Add an effect.** Define the timeline in `src/keyframes/effects.ts`, alphabetically, in the
`{ '@keyframes jumi-<name>': { '0%': {...}, '100%': {...} } }` shape. Apply the five rules in section 4.
Add the name to the `Effect` union in `src/types/index.ts` or `tsc` fails the `types` stage. Run
`pnpm docs:prepare && pnpm stories:prepare`, then `pnpm effects:check`, then the gate. If the effect is a
clip reveal, also extend the coverage probe described in section 6.

**Add a property utility.** Add the `animate-<property>-{value}` entry to `src/properties/match.ts` in
alphabetical position, with `property: value => ({ '--jumi-<property>': value })` and the right `type`
(`color`, `length`, `angle`, `number`, `time`, `custom`). The key must survive `jumi-<property>-<hash>` for
values that make the key illegal. Then `pnpm bundle && pnpm css:snapshot`, and read the snapshot diff.

**Add a documentation page.** Create the file under `docs/src/pages/docs/`, register it in the `links` array
in `docs/src/layouts/Docs.astro`, and name only classes that compile: the documentation arm compiles every
class in every ```html block on every page, including `README.md`. Site-only classes such as `bg-ink` are
rejected, so use Tailwind core or Jumi utilities.

**Change the published surface.** Anything touching `src/index.ts`, `src/vite.ts`, `src/postcss.ts`,
`src/view-transition.ts` or `package.json` is checked by the `consumer` stage against the packed tarball.
Run it before believing a change is safe: `node scripts/check.mjs consumer`.

## 6. Verification doctrine

The repository's habit, and the reason its records are trustworthy: **measure, then state; falsify with a
control; never let an instrument disagree with the browser.**

- **Anchor a value to a browser, not to arithmetic.** A model of `transform-origin` was calibrated against
  `getBoundingClientRect` before any origin claim was made.
- **Give every claim a control.** The origin work kept `hinge-drop` as the effect that declared its origin in
  every stop, so the drift in the others was visible as a difference. In the channelling work, a comma
  separator was tested against a pipe separator and an out-of-range offset, which showed the two mistakes
  behave nothing alike.
- **Prefer pixels to strings.** Computed `clip-path` serialises in px, so coverage is measured by rendering,
  not by comparing authored strings.
- **Validate with `--max-old-space-size` when memory is the claim.** A build that only fits in a generous
  heap is a build that will crash someone.
- **Write instruments as throwaway scripts** in `scripts/tmp-*.mjs` (gitignored) that print a verdict table
  and exit non-zero on failure. Several of them are worth copying: `tmp-corrections-check.mjs` for
  before/after browser records, `tmp-changelog-proof.mjs` for a contract proven in an isolated clone, and
  `tmp-published-proof.mjs` for consuming the published artifact from the registry.
- **Run instruments against the artifact, not the tree, when the claim is about the artifact.**
  `pnpm pack` is the wrong packer for `pnpm publish`, which is one reason the release now uses `npm`.

Browser instruments: Chromium and Firefox are installed and reliable. The pinned WebKit build has
segfaulted on this host, so a probe that needs three engines must skip WebKit loudly and record that it did
rather than pass quietly.

## 7. Phrases, the feature to protect

A phrase is a keyframe in a class name: `animate-<property>-[<offset>:<value>|<offset>:<value>]`. An offset
you leave out takes the property's resting value, so a phrase holds still until its first frame and closes
itself at the end, which is what makes it safe under `infinite`. Writing a phrase gives the class its own
keyframe rule, named after the phrase, so two elements running it share one rule and a different phrase gets
its own.

- The separator is a **pipe**. It used to be a comma, and `docs/src/pages/docs/controls.md` taught the old
  form for a while. Measured: `animate-opacity-[0:0|100:1]` builds two frames, while
  `animate-opacity-[0:0,100:1]` builds **one** and warns about nothing, because a comma is a legitimate
  value character such as in `translate(1px, 2px)`. An out-of-range offset, by contrast, is refused with a
  warning. Do not describe the two mistakes as equivalent.
- Name a phrase with `/name` when you want to address it as a slot, and the controls follow:
  `animate-clip-path-[...]/reveal` with `animation-duration-[900ms]/reveal`.
- A phrase owns its property on the element. Write one phrase per property per element rather than layering
  several.

## 8. Documentation rules

- **No em-dashes.** Use a colon where the dash would introduce an explanation, a comma where it would
  continue a clause, and parentheses where a pair of them would hold an aside. Two dash characters survive
  deliberately: a placeholder glyph in `docs/src/studio/app.ts`, and the quoted heading text in
  CONTRIBUTING's first-release bullet.
- `README.md` is the npm page and is checked like a guide page. Its lede states the effect count and the
  phrase route, so both must stay true.
- Page titles use a pipe to separate the page from the site name.
- The guides hand-wrap prose near 100 columns. Match the surrounding width rather than reflowing paragraphs.

## 9. Release

The next release is `0.1.1`. The flow, and the reasons for its shape:

```bash
pnpm check
pnpm run docs:build
pnpm version 0.1.1 --no-git-tag-version
pnpm run changelog -- --preview     # read it before writing it
pnpm run changelog                  # writes above the first heading
git add -A && git commit -m "chore(release): v0.1.1"
git tag v0.1.1
npm publish
```

- **Publish with `npm`, not `pnpm`.** Measured on 0.1.0: `pnpm publish` uploads pnpm's own tarball (402,611
  bytes) and rewrites the manifest, dropping `scripts.prepublishOnly` and `packageManager`, while
  `npm publish` uploads the artifact this repository verifies against (398,114 bytes for 0.1.0, shasum
  `401bca972ccfe7a27cd14887b7c5da081f9c0997`).
- **The changelog generator reads tags as boundaries.** With no tag it refuses and changes nothing. It writes
  above the first `## ` heading, below the preamble, and refuses again if that version's heading already
  exists.
- **The accepted prefixes are measured from this repository**, not from the Conventional Commits
  specification: `feat`, `fix`, `perf`, `refactor`, `research`, `docs`, `test`, `build`, `style`, `chore`.
  Breaking changes come from `!` or a `BREAKING CHANGE:` footer, and the footer's text is quoted. A subject
  that matches no prefix is **not dropped**: it is listed verbatim under `Other changes`. Free-form prose
  subjects are fine, and the section will say so.
- **The tarball must stay deterministic and small.** 28 files, a 600,000-byte ceiling enforced by the
  `consumer` stage, and no `sourcesContent` in any published map. Verify with `npm pack` twice.

## 10. Traps that have cost time here

- **A tool that builds per CSS entry can be taken down by our own emission.** The stories entry emits 49 MB
  of CSS at 379 MB peak, against 4 KB to 185 KB and about 136 MB for every other entry, because each staged
  rule carries the eight-part `--jumi-<property>-animation-<part>` fallback chain and that chain lengthens
  with every property family. `.vscode/settings.json` declares the IntelliSense projects explicitly and
  leaves the stories entry out for this reason.
- **Staging is about 96% of an emission.** A raw build of the examples corpus is 1,851,446 bytes, of which
  1,783,984 is the staging protocol that the finalizer consumes. Anything measuring "the CSS" should
  measure the finalized output.
- **A scratch script's `run('npm', args)` must pass `{ cwd }`.** Without it, npm runs in the repository root,
  walks the pnpm tree and dies with `Cannot read properties of null (reading 'matches')`. It crashed before
  writing anything, but the only record of where it ran was npm's own debug log.
- **A stray inline `animation-iteration-count` corrupts every later seek in the same page.** Reset inline
  animation state between cases.
- **`os.tmpdir()` on macOS is `/var/folders/...`, not `/tmp`.**
- **A sentence that claims the current state decays.** The changelog once said "nothing has shipped yet",
  which the first publish would have made false. Prefer statements about structure, and leave state to the
  place that is updated when state changes.
- **The documentation arm reads fenced `html blocks.** A class written in a `css or ```diff block is
  invisible to it, and a `class="..."` attribute outside a recognised block is reported as a skipped page.

## 11. Where things live

| Path                                              | What it holds                                          |
| ------------------------------------------------- | ------------------------------------------------------ |
| `src/keyframes/effects.ts`                        | the 235 keyframe timelines                             |
| `src/properties/**`                               | property utilities, controls, phrases, transitions     |
| `src/variables/**`                                | the `--jumi-*` protocol each utility writes            |
| `src/types/index.ts`                              | the `Effect` and property unions                       |
| `src/view-transition.ts`                          | `createViewTransition`, the only public runtime export |
| `scripts/check.mjs`                               | the gate                                               |
| `scripts/css-snapshot/`                           | the recorded corpus and its byte snapshot              |
| `scripts/llms.mjs`                                | renders `llms.txt` and `llms-full.txt` from the guides |
| `docs/src/pages/docs/`                            | the eleven guide pages                                 |
| `docs/src/data/`                                  | generated effect and version data                      |
| `docs/public/`                                    | served verbatim at the site root                       |
| `engineering/reviews/`                            | the measurement records behind past decisions          |
| `engineering/decisions/CTO.md`                    | rulings, with their reasoning kept verbatim            |
| `.github/instructions/philosophy.instructions.md` | the naming and organisation rules for new utilities    |

## 12. Open items

- The phrase route and the phrase separator were documented wrongly until 2026-09-23; the guides now say
  pipes, and the README leads with the feature.
- `zoom-out-elastic`'s envelope, the alias groups, distance-unit normalization, `slide-out`'s visibility
  wording and the naming asymmetries are recorded as deliberate non-decisions in the keyframe audit.
- The internal prose in `src/`, `scripts/` and `engineering/` still uses em-dashes, about 4,900 lines of it,
  and has not been swept.
- `homepage` and `bugs` are absent from `package.json`, and `./package.json` is not an exported subpath.
