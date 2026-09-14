/**
 * The arms, the page, and the reader — everything the harness measures, declared once.
 *
 * Two stylesheets are in play and they answer different halves of the question:
 *
 *   jumi    the *finalized* emission, compiled from the candidates below. This is what a build
 *           ships, so every claim about "Jumi retargets" is a claim about these rules.
 *   plain   hand-written CSS. Jumi cannot state a named timeline or an `animation-range` today — it
 *           writes custom properties nothing reads — so the platform's own semantics are
 *           established here instead, and the gap becomes a measurement rather than an inference.
 *
 * The page's geometry is part of the instrument. The root scroller has a long range so a scroll
 * sweep crosses it fully; `#pane` is a nested scroller with its own range so `nearest` can be told
 * apart from `root`; `#self` scrolls itself so `self` has something to mean. A sweep that cannot
 * cross a timeline measures nothing.
 */

/** What a reader wants out of one element, and the whole of what the page answers with. */
export const TIMELINE_PROPERTIES = [
  'animation-timeline',
  'animation-range',
  'animation-range-start',
  'animation-range-end',
  'animation-composition',
  'animation-name',
  'animation-duration',
  'animation-delay',
  'animation-direction',
  'animation-iteration-count',
  'animation-fill-mode',
  'animation-play-state',
  'opacity',
]

/** The Jumi arm: id → the classes that element carries. */
export const ARMS = [
  // A — retarget. The same motion, a different driver.
  { classes: 'animate-fade-in', group: 'A', id: 'aDtm', note: 'control: no timeline control at all' },
  { classes: 'animate-fade-in animation-timeline-scroll', group: 'A', id: 'aScroll', note: 'scroll() from the nearest scroller' },
  { classes: 'animate-fade-in animation-timeline-scroll animation-timeline-scroller-root', group: 'A', id: 'aScrollRoot', note: 'scroll(block root)' },
  { classes: 'animate-fade-in animation-timeline-scroll animation-timeline-axis-x', group: 'A', id: 'aScrollAxisX', note: 'scroll(x nearest)' },
  { classes: 'animate-fade-in animation-timeline-view', group: 'A', id: 'aView', note: 'view()' },
  { classes: 'animate-fade-in animation-timeline-view animation-timeline-axis-x', group: 'A', id: 'aViewAxisX', note: 'view(x …)' },
  { classes: 'animate-fade-in animation-timeline-none', group: 'A', id: 'aNone', note: 'animation-timeline: none' },
  { classes: 'animate-fade-in animation-timeline-[scroll(block_root)]', group: 'A', id: 'aArbFn', note: 'arbitrary function value' },
  { classes: 'animate-fade-in animation-timeline-scroll', group: 'A', id: 'aPaneScroll', note: 'nearest = #pane', where: 'pane' },
  { classes: 'animate-fade-in animation-timeline-scroll animation-timeline-scroller-self', group: 'A', id: 'aSelfScroll', note: 'scroll(self)', where: 'self' },

  // B — the aggregate. One element, several slots, more than one timeline.
  { classes: 'animate-fade-in animate-rotate-45 animation-timeline-scroll/rotate', group: 'B', id: 'bMixed', note: 'one slot retargeted, the other left alone' },
  { classes: 'animate-fade-in animate-rotate-45 animation-timeline-scroll', group: 'B', id: 'bBoth', note: 'the global control on a two-slot element' },
  { classes: 'animate-fade-in animate-rotate-45 animation-timeline-scroll/fade-in animation-timeline-view/rotate', group: 'B', id: 'bSplit', note: 'two slots, two different timelines' },
  { classes: 'animate-fade-in animation-timeline-[--page]', group: 'B', id: 'bArbNamed', note: 'a named timeline, consumed through the arbitrary path', where: 'pane' },
  { classes: 'animate-fade-in animate-rotate-45 animation-timeline-scroll animation-duration-600/fade-in', group: 'B', id: 'bDurations', note: 'two slots on one timeline, told different durations' },

  // C — every control, on a document timeline and on a scroll timeline.
  { classes: 'animate-fade-in animation-duration-600', group: 'C', id: 'cDuration' },
  { classes: 'animate-fade-in animation-duration-600 animation-timeline-scroll', group: 'C', id: 'cDurationS' },
  { classes: 'animate-fade-in animation-duration-[auto]', group: 'C', id: 'cDurationAuto' },
  { classes: 'animate-fade-in animation-duration-[auto] animation-timeline-scroll', group: 'C', id: 'cDurationAutoS' },
  { classes: 'animate-fade-in animation-duration-2000 animation-timeline-scroll', group: 'C', id: 'cDuration2sS' },
  { classes: 'animate-fade-in animation-delay-600 animation-timeline-scroll', group: 'C', id: 'cDelay600S' },
  { classes: 'animate-fade-in animation-delay-200', group: 'C', id: 'cDelay' },
  { classes: 'animate-fade-in animation-delay-200 animation-timeline-scroll', group: 'C', id: 'cDelayS' },
  { classes: 'animate-fade-in animation-timing-function-linear', group: 'C', id: 'cEasing' },
  { classes: 'animate-fade-in animation-timing-function-linear animation-timeline-scroll', group: 'C', id: 'cEasingS' },
  { classes: 'animate-fade-in animation-direction-reverse', group: 'C', id: 'cDirection' },
  { classes: 'animate-fade-in animation-direction-reverse animation-timeline-scroll', group: 'C', id: 'cDirectionS' },
  { classes: 'animate-fade-in animation-iteration-count-2', group: 'C', id: 'cIteration' },
  { classes: 'animate-fade-in animation-iteration-count-2 animation-timeline-scroll', group: 'C', id: 'cIterationS' },
  { classes: 'animate-fade-in animation-fill-mode-none', group: 'C', id: 'cFill' },
  { classes: 'animate-fade-in animation-fill-mode-none animation-timeline-scroll', group: 'C', id: 'cFillS' },
  { classes: 'animate-fade-in animation-play-state-paused', group: 'C', id: 'cPlayState' },
  { classes: 'animate-fade-in animation-play-state-paused animation-timeline-scroll', group: 'C', id: 'cPlayStateS' },
  { classes: 'animate-fade-in animation-composition-add', group: 'C', id: 'cComposition' },
  { classes: 'animate-fade-in animation-composition-add animation-timeline-scroll', group: 'C', id: 'cCompositionS' },

  // D — what Jumi can write about a range, against what the platform does with a range.
  { classes: 'animate-fade-in animation-timeline-view animation-range-start-entry animation-range-end-cover', group: 'D', id: 'dRangeJumi' },
  { classes: 'animate-fade-in animation-timeline-view animation-range-[entry_0%_cover_50%]', group: 'D', id: 'dRangeJumiArb' },
  { classes: '', group: 'D', id: 'dPlainPct', where: 'plain' },
  { classes: '', group: 'D', id: 'dPlainNamed', where: 'plain' },
  { classes: '', group: 'D', id: 'dPlainMixed', where: 'plain' },
  { classes: '', group: 'D', id: 'dPlainLonghand', where: 'plain' },
  { classes: '', group: 'D', id: 'dOrderBefore', where: 'plain' },
  { classes: '', group: 'D', id: 'dOrderAfter', where: 'plain' },

  // E — named timelines: declaring, consuming, scoping, collisions.
  { classes: '', group: 'E', id: 'eNamed', where: 'plain' },
  { classes: '', group: 'E', id: 'eNamedOutside', where: 'plain' },
  { classes: '', group: 'E', id: 'eNamedMissing', where: 'plain' },
  { classes: '', group: 'E', id: 'eViewSelf', where: 'plain' },
  { classes: '', group: 'E', id: 'eViewNamed', where: 'plain' },
  { classes: '', group: 'E', id: 'eDup', where: 'plain' },

  // R — what a range value may look like. Jumi composes `animation-range` from a timeline name and an
  // offset, so the question is whether a composed default is a legal value at all, on each timeline
  // type, and whether it behaves like `normal`.
  { classes: '', group: 'R', id: 'rNormal', where: 'plain' },
  { classes: '', group: 'R', id: 'rNormalOffsets', where: 'plain' },
  { classes: '', group: 'R', id: 'rOffsets', where: 'plain' },
  { classes: '', group: 'R', id: 'rCoverView', where: 'plain' },
  { classes: '', group: 'R', id: 'rCoverScroll', where: 'plain' },
  { classes: '', group: 'R', id: 'rNormalScroll', where: 'plain' },
  { classes: '', group: 'R', id: 'rOrderBefore', where: 'plain' },
  { classes: '', group: 'R', id: 'rOrderAfter', where: 'plain' },
  { classes: '', group: 'R', id: 'rVarScoped', where: 'plain' },
  { classes: '', group: 'R', id: 'rVarGlobal', where: 'plain' },
  { classes: '', group: 'R', id: 'rVarMixed', where: 'plain' },
  { classes: '', group: 'R', id: 'rVarMixedValid', where: 'plain' },
  { classes: '', group: 'R', id: 'rEmpty', where: 'plain' },
  { classes: '', group: 'R', id: 'rEmptySet', where: 'plain' },

  // X — the fallback. `xDropped` is what an unsupported browser holds: the same motion with the
  // timeline declaration gone (which is exactly what a browser that cannot parse it keeps).
  { classes: 'animate-fade-in', group: 'X', id: 'xDropped', note: 'an unsupported browser: the timeline declaration does not exist' },
  { classes: 'animate-fade-in animation-timeline-view', group: 'X', id: 'xViewScrub' },
  { classes: 'animate-fade-in animation-timeline-[--nope]', group: 'X', id: 'xUnresolved', note: 'a timeline that cannot resolve, which is not the same as an unsupported one' },

  // F — reduced motion. The same arm is read again in a context that asks for nothing animated,
  // with and without the clamp an author would write.
  { classes: 'animate-fade-in animation-timeline-scroll', group: 'F', id: 'fScroll' },
  { classes: 'animate-fade-in animation-timeline-scroll motion-reduce:animation-timeline-none', group: 'F', id: 'fClamped' },
  { classes: 'animate-fade-in motion-safe:animation-timeline-scroll', group: 'F', id: 'fMotionSafe' },

  // G — the compositor. One scroll-driven slot on a compositable property, one on a property that
  // cannot be composited; the difference is what the main thread is asked to do during a scroll.
  { classes: 'animate-fade-in animation-timeline-scroll', group: 'G', id: 'gOpacity' },
  { classes: 'animate-width-50 animation-timeline-scroll', group: 'G', id: 'gWidth' },
  { classes: 'animate-width-50', group: 'G', id: 'gWidthTime', note: 'the control for the compositor arm: same property, document timeline' },
]

/** The Jumi arm's element ids, which is what the page mounts and the reader sweeps. */
export const JUMI_IDS = ARMS.filter(arm => arm.where !== 'plain').map(arm => arm.id)

/** Every class token the compiler has to be given, variant prefix included. */
export const CANDIDATES = [...new Set(
  ARMS
    .filter(arm => arm.where !== 'plain')
    .flatMap(arm => arm.classes.split(/\s+/).filter(Boolean)),
)]

/**
 * The platform arm. Everything here is a fact Jumi cannot state today.
 *
 * `#pane` publishes `--page`; `#dupA` and `#dupB` both publish `--dup` and are nested so both are
 * in scope for one consumer; `#subjectView` publishes a view timeline for itself and its child.
 */
export const PLAIN = `
  @keyframes plain-fade { from { opacity: 0 } to { opacity: 1 } }

  #pane { scroll-timeline: --page block; }
  #dupA { scroll-timeline: --dup block; }
  #dupB { scroll-timeline: --dup block; }
  #subjectView { view-timeline: --card block; }

  #dPlainPct      { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range: 25% 75%; }
  #dPlainNamed    { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range: entry; }
  #dPlainMixed    { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range: entry 0% cover 50%; }
  #dPlainLonghand { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range-start: entry 25%; animation-range-end: exit 75%; }

  /* Declaration order against the shorthand: the shorthand resets both longhands it cannot set. */
  #dOrderBefore { animation-timeline: scroll(block root); animation-composition: add; animation: plain-fade 1s linear forwards; }
  #dOrderAfter  { animation: plain-fade 1s linear forwards; animation-timeline: scroll(block root); animation-composition: add; }

  /* A named scroll timeline, published by #pane and consumed by a descendant. */
  #eNamed        { animation: plain-fade 1s linear forwards; animation-timeline: --page; }
  #eNamedOutside { animation: plain-fade 1s linear forwards; animation-timeline: --page; }
  #eNamedMissing { animation: plain-fade 1s linear forwards; animation-timeline: --nope; }

  /* A named view timeline: published by the subject, consumed by itself and by its child. */
  #eViewSelf  { animation: plain-fade 1s linear forwards; animation-timeline: --card; }
  #eViewNamed { animation: plain-fade 1s linear forwards; animation-timeline: --card; }

  /* Two scrollers in the consumer's scope publish the same name. */
  #eDup { animation: plain-fade 1s linear forwards; animation-timeline: --dup; }

  /* Range spelling and validity, one declaration per element so a dropped one is visible. */
  #rNormal        { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range: normal; }
  #rNormalOffsets { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range: normal 0% normal 100%; }
  #rOffsets       { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range: 0% 100%; }
  #rCoverView     { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range: cover 0% cover 100%; }
  #rCoverScroll   { animation: plain-fade 1s linear forwards; animation-timeline: scroll(root); animation-range: cover 0% cover 100%; }
  #rNormalScroll  { animation: plain-fade 1s linear forwards; animation-timeline: scroll(root); animation-range: normal; }

  /* Declaration order against the shorthand, for the range this time. */
  #rOrderBefore { animation-range: 25% 75%; animation-timeline: view(); animation: plain-fade 1s linear forwards; }
  #rOrderAfter  { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range: 25% 75%; }

  /*
   * The emission's own shape: a per-slot custom property with the global one as the var() fallback.
   * If the fallback string were not a legal value the whole declaration would die at
   * computed-value time and the *live* position would lose its range too — which is the failure this
   * pair exists to catch, and which a normal-looking computed value cannot distinguish on its own.
   */
  #rVarScoped { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range: var(--range-under-test, normal 0% normal 100%); }
  #rVarGlobal { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range: var(--range-never-set, normal 0% normal 100%); }
  #rVarMixed  { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range: var(--range-under-test, normal 0% normal 100%), var(--range-never-set, normal 0% normal 100%); }
  #rVarMixedValid { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range: var(--range-under-test, 0% 100%), var(--range-never-set, 0% 100%); }

  /*
   * The composed default with the name part allowed to be *absent* — an empty var() fallback — so the
   * parts stay usable and the substituted value is still legal when nothing is set.
   */
  #rEmpty { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range: var(--rn-start-name,) var(--rn-start-offset, 0%) var(--rn-end-name,) var(--rn-end-offset, 100%); }
  #rEmptySet { animation: plain-fade 1s linear forwards; animation-timeline: view(); animation-range: var(--rn-start-name,) var(--rn-start-offset, 0%) var(--rn-end-name,) var(--rn-end-offset, 100%); }
`

/** The page. Geometry is instrument: no overflow, no timeline. */
export const page = (jumiCss, reader) => `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  html { scroll-behavior: auto; }
  body { margin: 0; font: 12px/1.2 system-ui; }
  #top { height: 240px; background: #f4f4f4; }
  #lane { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 8px; }
  .box { min-height: 56px; background: #ddd; border: 1px solid #bbb; }
  #pane { height: 220px; overflow-y: auto; background: #eef; }
  #pane .box { min-height: 60px; }
  #self { height: 140px; overflow-y: auto; background: #efe; }
  #self .box { min-height: 90px; }
  #dupes { padding: 8px; }
  #dupA, #dupB { height: 180px; overflow-y: auto; background: #ffe; }
  #plainZone, #subjectView { display: grid; gap: 8px; padding: 8px; }
  #subjectView { background: #f6f6f6; }
  /* Every range arm shares one box, or the sweep measures layout position instead of the declaration. */
  #rangeZone { position: relative; height: 160px; }
  #rangeZone > * { position: absolute; inset: 0; }
  #tail { height: 1800px; }
</style>
<style id="plain">${PLAIN}</style>
<style id="jumi">${jumiCss}</style>
</head><body>
<div id="top">top</div>
<div id="lane"></div>

<div id="self"></div>

<div id="dupes">
  <div id="dupA"><div id="dupB"><div class="box" id="eDup">dup consumer</div><div style="height:700px"></div></div><div style="height:700px"></div></div>
</div>

<div id="subjectView">subject<div class="box" id="eViewSelf">consumes --card, self</div><div class="box" id="eViewNamed">consumes --card, child</div></div>

<div id="pane"><div style="height:120px"></div><div id="paneSlot"></div><div style="height:900px"></div></div>

<div id="plainZone"></div>
<div id="rangeZone"></div>
<div id="tail">tail</div>

<script>
${reader}
</script>
</body></html>`

/**
 * The page-side reader. Mounted by id, so a probe never needs a selector language, and everything it
 * reports is either a computed value or a field of `getComputedTiming()` — the platform's own
 * account rather than ours.
 */
export const reader = (arms, properties) => `
  const ARMS = ${JSON.stringify(arms)}

  const mount = (arm) => {
    const host = arm.where === 'pane'
      ? document.getElementById('paneSlot')
      : arm.where === 'self'
        ? document.getElementById('self')
        : document.getElementById('lane')
    const node = document.createElement('div')

    node.className = 'box'
    node.id = arm.id
    if (arm.classes) node.className += ' ' + arm.classes
    if (arm.where === 'self') {
      node.style.height = '90px'
      node.style.overflowY = 'auto'
      node.insertAdjacentHTML('afterbegin', '<div style="height:700px"></div>')
    }
    host.appendChild(node)
  }

  for (const arm of ARMS) mount(arm)

  const RANGE_ARMS = ['rNormal', 'rNormalOffsets', 'rOffsets', 'rCoverView', 'rCoverScroll', 'rNormalScroll', 'rOrderBefore', 'rOrderAfter', 'rVarScoped', 'rVarGlobal', 'rVarMixed', 'rVarMixedValid', 'rEmpty', 'rEmptySet']

  for (const id of ['dPlainPct', 'dPlainNamed', 'dPlainMixed', 'dPlainLonghand', 'dOrderBefore', 'dOrderAfter', 'eNamed', 'eNamedOutside', 'eNamedMissing', ...RANGE_ARMS]) {
    const node = document.createElement('div')

    node.className = 'box'
    node.id = id

    const host = RANGE_ARMS.includes(id)
      ? 'rangeZone'
      : id.startsWith('eNamed') && id !== 'eNamedOutside' ? 'pane' : 'plainZone'

    document.getElementById(host).appendChild(node)
  }

  // Keep the pane scrollable once the plain arm's children are in it.
  document.getElementById('pane').insertAdjacentHTML('beforeend', '<div style="height:600px"></div>')

  const PROPERTIES = ${JSON.stringify(properties)}

  /**
   * A progress-based timeline reports its own clock as a CSSNumericValue — 25 percent, not 250ms —
   * and JSON cannot carry one. Normalised here, where the value is live, so the harness only ever
   * sees a number or a string.
   */
  const scalar = (value) => {
    if (value == null) return null
    if (typeof value === 'number' || typeof value === 'string') return value

    const text = typeof value.toString === 'function' ? String(value) : ''

    if (text && text !== '[object Object]') return text
    if (value.value != null && value.unit != null) return value.value + (value.unit === 'percent' ? '%' : value.unit)

    return value.constructor ? value.constructor.name : typeof value
  }

  const source = (timeline) => {
    const node = timeline?.source

    if (!node) return null
    if (node === document.documentElement) return 'root'
    if (node.nodeType === 1) return node.id || node.tagName

    return node.constructor.name
  }

  window.__read = (id) => {
    const node = document.getElementById(id)

    if (!node) return { missing: true }

    const style = getComputedStyle(node)
    const running = [...document.getAnimations()].filter(animation => animation.effect?.target === node)

    return {
      computed: Object.fromEntries(PROPERTIES.map(property => [property, style.getPropertyValue(property).trim()])),
      animations: running.map((animation) => {
        const timing = animation.effect.getComputedTiming()

        return {
          name: animation.animationName ?? '?',
          timeline: animation.timeline?.constructor?.name ?? null,
          source: source(animation.timeline),
          currentTime: scalar(animation.currentTime),
          progress: timing.progress,
          duration: scalar(timing.duration),
          delay: scalar(timing.delay),
          endTime: scalar(timing.endTime),
          easing: timing.easing,
          iterations: timing.iterations,
          direction: timing.direction,
          fill: timing.fill,
          playState: animation.playState,
          keyframes: animation.effect.getKeyframes().length,
        }
      }),
    }
  }

  /** Every arm's reading at once, so one scroll position is one observation. */
  window.__all = ids => Object.fromEntries(ids.map(id => [id, window.__read(id)]))

  /** One field out of every animation an arm reports, as a compact series. */
  window.__series = (ids, field) => Object.fromEntries(ids.map((id) => {
    const reading = window.__read(id)

    return [id, (reading.animations ?? []).map(animation => animation[field])]
  }))

  window.__scroll = (target, y) => {
    const node = target === 'root' ? document.documentElement : document.getElementById(target)

    node.scrollTop = y

    return node.scrollTop
  }

  window.__range = target => (target === 'root' ? document.documentElement : document.getElementById(target)).scrollHeight

  /** The raw shape of the timeline's clock, which is what the harness's formatter has to survive. */
  window.__shape = (id) => {
    const node = document.getElementById(id)
    const animation = [...document.getAnimations()].find(entry => entry.effect?.target === node)
    const clock = animation?.currentTime

    return {
      typeof: typeof clock,
      ctor: clock?.constructor?.name ?? null,
      toString: (() => { try { return String(clock) } catch (error) { return 'threw' } })(),
      unit: clock?.unit ?? null,
      value: clock?.value ?? null,
      keys: clock ? Object.keys(clock) : [],
    }
  }

  document.getElementById('rVarScoped').style.setProperty('--range-under-test', '25% 75%')
  document.getElementById('rVarMixed').style.setProperty('--range-under-test', '25% 75%')
  document.getElementById('rVarMixedValid').style.setProperty('--range-under-test', '25% 75%')
  document.getElementById('rEmptySet').style.setProperty('--rn-start-name', 'entry')
  document.getElementById('rEmptySet').style.setProperty('--rn-end-name', 'cover')
  document.getElementById('rEmptySet').style.setProperty('--rn-end-offset', '50%')

  window.__parse = (property, value) => CSS.supports(property, value)

  window.__support = () => ({
    animationTimeline: CSS.supports('animation-timeline', 'scroll()'),
    viewTimeline: CSS.supports('animation-timeline', 'view()'),
    animationRange: CSS.supports('animation-range', 'entry 0% cover 50%'),
    animationTrigger: CSS.supports('animation-trigger', 'play'),
    timelineTrigger: CSS.supports('timeline-trigger', 'none'),
    scrollTimelineName: CSS.supports('scroll-timeline-name', '--page'),
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  })

  window.__ready = true
`
