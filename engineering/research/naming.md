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

## Known gaps

- `_` means a space inside `[brackets]` and an underscore when bare. Nothing Jumi can do — it is
  Tailwind's value charset — so the docs teach the bare form and the warning says what happened.
- The range composition variant publishes `--jumi-<slot-key>-animation-range`, and the chains read
  `<property>`-keyed links, so the variant's publication is read for effects (where the slot key *is*
  the attribute) and not for phrases (where the key carries a hash). Unverified in a browser, and
  unrelated to naming; the slot address this work added is what a fix would ride on.
