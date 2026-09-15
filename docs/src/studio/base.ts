import type { SceneNode, StudioProject } from './model'

import { flatten } from './tree'

import postcss from 'postcss'
export const svgTags = new Set(
  'svg g path circle ellipse rect line polyline polygon text tspan defs linearGradient radialGradient stop clipPath mask'.split(
    ' ',
  ),
)
export function baseCss(project: StudioProject): string {
  return (
    project.scene.css +
    flatten(project.scene.root)
      .filter(n => n.base && Object.keys(n.base).length)
      .map(
        n =>
          `\n/* Studio base ${n.id} */\n#${n.id} {\n${Object.entries(n.base!)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `  ${key}: ${value};`)
            .join('\n')}\n}`,
      )
      .join('')
  )
}
export function baseProperties(
  node: SceneNode,
  positioned = false,
): Record<string, string[]> {
  if (!svgTags.has(node.tag))
    return {
      Appearance: ['opacity'],
      Geometry: ['width', 'height', ...(positioned ? ['left', 'top'] : [])],
      Transform: ['translate', 'rotate', 'scale', 'transform-origin'],
    }
  const geometry: Record<string, string[]> = {
    circle: ['cx', 'cy', 'r'],
    ellipse: ['cx', 'cy', 'rx', 'ry'],
    rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
    svg: ['x', 'y', 'width', 'height'],
    // SVG line endpoints and text coordinates are attributes, not consistently CSS geometry.
  }
  return {
    Appearance: ['fill', 'stroke', 'stroke-width', 'opacity'],
    Geometry: geometry[node.tag] ?? [],
    Transform: ['translate', 'rotate', 'scale', 'transform-origin'],
  }
}
/** Retain source declarations in project data; mask only properties explicitly overridden by base. */
export function sourceStyle(node: SceneNode): string {
  const source = node.attributes.style || ''
  if (!source || !node.base || !Object.keys(node.base).length) return source
  const ast = postcss.parse(`a{${source}}`)
  ast.walkDecls(decl => {
    if (Object.hasOwn(node.base!, decl.prop)) decl.remove()
  })
  return (ast.first as import('postcss').Rule).nodes
    .map(node => node.toString())
    .join(';')
}

export function validBase(node: SceneNode, property: string, value: string) {
  return (
    Object.values(baseProperties(node, true)).flat().includes(property) &&
    typeof value === 'string' &&
    value.length < 500 &&
    !!value.trim() &&
    !/[;{}<>]|url\s*\(|@import|expression\s*\(/i.test(value)
  )
}
