import { describe, expect, it } from 'vitest'

import { sourceStyle } from './base'
import { readCatalog } from './catalog'
import {
  addFrame,
  candidates,
  documentHtml,
  exportedTrackClasses,
  jumiDefaults,
  moveFrames,
  parseClasses,
  trackClasses,
  trackName,
  validateProject,
} from './model'
import { makeScene } from './scenes'
const { properties } = readCatalog()
describe('Studio public output contract', () => {
  it('omits semantic defaults but preserves non-default author intent', () => {
    const p = makeScene('signal'),
      t = p.tracks[0]
    t.controls = { ...jumiDefaults }
    expect(trackClasses(t)).toHaveLength(1)
    expect(
      parseClasses(trackClasses(t).join(' '), t.nodeId, properties)[0].controls,
    ).toEqual(jumiDefaults)
    t.controls.duration = 1200
    t.controls.fill = 'both'
    expect(trackClasses(t)).toHaveLength(3)
    expect(trackClasses(t).join(' ')).toContain('animation-duration-[1200ms]')
    expect(trackClasses(t).join(' ')).toContain('animation-fill-mode-both')
  })
  it('preserves explicit default overrides in scenes with inherited timing or stagger', () => {
    const p = makeScene('signal'),
      t = p.tracks[0]
    t.controls = { ...jumiDefaults }
    expect(exportedTrackClasses(t, p)).toHaveLength(1)
    p.scene.root.attributes.class += ' animate-stagger-150'
    expect(exportedTrackClasses(t, p)).toContain(
      `animation-delay-[0ms]/${t.name}`,
    )
    p.scene.root.attributes.class = 'scene'
    p.scene.css += ':root { --jumi-animation-duration: 4s; }'
    expect(exportedTrackClasses(t, p)).toContain(
      `animation-duration-[1000ms]/${t.name}`,
    )
  })
  it('writes the controls a sibling would otherwise decide, when its name is the property', () => {
    const p = makeScene('signal'),
      first = p.tracks[0]
    const second = {
      ...structuredClone(first),
      id: 'second',
      name: 'opacity-2',
    }

    first.id = 'first'
    first.name = 'opacity'
    first.utility = 'animate-opacity'
    first.controls = { ...jumiDefaults, duration: 2000 }
    second.controls = { ...jumiDefaults, duration: 1000 }
    p.tracks = [first, second]

    // `/opacity` is the property's scope, so the first track's 2000ms reaches the second. The second cannot
    // omit its own 1000ms, or it reads the sibling's value — which is what it used to do, in the exported page
    // and in the editor's replay alike, because both read this one serialization.
    expect(exportedTrackClasses(second, p)).toContain(
      'animation-duration-[1000ms]/opacity-2',
    )
    // Preserving writes every control, not just the one that differs — the point is that nothing is left to
    // be decided by the sibling.
    expect(exportedTrackClasses(second, p).length).toBeGreaterThan(1)
    expect(exportedTrackClasses(first, p)).toContain(
      'animation-duration-[2000ms]/opacity',
    )

    // With no such sibling the count stays omitted, which is the rule this is an exception to: it is about
    // what a sibling would decide, not about durations being written out always.
    p.tracks = [second]
    expect(exportedTrackClasses(second, p)).toHaveLength(1)
    expect(exportedTrackClasses(second, p)).not.toContain(
      'animation-duration-[1000ms]/opacity-2',
    )
  })
  it('names a new track locally rather than by the bare property', () => {
    expect(trackName('animate-opacity', [], 'node')).toBe('opacity-1')
    expect(
      trackName(
        'animate-opacity',
        [{ name: 'opacity-1', nodeId: 'node' }],
        'node',
      ),
    ).toBe('opacity-2')
    // Another element's track does not push this element's count.
    expect(
      trackName(
        'animate-opacity',
        [{ name: 'opacity-1', nodeId: 'other' }],
        'node',
      ),
    ).toBe('opacity-1')
  })
  it('derives composed properties and value types from the actual registrations', () => {
    expect(
      properties.find(p => p.utility === 'animate-opacity')?.types,
    ).toContain('number')
    expect(
      properties.find(p => p.utility === 'animate-filter-blur')?.attribute,
    ).toBe('filter')
    expect(
      properties.find(p => p.utility === 'animate-offset-distance'),
    ).toBeDefined()
    expect(properties.find(p => p.utility === 'animate-fill')).toBeDefined()
  })
  it('round-trips supported named phrases and their scoped timing', () => {
    const p = makeScene('signal'),
      t = p.tracks[0]
    const result = parseClasses(
      trackClasses(t).join(' '),
      t.nodeId,
      properties,
    )[0]
    expect(trackClasses(result)).toEqual(trackClasses(t))
  })
  it('preserves spaces and literal underscores in arbitrary values', () => {
    const p = makeScene('signal'),
      t = p.tracks[0]
    t.utility = 'animate-font-family'
    t.frames = [
      { id: 'f1', offset: 0, value: '"my_font", sans-serif' },
      { id: 'f2', offset: 100, value: 'serif' },
    ]
    const result = parseClasses(
      trackClasses(t).join(' '),
      t.nodeId,
      properties,
    )[0]
    expect(result.frames[0].value).toBe('"my_font", sans-serif')
  })
  it('does not serialize editor isolation, visibility or selection styles', () => {
    const p = makeScene()
    const before = documentHtml(p, '/* compiled */')
    p.editor.isolation = 'subtree'
    p.editor.hidden = ['petal-2']
    p.editor.ghosts = false
    expect(documentHtml(p, '/* compiled */')).toBe(before)
    expect(before).not.toContain('studio-isolation')
  })
  it('rejects conflicting identical phrase identities and shared-name controls', () => {
    const p = makeScene('signal')
    p.tracks.push({
      ...structuredClone(p.tracks[0]),
      id: 'different',
      name: p.tracks[0].name,
    })
    expect(() => candidates(p)).toThrow(/Identical phrases/)
    p.tracks.pop()
    p.tracks.push({
      ...structuredClone(p.tracks[0]),
      controls: { ...p.tracks[0].controls, duration: 400 },
      id: 'different',
      utility: 'animate-scale',
    })
    expect(() => candidates(p)).toThrow(/share controls/)
  })
  it('keeps differently named instances of identical frames independent', () => {
    const p = makeScene('signal'),
      t = structuredClone(p.tracks[0])
    t.id = 'second'
    t.name = 'glow'
    t.controls.duration = 900
    p.tracks.push(t)
    expect(() => candidates(p)).not.toThrow()
    expect(
      candidates(p).filter(
        c => c.startsWith('animate-opacity-[') && c.endsWith('/glow'),
      ),
    ).toHaveLength(1)
  })
  it('round-trips authored base declarations and omits unspecified starting keyframes', () => {
    const p = makeScene('signal')
    p.scene.root.base = { rotate: '20deg', width: '840px' }
    const t = p.tracks[0]
    t.frames = [{ id: 'end', offset: 100, value: '1' }]
    expect(documentHtml(p, '')).toContain('rotate: 20deg;')
    expect(trackClasses(t)[0]).toContain('[100:1]')
    expect(
      validateProject(JSON.parse(JSON.stringify(p)), properties).scene.root
        .base,
    ).toEqual(p.scene.root.base)
    p.scene.root.base = { onclick: 'alert(1)' }
    expect(() => validateProject(p, properties)).toThrow(/base/)
  })
  it('base overrides preserve and restore inline source declarations', () => {
    const p = makeScene('signal'),
      node = p.scene.root
    node.attributes.style = 'rotate: 10deg; --label: "a;b"; color: red'
    const source = node.attributes.style
    node.base = { rotate: '20deg' }
    expect(sourceStyle(node)).not.toContain('10deg')
    expect(sourceStyle(node)).toContain('"a;b"')
    expect(node.attributes.style).toBe(source)
    delete node.base.rotate
    expect(sourceStyle(node)).toBe(source)
  })
  it('serializes infinite iteration through the supported public keyword', () => {
    const t = makeScene().tracks[0]
    expect(trackClasses(t)).toContain(
      `animation-iteration-count-infinite/${t.name}`,
    )
    expect(trackClasses(t).join(' ')).not.toContain('[infinite]')
  })
  it('uses delay-relative percentages and moves different tracks by the same time delta', () => {
    const p = makeScene('signal')
    const a = p.tracks[0],
      b = p.tracks[1]
    b.controls.duration = 1000
    const id = addFrame(b, 1000, '.7')
    expect(b.frames.find(f => f.id === id)?.offset).toBe(50)
    const ids = [a.frames[0].id, b.frames[0].id]
    moveFrames(p, ids, 100, 1)
    expect(p.tracks[0].frames[0].offset).toBe(5)
    expect(p.tracks[1].frames[0].offset).toBe(10)
  })
  it('refuses lossy imports and executable scene content', () => {
    expect(() =>
      parseClasses('hover:animate-opacity-[0:0|100:1]/enter', 'x', properties),
    ).toThrow()
    const p = makeScene()
    p.scene.root.attributes.onclick = 'alert(1)'
    expect(() => validateProject(p, properties)).toThrow(/attribute/)
    delete p.scene.root.attributes.onclick
    p.scene.css += '@import "https://example.com"'
    expect(() => validateProject(p, properties)).toThrow(/CSS/)
  })
  it('keeps valid projects serializable without computed browser values', () => {
    const p = makeScene()
    expect(validateProject(JSON.parse(JSON.stringify(p)), properties)).toEqual(
      p,
    )
    const broken = structuredClone(p)
    broken.tracks[0].frames[0].offset = NaN
    expect(() => validateProject(broken, properties)).toThrow(/offset/)
  })
})
