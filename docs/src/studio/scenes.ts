import type { SceneNode, StudioProject, Track } from './model'

import { defaults, uid } from './model'
const node = (
  id: string,
  name: string,
  tag = 'div',
  attributes: Record<string, string> = {},
  children: SceneNode[] = [],
  text?: string,
): SceneNode => ({
  attributes,
  children,
  id,
  name,
  tag,
  ...(text ? { text } : {}),
})
const track = (
  nodeId: string,
  utility: string,
  name: string,
  values: [number, string][],
  duration: number,
  delay = 0,
  composition = 'replace',
  easing = 'linear',
): Track => ({
  controls: {
    ...defaults,
    composition,
    delay: delay || 0,
    duration,
    easing,
    iterations: 'infinite',
  },
  frames: values.map(([offset, value]) => ({ id: uid(), offset, value })),
  id: uid(),
  kind: 'animation',
  name,
  nodeId,
  utility,
})
export function makeScene(kind = 'hero'): StudioProject {
  const tracks: Track[] = []
  let css: string, root: SceneNode
  if (kind === 'hero') {
    const petals = Array.from({ length: 12 }, (_, i) => {
      const id = `petal-${i + 1}`
      tracks.push(
        track(
          `position-${i + 1}`,
          'animate-rotate',
          'orbit',
          [
            [0, 'var(--angle)'],
            [100, 'calc(var(--angle) - 360deg)'],
          ],
          75000,
        ),
      )
      tracks.push(
        track(
          id,
          'animate-rotate',
          'flick',
          [
            [0, '0deg'],
            [20, '-8deg'],
            [100, '-8deg'],
          ],
          3000,
          -i * 250,
          'add',
          'cubic-bezier(.4,0,.6,1)',
        ),
      )
      tracks.push(
        track(
          id,
          'animate-rotate',
          'return',
          [
            [0, '0deg'],
            [20, '0deg'],
            [100, '8deg'],
          ],
          3000,
          -i * 250,
          'add',
        ),
      )
      return node(
        `position-${i + 1}`,
        `Arm ${String(i + 1).padStart(2, '0')}`,
        'div',
        { class: `petal-position arm-${i + 1}` },
        [
          node(id, `Petal ${String(i + 1).padStart(2, '0')}`, 'div', {
            class: 'petal',
          }),
        ],
      )
    })
    tracks.unshift(
      track(
        'orbit',
        'animate-rotate',
        'turn',
        [
          [0, '0deg'],
          [100, '360deg'],
        ],
        24000,
      ),
    )
    root = node('hero', 'Hero illustration', 'div', { class: 'scene' }, [
      node('orbit', 'Orbit', 'div', { class: 'orbit' }, [
        ...petals,
        node('core', 'Core', 'span', { class: 'orbit-core' }),
      ]),
    ])
    css = `/* Geometry from the Jumi website hero; motion is authored as classes. */\n* { box-sizing: border-box; }\nbody { margin: 0; }\n.scene { width: 800px; height: 540px; display: grid; place-items: center; background: #f0f1e9; }\n.orbit { position: relative; width: 370px; height: 370px; }\n.petal-position { position: absolute; inset: 0; rotate: var(--angle); display: flex; justify-content: center; }\n.petal { width: 85px; height: 205px; border-radius: 50%; background: #c5e86c; border: 1px solid #26321d55; transform-origin: 50% 90%; }\n.orbit-core { position: absolute; width: 70px; height: 70px; left: 150px; top: 150px; border-radius: 50%; background: #283222; border: 1px solid #c5e86c; }\n${petals.map((_, i) => `.arm-${i + 1} { --angle: ${i * 30}deg; }`).join('\n')}`
  } else {
    root = node('scene', 'Signal study', 'div', { class: 'scene' }, [
      node('card', 'Signal card', 'article', { class: 'card' }, [
        node(
          'label',
          'Label',
          'span',
          { class: 'label' },
          [],
          'JUMI / SIGNAL 02',
        ),
        node(
          'graphic',
          'SVG constellation',
          'svg',
          { height: '220', viewBox: '0 0 320 220', width: '320' },
          [
            node('rings', 'Rings', 'g', {}, [
              node('ring-a', 'Outer ring', 'circle', {
                'cx': '160',
                'cy': '110',
                'fill': 'none',
                'r': '85',
                'stroke': '#8b9582',
                'stroke-width': '1',
              }),
              node('ring-b', 'Inner ring', 'circle', {
                'cx': '160',
                'cy': '110',
                'fill': 'none',
                'r': '50',
                'stroke': '#8b9582',
                'stroke-width': '1',
              }),
            ]),
            node('dots', 'Siblings', 'g', {}, [
              node('dot-a', 'Dot A', 'circle', {
                cx: '160',
                cy: '25',
                fill: '#d7fc70',
                r: '15',
              }),
              node('dot-b', 'Dot B', 'circle', {
                cx: '210',
                cy: '110',
                fill: '#c1b4ef',
                r: '12',
              }),
            ]),
          ],
        ),
        node('headline', 'Headline', 'h2', {}, [], 'A shared rhythm.'),
        node(
          'caption',
          'Caption',
          'p',
          {},
          [],
          'Independent parts. One browser.',
        ),
      ]),
    ])
    css =
      '* { box-sizing: border-box; } body { margin: 0; } .scene { width: 800px; height: 540px; display: grid; place-items: center; background: #f0f1e9; font-family: sans-serif; } .card { width: 380px; padding: 25px 30px; border-radius: 14px; color: #f4f5ee; background: #283222; } .label { font-size: 11px; letter-spacing: .15em; } svg { display: block; margin: 15px 0; } h2 { font-weight: 500; font-size: 28px; margin: 0 0 8px; } p { font-size: 14px; color: #b7c2ab; margin: 0; } circle { transform-box: fill-box; transform-origin: center; }'
    tracks.push(
      track(
        'dot-a',
        'animate-opacity',
        'pulse',
        [
          [0, '.2'],
          [50, '1'],
          [100, '.2'],
        ],
        2000,
        0,
      ),
      track(
        'dot-b',
        'animate-opacity',
        'pulse',
        [
          [0, '.2'],
          [50, '1'],
          [100, '.2'],
        ],
        2000,
        500,
      ),
      track(
        'headline',
        'animate-translate-y',
        'enter',
        [
          [0, '18px'],
          [100, '0px'],
        ],
        1400,
        0,
        'replace',
        'ease-out',
      ),
    )
  }
  return {
    duration: 6000,
    editor: {
      collapsed: [],
      ghosts: true,
      hidden: [],
      isolation: 'none',
      locked: [],
      parentContext: true,
      selected: [kind === 'hero' ? 'petal-4' : 'dot-a'],
    },
    scene: { css, height: 540, root, width: 800 },
    title: kind === 'hero' ? 'Petal study' : 'Signal study',
    tracks,
    version: 1,
    viewport: { background: '#e1e4da', grid: true, x: 0, y: 0, zoom: 0.7 },
  }
}
