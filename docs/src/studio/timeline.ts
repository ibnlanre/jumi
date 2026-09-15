import type { StudioProject, Track } from './model'

import { escapeHtml as esc, flatten } from './model'
export type TimelineRow = {
  height: number
  kind: 'element' | 'motion' | 'property'
  nodeId: string
  track: Track
}
export function timelineRows(
  project: StudioProject,
  tracks: Track[],
): TimelineRow[] {
  const nodes = flatten(project.scene.root).map(n => n.id)
  const sorted = tracks
    .slice()
    .sort(
      (a, b) =>
        nodes.indexOf(a.nodeId) - nodes.indexOf(b.nodeId) ||
        a.name.localeCompare(b.name),
    )
  const rows: TimelineRow[] = []
  let name = '',
    node = ''
  for (const t of sorted) {
    if (node !== t.nodeId)
      rows.push({ height: 36, kind: 'element', nodeId: t.nodeId, track: t })
    if (node !== t.nodeId || name !== t.name)
      rows.push({ height: 40, kind: 'motion', nodeId: t.nodeId, track: t })
    rows.push({ height: 36, kind: 'property', nodeId: t.nodeId, track: t })
    node = t.nodeId
    name = t.name
  }
  return rows
}
let railWidth = 245,
  timeScroll = 0
export function renderTracks(
  project: StudioProject,
  tracks: Track[],
  start: number,
  zoom: number,
  active: string,
  frames: string[],
  muted: Set<string>,
  solo: Set<string>,
) {
  const rows = timelineRows(project, tracks),
    span = project.duration - start
  // Stable scene time scale: rail resizing never changes px per millisecond.
  const width = Math.max(720, span * 0.12) * zoom
  const names = new Map(flatten(project.scene.root).map(n => [n.id, n.name]))
  const audition = (row: TimelineRow) => {
    const t = row.track,
      key =
        row.kind === 'element'
          ? `element:${t.nodeId}`
          : `motion:${t.nodeId}:${t.name}`
    return `<div class="audition-actions"><button data-audition="${key}" aria-label="Preview ${esc(row.kind === 'element' ? names.get(t.nodeId)! : '/' + t.name)}">▷</button><button data-mute="${key}" aria-pressed="${muted.has(key)}" aria-label="Mute ${esc(key)}">M</button><button data-solo="${key}" aria-pressed="${solo.has(key)}" aria-label="Solo ${esc(key)}">S</button></div>`
  }
  const rail = rows
    .map((row, i) => {
      const t = row.track
      const label =
        row.kind === 'element'
          ? `<button data-select="${t.nodeId}">${esc(names.get(t.nodeId)!)}</button>${audition(row)}`
          : row.kind === 'motion'
            ? `<button data-track-select="${t.id}">/ ${esc(t.name)}<small>${t.controls.duration}ms · ${t.controls.delay}ms delay</small></button>${audition(row)}`
            : `<button data-track-select="${t.id}">${esc(t.utility.slice(8))}</button><button data-track-up="${t.id}" aria-label="Move ${esc(t.utility.slice(8))} track up">↑</button><button data-track-delete="${t.id}" aria-label="Delete ${esc(t.utility.slice(8))} track">×</button>`
      return `<div data-row-index="${i}" class="rail-row ${row.kind} ${row.kind === 'motion' ? 'timeline-motion' : ''} ${active === t.id ? 'active' : ''}" style="height:${row.height}px">${label}</div>`
    })
    .join('')
  const time = rows
    .map((row, i) => {
      const t = row.track,
        left = Math.max(0, ((t.controls.delay - start) / span) * 100),
        right = Math.min(
          100,
          ((t.controls.delay + t.controls.duration - start) / span) * 100,
        )
      return `<div data-time-row="${i}" class="time-row ${row.kind} ${row.kind === 'property' ? 'track-row' : ''} ${active === t.id ? 'active' : ''}" ${row.kind === 'property' ? `data-track="${t.id}"` : ''} style="height:${row.height}px">${row.kind === 'property' ? `<div class="track-lane" data-lane="${t.id}"><span class="track-span" style="left:${left}%;width:${Math.max(0, right - left)}%"></span>${t.frames.map(f => `<button class="keyframe ${frames.includes(f.id) ? 'selected' : ''}" data-frame="${f.id}" data-frame-track="${t.id}" style="left:${((t.controls.delay + (t.controls.duration * f.offset) / 100 - start) / span) * 100}%" aria-label="${esc(t.utility.slice(8))} keyframe ${f.offset}%" title="${f.offset}% · ${esc(f.value)}"></button>`).join('')}</div>` : row.kind === 'motion' && t.controls.delay < 0 ? `<span class="preroll-note">${Math.abs(t.controls.delay)}ms advanced at scene zero</span>` : ''}</div>`
    })
    .join('')
  const body = document.getElementById('timeline-body')!
  body.style.width = '100%'
  body.innerHTML = `<div id="track-rail">${rail || '<p class="muted">Select a layer to begin.</p>'}</div><div id="time-viewport"><div id="time-content" style="width:${width}px">${time}<div class="timeline-playhead" id="timeline-playhead"></div></div></div>`
  document.getElementById('ruler-viewport')!.innerHTML =
    `<div class="ruler" style="width:${width}px">${Array.from({ length: 11 }, (_, i) => `<span style="left:${i * 10}%">${((start + (span * i) / 10) / 1000).toFixed(1)}s</span>`).join('')}<input type="range" id="playhead-scrub" min="${start}" max="${project.duration}" step="1" aria-label="Timeline playhead" /></div>`
  document.querySelector<HTMLElement>('#timeline-x>div')!.style.width =
    `${width}px`
  for (const id of ['timeline-x', 'time-viewport', 'ruler-viewport'])
    document.getElementById(id)!.scrollLeft = timeScroll
}
export function setupTimeline() {
  const scroll = document.getElementById('timeline-scroll')!
  scroll.insertAdjacentHTML(
    'beforebegin',
    '<div id="timeline-header"><div class="ruler-label">ELEMENT / MOTION / PROPERTY<div id="rail-resize" role="separator" aria-label="Resize track rail" aria-orientation="vertical" tabindex="0"></div></div><div id="ruler-viewport"></div></div>',
  )
  scroll.insertAdjacentHTML(
    'afterend',
    '<div id="timeline-x-row"><span></span><div id="timeline-x" aria-label="Scroll timeline horizontally" tabindex="0"><div></div></div></div>',
  )
  const bar = document.getElementById('timeline-x')!
  const sync = () => {
    timeScroll = bar.scrollLeft
    for (const id of ['time-viewport', 'ruler-viewport']) {
      const el = document.getElementById(id)
      if (el) el.scrollLeft = timeScroll
    }
  }
  bar.addEventListener('scroll', sync)
  for (const parent of [scroll, document.getElementById('ruler-viewport')!])
    parent.addEventListener(
      'wheel',
      e => {
        if ((e.target as Element).closest('#track-rail')) return
        if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault()
          bar.scrollLeft += e.shiftKey ? e.deltaY || e.deltaX : e.deltaX
          sync()
        }
      },
      { passive: false },
    )
  const handle = document.getElementById('rail-resize')!
  const size = (n: number) => {
    railWidth = Math.max(160, Math.min(420, n))
    document
      .querySelector<HTMLElement>('.timeline-panel')!
      .style.setProperty('--rail-width', `${railWidth}px`)
    handle.setAttribute('aria-valuenow', String(railWidth))
    sync()
  }
  handle.addEventListener('pointerdown', e => {
    e.preventDefault()
    handle.setPointerCapture(e.pointerId)
    const w = railWidth,
      x = e.clientX
    const move = (e: PointerEvent) => size(w + e.clientX - x)
    const end = () => handle.removeEventListener('pointermove', move)
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', end, { once: true })
    handle.addEventListener('pointercancel', end, { once: true })
  })
  handle.addEventListener('keydown', e => {
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
      size(railWidth + (e.key === 'ArrowRight' ? 16 : -16))
    }
  })
  size(innerWidth < 780 ? 180 : 245)
}
