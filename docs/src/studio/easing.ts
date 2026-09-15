import { animationTimingFunction } from '@/theme/animation-timing-function'

import { escapeHtml } from './model'
export const presets: Record<string, string> = animationTimingFunction
const native: Record<string, number[]> = {
  'ease': [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
  'ease-out': [0, 0, 0.58, 1],
  'linear': [0, 0, 1, 1],
}
export function bezier(value: string): null | number[] {
  if (native[value]) return [...native[value]]
  const match = /^cubic-bezier\(\s*([^)]*)\)$/.exec(value)
  if (!match) return null
  const points = match[1].split(',').map(Number)
  return points.length === 4 &&
    points.every(Number.isFinite) &&
    points[0] >= 0 &&
    points[0] <= 1 &&
    points[2] >= 0 &&
    points[2] <= 1
    ? points
    : null
}
export const curveValue = (p: number[]) =>
  `cubic-bezier(${p.map(n => Math.round(n * 1000) / 1000).join(',')})`
export function curveDrawing(p: number[]) {
  const x1 = 30 + p[0] * 180,
    x2 = 30 + p[2] * 180,
    y1 = 150 - p[1] * 120,
    y2 = 150 - p[3] * 120
  return `<path d="M30 150L${x1} ${y1}M210 30L${x2} ${y2}" stroke="#879c6e" fill="none"/><path d="M30 150C${x1} ${y1} ${x2} ${y2} 210 30" fill="none" stroke="#d7fc70" stroke-width="2"/>${[
    [x1, y1],
    [x2, y2],
  ]
    .map(
      ([x, y], i) =>
        `<circle class="ease-handle" data-ease-handle="${i}" cx="${x}" cy="${y}" r="6" role="slider" tabindex="0" aria-label="Bézier handle ${i + 1}; use arrow keys" aria-valuetext="${p[i * 2]}, ${p[i * 2 + 1]}"/>`,
    )
    .join('')}`
}
export function easingMarkup(value: string) {
  const points = bezier(value)
  const top = points
    ? Math.min(0, 150 - points[1] * 120 - 20, 150 - points[3] * 120 - 20)
    : 0
  const bottom = points
    ? Math.max(180, 150 - points[1] * 120 + 20, 150 - points[3] * 120 + 20)
    : 180
  return `<div class="easing-editor"><label>Easing presets<input type="search" id="ease-search" placeholder="Search Jumi presets…" /></label><div class="ease-presets">${Object.entries(
    presets,
  )
    .map(
      ([name, css]) =>
        `<button data-ease-preset="${escapeHtml(css)}">${name}</button>`,
    )
    .join(
      '',
    )}</div>${points ? `<svg id="ease-curve" viewBox="0 ${top} 240 ${bottom - top}" aria-label="Cubic Bézier easing"><path d="M30 30V150H210" fill="none" stroke="#4c5941"/><path d="M30 150L210 30" stroke="#34402b" stroke-dasharray="3 4"/><g id="ease-drawing">${curveDrawing(points)}</g></svg><div class="ease-coordinates">${points.map((v, i) => `<label>${['x₁', 'y₁', 'x₂', 'y₂'][i]}<input type="number" step=".01" ${i % 2 === 0 ? 'min="0" max="1"' : ''} data-ease-coordinate="${i}" value="${v}" /></label>`).join('')}</div>` : '<p class="muted">This easing is not a cubic curve. Edit its CSS value or choose a preset.</p>'}</div>`
}
