/**
 * One Prettier configuration, for every tool in this repository that formats.
 *
 * Three of them do. `eslint-plugin-prettier` is the one that matters — ESLint is the registered default
 * formatter in `.vscode/settings.json`, and the options live in this file rather than in `eslint.config.mts`
 * so that a lint rule cannot disagree with the formatter. The Astro extension formats the pages under
 * `docs/src/`, and anyone running `prettier --write` directly is the third. One file, so all three agree.
 *
 * That is why this is a JavaScript config rather than the `.prettierrc` JSON it replaces: `.astro` cannot be
 * parsed without `prettier-plugin-astro`, and the plugin has to be declared **here**, in the project's own
 * config, where the CLI, the editor extension and `eslint-plugin-prettier` all resolve it. Left to whichever
 * installation happens to bundle a copy, the same file formats differently depending on the tool that ran —
 * which is the failure this exists to prevent, not a cosmetic difference.
 *
 * The parser override is the plugin's documented requirement. Prettier cannot infer a parser for `.astro` on
 * its own, and a page that reaches it without one is reported as unparseable rather than formatted.
 *
 * Every option below is exactly as it was in `.prettierrc`; the lint stage of `scripts/check.mjs` and the
 * editor's save action both run through this file, so nothing about formatting behaviour changes except that
 * Prettier can now read a page.
 */
export default {
  arrowParens: 'avoid',
  bracketSameLine: false,
  bracketSpacing: true,
  embeddedLanguageFormatting: 'auto',
  endOfLine: 'lf',
  experimentalTernaries: false,
  htmlWhitespaceSensitivity: 'css',
  insertPragma: false,
  jsxSingleQuote: true,
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
  plugins: ['prettier-plugin-astro'],
  printWidth: 80,
  proseWrap: 'preserve',
  quoteProps: 'consistent',
  requirePragma: false,
  semi: false,
  singleAttributePerLine: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
  vueIndentScriptAndStyle: false,
}
