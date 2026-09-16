# `animate-` is also Tailwind's own utility namespace

Status: **recorded limitation.** Found 2026-09-16 while auditing every candidate's phrase. Deliberately
not fixed in that change; it is a 1.0 API question about a namespace Jumi shares with its host.

---

## What happens

`animate-[0:0|100:1]` compiles to:

```css
.animate-\[0\:0\|100\:1\] {
  animation: 0:0|100:1;
}
```

That is not a Jumi declaration. Tailwind core registers `animate-` for arbitrary animation values, so a
bare `animate-<arbitrary>` is claimed by the host before Jumi sees it. Jumi's own `'animate'` key
(`src/properties/tween.ts`) is the **effect** candidate: it accepts an effect name (`fade-in`,
`wipe-in-left`) and returns nothing for anything else — deliberately, so a scanned `animate-${name}`
template literal does not crash the build.

So the class is core's, the grammar in the value is Jumi's, and the outcome is neither a Jumi motion nor
a refused candidate: it is a declaration PostCSS will not parse, which fails any host that reads the
sheet — including Jumi's own finalizer. Measured, that is how this surfaced: the surface audit crashed
at that line until each candidate was compiled separately.

## Why it is not merely cosmetic

`animate-fade-in` and `animate-opacity-50` are Jumi's, because they name a candidate. `animate-[…]` is
Tailwind's, because it names nothing. Two spellings that look like one vocabulary resolve in different
layers, and the only visible symptom is a parse failure when the value happens to be a Jumi phrase.

## Options, for 1.0

1. **Leave it.** The bare `animate-[…]` stays the host's; Jumi's phrases live on property surfaces
   (`animate-scale-x-[…]`, `animate-opacity-[0:0|100:1]`). Cheapest, and true to "Tailwind is one host
   among the ones we could have" — but it leaves a spelling that looks supported and is not.
2. **Claim the namespace.** Register `animate` as a Jumi phrase matcher. That shadows core's arbitrary
   form and needs a ruling on precedence against token-backed utilities (`animate-spin` and friends).
3. **Refuse loudly.** Detect a phrase on the bare name and report it as a refused candidate rather than
   emitting it — the model already has a refusal channel for names it cannot address.

Undecided on purpose. The audit records `animate` in its baseline as unparseable, so the set of
candidates that cannot be compiled cannot grow without the baseline being re-recorded by hand.
