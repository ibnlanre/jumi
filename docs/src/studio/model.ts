import type { PropertyEntry } from './catalog'
export type Controls = {
  composition: string
  delay: number
  direction: string
  duration: number
  easing: string
  fill: string
  iterations: string
}
export type Frame = { id: string; offset: number; value: string }
export type SceneNode = {
  attributes: Record<string, string>
  children: SceneNode[]
  id: string
  name: string
  tag: string
  text?: string
}
export type StudioProject = {
  duration: number
  editor: {
    collapsed: string[]
    ghosts: boolean
    hidden: string[]
    isolation: 'children' | 'none' | 'selection' | 'subtree'
    locked: string[]
    parentContext: boolean
    selected: string[]
  }
  scene: { css: string; height: number; root: SceneNode; width: number }
  title: string
  tracks: Track[]
  version: 1
  viewport: {
    background: string
    grid: boolean
    x: number
    y: number
    zoom: number
  }
}
export type Track = {
  controls: Controls
  frames: Frame[]
  id: string
  kind: 'animation'
  name: string
  nodeId: string
  utility: string
}
export const defaults: Controls = {
  composition: 'replace',
  delay: 0,
  direction: 'normal',
  duration: 2000,
  easing: 'ease-in-out',
  fill: 'both',
  iterations: '1',
}
export const uid = () =>
  `m${globalThis.crypto.randomUUID().replaceAll('-', '').slice(0, 10)}`
export const flatten = (root: SceneNode): SceneNode[] => [
  root,
  ...root.children.flatMap(flatten),
]
export function parentOf(root: SceneNode, id: string): SceneNode | undefined {
  return flatten(root).find(n => n.children.some(c => c.id === id))
}
export const escapeHtml = (s: string) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
export function addFrame(track: Track, time: number, value: string): string {
  const offset =
    Math.round(
      Math.max(
        0,
        Math.min(
          100,
          ((time - track.controls.delay) / track.controls.duration) * 100,
        ),
      ) * 1000,
    ) / 1000
  const found = track.frames.find(f => Math.abs(f.offset - offset) < 0.001)
  if (found) {
    found.value = value
    return found.id
  }
  const id = uid()
  track.frames.push({ id, offset, value })
  track.frames.sort((a, b) => a.offset - b.offset)
  return id
}
export function candidates(project: StudioProject): string[] {
  const identities = new Set<string>()
  const names = new Map<string, string>()
  for (const t of project.tracks) {
    const key = `${t.nodeId}:${t.utility}:${phrase(t)}`
    if (identities.has(key))
      throw Error(
        'Identical phrases on one property share a Jumi slot. Merge these tracks or change their phrase.',
      )
    identities.add(key)
    const address = `${t.nodeId}:${t.name}`,
      controls = JSON.stringify(t.controls)
    if (names.has(address) && names.get(address) !== controls)
      throw Error(
        `Tracks named ${t.name} on the same element must share controls.`,
      )
    names.set(address, controls)
  }
  return [
    ...new Set([
      ...flatten(project.scene.root).flatMap(n =>
        (n.attributes.class || '').split(/\s+/).filter(Boolean),
      ),
      ...project.tracks.flatMap(trackClasses),
    ]),
  ].sort()
}
export function cssValue(value: string): string {
  if (
    !value.trim() ||
    /[;{}<>|\r\n]/.test(value) ||
    /url\s*\(|@import|expression\s*\(/i.test(value)
  )
    throw new Error(
      'Use a CSS value without URLs, semicolons, braces, or phrase separators.',
    )
  // Class grammar: escape literal underscores before encoding whitespace.
  return value
    .trim()
    .replaceAll('\\', '\\\\')
    .replaceAll('_', '\\_')
    .replace(/\s/g, '_')
}
export function documentHtml(
  project: StudioProject,
  generated: string,
  editor = false,
): string {
  const safeStyle = (s: string) => s.replace(/<\/style/gi, '<\\/style')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:;"><title>${escapeHtml(project.title)}</title><style id="jumi-output">${safeStyle(generated)}</style><style id="scene-base">${safeStyle(project.scene.css)}</style>${editor ? '<style id="studio-isolation"></style>' : ''}</head><body>${markup(project)}</body></html>`
}
export function markup(project: StudioProject): string {
  const render = (node: SceneNode, level: number): string => {
    const indent = '  '.repeat(level)
    const attrs = {
      ...node.attributes,
      class: [
        node.attributes.class || '',
        ...project.tracks
          .filter(t => t.nodeId === node.id)
          .flatMap(trackClasses),
      ]
        .filter(Boolean)
        .join(' '),
      id: node.id,
    }
    const attr = Object.entries(attrs)
      .filter(([, v]) => v !== '')
      .map(([k, v]) => ` ${k}="${escapeHtml(v)}"`)
      .join('')
    return `${indent}<${node.tag}${attr}>${node.children.length ? '\n' : ''}${node.text ? escapeHtml(node.text) : ''}${node.children.map(n => render(n, level + 1)).join('\n')}${node.children.length ? '\n' + indent : ''}</${node.tag}>`
  }
  return render(project.scene.root, 0)
}
export function moveFrames(
  project: StudioProject,
  ids: string[],
  deltaMs: number,
  snap: number,
): void {
  const proposed = project.tracks.map(t => ({
    ...t,
    frames: t.frames.map(f =>
      ids.includes(f.id)
        ? {
            ...f,
            offset: Math.max(
              0,
              Math.min(
                100,
                Math.round(
                  (f.offset + t.controls.duration ** -1 * deltaMs * 100) / snap,
                ) * snap,
              ),
            ),
          }
        : f,
    ),
  }))
  for (const t of proposed)
    if (new Set(t.frames.map(f => f.offset)).size !== t.frames.length) return
  project.tracks = proposed
}
export function phrase(track: Track): string {
  if (!track.frames.length)
    throw new Error('A track needs at least one keyframe.')
  const sorted = [...track.frames].sort((a, b) => a.offset - b.offset)
  if (new Set(sorted.map(f => f.offset)).size !== sorted.length)
    throw new Error('Two keyframes cannot occupy the same offset on a track.')
  return sorted
    .map(f => {
      if (!Number.isFinite(f.offset) || f.offset < 0 || f.offset > 100)
        throw new Error('Keyframe offsets must be between 0 and 100.')
      return `${Math.round(f.offset * 1000) / 1000}:${cssValue(f.value)}`
    })
    .join('|')
}
export function trackClasses(track: Track): string[] {
  if (!/^animate-[a-z][a-z0-9-]*$/.test(track.utility))
    throw new Error('Choose a registered Jumi property.')
  if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(track.name))
    throw new Error(
      'Motion names must start with a letter and contain letters, digits, or hyphens.',
    )
  const c = track.controls
  if (
    !Number.isFinite(c.duration) ||
    c.duration < 1 ||
    c.duration > 120000 ||
    !Number.isFinite(c.delay) ||
    Math.abs(c.delay) > 120000
  )
    throw new Error(
      'Use a duration from 1–120000ms and a delay within ±120000ms.',
    )
  if (!/^(infinite|\d+(\.\d+)?)$/.test(c.iterations) || c.iterations === '0')
    throw new Error('Iterations must be positive or infinite.')
  return [
    `${track.utility}-[${phrase(track)}]/${track.name}`,
    `animation-duration-[${c.duration}ms]/${track.name}`,
    `animation-delay-[${c.delay}ms]/${track.name}`,
    `animation-timing-function-[${cssValue(c.easing)}]/${track.name}`,
    `animation-iteration-count-[${c.iterations}]/${track.name}`,
    `animation-direction-${c.direction}/${track.name}`,
    `animation-fill-mode-${c.fill}/${track.name}`,
    `animation-composition-${c.composition}/${track.name}`,
  ]
}
const allowedTags = new Set(
  'div section article main header footer nav aside span p h1 h2 h3 h4 button ul ol li label strong em i b small svg g path circle ellipse rect line polyline polygon text tspan defs linearGradient radialGradient stop clipPath mask'.split(
    ' ',
  ),
)
const allowedAttrs =
  /^(class|style|title|role|aria-[a-z-]+|data-[a-z-]+|viewBox|xmlns|x|y|x1|y1|x2|y2|cx|cy|r|rx|ry|d|points|width|height|fill|fill-rule|fill-opacity|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-dasharray|stroke-dashoffset|stroke-opacity|transform|transform-origin|opacity|offset|stop-color|stop-opacity|gradientUnits|gradientTransform|clip-path|mask|preserveAspectRatio)$/
/** Deliberately narrow reverse parser: plain, named phrases and matching public controls. */
export function parseClasses(
  classes: string,
  nodeId: string,
  catalog: PropertyEntry[],
): Track[] {
  const tokens = classes.trim().split(/\s+/)
  const result: Track[] = []
  const decode = (s: string) =>
    s.replace(/\\_|_/g, m => (m === '_' ? ' ' : '_'))
  for (const token of tokens) {
    const match = /^(animate-[a-z-]+)-\[(.+)\]\/([a-zA-Z][\w-]*)$/.exec(token)
    if (!match) continue
    if (!catalog.some(e => e.utility === match[1] && e.nameable))
      throw Error(`Unrecognized property ${match[1]}`)
    const frames: Frame[] = []
    for (const part of match[2].split('|')) {
      const f = /^([\d.,]+):(.+)$/.exec(part)
      if (!f) throw Error('Only explicit percentage phrases can be imported.')
      for (const offset of f[1].split(','))
        frames.push({ id: uid(), offset: Number(offset), value: decode(f[2]) })
    }
    result.push({
      controls: { ...defaults },
      frames,
      id: uid(),
      kind: 'animation',
      name: match[3],
      nodeId,
      utility: match[1],
    })
  }
  if (!result.length)
    throw Error(
      'Paste named Jumi phrases, such as animate-opacity-[0:0|100:1]/enter.',
    )
  const keys: Record<string, keyof Controls> = {
    'composition': 'composition',
    'delay': 'delay',
    'direction': 'direction',
    'duration': 'duration',
    'fill-mode': 'fill',
    'iteration-count': 'iterations',
    'timing-function': 'easing',
  }
  for (const token of tokens) {
    if (result.some(t => token.startsWith(t.utility + '-['))) continue
    const m =
      /^animation-(duration|delay|timing-function|iteration-count|direction|fill-mode|composition)-(?:\[(.+)\]|([^/]+))\/([a-zA-Z][\w-]*)$/.exec(
        token,
      )
    if (!m) throw Error(`Cannot reliably import: ${token}`)
    const matches = result.filter(t => t.name === m[4])
    if (!matches.length) throw Error(`No motion named ${m[4]}`)
    const value = decode(m[2] ?? m[3])
    for (const t of matches) {
      const key = keys[m[1]]
      if (key === 'duration' || key === 'delay') {
        if (!/^-?[\d.]+m?s$/.test(value))
          throw Error('Timing values need ms or s units.')
        t.controls[key] = parseFloat(value) * (value.endsWith('ms') ? 1 : 1000)
      } else (t.controls as unknown as Record<string, string>)[key] = value
    }
  }
  result.forEach(trackClasses)
  return result
}
export function validateProject(
  value: unknown,
  catalog: PropertyEntry[],
): StudioProject {
  const p = value as StudioProject
  if (
    !p ||
    p.version !== 1 ||
    typeof p.title !== 'string' ||
    !p.scene ||
    !Array.isArray(p.tracks) ||
    p.tracks.length > 200 ||
    !p.editor ||
    !p.viewport
  )
    throw Error('This is not a version 1 Jumi Studio project.')
  validateSceneNode(p.scene.root)
  if (
    typeof p.scene.css !== 'string' ||
    p.scene.css.length > 100000 ||
    /[<>]|@import|url\s*\(|expression\s*\(/i.test(p.scene.css)
  )
    throw Error('Scene CSS cannot contain resource URLs or imports.')
  if (
    ![p.scene.width, p.scene.height].every(
      v => Number.isFinite(v) && v >= 100 && v <= 3000,
    ) ||
    !Number.isFinite(p.duration) ||
    p.duration < 100 ||
    p.duration > 120000
  )
    throw Error('Invalid scene dimensions or project duration.')
  const nodes = new Set(flatten(p.scene.root).map(n => n.id))
  const ids = new Set<string>()
  for (const t of p.tracks) {
    if (
      !t ||
      t.kind !== 'animation' ||
      !nodes.has(t.nodeId) ||
      !catalog.some(e => e.utility === t.utility) ||
      !Array.isArray(t.frames) ||
      t.frames.length > 100 ||
      !t.controls ||
      typeof t.id !== 'string' ||
      ids.has(t.id)
    )
      throw Error('Invalid animation track.')
    ids.add(t.id)
    for (const f of t.frames) {
      if (
        typeof f.id !== 'string' ||
        ids.has(f.id) ||
        typeof f.value !== 'string'
      )
        throw Error('Invalid keyframe.')
      ids.add(f.id)
    }
    if (
      !['alternate', 'alternate-reverse', 'normal', 'reverse'].includes(
        t.controls.direction,
      ) ||
      !['backwards', 'both', 'forwards', 'none'].includes(t.controls.fill) ||
      !['accumulate', 'add', 'replace'].includes(t.controls.composition)
    )
      throw Error('Invalid animation control.')
    trackClasses(t)
  }
  for (const key of ['selected', 'collapsed', 'locked', 'hidden'] as const)
    if (
      !Array.isArray(p.editor[key]) ||
      p.editor[key].some(id => !nodes.has(id))
    )
      throw Error('Invalid editor selection.')
  if (
    !['children', 'none', 'selection', 'subtree'].includes(
      p.editor.isolation,
    ) ||
    typeof p.editor.ghosts !== 'boolean' ||
    typeof p.editor.parentContext !== 'boolean'
  )
    throw Error('Invalid isolation settings.')
  if (
    !Number.isFinite(p.viewport.zoom) ||
    p.viewport.zoom < 0.1 ||
    p.viewport.zoom > 4 ||
    ![p.viewport.x, p.viewport.y].every(Number.isFinite) ||
    !/^#[\da-f]{6}$/i.test(p.viewport.background) ||
    typeof p.viewport.grid !== 'boolean'
  )
    throw Error('Invalid viewport.')
  candidates(p)
  return p
}
export function validateSceneNode(
  node: SceneNode,
  ids = new Set<string>(),
  depth = 0,
): void {
  if (
    !node ||
    depth > 30 ||
    !allowedTags.has(node.tag) ||
    !/^[-a-zA-Z][\w-]*$/.test(node.id) ||
    ['jumi-output', 'scene-base', 'studio-isolation'].includes(node.id) ||
    ids.has(node.id) ||
    ids.size >= 250
  )
    throw Error(
      'Scene must contain at most 250 safe HTML/SVG elements with unique simple IDs.',
    )
  ids.add(node.id)
  if (
    typeof node.name !== 'string' ||
    !node.name.trim() ||
    node.name.length > 100 ||
    typeof node.attributes !== 'object' ||
    !Array.isArray(node.children) ||
    (node.text !== undefined && typeof node.text !== 'string')
  )
    throw Error('Invalid scene node.')
  for (const [k, v] of Object.entries(node.attributes))
    if (
      !allowedAttrs.test(k) ||
      typeof v !== 'string' ||
      /[<>]/.test(v) ||
      (/url\s*\(/i.test(v) && !/^url\(#[\w-]+\)$/.test(v)) ||
      /expression\s*\(|@import/i.test(v)
    )
      throw Error(`Unsafe or unsupported scene attribute: ${k}`)
  node.children.forEach(c => validateSceneNode(c, ids, depth + 1))
}
