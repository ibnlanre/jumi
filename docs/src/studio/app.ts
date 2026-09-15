import type { ControlEntry, PropertyEntry } from './catalog'
import type { Controls, StudioProject, Track } from './model'

import {
  addFrame,
  candidates,
  defaults,
  documentHtml,
  escapeHtml as esc,
  flatten,
  markup,
  moveFrames,
  parentOf,
  parseClasses,
  trackClasses,
  uid,
  validateProject,
} from './model'
import { SceneSandbox } from './sandbox'
import { makeScene } from './scenes'
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T
const input = (id: string) => $<HTMLInputElement>(id)
const select = (id: string) => $<HTMLSelectElement>(id)
const copy = <T>(value: T): T => structuredClone(value)
const storageKey = 'jumi-studio-project-v1'
let controls: ControlEntry[] = [],
  project = makeScene(),
  properties: PropertyEntry[] = []
let activeTrack =
  project.tracks.find(t => t.nodeId === project.editor.selected[0])?.id ?? ''
let anchor = 0,
  anchorTime = 0,
  playhead = 0,
  playing = false,
  selectedFrames: string[] = [],
  tick = 0
let compileTimer: ReturnType<typeof setTimeout>,
  css = '',
  lastError = '',
  pending = true,
  revision = 0
let timelineStart = 0
let applying = false,
  hovered: null | string = null,
  outputTab = 'html',
  renderingInspector = false,
  timelineZoom = 1
const future: string[] = [],
  past: string[] = []
const sandbox = new SceneSandbox($<HTMLIFrameElement>('scene-frame'), project)
const worker = new Worker(new URL('./compiler.worker.ts', import.meta.url), {
  type: 'module',
})
const currentTrack = () => project.tracks.find(t => t.id === activeTrack)
const currentNode = () =>
  flatten(project.scene.root).find(n => n.id === project.editor.selected[0])
let messageTimer: ReturnType<typeof setTimeout>
function change(fn: () => void) {
  const before = JSON.stringify(project)
  stop()
  try {
    fn()
    validateProject(project, properties)
    remember(before)
    persist()
    render()
    scheduleCompile()
  } catch (e) {
    project = JSON.parse(before)
    sandbox.project = project
    message(e instanceof Error ? e.message : String(e))
    render()
  }
}
function message(text: string) {
  $('studio-message').textContent = text
  $('studio-message').classList.add('visible')
  clearTimeout(messageTimer)
  messageTimer = setTimeout(
    () => $('studio-message').classList.remove('visible'),
    5000,
  )
}
function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(project))
  } catch {
    message('Local storage is unavailable. Use Save project to keep your work.')
  }
}
function remember(before = JSON.stringify(project)) {
  past.push(before)
  if (past.length > 60) past.shift()
  future.length = 0
}
function setSelection(id: string, multi = false) {
  if (!flatten(project.scene.root).some(n => n.id === id)) return
  project.editor.selected = multi
    ? project.editor.selected.includes(id)
      ? project.editor.selected.filter(n => n !== id)
      : [...project.editor.selected, id]
    : [id]
  if (!project.editor.selected.length) project.editor.selected = [id]
  activeTrack = project.tracks.find(t => t.nodeId === id)?.id ?? ''
  selectedFrames = []
  sandbox.project = project
  sandbox.isolate()
  persist()
  render()
}
function stop() {
  playing = false
  cancelAnimationFrame(tick)
  sandbox.pause()
  $('play-button').textContent = '▷'
  $('play-button').setAttribute('aria-label', 'Play')
}
sandbox.onSelect = setSelection
sandbox.onHover = id => {
  hovered = id
  drawOverlays()
}
sandbox.onDrill = id => {
  const n = flatten(project.scene.root).find(n => n.id === id)
  const child = n?.children.find(c => !project.editor.locked.includes(c.id))
  if (child) setSelection(child.id)
}
function scheduleCompile() {
  clearTimeout(compileTimer)
  pending = true
  lastError = ''
  revision++
  $('compile-status').textContent = 'Updating motion…'
  renderOutput()
  const expected = revision
  compileTimer = setTimeout(() => {
    try {
      worker.postMessage({
        candidates: candidates(project),
        revision: expected,
      })
    } catch (e) {
      pending = false
      lastError = e instanceof Error ? e.message : String(e)
      $('compile-status').textContent = lastError
      renderOutput()
    }
  }, 100)
}
worker.onerror = e => {
  pending = false
  lastError = 'The motion compiler could not start. Reload Studio to retry.'
  $('compile-status').textContent = lastError
  message(lastError)
  console.error(e)
}
worker.onmessage = async event => {
  const data = event.data
  if (data.type === 'catalog') {
    properties = data.properties
    controls = data.controls
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) project = validateProject(JSON.parse(saved), properties)
    } catch {
      message(
        'The saved project could not be restored. Your original data remains in local storage until your next edit.',
      )
    }
    activeTrack =
      project.tracks.find(t => t.nodeId === project.editor.selected[0])?.id ??
      ''
    renderProperties()
    render()
    scheduleCompile()
    return
  }
  if (data.revision !== revision) return
  if (data.type === 'error') {
    pending = false
    lastError = data.error
    $('compile-status').textContent =
      'Compilation failed — last valid preview retained'
    message(data.error)
    renderOutput()
    return
  }
  const thisRevision = revision
  css = data.css
  pending = false
  lastError = ''
  applying = true
  try {
    if (!sandbox.ready) {
      await sandbox.load(project, css)
      bindFrame()
      fitScene()
    } else sandbox.patch(project, css)
    if (thisRevision !== revision) return
    sandbox.seek(playhead)
    $('compile-status').textContent =
      `Jumi · ${sandbox.animations.length} motions · ${data.ms}ms build`
    if (data.warnings?.length) message(data.warnings.join(' '))
    renderInfo()
    drawOverlays()
    renderOutput()
  } catch (e) {
    lastError = e instanceof Error ? e.message : String(e)
    message(lastError)
  } finally {
    applying = false
    renderOutput()
  }
}
function propertyMeta() {
  const entry = properties.find(
    p => p.utility === select('property-select').value,
  )
  $('property-meta').textContent = entry
    ? `${entry.types.join(' / ')} · writes ${entry.attribute}${entry.parts.length ? ' (composed)' : ''}. Browser interpolation applies.`
    : 'No matching property.'
}
function render() {
  $('project-name').textContent = project.title
  input('project-duration').value = String(project.duration)
  input('scene-width').value = String(project.scene.width)
  input('scene-height').value = String(project.scene.height)
  select('isolation').value = project.editor.isolation
  input('ghosts').checked = project.editor.ghosts
  input('parent-context').checked = project.editor.parentContext
  input('grid-toggle').checked = project.viewport.grid
  input('canvas-background').value = project.viewport.background
  renderTree()
  renderInfo()
  renderInspector()
  renderTimeline()
  renderOutput()
  viewport()
  document.querySelector<HTMLButtonElement>('[data-action=undo]')!.disabled =
    !past.length
  document.querySelector<HTMLButtonElement>('[data-action=redo]')!.disabled =
    !future.length
}
function renderInfo() {
  const n = currentNode()
  if (!n) return
  const entry = properties.find(p => p.utility === currentTrack()?.utility)
  const info = sandbox.ready ? sandbox.inspect(n.id, entry?.attribute) : null
  $('selection-tag').textContent = n.tag.toUpperCase()
  $('selection-caption').textContent =
    project.editor.selected.length > 1
      ? `${project.editor.selected.length} selected`
      : n.name
  const chain = [n]
  let p = parentOf(project.scene.root, n.id)
  while (p) {
    chain.unshift(p)
    p = parentOf(project.scene.root, p.id)
  }
  $('breadcrumbs').innerHTML = chain
    .map(c => `<button data-select="${c.id}">${esc(c.name)}</button>`)
    .join('<span>/</span>')
  const b = info?.bounds
  $('selection-info').innerHTML =
    `<p class="selected-name">${esc(n.name)}</p><div class="geometry"><span>X <b>${b ? b.x.toFixed(1) : '—'}</b></span><span>Y <b>${b ? b.y.toFixed(1) : '—'}</b></span><span>W <b>${b ? b.width.toFixed(1) : '—'}</b></span><span>H <b>${b ? b.height.toFixed(1) : '—'}</b></span></div><p class="muted" style="margin-top:9px">${n.children.length} children · ${flatten(n).length - 1} descendants · ${Math.max(0, (parentOf(project.scene.root, n.id)?.children.length ?? 1) - 1)} siblings</p>${info?.svgBox ? `<p class="muted">SVG bbox ${info.svgBox.width.toFixed(1)} × ${info.svgBox.height.toFixed(1)}</p>` : ''}<div class="origin-editor"><label>Transform origin<input id="origin-value" value="${esc(info?.origin || '50% 50%')}" /></label><button data-action="origin">Set</button></div>${info ? `<p class="muted" style="margin-top:8px">Computed ${entry?.attribute ?? 'opacity'}: ${esc(info.value || '—')}</p>` : ''}`
}
function renderProperties() {
  const previous = select('property-select').value
  const query = input('property-search').value.toLowerCase()
  const matches = properties.filter(p =>
    `${p.utility} ${p.attribute} ${p.group}`.toLowerCase().includes(query),
  )
  const groups = [...new Set(matches.map(p => p.group))].sort()
  select('property-select').innerHTML = groups
    .map(
      g =>
        `<optgroup label="${g}">${matches
          .filter(p => p.group === g)
          .map(
            p =>
              `<option value="${p.utility}" ${p.nameable ? '' : 'disabled'}>${p.utility.slice(8)}${p.nameable ? '' : ' (keyword modifier)'}</option>`,
          )
          .join('')}</optgroup>`,
    )
    .join('')
  if (matches.some(p => p.utility === previous))
    select('property-select').value = previous
  else if (!query) select('property-select').value = 'animate-opacity'
  propertyMeta()
}
function renderTree() {
  const all = flatten(project.scene.root)
  $('node-count').textContent = `${all.length} OBJECTS`
  const walk = (n: typeof project.scene.root, depth: number): string => {
    const collapsed = project.editor.collapsed.includes(n.id),
      count = project.tracks.filter(t => t.nodeId === n.id).length,
      selected = project.editor.selected.includes(n.id)
    return `<div class="tree-row ${selected ? 'is-selected' : ''} ${project.editor.hidden.includes(n.id) ? 'is-hidden' : ''}" data-node="${n.id}" style="padding-left:${8 + depth * 12}px"><button class="tree-caret" data-collapse="${n.id}" aria-label="${collapsed ? 'Expand' : 'Collapse'} ${esc(n.name)}" ${n.children.length ? `aria-expanded="${!collapsed}"` : 'disabled'}>${n.children.length ? (collapsed ? '▸' : '▾') : '·'}</button><button class="tree-select" data-select="${n.id}" aria-pressed="${selected}"><span class="node-icon">${n.tag === 'svg' ? '◇' : n.children.length ? '▧' : '○'}</span><span>${esc(n.name)}</span></button>${count ? `<span class="tree-count">${count}</span>` : ''}<button class="tree-action" data-lock="${n.id}" aria-label="Lock ${esc(n.name)}" aria-pressed="${project.editor.locked.includes(n.id)}">${project.editor.locked.includes(n.id) ? '■' : '□'}</button><button class="tree-action" data-hide="${n.id}" aria-label="Hide ${esc(n.name)}" aria-pressed="${project.editor.hidden.includes(n.id)}">${project.editor.hidden.includes(n.id) ? '−' : '◉'}</button></div>${collapsed ? '' : n.children.map(c => walk(c, depth + 1)).join('')}`
  }
  $('scene-tree').innerHTML = walk(project.scene.root, 0)
}
const options = (values: string[], chosen: string) =>
  [...new Set([chosen, ...values])]
    .map(v => `<option ${v === chosen ? 'selected' : ''}>${esc(v)}</option>`)
    .join('')
function addTrack() {
  const entry = properties.find(
    p => p.utility === select('property-select').value,
  )
  if (!entry || !entry.nameable) {
    message('Choose a nameable property registration.')
    return
  }
  change(() => {
    for (const id of project.editor.selected) {
      let name = entry.utility.slice(8)
      let index = 2
      while (project.tracks.some(t => t.nodeId === id && t.name === name))
        name = `${entry.utility.slice(8)}-${index++}`
      const value =
        entry.attribute === 'opacity' ? '.25' : suggestValue(entry.attribute)
      const end =
        entry.attribute === 'opacity'
          ? '1'
          : entry.attribute === 'rotate'
            ? '90deg'
            : entry.attribute === 'scale'
              ? '1.2'
              : value
      const t: Track = {
        controls: { ...defaults },
        frames: [
          { id: uid(), offset: 0, value },
          { id: uid(), offset: 100, value: end },
        ],
        id: uid(),
        kind: 'animation',
        name,
        nodeId: id,
        utility: entry.utility,
      }
      project.tracks.push(t)
      activeTrack = t.id
      selectedFrames = [t.frames[1].id]
    }
  })
}
function bindFrame() {
  sandbox.doc.addEventListener('wheel', zoomWheel, { passive: false })
  sandbox.doc.addEventListener('pointerdown', startPan)
}
function deleteFrames() {
  if (!selectedFrames.length) return
  change(() => {
    for (const t of project.tracks) {
      const remaining = t.frames.filter(f => !selectedFrames.includes(f.id))
      if (!remaining.length && t.frames.length !== remaining.length)
        throw Error('Keep at least one keyframe, or delete the track.')
      t.frames = remaining
    }
    selectedFrames = []
  })
}
function download(name: string, content: string, type: string) {
  const link = document.createElement('a')
  const url = URL.createObjectURL(new Blob([content], { type }))
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function drawOverlays() {
  if (!sandbox.ready) return
  const boxes: string[] = []
  const ids = [...project.editor.selected]
  if (hovered && !ids.includes(hovered)) ids.push(hovered)
  if (project.editor.parentContext && project.editor.isolation !== 'none') {
    for (const id of project.editor.selected) {
      const parent = parentOf(project.scene.root, id)
      const b = parent && sandbox.bounds(parent.id)
      if (b)
        boxes.push(
          `<div class="selection-box parent-box" style="left:${b.x}px;top:${b.y}px;width:${b.width}px;height:${b.height}px"></div>`,
        )
    }
  }
  for (const id of ids) {
    const b = sandbox.bounds(id)
    if (!b || project.editor.hidden.includes(id)) continue
    boxes.push(
      `<div class="selection-box ${project.editor.selected.includes(id) ? '' : 'is-hover'}" style="left:${b.x}px;top:${b.y}px;width:${b.width}px;height:${b.height}px"></div>`,
    )
  }
  const originId = currentNode()?.id
  const origin = originId ? sandbox.origin(originId) : null
  if (origin)
    boxes.push(
      `<span class="origin-dot" style="left:${origin.x}px;top:${origin.y}px"></span>`,
    )
  $('scene-overlays').innerHTML = boxes.join('')
}
function editorChange(fn: () => void) {
  fn()
  sandbox.project = project
  sandbox.isolate()
  persist()
  render()
}
function fitScene() {
  const box = $('canvas-viewport').getBoundingClientRect()
  project.viewport.zoom = Math.max(
    0.1,
    Math.min(
      2,
      (box.width - 70) / project.scene.width,
      (box.height - 60) / project.scene.height,
    ),
  )
  project.viewport.x = project.viewport.y = 0
  viewport()
}
function fitSelection() {
  const id = currentNode()?.id
  if (!id || !sandbox.ready) return
  const b = sandbox.bounds(id)
  if (!b || !b.width || !b.height) return
  const view = $('canvas-viewport').getBoundingClientRect()
  project.viewport.zoom = Math.max(
    0.1,
    Math.min(4, (view.width - 100) / b.width, (view.height - 100) / b.height),
  )
  project.viewport.x =
    (project.scene.width / 2 - b.x - b.width / 2) * project.viewport.zoom
  project.viewport.y =
    (project.scene.height / 2 - b.y - b.height / 2) * project.viewport.zoom
  viewport()
  persist()
}
function insertKeyframe() {
  const t = currentTrack()
  if (!t) {
    message('Add a property track first.')
    input('property-search').focus()
    return
  }
  const value =
    input('frame-value')?.value ||
    suggestValue(
      properties.find(p => p.utility === t.utility)?.attribute ?? 'opacity',
    )
  change(() => {
    selectedFrames = [addFrame(t, playhead, value)]
  })
}
function outputText() {
  if (outputTab === 'classes') {
    const node = currentNode()
    return node
      ? project.tracks
          .filter(t => t.nodeId === node.id)
          .flatMap(trackClasses)
          .join('\n')
      : ''
  }
  if (outputTab === 'native') return project.scene.css
  if (outputTab === 'compiled') return css
  return markup(project)
}
function play() {
  if (pending || applying || !sandbox.ready) {
    message('Wait for the current motion update.')
    return
  }
  if (playing) {
    stop()
    return
  }
  if (playhead >= project.duration) playhead = 0
  playing = true
  anchor = performance.now()
  anchorTime = playhead
  sandbox.play(playhead)
  $('play-button').textContent = 'Ⅱ'
  $('play-button').setAttribute('aria-label', 'Pause')
  const frame = (now: number) => {
    if (!playing) return
    playhead = anchorTime + (now - anchor)
    if (playhead >= project.duration) {
      if (input('loop').checked) {
        playhead = 0
        anchor = now
        anchorTime = 0
        sandbox.play(0)
      } else {
        seek(project.duration)
        return
      }
    }
    updateTime()
    drawOverlays()
    tick = requestAnimationFrame(frame)
  }
  tick = requestAnimationFrame(frame)
}
function renderInspector() {
  renderingInspector = true
  try {
    const t = currentTrack()
    if (!t) {
      $('track-inspector').innerHTML =
        '<div class="track-settings muted">Choose a property to start authoring this element.</div>'
      return
    }
    const entry = properties.find(p => p.utility === t.utility)
    const frame = t.frames.find(f => selectedFrames.includes(f.id))
    const c = t.controls
    const easeValues =
      controls.find(c => c.utility === 'animation-timing-function')?.values ??
      []
    $('track-inspector').innerHTML =
      `<div class="track-settings"><h3>${esc(t.utility.slice(8))} <span class="muted">/ ${esc(t.name)}</span></h3><label>Motion name<input data-control="name" value="${esc(t.name)}" /></label><div class="field-grid"><label>Duration · ms<input type="number" min="1" max="120000" data-control="duration" value="${c.duration}" /></label><label>Delay · ms<input type="number" min="-120000" max="120000" data-control="delay" value="${c.delay}" /></label></div><label>Easing<input data-control="easing" value="${esc(c.easing)}" list="easing-values" /></label><datalist id="easing-values">${easeValues
        .filter(v =>
          [
            'ease',
            'ease-in',
            'ease-in-out',
            'ease-out',
            'linear',
            'step-end',
            'step-start',
          ].includes(v),
        )
        .map(v => `<option>${v}</option>`)
        .join(
          '',
        )}<option>cubic-bezier(.4,0,.6,1)</option><option>steps(4, end)</option></datalist><div class="field-grid"><label>Iterations<input data-control="iterations" value="${esc(c.iterations)}" /></label><label>Direction<select data-control="direction">${options(['normal', 'reverse', 'alternate', 'alternate-reverse'], c.direction)}</select></label><label>Fill<select data-control="fill">${options(['both', 'forwards', 'backwards', 'none'], c.fill)}</select></label><label>Composition<select data-control="composition">${options(['replace', 'add', 'accumulate'], c.composition)}</select></label></div><p class="muted">${entry?.parts.length ? `Writes ${entry.attribute}. Other tracks on this compound property may replace it. ` : ''}Easing applies to the whole Jumi slot.</p><div class="keyframe-editor"><h3>${frame ? 'Keyframe · ' + frame.offset + '%' : 'Add a keyframe'}</h3>${frame ? `<label>Offset · %<input id="frame-offset" type="number" min="0" max="100" step="0.1" value="${frame.offset}" /></label>` : ''}<label>${frame ? 'CSS value' : 'Value at playhead'}<input id="frame-value" value="${esc(frame?.value ?? suggestValue(entry?.attribute ?? 'opacity'))}" list="property-values" /></label><datalist id="property-values">${(
        entry?.values ?? []
      )
        .slice(0, 80)
        .map(v => `<option>${esc(v)}</option>`)
        .join(
          '',
        )}</datalist><div class="keyframe-actions"><button data-action="keyframe">+ At playhead</button><button data-action="delete-frames" ${selectedFrames.length ? '' : 'disabled'}>Delete</button></div><p class="muted" style="margin-top:10px">${t.frames.length} frames · ${selectedFrames.length} selected. Values use CSS units, not theme token names.</p></div></div>`
  } finally {
    renderingInspector = false
  }
}
function renderOutput() {
  try {
    $('output-code').textContent = outputText()
  } catch (e) {
    $('output-code').textContent = String(e)
  }
  input('export-button').disabled = pending || !!lastError || applying
  input('copy-output').disabled = pending || !!lastError || applying
  document
    .querySelectorAll<HTMLButtonElement>('[data-output]')
    .forEach(b =>
      b.setAttribute('aria-selected', String(b.dataset.output === outputTab)),
    )
}
function renderTimeline() {
  const tracks = visibleTracks()
  timelineStart = Math.min(0, ...tracks.map(t => t.controls.delay))
  const span = project.duration - timelineStart
  const nodeMap = new Map(flatten(project.scene.root).map(n => [n.id, n.name]))
  const ticks = Array.from(
    { length: 11 },
    (_, i) =>
      `<span style="left:${i * 10}%">${((timelineStart + (span * i) / 10) / 1000).toFixed(1)}s</span>`,
  ).join('')
  $('timeline-body').style.width = `${timelineZoom * 100}%`
  $('timeline-body').innerHTML =
    `<div class="ruler-row"><div class="ruler-label">OBJECT / PROPERTY</div><div class="ruler">${ticks}<input type="range" id="playhead-scrub" min="0" max="${project.duration}" step="1" value="${playhead}" aria-label="Timeline playhead" /></div></div>${
      tracks.length
        ? tracks
            .map(t => {
              const end = Math.min(
                  100,
                  ((t.controls.delay + t.controls.duration - timelineStart) /
                    span) *
                    100,
                ),
                start = Math.max(
                  0,
                  ((t.controls.delay - timelineStart) / span) * 100,
                )
              return `<div class="track-row ${t.id === activeTrack ? 'active' : ''}" data-track="${t.id}"><div class="track-label"><button data-track-select="${t.id}">${esc(t.utility.slice(8))}<small>${esc(nodeMap.get(t.nodeId) || t.nodeId)} / ${esc(t.name)}</small></button><button data-track-up="${t.id}" aria-label="Move ${esc(t.utility.slice(8))} track up">↑</button><button data-track-delete="${t.id}" aria-label="Delete ${esc(t.utility.slice(8))} track">×</button></div><div class="track-lane" data-lane="${t.id}"><span class="track-span" style="left:${start}%;width:${Math.max(0, end - start)}%"></span>${t.frames
                .map(f => {
                  const time =
                    t.controls.delay + (t.controls.duration * f.offset) / 100
                  return `<button class="keyframe ${selectedFrames.includes(f.id) ? 'selected' : ''}" data-frame="${f.id}" data-frame-track="${t.id}" style="left:${((time - timelineStart) / span) * 100}%" aria-label="${esc(t.utility.slice(8))} keyframe ${f.offset}%" title="${f.offset}% · ${esc(f.value)} · ${Math.round(time)}ms"></button>`
                })
                .join('')}</div></div>`
            })
            .join('')
        : '<div class="empty-timeline">Select a layer and add a property to begin.</div>'
    }<div class="timeline-playhead" id="timeline-playhead"></div>`
  $('track-count').textContent =
    `${tracks.length} / ${project.tracks.length} tracks`
  updateTime()
}
function seek(time: number) {
  stop()
  playhead = Math.min(project.duration, Math.max(0, time))
  if (sandbox.ready) sandbox.seek(playhead)
  updateTime()
  drawOverlays()
}
function startPan(event: PointerEvent) {
  if (event.button !== 1) return
  event.preventDefault()
  const startX = event.screenX,
    startY = event.screenY,
    x = project.viewport.x,
    y = project.viewport.y
  const move = (e: PointerEvent) => {
    project.viewport.x = x + e.screenX - startX
    project.viewport.y = y + e.screenY - startY
    viewport()
  }
  const end = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', end)
    sandbox.doc.removeEventListener('pointermove', move)
    sandbox.doc.removeEventListener('pointerup', end)
    persist()
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', end)
  sandbox.doc.addEventListener('pointermove', move)
  sandbox.doc.addEventListener('pointerup', end)
}
function suggestValue(attribute: string) {
  if (sandbox.ready) {
    const n = currentNode()
    if (n) {
      const v = sandbox.inspect(n.id, attribute)?.value
      if (v && v !== 'none' && v !== 'normal' && v !== 'auto') return v
    }
  }
  return attribute.includes('color')
    ? '#d7fc70'
    : attribute === 'rotate'
      ? '0deg'
      : attribute === 'opacity' || attribute === 'scale'
        ? '1'
        : '0px'
}
function undo(redo = false) {
  const from = redo ? future : past,
    to = redo ? past : future
  const value = from.pop()
  if (!value) return
  stop()
  to.push(JSON.stringify(project))
  project = JSON.parse(value)
  sandbox.project = project
  activeTrack =
    project.tracks.find(t => t.nodeId === project.editor.selected[0])?.id ?? ''
  selectedFrames = []
  persist()
  render()
  scheduleCompile()
}
function updateTime() {
  const fraction = Math.min(
    1,
    Math.max(
      0,
      (playhead - timelineStart) / (project.duration - timelineStart),
    ),
  )
  $('time-display').innerHTML =
    `${(playhead / 1000).toFixed(3)} <small>/ ${(project.duration / 1000).toFixed(3)} s</small>`
  const slider = input('playhead-scrub')
  if (slider) slider.value = String(playhead)
  const lane = document.querySelector<HTMLElement>('.ruler'),
    line = $('timeline-playhead')
  if (line && lane)
    line.style.left = `${lane.offsetLeft + lane.clientWidth * fraction}px`
}
function viewport() {
  const p = project.viewport
  const shell = $('frame-shell')
  shell.style.width = `${project.scene.width}px`
  shell.style.height = `${project.scene.height}px`
  shell.style.transform = `translate(-50%,-50%) translate(${p.x}px,${p.y}px) scale(${p.zoom})`
  $('zoom-label').textContent = `${Math.round(p.zoom * 100)}%`
  $('canvas-viewport').classList.toggle('no-grid', !p.grid)
  $('canvas-viewport').style.backgroundColor = p.background
  drawOverlays()
}
function visibleTracks() {
  return input('all-tracks').checked
    ? project.tracks
    : project.tracks.filter(t => project.editor.selected.includes(t.nodeId))
}
function zoomWheel(event: WheelEvent) {
  event.preventDefault()
  project.viewport.zoom = Math.max(
    0.1,
    Math.min(4, project.viewport.zoom * Math.exp(-event.deltaY * 0.002)),
  )
  viewport()
}
$('canvas-viewport').addEventListener('wheel', zoomWheel, { passive: false })
$('canvas-viewport').addEventListener('pointerdown', startPan)
new ResizeObserver(() => {
  viewport()
  updateTime()
}).observe($('canvas-viewport'))
$('scene-tree').addEventListener('pointerover', event => {
  hovered =
    (event.target as Element).closest<HTMLElement>('[data-node]')?.dataset
      .node ?? null
  drawOverlays()
})
$('scene-tree').addEventListener('pointerleave', () => {
  hovered = null
  drawOverlays()
})
document.addEventListener('click', async event => {
  const button = (event.target as Element).closest<HTMLButtonElement>('button')
  if (!button) return
  const d = button.dataset
  if (d.select) {
    setSelection(d.select, (event as MouseEvent).shiftKey)
    return
  }
  if (d.collapse || d.lock || d.hide) {
    const key = d.collapse ? 'collapsed' : d.lock ? 'locked' : 'hidden'
    const id = (d.collapse || d.lock || d.hide)!
    editorChange(() => {
      project.editor[key] = project.editor[key].includes(id)
        ? project.editor[key].filter(n => n !== id)
        : [...project.editor[key], id]
    })
    return
  }
  if (d.trackSelect) {
    activeTrack = d.trackSelect
    selectedFrames = []
    renderInspector()
    renderTimeline()
    renderInfo()
    return
  }
  if (d.trackUp) {
    change(() => {
      const i = project.tracks.findIndex(t => t.id === d.trackUp)
      if (i > 0)
        [project.tracks[i - 1], project.tracks[i]] = [
          project.tracks[i],
          project.tracks[i - 1],
        ]
    })
    return
  }
  if (d.trackDelete) {
    change(() => {
      project.tracks = project.tracks.filter(t => t.id !== d.trackDelete)
      activeTrack =
        project.tracks.find(t => project.editor.selected.includes(t.nodeId))
          ?.id ?? ''
      selectedFrames = []
    })
    return
  }
  if (d.output) {
    outputTab = d.output
    renderOutput()
    return
  }
  switch (d.action) {
    case 'add-track':
      addTrack()
      break
    case 'copy-output':
      try {
        await navigator.clipboard.writeText(outputText())
        message('Copied to clipboard.')
      } catch {
        message('Clipboard unavailable. Select the code to copy it.')
      }
      break
    case 'delete-frames':
      deleteFrames()
      break
    case 'end':
      seek(project.duration)
      break
    case 'expand':
      editorChange(() => (project.editor.collapsed = []))
      break
    case 'export':
      if (!pending && !lastError)
        download('jumi-motion.html', documentHtml(project, css), 'text/html')
      break
    case 'fit-scene':
      fitScene()
      break
    case 'fit-selection':
      fitSelection()
      break
    case 'focus-property':
      input('property-search').focus()
      break
    case 'import-classes':
      $('phrase-error').textContent = ''
      $<HTMLDialogElement>('phrase-dialog').showModal()
      break
    case 'isolate':
      editorChange(
        () =>
          (project.editor.isolation =
            project.editor.isolation === 'none' ? 'subtree' : 'none'),
      )
      break
    case 'keyframe':
      insertKeyframe()
      break
    case 'load':
      input('project-file').click()
      break
    case 'origin': {
      const value = input('origin-value').value
      if (!CSS.supports('transform-origin', value) || /[;{}<>]/.test(value)) {
        message('Enter a valid transform-origin, such as 50% 50%.')
        break
      }
      change(() => {
        for (const id of project.editor.selected)
          project.scene.css += `\n#${id} { transform-origin: ${value}; }`
      })
      break
    }
    case 'play':
    case 'preview':
      play()
      break
    case 'redo':
      undo(true)
      break
    case 'save':
      download(
        'jumi-studio.json',
        JSON.stringify(project, null, 2),
        'application/json',
      )
      break
    case 'stagger': {
      const t = currentTrack()
      if (!t) break
      const ids =
        project.editor.selected.length > 1
          ? project.editor.selected
          : (parentOf(project.scene.root, t.nodeId)?.children.map(
              n => n.id,
            ) ?? [t.nodeId])
      change(() => {
        const baseDelay = t.controls.delay
        ids.forEach((id, i) =>
          project.tracks
            .filter(other => other.nodeId === id)
            .forEach(other => (other.controls.delay = baseDelay + i * 150)),
        )
      })
      message(
        'Sibling starts staggered by 150ms. Select layers to narrow the group.',
      )
      break
    }
    case 'start':
      seek(0)
      break
    case 'sync': {
      const t = currentTrack()
      if (!t) break
      const timing = { ...t.controls }
      change(() => {
        project.tracks
          .filter(other => project.editor.selected.includes(other.nodeId))
          .forEach(other => (other.controls = { ...timing }))
      })
      message(
        'Selected layers now share timing. Each motion keeps its public name.',
      )
      break
    }
    case 'toggle-output':
      document.querySelector('.output-panel')!.classList.toggle('expanded')
      break
    case 'undo':
      undo()
      break
    case 'zoom-in':
      project.viewport.zoom = Math.min(4, project.viewport.zoom * 1.2)
      viewport()
      break
    case 'zoom-out':
      project.viewport.zoom = Math.max(0.1, project.viewport.zoom / 1.2)
      viewport()
      break
  }
})
input('property-search').addEventListener('input', renderProperties)
select('property-select').addEventListener('change', propertyMeta)
document.addEventListener('input', event => {
  const target = event.target as HTMLInputElement
  if (target.id === 'playhead-scrub') seek(Number(target.value))
})
document.addEventListener('change', event => {
  if (renderingInspector) return
  const target = event.target as HTMLInputElement
  const name = target.dataset.control
  if (name) {
    const t = currentTrack()
    if (!t) return
    const value = target.value
    if (
      name === 'easing' &&
      !CSS.supports('animation-timing-function', value)
    ) {
      message(
        'Use a valid CSS easing, such as ease-out or cubic-bezier(.4,0,.6,1).',
      )
      return
    }
    change(() => {
      if (name === 'name') t.name = value
      else if (name === 'duration' || name === 'delay')
        t.controls[name] = Number(value)
      else (t.controls as unknown as Record<string, string>)[name] = value
    })
    return
  }
  if (target.id === 'frame-offset' || target.id === 'frame-value') {
    const t = currentTrack()
    if (!t || !selectedFrames.length) return
    change(() => {
      for (const f of t.frames.filter(f => selectedFrames.includes(f.id))) {
        if (target.id === 'frame-offset') f.offset = Number(target.value)
        else f.value = target.value
      }
    })
    return
  }
  if (target.id === 'project-duration') {
    change(() => {
      project.duration = Number(target.value)
      playhead = Math.min(playhead, project.duration)
    })
    return
  }
  if (target.id === 'scene-width' || target.id === 'scene-height') {
    change(() => {
      const dimension = target.id === 'scene-width' ? 'width' : 'height'
      project.scene[dimension] = Number(target.value)
      project.scene.css += `\n#${project.scene.root.id} { ${dimension}: ${Number(target.value)}px; }`
    })
    fitScene()
    return
  }
  if (target.id === 'isolation') {
    editorChange(
      () =>
        (project.editor.isolation =
          target.value as StudioProject['editor']['isolation']),
    )
    return
  }
  if (target.id === 'ghosts' || target.id === 'parent-context') {
    editorChange(() => {
      if (target.id === 'ghosts') project.editor.ghosts = target.checked
      else project.editor.parentContext = target.checked
    })
    return
  }
  if (target.id === 'grid-toggle') {
    project.viewport.grid = target.checked
    viewport()
    persist()
    return
  }
  if (target.id === 'canvas-background') {
    project.viewport.background = target.value
    viewport()
    persist()
    return
  }
  if (target.id === 'timeline-zoom') {
    timelineZoom = Number(target.value)
    renderTimeline()
    return
  }
  if (target.id === 'all-tracks') {
    renderTimeline()
    return
  }
})
select('scene-picker').addEventListener('change', () => {
  stop()
  remember()
  project = makeScene(select('scene-picker').value)
  sandbox.ready = false
  playhead = 0
  activeTrack =
    project.tracks.find(t => t.nodeId === project.editor.selected[0])?.id ?? ''
  selectedFrames = []
  persist()
  render()
  scheduleCompile()
})
input('project-file').addEventListener('change', async () => {
  const file = input('project-file').files?.[0]
  if (!file) return
  try {
    if (file.size > 1000000) throw Error('Projects must be smaller than 1 MB.')
    const loaded = validateProject(JSON.parse(await file.text()), properties)
    stop()
    remember()
    project = loaded
    sandbox.ready = false
    activeTrack =
      project.tracks.find(t => project.editor.selected.includes(t.nodeId))
        ?.id ?? ''
    selectedFrames = []
    playhead = 0
    persist()
    render()
    scheduleCompile()
    message('Project opened.')
  } catch (e) {
    message(e instanceof Error ? e.message : String(e))
  }
  input('project-file').value = ''
})
$('apply-phrases').addEventListener('click', () => {
  try {
    const tracks = parseClasses(
      $<HTMLTextAreaElement>('phrase-input').value,
      currentNode()!.id,
      properties,
    )
    const next = copy(project)
    next.tracks.push(...tracks)
    validateProject(next, properties)
    change(() => {
      project = next
      activeTrack = tracks[0].id
    })
    $<HTMLDialogElement>('phrase-dialog').close()
  } catch (e) {
    $('phrase-error').textContent = e instanceof Error ? e.message : String(e)
  }
})
document.addEventListener('pointerdown', event => {
  const target = (event.target as Element).closest<HTMLElement>('[data-frame]')
  if (!target || event.button !== 0) return
  event.preventDefault()
  stop()
  activeTrack = target.dataset.frameTrack!
  const id = target.dataset.frame!
  if (event.shiftKey)
    selectedFrames = selectedFrames.includes(id)
      ? selectedFrames.filter(f => f !== id)
      : [...selectedFrames, id]
  else if (!selectedFrames.includes(id)) selectedFrames = [id]
  const before = JSON.stringify(project),
    lane = target.closest<HTMLElement>('.track-lane')!,
    original = copy(project),
    start = event.clientX,
    width = lane.getBoundingClientRect().width
  let moved = false
  renderInspector()
  document
    .querySelectorAll<HTMLElement>('[data-frame]')
    .forEach(e =>
      e.classList.toggle('selected', selectedFrames.includes(e.dataset.frame!)),
    )
  const move = (e: PointerEvent) => {
    const delta =
      ((e.clientX - start) / width) * (project.duration - timelineStart)
    if (Math.abs(e.clientX - start) < 3 && !moved) return
    moved = true
    project = copy(original)
    moveFrames(project, selectedFrames, delta, input('snap').checked ? 1 : 0.01)
    for (const t of project.tracks)
      for (const f of t.frames)
        if (selectedFrames.includes(f.id)) {
          const diamond = document.querySelector<HTMLElement>(
            `[data-frame="${f.id}"]`,
          )
          if (diamond)
            diamond.style.left = `${((t.controls.delay + (t.controls.duration * f.offset) / 100 - timelineStart) / (project.duration - timelineStart)) * 100}%`
        }
    scheduleCompile()
  }
  const end = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', end)
    if (moved) {
      remember(before)
      persist()
      scheduleCompile()
    }
    renderInspector()
    renderTimeline()
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', end, { once: true })
})
document.addEventListener('keydown', event => {
  const tag = (event.target as HTMLElement).tagName
  if (
    ['INPUT', 'SELECT', 'TEXTAREA'].includes(tag) ||
    $<HTMLDialogElement>('phrase-dialog').open
  )
    return
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
    event.preventDefault()
    undo(event.shiftKey)
    return
  }
  if (event.code === 'Space') {
    event.preventDefault()
    play()
  }
  if (event.key === 'Home') {
    event.preventDefault()
    seek(0)
  }
  if (event.key === 'End') {
    event.preventDefault()
    seek(project.duration)
  }
  if (event.key === 'Escape')
    editorChange(() => (project.editor.isolation = 'none'))
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    deleteFrames()
  }
  if (
    ['ArrowLeft', 'ArrowRight'].includes(event.key) &&
    selectedFrames.length
  ) {
    event.preventDefault()
    change(() =>
      moveFrames(
        project,
        selectedFrames,
        (event.key === 'ArrowLeft' ? -1 : 1) *
          (input('snap').checked
            ? (currentTrack()?.controls.duration ?? 1000) / 100
            : 10) *
          (event.shiftKey ? 10 : 1),
        input('snap').checked ? 1 : 0.01,
      ),
    )
  }
})
window.addEventListener('beforeunload', () => worker.terminate())
// Read-only diagnostics support the independent browser parity gate; no editing bypass.
Object.defineProperty(window, '__jumiStudio', {
  value: {
    get catalog() {
      return copy(properties)
    },
    get css() {
      return css
    },
    get error() {
      return lastError
    },
    get exported() {
      return documentHtml(project, css)
    },
    get pending() {
      return pending || applying
    },
    get project() {
      return copy(project)
    },
    get time() {
      return playhead
    },
  },
})
render()
