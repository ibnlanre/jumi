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
  await page.locator('#studio-theme').selectOption('light')
  check(
    'light theme applies workspace tokens',
    await page.evaluate(
      () =>
        document.documentElement.dataset.theme === 'light' &&
        getComputedStyle(document.documentElement)
          .getPropertyValue('--panel')
          .trim() === '#f5f7f1',
    ),
  )
  const themeProject = await page.evaluate(() =>
    JSON.stringify(window.__jumiStudio.project),
  )
  await page.locator('#studio-theme').selectOption('dark')
  await page.reload()
  await ready()
  check(
    'theme preference persists independently of project',
    await page.evaluate(
      s =>
        document.documentElement.dataset.theme === 'dark' &&
        JSON.stringify(window.__jumiStudio.project) === s,
      themeProject,
    ),
  )
  await page.locator('[data-action=zoom-in]').click()
  const manualZoom = await page.evaluate(
    () => window.__jumiStudio.project.viewport.zoom,
  )
  await page.reload()
  await ready()
  check(
    'manual zoom survives restoration without automatic fitting',
    await page.evaluate(
      z => window.__jumiStudio.project.viewport.zoom === z,
      manualZoom,
    ),
  )
  await page.locator('#studio-theme').selectOption('system')
  await page.emulateMedia({ colorScheme: 'light' })
  check(
    'system theme follows OS appearance',
    await page.evaluate(
      () => document.documentElement.dataset.theme === 'light',
    ),
  )
  await page.locator('#studio-theme').selectOption('dark')
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
  const railX = (await page.locator('#track-rail').boundingBox()).x
  await page.locator('#timeline-zoom').selectOption('4')
  const contentWidth = await page
    .locator('#time-content')
    .evaluate(el => el.clientWidth)
  await page.locator('#timeline-x').evaluate(el => {
    el.scrollLeft = 450
    el.dispatchEvent(new Event('scroll'))
  })
  check(
    'only the time viewport scrolls horizontally',
    (await page.locator('#track-rail').boundingBox()).x === railX &&
      (await page.locator('#time-viewport').evaluate(el => el.scrollLeft)) ===
        450,
  )
  await page.locator('#rail-resize').focus()
  await page.keyboard.press('ArrowRight')
  check(
    'rail resizing preserves time coordinates',
    (await page.locator('#time-content').evaluate(el => el.clientWidth)) ===
      contentWidth,
  )
  await page.locator('#all-tracks').check()
  await page.locator('#timeline-scroll').evaluate(el => (el.scrollTop = 130))
  check(
    'rail and time rows share exact vertical positions',
    await page.evaluate(() =>
      [...document.querySelectorAll('[data-row-index]')].every(el => {
        const other = document.querySelector(
          '[data-time-row="' + el.dataset.rowIndex + '"]',
        )
        const a = el.getBoundingClientRect(),
          b = other.getBoundingClientRect()
        return Math.abs(a.top - b.top) < 0.1 && a.height === b.height
      }),
    ),
  )
  check(
    'ruler remains above vertically scrolled tracks',
    await page.locator('#timeline-header').isVisible(),
  )
  await page.locator('#all-tracks').uncheck()
  await page.locator('#timeline-scroll').evaluate(el => (el.scrollTop = 0))
  await page.locator('#timeline-x').evaluate(el => {
    el.scrollLeft = 0
    el.dispatchEvent(new Event('scroll'))
  })
  await page.locator('#timeline-zoom').selectOption('1')
  await page.locator('#scene-tree [data-select="petal-4"]').click()
  await page.locator('#breadcrumbs button').last().focus()
  await page.keyboard.press('Alt+ArrowUp')
  check(
    'keyboard navigation moves upward through hierarchy',
    await page.evaluate(
      () => window.__jumiStudio.project.editor.selected[0] === 'position-4',
    ),
  )
  await page.keyboard.press('Alt+ArrowDown')
  check(
    'keyboard navigation drills into children',
    await page.evaluate(
      () => window.__jumiStudio.project.editor.selected[0] === 'petal-4',
    ),
  )
  const echoPhrase = await page.evaluate(() => {
    const t = window.__jumiStudio.project.tracks.find(
      t => t.nodeId === 'petal-4' && t.name === 'flick',
    )
    return (
      t.utility +
      '-[' +
      t.frames.map(f => f.offset + ':' + f.value).join('|') +
      ']/echo animation-duration-[1400ms]/echo'
    )
  })
  await page.locator('[data-action=import-classes]').click()
  await page.locator('#phrase-input').fill(echoPhrase)
  await page.locator('#apply-phrases').click()
  await ready()

  check(
    'identical frames with distinct names stay separate browser instances',
    await page
      .frameLocator('#scene-frame')
      .locator('#petal-4')
      .evaluate(el => el.getAnimations().length === 3),
  )
  await page.locator('[data-audition="motion:petal-4:echo"]').click()
  check(
    'audition addresses the named instance even with shared keyframe identity',
    await page
      .frameLocator('#scene-frame')
      .locator('body')
      .evaluate(
        () =>
          document.getAnimations().length === 1 &&
          document.getAnimations()[0].effect.getTiming().duration === 1400,
      ),
  )
  await page.locator('[data-action=reset-audition]').click()
  const echoId = await page.evaluate(
    () => window.__jumiStudio.project.tracks.find(t => t.name === 'echo').id,
  )
  await page.locator('[data-track-delete="' + echoId + '"]').click()
  await ready()
  const auditionExport = await page.evaluate(() => window.__jumiStudio.exported)
  await page.locator('[data-audition="motion:petal-4:flick"]').click()
  check(
    'named motion preview runs only its instance',
    await page
      .frameLocator('#scene-frame')
      .locator('body')
      .evaluate(
        () =>
          document.getAnimations().length === 1 &&
          document.getAnimations()[0].effect.target.id === 'petal-4',
      ),
  )
  await page.locator('[data-audition="element:petal-4"]').click()
  check(
    'element preview includes all of its motion instances',
    await page
      .frameLocator('#scene-frame')
      .locator('body')
      .evaluate(() => document.getAnimations().length === 2),
  )
  await page.locator('[data-action=reset-audition]').click()
  await page.locator('[data-solo="element:petal-4"]').click()
  await page.locator('[data-mute="motion:petal-4:flick"]').click()
  check(
    'solo and mute compose without changing output',
    (await page
      .frameLocator('#scene-frame')
      .locator('body')
      .evaluate(() => document.getAnimations().length === 1)) &&
      (await page.evaluate(
        html => window.__jumiStudio.exported === html,
        auditionExport,
      )),
  )
  await page.locator('[data-action=reset-audition]').click()
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
  const handle = page.locator('[data-ease-handle="0"]')

  // Scrolled into view first, and that is not a formality: the curve editor is the last section of the
  // inspector, so with an overshoot preset — `ease-elastic` is `y₁ = -0.55` — the first handle sits
  // below the panel's visible edge. `mouse.move` takes viewport coordinates and does not scroll, so the
  // pointer landed on the tab row underneath instead of the handle, and the drag silently did nothing.
  // `boundingBox()` reports the element's own box whether or not it is covered, which is what made the
  // failure look like a dead interaction rather than a misplaced pointer.
  await handle.scrollIntoViewIfNeeded()

  const hb = await handle.boundingBox()
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
  check(
    'origin is quiet for element selection',
    (await page.locator('[data-overlay-handle=origin]').count()) === 0,
  )
  await page.locator('.canvas-mode [data-action=edit-origin]').click()
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
      window.__jumiStudio.exported.includes('/* Studio base dot-a */'),
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
  await page.locator('button[data-inspector=element]').click()
  if (!(await page.locator('[data-base-section=Transform]').evaluate(el=>el.open))) await page.locator('[data-base-section=Transform] summary').click()
  const baseField = async (property, value) => {
    const field = page.locator('[data-base="' + property + '"]')
    await field.fill(value)
    await field.dispatchEvent('change')
    await ready()
  }
  await baseField('rotate', '20deg')
  await page.locator('#start-from-base').check()
  await page.locator('#property-search').fill('rotate')
  await page.locator('#property-select').selectOption('animate-rotate')
  await page.locator('[data-action=add-track]').click()
  await ready()
  await seek(0)
  check(
    'end-only Jumi frames begin at authored base rotate',
    Math.abs(
      (await page
        .frameLocator('#scene-frame')
        .locator('#headline')
        .evaluate(el => parseFloat(getComputedStyle(el).rotate))) - 20,
    ) < 0.1,
  )
  await seek(1000)
  check(
    'browser interpolates from underlying base to motion endpoint',
    Math.abs(
      (await page
        .frameLocator('#scene-frame')
        .locator('#headline')
        .evaluate(el => parseFloat(getComputedStyle(el).rotate))) - 55,
    ) < 0.2,
  )
  await page.locator('button[data-inspector=element]').click()
  await page.locator('[data-action=base-preview]').click()
  await page.locator('[data-canvas-mode=move]').click()
  const moveBox = await page
    .locator('[data-manipulation=translate]')
    .boundingBox()
  const drag = async (box, dx, dy) => {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(
      box.x + box.width / 2 + dx,
      box.y + box.height / 2 + dy,
      { steps: 5 },
    )
    await page.mouse.up()
  }
  await drag(moveBox, 24, -12)
  check(
    'moving HTML authors visible base CSS',
    await page.evaluate(() =>
      /Studio base headline[^}]*translate:/s.test(window.__jumiStudio.exported),
    ),
  )
  await page.locator('[data-output=native]').click()
  check(
    'direct manipulation appears immediately in Base CSS',
    (await page.locator('#output-code').textContent()).includes('translate:'),
  )
  await page.locator('[data-action=undo]').click()
  await ready()
  check(
    'one undo restores the whole move gesture',
    await page.evaluate(
      () =>
        !window.__jumiStudio.exported.match(
          /Studio base headline[^}]*translate:/s,
        ),
    ),
  )
  await drag(
    await page.locator('[data-manipulation=translate]').boundingBox(),
    24,
    -12,
  )
  await page.locator('[data-canvas-mode=transform]').click()
  await drag(
    await page.locator('[data-manipulation=scale]').boundingBox(),
    15,
    10,
  )
  await drag(
    await page.locator('[data-manipulation=rotate]').boundingBox(),
    12,
    8,
  )
  check(
    'transform handles author scale and rotate, not wrappers',
    await page.evaluate(() =>
      /Studio base headline[^}]*scale:/s.test(window.__jumiStudio.exported),
    ),
  )
  await page.locator('[data-canvas-mode=select]').click()
  await page.locator('#scene-tree [data-select="dot-a"]').click()
  check(
    'SVG base geometry is shape-specific',
    (await page.locator('[data-base=cx]').count()) === 1 &&
      (await page.locator('[data-base=x]').count()) === 0,
  )
  await baseField('cx', '160px')
  await baseField('fill', '#a0bc55')
  check(
    'SVG base geometry reaches the actual browser',
    await page
      .frameLocator('#scene-frame')
      .locator('#dot-a')
      .evaluate(el => getComputedStyle(el).cx === '160px'),
  )
  await page.locator('#scene-tree [data-select="headline"]').click()
  await page.locator('[data-output=timeline]').click()
  await page.locator('[data-action=reset-audition]').click()
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
  // The download comes first, and everything below runs on its bytes rather than on the string the
  // editor is holding. Those two could drift and this gate would still pass, which is the one seam the
  // loop left open: what a reader saves is what has to replay.
  await ready()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('[data-action="export"]').click(),
  ])
  check(
    'standalone HTML can be downloaded',
    download.suggestedFilename() === 'jumi-motion.html',
  )
  const exported = await readFile(await download.path(), 'utf8')
  const inMemory = await page.evaluate(() => window.__jumiStudio.exported)
  check(
    'the downloaded artifact is the export the editor holds',
    exported.trim() === inMemory.trim(),
  )
  const classes = await page.evaluate(
    html =>
      [
        ...new DOMParser()
          .parseFromString(html, 'text/html')
          .querySelectorAll('[class]'),
      ].flatMap(el => [...el.classList]),
    exported,
  )
  check(
    'output uses named Jumi phrases and has no editor isolation',
    exported.includes('animate-opacity-[') &&
      exported.includes('/pulse') &&
      !exported.includes('studio-isolation'),
  )
  const fresh = build(
    await compiler(
      '@import "tailwindcss"; @plugin "' + root + '/dist/index.js";',
      root,
    ),
    classes,
  ).css
  const independent = await context.newPage()
  const replayErrors = []
  independent.on('pageerror', e => replayErrors.push(e.message))
  await independent.setContent(
    exported.replace(
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
  // The replay is a real page loading real bytes: a throw there (a missing custom property, a bad
  // `@keyframes`) would leave the comparison reading whatever the browser fell back to.
  check(
    'the replayed artifact raises no page errors',
    replayErrors.length === 0,
  )
  await independent.close()
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
  await page.locator('#studio-theme').selectOption('light')
  await page.screenshot({
    fullPage: true,
    path: path.join(folder, 'light.png'),
  })
  await page.locator('button[data-inspector=element]').click()
  await page.screenshot({
    fullPage: true,
    path: path.join(folder, 'base-inspector.png'),
  })
  await page.locator('#studio-theme').selectOption('dark')
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
