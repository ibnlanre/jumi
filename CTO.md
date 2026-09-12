Yes. Given the actual history, I’d make two decisions explicit now.

First, this is **Jumi 1.0**, not 2.0. There is no published compatibility surface to preserve. I’d change the package version to `1.0.0` when you are ready to treat the current API as the first public release. Until then, a prerelease like `1.0.0-beta.x` would also make sense. The old Sass incarnation is history, not a released major version.

Second, **Tailwind v4 should be the floor**. I would not spend another minute carrying v3 compatibility. Jumi is being designed around v4 concepts already:

```text
@theme / CSS tokens
@plugin
CSS-first configuration
@tailwindcss/vite
v4 candidate/compiler behavior
```

Supporting v3 would create compatibility work for users who do not exist.

So yes, move on to Phase 2.

## Phase 2: own theme resolution

This is where the migration starts paying off beyond fixing the carrier architecture.

Batch 1 proved the pattern with tokens:

```text
colors → var(--color-*)
letterSpacing → var(--tracking-*)
```

Batch 2 should prove the other important class of theme ownership:

```text
spacing scale → calc(var(--spacing) * n)
```

I’d proceed with the measured set:

```text
margin
padding
gap
inset
translate
width
height
minWidth
minHeight
maxHeight
flexBasis
outlineOffset
```

with explicit non-formula values remaining literals:

```text
0
px
auto
```

and whatever other exceptions your measurement has actually established.

The important architectural rule is:

> Jumi maps only the Tailwind v4 CSS contract it actually consumes. It does not reproduce Tailwind's JavaScript theme engine.

So this:

```ts
theme('padding')
```

can continue to exist as Jumi's internal vocabulary for now, but its implementation should increasingly resolve through:

```css
var(--spacing)
var(--color-*)
var(--radius-*)
...
```

rather than through `api.theme()`.

That lets the 193 call sites remain untouched while their dependency underneath changes.

## I’d also change how we think about the Tailwind adapter now

The one-step integration work has moved Tailwind into a much healthier role:

```text
jumi()
  ├─ registers Jumi
  ├─ hosts Tailwind v4
  └─ finalizes Jumi
```

But the semantic core is already escaping it.

Phase 2 should continue that direction. Every successful theme batch should reduce the amount of information that must cross:

```text
Tailwind → Jumi
```

Eventually the adapter should mostly provide candidate/variant machinery, not values.

And because there are no users yet, this is the ideal moment to make those changes. You don't need deprecation aliases, migration warnings, compatibility shims, or two competing resolution systems for three releases. We can make the 1.0 architecture the architecture we actually want.

One thing I would **not** do yet is choose between `@ibnlanre/jumi` and `@jumi/...` based on implementation convenience. That's branding/package topology and deserves its own decision closer to publication. Keep the internals package-name-neutral where possible.

So: **Tailwind v4 only, Jumi 1.0, Phase 2 approved. Start with the spacing/formula batch.**
