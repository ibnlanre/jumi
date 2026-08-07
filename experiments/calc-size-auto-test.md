Created [](file:///Users/ibnlanre/Desktop/workspace/jumi/examples/calc-size-auto-test.html)

Opened [Browser](vscode-browser:/4177e2f0-ac87-4616-96fe-d1be27972e3f?vscodeLinkType=browser)

Ran Playwright code
Completed with input: return await page.evaluate(() => window.__run ? window.__run() : 'not-ready')

Waited for Playwright code

Decisive result — and it splits cleanly by what the base var holds:

**With `--jumi-width` = a concrete resting width (40px) — previous test:** ✅ all four correct, unset stops hold at rest.

**With `--jumi-width` = `auto` (the plugin's actual default) — this test:**

| Box | `interpolate-size` | Measured | Result |
|---|---|---|---|
| G1-A (100% only) | no | `80 → 260 (snap) → 100` | ❌ foreign stop snaps to `auto`=260 |
| G2-A (100% only) | yes | `125 → 257 → … → 105 → 80` | ❌ ramps from `auto`=257 |
| G2-B (5% only) | yes | `65 → 40 → 24 → … → 251` | ❌ ramps up to `auto`=251 |
| G2-D (neither) | yes | `125 → 200 → 260` | ❌ holds at `auto`=260 |

## Why it breaks with `auto`

`calc-size(var(--jumi-width), size)` with `--jumi-width: auto` resolves to `auto` — and during the animation, `auto` recomputes to the element's **intrinsic** width (260 = the card fill), **not** the resting `80px` from the class (which the animation supersedes). So the calc-size fallback only produces "hold at rest" when the basis is a **concrete length equal to the true resting width** — which is exactly what I hardcoded (40px) in the working test.

## The real finding

Your mechanism is right — it's the first thing that gives proper "unset stop = hold at rest" semantics. But it exposes a prerequisite the plugin doesn't currently satisfy: **the base variable must carry the element's concrete resting width, not `auto`.**

That's a genuine design fork:

1. **Make `--jumi-width` (and friends) hold a real resting width.** But the plugin can't know an element's resting width — it comes from *other* classes (`w-8`) or the layout. There's no input for it.

2. **Require/derive a "rest" value per element** — e.g., the stops' fallback points at a per-element rest variable the user sets alongside (`animate-width` base), or the plugin defaults rest to a sensible length. That's a new concept in the API.

3. **Accept `calc-size(auto)` and its intrinsic resolution** — not viable, it ramps to fill-width.

So the calc-size approach is the correct mechanism, but it only becomes usable if we introduce a concrete "resting value" the fallback can point at. Do you want to pursue that — i.e., decide where the per-element resting width comes from (a `rest` utility/variable, or redefining what `--jumi-width` means)? That's the crux now; the CSS side is solved.

Made changes.