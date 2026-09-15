type Dock = 'bottom' | 'left' | 'right'
type Inspector = 'element' | 'keyframe' | 'motion'
const get = (selector: string) => document.querySelector<HTMLElement>(selector)!
const key = 'jumi-studio-workspace-v2'
const prefs = {
  bottom: 280,
  bottomOpen: true,
  bottomTab: 'timeline',
  inspector: 'element' as Inspector,
  left: 230,
  leftOpen: true,
  leftTab: 'layers',
  right: 280,
  rightOpen: true,
}
try {
  Object.assign(prefs, JSON.parse(localStorage.getItem(key) || '{}'))
} catch {}
const store = () => {
  try {
    localStorage.setItem(key, JSON.stringify(prefs))
  } catch {}
}
export function setupWorkspace() {
  const root = get('#studio-app')
  const bottom = document.createElement('section')
  bottom.id = 'bottom-dock'
  bottom.setAttribute('aria-label', 'Bottom dock')
  root.insertBefore(bottom, get('.timeline-panel'))
  const tabs = get('.output-toolbar')
  tabs.querySelector('[data-action=toggle-output]')?.remove()
  tabs
    .querySelector('.output-tabs')!
    .insertAdjacentHTML(
      'afterbegin',
      '<button role="tab" data-output="timeline">Timeline</button>',
    )
  bottom.append(tabs, get('.timeline-panel'), get('.output-panel'))
  tabs.insertAdjacentHTML(
    'beforeend',
    '<button data-dock="bottom" aria-label="Collapse bottom dock">⌄</button>',
  )
  get('.header-actions').insertAdjacentHTML(
    'afterbegin',
    '<div class="dock-switches" aria-label="Workspace docks"><button data-dock="left" title="Toggle layers" aria-label="Toggle left dock">◧</button><button data-dock="bottom" title="Toggle timeline and source" aria-label="Toggle bottom dock">⊟</button><button data-dock="right" title="Toggle inspector" aria-label="Toggle right dock">◨</button></div>',
  )
  get('.layers-panel .panel-title').insertAdjacentHTML(
    'afterend',
    '<div class="dock-tabs"><button data-left-tab="layers">Layers</button><button data-left-tab="context">Isolation</button></div>',
  )
  get('.inspector-panel .panel-title').insertAdjacentHTML(
    'afterend',
    '<div class="dock-tabs"><button data-inspector="element">Element</button><button data-inspector="motion">Motion</button><button data-inspector="keyframe">Keyframe</button></div>',
  )
  for (const dock of ['left', 'right', 'bottom'] as Dock[]) {
    const handle = document.createElement('div')
    handle.className = `dock-resizer resize-${dock}`
    handle.dataset.resize = dock
    handle.tabIndex = 0
    handle.setAttribute('role', 'separator')
    handle.setAttribute('aria-label', `Resize ${dock} dock`)
    handle.setAttribute(
      'aria-orientation',
      dock === 'bottom' ? 'horizontal' : 'vertical',
    )
    ;(dock === 'bottom'
      ? bottom
      : get(`.${dock === 'left' ? 'layers' : 'inspector'}-panel`)
    ).append(handle)
    handle.addEventListener('pointerdown', e => {
      if (e.button !== 0) return
      e.preventDefault()
      handle.setPointerCapture(e.pointerId)
      const initial = prefs[dock],
        x = e.clientX,
        y = e.clientY
      document.body.classList.add('resizing-dock')
      const move = (m: PointerEvent) =>
        resize(
          dock,
          initial +
            (dock === 'bottom'
              ? y - m.clientY
              : (m.clientX - x) * (dock === 'left' ? 1 : -1)),
        )
      const end = () => {
        handle.removeEventListener('pointermove', move)
        document.body.classList.remove('resizing-dock')
        store()
      }
      handle.addEventListener('pointermove', move)
      handle.addEventListener('pointerup', end, { once: true })
      handle.addEventListener('pointercancel', end, { once: true })
    })
    handle.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        toggle(dock)
        return
      }
      const delta = (
        {
          ArrowDown: 16,
          ArrowLeft: -16,
          ArrowRight: 16,
          ArrowUp: -16,
        } as Record<string, number>
      )[e.key]
      if (delta) {
        e.preventDefault()
        resize(dock, prefs[dock] + delta * (dock === 'left' ? 1 : -1))
        store()
      }
    })
  }
  document.addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLElement>('button')
    if (b?.dataset.dock) toggle(b.dataset.dock as Dock)
    if (b?.dataset.output) showBottom(b.dataset.output)
    if (b?.dataset.inspector) showInspector(b.dataset.inspector as Inspector)
    if (b?.dataset.leftTab) {
      prefs.leftTab = b.dataset.leftTab
      apply()
      store()
    }
  })
  const narrow = matchMedia('(max-width: 780px)')
  const adapt = () => {
    if (narrow.matches) {
      prefs.leftOpen = prefs.rightOpen = false
    }
    apply()
  }
  narrow.addEventListener('change', adapt)
  adapt()
  document
    .querySelectorAll<HTMLElement>('.dock-tabs,.output-tabs')
    .forEach(list => {
      list.setAttribute('role', 'tablist')
      list
        .querySelectorAll('button')
        .forEach(button => button.setAttribute('role', 'tab'))
      list.addEventListener('keydown', e => {
        if (!['ArrowLeft', 'ArrowRight', 'End', 'Home'].includes(e.key)) return
        e.preventDefault()
        const buttons = [...list.querySelectorAll<HTMLButtonElement>('button')],
          index = buttons.indexOf(document.activeElement as HTMLButtonElement)
        const next =
          e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? buttons.length - 1
              : (index + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) %
                buttons.length
        buttons[next].click()
        buttons[next].focus()
      })
    })
  apply()
}
export function showBottom(tab: string) {
  prefs.bottomTab = tab
  prefs.bottomOpen = true
  apply()
  store()
}
export function showInspector(context: Inspector, open = true) {
  prefs.inspector = context
  if (open) {
    prefs.rightOpen = true
    if (innerWidth < 780) prefs.leftOpen = false
  }
  apply()
  store()
}
export function workspaceTab() {
  return prefs.bottomTab
}
function apply() {
  const root = get('#studio-app')
  if (!get('#bottom-dock')) return
  for (const dock of ['left', 'right', 'bottom'] as Dock[]) {
    root.style.setProperty(`--${dock}-size`, `${prefs[dock]}px`)
    root.classList.toggle(`${dock}-closed`, !prefs[`${dock}Open`])
    document
      .querySelectorAll<HTMLElement>(`[data-dock="${dock}"]`)
      .forEach(b =>
        b.setAttribute('aria-expanded', String(prefs[`${dock}Open`])),
      )
    const separator = get(`[data-resize="${dock}"]`)
    separator?.setAttribute('aria-valuenow', String(Math.round(prefs[dock])))
    separator?.setAttribute('aria-valuemin', dock === 'bottom' ? '120' : '180')
    separator?.setAttribute(
      'aria-valuemax',
      String(
        dock === 'bottom' ? innerHeight - 220 : Math.min(480, innerWidth * 0.4),
      ),
    )
  }
  root.dataset.inspector = prefs.inspector
  root.dataset.leftTab = prefs.leftTab
  get('.timeline-panel').hidden = prefs.bottomTab !== 'timeline'
  get('.output-panel').hidden = prefs.bottomTab === 'timeline'
  for (const [attr, value] of [
    ['output', prefs.bottomTab],
    ['inspector', prefs.inspector],
    ['left-tab', prefs.leftTab],
  ])
    document
      .querySelectorAll<HTMLElement>(`button[data-${attr}]`)
      .forEach(b =>
        b.setAttribute(
          'aria-selected',
          String(b.getAttribute(`data-${attr}`) === value),
        ),
      )
}
function resize(dock: Dock, value: number) {
  prefs[dock] = Math.max(
    dock === 'bottom' ? 120 : 180,
    Math.min(
      dock === 'bottom' ? innerHeight - 220 : Math.min(480, innerWidth * 0.4),
      value,
    ),
  )
  apply()
}
function toggle(dock: Dock) {
  const key = `${dock}Open` as const
  prefs[key] = !prefs[key]
  if (innerWidth < 780 && prefs[key] && dock !== 'bottom')
    prefs[dock === 'left' ? 'rightOpen' : 'leftOpen'] = false
  apply()
  store()
}
