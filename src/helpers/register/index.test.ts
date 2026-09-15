import { describe, expect, it } from 'vitest'

import { pluginSpecifier, register, registerCss } from '@/helpers/register'

import postcss from 'postcss'

/**
 * The registration pass adds a directive to a user's stylesheet, so the tests are mostly about when
 * it stays out of the way: files that are not Tailwind entries, and files that already register
 * Jumi. Registering twice is not harmless — it emits every `@keyframes` twice — so "already there"
 * has to be recognised by more than an exact string match.
 */

const ENTRY =
  '@import "tailwindcss";\n\n.applied-motion {\n  @apply animations;\n}\n'

describe('registration', () => {
  it('adds the directive to a Tailwind entry, after the import', () => {
    const { css, entry, injected } = registerCss(ENTRY)

    expect({ entry, injected }).toEqual({ entry: true, injected: true })
    expect(css).toBe(
      `@import "tailwindcss";\n@plugin "${pluginSpecifier}";\n\n.applied-motion {\n  @apply animations;\n}\n`,
    )
  })

  it('leaves a stylesheet that is not a Tailwind entry untouched', () => {
    const css = '.card {\n  color: red;\n}\n'

    expect(registerCss(css)).toEqual({ css, entry: false, injected: false })
  })

  it('does not mistake a comment or a string for an import', () => {
    const css =
      '/* @import "tailwindcss"; */\n.quoted::before { content: "@import \'tailwindcss\'"; }\n'

    expect(registerCss(css)).toEqual({ css, entry: false, injected: false })
  })

  it('recognises Tailwind subpaths and the v3-era directives as an entry', () => {
    expect(registerCss('@import "tailwindcss/utilities.css";\n').injected).toBe(
      true,
    )
    expect(registerCss('@import "tailwindcss" source(none);\n').injected).toBe(
      true,
    )
    expect(registerCss('@tailwind utilities;\n').injected).toBe(true)
  })

  it('does nothing when the file already registers Jumi', () => {
    const css = `@import "tailwindcss";\n@plugin "${pluginSpecifier}";\n`

    expect(registerCss(css)).toEqual({ css, entry: true, injected: false })
  })

  it('recognises a registration that names Jumi by path or scope', () => {
    for (const specifier of [
      '"../../vendor/jumi.js"',
      "'../dist/jumi.cjs'",
      '"@jumi/core"',
    ]) {
      const css = `@import "tailwindcss";\n@plugin ${specifier};\n`

      expect(registerCss(css)).toEqual({ css, entry: true, injected: false })
    }
  })

  it('adds its own directive beside somebody else’s plugin', () => {
    const { css, injected } = registerCss(
      '@import "tailwindcss";\n@plugin "@tailwindcss/forms";\n',
    )

    expect(injected).toBe(true)
    expect(css).toBe(
      `@import "tailwindcss";\n@plugin "${pluginSpecifier}";\n@plugin "@tailwindcss/forms";\n`,
    )
  })

  it('takes a specifier, for both adding and recognising it', () => {
    const css = '@import "tailwindcss";\n'

    expect(registerCss(css, '../vendor/jumi.js').css).toBe(
      '@import "tailwindcss";\n@plugin "../vendor/jumi.js";\n',
    )

    const registered = '@import "tailwindcss";\n@plugin "../vendor/jumi.js";\n'

    expect(registerCss(registered, '../vendor/jumi.js')).toEqual({
      css: registered,
      entry: true,
      injected: false,
    })
  })

  it('is idempotent', () => {
    const once = registerCss(ENTRY)

    expect(registerCss(once.css)).toEqual({
      css: once.css,
      entry: true,
      injected: false,
    })
  })

  it('walks an AST in place, so a PostCSS plugin needs no parse', () => {
    const root = postcss.parse(ENTRY)

    const { injected } = register(root)

    expect(injected).toBe(true)
    expect(root.toString()).toContain(`@plugin "${pluginSpecifier}";`)
    expect(root.toString().indexOf('@import')).toBeLessThan(
      root.toString().indexOf('@plugin'),
    )
  })
})
