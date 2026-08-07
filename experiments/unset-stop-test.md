Let's verify it empirically. I'll build a self-contained test page that isolates the exact question: when a shared keyframe has a stop whose variable one element didn't set (no fallback), does the browser **drop** that stop for that element, or **coerce** it to `auto`/initial?

Created [](file:///Users/ibnlanre/Desktop/workspace/jumi/examples/unset-stop-test.html)

Let me open this in the browser and read the measured values.

Opened [Browser](vscode-browser:/6314fa51-fada-43c6-bcb0-f61d7d0b485c?vscodeLinkType=browser)

The page loaded but the measurement script runs and fills the `out-*` elements after sampling. Let me wait for it to finish and read the results via a script (the sampling takes ~4+ seconds).

Ran Playwright code
Completed with input: return await page.evaluate(async () => {
  // wait until the sample output is populated (script fills after ~4s of sampling)
  for (let i = 0; i < 60; i++) {
    const a = document.getElementById('out-a')
    if (a && a.textContent.length > 4) break
    await new Promise(r => setTimeout(r, 200))
  }
  return {
    A: document.getElementById('out-a').textContent,
    B: document.getElementById('out-b').textContent,
    C: document.getElementById('out-c').textContent,
    D: document.getElementById('out-d').textContent,
  }
})

The empirical test settles it — and it's decisive. Here are the measured curves over one 4s cycle (samples every 0.1s):

| Box | Stops pinned | Measured width over time | Result |
|---|---|---|---|
| **C** | both (5% + 100%) | `40 → 32.5 → 22.5 → 20 (5%) → 21.6 … → 100 (100%)` | ✅ smooth 40→20→100 |
| **A** | only 100% | `40 → 40 → 426.8 → … → 100` | ❌ jumps to `auto` at the foreign 5% stop |
| **B** | only 5% | `40 → … → 20 (5%) → holds → 424.2` | ❌ jumps to `auto` at the foreign 100% stop |
| **D** | neither | `40 → 224.8 …` | ❌ coerced to `auto` throughout |

## The finding: unset stops do NOT drop — they coerce to `auto`

An unset `var(--jumi-width-5)` with **no fallback** does not make the stop "none." It makes the keyframe declaration **invalid at computed-value time**, and the property falls back to its **initial value** (`auto` for width). The box then snaps to its flex-stretched `auto` width (426.8 / 424.2 / 224.8) at that stop. So:

- **With fallback** → leaks the base var (`0`/`auto`). 
- **Without fallback** → leaks `auto`/initial.

Either way, a foreign stop contaminates elements that didn't set it. Your conclusion is now **empirically proven**: *CSS has no per-stop "none" in a shared keyframe.* A stop present in the keyframe but unset on an element always resolves to *some* value and disrupts the tween.

## What this means for the design

The shared-keyframe multi-stop model is **not viable** across elements — full stop. Every element that doesn't pin every stop in the union is poisoned.

The architecture that has **no foreign-stop problem** is the one you already shipped before this detour:

```css
@keyframes jumi-width { to { width: var(--jumi-width) } }
```

- One shared keyframe, `to` reads the **single** per-element base var.
- Every element using `animate-width-*` sets `--jumi-width` → no unset vars, no leaks, genuinely per-element.
- It's derived (emitted only when used), deduped — exactly what `computePropertyKeyframes` already produces for the base case.

The only path that keeps true multi-stop isolation is **per-stop keyframes + a per-element `animation-name` list** (element composes only its own stops) — but that breaks smooth multi-stop on a *single* element for the same property (animations fight). So the honest recommendation:

**Revert the `/stop` plumbing and keep the derived single-`to` keyframe.** Multi-stop as a shared-keyframe feature is empirically unsound. Want me to strip the stops machinery (registry, modifiers, per-stop vars) back to the clean `to`-per-attribute model, or do you want to explore the per-stop-keyframes + per-element list path despite its single-element limitation?

Made changes.