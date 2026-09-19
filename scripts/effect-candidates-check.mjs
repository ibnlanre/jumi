#!/usr/bin/env node
/** Promotion/regression checks: real Jumi emission, independent native references, three browsers.
 * Run after bundling, or let ensureBundle build. An engine the host cannot launch is skipped **by name**
 * and reported — its assertions are not counted — and at least two engines must run for the check to mean
 * anything. JUMI_WEBKIT_MODULE may name an explicitly recorded compatible Playwright installation when
 * the host cannot launch the pinned WebKit build.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
import { chromium, firefox, webkit } from 'playwright'

import { ensureBundle } from './bundle.mjs'

import path from 'node:path'
import postcss from 'postcss'

ensureBundle()
const { build, compiler, root } = await import('./lib/compile.mjs')
const names = [
  'radial-wipe-in',
  'radial-wipe-out',
  'blinds-in-x',
  'blinds-out-x',
  'blinds-in-y',
  'blinds-out-y',
  'hinge-drop',
]
const feather = {
  x: 'animate-mask-position-[0:100%_0%|100:0%_0%]',
  y: 'animate-mask-position-[0:0%_100%|100:0%_0%]',
}
const strokeCases = [
  {
    className: 'animate-stroke-dashoffset-[0]',
    from: '10',
    property: 'stroke-dashoffset',
    to: '0',
  },
  {
    className: '-animate-stroke-dashoffset-[8px]',
    from: '0px',
    property: 'stroke-dashoffset',
    to: '-8px',
  },
  {
    className: 'animate-stroke-dashoffset-[20%]',
    from: '0%',
    property: 'stroke-dashoffset',
    to: '20%',
  },
  {
    className: 'animate-stroke-dasharray-[1]',
    from: '4',
    property: 'stroke-dasharray',
    to: '1',
  },
  {
    className: 'animate-stroke-dasharray-[10_6]',
    from: '2 4',
    property: 'stroke-dasharray',
    to: '10 6',
  },
  {
    className: 'animate-stroke-dasharray-[10px,6px]',
    from: '2px 4px',
    property: 'stroke-dasharray',
    to: '10px 6px',
  },
  {
    className: 'animate-stroke-dasharray-[10%_6%]',
    from: '2% 4%',
    property: 'stroke-dasharray',
    to: '10% 6%',
  },
  {
    className: 'animate-stroke-dasharray-[10_6_8]',
    from: '2 4',
    property: 'stroke-dasharray',
    to: '10 6 8',
  },
  {
    className: 'animate-stroke-dashoffset-[0:10|40:4|100:0]/trace',
    from: '10',
    middle: '4',
    property: 'stroke-dashoffset',
    to: '0',
  },
  {
    className: 'animate-stroke-dasharray-[0:2_4|40:4_8|100:10_6]/trace',
    from: '2 4',
    middle: '4 8',
    property: 'stroke-dasharray',
    to: '10 6',
  },
]
const recipe =
  'animate-swing/attached animation-duration-[700ms]/attached animation-fill-mode-none/attached animate-fall-up/release animation-direction-reverse/release animation-delay-[700ms]/release animation-duration-[300ms]/release animation-fill-mode-forwards/release'
const candidates = [
  ...names.flatMap(n => ['animate-' + n, 'motion-safe:animate-' + n]),
  ...Object.values(feather),
  ...Object.values(feather).map(c => 'motion-safe:' + c),
  ...strokeCases.map(c => c.className),
  ...recipe.split(' '),
  'animation-duration-[1000ms]',
  'animation-timing-function-linear',
  'animation-duration-[2000ms]/trace',
  'animation-delay-[100ms]/trace',
  'animation-timing-function-linear/trace',
  'animate-opacity-[0:0|100:1]/other',
  'animation-duration-[4000ms]/other',
  'motion-reduce:opacity-0',
]
const instance = await compiler(
  `@import "tailwindcss" source(none);\n@plugin "${root}/dist/index.js";`,
  root,
)
const emitted = build(instance, candidates)
if (emitted.warnings.length) throw Error(emitted.warnings.join('\n'))
const css = emitted.css
const out =
  process.env.JUMI_EFFECT_ARTIFACTS ??
  path.join(tmpdir(), 'jumi-effect-candidates')
mkdirSync(out, { recursive: true })
const checks = [],
  observations = [],
  versions = {}
function check(label, pass, detail) {
  checks.push({ detail, label, pass })
  if (!pass) console.error('FAIL', label, JSON.stringify(detail))
}
const emittedNames = [],
  parsed = postcss.parse(css)
parsed.walkAtRules('keyframes', r => emittedNames.push(r.params))
check(
  'every promoted effect emits exactly one definition',
  names.every(n => emittedNames.filter(k => k === 'jumi-' + n).length === 1),
  emittedNames.filter(n => names.includes(n.slice(5))),
)
for (const name of names) {
  const allowed =
    name === 'hinge-drop'
      ? [
          'transform',
          'transform-origin',
          'opacity',
          'animation-timing-function',
        ]
      : ['clip-path']
  const owned = new Set()
  parsed.walkAtRules('keyframes', rule => {
    if (rule.params === 'jumi-' + name) rule.walkDecls(d => owned.add(d.prop))
  })
  check(
    'property ownership: ' + name,
    owned.size > 0 && [...owned].every(p => allowed.includes(p)),
    [...owned],
  )
}
const drivers = {
  chromium,
  firefox,
  webkit: process.env.JUMI_WEBKIT_MODULE
    ? (await import(pathToFileURL(process.env.JUMI_WEBKIT_MODULE).href)).webkit
    : webkit,
}

async function capture(page, clip) {
  const a = await page.screenshot({ clip })
  await page.evaluate(() => {
    document.querySelector('#subject').style.visibility = 'hidden'
    document.querySelector('#reference').style.visibility = 'visible'
  })
  const b = await page.screenshot({ clip })
  return { a, b, diff: await pixels(page, a, b) }
}
// Pixel comparison permits differences only near native-reference raster edges. A three-device-pixel
// neighborhood accounts for CSS polygon versus SVG mask rasterization. Interior differences (including
// seams at the fully visible endpoint) must remain zero. Raw error is retained rather than hidden.
async function pixels(page, a, b) {
  return page.evaluate(
    async ({ a, b }) => {
      const read = async data => {
        const im = await createImageBitmap(
          await (await fetch('data:image/png;base64,' + data)).blob(),
        )
        const c = document.createElement('canvas')
        c.width = im.width
        c.height = im.height
        const x = c.getContext('2d')
        x.drawImage(im, 0, 0)
        return {
          data: x.getImageData(0, 0, im.width, im.height).data,
          h: im.height,
          w: im.width,
        }
      }
      const x = await read(a),
        y = await read(b)
      let bad = 0,
        interiorBad = 0,
        sum = 0
      for (let py = 3; py < y.h - 3; py++)
        for (let px = 3; px < y.w - 3; px++) {
          const i = (py * y.w + px) * 4
          let delta = 0
          for (let c = 0; c < 3; c++)
            delta += Math.abs(x.data[i + c] - y.data[i + c])
          sum += delta
          if (delta <= 45) continue
          bad++
          let boundary = false
          for (let dy = -3; dy <= 3 && !boundary; dy++)
            for (let dx = -3; dx <= 3; dx++) {
              const j = ((py + dy) * y.w + px + dx) * 4
              if (
                [0, 1, 2].some(
                  c => Math.abs(y.data[j + c] - y.data[i + c]) > 15,
                )
              ) {
                boundary = true
                break
              }
            }
          if (!boundary) interiorBad++
        }
      return {
        bad,
        height: y.h,
        interiorBad,
        mean: sum / (y.w * y.h * 3),
        width: y.w,
      }
    },
    { a: a.toString('base64'), b: b.toString('base64') },
  )
}
const sizes = [
  [160, 160],
  [260.5, 90.25],
  [90.25, 260.5],
]
// An engine this host cannot start is skipped **by name**, never silently: the count below is the count
// of assertions that ran, and the summary says which engine did not. Two engines are the floor — one is
// not this check, and a run that reaches it fails rather than reporting a narrower proof as the proof.
const ran = [],
  skipped = []
for (const [engine, driver] of Object.entries(drivers)) {
  let browser
  try {
    browser = await driver.launch()
    const probe = await browser.newPage()
    await probe.close()
  } catch (error) {
    if (browser) await browser.close().catch(() => {})
    const reason = String(error).split('\n')[0]
    skipped.push({ engine, reason })
    console.error(
      `\n⚠ ${engine} DID NOT RUN on this host — its assertions are absent from the count.\n` +
        `  ${reason}\n` +
        (process.env.JUMI_WEBKIT_MODULE
          ? ''
          : '  Export JUMI_WEBKIT_MODULE with a compatible Playwright installation to include it.\n'),
    )
    continue
  }
  ran.push(engine)
  versions[engine] = browser.version()
  console.log(engine, versions[engine])
  try {
    for (const dpr of [1, 1.5, 2]) {
      const page = await browser.newPage({
        deviceScaleFactor: dpr,
        reducedMotion: 'no-preference',
        viewport: { height: 700, width: 900 },
      })
      await page.setContent(
        `<style>${css}body{margin:0;background:white}#subject,#reference{position:absolute;left:50px;top:50px;background:#146ee6;color:white;box-sizing:border-box;font:16px sans-serif}#reference{visibility:hidden}svg.defs{position:absolute;width:0;height:0}</style><div id="subject">Motion</div><div id="reference">Motion</div><svg class="defs"><defs><clipPath id="reference-clip" clipPathUnits="objectBoundingBox"><path id="reference-path"/></clipPath></defs></svg>`,
      )
      for (const name of names.filter(n => n !== 'hinge-drop'))
        for (const [w, h] of sizes)
          for (const t of dpr === 1 && name.startsWith('radial')
            ? [0, 0.0625, 0.1875, 0.25, 0.5, 0.75, 1]
            : [0, 0.25, 0.5, 0.75, 1]) {
            const state = await page.evaluate(
              async ({ h, name, t, w }) => {
                const el = document.querySelector('#subject'),
                  ref = document.querySelector('#reference')
                for (const node of [el, ref]) {
                  node.style.width = w + 'px'
                  node.style.height = h + 'px'
                }
                el.style.visibility = 'visible'
                ref.style.visibility = 'hidden'
                el.className =
                  'animate-' +
                  name +
                  ' animation-duration-[1000ms] animation-timing-function-linear'
                void el.offsetWidth
                const active = el
                  .getAnimations()
                  .filter(a => a.animationName === 'jumi-' + name)
                if (active.length !== 1)
                  throw Error('not one live Jumi animation: ' + name)
                const a = active[0]
                a.pause()
                await a.ready
                a.currentTime = t * 1000
                const p = name.includes('-out') ? 1 - t : t
                let d = ''
                if (name.startsWith('radial')) {
                  const perimeter = [
                    [0.5, 0],
                    [1, 0],
                    [1, 0.5],
                    [1, 1],
                    [0.5, 1],
                    [0, 1],
                    [0, 0.5],
                    [0, 0],
                    [0.5, 0],
                  ]
                  const q = p * 8,
                    k = Math.min(7, Math.floor(q)),
                    fraction = q - k
                  const point = perimeter[k].map(
                    (v, i) => v + (perimeter[k + 1][i] - v) * fraction,
                  )
                  d =
                    'M .5 .5 L ' +
                    perimeter
                      .slice(0, k + 1)
                      .concat([point])
                      .map(x => x.join(' '))
                      .join(' L ') +
                    ' Z'
                } else
                  for (let i = 0; i < 5; i++) {
                    const span = p / 5,
                      start = i / 5
                    d += name.endsWith('-x')
                      ? `M ${start} 0 h ${span} v 1 h ${-span} Z `
                      : `M 0 ${start} h 1 v ${span} h -1 Z `
                  }
                document.querySelector('#reference-path').setAttribute('d', d)
                ref.style.clipPath = 'url(#reference-clip)'
                const c = getComputedStyle(el)
                return {
                  animations: active.length,
                  clip: c.clipPath,
                  opacity: c.opacity,
                  progress: a.effect.getComputedTiming().progress,
                  transform: c.transform,
                }
              },
              { h, name, t, w },
            )
            const images = await capture(page, {
              height: Math.ceil(h) + 2,
              width: Math.ceil(w) + 2,
              x: 49,
              y: 49,
            })
            const label = `${engine}/${dpr}/${name}/${w}x${h}/${t}`
            check(
              label,
              images.diff.interiorBad === 0 &&
                state.transform === 'none' &&
                state.opacity === '1' &&
                Math.abs(state.progress - t) < 0.001,
              { ...images.diff, state },
            )
            observations.push({ label, ...images.diff, state })
            if (dpr === 1 && w === 160 && t === 0.5)
              writeFileSync(
                path.join(out, engine + '-' + name + '.png'),
                images.a,
              )
            if (!checks.at(-1).pass) {
              writeFileSync(
                path.join(out, label.replaceAll('/', '-') + '-actual.png'),
                images.a,
              )
              writeFileSync(
                path.join(out, label.replaceAll('/', '-') + '-reference.png'),
                images.b,
              )
            }
          }
      console.log(engine, 'geometry DPR', dpr, 'complete')
      await page.close()
    }
    // Feather recipe: Jumi moves a static alpha mask; reference directly positions the feather stops.
    const page = await browser.newPage({
      reducedMotion: 'no-preference',
      viewport: { height: 700, width: 900 },
    })
    await page.setContent(
      `<style>${css}body{margin:0;background:white}#subject,#reference{position:absolute;left:50px;top:50px;width:260px;height:100px;background:linear-gradient(45deg,#146ee6,#ad34d5);color:white;font:24px sans-serif}#reference{visibility:hidden}</style><div id="subject">Crisp text & imagery</div><div id="reference">Crisp text & imagery</div>`,
    )
    for (const axis of ['x', 'y'])
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        const active = await page.evaluate(
          async ({ axis, className, t }) => {
            const el = document.querySelector('#subject'),
              ref = document.querySelector('#reference')
            el.style.visibility = 'visible'
            ref.style.visibility = 'hidden'
            el.style.maskImage = `linear-gradient(${axis === 'x' ? '90deg' : '180deg'},#000 45.454545%,transparent 54.545455%)`
            el.style.maskSize = axis === 'x' ? '220% 100%' : '100% 220%'
            el.style.maskRepeat = 'no-repeat'
            el.className =
              className +
              ' animation-duration-[1000ms] animation-timing-function-linear'
            const a = el.getAnimations()
            if (a.length !== 1) throw Error('feather recipe is not live')
            a[0].pause()
            await a[0].ready
            a[0].currentTime = t * 1000
            ref.style.maskImage = `linear-gradient(${axis === 'x' ? '90deg' : '180deg'},#000 ${120 * t - 20}%,transparent ${120 * t}%)`
            return getComputedStyle(el).maskPosition
          },
          { axis, className: feather[axis], t },
        )
        const im = await capture(page, {
          height: 100,
          width: 260,
          x: 50,
          y: 50,
        })
        check(
          `${engine}/feather/${axis}/${t}`,
          im.diff.mean < 1 && im.diff.interiorBad === 0,
          { active, diff: im.diff },
        )
        observations.push({ axis, engine, kind: 'feather', t, ...im.diff })
      }
    // Hinge reference uses native individual rotate/translate rather than the effect's transform list.
    for (const [kind, w, h] of [
      ['card', 180, 130],
      ['toast', 300, 64],
      ['illustration', 100, 100],
    ]) {
      const data = await page.evaluate(
        async ({ h, kind, w }) => {
          const el = document.querySelector('#subject'),
            ref = document.querySelector('#reference')
          for (const node of [el, ref]) {
            node.style.maskImage = 'none'
            node.style.width = w + 'px'
            node.style.height = h + 'px'
            node.style.removeProperty('transform-origin')
            node.textContent = kind
          }
          el.className = 'animate-hinge-drop animation-duration-[1000ms]'
          ref.style.visibility = 'visible'
          ref.style.transformOrigin = 'top left'
          const a = el
            .getAnimations()
            .find(a => a.animationName === 'jumi-hinge-drop')
          if (!a) throw Error('hinge not live')
          a.pause()
          await a.ready
          const b = ref.animate(
            [
              {
                easing: 'ease-out',
                offset: 0,
                opacity: 1,
                rotate: '0deg',
                translate: '0 0',
              },
              {
                easing: 'ease-in-out',
                offset: 0.25,
                opacity: 1,
                rotate: '60deg',
                translate: '0 0',
              },
              {
                easing: 'ease-in-out',
                offset: 0.45,
                opacity: 1,
                rotate: '40deg',
                translate: '0 0',
              },
              {
                easing: 'ease-in-out',
                offset: 0.6,
                opacity: 1,
                rotate: '55deg',
                translate: '0 0',
              },
              {
                easing: 'ease-in',
                offset: 0.7,
                opacity: 1,
                rotate: '50deg',
                translate: '0 0',
              },
              {
                offset: 1,
                opacity: 0,
                rotate: '65deg',
                translate: `0 ${h * 1.2}px`,
              },
            ],
            { duration: 1000, fill: 'both' },
          )
          b.pause()
          await b.ready
          const samples = []
          for (const t of [0, 0.25, 0.45, 0.6, 0.699, 0.7, 0.701, 0.75, 1]) {
            a.currentTime = b.currentTime = t * 1000
            const c = getComputedStyle(el),
              d = getComputedStyle(ref),
              m = new DOMMatrix(c.transform),
              x = el.getBoundingClientRect(),
              y = ref.getBoundingClientRect()
            samples.push({
              error: Math.max(
                ...['x', 'y', 'width', 'height'].map(k =>
                  Math.abs(x[k] - y[k]),
                ),
              ),
              opacity: Math.abs(+c.opacity - +d.opacity),
              t,
              translate: [m.e, m.f],
            })
          }
          b.cancel()
          return samples
        },
        { h, kind, w },
      )
      check(
        `${engine}/hinge/${kind}`,
        data.every(
          s =>
            s.error < 0.06 &&
            s.opacity < 0.001 &&
            (s.t > 0.7 ||
              Math.abs(s.translate[0]) + Math.abs(s.translate[1]) < 0.001),
        ),
        data,
      )
      for (const t of [0.25, 0.7, 0.85]) {
        await page.evaluate(t => {
          const el = document.querySelector('#subject')
          el.style.visibility = 'visible'
          document.querySelector('#reference').style.visibility = 'hidden'
          el
            .getAnimations()
            .find(a => a.animationName === 'jumi-hinge-drop').currentTime =
            t * 1000
        }, t)
        await page.screenshot({
          clip: { height: 450, width: 450, x: 0, y: 0 },
          path: path.join(out, `${engine}-hinge-${kind}-${t}.png`),
        })
      }
      const release = data.filter(s => s.t >= 0.699 && s.t <= 0.701)
      check(
        `${engine}/hinge/release-continuity/${kind}`,
        Math.abs(release[2].translate[1] - release[0].translate[1]) < 0.1,
        release,
      )
      observations.push({ engine, kind, samples: data })
    }
    // Compare the proposed sequence with an honest existing swing → reverse fall recipe.
    const comparison = await page.evaluate(async recipe => {
      const el = document.querySelector('#subject')
      el.className = recipe + ' animation-timing-function-linear'
      const a = el.getAnimations()
      if (a.length !== 2) throw Error('existing composition not live')
      for (const x of a) {
        x.pause()
        await x.ready
        x.currentTime = 699
      }
      return { count: a.length, transform: getComputedStyle(el).transform }
    }, recipe)
    check(
      `${engine}/hinge/existing-composition`,
      comparison.count === 2,
      comparison,
    )
    observations.push({ engine, kind: 'existing-composition', ...comparison })
    // SVG properties: compare with independent native animation, including list repetition and percentages.
    await page.setContent(
      `<style>${css}</style><svg width="240" height="120" viewBox="0 0 240 120"><path id="subject" d="M10 30 H220" fill="none" stroke="blue" stroke-width="8"/><path id="reference" d="M10 60 H220" fill="none" stroke="blue" stroke-width="8"/></svg>`,
    )
    for (const spec of strokeCases) {
      const sample = await page.evaluate(async spec => {
        const el = document.querySelector('#subject'),
          ref = document.querySelector('#reference')
        for (const node of [el, ref]) {
          node.removeAttribute('style')
          node.style.setProperty(spec.property, spec.from)
        }
        el.setAttribute(
          'class',
          spec.className +
            ' animation-duration-[1000ms] animation-timing-function-linear' +
            (spec.middle
              ? ' animation-duration-[2000ms]/trace animation-delay-[100ms]/trace animation-timing-function-linear/trace animate-opacity-[0:0|100:1]/other animation-duration-[4000ms]/other'
              : ''),
        )
        const all = el.getAnimations()
        const a = all.find(a => a.animationName.includes(spec.property))
        if (!a)
          throw Error('SVG property route did not activate: ' + spec.className)
        for (const x of all) {
          x.pause()
          await x.ready
        }
        const prop = spec.property.replace(/-([a-z])/g, (_, c) =>
          c.toUpperCase(),
        )
        const frames = [
          { offset: 0, [prop]: spec.from },
          ...(spec.middle ? [{ offset: 0.4, [prop]: spec.middle }] : []),
          { offset: 1, [prop]: spec.to },
        ]
        const b = ref.animate(frames, {
          duration: 1000,
          easing: 'linear',
          fill: 'both',
        })
        b.pause()
        await b.ready
        const samples = []
        for (const t of [0, 0.25, 0.4, 0.5, 0.75, 1]) {
          a.currentTime =
            (spec.middle ? 100 : 0) + t * (spec.middle ? 2000 : 1000)
          b.currentTime = t * 1000
          samples.push({
            actual: getComputedStyle(el).getPropertyValue(spec.property),
            native: getComputedStyle(ref).getPropertyValue(spec.property),
            t,
          })
        }
        b.cancel()
        return {
          count: all.length,
          samples,
          timings: all.map(a => a.effect.getTiming()),
        }
      }, spec)
      const equal = sample.samples.every(s => s.actual === s.native)
      const moves = new Set(sample.samples.map(s => s.actual)).size > 1
      check(
        `${engine}/stroke/${spec.className}`,
        equal &&
          moves &&
          sample.count === (spec.middle ? 2 : 1) &&
          (!spec.middle ||
            sample.timings.some(t => t.duration === 2000 && t.delay === 100)),
        sample,
      )
      observations.push({
        className: spec.className,
        engine,
        kind: 'stroke',
        ...sample,
      })
    }
    // Public reduced-motion usage: entries rest visibly; exits can use an explicit static hidden state.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const name of names) {
      await page.setContent(
        `<style>${css}</style><div id="subject" class="motion-safe:animate-${name}${name.includes('-out') || name === 'hinge-drop' ? ' motion-reduce:opacity-0' : ''}">Content</div>`,
      )
      const state = await page.evaluate(() => {
        const el = document.querySelector('#subject'),
          s = getComputedStyle(el)
        return {
          clip: s.clipPath,
          live: el.getAnimations().length,
          opacity: s.opacity,
          transform: s.transform,
        }
      })
      check(
        `${engine}/reduced/${name}`,
        state.live === 0 &&
          state.opacity ===
            (name.includes('-out') || name === 'hinge-drop' ? '0' : '1') &&
          state.clip === 'none' &&
          state.transform === 'none',
        state,
      )
    }
    for (const axis of ['x', 'y']) {
      await page.setContent(
        `<style>${css}@media(prefers-reduced-motion:no-preference){#subject{mask-image:linear-gradient(90deg,#000,transparent);mask-repeat:no-repeat}}</style><div id="subject" class="motion-safe:${feather[axis]}">Visible content</div>`,
      )
      const state = await page.evaluate(() => {
        const el = document.querySelector('#subject')
        return {
          live: el.getAnimations().length,
          mask: getComputedStyle(el).maskImage,
        }
      })
      check(
        `${engine}/reduced/feather/${axis}`,
        state.live === 0 && state.mask === 'none',
        state,
      )
    }
    await page.close()
  } finally {
    await browser.close()
  }
}
const result = {
  engines: { ran, skipped },
  failures: checks.filter(c => !c.pass),
  mode: 'shipped',
  observations,
  passed: checks.filter(c => c.pass).length,
  total: checks.length,
  versions,
  webkitModule: process.env.JUMI_WEBKIT_MODULE ?? 'project playwright',
}
writeFileSync(
  path.join(out, 'results.json'),
  JSON.stringify(result, null, 2) + '\n',
)
console.log(
  `${result.passed}/${result.total} assertions in ${ran.join(' + ')}` +
    (skipped.length
      ? `; NOT RUN: ${skipped.map(entry => `${entry.engine} (${entry.reason})`).join(', ')}`
      : '') +
    `; evidence: ${out}`,
)
if (ran.length < 2)
  console.error(
    `only ${ran.length} engine(s) ran — this check needs at least two`,
  )
if (result.failures.length || ran.length < 2) process.exitCode = 1
