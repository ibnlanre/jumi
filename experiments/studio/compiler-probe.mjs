import { chromium } from 'playwright'

import fs from 'node:fs'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent(
  '<div id="target" class="animate-opacity-[0:0|100:1] animation-duration-[1000ms]">test</div>',
)
await page.addScriptTag({ path: '/private/tmp/jumi-studio-probe.js' })
const result = await page.evaluate(
  async theme => {
    const start = performance.now()
    const css = await globalThis.probeCompile(theme)
    const compileMs = performance.now() - start
    const s = document.createElement('style')
    s.textContent = css
    document.head.append(s)
    getComputedStyle(document.querySelector('#target')).opacity
    for (const a of document.getAnimations()) {
      a.pause()
      a.currentTime = 500
    }
    return {
      animations: document.getAnimations().length,
      bytes: css.length,
      compileMs,
      opacity: getComputedStyle(document.querySelector('#target')).opacity,
    }
  },
  fs.readFileSync('node_modules/tailwindcss/theme.css', 'utf8'),
)
console.log(result)
if (!result.animations) throw Error('Browser compilation emitted no animation')
await browser.close()
