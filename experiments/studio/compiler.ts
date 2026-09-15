import { compile } from 'tailwindcss'

import { finalizeCss } from '@/helpers/carriers'

import jumi from '@/helpers/create'
Object.assign(globalThis, {
  probeCompile: async (theme: string) => {
    const c = await compile(theme + '\n@tailwind utilities;\n@plugin "jumi";', {
      loadModule: async () => ({ base: '.', module: jumi, path: 'jumi' }),
    })
    return finalizeCss(
      c.build(['animate-opacity-[0:0|100:1]', 'animation-duration-[1000ms]']),
    ).css
  },
})
