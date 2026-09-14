import { documentHtml, flatten, parentOf, trackClasses } from './model';
import type { StudioProject } from './model';
export class SceneSandbox {
  frame: HTMLIFrameElement;
  animations: Animation[]=[];
  ready=false;
  onSelect:(id:string,multi:boolean)=>void=()=>{};
  onHover:(id:string|null)=>void=()=>{};
  onDrill:(id:string)=>void=()=>{};
  project:StudioProject;
  constructor(frame:HTMLIFrameElement,project:StudioProject){this.frame=frame;this.project=project;}
  get doc(){return this.frame.contentDocument!;}
  element(id:string){return this.doc?.getElementById(id);}
  async load(project:StudioProject,css:string){this.ready=false;this.project=project;
    await new Promise<void>(resolve=>{this.frame.onload=()=>resolve();this.frame.srcdoc=documentHtml(project,css,true);});
    this.ready=true;
    this.doc.addEventListener('click',event=>{event.preventDefault();const e=(event.target as Element).closest('[id]');if(e&&this.selectable(e.id))this.onSelect(e.id,(event as MouseEvent).shiftKey);});
    this.doc.addEventListener('dblclick',event=>{event.preventDefault();const e=(event.target as Element).closest('[id]');if(e&&this.selectable(e.id))this.onDrill(e.id);});
    this.doc.addEventListener('pointermove',event=>{const e=(event.target as Element).closest('[id]');this.onHover(e&&this.selectable(e.id)?e.id:null);});
    this.doc.addEventListener('pointerleave',()=>this.onHover(null));
    this.collect();this.isolate();
  }
  selectable(id:string){return flatten(this.project.scene.root).some(n=>n.id===id)&&!this.project.editor.locked.includes(id)&&!this.project.editor.hidden.includes(id);}
  patch(project:StudioProject,css:string){this.project=project;if(!this.ready)return;
    this.doc.getElementById('jumi-output')!.textContent=css;
    this.doc.getElementById('scene-base')!.textContent=project.scene.css;
    for(const n of flatten(project.scene.root)){const el=this.element(n.id);if(el)el.setAttribute('class',[n.attributes.class||'',...project.tracks.filter(t=>t.nodeId===n.id).flatMap(trackClasses)].join(' '));}
    this.collect();this.isolate();
  }
  collect(){this.doc.body.getBoundingClientRect();this.animations=this.doc.getAnimations();for(const a of this.animations)a.pause();}
  seek(ms:number){for(const a of this.animations){a.pause();a.currentTime=ms;}}
  play(ms:number){const now=this.doc.timeline.currentTime;for(const a of this.animations){a.currentTime=ms;a.play();if(typeof now==='number')a.startTime=now-ms;}}
  pause(){for(const a of this.animations)a.pause();}
  isolate(){if(!this.ready)return;const p=this.project;const all=flatten(p.scene.root);const rules:string[]=[];
    if(p.editor.isolation!=='none'){
      rules.push(all.map(n=>`#${CSS.escape(n.id)}`).join(',')+'{visibility:hidden!important}');
      const visible=new Set(p.editor.selected);
      for(const id of p.editor.selected){const n=all.find(n=>n.id===id);if(!n)continue;if(p.editor.isolation==='children')n.children.forEach(c=>visible.add(c.id));if(p.editor.isolation==='subtree')flatten(n).forEach(c=>visible.add(c.id));}
      if(visible.size)rules.push([...visible].map(id=>`#${CSS.escape(id)}`).join(',')+'{visibility:visible!important}');
      if(p.editor.ghosts){const roots=new Set<string>();for(const id of p.editor.selected){const parent=parentOf(p.scene.root,id);for(const sibling of parent?.children??[]){const branch=flatten(sibling);if(branch.some(n=>visible.has(n.id)))continue;roots.add(sibling.id);}}
        for(const id of roots){const n=all.find(n=>n.id===id)!;rules.push(flatten(n).map(c=>`#${CSS.escape(c.id)}`).join(',')+'{visibility:visible!important}');rules.push(`#${CSS.escape(id)}{opacity:.16!important}`);}}
    }
    for(const id of p.editor.hidden){const n=all.find(n=>n.id===id);if(n)rules.push(flatten(n).map(c=>`#${CSS.escape(c.id)}`).join(',')+'{visibility:hidden!important}');}
    this.doc.getElementById('studio-isolation')!.textContent=rules.join('\n');
  }
  bounds(id:string){const el=this.element(id);if(!el)return null;const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};}
  /** Map a local transform origin through the browser's 2D matrices. Do not guess for 3D/path transforms. */
  origin(id:string):{x:number;y:number}|null {
    const el=this.element(id);if(!el)return null;
    const win=this.frame.contentWindow!,style=win.getComputedStyle(el);
    const [ox,oy]=style.transformOrigin.split(' ').map(parseFloat);
    if(!Number.isFinite(ox)||!Number.isFinite(oy))return null;
    if('getScreenCTM' in el){
      const svg=el as unknown as SVGGraphicsElement,ctm=svg.getScreenCTM();if(!ctm)return null;
      const b=svg.getBBox(),fillBox=['fill-box','stroke-box'].includes(style.transformBox);
      const point=new DOMPoint(ox+(fillBox?b.x:0),oy+(fillBox?b.y:0)).matrixTransform(ctm);
      return {x:point.x,y:point.y};
    }
    const chain:Element[]=[];for(let n:Element|null=el;n;n=n.parentElement)chain.unshift(n);
    let matrix=new DOMMatrix();
    const angle=(value:string)=>{const number=parseFloat(value);return value.endsWith('turn')?number*360:value.endsWith('rad')?number*180/Math.PI:value.endsWith('grad')?number*.9:number;};
    for(const node of chain){const s=win.getComputedStyle(node);
      if(s.perspective!=='none'||s.offsetPath!=='none')return null;
      const transform=new DOMMatrix(s.transform==='none'?undefined:s.transform);if(!transform.is2D)return null;
      const rotation=s.rotate==='none'?0:angle(s.rotate);if(!Number.isFinite(rotation)||s.rotate.includes(' '))return null;
      const scales=s.scale==='none'?[1,1]:s.scale.split(' ').map(Number);if(scales.length>2)return null;
      matrix=matrix.multiply(new DOMMatrix().rotate(rotation).scale(scales[0],scales[1]??scales[0]).multiply(transform));
    }
    const extras=(axis:'x'|'y')=>(axis==='x'?['paddingLeft','paddingRight','borderLeftWidth','borderRightWidth']:['paddingTop','paddingBottom','borderTopWidth','borderBottomWidth']).reduce((sum,key)=>sum+(parseFloat(style[key as keyof CSSStyleDeclaration] as string)||0),0);
    const w=parseFloat(style.width)+(style.boxSizing==='border-box'?0:extras('x')),h=parseFloat(style.height)+(style.boxSizing==='border-box'?0:extras('y'));
    if(!Number.isFinite(w)||!Number.isFinite(h))return null;
    // Translation is recovered from the measured bounds; ancestor origins and layout offsets are already in them.
    matrix.e=matrix.f=0;
    const points=[[0,0],[w,0],[0,h],[w,h]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(matrix));
    const r=el.getBoundingClientRect(),point=new DOMPoint(ox,oy).matrixTransform(matrix);
    return {x:r.x-Math.min(...points.map(p=>p.x))+point.x,y:r.y-Math.min(...points.map(p=>p.y))+point.y};
  }
  inspect(id:string,attribute='opacity'){const el=this.element(id);if(!el)return null;const style=this.frame.contentWindow!.getComputedStyle(el);let svgBox=null;
    if('getBBox'in el){try{const b=(el as unknown as SVGGraphicsElement).getBBox();svgBox={x:b.x,y:b.y,width:b.width,height:b.height};}catch{}}
    return{bounds:this.bounds(id),svgBox,origin:style.transformOrigin,value:style.getPropertyValue(attribute),display:style.display,animations:el.getAnimations().length};}
}
