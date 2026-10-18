#!/usr/bin/env node
/**
 * Render the product video.
 *
 * The film is `video/index.html`, a page whose every movement is a Jumi class. This script does the
 * two things a page cannot do for itself:
 *
 *   1. Build its stylesheet the way a real build does: Tailwind emits from `video/input.css`, and
 *      Jumi's `finalizeCss` completes the carriers (the same two steps as `scripts/build-examples.mjs`).
 *   2. Record it deterministically. For each frame the page pauses every animation and seeks it to
 *      that frame's time through the Web Animations API, then headless Chromium captures the frame
 *      and it is piped into ffmpeg. Wall-clock speed never touches the result, so the render is
 *      identical on any machine.
 *
 * Run:  node video/render.mjs            → video/jumi.mp4 (1920×1080, 60 fps, H.264)
 *       node video/render.mjs --fps 30 --out video/preview.mp4
 *       node video/render.mjs --stills    → one PNG per second in video/stills/, no encode
 */
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const at = args.indexOf(`--${name}`)
  return at === -1 ? fallback : args[at + 1]
}
const fps = Number(flag('fps', 60))
const out = path.resolve(flag('out', path.join(here, 'jumi.mp4')))
const stills = args.includes('--stills')
const skipCss = args.includes('--no-css')

const WIDTH = 1920
const HEIGHT = 1080

/* ----------------------------------------------------------------------------------------------
 * 1. The stylesheet
 * -------------------------------------------------------------------------------------------- */

if (!skipCss) {
  const { ensureBundle } = await import(
    path.join(root, 'scripts', 'bundle.mjs')
  )
  ensureBundle()
  const { complete } = await import(
    path.join(root, 'scripts', 'lib', 'compile.mjs')
  )

  const raw = path.join(
    mkdtempSync(path.join(tmpdir(), 'jumi-video-')),
    'output.css',
  )
  console.log('· compiling the stylesheet')
  execFileSync(
    'pnpm',
    ['exec', 'tailwindcss', '-i', path.join(here, 'input.css'), '-o', raw],
    { cwd: root, stdio: 'pipe' },
  )
  const built = complete(readFileSync(raw, 'utf8'))
  writeFileSync(path.join(here, 'output.css'), built.css)
  console.log(
    `  ${built.css.length.toLocaleString()} bytes, ${(built.css.match(/@keyframes /g) ?? []).length} keyframes, ${built.animations} compositions`,
  )
}

/* ----------------------------------------------------------------------------------------------
 * 2. The recording
 * -------------------------------------------------------------------------------------------- */

const browser = await chromium.launch({
  args: [
    '--force-device-scale-factor=1',
    '--hide-scrollbars',
    '--font-render-hinting=none',
  ],
  headless: true,
})
const context = await browser.newContext({
  colorScheme: 'dark',
  deviceScaleFactor: 1,
  reducedMotion: 'no-preference',
  viewport: { height: HEIGHT, width: WIDTH },
})
const page = await context.newPage()
page.on('console', message => {
  if (message.type() === 'error') console.error('  page:', message.text())
})

const url = pathToFileURL(path.join(here, 'index.html')).href + '?manual'
await page.goto(url, { waitUntil: 'networkidle' })

// Fonts must be resident before the clock starts, or the first frames render in a fallback face.
await page.evaluate(async () => {
  await Promise.all([
    document.fonts.load('800 100px Manrope'),
    document.fonts.load('500 100px Manrope'),
    document.fonts.load('700 100px Manrope'),
    document.fonts.load('400 20px "DM Sans"'),
    document.fonts.load('500 20px "DM Sans"'),
    document.fonts.load('600 20px "DM Sans"'),
    document.fonts.load('400 20px "JetBrains Mono"'),
    document.fonts.load('600 20px "JetBrains Mono"'),
  ])
  await document.fonts.ready
})

const durationMs = await page.evaluate(() => window.__duration)
const frames = Math.ceil((durationMs / 1000) * fps)

// One frame is a pure function of its time: the page pauses every animation and seeks it there,
// so neither wall-clock speed nor the compositor's own clock can reach the result.
const seek = async frame => {
  await page.evaluate(t => window.__seek(t), (frame * 1000) / fps)
  await page.evaluate(() => new Promise(requestAnimationFrame))
}

const cdp = await context.newCDPSession(page)
const capture = async () => {
  const { data } = await cdp.send('Page.captureScreenshot', {
    captureBeyondViewport: false,
    format: 'png',
    optimizeForSpeed: true,
  })
  return Buffer.from(data, 'base64')
}

/* ----------------------------------------------------------------------------------------------
 * 3. The encode
 * -------------------------------------------------------------------------------------------- */

let sink
let encoder
if (stills) {
  const dir = path.join(here, 'stills')
  mkdirSync(dir, { recursive: true })
  sink = async (buffer, frame) => {
    if (frame % fps === 0)
      writeFileSync(
        path.join(dir, `${String(frame / fps).padStart(3, '0')}s.png`),
        buffer,
      )
  }
} else {
  encoder = spawn(
    'ffmpeg',
    [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'image2pipe',
      '-framerate',
      String(fps),
      '-i',
      '-',
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '17',
      '-pix_fmt',
      'yuv420p',
      '-profile:v',
      'high',
      '-movflags',
      '+faststart',
      '-r',
      String(fps),
      out,
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  )
  encoder.on('error', error => {
    console.error('ffmpeg:', error.message)
    process.exit(1)
  })
  sink = buffer =>
    new Promise(resolve => {
      if (encoder.stdin.write(buffer)) resolve()
      else encoder.stdin.once('drain', resolve)
    })
}

console.log(
  `· recording ${frames} frames at ${fps} fps (${(durationMs / 1000).toFixed(1)}s)`,
)
const started = Date.now()
for (let frame = 0; frame < frames; frame++) {
  await seek(frame)
  await sink(await capture(), frame)
  if (frame % (fps * 5) === 0 && frame) {
    const elapsed = (Date.now() - started) / 1000
    const rate = frame / elapsed
    process.stdout.write(
      `  ${String(Math.round(frame / fps)).padStart(3)}s · ${rate.toFixed(1)} fps · ~${Math.round((frames - frame) / rate)}s left\n`,
    )
  }
}

await browser.close()

if (encoder) {
  encoder.stdin.end()
  await new Promise((resolve, reject) => {
    encoder.on('close', code =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`)),
    )
  })
  console.log(`· wrote ${path.relative(root, out)}`)
} else {
  console.log('· wrote video/stills/')
}
