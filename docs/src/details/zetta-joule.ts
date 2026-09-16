/** Media adapter: browser-computed opacity is the sole progress input.
 * No scroll offsets, timeline arithmetic, easing, velocity or pinning live here.
 */
const canvas = document.querySelector<HTMLCanvasElement>('[data-reactor]')!
const progress = document.querySelector<HTMLElement>('[data-frame-progress]')!
const context = canvas.getContext('2d')!
const urls: string[] = JSON.parse(canvas.dataset.frames!)
const desktop = matchMedia('(min-width:768px)')
const reduce = matchMedia('(prefers-reduced-motion:reduce)')
const supported = CSS.supports('animation-timeline', 'view()')
const cache = new Map<number, HTMLImageElement>()
const pending = new Map<number, Promise<HTMLImageElement>>()
let active = false, raf = 0, painted = -1, target = 0
const load = (index: number) => {
  if (cache.has(index)) return Promise.resolve(cache.get(index)!)
  if (pending.has(index)) return pending.get(index)!
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => { cache.set(index, image); resolve(image) }
    image.onerror = reject
    image.src = urls[index]
  }).finally(() => pending.delete(index))
  pending.set(index, promise)
  return promise
}
function paint(index: number, image: HTMLImageElement) {
  if (index !== target || !active) return
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  painted = index
  canvas.dataset.frame = String(index)
  // Bound decoded image retention instead of keeping the complete sequence in GPU memory.
  for (const key of cache.keys()) if (Math.abs(key - index) > 8) cache.delete(key)
}
function sample() {
  raf = 0
  if (!active || !desktop.matches || reduce.matches || !supported || document.hidden) return
  const value = Number.parseFloat(getComputedStyle(progress).opacity)
  target = Math.round(Math.min(1, Math.max(0, value)) * (urls.length - 1))
  if (target !== painted) {
    if (cache.has(target)) paint(target, cache.get(target)!)
    else { const index = target; void load(index).then(image => paint(index, image)).catch(() => { canvas.dataset.mediaError = 'Frame unavailable' }) }
  }
  for (const index of [target - 1, target + 1]) if (index >= 0 && index < urls.length) void load(index).catch(() => {})
  raf = requestAnimationFrame(sample)
}
function update() { cancelAnimationFrame(raf); raf = 0; sample() }
new IntersectionObserver(([entry]) => { active = entry.isIntersecting; update() }, {rootMargin:'150px'}).observe(canvas)
desktop.addEventListener('change', update)
reduce.addEventListener('change', update)
document.addEventListener('visibilitychange', update)

const video = document.querySelector<HTMLVideoElement>('[data-mission-video]')!
let videoVisible = false
function updateVideo() {
  if (videoVisible && matchMedia('(min-width:992px)').matches && !reduce.matches && !document.hidden) {
    const source = video.querySelector('source')!
    if (!source.src) { source.src = source.dataset.src!; video.load() }
    void video.play().catch(() => {})
  } else video.pause()
}
new IntersectionObserver(([entry])=>{videoVisible=entry.isIntersecting;updateVideo()}).observe(video)
reduce.addEventListener('change',updateVideo)
document.addEventListener('visibilitychange',updateVideo)
matchMedia('(min-width:992px)').addEventListener('change',updateVideo)

const dialog = document.querySelector<HTMLDialogElement>('.inspect')!
document.querySelector('[data-inspect]')!.addEventListener('click',()=>dialog.showModal())
document.querySelector('[data-close]')!.addEventListener('click',()=>dialog.close())
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-chart]')) {
  button.addEventListener('click',()=>{
    for (const other of document.querySelectorAll('[data-chart]')) other.setAttribute('aria-pressed',String(other===button))
    for (const panel of document.querySelectorAll<HTMLImageElement>('[data-chart-panel]')) panel.hidden=panel.dataset.chartPanel!==button.dataset.chart
  })
}

// Intersection is an application state change, not a scroll progress or timing engine.
const entrances = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    (entry.target as HTMLElement).dataset.entered = 'true'
    entrances.unobserve(entry.target)
  }
}, {threshold:0.12})
for (const element of document.querySelectorAll('[data-entered]')) entrances.observe(element)
document.documentElement.dataset.motionReady = 'true'
