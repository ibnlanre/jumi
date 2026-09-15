import type { StudioProject } from './model'

import { documentHtml, exportedTrackClasses, flatten, parentOf } from './model'
export class SceneSandbox {
  animations: Animation[] = []
  frame: HTMLIFrameElement
  project: StudioProject
  ready = false
  get doc() {
    return this.frame.contentDocument!
  }
  constructor(frame: HTMLIFrameElement, project: StudioProject) {
    this.frame = frame
    this.project = project
  }
  bounds(id: string) {
    const el = this.element(id)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { height: r.height, width: r.width, x: r.x, y: r.y }
  }
  collect() {
    this.doc.body.getBoundingClientRect()
    this.animations = this.doc.getAnimations()
    for (const a of this.animations) a.pause()
  }
  element(id: string) {
    return this.doc?.getElementById(id)
  }
  inspect(id: string, attribute = 'opacity') {
    const el = this.element(id)
    if (!el) return null
    const style = this.frame.contentWindow!.getComputedStyle(el)
    let svgBox = null
    if ('getBBox' in el) {
      try {
        const b = (el as unknown as SVGGraphicsElement).getBBox()
        svgBox = { height: b.height, width: b.width, x: b.x, y: b.y }
      } catch {}
    }
    return {
      animations: el.getAnimations().length,
      bounds: this.bounds(id),
      display: style.display,
      origin: style.transformOrigin,
      svgBox,
      value: style.getPropertyValue(attribute),
    }
  }

  isolate() {
    if (!this.ready) return
    const p = this.project
    const all = flatten(p.scene.root)
    const rules: string[] = []
    if (p.editor.isolation !== 'none') {
      rules.push(
        all.map(n => `#${CSS.escape(n.id)}`).join(',') +
          '{visibility:hidden!important}',
      )
      const visible = new Set(p.editor.selected)
      for (const id of p.editor.selected) {
        const n = all.find(n => n.id === id)
        if (!n) continue
        if (p.editor.isolation === 'children')
          n.children.forEach(c => visible.add(c.id))
        if (p.editor.isolation === 'subtree')
          flatten(n).forEach(c => visible.add(c.id))
      }
      if (visible.size)
        rules.push(
          [...visible].map(id => `#${CSS.escape(id)}`).join(',') +
            '{visibility:visible!important}',
        )
      if (p.editor.ghosts) {
        const roots = new Set<string>()
        for (const id of p.editor.selected) {
          const parent = parentOf(p.scene.root, id)
          for (const sibling of parent?.children ?? []) {
            const branch = flatten(sibling)
            if (branch.some(n => visible.has(n.id))) continue
            roots.add(sibling.id)
          }
        }
        for (const id of roots) {
          const n = all.find(n => n.id === id)!
          rules.push(
            flatten(n)
              .map(c => `#${CSS.escape(c.id)}`)
              .join(',') + '{visibility:visible!important}',
          )
          rules.push(`#${CSS.escape(id)}{opacity:.16!important}`)
        }
      }
    }
    for (const id of p.editor.hidden) {
      const n = all.find(n => n.id === id)
      if (n)
        rules.push(
          flatten(n)
            .map(c => `#${CSS.escape(c.id)}`)
            .join(',') + '{visibility:hidden!important}',
        )
    }
    this.doc.getElementById('studio-isolation')!.textContent = rules.join('\n')
  }

  async load(project: StudioProject, css: string) {
    this.ready = false
    this.project = project
    await new Promise<void>(resolve => {
      this.frame.onload = () => resolve()
      this.frame.srcdoc = documentHtml(project, css, true)
    })
    this.ready = true
    this.doc.addEventListener('click', event => {
      event.preventDefault()
      const ids = this.pick(event.clientX, event.clientY)
      const previous = this.project.editor.selected[0]
      const id = event.altKey
        ? ids[(ids.indexOf(previous) + 1) % ids.length]
        : ids[0]
      if (id) this.onSelect(id, event.shiftKey)
    })
    this.doc.addEventListener('dblclick', event => {
      event.preventDefault()
      const e = (event.target as Element).closest('[id]')
      if (e && this.selectable(e.id)) this.onDrill(e.id)
    })
    this.doc.addEventListener('pointermove', event => {
      const e = (event.target as Element).closest('[id]')
      this.onHover(e && this.selectable(e.id) ? e.id : null)
    })
    this.doc.addEventListener('pointerleave', () => this.onHover(null))
    this.collect()
    this.isolate()
  }

  onDrill: (id: string) => void = () => {}
  onHover: (id: null | string) => void = () => {}
  onSelect: (id: string, multi: boolean) => void = () => {}
  /** Map a local transform origin through the browser's 2D matrices. Do not guess for 3D/path transforms. */
  origin(id: string): null | { x: number; y: number } {
    const el = this.element(id)
    if (!el) return null
    const win = this.frame.contentWindow!,
      style = win.getComputedStyle(el)
    const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat)
    if (!Number.isFinite(ox) || !Number.isFinite(oy)) return null
    if ('getScreenCTM' in el) {
      const svg = el as unknown as SVGGraphicsElement,
        ctm = svg.getScreenCTM()
      if (!ctm) return null
      const b = svg.getBBox(),
        fillBox = ['fill-box', 'stroke-box'].includes(style.transformBox)
      const point = new DOMPoint(
        ox + (fillBox ? b.x : 0),
        oy + (fillBox ? b.y : 0),
      ).matrixTransform(ctm)
      return { x: point.x, y: point.y }
    }
    const chain: Element[] = []
    for (let n: Element | null = el; n; n = n.parentElement) chain.unshift(n)
    let matrix = new DOMMatrix()
    const angle = (value: string) => {
      const number = parseFloat(value)
      return value.endsWith('turn')
        ? number * 360
        : value.endsWith('rad')
          ? (number * 180) / Math.PI
          : value.endsWith('grad')
            ? number * 0.9
            : number
    }
    for (const node of chain) {
      const s = win.getComputedStyle(node)
      if (s.perspective !== 'none' || s.offsetPath !== 'none') return null
      const transform = new DOMMatrix(
        s.transform === 'none' ? undefined : s.transform,
      )
      if (!transform.is2D) return null
      const rotation = s.rotate === 'none' ? 0 : angle(s.rotate)
      if (!Number.isFinite(rotation) || s.rotate.includes(' ')) return null
      const scales =
        s.scale === 'none' ? [1, 1] : s.scale.split(' ').map(Number)
      if (scales.length > 2) return null
      matrix = matrix.multiply(
        new DOMMatrix()
          .rotate(rotation)
          .scale(scales[0], scales[1] ?? scales[0])
          .multiply(transform),
      )
    }
    const extras = (axis: 'x' | 'y') =>
      (axis === 'x'
        ? ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth']
        : ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth']
      ).reduce(
        (sum, key) =>
          sum +
          (parseFloat(style[key as keyof CSSStyleDeclaration] as string) || 0),
        0,
      )
    const h =
        parseFloat(style.height) +
        (style.boxSizing === 'border-box' ? 0 : extras('y')),
      w =
        parseFloat(style.width) +
        (style.boxSizing === 'border-box' ? 0 : extras('x'))
    if (!Number.isFinite(w) || !Number.isFinite(h)) return null
    // Translation is recovered from the measured bounds; ancestor origins and layout offsets are already in them.
    matrix.e = matrix.f = 0
    const points = [
      [0, 0],
      [w, 0],
      [0, h],
      [w, h],
    ].map(([x, y]) => new DOMPoint(x, y).matrixTransform(matrix))
    const point = new DOMPoint(ox, oy).matrixTransform(matrix),
      r = el.getBoundingClientRect()
    return {
      x: r.x - Math.min(...points.map(p => p.x)) + point.x,
      y: r.y - Math.min(...points.map(p => p.y)) + point.y,
    }
  }

  /** Measure the origin handle's local-to-scene basis once per drag. */
  originHandle(id: string) {
    const el = this.element(id)
    const start = this.origin(id)
    if (!el || !start) return null
    const style = el.style,
      priority = style.getPropertyPriority('transform-origin'),
      saved = style.getPropertyValue('transform-origin')
    const [x, y] = this.frame
      .contentWindow!.getComputedStyle(el)
      .transformOrigin.split(' ')
      .map(parseFloat)
    try {
      style.setProperty('transform-origin', `${x + 1}px ${y}px`, 'important')
      const dx = this.origin(id)
      style.setProperty('transform-origin', `${x}px ${y + 1}px`, 'important')
      const dy = this.origin(id)
      if (!dx || !dy) return null
      const matrix = new DOMMatrix([
        dx.x - start.x,
        dx.y - start.y,
        dy.x - start.x,
        dy.y - start.y,
        start.x,
        start.y,
      ]).inverse()
      if (![matrix.a, matrix.b, matrix.c, matrix.d].every(Number.isFinite))
        return null
      return {
        value: (sx: number, sy: number) => {
          const p = new DOMPoint(sx, sy).matrixTransform(matrix)
          return `${Math.round((x + p.x) * 100) / 100}px ${Math.round((y + p.y) * 100) / 100}px`
        },
      }
    } finally {
      if (saved) style.setProperty('transform-origin', saved, priority)
      else style.removeProperty('transform-origin')
    }
  }
  patch(project: StudioProject, css: string) {
    this.project = project
    if (!this.ready) return
    this.doc.getElementById('jumi-output')!.textContent = css
    this.doc.getElementById('scene-base')!.textContent = project.scene.css
    for (const n of flatten(project.scene.root)) {
      const el = this.element(n.id)
      if (el)
        el.setAttribute(
          'class',
          [
            n.attributes.class || '',
            ...project.tracks
              .filter(t => t.nodeId === n.id)
              .flatMap(t => exportedTrackClasses(t, project)),
          ].join(' '),
        )
    }
    this.collect()
    this.isolate()
  }

  pause() {
    for (const a of this.animations) a.pause()
  }
  pick(x: number, y: number): string[] {
    const ids: string[] = []
    for (const hit of this.doc.elementsFromPoint(x, y)) {
      if (this.selectable(hit.id) && !ids.includes(hit.id)) ids.push(hit.id)
    }
    for (const id of [...ids]) {
      for (let el = this.element(id)?.parentElement; el; el = el.parentElement)
        if (this.selectable(el.id) && !ids.includes(el.id)) ids.push(el.id)
    }
    return ids
  }
  play(ms: number) {
    const now = this.doc.timeline.currentTime
    for (const a of this.animations) {
      a.currentTime = ms
      a.play()
      if (typeof now === 'number') a.startTime = now - ms
    }
  }
  seek(ms: number) {
    for (const a of this.animations) {
      a.pause()
      a.currentTime = ms
    }
  }
  selectable(id: string) {
    return (
      flatten(this.project.scene.root).some(n => n.id === id) &&
      !this.project.editor.locked.includes(id) &&
      !this.project.editor.hidden.includes(id)
    )
  }
}
