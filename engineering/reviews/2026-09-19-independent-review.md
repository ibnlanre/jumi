# Independent review of Jumi

Reviewed HEAD: `f66efb9` (2026-09-19). Production code was not changed. The website implementation from the earlier conversation was not continued.

## A. Executive assessment

The architecture is coherent enough to retain for 1.0, but I would not release the current advertised surface unchanged. Definition identity versus instance identity, typed execution versus public authoring, and static composition versus animation ownership are useful separations with real implementation behind them. The review does not justify another architectural redesign.

Confidence is withheld in three specific places: exact structural addressing for segment timing, Studio's preservation of authored timing when pruning defaults, and CommonJS integration declaration consumption. Two evidence mechanisms also overstate what they prove: the isolated-consumer fixture and the D.3 `equivalent-no-op` classifier.

The current full gate passed **18/18 stages**, including **506 unit tests** and **72 Studio browser checks**. This review additionally compiled targeted candidates, executed isolated browser probes, checked the installed tarball's declarations with declaration checking enabled, and inspected actual compiled declarations. The defects below survived that green gate.

These are targeted findings, not a claim of exhaustive browser/version coverage. Runtime probes used Chromium; the package checks used the repository's installed dependency versions and Node 22.19.0. No claim is made that every supported Node/Vite/Tailwind version was tested.

## B. Findings, ordered by release impact

### 1. P2 — Segment timing uses prefix matching instead of exact property addressing

**Classification:** confirmed behavioral defect. **Subsystem:** finalizer / segment phrases.

`src/helpers/carriers/index.ts:741–744` accepts a structural address when the definition begins with `jumi-${address}-`. A property name can itself contain hyphens. Consequently `/padding` reaches `padding-left`, and `/color` reaches `color-scheme`.

Browser reproduction, both paused at 500ms:

```html
<div class="animate-padding-left-[0:0px|100:100px]/sideways animation-timing-function-linear"></div>
<div class="animate-padding-left-[0:0px|100:100px]/sideways animation-timing-function-linear animation-timing-function-[0:ease-in]/padding"></div>
```

The first reads `padding-left: 50px`; the second reads `31.5357px` and selects a segment-specialized definition. The `/padding` control has changed a different structural property's animation. Scalar `/property` addressing does not have this prefix meaning.

**Why it matters:** segment timing and scalar timing disagree about which property an address identifies. This is observable cross-property contamination, not an intentional compound-phrase boundary.

**Smallest response:** resolve the exact attribute identity at this boundary rather than matching an arbitrary definition-name prefix. Add collision pairs such as `padding` / `padding-left` and `color` / `color-scheme` to addressing tests, including candidate-order reversal.

### 2. P2 — Studio removes a control whose fallback is changed by another authored track

**Classification:** confirmed behavioral defect. **Subsystem:** Studio serializer / author intent.

`docs/src/studio/app.ts:376–379` automatically names an initial opacity track `opacity`, then a second `opacity-2`. `/opacity` is a structural property address, not an isolated arbitrary name. Meanwhile `docs/src/studio/model.ts:78–89` checks source CSS/attributes for control overrides but omits controls authored by the project's own tracks when deciding whether defaults can be removed.

Using the actual model, create the same opacity phrase twice on one element:

- track `opacity`: duration 2000ms;
- track `opacity-2`: duration 1000ms;
- other controls equal Jumi defaults; no source CSS or source classes.

`candidates(project)` produces:

```text
animate-opacity-[0:0|100:1]/opacity
animate-opacity-[0:0|100:1]/opacity-2
animation-duration-[2000ms]/opacity
```

Independent compilation and browser inspection report **2000ms for both animations**, rather than 2000ms and 1000ms. The omitted named default lets the second motion read the first track's structural duration.

**Why it matters:** the editor's intended timing is lost. Editor/export parity can remain green because both previews consume the same incorrect serialization. Parity is necessary but is not an independent assertion of author intent.

**Smallest response:** generate genuinely local motion names by default and account for authored property-scope controls before pruning defaults. If structural names remain editable, preserve explicit controls whenever omission changes their fallback. Test the browser duration against each authored track, not only against the exported page.

### 3. P2 — The CommonJS PostCSS declaration cannot be consumed with declaration checking enabled

**Classification:** confirmed package-consumer failure. **Subsystem:** published declarations.

`src/postcss.ts:1` imports `PluginOptions` from `@tailwindcss/postcss`; the emitted `postcss.d.cts` retains it. With the installed Tailwind PostCSS 4.3.3, its CommonJS declaration does not export that named type.

Reproduction against the gate's installed tarball:

```sh
node_modules/.bin/tsc -p scripts/tmp-consumer --skipLibCheck false --pretty false
```

Result:

```text
postcss.d.cts(1,10): TS2305: Module '"@tailwindcss/postcss"' has no exported member 'PluginOptions'.
```

The failure remains under `nodenext`. The installed declarations match current `dist` byte-for-byte.

**Why it matters:** correcting the export map to select `.d.cts` did not make that declaration's dependency imports valid. `scripts/consumer-check.mjs:207` hides the failure with `skipLibCheck: true`.

**Smallest response:** publish a CommonJS-compatible type surface for these options, then check the installed declarations without skipping them.

### 4. P2 — The CommonJS Vite declaration imports ESM-only declaration entry points

**Classification:** confirmed package-consumer failure. **Subsystem:** published declarations / compatibility.

`src/vite.ts:1–2` produces `vite.d.cts` imports from `@tailwindcss/vite` and `vite`. The same consumer command reports two **TS1479** errors under `node16`, because those imports resolve to ESM modules from a CommonJS declaration.

Under `nodenext` those two errors disappear, which is exactly why the two consumer modes should remain distinct. They are not equivalent evidence of compatibility.

**Why it matters:** the package advertises a require-side Vite entry, and the consumer gate explicitly claims to cover `node16`. Its current `skipLibCheck` setting leaves that claim untested at the dependency declaration boundary.

**Smallest response:** make the declaration imports compatible with the published condition, or explicitly narrow the supported surface. Retain separate `node16` and `nodenext` checks with declaration checking enabled.

### 5. P2 — The consumer fixture is not isolated from the repository's dependencies

**Classification:** test/harness weakness with concrete resolution evidence. **Subsystem:** release gate.

`scripts/consumer-check.mjs:55` puts the fixture at `scripts/tmp-consumer`. Clearing that directory does not prevent Node or TypeScript from walking up into the repository's `node_modules`.

A `createRequire` rooted in that fixture resolves absent optional peers `vite`, `@tailwindcss/vite`, and `@tailwindcss/postcss` from the repository's `.pnpm` tree. Thus the fixture can successfully type-check or resolve integrations using packages that its own install did not provide.

**Why it matters:** the tarball is genuinely installed and exercised, but the dependency environment is not genuinely external. This can hide missing dependencies and prevents the gate from establishing plugin-only versus integration-specific peer behavior.

**Smallest response:** install into a temporary directory outside the repository ancestry. Explicitly provision each integration's peers in its own arm; keep a plugin-only arm that cannot borrow the repository's dev dependencies.

### 6. P2 — D.3 can classify a missing animation as `equivalent-no-op`

**Classification:** test/harness weakness, not proof of a broken migration. **Subsystem:** authoring-route evidence.

`scripts/research/d3-authoring-routes.mjs:181–196` samples successfully even with zero animations. Its verdict at `308–315` accepts a flat shipped reading if the separate native equivalent is flat and the native control moves. It does not require a running execution path or equality between shipped and native readings.

Isolated falsification using the current compiled `animate-offset-position-x-edge-[right]`, with `#probe { animation: none !important }` appended:

| Arm | Animation count | Five readings |
| --- | --- | --- |
| Shipped, disabled | 0 | `normal` throughout |
| Native equivalent | 1 | `50% 50%` throughout |
| Native moving control | 1 | x progresses 0%, 25%, 50%, 75%, 100%; y stays 50% |

The emitted endpoint token remains present, and the current classifier accepts this as `equivalent-no-op`. The evidence guard at `src/variables/typed-leaves.test.ts:814` checks assignment names but does not reject this case.

**Why it matters:** the stated six-part verdict contract includes execution and native equivalence. Flatness alone proves neither. A future activation regression could receive a plausible successful verdict.

**Smallest response:** require a live expected animation and compare shipped readings against the native-equivalent observable, using an appropriate native-normalized comparison. Keep the moving control. Add this disabled-activation arm as a negative control.

### 7. P3 — Phrase offset validation accepts values outside the documented domain

**Classification:** validation/documentation mismatch. **Subsystem:** public phrase grammar.

`src/core/index.ts:2032–2048` checks finiteness but not the documented 0–100 domain (`engineering/architecture/phrases.md:15`). `animate-opacity-[0:0|150:1]/bad` emits a `150%` keyframe without warning.

**Why it matters:** malformed author input gets through Jumi's phrase route and is left to browser rejection, rather than honoring the documented validation boundary.

**Smallest response:** enforce the declared range consistently, with diagnostics and malformed-offset tests. This is not a missing animation primitive.

## C. Closed-track challenges

Reopen only these conclusions, with the new evidence above:

1. **Exact segment property addressing:** the prefix collision contradicts the scalar/segment address invariant.
2. **Studio semantic default omission:** an authored second duration changes after omission, even when replay parity holds.
3. **Release-surface completion:** require-side declarations still fail under normal declaration checking, and the external-consumer environment is not isolated.
4. **D.3 verdict enforcement:** the categories remain coherent, but a disabled execution arm can be certified as a successful no-op.

Do not reopen D.3 migration selection, the typed-leaf principle, instance/definition separation, or the sourcemap decision on this evidence.

## D. Release blockers

Before releasing the currently advertised 1.0 surface, correct the confirmed segment-addressing and integration-declaration failures. Resolve the Studio author-intent failure before claiming Studio faithfully authors that surface.

Repair consumer isolation and D.3 execution/equivalence assertions before relying on their green results as release evidence. These are evidence blockers; they do not independently prove that D.3's migrated production paths are incorrect.

The out-of-range phrase mismatch is lower severity and can be addressed separately; it does not justify a broad redesign.

## E. Reviewed decisions I would leave alone

- **Typed execution and authoring are distinct.** Private resolved positional leaves are marked execution-only; public edge/offset vocabulary remains the authoring surface. This is not accidental API leakage.
- **Candidate-local projection.** `src/core/index.ts:1678–1689` reads the candidate's own authored values and model rests, rather than borrowing sibling-candidate state. Different assignment contracts distinguish independent axes from coupled `offset-anchor` behavior.
- **D.3 disposition.** Current residual evidence reproduces 4 migrated, 8 safe-no-need, 3 coupled-native and 10 no-candidate, without an open migration. The harness finding does not convert all no-ops into failed migrations.
- **Untouched `offset-position`.** Exact PostCSS declaration inspection finds two declarations, both inside keyframes, and none outside. The feared unconditional override of `normal` is absent.
- **Multi-stop constituent boundary.** Retaining property/composed execution for phrases is a deliberate boundary, not unfinished scalar typed-leaf migration. Unsupported compound hooks should not be assigned invented interpolation semantics.
- **Definition versus instance identity.** Readable, length-delimited slot identities separate motion instances from shared definitions. Names are carried as model declarations/metadata rather than inferred from selector text.
- **Finalizer placement for segment specialization.** Resolving after candidate emission avoids an inherently order-sensitive model matcher. Selection on the control rule and non-inheriting named registration are sound; the demonstrated problem is structural matching, not this design.
- **Control semantics.** Timing records do not enter the scalar animation shorthand, and controls do not independently activate motion. The named-instance strategy does not need replacement.
- **Conditional declaration exports.** Separate `import.types` and `require.types` targets are correct and should remain. Their contents need repair; flattening the map would regress compatibility.
- **Optional integration peers.** Keeping Vite/PostCSS integration packages optional is defensible. No confirmed Node-engine defect was found in the tested package paths.
- **Sourcemap option B.** The installed artifact keeps mappings and resolves a thrown frame to `src/helpers/carriers/index.ts:1355:24` without embedded source. This supports the measured stack-trace benefit and the size saving. It does not establish that embedded source is universally useless to every debugger, but no new evidence warrants reversing the packaging choice.
- **Studio's exact-download loop.** The browser downloads the artifact, Node recompiles its classes with a fresh compiler, and a separate page samples it at eight times. That independence is real and worth preserving; add author-intent assertions rather than replace it.

## F. Recommended next actions

1. Repair consumer isolation and enable declaration checking; use that gate to fix the two published integration type failures.
2. Correct exact segment property matching and add prefix-collision browser cases.
3. Correct Studio naming/default pruning and assert intended browser timing independently of replay parity.
4. Tighten the D.3 no-op classifier with activation and native-equivalence negative controls.
5. Align phrase offset validation, then rerun the existing full gate plus these new cases.

No production fixes were made as part of this review.
