import {compiler,build,root} from './lib/compile.mjs'
import {writeFileSync} from 'node:fs'
const candidates=['animate-scale-x-[0:1|100:0]','animate-scale-[0:1_1|100:0_1]','animation-duration-[850ms]','animation-fill-mode-both']
const c=await compiler('@import "tailwindcss"; @plugin "./dist/index.js";',root)
const output=build(c,candidates)
writeFileSync('/tmp/jumi-zetta-scale-probe.css',output.css)
for(const match of output.css.matchAll(/@keyframes [\s\S]*?(?=\n@|$)/g)) console.log(match[0].slice(0,1200))
