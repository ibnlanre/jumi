import { describe, expect, it } from 'vitest'

import { readCatalog } from './catalog'
import {
  addFrame,
  candidates,
  documentHtml,
  moveFrames,
  parseClasses,
  trackClasses,
  validateProject,
} from './model'
import { makeScene } from './scenes'
const { properties } = readCatalog()
describe('Studio public output contract', () => {
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
      name: 'other',
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
