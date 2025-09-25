import 'eslint-plugin-only-warn'

import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { defineConfig } from 'eslint/config'

import stylistic from '@stylistic/eslint-plugin'
import typescript from '@typescript-eslint/parser'
import vitestPlugin from '@vitest/eslint-plugin'
import importX from 'eslint-plugin-import-x'
import tsPaths from 'eslint-plugin-paths'
import perfectionist from 'eslint-plugin-perfectionist'
import prettier from 'eslint-plugin-prettier'
import storybookPlugin from 'eslint-plugin-storybook'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const EXT = {
  COMMONJS: '**/*.cjs',
  CSS: '**/*.{css,scss,sass,less}',
  DEFINITION_FILES: '**/*.{d.ts,tsbuildinfo}',
  HTML: '**/*.{htm,html,xml,xhtml}',
  JS: '**/*.{js,jsx}',
  JSON: '**/*.{json,json5,jsonc}',
  MD: '**/*.{md,mdx,markdown}',
  MODULE: '**/*.{mjs,mjsx,mtsx}',
  STORYBOOK: '**/*.{stories,story}.{js,jsx,ts,tsx}',
  TEST: '**/*.{spec,test,cy}.{js,ts,jsx,tsx}',
  TS: '**/*.{ts,tsx}',
  TYPE_DEFINITION: '**/types/**',
  YML: '**/*.{yml,yaml}',
}

const ignoresConfig = defineConfig({
  ignores: [
    '**/node_modules/**',
    '**/coverage/**',
    '**/build/**',
    '**/public/**',
    '**/dist/**',
    '**/.vscode/**',
    '**/.github/**',
    '**/.next/**',
    '**/.turbo/**',
    '**/.vercel/**',
    '**/.output/**',
    '**/.yarn/**',
    '**/.yarn-cache/**',
    '**/.yarnrc.yml',
    '**/.yarnrc',
    '**/yarn.lock',
    '**/package.json',
    '**/package-lock.json',
    '**/tsconfig*.json',
    '**/pnpm-lock.yaml',
    '**/npm-shrinkwrap.json',
    '**/lerna-debug.log',
    '**/lerna.json',
    '**/tsconfig*.tsbuildinfo',
    '**/*.d.ts',
    "**/output.css",
  ],
})

const vitestConfig = defineConfig({
  extends: [vitestPlugin.configs.recommended],
  files: [EXT.JS, EXT.COMMONJS, EXT.MODULE, EXT.TEST],
  ignores: [EXT.DEFINITION_FILES, EXT.TYPE_DEFINITION],
  languageOptions: {
    globals: globals.vitest,
  },
  rules: {
    ...vitestPlugin.configs.recommended.rules,
    'vitest/expect-expect': 'off',
  },
})

const importConfig = defineConfig({
  extends: [importX.flatConfigs.typescript as any],
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  ignores: ['**/*.d.ts'],
  languageOptions: {
    parser: typescript,
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: 'latest',
    },
  },
  plugins: { typescript },
  rules: {
    'import-x/no-cycle': ['warn', { maxDepth: '∞' }],
  },
  settings: {
    'import-x/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import-x/ignore': ['node_modules', '\\.(coffee|scss|css|less|hbs|svg)$'],
    'import-x/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import-x/resolver-next': [
      createTypeScriptImportResolver({
        alwaysTryTypes: true,
        project: './tsconfig.json',
      }),
    ],
  },
})

const typescriptConfig = defineConfig({
  extends: [tseslint.configs.eslintRecommended],
  files: [EXT.TS],
  ignores: [EXT.DEFINITION_FILES, EXT.TYPE_DEFINITION, EXT.TEST],
  languageOptions: {
    globals: globals.browser,
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
      projectService: true,
    },
  },
  plugins: { 'ts-paths': tsPaths },
  rules: {
    'ts-paths/alias': ['warn'],
  },
})

const perfectionistConfig = defineConfig({
  files: [EXT.COMMONJS, EXT.JS, EXT.MODULE, EXT.TS, EXT.JSON, EXT.YML],
  ignores: ['**/*.d.ts'],
  plugins: { perfectionist },
  rules: {
    ...perfectionist.configs['recommended-natural'].rules,
    'perfectionist/sort-exports': [
      'warn',
      {
        fallbackSort: { order: 'asc', type: 'alphabetical' },
        groups: ['type-export', ['value-export', 'unknown']],
        partitionByNewLine: true,
        type: 'natural',
      },
    ],
    'perfectionist/sort-imports': [
      'warn',
      {
        fallbackSort: { order: 'asc', type: 'alphabetical' },
        groups: [
          ['type-builtin', 'type-subpath', 'type-external'],
          ['type-internal', 'type-parent', 'type-sibling', 'type-index'],
          ['named-type-builtin', 'named-type-subpath', 'named-type-external'],
          [
            'named-type-internal',
            'named-type-parent',
            'named-type-sibling',
            'named-type-index',
          ],
          ['ts-equals-import'],
          [
            'named-value-builtin',
            'named-value-subpath',
            'named-value-external',
          ],
          ['named-value-internal'],
          ['named-value-parent', 'named-value-sibling', 'named-value-index'],
          ['value-builtin', 'value-subpath', 'value-external'],
          ['value-internal'],
          ['value-parent', 'value-sibling', 'value-index'],
          ['value-side-effect', 'value-side-effect-style'],
          ['require-import'],
          ['unknown'],
        ],
        type: 'natural',
      },
    ],
  },
})

const stylisticConfig = defineConfig({
  extends: [stylistic.configs.recommended],
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  ignores: [EXT.DEFINITION_FILES, EXT.TYPE_DEFINITION, EXT.JSON, EXT.YML],
  plugins: { stylistic },
})

const storybookConfig = defineConfig({
  extends: storybookPlugin.configs['flat/recommended'],
  files: [EXT.STORYBOOK],
  languageOptions: {
    globals: globals.browser,
  },
  plugins: { storybookPlugin: storybookPlugin as any },
})

const prettierConfig = defineConfig({
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  plugins: { prettier },
})

export default defineConfig([
  ignoresConfig,
  vitestConfig,
  importConfig,
  typescriptConfig,
  perfectionistConfig,
  storybookConfig,
  // prettierConfig,  
  stylisticConfig,
])
