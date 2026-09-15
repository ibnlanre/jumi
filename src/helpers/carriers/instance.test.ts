import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import {
  ACTIVATED_SLOT,
  instanceKeys,
  LABELLED_SLOT,
} from '@/helpers/carriers/instance'

import path from 'node:path'
import postcss from 'postcss'

/**
 * The architectural invariant behind motion instances, as an assertion.
 *
 * A rule activates a **definition** and, when it wrote a name, means one **instance** of that definition.
 * Two passes need that answer — the finalizer, which publishes a slot's value onto the rules that activate
 * it, and the range pass, which publishes the range a variant qualified — and each used to derive it
 * itself. They drifted, in the way independent derivations do: the hoist published every instance a rule
 * could carry (so a named motion also ran the unnamed one, at the scope's timing, and candidate order
 * decided which the browser kept), while the range pass assumed the definition (so a ranged *named* phrase
 * was ranged nowhere, and it only appeared to work because of the first bug).
 *
 * So the rule is: **no pass reconstructs an instance from activation/label state.** They read it from
 * `./instance`, and the scan below is what keeps a third pass from writing a fourth copy.
 */

const DIRECTORY = path.dirname(new URL(import.meta.url).pathname)

/** The tree the rule covers — every pass, not only this one. */
const SOURCE = path.resolve(DIRECTORY, '..', '..')

/**
 * The two modules that may state these patterns, and neither is a pass.
 *
 * `instance.ts` is the derivation itself. `src/core` is the **writer**: it formats the activation
 * variable and the label declaration, so it cannot be reconstructing them from themselves — and the one
 * place it does read a name format, `registerName`, is computing the hoisted variable to register
 * non-inheriting in step with the finalizer's publication. A name-format dependency between two writers
 * is not an instance read off a rule.
 */
const WRITERS = new Set([
  path.join(DIRECTORY, 'instance.ts'),
  path.resolve(SOURCE, 'core'),
])

const sources = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name)

    if (entry.isDirectory()) return sources(full)

    return entry.name.endsWith('.ts') && !entry.name.includes('.test.')
      ? [full]
      : []
  })

/** A rule, parsed from the declarations that matter to this module and nothing else. */
const rule = (declarations: string) =>
  postcss.parse(`a { ${declarations} }`).first as postcss.Rule

describe('which instance of a definition a rule means', () => {
  it('is the definition itself when the rule named nothing', () => {
    const unnamed = rule('--jumi-scale-d38-animation-name: jumi-scale-d38;')

    expect(instanceKeys(unnamed, 'scale-d38')).toEqual(['scale-d38'])
  })

  it('is the named instance, and not also the definition', () => {
    // The bug this shape exists for. A rule that named its motion means *that* motion; the unnamed
    // instance of the same definition is what a different candidate declared, and publishing both made
    // one element run one keyframe twice — once at the scope's timing, once at the name's.
    const named = rule(
      '--jumi-scale-d38-animation-name: jumi-scale-d38;' +
        '--jumi-scale-d38-4RGfw-label: loop;',
    )

    expect(instanceKeys(named, 'scale-d38')).toEqual(['scale-d38-4RGfw'])
  })

  it('is every instance the rule named, when it named more than one', () => {
    const twice = rule(
      '--jumi-scale-d38-animation-name: jumi-scale-d38;' +
        '--jumi-scale-d38-4RGfw-label: enter;' +
        '--jumi-scale-d38-9Kd2q-label: exit;',
    )

    expect(instanceKeys(twice, 'scale-d38')).toEqual([
      'scale-d38-4RGfw',
      'scale-d38-9Kd2q',
    ])
  })

  it('ignores a name that belongs to another definition', () => {
    const other = rule(
      '--jumi-scale-d38-animation-name: jumi-scale-d38;' +
        '--jumi-opacity-sluPU-4RGfw-label: enter;',
    )

    expect(instanceKeys(other, 'scale-d38')).toEqual(['scale-d38'])
  })

  it('reads a composed tween as the definition, which is its one instance', () => {
    // The case where the two coincide rather than collide: a composed tween's label is keyed by the slot
    // itself (`--jumi-filter-label`), so nothing matches `filter-` and the base key *is* the named
    // instance — measured, `animate-filter-blur-[4px]/foo` resolving `0.5s` on one `jumi-filter` motion.
    const composed = rule(
      '--jumi-filter-animation-name: jumi-filter;' +
        '--jumi-filter-label: foo;',
    )

    expect(instanceKeys(composed, 'filter')).toEqual(['filter'])
  })
})

describe('the instance derivation is one derivation', () => {
  it('is declared in `instance.ts` and nowhere else a pass could read it', () => {
    // A third pass that needs this fact has to import it. Reconstructing it is a two-line temptation with
    // a silent failure mode — the pattern is easy to write and impossible to notice being wrong. The scan
    // covers every non-test source, not just this directory, because the passes do not live in one place:
    // the hoist is here, the range reading is here, and the next one will be wherever it is needed.
    const offenders = sources(SOURCE)
      .filter(
        file =>
          !WRITERS.has(file) &&
          ![...WRITERS].some(writer => file.startsWith(`${writer}${path.sep}`)),
      )
      .filter(file => {
        const source = readFileSync(file, 'utf8')

        return (
          source.includes(String(ACTIVATED_SLOT)) ||
          source.includes(String(LABELLED_SLOT))
        )
      })
      .map(file => path.relative(SOURCE, file))

    expect(offenders).toEqual([])
  })
})
