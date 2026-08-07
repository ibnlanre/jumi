Now you're onto something potentially real. The key shift: instead of the foreign stop coercing to `auto` (intrinsic → huge ramp), make the foreign stop's **fallback a `calc-size()` that resolves to the element's resting/base width** — so an unset stop simply **holds at rest** rather than leaking 0 or ramping to intrinsic. That's a defensible semantic: "at stops I didn't pin, I stay at my base."

Let me test that exact configuration.

Created [](file:///Users/ibnlanre/Desktop/workspace/jumi/examples/calc-size-fallback-test.html)

Opened [Browser](vscode-browser:/ebff1833-533c-4e44-a96f-97aa478283cb?vscodeLinkType=browser)

Ran Playwright code
Completed with input: return await page.evaluate(() => window.__run ? window.__run() : 'not-ready')

Waited for Playwright code

Waited for Playwright code

**It works — all four boxes are correct!**

| Box | Stops | Measured | Behavior |
|---|---|---|---|
| **A** | 100% only | `40 → 40 → 40 → 41.6 → 43.2 … → 98.4` | ✅ holds 40 at the foreign 5% stop, then smooth 40→100 |
| **B** | 5% only | `35 → 30 → 20 → 20.5 → 21 … → 39.5 → 40` | ✅ dips to 20 at 5%, then eases back to 40 |
| **C** | both | `35 → 30 → 20 → 22.1 … → 97.9 → 100` | ✅ clean 40→20→100 |
| **D** | neither | `40 → 40 → … → 40` | ✅ holds at rest the whole time |

The `calc-size(var(--jumi-width), size)` fallback gives foreign stops exactly the "none" semantic we wanted: **an unset stop holds at the element's resting width** instead of leaking `0` or ramping to intrinsic. That's your idea, and it's the fix.

One caveat before we call it: in this test I set `--jumi-width: 40px` (a concrete length). The plugin's default `--jumi-width` is `auto`. Let me verify the **plugin-realistic** case — `--jumi-width` = `auto` with the element's width coming from a normal class, and check whether `interpolate-size` is even required.
