# Naming a motion — `<motion>/<name>`

Every motion candidate may carry a name: `animate-fade-in/reveal`,
`animate-opacity-50/reveal`, `animate-opacity-[0:0|100:1]/reveal`,
`animate-scale-x-110/reveal`, `animate-background-color-red/reveal`. The name goes after a slash,
`[brackets]` are only for a name that needs them, and a control addresses the motion by the same
word: `animation-duration-500/reveal`.

That much is delivery, and delivery is one line per matcher family:

```ts
matchComponents({ [name]: fn }, { modifiers: 'any', … })
```

Measured before it: Tailwind accepts `/[reveal]` on a *motion* (arbitrary) and refuses `/reveal`
(bare), and refusing means dropping the **whole candidate** — no animation at all, which is the
failure the bracket spelling hid. A Jumi *control* already declared `modifiers: 'any'`, so
`animation-duration-500/reveal` worked while every motion spelling did not.

## What a modifier flag cannot do

`modifiers: 'any'` answers exactly one question — does Tailwind hand the modifier to the matcher?
What the matcher then does with it is model state, and three quarters of the work lived there:

- `perValue` took the modifier and discarded it; `color()` hard-coded `{ modifier: null }`; the
  effect matcher ignored it. Delivery alone would have converted a loud refusal into a **silent
  no-op** for those families.
- A name is only an address if the composition *reads* it, which means the slot's per-part chain and
  the non-inheriting registration of every link.
- Which is where the architecture question was, and where the first implementation was wrong.

## The trap: a name in the aggregate is compiler-global

The first implementation recorded names against the slot — `names: Map<slotKey, string[]>` — and
baked them into the aggregate's chains. The differential:

```html
<div id="a" class="animate-fade-in/reveal animation-duration-300/reveal animation-duration-900/loop">
<div id="b" class="animate-fade-in/loop animation-duration-700/loop">
<div id="c" class="animate-fade-in/reveal animate-scale-110/loop animation-duration-900/loop">
```

Computed `animation-duration`, per motion:

| | expected | first implementation, forward | reversed |
| --- | --- | --- | --- |
| `#a` fade-in | `0.3s` | `0.9s` ✗ | `0.3s` |
| `#b` fade-in | `0.7s` | `0.7s` | `0.7s` |
| `#c` fade-in | not `0.9s` | `0.9s` ✗ | `0.9s` ✗ |
| `#c` scale | `0.9s` | `0.9s` | `0.9s` |

Two failures, and the second is worse than the first. `#a` was reached by a name declared on a
*different element* (`#b`'s `loop`), and it was reached **only in one candidate order** — so discovery
order had become cascade semantics. The aggregate is one declaration block shared by every element
that matches the composition: anything *value*-like in it is global by construction.

## The shape that is local

The name cannot be in a chain at all. A chain is shared text; a name is a fact about a rule. So the
chain reads the slot's own address, and the rule that declared the name is what fills it:

```css
/* the aggregate — identical for every element, and carrying no name */
animation-duration: var(--jumi-slot-fade-in-animation-duration,
                        var(--jumi-fade-in-animation-duration, var(--jumi-animation-duration)));

/* the rule the author wrote — the only place the name appears */
.animate-fade-in\/reveal {
  --jumi-fade-in-animation-name: jumi-fade-in;
  --jumi-fade-in-label: reveal;
  --jumi-slot-fade-in-animation-duration: var(--jumi-reveal-animation-duration);
  /* … one per part, filled by the finalizer */
}
```

This is the range composition variant's shape, for the same reason: the fact belongs to the rule, so
the rule is where it is written. `animation-range-entry:animate-fade-in` publishes
`--jumi-fade-in-animation-range` on the candidate's own rule; a name publishes the slot's address
there. The finalizer already hoists the per-slot shorthand onto activation rules for the same reason
(an `@apply`, a variant and a plain utility each carry the activation and each needs the value), so
this reuses the phase rather than adding one.

Verified: the differential above now gives `0.3s / 0.7s / (scale 0.9s, fade-in 1s)` in **both**
candidate orders, and an element that names nothing is unreachable by any name in the sheet. The
permanent form is `pnpm behaviour:check`'s *naming* section — five assertions, including the reversed
build — and it is the same page that failed against the first implementation.

Two consequences worth stating, because they are the contract rather than side effects:

- **A name may be shared.** `animate-opacity-50/enter animate-scale-110/enter` plus
  `animation-duration-500/enter` reaches both, because each rule installs `enter` as its own slot's
  address. A name is an address, not an identifier.
- **A name never widens an element.** Another element naming the same slot `loop` cannot be reached
  by a control written for `loop`. Before the split it could.

One implementation detail is a compile-time decision, not a semantic one: the slot's address link is
added to its chains only when the slot is named **somewhere** in the build. The link's *shape* being
global is harmless — its content is element-local and non-inheriting, and an unset link falls through
— while adding it for every slot cost **51% more staged bytes** on the corpus. With the link only
where a name exists, the composition grows by 1.8% (`aggregateBytes` 4281 → 4359 in
`structure.json`).

## Refused names

A name becomes part of a custom-property's name (`--jumi-<name>-animation-duration`), and that is the
only thing that can be wrong with one. Measured, name by name:

| author writes | Jumi receives | outcome |
| --- | --- | --- |
| `/reveal` `/card` `/flick` `/return` `/hero-2` `/2x` `/_x` `/a_b` | same | addressable |
| `/[a.b]` `/[a:b]` `/[a/b]` `/[a(b)]` `/[--x]` `/[A-Z]` | escaped | addressable |
| `/[a b]` `/[a_b]` `/[_x]` `/[x_]` | `a b`, `a b`, ` x`, `x ` | **refused and reported** |
| `/[]`, bare `/unicodé`, bare `animation-range-nonsense:` | never a candidate | Tailwind drops it |

Whitespace is unwritable: `css.escape('a b')` is `a\ b`, legal CSS that **ends PostCSS's
identifier**, so the declaration fails to parse. Before this work that was not a silent no-op but a
build failure — `animation-duration-500/[a_b]` died with `CssSyntaxError: Unknown word
b-animation-duration` inside the finalizer's own parse. The refusal is therefore about writability
and nothing else; the motion still runs, unnamed, and the build says which name it could not use.

The refusal travels in the **property** of a record declaration (`--jumi-name-<hash>-refused`), not
in its value: CSS cannot keep a name's leading or trailing whitespace in a value — PostCSS moves it
into `raws.between` — so a value-based record went silent for exactly the names `_` produces.

Deliberately **not** reported: a name that no motion answers to. Controls configure motion, they do
not create it; `animation-duration-500/reveal` with no `reveal` is inert in the same way
`animation-duration-500` is. A conditional motion beside an unconditional named control
(`motion-safe:animate-fade-in/reveal`) is a pattern, not an author error, and a warning there would
teach authors to stop naming things.

## Range composition parity — closed the same day

The variant qualifies one *slot*, so it publishes under that slot's **key**: `attribute-id` for a
phrase or a single value, the attribute for an effect or a composed tween. The chains read
`--jumi-<attribute>-animation-range`, which is right for the last two and wrong for the first two —
so a phrase's range emitted, validated, and did nothing. Measured, before the fix:

| motion | publishes | chain read |
| --- | --- | --- |
| `animate-fade-in` (effect) | `--jumi-fade-in-animation-range` | `var(--jumi-fade-in-animation-range, …)` ✓ |
| `animate-opacity-50` (single value) | `--jumi-opacity-cMr-animation-range` | `var(--jumi-opacity-animation-range, …)` ✗ |
| `animate-opacity-[0:0\|100:1]` (phrase) | `--jumi-opacity-sluPU-animation-range` | `var(--jumi-opacity-animation-range, …)` ✗ |
| `animate-scale-x-110` (composed) | `--jumi-scale-animation-range` | `var(--jumi-scale-animation-range, …)` ✓ |
| a phrase named `/reveal` | both | `var(--jumi-slot-opacity-sluPU-…, var(--jumi-opacity-…` ✗ — the name link is not the publication |

The range part now takes one extra link, and only when the key is not the attribute:

```text
name address (if named)  →  --jumi-<key>-animation-range  →  --jumi-<attribute>-animation-range  →  --jumi-animation-range
```

Nothing else needs it, and that is a fact rather than a preference: the range variant is the only thing
that publishes per slot *after* the composition is built. Adding the link for every part would have been
uniform and would have cost a `var()` lookup per part per element.

Held by four browser arms in `pnpm scroll-driven:check` — effect, single value, phrase, and named phrase
— each asserting the intended slot is compressed to the range while the motion beside it keeps the whole
one: `0 0.5 1` against `0.25 0.5 0.75` across ¼ ½ ¾. The same arms on the pre-fix build report `—`
(no animation resolves the range), which is exactly what a user would have seen.

Cost: the aggregate grows 4359 → 4864 bytes on the corpus (+11.6% of the composition, +1.1% of output),
for the slots that can use it.

## Known gaps

- `_` means a space inside `[brackets]` and an underscore when bare. Nothing Jumi can do — it is
  Tailwind's value charset — so the docs teach the bare form and the warning says what happened.
- Phrase slots are ordered in the composition by *insertion*, so the `animation-name` list can come out
  in a different order under a different candidate order. Harmless — each position carries its own
  chain, and a test that compares two builds must compare per name rather than per serialization, which
  is what `behaviour:check`'s naming section now does.
