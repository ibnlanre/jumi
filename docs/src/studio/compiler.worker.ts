/// <reference lib="webworker" />
import { compile } from 'tailwindcss'

import { finalizeCss } from '@/helpers/carriers'

import { readCatalog } from './catalog'

import entry from 'tailwindcss/index.css?raw'
import preflight from 'tailwindcss/preflight.css?raw'
import theme from 'tailwindcss/theme.css?raw'
import utilities from 'tailwindcss/utilities.css?raw'

import jumi from '@/helpers/create'
const catalog = readCatalog()
self.postMessage({ type: 'catalog', ...catalog })
self.onmessage = async (
  event: MessageEvent<{ candidates: string[]; revision: number }>,
) => {
  const { candidates, revision } = event.data
  try {
    const start = performance.now()
    const instance = await compile(
      '@import "tailwindcss"; @plugin "jumi-studio";',
      {
        loadModule: async () => ({
          base: '.',
          module: jumi,
          path: 'jumi-studio',
        }),
        loadStylesheet: async id => {
          const sources: Record<string, string> = {
            './preflight.css': preflight,
            './theme.css': theme,
            './utilities.css': utilities,
            'tailwindcss': entry,
          }
          if (!(id in sources)) throw Error(`Unsupported stylesheet ${id}`)
          return { base: '.', content: sources[id], path: id }
        },
      },
    )
    const result = finalizeCss(instance.build(candidates))
    self.postMessage({
      css: result.css,
      ms: Math.round(performance.now() - start),
      revision,
      type: 'compiled',
      warnings: result.warnings,
    })
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : String(error),
      revision,
      type: 'error',
    })
  }
}
