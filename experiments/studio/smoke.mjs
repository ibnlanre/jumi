import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { height: 1000, width: 1440 } })
page.on('pageerror', e => console.error('PAGE', e.message))
page.on('console', m => {
  if (m.type() === 'error') console.error('CONSOLE', m.text())
})
await page.goto('http://127.0.0.1:4322/studio/')
await page.waitForFunction(
  () => window.__jumiStudio && !window.__jumiStudio.pending,
  {},
  { timeout: 60000 },
)
console.log(
  await page.evaluate(() => ({
    animations: document.querySelector('iframe').contentDocument.getAnimations()
      .length,
    css: window.__jumiStudio.css.length,
    error: window.__jumiStudio.error,
    properties: window.__jumiStudio.catalog.length,
    status: document.querySelector('#compile-status').textContent,
    tracks: window.__jumiStudio.project.tracks.length,
  })),
)
await page.screenshot({
  fullPage: true,
  path: '/private/tmp/jumi-studio-desktop.png',
})
await browser.close()
