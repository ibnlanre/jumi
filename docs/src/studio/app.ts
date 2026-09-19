import type { ControlEntry, PropertyEntry } from './catalog'
import type { Controls, StudioProject, Track } from './model'

import { baseCss, baseProperties, sourceStyle, validBase } from './base'
import { bezier, curveDrawing, curveValue, easingMarkup } from './easing'
import {
  addFrame,
  candidates,
  defaults,
  documentHtml,
  escapeHtml as esc,
  exportedTrackClasses,
  flatten,
  markup,
  moveFrames,
  parentOf,
  parseClasses,
  trackName,
  uid,
  validateProject,
} from './model'
import { SceneSandbox } from './sandbox'
import { makeScene } from './scenes'
import { renderTracks, setupTimeline } from './timeline'
import { setupWorkspace, showInspector, workspaceTab } from './workspace'
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T
const input = (id: string) => $<HTMLInputElement>(id)
const select = (id: string) => $<HTMLSelectElement>(id)
const copy = <T>(value: T): T => structuredClone(value)
setupWorkspace()
setupTimeline()
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
let canvasMode = 'select',
  originEnabled = false,
  renderingBase = false
const baseSections = new Set(['Appearance', 'Geometry'])
let applying = false,
  hovered: null | string = null,
  outputTab = workspaceTab(),
  renderingInspector = false,
  timelineZoom = 1
const outputScroll = new Map<string, { left: number; top: number }>()
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
  for (
    let n = parentOf(project.scene.root, id);
    n;
    n = parentOf(project.scene.root, n.id)
  )
    project.editor.collapsed = project.editor.collapsed.filter(c => c !== n!.id)
  showInspector('element', false)
  sandbox.project = project
  sandbox.isolate()
  persist()
  render()
  document
    .querySelector(`[data-node="${id}"]`)
    ?.scrollIntoView({ block: 'nearest' })
  document
    .querySelector(`[data-source="${id}"]`)
    ?.scrollIntoView({ block: 'nearest' })
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
      else persist()
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
      viewport()
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
  select('scene-picker').value = flatten(project.scene.root).some(
    n => n.id === 'petal-1',
  )
    ? 'hero'
    : 'signal'
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
  if (renderingBase) return
  renderingBase = true
  try {
    const basePosition = sandbox.ready
      ? sandbox.baseValues(n.id, ['position']).position
      : 'static'
    const groups = baseProperties(n, basePosition !== 'static')
    const base = sandbox.ready
      ? sandbox.baseValues(n.id, Object.values(groups).flat())
      : {}
    $('selection-info').innerHTML =
      `<p class="selected-name">${esc(n.name)}</p><div class="geometry"><span>W <b>${b ? b.width.toFixed(1) : '—'}</b></span><span>H <b>${b ? b.height.toFixed(1) : '—'}</b></span></div><p class="base-title">BASE STATE</p><p class="base-note">Underlying CSS, before motion. Empty fields restore source values.</p><button data-action="base-preview" class="base-preview">Preview base state</button>${Object.entries(
        groups,
      )
        .filter(([, props]) => props.length)
        .map(
          ([group, props]) =>
            `<details class="base-group" data-base-section="${group}" ${baseSections.has(group) ? 'open' : ''}><summary>${group}</summary><div class="base-fields">${props.map(prop => `<label>${prop}<input ${prop === 'transform-origin' ? 'id="origin-value"' : ''} data-base="${prop}" value="${esc(n.base?.[prop] ?? '')}" placeholder="${esc(base[prop] || 'source')}" aria-label="Base ${prop}" /></label>`).join('')}</div>${group === 'Transform' ? '<button data-action="edit-origin">Edit origin on canvas</button>' : ''}</details>`,
        )
        .join('')}`
    $('selection-info')
      .querySelectorAll<HTMLDetailsElement>('[data-base-section]')
      .forEach(detail =>
        detail.addEventListener('toggle', () => {
          if (detail.open) baseSections.add(detail.dataset.baseSection!)
          else baseSections.delete(detail.dataset.baseSection!)
        }),
      )
  } finally {
    renderingBase = false
  }
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
      const name = trackName(entry.utility, project.tracks, id)
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
        frames: input('start-from-base')?.checked
          ? [{ id: uid(), offset: 100, value: end }]
          : [
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
      showInspector('keyframe')
      selectedFrames = [t.frames[t.frames.length - 1].id]
    }
  })
}
function bindFrame() {
  sandbox.doc.addEventListener('wheel', zoomWheel, { passive: false })
  sandbox.doc.addEventListener('pointerdown', startPan)
  sandbox.doc.addEventListener('keydown', studioKeydown)
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
  const showOrigin =
    originEnabled ||
    canvasMode === 'transform' ||
    (canvasMode === 'select' &&
      document.querySelector('#studio-app')?.getAttribute('data-inspector') !==
        'element' &&
      /rotate|scale|translate|transform/.test(currentTrack()?.utility ?? ''))
  const origin = originId && showOrigin ? sandbox.origin(originId) : null
  if (origin)
    boxes.push(
      `<button class="origin-dot" data-overlay-handle="origin" aria-label="Drag transform origin" title="Drag transform origin" style="left:${origin.x}px;top:${origin.y}px"></button>`,
    )
  if (canvasMode !== 'select' && currentNode()) {
    const id = currentNode()!.id,
      b = sandbox.bounds(id)
    if (b) {
      boxes.push(
        `<div class="manipulation-plane" data-manipulation="translate" title="Move · authors base translate" style="left:${b.x}px;top:${b.y}px;width:${b.width}px;height:${b.height}px"></div>`,
      )
      if (canvasMode === 'transform')
        boxes.push(
          `<button class="manipulation-handle scale" data-manipulation="scale" aria-label="Scale element" style="left:${b.x + b.width}px;top:${b.y + b.height}px"></button><button class="manipulation-handle rotate" data-manipulation="rotate" aria-label="Rotate element" style="left:${b.x + b.width / 2}px;top:${b.y - 24}px"></button>`,
        )
    }
  }
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
  persist()
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
          .flatMap(t => exportedTrackClasses(t, project))
          .join('\n')
      : ''
  }
  if (outputTab === 'native') return baseCss(project)
  if (outputTab === 'compiled') return css
  return markup(project)
}
function play(scope: SceneSandbox['audition'] = { kind: 'scene' }) {
  if (pending || applying || !sandbox.ready) {
    message('Wait for the current motion update.')
    return
  }
  if (playing && JSON.stringify(sandbox.audition) === JSON.stringify(scope)) {
    stop()
    return
  }
  stop()
  sandbox.audition = scope
  sandbox.refreshAudition(playhead)
  auditionStatus()
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
      `<div class="track-settings"><h3>/ ${esc(t.name)}</h3><div class="motion-properties">${project.tracks
        .filter(other => other.nodeId === t.nodeId && other.name === t.name)
        .map(
          other =>
            `<button data-track-select="${other.id}" aria-pressed="${other.id === t.id}">${esc(other.utility.slice(8))}</button>`,
        )
        .join(
          '',
        )}</div><label>Motion name<input data-control="name" value="${esc(t.name)}" /></label><div class="field-grid"><label>Duration · ms<input type="number" min="1" max="120000" data-control="duration" value="${c.duration}" /></label><label>Delay · ms<input type="number" min="-120000" max="120000" data-control="delay" value="${c.delay}" /></label></div><label>Easing<input data-control="easing" value="${esc(c.easing)}" list="easing-values" /></label><datalist id="easing-values">${easeValues
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
    const raw = document.querySelector('[data-control="easing"]')!
    raw.parentElement!.insertAdjacentHTML('beforebegin', easingMarkup(c.easing))
    raw.parentElement!.insertAdjacentHTML(
      'afterend',
      `<p class="time-note" id="motion-local-time">Scene ${playhead.toFixed(0)}ms · local ${(playhead - c.delay).toFixed(0)}ms</p>`,
    )
  } finally {
    renderingInspector = false
  }
}
function renderOutput() {
  try {
    if (outputTab === 'html') {
      const lines = markup(project).split('\n')
      $('output-code').innerHTML =
        '<div class="source-hint">Click a tag to select · Hover to locate · ⌘/Ctrl-click to isolate · Shift-click to add</div>' +
        lines
          .map(line => {
            const id = / id="([^" ]+)"/.exec(line)?.[1]
            return id
              ? `<button class="source-row" data-source="${id}" aria-current="${project.editor.selected.includes(id)}">${esc(line)}</button>`
              : `<span class="source-row">${esc(line)}</span>`
          })
          .join('')
    } else $('output-code').textContent = outputText()
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
  timelineStart = input('show-preroll')?.checked
    ? Math.min(0, ...tracks.map(t => t.controls.delay))
    : 0
  renderTracks(
    project,
    tracks,
    timelineStart,
    timelineZoom,
    activeTrack,
    selectedFrames,
    sandbox.muted,
    sandbox.solo,
  )
  $('track-count').textContent =
    `${tracks.length} / ${project.tracks.length} tracks`
  updateTime()
}
function seek(time: number) {
  stop()
  playhead = Math.min(project.duration, Math.max(timelineStart, time))
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
  const motion = currentTrack()
  if ($('motion-local-time') && motion)
    $('motion-local-time').textContent =
      `Scene ${playhead.toFixed(0)}ms · local ${(playhead - motion.controls.delay).toFixed(0)}ms`
  const slider = input('playhead-scrub')
  if (slider) slider.value = String(playhead)
  const lane = document.querySelector<HTMLElement>('.ruler'),
    line = $('timeline-playhead')
  if (line && lane) line.style.left = `${lane.clientWidth * fraction}px`
}
function viewport() {
  const p = project.viewport
  const shell = $('frame-shell')
  shell.style.width = `${project.scene.width}px`
  shell.style.height = `${project.scene.height}px`
  shell.style.transform = `translate(-50%,-50%) translate(${p.x}px,${p.y}px) scale(${p.zoom})`
  $('zoom-label').textContent = `${Math.round(p.zoom * 100)}%`
  $('canvas-viewport').classList.toggle('no-grid', !p.grid)
  $('canvas-viewport').style.backgroundColor =
    p.background === '#e1e4da' ? 'var(--canvas-surround)' : p.background
  drawOverlays()
}
function visibleTracks() {
  return input('all-tracks').checked
    ? project.tracks
    : project.tracks.filter(t => project.editor.selected.includes(t.nodeId))
}
let viewportSave: ReturnType<typeof setTimeout>
function zoomWheel(event: WheelEvent) {
  event.preventDefault()
  project.viewport.zoom = Math.max(
    0.1,
    Math.min(4, project.viewport.zoom * Math.exp(-event.deltaY * 0.002)),
  )
  viewport()
  clearTimeout(viewportSave)
  viewportSave = setTimeout(persist, 150)
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
  if (d.source) {
    setSelection(d.source, event.shiftKey)
    if (event.metaKey || event.ctrlKey)
      editorChange(() => {
        project.editor.isolation = 'subtree'
      })
    return
  }
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
    const track = project.tracks.find(t => t.id === d.trackSelect)
    if (track && !project.editor.selected.includes(track.nodeId))
      setSelection(track.nodeId)
    activeTrack = d.trackSelect
    selectedFrames = []
    showInspector('motion')
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
    outputScroll.set(outputTab, {
      left: $('output-code').scrollLeft,
      top: $('output-code').scrollTop,
    })
    outputTab = d.output
    renderOutput()
    const position = outputScroll.get(outputTab)
    $('output-code').scrollTo(position?.left ?? 0, position?.top ?? 0)
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
      showInspector('element')
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
          project.scene.css = originRule(project.scene.css, id, value)
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
      persist()
      break
    case 'zoom-out':
      project.viewport.zoom = Math.max(0.1, project.viewport.zoom / 1.2)
      viewport()
      persist()
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
      const instance = project.tracks.filter(
        other => other.nodeId === t.nodeId && other.name === t.name,
      )
      for (const other of instance) {
        if (name === 'name') other.name = value
        else if (name === 'duration' || name === 'delay')
          other.controls[name] = Number(value)
        else (other.controls as unknown as Record<string, string>)[name] = value
      }
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
  sandbox.audition = { kind: 'scene' }
  sandbox.muted.clear()
  sandbox.solo.clear()
  auditionStatus()
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
  const previousFrames = [...selectedFrames]
  const selectedTrack = project.tracks.find(
    t => t.id === target.dataset.frameTrack,
  )!
  if (!project.editor.selected.includes(selectedTrack.nodeId))
    setSelection(selectedTrack.nodeId, event.shiftKey)
  activeTrack = target.dataset.frameTrack!
  showInspector('keyframe')
  if (event.shiftKey) selectedFrames = previousFrames
  const id = target.dataset.frame!
  if (event.shiftKey)
    selectedFrames = selectedFrames.includes(id)
      ? selectedFrames.filter(f => f !== id)
      : [...selectedFrames, id]
  else if (!selectedFrames.includes(id)) selectedFrames = [id]
  const before = JSON.stringify(project),
    lane = document.querySelector<HTMLElement>(
      `[data-lane="${selectedTrack.id}"]`,
    )!,
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
function studioKeydown(event: KeyboardEvent) {
  if (
    event.defaultPrevented ||
    (event.target as Element).closest(
      '[data-ease-handle],[role=separator],[role=tab]',
    )
  )
    return
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
  if (event.altKey && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
    event.preventDefault()
    const n = currentNode(),
      target =
        event.key === 'ArrowUp'
          ? parentOf(project.scene.root, n!.id)
          : n?.children[0]
    if (target) setSelection(target.id)
    return
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
}
document.addEventListener('keydown', studioKeydown)
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

// Workspace interactions share the same authoring state and browser preview.
$('output-code').addEventListener('pointerover', event => {
  hovered =
    (event.target as Element).closest<HTMLElement>('[data-source]')?.dataset
      .source ?? null
  drawOverlays()
})
$('output-code').addEventListener('pointerleave', () => {
  hovered = null
  drawOverlays()
})
document
  .querySelector('.timeline-toolbar')!
  .insertAdjacentHTML(
    'beforeend',
    '<label title="Inspect frames before scene time zero"><input type="checkbox" id="show-preroll" /> Pre-roll</label>',
  )
input('show-preroll').addEventListener('change', () => {
  renderTimeline()
  if (playhead < timelineStart) seek(timelineStart)
})
function setEasing(value: string) {
  const track = currentTrack()
  if (!track || !CSS.supports('animation-timing-function', value)) return
  change(() => {
    project.tracks
      .filter(t => t.nodeId === track.nodeId && t.name === track.name)
      .forEach(t => {
        t.controls.easing = value
      })
  })
}
document.addEventListener('input', event => {
  const target = event.target as HTMLInputElement
  if (target.id === 'ease-search')
    document
      .querySelectorAll<HTMLButtonElement>('[data-ease-preset]')
      .forEach(b => {
        b.hidden = !b.textContent?.includes(target.value.toLowerCase())
      })
})
document.addEventListener('click', event => {
  const button = (event.target as Element).closest<HTMLElement>(
    '[data-ease-preset]',
  )
  if (button) setEasing(button.dataset.easePreset!)
})
document.addEventListener('change', event => {
  const target = event.target as HTMLInputElement
  if (renderingInspector) return
  if (target.dataset.easeCoordinate !== undefined) {
    const points = bezier(currentTrack()?.controls.easing ?? '')
    if (!points) return
    points[Number(target.dataset.easeCoordinate)] = Number(target.value)
    if (bezier(curveValue(points))) setEasing(curveValue(points))
    else message('Bézier X coordinates must be between 0 and 1.')
  }
})
document.addEventListener('keydown', event => {
  const target = (event.target as Element).closest<HTMLElement>(
    '[data-ease-handle]',
  )
  if (!target || !event.key.startsWith('Arrow')) return
  event.preventDefault()
  const p = bezier(currentTrack()?.controls.easing ?? '')!
  const index = Number(target.dataset.easeHandle) * 2
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
    p[index] = Math.max(
      0,
      Math.min(1, p[index] + (event.key === 'ArrowRight' ? 0.01 : -0.01)),
    )
  else p[index + 1] += event.key === 'ArrowUp' ? 0.01 : -0.01
  setEasing(curveValue(p))
  document
    .querySelector<HTMLElement>(`[data-ease-handle="${index / 2}"]`)
    ?.focus()
})
document.addEventListener('pointerdown', event => {
  const handle = (event.target as Element).closest<HTMLElement>(
    '[data-ease-handle]',
  )
  if (!handle || event.button !== 0) return
  event.preventDefault()
  stop()
  const before = JSON.stringify(project),
    index = Number(handle.dataset.easeHandle) * 2,
    track = currentTrack()!,
    points = bezier(track.controls.easing)!
  const svg = document.querySelector<SVGSVGElement>('#ease-curve')!,
    matrix = svg.getScreenCTM()!.inverse()
  // Capture on the stable SVG; the curve/handles may redraw during the drag.
  svg.setPointerCapture(event.pointerId)
  const move = (e: PointerEvent) => {
    const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix)
    points[index] = Math.max(0, Math.min(1, (point.x - 30) / 180))
    points[index + 1] = (150 - point.y) / 120
    const value = curveValue(points)
    project.tracks
      .filter(t => t.nodeId === track.nodeId && t.name === track.name)
      .forEach(t => {
        t.controls.easing = value
      })
    $('ease-drawing').innerHTML = curveDrawing(points)
    document.querySelector<HTMLInputElement>('[data-control=easing]')!.value =
      value
    document
      .querySelectorAll<HTMLInputElement>('[data-ease-coordinate]')
      .forEach((el, i) => {
        el.value = String(Math.round(points[i] * 1000) / 1000)
      })
    scheduleCompile()
  }
  const end = () => {
    svg.removeEventListener('pointermove', move)
    remember(before)
    persist()
    renderInspector()
    scheduleCompile()
  }
  svg.addEventListener('pointermove', move)
  svg.addEventListener('pointerup', end, { once: true })
  svg.addEventListener('pointercancel', end, { once: true })
})
function auditionStatus() {
  const scope = sandbox.audition
  $('audition-status').textContent =
    scope.kind === 'scene'
      ? `Scene${sandbox.solo.size ? ' · Solo active' : ''}${sandbox.muted.size ? ' · Muted motions' : ''}`
      : scope.kind === 'base'
        ? 'Base state · motion off'
        : `${scope.kind} · ${scope.name || scope.nodeId}`
}

function originRule(base: string, id: string, value: string) {
  const marker = `/* Studio origin ${id} */`
  const start = base.indexOf(marker)
  if (start >= 0) {
    const end = base.indexOf('}', start)
    base = base.slice(0, start) + base.slice(end + 1)
  }
  return base.trimEnd() + `\n${marker}\n#${id} { transform-origin: ${value}; }`
}
function previewBase() {
  stop()
  sandbox.audition = { kind: 'base' }
  sandbox.refreshAudition(playhead)
  auditionStatus()
  drawOverlays()
}
function setBase(property: string, value: string) {
  const n = currentNode()
  if (!n) return
  if (
    value &&
    (!validBase(n, property, value) || !CSS.supports(property, value))
  ) {
    message(`Use a valid CSS ${property} value.`)
    return
  }
  change(() => writeBase(n.id, property, value))
}
function writeBase(id: string, property: string, value: string) {
  const n = flatten(project.scene.root).find(n => n.id === id)!
  n.base ??= {}
  if (value) n.base[property] = value
  else delete n.base[property]
  const el = sandbox.element(id)
  if (el) el.style.cssText = sourceStyle(n)
}
document
  .querySelector('.add-property')!
  .insertAdjacentHTML(
    'beforeend',
    '<label class="check-label"><input id="start-from-base" type="checkbox" checked /> Start from underlying base value</label>',
  )
document
  .querySelector('.canvas-tools')!
  .insertAdjacentHTML(
    'afterbegin',
    '<div class="canvas-mode" aria-label="Canvas tool"><button data-canvas-mode="select" aria-pressed="true">Select</button><button data-canvas-mode="move" aria-pressed="false">Move</button><button data-canvas-mode="transform" aria-pressed="false">Transform</button><button data-action="edit-origin" title="Toggle origin editing">Origin</button></div>',
  )
$('canvas-viewport').insertAdjacentHTML(
  'beforeend',
  '<output class="manipulation-feedback" id="manipulation-feedback" hidden></output>',
)
document
  .querySelector('.timeline-toolbar')!
  .insertAdjacentHTML(
    'beforeend',
    '<span id="audition-status">Scene</span><button data-action="reset-audition">Reset audition</button>',
  )
// Group scene transport separately from timeline editing/choreography controls.
const toolbar = document.querySelector('.timeline-toolbar')!
for (const [label, selectors] of [
  ['Scene', ['.transport', '#project-duration', '#loop']],
  ['Edit', ['#snap', '#timeline-zoom', '#all-tracks', '#show-preroll']],
  ['Choreography', ['[data-action=stagger]', '[data-action=sync]']],
] as [string, string[]][]) {
  const group = document.createElement('fieldset')
  group.setAttribute('aria-label', label)
  for (const selector of selectors) {
    const el = toolbar.querySelector(selector)
    if (el) group.append(el.closest('label') ?? el)
  }
  toolbar.append(group)
}
document.addEventListener('change', e => {
  const target = e.target as HTMLInputElement
  if (target.dataset.base && !renderingBase)
    setBase(target.dataset.base, target.value.trim())
})
document.addEventListener('focusin', e => {
  if ((e.target as HTMLElement).dataset.base === 'transform-origin') {
    originEnabled = true
    drawOverlays()
  }
})
document.addEventListener('click', e => {
  const b = (e.target as Element).closest<HTMLElement>('button')
  if (!b) return
  const d = b.dataset
  if (d.inspector) {
    drawOverlays()
    return
  }
  if (d.canvasMode) {
    canvasMode = d.canvasMode
    originEnabled = false
    document
      .querySelectorAll('[data-canvas-mode]')
      .forEach(el =>
        el.setAttribute(
          'aria-pressed',
          String((el as HTMLElement).dataset.canvasMode === canvasMode),
        ),
      )
    drawOverlays()
  }
  if (d.action === 'base-preview') previewBase()
  if (d.action === 'edit-origin') {
    originEnabled = !originEnabled
    drawOverlays()
  }
  if (d.action === 'reset-audition') {
    stop()
    sandbox.audition = { kind: 'scene' }
    sandbox.muted.clear()
    sandbox.solo.clear()
    sandbox.refreshAudition(playhead)
    renderTimeline()
    auditionStatus()
    drawOverlays()
  }
  if (d.audition) {
    const [kind, nodeId, name] = d.audition.split(':')
    play({ kind: kind as 'element' | 'motion', name, nodeId })
  }
  if (d.mute || d.solo) {
    stop()
    const key = (d.mute || d.solo)!,
      set = d.mute ? sandbox.muted : sandbox.solo
    if (set.has(key)) set.delete(key)
    else set.add(key)
    sandbox.refreshAudition(playhead)
    renderTimeline()
    auditionStatus()
    drawOverlays()
  }
})
document.addEventListener('pointerdown', event => {
  const handle = (event.target as Element).closest<HTMLElement>(
    '[data-manipulation],[data-overlay-handle="origin"]',
  )
  if (!handle || event.button !== 0 || !currentNode()) return
  event.preventDefault()
  stop()
  const before = JSON.stringify(project),
    id = currentNode()!.id,
    property = handle.dataset.manipulation || 'transform-origin',
    scope = { ...sandbox.audition }
  sandbox.audition = { kind: 'base' }
  sandbox.refreshAudition(playhead)
  showInspector('element', false)
  baseSections.add('Transform')
  renderInfo()
  const basis = sandbox.manipulationBasis(id),
    origin = property === 'transform-origin' ? sandbox.originHandle(id) : null
  if (!basis || (property === 'transform-origin' && !origin)) {
    sandbox.audition = scope
    sandbox.refreshAudition(playhead)
    message(
      'Use exact base values for this transform. Direct manipulation requires invertible 2D numeric transforms.',
    )
    return
  }
  const overlay = $('scene-overlays'),
    shell = $('frame-shell').getBoundingClientRect(),
    startX = event.clientX,
    startY = event.clientY,
    zoom = project.viewport.zoom
  const initial = basis.delta(
    (startX - shell.x) / zoom - basis.origin.x,
    (startY - shell.y) / zoom - basis.origin.y,
  )
  const angle = Math.atan2(initial.y, initial.x),
    radius = Math.hypot(initial.x, initial.y)
  let moved = false
  overlay.setPointerCapture(event.pointerId)
  const round = (n: number) => Math.round(n * 100) / 100
  const move = (e: PointerEvent) => {
    if (
      Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) < 2 &&
      !moved
    )
      return
    moved = true
    const delta = basis.delta(
      (e.clientX - startX) / zoom,
      (e.clientY - startY) / zoom,
    )
    const vector = basis.delta(
      (e.clientX - shell.x) / zoom - basis.origin.x,
      (e.clientY - shell.y) / zoom - basis.origin.y,
    )
    let value = ''
    if (property === 'translate')
      value = `${round(basis.translate[0] + delta.x)}px ${round(basis.translate[1] + delta.y)}px`
    if (property === 'rotate')
      value = `${round(basis.rotate + ((Math.atan2(vector.y, vector.x) - angle) * 180) / Math.PI)}deg`
    if (property === 'scale') {
      const ratio = Math.max(
        0.01,
        Math.hypot(vector.x, vector.y) / Math.max(1, radius),
      )
      value = `${round(basis.scale[0] * ratio)} ${round(basis.scale[1] * ratio)}`
    }
    if (property === 'transform-origin')
      value = origin!.value(
        (e.clientX - shell.x) / zoom,
        (e.clientY - shell.y) / zoom,
      )
    writeBase(id, property, value)
    sandbox.doc.getElementById('scene-base')!.textContent = baseCss(project)
    const field = document.querySelector<HTMLInputElement>(
      `[data-base="${property}"]`,
    )
    if (field) field.value = value
    $('manipulation-feedback').hidden = false
    $('manipulation-feedback').textContent =
      `Base ${property}: ${value}${property === 'translate' ? ` · Δ ${round(delta.x)}, ${round(delta.y)}px` : ''}`
    renderOutput()
    drawOverlays()
  }
  const end = (e: PointerEvent) => {
    overlay.removeEventListener('pointermove', move)
    overlay.removeEventListener('pointerup', end)
    overlay.removeEventListener('pointercancel', end)
    if (e.type === 'pointercancel') project = JSON.parse(before)
    else if (moved) {
      remember(before)
      persist()
    }
    sandbox.project = project
    sandbox.audition = scope
    sandbox.refreshAudition(playhead)
    $('manipulation-feedback').hidden = true
    renderInfo()
    renderOutput()
    drawOverlays()
    auditionStatus()
  }
  overlay.addEventListener('pointermove', move)
  overlay.addEventListener('pointerup', end)
  overlay.addEventListener('pointercancel', end)
})
