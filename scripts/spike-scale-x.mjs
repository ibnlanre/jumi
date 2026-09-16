#!/usr/bin/env node
/**
 * Minimal reproduction: a **constituent phrase** on a composed property.
 *
 * `animate-scale-x-[0:1|100:0]` is expected to write the per-frame constituent variables —
 * `--jumi-scale-x-<id>-0: 1`, `--jumi-scale-x-<id>-100: 0` — and the composed `scale` keyframe is
 * expected to read **those**, per frame:
 *
 *   scale: var(--jumi-scale-x-<id>-0, var(--jumi-scale-x)) var(--jumi-scale-y) var(--jumi-scale-z)
 *
 * If the frame-specific lookup is gone, both frames read the element-level `--jumi-scale-x`, resolve
 * identically, and the phrase compiles and renders the wrong thing.
 *
 * Written as a probe rather than a check because the question is "does the emission contain this",
 * not "does the suite pass" — and because a compressed claim about a compressed defect is how a
 * regression gets argued about instead of fixed. Preserved as the minimal reproduction.
 *
 *   node scripts/spike-scale-x.mjs
 */
import { compiler, finalizeCss, snapshot } from './lib/compile.mjs'

const MINIMAL = `@import 'tailwindcss' source(none);\n@plugin "../../dist/index.js";\n`

const candidates = [
  // The constituent phrase: writes per-frame `--jumi-scale-x-<id>-<offset>`.
  'animate-scale-x-[0:1|100:0]',
  // The whole-property spelling, which the study is using as a workaround: one surface, no constituents.
  'animate-scale-[0:1_1|100:0_1]',
]

const instance = await compiler(MINIMAL, snapshot)
const emitted = await instance.build(candidates)
const shipped = finalizeCss(emitted).css

/**
 * Keyframe headers, keyframe bodies, and the per-frame constituent declarations — the three things
 * that decide the question. Filtered this narrowly because the aggregate carries a `--jumi-slot-scale*`
 * line for every motion in the sheet, which would bury the answer.
 */
const FILTER =
  /@keyframes|^\s*(?:scale|scale-x|scale-y|scale-z):|^\s*--jumi-scale-(?:x|y|z)-/

const show = (label, css) => {
  console.log(`\n${label}`)

  const lines = css
    .split('\n')
    .map(line => line.trim())
    .filter(line => FILTER.test(line))

  if (!lines.length) {
    console.log('  (nothing)')

    return
  }

  for (const line of lines.slice(0, 60))
    console.log(`  ${line.length > 160 ? `${line.slice(0, 160)}…` : line}`)
}

show('EMITTED (what the model wrote, before the carriers pass)', emitted)
show('SHIPPED (after finalize)', shipped)

console.log(
  '\nWhat to read: a per-frame constituent lookup looks like\n' +
    '  scale: var(--jumi-scale-x-<id>-0, var(--jumi-scale-x)) …\n' +
    'and its absence looks like\n' +
    '  scale: var(--jumi-scale-x) var(--jumi-scale-y) var(--jumi-scale-z)\n' +
    'in a keyframe whose sibling declarations set `--jumi-scale-x-<id>-0` / `…-100`.\n',
)
