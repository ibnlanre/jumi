/// <reference lib="webworker" />
import { compile } from 'tailwindcss';
import jumi from '../../../src/helpers/create';
import { finalizeCss } from '../../../src/helpers/carriers';
import theme from 'tailwindcss/theme.css?raw';
import entry from 'tailwindcss/index.css?raw';
import preflight from 'tailwindcss/preflight.css?raw';
import utilities from 'tailwindcss/utilities.css?raw';
import { readCatalog } from './catalog';
const catalog=readCatalog();
self.postMessage({type:'catalog',...catalog});
self.onmessage=async (event:MessageEvent<{revision:number;candidates:string[]}>)=>{
  const {revision,candidates}=event.data;
  try {
    const start=performance.now();
    const instance=await compile('@import "tailwindcss"; @plugin "jumi-studio";',{
      loadModule:async()=>({module:jumi,base:'.',path:'jumi-studio'}),
      loadStylesheet:async(id)=>{
        const sources:Record<string,string>={'tailwindcss':entry,'./theme.css':theme,'./preflight.css':preflight,'./utilities.css':utilities};
        if(!(id in sources))throw Error(`Unsupported stylesheet ${id}`);
        return {content:sources[id],base:'.',path:id};
      },
    });
    const result=finalizeCss(instance.build(candidates));
    self.postMessage({type:'compiled',revision,css:result.css,warnings:result.warnings,ms:Math.round(performance.now()-start)});
  } catch(error){self.postMessage({type:'error',revision,error:error instanceof Error?error.message:String(error)});}
};
