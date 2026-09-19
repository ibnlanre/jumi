# Contributing to Jumi

Thank you for your interest in contributing to Jumi! This guide will help you understand our design philosophy and contribution process.

---

## Design Philosophy

Jumi follows clear principles that ensure consistency, clarity, and excellent developer experience. Understanding these principles is essential before contributing.

### 1. CSS Property Fidelity

**Class names mirror their CSS property names as closely as possible.**

```html
✅ Good
<div class="animate-background-color-blue-500">
  <!-- background-color -->
  <div class="animate-border-radius-full">
    <!-- border-radius -->
    <div class="animate-backdrop-filter-blur-md">
      <!-- backdrop-filter -->

      ❌ Avoid
      <div class="animate-bg-blue-500">
        <!-- abbreviated -->
        <div class="animate-radius-full">
          <!-- loses context -->
          <div class="animate-blur-md"><!-- ambiguous property --></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Why?** Developers can immediately understand which CSS property is being animated without guessing or memorizing abbreviations.

---

### 2. Minimal Abbreviations

Only use abbreviations that are universally understood or part of CSS conventions.

**Acceptable:**

- `x`, `y`, `z` for spatial axes (`translate-x`, `rotate-z`)
- Standard CSS shorthand (`margin`, `padding`)

**Not acceptable:**

- `bg` for `background-color`
- `bd` for `border`
- `pos` for `position`

**Why?** Full names reduce cognitive load and make the codebase accessible to developers at all experience levels.

---

### 3. Hierarchical Naming

Maintain property relationships in class names.

```html
✅ Good animate-backdrop-filter-drop-shadow-blur-md
animate-backdrop-filter-drop-shadow-color-blue-500 animate-border-image-outset-4
animate-mask-border-width-2 ❌ Avoid animate-drop-shadow-blur-md
<!-- loses parent context -->
animate-border-outset-4
<!-- ambiguous -->
```

**Why?** Hierarchical naming preserves the relationship between parent and child properties, making the API predictable.

---

### 4. Semantic Clarity Over Brevity

Prioritize clear, readable class names over shorter alternatives.

```html
✅ Preferred
<div class="animate-backdrop-filter-drop-shadow-offset-x-4">
  ❌ Avoid
  <div class="animate-bd-drop-x-4"></div>
</div>
```

**Why?** Self-documenting code is maintainable code. A few extra characters are worth the clarity.

---

### 5. Use Tailwind v4 Relationship Variants

Relationship matching is Tailwind's grammar. Use its variants — including the arbitrary form when a
named one does not exist — instead of registering a variant of your own.

```html
✅ Good - Tailwind's variants
<h1 class="animate-fade-in [&:is(h1)]:animate-fade-in">
  <nav class="has-[>button]:animate-scale-110">
    <section class="[&:where(.card)]:animate-slide-in-up">
      ❌ Avoid - Custom natural language variants
      <div class="child-h1:animate-fade-in">
        <nav class="has-button:animate-scale-110"></nav>
      </div>
    </section>
  </nav>
</h1>
```

**Why?** Tailwind owns the selector grammar and keeps evolving it. Jumi registering `is-*`,
`where-*` or `has-*` would claim part of that vocabulary — see principle 9 for why that is worse
than it looks, and what the `has-*` incident cost.

---

### 6. The Composition Is Synthesized, Not Declared

An element animates because it carries a motion utility. Nothing opts it in a second time, and no
rule of Jumi's is written by hand.

```html
✅ Good — the utilities are the whole interface
<div class="animate-rotate-45 animate-scale-110">
  ❌ Avoid — a hand-written list is a copy that goes stale
  <div
    class="animate-rotate-45"
    style="animation-name: rot, scale"
  ></div>
</div>
```

**Why?** Every animation on an element competes for the same declarations, and those are _lists_
(`animation-name`, `animation-duration`, and the rest) the browser resolves by position. A utility can
own its own value; it cannot own the list, because Tailwind compiles each candidate without knowing
what else the element carries — and caches that utility's output per candidate, so a list written
inside one is reused stale the moment another slot appears. So the integration derives the list from
the finished stylesheet, for every selector that proves it animates.

This used to be a class the author wrote — `animations`, and `transitions` for the other carrier.
Those are gone, replaced by an inference over emitted CSS, and what survives them is the reason they
existed. The guardrails below are the ones that outlived the class.

`@apply` works: `@apply animate-rotate-45` is an activation like any other, because the finalizer
reads it out of the finished stylesheet. A rule that names a selector cannot reach every prefixed
form, which is why nothing tries.

Guardrails, each of which cost a shipped bug to learn:

- **The defaults resolve on the element.** Their entries reference the slot variables the `animate-*`
  utilities declare _on the element_, and a `var()` chain inside a custom property resolves where it
  is declared. Published on `:root` instead, every animating element silently resolves
  `animation-name: none`, and the stagger system stops — `--jumi-animation-delay` reads a variable
  only the element sets.
- **The finalizer needs the finished stylesheet.** For Vite that is a transform with no `enforce`; for
  PostCSS it is `OnceExit`. Both were measured against the alternatives.
- **Slot activation names are registered `inherits: false`; controls are not.** An activation is
  state — inherited into an animating descendant it makes that descendant run its ancestor's
  animation. A control is configuration, and inheriting from a wrapper is the point of it.

Before publishing the composition anywhere else: which element will resolve that declaration? Before
moving a registration: is this state or configuration? The reasoning and measurements are in
`engineering/architecture/carrier-locality.md`.

### 7. One Integration Step, Or A Deletion Path

**Jumi must converge toward one integration step. Any temporary second setup requirement needs a
deletion path.**

An integration that teaches someone plugin ordering has exported Jumi's complexity to the person with
no way to fix it. So `jumi()` composes Tailwind's plugin rather than sitting beside it
(`plugins: [jumi()]`), and registers itself in the Tailwind entry stylesheet, so there is no `@plugin`
directive to write. The remaining step — finishing the stylesheet after Tailwind — has a deletion
path; see `engineering/roadmap/migration.md`. **A new required step is a regression unless it ships
with the plan to remove it.**

Registration is `jumi()`'s job, and the injection rules are not negotiable: only a stylesheet that
imports Tailwind is a compilation root, and a file that already registers Jumi — by specifier, or by
any path whose name mentions Jumi — is left alone. Registering twice emits every `@keyframes` twice.

### 8. Theme Mappings Are Measured, Not Inferred

**A theme mapping is verified against emitted CSS, never deduced from a name that looks right.**

- **A token existing is not a contract.** `--shadow-*` exists and is spelled like `--drop-shadow-*`,
  but `shadow-sm` inlines its value while `drop-shadow-sm` references its token.
- **A key _name_ can be the contract.** For a spacing-derived scale the numeric name _is_ the
  multiple; `--spacing` is only its representation, and the host's JS scale cannot be trusted for it.
- **A scale can mix modes, so resolution is per value.** `leading-6` is `calc(var(--spacing) * 6)`,
  `leading-tight` is `var(--leading-tight)`, `leading-none` is a literal — out of one key.
- **A name with no verified token or formula stays literal.** Inventing a mapping creates a second
  theme source inside Jumi.

`pnpm theme:map` re-derives every claim in `src/helpers/create/theme.ts` from the utilities Tailwind
emits, runs in `pnpm check`, and fails on drift or on a candidate it could not measure.
`pnpm behaviour:check` proves the reference form in a browser. The batches that got here are in
`engineering/roadmap/migration.md`.

### 9. Do Not Occupy Host Vocabulary

**A Jumi plugin should not claim generic Tailwind vocabulary merely because the host does not
implement it yet.** The test before adding anything to the plugin API:

> If Tailwind introduced something with this exact name tomorrow, would Jumi be happy to delete its
> implementation with no user-visible change?

If not, do not add it, or put it under explicitly Jumi-owned vocabulary:

```text
generic CSS / utility-language semantics   Tailwind owns the namespace
motion semantics unique to Jumi            Jumi owns the namespace
```

Claiming a namespace leaves only bad options later: override the host forever, break users by
removing it, version-detect, or emulate. Jumi registers no variants today; relationship matching uses
the host's forms, including the arbitrary one (`[&:is(h1)]:animate-fade-in`). What Jumi owns is
motion: `animations`, `transitions`, `animate-*`, phrases, effects, composition. The two variants
this cost are recorded in `engineering/roadmap/migration.md`.

### 10. Documents State Rules; Records Keep History

**Publish documents, not notes.** `README.md` is read on npm, and `docs/` is the public site: they
state what Jumi is and how to use it. Measurements, incidents, rejected options, dates and hashes are
records, and records live in `engineering/`.

| Location                       | Holds                                                               |
| ------------------------------ | ------------------------------------------------------------------- |
| `docs/`                        | the Astro site only — `src/pages`, layouts, styles, data, `public/` |
| `engineering/architecture`     | how the machine works, and why it is shaped this way                |
| `engineering/research`         | investigations, measurements, and their conclusions                 |
| `engineering/roadmap`          | what is planned, in what order, and what was closed                 |
| `README.md`, `CONTRIBUTING.md` | what Jumi is, and the rules for changing it                         |

None of it is private; the split is _intended audience_. See `engineering/README.md`.

---

## Animation Conventions

### Effect Animations

Effect names use descriptive, hyphenated words following the pattern: `{type}-{direction}-{origin}`

```html
✅ Good bounce-in, bounce-out
<!-- Clear direction: -in vs -out -->
slide-in-left, slide-out-right
<!-- Type + direction + axis -->
fade-in, fade-out
<!-- Simple directional -->
arc-top-left, arc-bottom-right
<!-- Hierarchical origin points -->
zoom-in, zoom-out
<!-- Descriptive type -->
skew-left, skew-right-up
<!-- Compound directions -->
wipe-in-center, wipe-out-left
<!-- Advanced: type-direction-origin -->
iris-in-center, iris-out-top-right
<!-- Full pattern -->
barn-door-in-center, curtain-out-left
<!-- Multi-word types (hyphenated) -->

❌ Avoid bounceIn
<!-- camelCase -->
slideLeft
<!-- missing -in/-out direction -->
wipeC
<!-- abbreviated origin -->
fade
<!-- missing direction -->
arcTL
<!-- abbreviated -->
bd-in-c
<!-- multiple abbreviations -->
```

**Why this pattern?**

- Descriptive names (wipe, iris, box, barn-door) convey intent immediately
- Consistent direction indicators (-in/-out) make behavior predictable
- Hierarchical origins (-center, -top-left) provide precision when needed
- No abbreviations ensures accessibility for all skill levels

### Property Animations

Follow the pattern: `animate-{css-property}-{value}`

```html
<div class="animate-opacity-50">
  <!-- opacity: 0.5 -->
  <div class="animate-width-full">
    <!-- width: 100% -->
    <div class="animate-background-color-red-500">
      <!-- background-color: red -->
    </div>
  </div>
</div>
```

---

## Project Structure

```
src/
├── composition/         # Compound properties assembled from parts (filter, transform, …)
├── core/                # The model: parsing, aggregation, finalization
├── helpers/             # Adapters to Tailwind's plugin API (register, create, carriers)
├── keyframes/
│   ├── effects.ts       # Named animations (bounce-in, slide-out, etc.)
│   └── property.ts      # Property-based keyframes
├── properties/
│   ├── controls.ts      # Timing, repetition, direction, playback
│   └── tween.ts         # Property utilities (animate-rotate, animate-width, …)
├── theme/               # Theme value definitions
├── types/               # TypeScript types
├── variables/           # CSS custom property definitions
├── index.ts             # The plugin entry
├── postcss.ts           # PostCSS entry
└── vite.ts              # Vite entry
```

---

## How to Contribute

### Adding a New CSS Property

1. **Verify the CSS property name** on [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS)
2. **Add it to `src/properties/tween.ts`** in alphabetical order
3. **Use the established pattern:**

```typescript
'animate-gap': {
  fn: property('gap'),
  type: ['length', 'percentage', 'any'],
  values: theme('gap'),
},
```

`fn` builds the declarations, `type` is what Tailwind accepts for a bare value, and `values` is the
scale the named values come from. `property()`, `token()` and `color()` are the three creators;
`supportsNegativeValues: true` opts the utility into the negative form (`-animate-gap-4`).

4. **Support Tailwind theme tokens** when applicable (colors, spacing, etc.)
5. **Test with arbitrary values:** `animate-scroll-margin-top-[24px]`

---

### Adding a New Effect Animation

1. **Choose a descriptive, hyphenated name**
2. **Add to `keyframes/effects.ts`**
3. **Follow the keyframe pattern:**

```typescript
'bounce-in': {
  '0%': {
    opacity: '0',
    transform: 'scale(0.3) translateY(-100px)',
  },
  '50%': {
    opacity: '1',
    transform: 'scale(1.05) translateY(10px)',
  },
  '100%': {
    opacity: '1',
    transform: 'scale(1) translateY(0)',
  },
},
```

4. **Consider accessibility:** Test with `prefers-reduced-motion`
5. **Document motion type:** Spring physics, linear, parabolic arc, etc.

---

### Code Standards

- **Alphabetical ordering:** Keep properties sorted
- **2-space indentation**
- **TypeScript strict mode:** All contributions must pass strict type checking
- **JSDoc comments:** Add for complex functions
- **Consistent formatting:** Follow existing patterns

---

### Before Submitting

Run the gate. It is the whole contract, and it is cheap:

```bash
pnpm check        # tsc, eslint, unit tests, and every check below
```

Individually, when you are iterating on one of them:

```bash
pnpm exec tsc --noEmit      # types
pnpm exec eslint src scripts
pnpm vitest run             # unit tests, including the finalizer and the shared CSS helper
pnpm theme:map              # the theme maps still resolve
pnpm css:check              # the byte snapshot, over two frozen corpora
pnpm incremental:check      # incremental builds stay correct and local
pnpm behaviour:check        # a real browser resolves a real carrier
pnpm vite:check             # the shipped Vite integration, in dev and in every build shape
pnpm postcss:check          # the shipped PostCSS integration, in every configuration
pnpm phrase:check           # the phrase route: two handlers, one prefix, one documented domain
pnpm consumer:check         # the packed artifact: installed isolated, declarations checked, entries constructed
pnpm legacy:check           # no carrier class in a shipped surface
pnpm stories:check          # every effect the Storybook names is one Jumi ships
```

`pnpm check` runs all eighteen stages in that order and **names every one in its summary**, with the
stages it did not reach marked `not run` rather than left out. The sequence still stops at the first
failure — later checks against a half-built `dist` would be a different gate, not a clearer one — but
a failure can no longer read as "everything after it passed". That misreading cost a real bug: a
composition fingerprint in `incremental:check` stayed stale across a whole representation change
because the chain stopped at `test:run` and every stage below it was simply absent from the output.

**When you change the composition, price it through the protocol as well.** Nothing in the
gate above can see the cost that made Inspector unusable at 228 slots: every check in it
reads emitted text, or the renderer, and the freeze was in neither. See "Tooling" under
Quality Standards.

**`behaviour:check` is not optional, and it is not a duplicate of the others.** Every
harness above reads emitted _text_: the snapshot compares bytes, the structural metrics
count declarations, the incremental harness watches a list grow. A page can pass all of
them while a browser does nothing — that has happened twice here. It happened most
recently with the aggregate published on `:root`, where the CSS looked plausible, the
snapshot was green, 123 unit tests passed, and every carrier resolved
`animation-name: none`, because a `var()` chain inside a custom property resolves where
it is _declared_ and the slot variables are element-local. `behaviour:check` compiles
the canonical corpus, loads it in Chromium, and asserts the resolved `animation-name` of
real carriers. If you change where data is declared, or how an element reads it, this is
the check that knows.

- [ ] Read and understand the design philosophy
- [ ] Verify CSS property names on MDN
- [ ] Check for similar existing implementations
- [ ] Add utilities in alphabetical order
- [ ] Test with arbitrary values
- [ ] Ensure TypeScript types are correct
- [ ] `pnpm check` passes
- [ ] If you changed the composition, `pnpm spike:cdp-cost` was run and the response did not regress
- [ ] Include examples in your PR description

---

## Releasing

The version decision is **explicit**. Commit prefixes generate the mechanical record, but they do not decide how
big a release is — a `fix:` can be the most important change in a release, and an architectural judgement is not
something a prefix should be trusted to make.

```bash
pnpm check                                    # the gate, all eighteen stages
pnpm run docs:build                           # the only path that builds every page
pnpm version 0.1.0 --no-git-tag-version       # or release:minor, when that is the decided size
pnpm run changelog                            # prepends the release, stamped with that version
git add -A && git commit -m "chore(release): v0.1.0"
git tag v0.1.0
pnpm publish
```

Four things about that flow are load-bearing:

- **The bump comes before the changelog.** The generator stamps the release header from `package.json`, so
  running it first labels the release with the _previous_ version.
- **The first release writes its own notes.** `pnpm run changelog` prepends above a tag boundary and
  refuses when none exists — "no tag to start from" — so there is nothing for it to generate _from_ until
  a release has been tagged. For the first release the curated section in `CHANGELOG.md` **is** the
  release's notes; generation starts with the release after it.
- **`release:*` does not commit or tag.** It runs `pnpm version <bump> --no-git-tag-version`, which edits
  `package.json` and stops — so the release is one commit and one tag, not two of each.
- **The boundary is a tag.** Everything written in `CHANGELOG.md` before the first tag is curated by hand and is
  left exactly as written; generation prepends above it. With no tag at all the generator would rewrite the
  entire history, so `pnpm run changelog` refuses to run until one exists.
- **Never run the generator with `-r 0`.** That mode overwrites the file instead of prepending to it — it is how
  the hand-written 1.0.0 notes were destroyed once. To _inspect_ output, use the CLI directly with `--stdout`.

## Quality Standards

### Performance

- Consider bundle size impact
- Prefer GPU-accelerated transforms
- Use CSS custom properties efficiently

### Accessibility

- Respect `prefers-reduced-motion`
- Test with screen readers when relevant
- Provide reduced-motion alternatives for complex animations

### Browser Support

- Target modern browsers (Chrome 88+, Firefox 89+, Safari 14+)
- Test cross-browser before submitting

### Tooling

A developer-facing CSS library is only as usable as the tools developers read it with. Jumi's
composition is synthesized into every activating rule, so the amount an inspector has to fetch and
render scales with the number of slots — and that cost is invisible to every check in the gate.

- **DevTools inspectability is a release criterion.** Opening the effects catalogue and selecting an
  animated element must not stall Inspector. This was missed once already: the page was smooth, the
  snapshot was green, `behaviour:check` passed, and selecting an element in the Elements panel took
  over 20 seconds.
- **Measure the protocol, not the file.** At 228 slots the stylesheet and the response differ by a
  factor of five — 178 KB of composition-rule text becomes 863 KB of
  `CSS.getMatchedStylesForNode` payload, because the declaration body crosses the wire three times
  (as each property's `value`, its `text`, and the rule's `cssText`). A 3% change in stylesheet
  bytes corresponded to a 61% change in response bytes, so sheet size is not a usable proxy.
- **Price a representation change on both workloads.** A change to the composition is a recalc
  question _and_ a tooling question, and they do not move together unless the shape is right.

```bash
pnpm spike:cdp-cost     # the protocol: bytes and latency per slot count, plus the A/B variants
pnpm spike:recalc       # the renderer: recalc over slot counts × animated element counts
pnpm spike:local-list   # why an element-local vector is not expressible in CSS
```

These are measurements, not gates — they are too slow for `pnpm check`. The reasoning and the
numbers are in `engineering/research/style-cost.md`.

### Documentation

- Clear examples for new features
- Update README if adding major functionality
- Explain the "why" in PR descriptions

---

## Examples of Good Contributions

### ✅ Adding backdrop-filter-hue-rotate

```typescript
// src/properties/tween.ts (alphabetically placed)
'animate-backdrop-filter-hue-rotate': {
  fn: property('backdrop-filter', [['backdrop-filter-hue-rotate', value => css('hue-rotate', value)]]),
  type: 'angle',
  values: theme('backdropHueRotate'),
},
```

**Why this is good:**

- Exact CSS property name
- Maintains hierarchical relationship with `backdrop-filter`
- Supports arbitrary values: `animate-backdrop-filter-hue-rotate-[45deg]`

### ✅ Adding elastic-bounce effect

```typescript
// src/keyframes/effects.ts
'elastic-bounce': {
  '@keyframes jumi-elastic-bounce': {
    '0%': {
      transform: 'scale(0) translateY(100%)',
      opacity: '0',
    },
    '60%': {
      transform: 'scale(1.1) translateY(-10%)',
      opacity: '1',
    },
    '80%': {
      transform: 'scale(0.95) translateY(5%)',
    },
    '100%': {
      transform: 'scale(1) translateY(0)',
      opacity: '1',
    },
  },
},
```

**Why this is good:**

- Descriptive hyphenated name
- Natural motion curve with overshoot
- Includes opacity for entrance effect

---

## Getting Help

- **Questions?** Open an [issue](https://github.com/ibnlanre/jumi/issues)
- **Found a bug?** Create an [issue](https://github.com/ibnlanre/jumi/issues) with a minimal reproduction
- **Feature request?** Propose it in an issue first before implementing

---

## Need Clarification?

If you're unsure about:

- Whether to abbreviate a name → Don't abbreviate
- How to name a new property → Use the exact CSS property name
- Whether to create a custom variant → Use Tailwind's `:is()`, `:has()`, `:where()`

When in doubt, ask! We're here to help.

---

## Verifying a change

Two habits, both learned by getting them wrong on 2026-09-15.

**Never pipe the gate into a filter when its exit code decides what happens next.**

```sh
node scripts/check.mjs | tail -4 && git commit ...     # the commit runs on a red gate
node scripts/check.mjs > /tmp/gate.log 2>&1; echo "exit: $?"; tail -4 /tmp/gate.log
```

`scripts/check.mjs` exits 1 when a stage fails, but a pipeline's status is the **last** command's — so
`| tail` reports success whatever the gate did, and the last four lines still look green because a failing
stage prints its detail above them. Measured: a formatting sweep was committed on top of a failing `css`
stage while the summary read `✗ css failed` the whole time.

**Generated files are not source, and formatting them breaks the checks that compare them byte for byte.**

`scripts/css-snapshot/snapshot.css` is what the toolchain emits; `pnpm css:check` recompiles the corpora and
compares against it. A repo-wide `prettier --write` reformatted it and the stage failed on `@supports`
wrapping and on `color: rgb(...)` becoming `color:rgb(...)`. Both recorded artifacts are in
`.prettierignore`; the rest of the generated output is already in `.gitignore`, which Prettier honours.

## Formatting

One formatter per language, and one configuration for all of them — `prettier.config.mjs`:

| language                                                    | formatter                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| `ts`, `tsx`, `js`, `mjs`, `cjs`                             | ESLint, which runs Prettier through `eslint-plugin-prettier` |
| `json`, `jsonc`, `css`, `html`, `markdown`, `yaml`, `astro` | Prettier — ESLint ignores these or cannot parse them         |

The point is that a save in the editor and `pnpm lint` are the same operation. `pnpm lint` is `eslint --fix .`,
and the editor routes the second row to Prettier directly, with the built-in formatters for those languages
turned off — so a file the default formatter declines cannot silently fall through to a different one.

```sh
npx eslint src scripts docs/src docs/astro.config.ts   # 0 warnings
npx prettier --check .                                 # clean
node scripts/check.mjs                                 # 17/17
```

---

**Thank you for helping make web animations more accessible and delightful!**
