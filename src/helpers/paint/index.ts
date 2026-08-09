import { type Color, converter, formatHex, formatHex8, type Mode, parse } from 'culori'

/**
 * Convert a CSS color (or `color-mix()`) string to a hex literal so SVG-paint
 * keyframes target a plain sRGB color.
 *
 * Chromium cannot interpolate SVG `fill`/`stroke` toward a computed color
 * (`oklch()`, `oklab()`, `color-mix()`, relative `rgb()` — all resolve the end
 * state to `rgb(1 0 0)`), while a hex/hex8 target tweens correctly AND keeps
 * the implicit 0% frame equal to the element's actual current fill.
 *
 * Non-color values (`none`, `url(#…)`, keywords) are not parseable and are
 * returned unchanged.
 */

// CSS `color-mix()` interpolation space → culori color mode.
const SPACES: Record<string, Mode> = {
  'hsl': 'hsl',
  'hwb': 'hwb',
  'lab': 'lab',
  'lch': 'lch',
  'oklab': 'oklab',
  'oklch': 'oklch',
  'srgb': 'rgb',
  'srgb-linear': 'lrgb',
  'xyz': 'xyz65',
  'xyz-d50': 'xyz50',
  'xyz-d65': 'xyz65',
}

export function toPaintHex(value: string): string {
  if (/^color-mix\(/i.test(value)) {
    const resolved = resolveColorMix(value)
    if (resolved) return serialize(resolved)
  }
  const color = parse(value)
  return color ? serialize(color) : value
}

// CSS `color-mix()` interpolates with premultiplied alpha and then
// un-premultiplies the result (verified against Chromium).
function mixColors(a: Color, b: Color, weight: number, mode: Mode): Color {
  const toMode = converter(mode)
  const ca = toMode(a) as Record<string, any>
  const cb = toMode(b) as Record<string, any>

  const alphaA = ca.alpha ?? 1
  const alphaB = cb.alpha ?? 1

  const channels: Record<string, number> = {}
  const ignoreKeys = new Set(['alpha', 'mode'])

  for (const key of Object.keys(ca)) {
    if (ignoreKeys.has(key)) continue

    // culori leaves channels undefined for achromatic colors (e.g., h in Oklch for white/black).
    // Fallback to 0 prevents `undefined * number` returning NaN and poisoning the color space.
    const valA = ca[key] ?? 0
    const valB = cb[key] ?? 0

    channels[key] = (valA * alphaA * weight) + (valB * alphaB * (1 - weight))
  }

  const alpha = (alphaA * weight) + (alphaB * (1 - weight))

  if (alpha > 0) {
    for (const key of Object.keys(channels)) {
      channels[key] /= alpha
    }
  }

  return { ...channels, alpha, mode: ca.mode } as Color
}

// Resolve a `color-mix(in <space>, <c1> <p1>?, <c2> <p2>?)` string to a color.
function resolveColorMix(value: string): Color | undefined {
  // `(?:[^,]*)` safely ignores hue interpolation methods (e.g. "shorter hue")
  // so `color-mix(in oklch shorter hue, ...)` doesn't fail parsing.
  const match = value.match(/^color-mix\(\s*in\s+([a-z0-9-]+)(?:[^,]*),(.*)\)$/is)
  if (!match) return undefined

  const mode = SPACES[match[1].toLowerCase()]
  if (!mode) return undefined

  const parts = splitTopLevel(match[2])
  if (parts.length !== 2) return undefined

  const [c1, w1] = splitColorWeight(parts[0])
  const [c2, w2] = splitColorWeight(parts[1])

  const a = parse(c1)
  const b = parse(c2)
  if (!a || !b) return undefined

  // CSS rules: default 50/50, or if one is missing, it takes the remainder to equal 100%
  const weight = w1 ?? (w2 !== undefined ? 1 - w2 : 0.5)

  try {
    return mixColors(a, b, weight, mode)
  }
  catch {
    return undefined
  }
}

// Serialize to hex (with alpha) — `formatHex8` is used for any translucency.
function serialize(color: Color): string {
  return (color.alpha ?? 1) < 1 ? formatHex8(color) : formatHex(color)
}

// Split `<color> <percentage>%` (or vice versa) into the color and its weight.
function splitColorWeight(part: string): [string, number | undefined] {
  part = part.trim()

  // CSS spec allows percentage to appear AFTER the color: "red 50%"
  const matchEnd = part.match(/^(.*?)\s+(\d+(?:\.\d+)?)%$/)
  if (matchEnd) return [matchEnd[1].trim(), Number(matchEnd[2]) / 100]

  // CSS spec allows percentage to appear BEFORE the color: "50% red"
  const matchStart = part.match(/^(\d+(?:\.\d+)?)%\s+(.*)$/)
  if (matchStart) return [matchStart[2].trim(), Number(matchStart[1]) / 100]

  return [part, undefined]
}

// Split a `color-mix()` component list on top-level commas, ignoring commas
// nested inside color functions (e.g. `rgb(1, 2, 3)`).
function splitTopLevel(input: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    else if (ch === ',' && depth === 0) {
      parts.push(input.slice(start, i))
      start = i + 1
    }
  }

  parts.push(input.slice(start))
  return parts
}
