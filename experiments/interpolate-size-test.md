Sharp catch — that's `interpolate-size: allow-keywords`. It makes `auto` (and other sizing keywords) interpolable, so the coerced `auto` at a foreign stop would **tween smoothly** instead of snapping. Let me verify it empirically with the same setup plus `interpolate-size`.

Created [](file:///Users/ibnlanre/Desktop/workspace/jumi/examples/interpolate-size-test.html)

Already open: [Browser](vscode-browser:/6314fa51-fada-43c6-bcb0-f61d7d0b485c?vscodeLinkType=browser)

Opened [Browser](vscode-browser:/19dcee54-0b20-47eb-b2be-2287f315a9b1?vscodeLinkType=browser)

The page loaded. Let me wait for the sampling to finish and read the results.

Ran Playwright code
Completed with input: return await page.evaluate(async () => {
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
    computed: (() => {
      const s = getComputedStyle(document.querySelector('.a'))
      return { interpolateSize: s.interpolateSize, animName: s.animationName }
    })(),
  }
})

The `interpolate-size` result is promising but the sampling was misaligned (the infinite animation's phase was arbitrary, producing stepped-looking data). Critically though, the values now **change over time** (A: `229.7 → 163.3 → 141.2`; D: `220 → 97.9`) instead of snapping-and-holding — meaning `auto` is being interpolated. Let me re-measure with a controlled restart so the curves are trustworthy.

Ran Playwright code
Completed with input: return await page.evaluate(async () => {
  const classes = { a: 'A', b: 'B', c: 'C', d: 'D' }
  const out = {}

  for (const [cls, label] of Object.entries(classes)) {
    const el = document.querySelector('.' + cls)
    // restart animation cleanly at t=0
    const name = getComputedStyle(el).animationName
    el.style.animation = 'none'
    void el.offsetWidth // force reflow
    el.style.animation = ''
    // give it a beat to start
    await new Promise(r => setTimeout(r, 50))
    const anim = el.getAnimations()[0]
    const start = anim ? anim.currentTime : 0

    // sample at exact fractions of the duration via currentTime alignment
    const series = []
    for (let i = 0; i <= 40; i++) {
      // wait until currentTime reaches target fraction (4s duration)
      const target = (i / 40) * 4000
      let guard = 0
      while (anim && anim.currentTime < target - 5 && guard < 600) {
        await new Promise(r => setTimeout(r, 5))
        guard++
      }
      series.push(Math.round(parseFloat(getComputedStyle(el).width) * 10) / 10)
    }
    out[label] = series.join(' → ')
    el.style.animation = 'none'
  }
  return out
})

Waited for Playwright code

The controlled sampling takes ~16s (4s per box). Let me keep waiting for it to finish.

Waited for Playwright code

Now I have clean, controlled data. The verdict is decisive — and it's **not** the fix. Let me lay out what each box actually did (aligned to a fresh 4s cycle):

**C — pins both stops (control):** `35.8 → 30 → 20 → 22.1 → … → 97.9 → 40` ✅ **correct** — drops to 20 at 5%, smoothly rises to ~100 at 100%. The shared keyframe works *only* when an element sets every stop.

**A — pins only 100%:** `260 → 569 → 1094 → 1072 → … → 126 → 40` ❌ The foreign 5% stop coerced `width` to `auto`; `interpolate-size` resolved that `auto` to the element's real auto size (**1094px** in this layout) and smoothly **ramped down from 1094**. That's not the intended 40→100 — it's a giant spurious tween.

**B — pins only 5%:** `35.9 → 30 → 20 → 48.3 → 76.8 → … → 1070` ❌ Correct to 20 at 5%, then ramps **up** toward the foreign 100% stop's `auto` (~1070px).

**D — pins neither:** jumps to `1098.8` and holds. ❌

## So `interpolate-size` converts the *snap* into a *ramp* — but not into "none"

The property makes the coerced `auto` interpolable, so instead of snapping, the element now **tweens toward its auto size** at foreign stops. When `auto` is large (flex/stretch, wide container) that's a catastrophic ramp from 1000+px. When `auto` happens to be small, it's a subtle wrong kink. Either way the foreign stop is still **active** — it pulls the element toward its `auto` size instead of letting it be absent.

So the empirical verdict across all three attempts:

| Mechanism | Foreign stop behavior |
|---|---|
| fallback `var(--x, var(--base))` | leaks base (0/auto) → snap |
| no fallback `var(--x)` | coerces to initial `auto` → snap |
| + `interpolate-size: allow-keywords` | coerces to `auto` → **ramp toward auto** |

None of them make the stop "none." A shared keyframe fundamentally cannot isolate stops per element.

## The architecture that has no foreign stops at all

The only model where this never arises is the one you shipped before the detour:

```css
@keyframes jumi-width { to { width: var(--jumi-width) } }
```

Every element using `animate-width-*` sets `--jumi-width` — there are no per-stop variables, no unset stops, no coercion, nothing to leak. It's per-element (each sets its own target), derived (emitted only when used), and deduplicated. That's the sound design, and it's what `computePropertyKeyframes` already produces for the base case.

I recommend we **drop the `/stop` machinery** (registry, per-stop vars, modifiers) and keep the derived single-`to` keyframe. The multi-stop shared-keyframe idea is now proven unsound in three independent ways. Shall I strip the stops plumbing back to that clean single-`to` model?

Made changes.