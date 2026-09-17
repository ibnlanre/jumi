/**
 * A research book: every line is an **assertion**, and the file exits non-zero if one fails.
 *
 * Research here is executable rather than documentary, for the same reason the rest of `scripts/`
 * is: a table of readings somebody has to interpret is a table that gets interpreted differently
 * next time, and a model that has already been killed once should not be able to come back because
 * the output was prose. The failure cases are the ones that matter most — "this is destructive" is
 * only a finding if something goes red when the destruction happens.
 */
export const createBook = title => {
  const lines = []
  const failures = []
  let checked = 0

  /** One assertion. `detail` is the reading, so a failure says what was measured. */
  const check = (label, ok, detail = '') => {
    checked += 1
    lines.push(
      `  ${ok ? '✓' : '✗'} ${label}${ok || !detail ? '' : ` — ${detail}`}`,
    )
    if (!ok) failures.push(label)
  }

  const section = name => lines.push(`\n${name}`)

  const report = () => {
    console.log(`\n${title}\n${lines.join('\n')}\n`)

    if (failures.length) {
      console.error(
        `✗ ${failures.length} of ${checked} assertions failed: ${failures.join('; ')}\n`,
      )
      process.exit(1)
    }

    console.log(`✓ all ${checked} assertions hold\n`)
  }

  return { check, report, section }
}

/**
 * Put a page in a browser and read a computed property at named **wall-clock** instants.
 *
 * Wall clock rather than progress, because the questions here are about several instances sharing
 * one timeline: a 500ms instance and a 2s instance are at different progresses at the same instant,
 * and stepping each by *its own* share would hide exactly the interference being hunted. The
 * instances are paused and stepped, never sampled live — a live read takes whatever moment the
 * machine happened to reach.
 */
export const sample = async (browser, { at, body, css, ids, property }) => {
  const page = await browser.newPage()
  await page.setContent(`<style>${css}</style>${body}`)

  const readings = await page.evaluate(
    async ({ at: instants, ids: elements, property: name }) => {
      const out = {}
      for (const id of elements) {
        const element = document.getElementById(id)
        const own = element.getAnimations()
        const values = []
        for (const instant of instants) {
          own.forEach(animation => animation.pause())
          own.forEach(animation => {
            animation.currentTime = instant
          })
          await new Promise(resolve => requestAnimationFrame(resolve))
          values.push(getComputedStyle(element)[name])
        }
        out[id] = {
          // The resolved clock of each instance, in creation order. Curve shape alone infers the
          // timing program; this reads it, so "these are two programs" is an assertion.
          durations: own.map(
            animation => animation.effect.getTiming().duration,
          ),
          instances: own.length,
          values,
        }
      }
      return out
    },
    { at, ids, property },
  )

  await page.close()

  return readings
}

/** Whether every reading equals the expected one, for an assertion detail that shows the reading. */
export const reads = (values, expected) =>
  values.length === expected.length &&
  values.every((value, index) => value === expected[index])

/** A `1 2 3` triple read as three numbers, for monotonicity checks. */
export const triples = values =>
  values.map(value => value.split(/\s+/).map(Number))
