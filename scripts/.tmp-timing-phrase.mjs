#!/usr/bin/env node
/** Scratch: which of these are real candidates, so the doc's rejections cite a real property. */
import { build, compiler, root } from './lib/compile.mjs'

const CANDIDATES = [
  'animate-animation-[0:linear|100:ease-in]',
  'animate-animation-[linear]',
  'animate-background-image-[0:linear-gradient(red,blue)|100:linear-gradient(black,white)]',
  'animate-transition-timing-function-[0:linear|100:ease-in]',
  'animate-filter-[0:linear|100:blur(4px)]',
]

const css = build(
  await compiler(
    '@import "tailwindcss"; @plugin "' + root + '/dist/index.js";',
    root,
  ),
  [...CANDIDATES, 'animation-duration-1000'],
).css

for (const candidate of CANDIDATES) {
  const escaped = candidate.replace(/[:/[\]().,]/g, m => `\\${m}`)
  const present = css.includes(`.${escaped}`) || css.includes(candidate)

  console.log(
    `${present ? 'emitted ' : 'DROPPED '} ${candidate}`,
  )
}

console.log(
  '\nkeyframes of a phrase shape:',
  [...css.matchAll(/@keyframes jumi-[\w-]+/g)].map(m => m[0]).join(', ') ||
    '(none)',
)
