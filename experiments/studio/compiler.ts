import { compile } from 'tailwindcss';
import jumi from '../../src/helpers/create';
import { finalizeCss } from '../../src/helpers/carriers';
Object.assign(globalThis,{ probeCompile: async (theme: string) => { const c=await compile(theme+'\n@tailwind utilities;\n@plugin "jumi";',{loadModule:async()=>({module:jumi,base:'.',path:'jumi'})});return finalizeCss(c.build(['animate-opacity-[0:0|100:1]','animation-duration-[1000ms]'])).css; }});
