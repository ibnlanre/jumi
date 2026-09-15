# Addressing: a slot and a label are the same syntax

Measured 2026-09-15 with `pnpm spike:addressing` (needs a bundle first: the plugin is loaded from
`dist/`). Every number below is read out of a real browser — the resolved animation longhands and the
`--jumi-*` custom properties the element ends up with — not inferred from the class names.

## The question

The slash is documented for two readings:

- `animation-duration-[1s]/scale` addresses the **structural slot** of a property.
- `animate-rotate-45/spin` carries an **author label**, and `animation-duration-800/spin` addresses it.

A label whose name is another property's slot makes those collide:
`animate-scale-110 animate-rotate-45/scale animation-duration-1000/scale`.

## What the engine actually does

> **Superseded in part (2026-09-15).** This section describes the state the findings were measured in,
> where one token was one custom property and therefore had N readers. Finding 1 has since been ruled on
> and fixed: a token that is a property Jumi animates (or an effect) reads the property scope, and a name
> reads `--jumi-label-<name>-<part>`. The diagram below is kept as the record of what the collision _was_;
> the current rule is in the rulings section and in `addressing-instances.md`.

The two readings were not two mechanisms. `/name` always wrote one thing:

```css
.animation-duration-800\/spin {
  --jumi-spin-animation-duration: 800ms;
}
.animate-rotate-45\/spin {
  --jumi-rotate-3zWYd-label: spin;
}
```

and a motion's slot link reads a **name** — the property when unlabelled, the label when labelled:

```css
/* unlabelled: the scale slot reads the property's name */
--jumi-slot-scale-d38-animation-duration: var(
  --jumi-scale-animation-duration,
  …
);

/* labelled: the same chain, reading the label's name instead */
--jumi-slot-rotate-3zWYd-animation-duration: var(
  --jumi-spin-animation-duration
);
```

So a control reached **every motion that read that name**: all unlabelled motions for that property, and
all motions labelled with it. One namespace, one write, N readers — which is the whole of finding 1, and
why the fix separates the two readings rather than the syntax: a name now lives where a property cannot,
so `animation-duration-800/spin` writes `--jumi-label-spin-animation-duration`.

## The measured table

| case                                | classes                                                                                                                      | slots derived | resolved name                       | duration   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------- | ---------- |
| baseline                            | `animate-scale-110` `animation-duration-[1200ms]/scale`                                                                      | 1             | `jumi-scale-d38`                    | **1.2s**   |
| label                               | `animate-rotate-45/spin` `animation-duration-800/spin`                                                                       | 1             | `jumi-rotate-3zWYd`                 | **0.8s**   |
| compound                            | `animate-filter-blur-[4px]` `animate-filter-brightness-125` `animation-duration-900/filter`                                  | 1             | `jumi-filter`                       | **0.9s**   |
| **collision**                       | `animate-scale-110` `animate-rotate-45/scale` `animation-duration-1000/scale`                                                | 2             | `jumi-scale-d38, jumi-rotate-3zWYd` | **1s, 1s** |
| collision, self-labelled            | `animate-scale-110/scale` `animation-duration-1000/scale`                                                                    | 1             | `jumi-scale-d38`                    | **1s**     |
| two controls, one address           | `animate-scale-110` `animation-duration-1000/scale` `animation-duration-400/scale`                                           | 1             | `jumi-scale-d38`                    | **1s**     |
| compound + foreign label            | `animate-filter-blur-[4px]/foo` `animate-filter-brightness-125` `animation-duration-900/filter` `animation-duration-500/foo` | 1             | `jumi-filter`                       | **0.5s**   |
| identical phrases, two labels       | `animate-opacity-[0:0\|100:1]/enter` `…/exit`                                                                                | 2             | `jumi-opacity-sluPU`                | **1s**     |
| identical phrases, per-label timing | …plus `animation-duration-200/enter` `animation-duration-1800/exit`                                                          | 2             | `jumi-opacity-sluPU`                | **1.8s**   |
| orphan label                        | `animate-rotate-45` `animation-duration-700/nope`                                                                            | 1             | `jumi-rotate-3zWYd`                 | **1s**     |
| orphan slot                         | `animate-rotate-45` `animation-duration-700/scale`                                                                           | 1             | `jumi-rotate-3zWYd`                 | **1s**     |

## Four findings

**1 · The collision reaches both, with no precedence, and says nothing.** `animation-duration-1000/scale`
in the collision case sets the duration of the scale motion _and_ of the rotate motion labelled
`scale` — two slots, both 1s, from one class. It is not "the slot wins" or "the label wins": they are
one name. Nothing warns, because nothing is ambiguous to the engine — the ambiguity exists in the
vocabulary, and only the label declaration (`--jumi-rotate-3zWYd-label: scale`) records which reading
the author had in mind.

**2 · The later control class does not win.** `animation-duration-1000/scale` followed by
`animation-duration-400/scale` resolves to **1s**. Both rules write the same custom property, so the
winner is decided by CSS source order in the emitted sheet, not by the order the author wrote the
classes. An author who expects "last one wins" (as with ordinary utilities) gets the opposite.

**3 · Identical phrases on one property are not separable by label.** Two labelled identical phrases
derive **two** slots, but the element resolves to **one** animation name — `jumi-opacity-sluPU` — and
`--jumi-opacity-sluPU-label` holds a single value, `exit`. Giving them different timings does not give
them different motions: the `enter` control's 200ms is discarded and the motion runs at **1.8s**.
Identity is the frames' text (`src/core/index.ts:785`), so the two labels are not two motions; they are
two names for one motion, and the cascade keeps whichever came last. For Studio, duplicating a motion
and renaming it is therefore not the independent duplicate the UI implies.

**4 · Compounds compose to the bare property name, and a label member does not split them.**
A member utility plus its neighbour derive **one** slot named `jumi-filter`, so `/filter` addresses it even
though neither class contains the string `filter` as a full utility name. Labelling one member
(`animate-filter-blur-[4px]/foo`) does **not** create a second slot: `/foo` addresses the one compound
motion, at `0.5s`, and `/filter` addresses the same motion.

> **Correction (2026-09-15, after the ruling).** This finding was first measured with
> `animate-filter-blur-4`, which is **not a candidate at all**: the matcher is `type: 'length'` against the
> blur theme, so a bare `4` resolves to nothing and Tailwind drops it silently — no rule, no warning. Only
> `animate-filter-brightness-125` compiled, so the label the corpus was testing never existed, and the
> discarded `/foo` control read as "a member label cannot own timing" when the truth was "the member was
> never emitted". Spelled `[4px]` it compiles, the label is declared, and the compound answers to it. The
> wrong row is the reason `scripts/spike-instance-models.mjs` now prints the selectors it compiled, next to
> the durations it measured: a class that Tailwind dropped looks exactly like a class that did nothing.

## What is not broken

- An address nothing reads drops silently and harmlessly: an unknown label (`/nope`) and a slot with no
  motion (`/scale` beside a rotate motion) both leave the duration at its default. No error, no
  half-applied state.
- The self-labelled case (`animate-scale-110/scale`) is deterministic: the label and the property name
  are the same string, so the one declaration is read by the one motion. It is coincident, not
  ambiguous.
- The baseline, label and compound addresses all work as documented, and each derives exactly one slot.

## What this means for a decision

The overload is real but the engine is not nondeterministic: every case above has one answer. What is
missing is a way for an author — or for Studio — to say _which_ reading is meant when the two coincide,
and any signal when a control lands on more than one motion.

The three candidate resolutions, none of them taken here:

1. **Document it.** Keep one namespace, state that a label shadows-and-shares with the property name,
   and have Studio refuse to author labels that collide with a property it knows about.
2. **Separate the namespaces.** A label could occupy its own address space (e.g. a distinct prefix in
   the emitted custom property), so `/scale` as a slot and `/scale` as a label stop sharing a name.
   That changes the emitted CSS and therefore the byte snapshot, and needs a migration story for
   existing labels.
3. **Keep the syntax, add the signal.** One namespace, but a build-time warning (or a
   `pnpm check` assertion) when a control's address resolves to more than one derived slot.

Findings 2 and 3 are independent of the resolution: a "last class wins" expectation and a
"duplicate-by-rename" expectation are both wrong today, and neither is fixed by separating namespaces.

## Rulings (2026-09-15)

- **Finding 3 is fixed, and it was the real one.** Motion-instance identity is now separate from
  keyframe-definition identity: two identical phrases under two names are two slots over one
  `@keyframes`. Measured: `…/enter` with `200ms/enter` beside `…/exit` with `1800ms/exit` resolves
  `0.2s, 1.8s` where it used to resolve `1.8s, 1.8s`, and the same phrase unnamed _and_ named is two
  instances (`1s, 1.8s`). The same name twice stays one instance.
- **Finding 1 is fixed as well, by separating the readings rather than the syntax.** A control's token is
  now classified before it is written: a property Jumi animates (or an effect) reads the property scope,
  and anything else reads the label namespace `--jumi-label-<name>-<part>`, which no property scope can
  occupy. Measured on the corpus that distinguishes the two readings — `animate-scale-110`,
  `animate-rotate-45/scale`, `animation-duration-1000/scale`, `animation-duration-400/rotate` — the
  result moved from **`1s, 1s`** to **`1s, 0.4s`**: the author's own control now wins. There is no new
  public syntax, no element-local inference, and no keyframe change; the cost is six characters per
  labelled control and one accepted behaviour change, that a motion labelled with the exact name of a
  property it does not animate can no longer be addressed by that word. `structuralAddress` in `@/core`
  holds the rule, and the third refusal — a name that is already a structural address — is reported by
  the finalizer rather than dropped in silence.
- **Finding 2 stays a warning, not a rule.** CSS gives no guarantee about authored class order, so Jumi
  should not invent "last class wins"; contradictory controls for one address are an authoring
  mistake, and a warning is the honest signal. Measured unchanged: `animation-duration-1000/scale`
  followed by `animation-duration-400/scale` still resolves `1s`.
- **Finding 4 is not a defect and not a design target.** A label on a compound member names the whole
  compound motion — one keyframe, one position, one timing — and the plain-CSS measurement says that is
  the only correct reading: two animations of one `filter` under the default `replace` composition lose
  one contribution (`brightness(1.8024)` where both were written; `blur` gone), and only an author's
  explicit `animation-composition: add` composes them. Nothing here needs a warning, because nothing is
  unusable: see the correction above for how the original evidence for this finding was wrong.
- **The multi-carrier lead was closed as a harness fault** — see the section above.

## The multi-carrier lead is closed: it was a harness bug

The first version of `spike-addressing.mjs` compiled all eleven cases into one stylesheet and then
assembled the page **without that stylesheet** — it destructured `css` out of the build and never
injected it. Every element therefore resolved `none` with no `--jumi-*` properties at all, which reads
exactly like a finalizer defect in which every carrier goes quiet at once.

It is not one. The same eleven cases in one stylesheet derive 8 slots and **every** carrier resolves:

```
all 11 cases: 8 slots, dead: none
```

and the positive control reproduces the original reading from nothing but the omission:

```
control — same build, stylesheet omitted from the page: 11/11 dead (css bytes built: 31565)
```

So multi-carrier sheets are fine, including the collision shape. Recorded because the mistake is easy
to repeat and expensive to misread: a browser probe that omits its own stylesheet fails silently, and
its output is indistinguishable from an engine that emits no composition.
