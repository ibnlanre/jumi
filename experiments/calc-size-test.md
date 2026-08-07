`calc-size()` is the companion to `interpolate-size` — it can turn intrinsic keywords like `auto` into computable lengths (`calc-size(auto, size * 0.5)`, etc.). The question is whether wrapping the foreign stops in `calc-size()` changes the outcome. Let me test it empirically, same controlled setup, with the keyframe stops expressed via `calc-size()` + `interpolate-size` on the boxes.

Created [](file:///Users/ibnlanre/Desktop/workspace/jumi/examples/calc-size-test.html)

Opened [Browser](vscode-browser:/8b68e91a-4056-46f6-9797-3ce3780d4339?vscodeLinkType=browser)

Let me run the controlled measurement (takes ~16s).

Ran Playwright code
Completed with input: return await page.evaluate(() => window.__run ? window.__run() : 'not-ready')

Waited for Playwright code

Waited for Playwright code

The calc-size results are in — and they confirm the same verdict. Controlled 4s cycle:

| Box | Stops | Measured curve | Result |
|---|---|---|---|
| **C** | both | `35 → 30 → 20 → 22.1 → … → 97.9 → 100` | ✅ clean 40→20→100 |
| **A** | 100% only | `91.7 → 130 → 220 → 216.8 → … → 103 → 40` | ❌ ramps **from** foreign-5%-`auto` (220) |
| **B** | 5% only | `35 → 30 → 20 → 25.3 → 30.5 → … → 214.7` | ❌ ramps **up to** foreign-100%-`auto` (214.7) |
| **D** | neither | `84.7 → 130 → 220 → 220 …` | ❌ holds at `auto` (220) |

## `calc-size` + `interpolate-size` doesn't help either

Wrapping the stops in `calc-size(var(--x, auto), size)` keeps every stop *valid* (no invalid-at-computed-value coercion), but it doesn't make a foreign stop inert. For an element that never set `--jumi-width-5`, `calc-size(auto, size)` resolves to the element's **intrinsic `auto` size (~220px here)**, and the element now smoothly tweens toward/away from that 220px at the foreign stop. The only box that's correct is **C**, which sets both stops.

So the full empirical matrix across every mechanism we tried:

| Mechanism | Foreign stop → |
|---|---|
| `var(--x, var(--base))` fallback | leaks base (0/auto) — snap |
| `var(--x)` no fallback | coerces to `auto` — snap |
| + `interpolate-size` | coerces to `auto` — **ramp toward auto** |
| + `interpolate-size` + `calc-size()` | coerces to `auto` — **ramp toward intrinsic (220)** |

Every single one forces a real value at a stop the element didn't pin. There is **no CSS construct that makes an unset stop "none" inside a shared keyframe** — the stop is physically in the keyframe, so it must produce a value, and any value (base, `auto`, intrinsic) is wrong for elements that didn't choose it.

## The conclusion is now closed

The shared-keyframe multi-stop model is unsound — verified four ways in the browser. The architecture that has no foreign stops is the single `to` keyframe:

```css
@keyframes jumi-width { to { width: var(--jumi-width) } }
```

Every user sets the one var → per-element, no leaks, no coercion, no stops to collide. This is what `computePropertyKeyframes` already emits for the base case, and it's the model you shipped before.

I'd like to stop the multi-stop exploration here (we've proven it out) and **strip the `/stop` machinery back to the clean derived single-`to` keyframe.** That keeps the whole "keyframes as a derived afterthought" win you got, without the broken stops layer. Want me to proceed with that cleanup?

Made changes.