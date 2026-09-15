#!/usr/bin/env node
import { mkdir, readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { chromium } from 'playwright'

import { build, compiler, root } from './lib/compile.mjs'

/** Build docs first. This gate serves the static artifact and independently recompiles its export. */
import assert from 'node:assert/strict'
import path from 'node:path'
const dist = path.join(root, 'docs/dist')
const server = createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname,
    )
    if (pathname.endsWith('/')) pathname += 'index.html'
    const file = path.resolve(dist, '.' + pathname)
    if (!file.startsWith(dist + path.sep)) throw Error('outside root')
    const body = await readFile(file)
    res.setHeader(
      'Content-Type',
      file.endsWith('.js')
        ? 'text/javascript'
        : file.endsWith('.css')
          ? 'text/css'
          : file.endsWith('.svg')
            ? 'image/svg+xml'
            : 'text/html',
    )
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const browser = await chromium.launch()
const context = await browser.newContext({
  permissions: ['clipboard-read', 'clipboard-write'],
  viewport: { height: 1000, width: 1440 },
})
const errors = [],
  page = await context.newPage()
page.on('pageerror', e => errors.push(e.message))
let checks = 0
function check(name, value) {
  assert.ok(value, name)
  console.log('✓ ' + name)
  checks++
}
const ready = () =>
  page.waitForFunction(
    () =>
      window.__jumiStudio &&
      !window.__jumiStudio.pending &&
      !window.__jumiStudio.error,
    undefined,
    { timeout: 30000 },
  )
const value = selector =>
  page
    .frameLocator('#scene-frame')
    .locator(selector)
    .evaluate(el => getComputedStyle(el).opacity)
const seek = async time => {
  await page.locator('#playhead-scrub').evaluate((el, t) => {
    el.value = String(t)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }, time)
}
const control = async (name, value) => {
  await page.locator('button[data-inspector=motion]').click()
  const el = page.locator('[data-control="' + name + '"]')
  await el.fill(String(value))
  await el.dispatchEvent('change')
  await ready()
}
try {
  await page.goto('http://127.0.0.1:' + server.address().port + '/studio/')
  await ready()
  check(
    'workspace fills viewport',
    await page.evaluate(
      () =>
        document.querySelector('#studio-app').getBoundingClientRect().height ===
          innerHeight && document.documentElement.scrollHeight === innerHeight,
    ),
  )
  const canvasWidth = (await page.locator('#canvas-viewport').boundingBox())
    .width
  await page.locator('[aria-label="Toggle left dock"]').click()
  check(
    'collapsing a dock gives its space to the canvas',
    (await page.locator('#canvas-viewport').boundingBox()).width >
      canvasWidth + 100,
  )
  await page.locator('[aria-label="Toggle left dock"]').click()
  const resizer = page.locator('[data-resize=bottom]'),
    r = await resizer.boundingBox()
  await page.mouse.move(r.x + r.width / 2, r.y + 3)
  await page.mouse.down()
  await page.mouse.move(r.x + r.width / 2, r.y - 60)
  await page.mouse.up()
  check(
    'bottom dock resizes by direct manipulation',
    (await page.locator('#bottom-dock').boundingBox()).height > 320,
  )
  for (const side of ['left', 'right']) {
    const separator = page.locator('[data-resize=' + side + ']')
    const beforeSize = Number(await separator.getAttribute('aria-valuenow'))
    await separator.focus()
    await page.keyboard.press(side === 'left' ? 'ArrowRight' : 'ArrowLeft')
    check(
      side + ' dock supports keyboard resizing',
      Number(await separator.getAttribute('aria-valuenow')) > beforeSize,
    )
  }
  const canvasHeight = (await page.locator('#canvas-viewport').boundingBox())
    .height
  await page.locator('[aria-label="Toggle bottom dock"]').click()
  check(
    'collapsing bottom dock expands canvas vertically',
    (await page.locator('#canvas-viewport').boundingBox()).height >
      canvasHeight + 200,
  )
  await page.locator('[aria-label="Toggle bottom dock"]').click()
  await page.locator('[data-output=html]').click()
  check(
    'bottom tabs show one surface at a time',
    !(await page.locator('.timeline-panel').isVisible()) &&
      (await page.locator('#output-code').isVisible()),
  )
  await page.locator('[data-source="petal-4"]').click()
  check(
    'source tags select the stable Studio node',
    await page.evaluate(
      () => window.__jumiStudio.project.editor.selected[0] === 'petal-4',
    ),
  )
  await page.locator('#scene-tree [data-select="petal-2"]').click()
  check(
    'tree selection marks the corresponding source',
    (await page
      .locator('[data-source="petal-2"]')
      .getAttribute('aria-current')) === 'true',
  )
  await page.locator('[data-source="petal-4"]').hover()
  check(
    'source hover highlights the live element',
    (await page.locator('.selection-box.is-hover').count()) > 0,
  )
  await page.locator('[data-output=timeline]').click()
  check(
    'scene ruler starts at zero despite negative delays',
    (await page.locator('#playhead-scrub').getAttribute('min')) === '0',
  )
  await page.locator('#show-preroll').check()
  check(
    'negative time requires explicit pre-roll',
    Number(await page.locator('#playhead-scrub').getAttribute('min')) < 0,
  )
  await page.locator('#show-preroll').uncheck()
  check(
    'timeline groups named motion under its element',
    (await page.locator('.timeline-motion').count()) > 0,
  )
  check(
    'registry-derived inspector includes motion paths and SVG',
    await page.evaluate(
      () =>
        window.__jumiStudio.catalog.some(
          p => p.utility === 'animate-offset-distance',
        ) &&
        window.__jumiStudio.catalog.some(p => p.utility === 'animate-fill'),
    ),
  )
  await page.locator('#scene-tree [data-select="petal-1"]').click()
  check(
    'tree selection resolves the actual nested hero element',
    await page.evaluate(
      () => window.__jumiStudio.project.editor.selected[0] === 'petal-1',
    ),
  )
  await page.locator('[data-collapse="position-1"]').click()
  check(
    'tree branches collapse',
    (await page.locator('#scene-tree [data-select="petal-1"]').count()) === 0,
  )
  await page.locator('[data-collapse="position-1"]').click()
  await page.locator('[data-lock="petal-1"]').click()
  check(
    'locking is tracked independently from motion',
    await page.evaluate(() =>
      window.__jumiStudio.project.editor.locked.includes('petal-1'),
    ),
  )
  await page.locator('[data-lock="petal-1"]').click()
  const before = await page
    .frameLocator('#scene-frame')
    .locator('#petal-1')
    .evaluate(el => ({
      parent: el.parentElement.id,
      rect: el.getBoundingClientRect().toJSON(),
    }))
  await page.locator('[data-action="isolate"]').click()
  const after = await page
    .frameLocator('#scene-frame')
    .locator('#petal-1')
    .evaluate(el => ({
      parent: el.parentElement.id,
      rect: el.getBoundingClientRect().toJSON(),
    }))
  check(
    'HTML isolation preserves bounds and parent',
    JSON.stringify(before) === JSON.stringify(after),
  )
  await page.locator('button[data-left-tab=context]').click()
  await page.locator('#isolation').selectOption('none')
  await page.locator('button[data-left-tab=layers]').click()
  await page.locator('#scene-picker').selectOption('signal')
  await ready()
  await page.locator('#scene-tree [data-select="dot-a"]').click()
  await page.locator('button[data-inspector=motion]').click()
  await page.locator('#ease-search').fill('elastic')
  await page
    .locator('[data-ease-preset]')
    .filter({ hasText: 'ease-elastic' })
    .click()
  await ready()
  check(
    'Jumi easing presets serialize real CSS values',
    await page.evaluate(() =>
      window.__jumiStudio.project.tracks[0].controls.easing.includes('-0.55'),
    ),
  )
  const handle = page.locator('[data-ease-handle="0"]'),
    hb = await handle.boundingBox()
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2)
  await page.mouse.down()
  await page.mouse.move(hb.x + 20, hb.y - 15, { steps: 4 })
  await page.mouse.up()
  await ready()
  check(
    'curve handles update authored easing',
    await page.evaluate(
      () =>
        window.__jumiStudio.project.tracks[0].controls.easing !==
        'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    ),
  )
  await page.locator('button[data-inspector=element]').click()
  const origin = page.locator('[data-overlay-handle=origin]'),
    ob = await origin.boundingBox()
  await page.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2)
  await page.mouse.down()
  await page.mouse.move(ob.x + 25, ob.y + 20, { steps: 4 })
  await page.mouse.up()
  const movedOrigin = await origin.boundingBox()
  check(
    'origin handle follows the pointer in scene coordinates',
    Math.abs(movedOrigin.x + movedOrigin.width / 2 - (ob.x + 25)) < 3 &&
      Math.abs(movedOrigin.y + movedOrigin.height / 2 - (ob.y + 20)) < 3,
  )
  check(
    'origin drag writes native reproducible CSS',
    await page.evaluate(() =>
      window.__jumiStudio.project.scene.css.includes(
        '/* Studio origin dot-a */',
      ),
    ),
  )
  await page.frameLocator('#scene-frame').locator('#dot-a').click()
  await page
    .frameLocator('#scene-frame')
    .locator('#dot-a')
    .click({ modifiers: ['Alt'] })
  check(
    'Alt-click reaches an underlying layer',
    await page.evaluate(
      () => window.__jumiStudio.project.editor.selected[0] !== 'dot-a',
    ),
  )
  await page.frameLocator('#scene-frame').locator('#dot-b').click()
  check(
    'canvas click selects the actual SVG element',
    await page.evaluate(
      () => window.__jumiStudio.project.editor.selected[0] === 'dot-b',
    ),
  )
  await page.locator('#scene-tree [data-select="dot-a"]').click()
  const svgBefore = await page
    .frameLocator('#scene-frame')
    .locator('#dot-a')
    .evaluate(el => ({
      box: el.getBoundingClientRect().toJSON(),
      parent: el.parentElement.id,
    }))
  await page.locator('button[data-left-tab=context]').click()
  await page.locator('#isolation').selectOption('selection')
  check(
    'sibling context is ghosted without dimming the selected child',
    Math.abs(Number(await value('#dot-b')) - 0.16) < 0.001 &&
      Math.abs(Number(await value('#dot-a')) - 0.2) < 0.001,
  )
  const svgAfter = await page
    .frameLocator('#scene-frame')
    .locator('#dot-a')
    .evaluate(el => ({
      box: el.getBoundingClientRect().toJSON(),
      parent: el.parentElement.id,
    }))
  check(
    'SVG isolation preserves bounds and hierarchy',
    JSON.stringify(svgBefore) === JSON.stringify(svgAfter),
  )
  await page.locator('button[data-left-tab=context]').click()
  await page.locator('#isolation').selectOption('none')
  await page.locator('button[data-left-tab=layers]').click()
  await control('duration', 1000)
  await control('delay', 200)
  await control('easing', 'linear')
  await control('iterations', '1')
  await seek(600)
  await page.locator('button[data-inspector=keyframe]').click()
  await page.locator('#frame-value').fill('.8')
  await page.locator('[data-action="keyframe"]').first().click()
  await ready()
  check(
    'keyframe insertion is delay-relative (600ms to 40%)',
    await page.evaluate(() =>
      window.__jumiStudio.project.tracks
        .find(t => t.nodeId === 'dot-a')
        .frames.some(f => f.offset === 40 && f.value === '.8'),
    ),
  )
  check(
    'scrubbing uses actual CSS interpolation at the inserted frame',
    Math.abs(Number(await value('#dot-a')) - 0.8) < 0.001,
  )
  const key = page.locator('[aria-label="opacity keyframe 40%"]')
  const keyBox = await key.boundingBox(),
    lane = await page.locator('.track-lane').first().boundingBox()
  await page.mouse.move(
    keyBox.x + keyBox.width / 2,
    keyBox.y + keyBox.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    keyBox.x + keyBox.width / 2 + (lane.width * 200) / 6000,
    keyBox.y + keyBox.height / 2,
    { steps: 5 },
  )
  await page.mouse.up()
  await ready()
  check(
    'dragging a keyframe changes its authored time',
    await page.evaluate(() =>
      window.__jumiStudio.project.tracks
        .find(t => t.nodeId === 'dot-a')
        .frames.some(f => f.offset === 60 && f.value === '.8'),
    ),
  )
  await page.locator('[aria-label="opacity keyframe 60%"]').focus()
  await page.keyboard.press('Delete')
  await ready()
  check(
    'keyframe deletion edits the phrase',
    await page.evaluate(
      () =>
        !window.__jumiStudio.project.tracks
          .find(t => t.nodeId === 'dot-a')
          .frames.some(f => f.offset === 60),
    ),
  )
  await page.locator('[data-action="undo"]').click()
  await ready()
  check(
    'undo restores authored keyframes',
    await page.evaluate(() =>
      window.__jumiStudio.project.tracks
        .find(t => t.nodeId === 'dot-a')
        .frames.some(f => f.offset === 60),
    ),
  )
  await page.locator('#scene-tree [data-select="dot-b"]').click()
  await page.locator('button[data-left-tab=layers]').click()
  await control('duration', 1000)
  await control('delay', 700)
  await control('easing', 'linear')
  await control('iterations', '1')
  await seek(600)
  check(
    'siblings can use independent timing',
    Math.abs(Number(await value('#dot-a')) - Number(await value('#dot-b'))) >
      0.2,
  )
  await page
    .locator('#scene-tree [data-select="dot-a"]')
    .click({ modifiers: ['Shift'] })
  check(
    'multiple selected elements expose multiple timeline tracks',
    (await page.locator('.track-row').count()) === 2,
  )
  await page.locator('[data-action="sync"]').click()
  await ready()
  check(
    'shared timing writes controls to both siblings',
    await page.evaluate(() => {
      const t = window.__jumiStudio.project.tracks.filter(t =>
        ['dot-a', 'dot-b'].includes(t.nodeId),
      )
      return (
        t[0].controls.duration === t[1].controls.duration &&
        t[0].controls.delay === t[1].controls.delay
      )
    }),
  )
  await page.locator('[data-action="stagger"]').click()
  await ready()
  check(
    'sibling choreography produces explicit public delays',
    await page.evaluate(() => {
      const t = window.__jumiStudio.project.tracks.filter(t =>
        ['dot-a', 'dot-b'].includes(t.nodeId),
      )
      return Math.abs(t[0].controls.delay - t[1].controls.delay) === 150
    }),
  )
  await page.locator('#scene-tree [data-select="headline"]').click()
  await page.locator('#property-search').fill('opacity')
  await page.locator('#property-select').selectOption('animate-opacity')
  await page.locator('[data-action="add-track"]').click()
  await ready()
  check(
    'HTML can hold multiple independently authored properties',
    await page.evaluate(
      () =>
        window.__jumiStudio.project.tracks.filter(t => t.nodeId === 'headline')
          .length === 2,
    ),
  )
  await page.locator('button[data-inspector=motion]').click()
  await page.locator('[data-ease-coordinate="1"]').fill('1.3')
  await page.locator('[data-ease-coordinate="1"]').dispatchEvent('change')
  await ready()
  await page.evaluate(
    () =>
      (window.__studioNode = document
        .querySelector('#scene-frame')
        .contentDocument.querySelector('#headline')),
  )
  await seek(500)
  await seek(700)
  check(
    'seeking does not replace scene nodes',
    await page.evaluate(
      () =>
        window.__studioNode ===
        document
          .querySelector('#scene-frame')
          .contentDocument.querySelector('#headline'),
    ),
  )
  await page.locator('[data-action="play"]').click()
  await page.waitForTimeout(160)
  await page.locator('[data-action="play"]').click()
  check(
    'playback advances the actual browser animations',
    await page.evaluate(() => {
      const a = document
        .querySelector('#scene-frame')
        .contentDocument.getAnimations()
      return (
        window.__jumiStudio.time > 700 && a.every(a => a.playState === 'paused')
      )
    }),
  )
  await seek(0)
  const stored = await page.evaluate(() =>
    JSON.stringify(window.__jumiStudio.project),
  )
  check(
    'latest edit is saved before reload',
    await page.evaluate(
      s =>
        JSON.stringify(
          JSON.parse(localStorage.getItem('jumi-studio-project-v1')).tracks,
        ) === JSON.stringify(JSON.parse(s).tracks),
      stored,
    ),
  )
  await page.reload()
  await ready()
  // Fitting a freshly loaded viewport is display state, not authored motion.
  check(
    'local persistence restores author intent',
    await page.evaluate(s => {
      const a = window.__jumiStudio.project,
        b = JSON.parse(s)
      return (
        JSON.stringify(a.tracks) === JSON.stringify(b.tracks) &&
        JSON.stringify(a.scene) === JSON.stringify(b.scene)
      )
    }, stored),
  )
  const snapshot = await page.evaluate(() => ({
    classes: [
      ...new DOMParser()
        .parseFromString(window.__jumiStudio.exported, 'text/html')
        .querySelectorAll('[class]'),
    ].flatMap(el => [...el.classList]),
    html: window.__jumiStudio.exported,
    project: window.__jumiStudio.project,
  }))
  check(
    'output uses named Jumi phrases and has no editor isolation',
    snapshot.html.includes('animate-opacity-[') &&
      snapshot.html.includes('/pulse') &&
      !snapshot.html.includes('studio-isolation'),
  )
  const fresh = build(
    await compiler(
      '@import "tailwindcss"; @plugin "' + root + '/dist/index.js";',
      root,
    ),
    snapshot.classes,
  ).css
  const independent = await context.newPage()
  await independent.setContent(
    snapshot.html.replace(
      /(<style id="jumi-output">)[\s\S]*?(<\/style>)/,
      (_m, a, b) => a + fresh + b,
    ),
  )
  const metrics = () =>
    [...document.querySelectorAll('#dot-a,#dot-b,#headline')].map(el => {
      const b = el.getBoundingClientRect(),
        s = getComputedStyle(el)
      return {
        height: b.height,
        id: el.id,
        opacity: Number(s.opacity),
        rotate: s.rotate,
        translate: s.translate,
        width: b.width,
        x: b.x,
        y: b.y,
      }
    })
  for (const time of [0, 100, 400, 600, 800, 1200, 1800, 2500]) {
    await seek(time)
    await independent.evaluate(t => {
      for (const a of document.getAnimations()) {
        a.pause()
        a.currentTime = t
      }
    }, time)
    const actual = await page
        .frameLocator('#scene-frame')
        .locator('body')
        .evaluate(metrics),
      expected = await independent.evaluate(metrics)
    for (let i = 0; i < actual.length; i++) {
      for (const k of ['opacity', 'width', 'height', 'x', 'y'])
        assert.ok(
          Math.abs(actual[i][k] - expected[i][k]) < 0.03,
          actual[i].id +
            ' ' +
            k +
            ' at ' +
            time +
            'ms: ' +
            actual[i][k] +
            ' != ' +
            expected[i][k],
        )
      assert.equal(actual[i].translate, expected[i].translate)
      assert.equal(actual[i].rotate, expected[i].rotate)
    }
  }
  check(
    'fresh external Jumi build matches Studio HTML/SVG at eight times',
    true,
  )
  await independent.close()
  const download = page.waitForEvent('download')
  await page.locator('[data-action="export"]').click()
  check(
    'standalone HTML can be downloaded',
    (await download).suggestedFilename() === 'jumi-motion.html',
  )
  const folder = path.join(root, 'artifacts/studio')
  await mkdir(folder, { recursive: true })
  await page.locator('button[data-left-tab=layers]').click()
  await page.locator('#scene-picker').selectOption('hero')
  await ready()
  await page.locator('button[data-inspector=motion]').click()
  await page.locator('[data-action=fit-scene]').click()
  await page.screenshot({
    fullPage: true,
    path: path.join(folder, 'desktop.png'),
  })
  await page.setViewportSize({ height: 844, width: 390 })
  await page.waitForTimeout(100)
  check(
    'narrow workspace keeps the canvas available',
    await page
      .locator('#studio-app')
      .evaluate(
        el =>
          el.classList.contains('left-closed') &&
          el.classList.contains('right-closed'),
      ),
  )
  check(
    'narrow layout does not overflow the page',
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  )
  await page.screenshot({
    fullPage: true,
    path: path.join(folder, 'mobile.png'),
  })
  check('no browser runtime exceptions', errors.length === 0)
  console.log(
    '\n' +
      checks +
      ' Studio browser checks passed; independent compilation parity verified.',
  )
} finally {
  await context.close()
  await browser.close()
  await new Promise(resolve => server.close(resolve))
}
