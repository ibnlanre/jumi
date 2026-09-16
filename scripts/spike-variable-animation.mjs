#!/usr/bin/env node
/**
 * Architectural spike — can a constituent phrase animate **its own** custom property, with the real
 * CSS property composed once outside the animation?
 *
 * Jumi today does the first half already: `--jumi-scale` is a composition of three slots,
 * `--jumi-scale-x/-y/-z`, declared once on the element, and a constituent phrase writes a per-frame
 * slot (`--jumi-scale-x-<id>-0: 1`). What it does *not* do is let the keyframe write the
 * **element-level** slot. Instead every keyframe re-composes the **real property** per frame, reading
 * its own leaves and falling back to the element level for the rest:
 *
 *   @keyframes jumi-scale-1vrwYB {
 *     0%   { scale: var(--jumi-scale-x-1vrwYB-0, var(--jumi-scale-x)) var(--jumi-scale-y-1vrwYB-0, var(--jumi-scale-y)) var(--jumi-scale-z-1vrwYB-0, var(--jumi-scale-z)); }
 *     100% { … }
 *   }
 *
 * The proposal is to stop there:
 *
 *   @keyframes jumi-scale-x-abc { 0% { --jumi-scale-x: 1 } 100% { --jumi-scale-x: 0 } }
 *
 * and let `scale: var(--jumi-scale-x) var(--jumi-scale-y) var(--jumi-scale-z)` pick it up.
 *
 * Three things decide whether that is possible, and none of them is a matter of opinion:
 *
 *   1. A custom property interpolates only if it is **registered** with a typed `syntax`. Jumi
 *      registers `--jumi-<attr>-<id>-animation-name` and `--jumi-slot-…` with `syntax: "*"` — the
 *      permissive syntax, which is deliberately *not* interpolable. So the whole proposal rests on
 *      adding typed registrations for the constituent slots. §1 measures each shape against the other.
 *   2. A typed registration **requires** `initial-value`, and a registered property always has a
 *      computed value. So `var(--x, fallback)` may never reach its fallback — and Jumi's addressing
 *      idiom *is* `var(--x, fallback)`: every frame read, every slot read, the whole chain. §1b and
 *      §8 measure which reads survive a registration and which die.
 *   3. A slot whose value is a **function** (`--jumi-filter-blur: blur(0)`) cannot hold a typed
 *      scalar at all. §4 measures the failure; §4d and §10 measure the one reshape that fixes it.
 *
 * §2, §6, §7 and §9 are the parts of the CTO's inventory list that the answers above do not reach:
 * sibling timing by duration and by scroll range, a whole-property phrase and a component phrase live
 * on one element, and the values a typed slot cannot hold. §11c is the census — the slots the corpus
 * actually animates, against the syntax each one would need.
 *
 * Run: node scripts/spike-variable-animation.mjs
 */
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

import { varReferences } from './lib/var-references.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

/* ────────────────────────────────────────────────────────────────────────────
 * §1 The interpolation question, and the fallback question, and the ownership
 *    question — hand-written CSS, sampled deterministically.
 *
 * Determinism: every animated probe is `paused` with `animation-fill-mode: both`, and sampled by
 * setting a negative `animation-delay`. The animation is then read at an exact time rather than at
 * whatever time the sampler happened to arrive, which is the only way these numbers are comparable.
 * ──────────────────────────────────────────────────────────────────────────── */

const CSS = String.raw`
/* ── §1 fidelity: three shapes for one motion (scale-x: 1 → 3 over 1s) ───────── */

/* (a) today's shape: the keyframe writes the real property, composed from a frame read + a
       fallback to the element-level slot. */
.p1a { --x: 1; --y: 1; --z: 1; --xf0: 1; --xf1: 3;
  scale: var(--x) var(--y) var(--z);
  animation: p1a-k 1s linear both paused; }
@keyframes p1a-k {
  from { scale: var(--xf0, var(--x)) var(--y) var(--z); }
  to   { scale: var(--xf1, var(--x)) var(--y) var(--z); }
}

/* (b) proposed: the keyframe writes a registered typed slot; the property is composed once. */
@property --p1x { syntax: "<number>"; inherits: false; initial-value: 1; }
@property --p1y { syntax: "<number>"; inherits: false; initial-value: 1; }
@property --p1z { syntax: "<number>"; inherits: false; initial-value: 1; }
.p1b { --p1x: 1; --p1y: 1; --p1z: 1;
  scale: var(--p1x) var(--p1y) var(--p1z);
  animation: p1b-k 1s linear both paused; }
@keyframes p1b-k { from { --p1x: 1 } to { --p1x: 3 } }

/* (c) control: the same, unregistered. */
.p1c { --p1cx: 1; --p1cy: 1; --p1cz: 1;
  scale: var(--p1cx) var(--p1cy) var(--p1cz);
  animation: p1c-k 1s linear both paused; }
@keyframes p1c-k { from { --p1cx: 1 } to { --p1cx: 3 } }

/* ── §1b does a registered property reach its var() fallback? ────────────────── */

@property --p1d { syntax: "<number>"; inherits: false; initial-value: 1; }
@property --p1e { syntax: "*"; inherits: false; }
.p1d { scale: var(--p1d, 5) 1 1; }   /* typed registration, never declared */
.p1e { scale: var(--p1f, 5) 1 1; }   /* unregistered, never declared */
.p1f { scale: var(--p1e, 5) 1 1; }   /* syntax "*", no initial-value, never declared */

/* ── §2 sibling timing: two animations, 1s and 3s, on one composed property ─── */

@property --p2x { syntax: "<number>"; inherits: false; initial-value: 1; }
@property --p2y { syntax: "<number>"; inherits: false; initial-value: 1; }
@property --p2z { syntax: "<number>"; inherits: false; initial-value: 1; }

/* (a) proposed: each animation owns a variable, so the two never meet. */
.p2a { --p2x: 1; --p2y: 1; --p2z: 1;
  scale: var(--p2x) var(--p2y) var(--p2z);
  animation: p2x 1s linear both paused, p2y 3s linear both paused; }
@keyframes p2x { from { --p2x: 1 } to { --p2x: 3 } }
@keyframes p2y { from { --p2y: 1 } to { --p2y: 3 } }

/* (b) today: two animations, both writing scale. replace is the initial value. */
.p2b { scale: 1 1 1;
  animation: p2bx 1s linear both paused, p2by 3s linear both paused; }
@keyframes p2bx { from { scale: 1 1 1 } to { scale: 3 1 1 } }
@keyframes p2by { from { scale: 1 1 1 } to { scale: 1 3 1 } }

/* (c) today, with the control Jumi's docs tell the author to reach for. */
.p2c { scale: 1 1 1;
  animation: p2bx 1s linear both paused, p2by 3s linear both paused;
  animation-composition: add; }

/* (d) today, with the two animations sharing one keyframe id (identical frames — the case that
       already works, because there is only ever one @keyframes). */
.p2d { scale: 1 1 1;
  animation: p2d-k 1s linear both paused; }
@keyframes p2d-k { from { scale: 1 1 1 } to { scale: 3 3 1 } }

/* ── §3 whole property + component phrase, under registration ───────────────── */

@property --p3w { syntax: "*"; inherits: false; }   /* the whole-property slot, unregistered-typed */
@property --p3x { syntax: "<number>"; inherits: false; initial-value: 1; }
@property --p3y { syntax: "<number>"; inherits: false; initial-value: 1; }
@property --p3z { syntax: "<number>"; inherits: false; initial-value: 1; }

/* (a) whole authored as one block, component animated: the block wins wholesale. */
.p3a { --p3w: 2 2 2; --p3x: 1; --p3y: 1; --p3z: 1;
  scale: var(--p3w, var(--p3x) var(--p3y) var(--p3z));
  animation: p3-k 1s linear both paused; }
@keyframes p3-k { from { --p3x: 1 } to { --p3x: 3 } }

/* (b) the same, with no whole-property phrase present: the component is visible. */
.p3b { --p3x: 1; --p3y: 1; --p3z: 1;
  scale: var(--p3w, var(--p3x) var(--p3y) var(--p3z));
  animation: p3-k 1s linear both paused; }

/* (c) the whole slot typed as a *list*: is the three-token value one value of that syntax, so the
       wholesale phrasing could own a slot after all? */
@property --p3c { syntax: "<number>+"; inherits: false; initial-value: 1; }
.p3c { --p3c: 2 2 2;
  scale: var(--p3c, var(--p3x) var(--p3y) var(--p3z)); }

/* (d) the same list-typed slot animated from one token to three. */
@property --p3d { syntax: "<number>+"; inherits: false; initial-value: 1; }
.p3d { --p3d: 1;
  scale: var(--p3d, 1 1 1);
  animation: p3d-k 1s linear both paused; }
@keyframes p3d-k { from { --p3d: 1 } to { --p3d: 2 2 1 } }

/* ── §4 a function-valued slot: today's shape, proposed shape, reshaped proposal ── */

/* (a) today: the slot holds the function; the keyframe writes the composed filter. */
.p4a { --fb: blur(0px); --fbf0: blur(0px); --fbf1: blur(8px);
  filter: var(--fb);
  animation: p4a-k 1s linear both paused; }
@keyframes p4a-k {
  from { filter: var(--fbf0, var(--fb)); }
  to   { filter: var(--fbf1, var(--fb)); }
}

/* (b) proposed, registered permissively: the slot now animates. */
@property --p4b { syntax: "*"; inherits: false; }
.p4b { --p4b: blur(0px);
  filter: var(--p4b);
  animation: p4b-k 1s linear both paused; }
@keyframes p4b-k { from { --p4b: blur(0px) } to { --p4b: blur(8px) } }

/* (c) proposed, typed: the slot cannot hold a function at all. */
@property --p4c { syntax: "<length>"; inherits: false; initial-value: 0px; }
.p4c { --p4c: blur(0px);
  filter: var(--p4c);
  animation: p4c-k 1s linear both paused; }
@keyframes p4c-k { from { --p4c: blur(0px) } to { --p4c: blur(8px) } }

/* (d) the reshaped composition: the function is textual, the variable is its argument. */
@property --p4d { syntax: "<length>"; inherits: false; initial-value: 0px; }
.p4d { --p4d: 0px;
  filter: blur(var(--p4d));
  animation: p4d-k 1s linear both paused; }
@keyframes p4d-k { from { --p4d: 0px } to { --p4d: 8px } }

/* ── §5 keyword-valued frames: values a typed registration cannot hold ──────── */

.p5a { --r: 0deg; --rf0: 0deg; --rf1: 90deg;
  rotate: var(--r);
  animation: p5a-k 1s linear both paused; }
@keyframes p5a-k {
  from { rotate: var(--rf0, var(--r)); }
  to   { rotate: var(--rf1, var(--r)); }
}

@property --p5b { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
.p5b { --p5b: 0deg; rotate: var(--p5b);
  animation: p5b-k 1s linear both paused; }
@keyframes p5b-k { from { --p5b: 0deg } to { --p5b: 90deg } }

/* the endpoint is the keyword none, which is not an <angle> */
.p5c { --r: 0deg;
  rotate: var(--r);
  animation: p5c-k 1s linear both paused; }
@keyframes p5c-k { from { rotate: 0deg } to { rotate: none } }

/* ── §6 scroll-driven: two component animations, different ranges, one timeline ── */

@property --p6x { syntax: "<number>"; inherits: false; initial-value: 1; }
@property --p6y { syntax: "<number>"; inherits: false; initial-value: 1; }
@property --p6z { syntax: "<number>"; inherits: false; initial-value: 1; }

.p6a { --p6x: 1; --p6y: 1; --p6z: 1;
  scale: var(--p6x) var(--p6y) var(--p6z);
  animation: p6x linear both, p6y linear both;
  animation-timeline: scroll(root), scroll(root);
  animation-range: 0% 25%, 25% 100%; }
@keyframes p6x { from { --p6x: 1 } to { --p6x: 3 } }
@keyframes p6y { from { --p6y: 1 } to { --p6y: 3 } }

.p6b { scale: 1 1 1;
  animation: p6bx linear both, p6by linear both;
  animation-timeline: scroll(root), scroll(root);
  animation-range: 0% 25%, 25% 100%; }
@keyframes p6bx { from { scale: 1 1 1 } to { scale: 3 1 1 } }
@keyframes p6by { from { scale: 1 1 1 } to { scale: 1 3 1 } }

.p6c { scale: 1 1 1;
  animation: p6bx linear both, p6by linear both;
  animation-timeline: scroll(root), scroll(root);
  animation-range: 0% 25%, 25% 100%;
  animation-composition: add; }

/* ── §7 the nested case: a whole-property phrase and a component phrase, both live ── */

@property --p7x { syntax: "<number>"; inherits: false; initial-value: 1; }
@property --p7y { syntax: "<number>"; inherits: false; initial-value: 1; }
@property --p7z { syntax: "<number>"; inherits: false; initial-value: 1; }

/* the whole phrase, expanded into the three leaves it would have to write */
@keyframes p7whole {
  from { --p7x: 1; --p7y: 1; --p7z: 1 }
  to   { --p7x: 2; --p7y: 2; --p7z: 2 }
}
@keyframes p7x { from { --p7x: 1 } to { --p7x: 3 } }

/* (a) whole first in animation-name, component second */
.p7a { --p7x: 1; --p7y: 1; --p7z: 1;
  scale: var(--p7x) var(--p7y) var(--p7z);
  animation: p7whole 1s linear both paused, p7x 1s linear both paused; }

/* (b) the same two animations, the other way round */
.p7b { --p7x: 1; --p7y: 1; --p7z: 1;
  scale: var(--p7x) var(--p7y) var(--p7z);
  animation: p7x 1s linear both paused, p7whole 1s linear both paused; }

/* (c) as (a), with additive composition asked for on both */
.p7c { --p7x: 1; --p7y: 1; --p7z: 1;
  scale: var(--p7x) var(--p7y) var(--p7z);
  animation: p7whole 1s linear both paused, p7x 1s linear both paused;
  animation-composition: add, add; }

/* ── §8 what a registration does to the element-level chain ─────────────────── */

@property --p8x { syntax: "<number>"; inherits: false; initial-value: 1; }

/* (a) registered *and* authored on the element */
.p8a { --p8x: 2; scale: var(--p8x) 1 1; }
/* (b) registered, never authored: the var() fallback is dead, the initial-value answers */
.p8b { scale: var(--p8x, 7) 1 1; }
/* (c) unregistered, never authored: the fallback answers */
.p8c { scale: var(--p8nope, 7) 1 1; }
/* (d) today's leaf chain with nothing written at either level */
.p8d { scale: var(--p8nope, var(--p8also)) 1 1; }

/* ── §9 values a typed registration cannot hold ────────────────────────────── */

/* (a) the keyword none in an <angle> slot */
@property --p9r { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
.p9a { rotate: var(--p9r);
  animation: p9a-r 1s linear both paused; }
@keyframes p9a-r { from { --p9r: 0deg } to { --p9r: none } }

/* (b) <length-percentage>, the shape most layout interpolation actually has */
@property --p9w { syntax: "<length-percentage>"; inherits: false; initial-value: 0px; }
.p9b { width: var(--p9w);
  animation: p9b-w 1s linear both paused; }
@keyframes p9b-w { from { --p9w: 0px } to { --p9w: 100% } }

/* (c) an initial-value that is not computationally independent: what does the registration do? */
@property --p9c { syntax: "<color>"; inherits: false; initial-value: var(--p9seed, red); }
.p9c { --p9seed: red; color: var(--p9c);
  animation: p9c-k 1s linear both paused; }
@keyframes p9c-k { from { --p9c: red } to { --p9c: blue } }

/* (d) a list-typed slot animated from one token to two */
@property --p9l { syntax: "<length>+"; inherits: false; initial-value: 0px; }
.p9d { translate: var(--p9l);
  animation: p9d-l 1s linear both paused; }
@keyframes p9d-l { from { --p9l: 0px } to { --p9l: 30px 20px } }

/* ── §10 the reshaped function-valued composition, with sibling timing ─────── */

@property --p10blur { syntax: "<length>"; inherits: false; initial-value: 0px; }
@property --p10bright { syntax: "<number>"; inherits: false; initial-value: 1; }

/* (a) proposed for a function-valued property: the function is text, its argument is the slot */
.p10a { --p10blur: 0px; --p10bright: 1;
  filter: blur(var(--p10blur)) brightness(var(--p10bright));
  animation: p10ba 1s linear both paused, p10bb 3s linear both paused; }

/* (b) today: two phrases, each writing the composed filter in its own keyframes */
.p10b { filter: blur(0px) brightness(1);
  animation: p10ba\.today 1s linear both paused, p10bb\.today 3s linear both paused; }

@keyframes p10ba { from { --p10blur: 0px } to { --p10blur: 8px } }
@keyframes p10bb { from { --p10bright: 1 } to { --p10bright: 2 } }

@keyframes p10ba\.today { from { filter: blur(0px) brightness(1) } to { filter: blur(8px) brightness(1) } }
@keyframes p10bb\.today { from { filter: blur(0px) brightness(1) } to { filter: blur(0px) brightness(2) } }
`

const BODY = `
  <div class="p1a"></div><div class="p1b"></div><div class="p1c"></div>
  <div class="p1d"></div><div class="p1e"></div><div class="p1f"></div>
  <div class="p2a"></div><div class="p2b"></div><div class="p2c"></div><div class="p2d"></div>
  <div class="p3a"></div><div class="p3b"></div><div class="p3c"></div><div class="p3d"></div>
  <div class="p4a"></div><div class="p4b"></div><div class="p4c"></div><div class="p4d"></div>
  <div class="p5a"></div><div class="p5b"></div><div class="p5c"></div>
  <div class="p6a"></div><div class="p6b"></div><div class="p6c"></div>
  <div class="p7a"></div><div class="p7b"></div><div class="p7c"></div>
  <div class="p8a"></div><div class="p8b"></div><div class="p8c"></div><div class="p8d"></div>
  <div class="p9a"></div><div class="p9b"></div><div class="p9c"></div><div class="p9d"></div>
  <div class="p10a"></div><div class="p10b"></div>
  <div style="height: 3000px"></div>
`

const HTML = `<!doctype html><meta charset="utf-8"><style>
  div { width: 10px; height: 10px; }
  ${CSS}
</style>${BODY}`

/* ──────────────────────────────────────────────────────────────────────────── */

const browser = await chromium.launch()
const page = await browser.newPage()

await page.setContent(HTML, { waitUntil: 'load' })

const TIMES = [0, 0.25, 0.5, 0.75, 1]

/** Read one probe at one exact time: pause, step the delay, read the computed value. */
const read = (sel, prop, t, count = 1) =>
  page.$eval(
    sel,
    (el, [prop, t, count]) => {
      const delays = Array.from({ length: count }, () => `-${t}s`).join(', ')

      el.style.animationDelay = delays

      return getComputedStyle(el)[prop]
    },
    [prop, t, count],
  )

/** A fidelity row: the sampled curve of one probe. */
const curve = async (label, sel, prop, count = 1) => {
  const values = []

  for (const t of TIMES) values.push(await read(sel, prop, t, count))

  console.log(
    `  ${label.padEnd(34)} ${values
      .map(v => String(v).replace(/\s+/g, ' ').padEnd(22))
      .join('')}`,
  )

  return values
}

const header = title => console.log(`\n${'─'.repeat(74)}\n${title}\n${'─'.repeat(74)}`)

const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])

console.log(`Chromium ${browser.version()}`)

header('§1  does the keyframe interpolate the same either way?   (t = 0 → 1s)')
console.log(`  ${'shape'.padEnd(34)} ${TIMES.map(t => `${t}s`.padEnd(22)).join('')}`)

const a = await curve('(a) today: keyframe writes `scale`', '.p1a', 'scale')
const b = await curve('(b) proposed: typed registered slot', '.p1b', 'scale')
const c = await curve('(c) control: unregistered slot', '.p1c', 'scale')

console.log(`\n  today ≡ proposed              ${same(a, b)}`)
// Discrete reads as *whichever endpoint is winning*, not as a half-way value: the unregistered slot
// steps to `3 1` at a frame boundary and holds it. The expected list is the measured one.
console.log(`  unregistered is discrete      ${same(c, ['1', '1', '3 1', '3 1', '3 1'])}`)

header('§1b  does a registered property reach its var() fallback?')
console.log(
  `  typed registration, undeclared   var(--p1d, 5) → ${await page.$eval('.p1d', el => getComputedStyle(el).scale)}`,
)
console.log(
  `  unregistered, undeclared         var(--p1f, 5) → ${await page.$eval('.p1e', el => getComputedStyle(el).scale)}`,
)
console.log(
  `  syntax "*", no initial-value     var(--p1e, 5) → ${await page.$eval('.p1f', el => getComputedStyle(el).scale)}`,
)

header('§2  sibling component timing — 1s and 3s on one property')
console.log(`  ${'shape'.padEnd(34)} ${TIMES.map(t => `${t}s`.padEnd(22)).join('')}`)

await curve('(a) proposed: a variable each', '.p2a', 'scale', 2)
await curve('(b) today: two `scale` keyframes', '.p2b', 'scale', 2)
await curve('(c) today + composition: add', '.p2c', 'scale', 2)
await curve('(d) today, one shared keyframe', '.p2d', 'scale', 1)

header('§3  whole property + component phrase, under registration')
await curve('(a) whole block + component anim', '.p3a', 'scale', 1)
await curve('(b) component alone', '.p3b', 'scale', 1)
await curve('(c) whole in a <number>+ slot', '.p3c', 'scale', 1)
await curve('(d) <number>+ slot, 1 → 3 tokens', '.p3d', 'scale', 1)
// The end value, read with the animation off, so the frame's `2 2 1` is the only thing in play: the
// curve above steps to the end value rather than reaching it gradually.
console.log(
  `  → with the animation off and the slot set to \`2 2 1\`, scale reads ${await page.$eval('.p3d', el => {
    el.style.animation = 'none'
    el.style.setProperty('--p3d', '2 2 1')

    return getComputedStyle(el).scale
  })}`,
)

header('§4  a function-valued slot  (--jumi-filter-blur: blur(0px) → blur(8px))')
console.log(`  ${'shape'.padEnd(34)} ${TIMES.map(t => `${t}s`.padEnd(22)).join('')}`)

await curve('(a) today: composed `filter`', '.p4a', 'filter')
await curve('(b) proposed: syntax "*" slot', '.p4b', 'filter')
await curve('(c) proposed: <length> slot', '.p4c', 'filter')
await curve('(d) reshaped: blur(var(<length>))', '.p4d', 'filter')

header('§5  keyword-valued frames')
await curve('(a) today: composed `rotate`', '.p5a', 'rotate')
await curve('(b) proposed: <angle> slot', '.p5b', 'rotate')
await curve('(c) today: 0deg → `none`', '.p5c', 'rotate')

header('§6  scroll-driven sibling ranges (one scroll timeline, two ranges)')
const maxScroll = await page.evaluate(() => {
  window.scrollTo(0, 99999)

  const max = window.scrollY

  window.scrollTo(0, 0)

  return max
})

const SCROLLS = [0, 0.125, 0.25, 0.5, 1].map(f => f * maxScroll)

console.log(`  scroll range 0 … ${maxScroll}px`)
console.log(`  ${'shape'.padEnd(34)} ${SCROLLS.map(s => `${Math.round(s)}px`.padEnd(22)).join('')}`)

const scrollCurve = async (label, sel, prop, count) => {
  const values = []

  for (const y of SCROLLS) {
    await page.evaluate(y => window.scrollTo(0, y), y)

    await page.evaluate(
      () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))),
    )

    values.push(await page.$eval(sel, (el, prop) => getComputedStyle(el)[prop], prop))
  }

  console.log(
    `  ${label.padEnd(34)} ${values
      .map(v => String(v).replace(/\s+/g, ' ').padEnd(22))
      .join('')}`,
  )

  return values
}

await scrollCurve('(a) proposed: a variable each', '.p6a', 'scale', 2)
await scrollCurve('(b) today: two `scale` keyframes', '.p6b', 'scale', 2)
await scrollCurve('(c) today + composition: add', '.p6c', 'scale', 2)

header('§7  a whole-property phrase and a component phrase on one property')
console.log(`  whole: --p7x/y/z 1 → 2.  component: --p7x 1 → 3.  both 1s linear.`)
console.log(`  ${'shape'.padEnd(34)} ${TIMES.map(t => `${t}s`.padEnd(22)).join('')}`)

await curve('(a) whole listed first', '.p7a', 'scale', 1)
await curve('(b) component listed first', '.p7b', 'scale', 1)
await curve('(c) both, composition: add', '.p7c', 'scale', 1)

header('§8  registration against the element-level chain')
console.log(
  `  (a) registered, authored \`--p8x: 2\`      var(--p8x)      → ${await page.$eval('.p8a', el => getComputedStyle(el).scale)}`,
)
console.log(
  `  (b) registered, never authored        var(--p8x, 7)   → ${await page.$eval('.p8b', el => getComputedStyle(el).scale)}`,
)
console.log(
  `  (c) unregistered, never authored      var(--nope, 7)  → ${await page.$eval('.p8c', el => getComputedStyle(el).scale)}`,
)
console.log(
  `  (d) neither level written (today)     var(--a, var(--b)) → ${await page.$eval('.p8d', el => getComputedStyle(el).scale)}`,
)

header('§9  values a typed registration cannot hold')
console.log(`  ${'shape'.padEnd(34)} ${TIMES.map(t => `${t}s`.padEnd(22)).join('')}`)

await curve('(a) <angle> slot, to `none`', '.p9a', 'rotate')
await curve('(b) <length-percentage> slot', '.p9b', 'width')
await curve('(c) initial-value: var()', '.p9c', 'color')
await curve('(d) <length>+ slot, 1 → 2 tokens', '.p9d', 'translate')

header('§10 the reshaped function-valued composition (blur 1s, brightness 3s)')
console.log(`  ${'shape'.padEnd(34)} ${TIMES.map(t => `${t}s`.padEnd(22)).join('')}`)

await curve('(a) blur(var(--amount)), a slot each', '.p10a', 'filter', 2)
await curve('(b) today: both write `filter`', '.p10b', 'filter', 2)

await page.evaluate(() => window.scrollTo(0, 0))
await browser.close()

/* ────────────────────────────────────────────────────────────────────────────
 * §11 What the surface would have to register, and what would disappear.
 *
 * No browser here: this reads the tree. Both halves are answered against artifacts the gates already
 * trust — `src/variables/property.ts` for the slots a phrase can fill, and the canonical render
 * (`scripts/css-snapshot/snapshot.css`) for what a build emits today. Bytes are of that unminified
 * render, which is the only one a reader can inspect; minification changes the ratio, not the sign.
 * ──────────────────────────────────────────────────────────────────────────── */

header('§11  the inventory a typed registration would have to cover')

const propertySource = fs.readFileSync(path.join(root, 'src/variables/property.ts'), 'utf8')

/** One entry of the property table: what it is called, whether it is a whole, and its value's shape. */
const readSlots = () => {
  const entries = [...propertySource.matchAll(/\n {2}'([^']+)': \{\n/g)]

  return entries.map((entry, index) => {
    const block = propertySource.slice(
      entry.index,
      entries[index + 1]?.index ?? propertySource.length,
    )

    // `value:` runs to the end of its expression, which may carry commas of its own
    // (`css('blur', '0')`), so it is read by balancing parentheses rather than splitting on text.
    const at = block.indexOf('value: ')
    let value = ''
    let depth = 0

    for (let i = at + 7; at >= 0 && i < block.length; i += 1) {
      const char = block[i]

      if (char === '(') depth += 1
      if (char === ')') depth -= 1
      if (depth === 0 && (char === ',' || char === '\n')) break

      value += char
    }

    value = value.trim()

    return {
      composite: /dependencies: \[/.test(block),
      // The leaves a whole names. Read as text, because the list is the only place the relationship is
      // written down.
      deps: [...(block.match(/dependencies: \[([^]*?)\]/)?.[1] ?? '').matchAll(/'([\w-]+)'/g)].map(
        match => match[1],
      ),
      name: block.match(/variable: '(--jumi-[\w-]+)'/)?.[1],
      shape: value.startsWith('css(') ? 'function' : /^['"]/.test(value) ? 'scalar' : 'named',
    }
  })
}

const slots = readSlots().filter(slot => slot.name)
const leaves = slots.filter(slot => !slot.composite)
const shaped = shape => leaves.filter(slot => slot.shape === shape).map(slot => slot.name.slice(7))
const functionShaped = new Set(shaped('function'))

/**
 * The shape a slot's registered syntax would need, which is not the same question as its value's
 * shape: a whole composes whichever shapes its leaves have, and `transform` composes functions.
 */
const shapeOf = name => {
  const slot = slots.find(candidate => candidate.name === `--jumi-${name}`)

  if (!slot) return '—'
  if (!slot.composite) return slot.shape

  return slot.deps.some(dep => functionShaped.has(dep)) ? 'function' : 'scalar'
}

console.log(`  entries in the property table             ${slots.length}`)
console.log(`  composites — they name the leaves         ${slots.length - leaves.length}`)
console.log(`  leaves                                    ${leaves.length}`)
console.log(`    · scalar-shaped, a bare literal         ${shaped('scalar').length}`)
console.log(`    · function-shaped, \`css('f', …)\`         ${shaped('function').length}`)
console.log(`    · neither                               ${shaped('named').length}`)
console.log(`\n  the function-shaped leaves — the ones a typed slot cannot hold:`)
console.log(`  ${shaped('function').join(' ')}`)

header('§11b  what a build emits today, and what the same frames would become')

const snapshot = fs.readFileSync(path.join(root, 'scripts/css-snapshot/snapshot.css'), 'utf8')

/** Every declaration in the render, by name. No value in this file carries a `;` of its own. */
const declared = new Map(
  [...snapshot.matchAll(/(--jumi-[\w-]+):\s*([^;{}]*);/g)].map(match => [
    match[1],
    match[2].trim(),
  ]),
)

const blocks = [...snapshot.matchAll(/@keyframes ([\w\\.-]+) \{([^]*?)\n\}/g)]

/**
 * Which instance each `@keyframes` name belongs to.
 *
 * The name is `jumi-<attribute>-<hash>` and the per-frame keys are `--jumi-<slot>-<hash>-<offset>` —
 * the hash alone, not the whole name — so the pairing has to be read off the writer rule that
 * activates the animation rather than assumed from the name's shape. `jumi-fade-in` has no writer
 * rule of this shape, and correctly drops out: an effect has no composition to decompose.
 */
const instances = new Map(
  [...snapshot.matchAll(/--jumi-([\w-]+?)-([\w]{3,8})-animation-name:\s*jumi-([\w-]+);/g)].map(
    match => [`jumi-${match[3]}`, { attribute: match[1], hash: match[2] }],
  ),
)

let frames = 0
let frameBytes = 0
let reads = 0
let restated = 0
let keyBytes = 0
let measurable = 0
let decomposed = 0
const animated = new Map()

for (const block of blocks) {
  const instance = instances.get(block[1])

  for (const frame of block[2].matchAll(/\n\s+([\w%.]+) \{\n([^]*?)\n\s+\}/g)) {
    // A frame is named `0%` and its per-frame keys carry the number alone: `--jumi-<slot>-<hash>-0`.
    const offset = frame[1].replace('%', '')
    const declaration = frame[2].trim()
    const value = declaration.slice(declaration.indexOf(':') + 1).trim()

    frames += 1
    frameBytes += declaration.length
    reads += varReferences(value).length

    if (!instance) continue

    // The frame's own keys: the reads whose name carries this instance and this offset. A key with no
    // declaration is a hook nothing wrote, which is the case the model deletes rather than restates.
    const suffix = `-${instance.hash}-${offset}`
    const keys = varReferences(value)
      .map(reference => reference.name)
      .filter(name => name.endsWith(suffix))
      .filter(name => declared.has(name))

    measurable += keys.length > 0 ? 1 : 0

    for (const key of keys) {
      const slot = key.slice(7, key.length - suffix.length)

      keyBytes += `${key}: ${declared.get(key)};`.length
      restated += `--jumi-${slot}: ${declared.get(key)};`.length
      animated.set(slot, shapeOf(slot))

      // A key named for the whole attribute is the wholesale frame value, and the model cannot
      // assign it to a typed slot when the composition is a chain of functions: `blur(8px)` is not a
      // `<length>`. Those frames are the ones that would need the value decomposed at compile time.
      if (slot === instance.attribute && shapeOf(slot) === 'function') decomposed += 1
    }
  }
}

/* The registrations the model adds: one per slot the corpus animates, globally, not per phrase. */
const REGISTRATION = 74 // `@property --jumi-… { syntax: <type>; inherits: false; initial-value: … }`
const typed = [...animated.keys()].filter(name => shapeOf(name) !== 'function')

console.log(`  @keyframes blocks                        ${blocks.length}`)
console.log(`  → belonging to a phrase (an instance)    ${[...blocks].filter(block => instances.has(block[1])).length}`)
console.log(`  frame declarations                       ${frames}`)
console.log(`  \`var()\` reads inside those frames        ${reads}`)
console.log(`  bytes of the frame declarations          ${frameBytes}`)
console.log(`  per-frame keys published beside them     ${animated.size} slots, ${keyBytes} bytes`)
console.log(`\n  the same frames restated as slot assignments:`)
console.log(`    frames holding a restatable value      ${measurable} of ${frames}`)
console.log(`    assignments needing decomposition      ${decomposed}`)
console.log(`    bytes                                  ${restated}`)
console.log(`\n  the model also adds one registration per animated slot:`)
console.log(`    ${typed.length} slots × ~${REGISTRATION} bytes  ${typed.length * REGISTRATION} bytes`)
console.log(`\n  today, frames + published keys            ${frameBytes + keyBytes} bytes`)
console.log(`  proposed, frames + registrations          ${restated + typed.length * REGISTRATION} bytes`)

header('§11c  the slots the corpus actually animates, against the shape they would need')

const animatedNames = [...animated.keys()].sort()
const ofShape = shape => animatedNames.filter(name => shapeOf(name) === shape)

console.log(`  animated slots                            ${animatedNames.length}`)
console.log(`    · scalar-shaped, registerable as they are ${ofShape('scalar').length}`)
console.log(`    · function-shaped, need the reshape       ${ofShape('function').length}`)
console.log(`    · neither                                 ${ofShape('—').length}`)
console.log(`\n  ${animatedNames.join(' ')}`)

if (ofShape('function').length > 0) {
  console.log(`\n  needing the reshape: ${ofShape('function').join(' ')}`)
}
