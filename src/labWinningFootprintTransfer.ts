/**
 * FIGURAS PRIMERO: traslada huellas que explicaron una cabeza Nocturna real D−7.
 * No mira dígitos de la cabeza nueva antes de escoger las figuras actuales.
 * Selecciona RUTAS (celdas+fuente) y nunca familias; compara posteriormente
 * el sufijo concreto y su inversión física permitida. VT2/VT3 independientes.
 */
import type {DailySheet,SourceId} from './sheet';
import {cellsFromPlus11} from './paths';
import type {Cell,Path} from './paths';
export type N=2|3;
export type Mode='MISMO_SITIO'|'VERTICAL_1'|'FUENTE_VECINA'|'SITIO_O_VERTICAL';
export type Figure={source:SourceId;path:Path;key:string;shape:string;value:string};
export type PastWinnerFigure={source:SourceId;path:Path;key:string;shape:string;
 event:string;date:string;head:string;turn:string;jur:string};
const sourceIds:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const at=(c:{row:number;col:number})=>c.row+':'+c.col;
const pos=(p:Path)=>p.map(at).join('>');
const canonical=(p:Path)=>[pos(p),pos([...p].reverse())].sort()[0];
const validPair=(a:Cell,b:Cell)=>Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1;
export const shapeKey=(p:Path):string=>{
 const r=Math.min(...p.map(c=>c.row)),c=Math.min(...p.map(c=>c.col));
 const encode=(path:Path)=>path.map(x=>(x.row-r)+':'+(x.col-c)).join('>');
 return [encode(p),encode([...p].reverse())].sort()[0];
};
export const figureKey=(source:SourceId,p:Path)=>source+'|'+canonical(p);
export function enumerateFigures(sheet:DailySheet,n:N):Figure[]{
 const output:Figure[]=[];
 for(const column of sheet.columns){
  const cells=cellsFromPlus11(column.values);
  const seen=new Set<string>();
  const walk=(path:Path)=>{
   if(path.length===n){
    const key=figureKey(column.id,path);
    if(!seen.has(key)){seen.add(key);output.push({
      source:column.id,path,key,shape:shapeKey(path),
      value:path.map(c=>c.digit).join('')
    })}
    return;
   }
   for(const next of cells){
    if(path.some(x=>x.row===next.row&&x.col===next.col)||
       !validPair(path[path.length-1],next))continue;
    walk([...path,next]);
   }
  };
  for(const c of cells)walk([c]);
 }
 return output;
}
export function winningFigures(previous:DailySheet,previousDate:string,n:N):PastWinnerFigure[]{
 const result=new Map<string,PastWinnerFigure>();
 const matches=previous.matches.Nocturno||[];
 for(const m of matches){
  if(m.jurisdiccion==='Montevideo'||!/^[0-9]{4,5}$/.test(m.cabeza))continue;
  const target=m.cabeza.slice(-n);
  for(const hit of m.hits){
   if(hit.kind!=='vt'+n||hit.value!==target)continue;
   const source=previous.columns.find(c=>c.id===hit.sourceId);
   if(!source)continue;
   for(const path of hit.paths){
    if(path.length!==n||path.map(p=>p.digit).join('')!==target||
       path.some(c=>source.values[c.row]?.[c.col]!==c.digit)||
       path.slice(1).some((c,i)=>!validPair(path[i],c)))continue;
    const key=figureKey(hit.sourceId,path);
    const event=[previousDate,'Nocturno',m.jurisdiccion,m.cabeza].join('|');
    // Un mismo par ocupado con la misma huella se considera una posición,
    // aunque aparezca en más de una cabeza publicada.
    if(!result.has(key))result.set(key,{
     source:hit.sourceId,path,key,shape:shapeKey(path),event,date:previousDate,
     head:m.cabeza,turn:'Nocturno',jur:m.jurisdiccion
    });
   }
  }
 }
 return [...result.values()];
}
const translate=(p:Path,dr:number)=>p.map(c=>({...c,row:c.row+dr}));
export function moveWinnerFigures(previous:PastWinnerFigure[],available:Figure[],mode:Mode){
 const index=new Map(available.map(p=>[p.key,p]));
 const selected=new Map<string,{fig:Figure;roots:PastWinnerFigure[]}>();
 const byOriginal=new Set(previous.map(p=>p.key));
 for(const root of previous){
  const projected:{source:SourceId;path:Path}[]=[];
  if(mode==='MISMO_SITIO'||mode==='SITIO_O_VERTICAL')
   projected.push({source:root.source,path:root.path});
  if(mode==='VERTICAL_1'||mode==='SITIO_O_VERTICAL')
   for(const dr of [-1,1])projected.push({source:root.source,path:translate(root.path,dr)});
  if(mode==='FUENTE_VECINA'){
   const idx=sourceIds.indexOf(root.source);
   for(const dx of [-1,1]){
    const source=sourceIds[idx+dx];
    if(source)projected.push({source,path:root.path});
   }
  }
  for(const x of projected){
   const candidate=index.get(figureKey(x.source,x.path));
   if(!candidate||candidate.shape!==root.shape)continue;
   const old=selected.get(candidate.key)||{fig:candidate,roots:[]};
   if(!old.roots.some(r=>r.key===root.key))old.roots.push(root);
   selected.set(candidate.key,old);
  }
 }
 return {selected:[...selected.values()],oldRootSites:byOriginal.size};
}
export const matchesSuffix=(f:Figure,head:string,n:N)=>
 /^[0-9]{4,5}$/.test(head)&&
 (f.value===head.slice(-n)||[...f.value].reverse().join('')===head.slice(-n));
export function evaluateAgainstShapeControl(selected:Figure[],available:Figure[],
 heads:string[],n:N){
 const actual=heads.filter(x=>/^[0-9]{4,5}$/.test(x));
 const chosen=new Set(selected.map(f=>f.key));
 const pool=new Map<string,Figure[]>(),chosenPerGroup=new Map<string,number>();
 const group=(f:Figure)=>f.source+'|'+f.shape;
 for(const f of available){
  const g=group(f),a=pool.get(g)||[];a.push(f);pool.set(g,a);
 }
 for(const f of selected)chosenPerGroup.set(group(f),
  (chosenPerGroup.get(group(f))||0)+1);
 const impossible=selected.some(f=>!available.some(p=>p.key===f.key));
 if(impossible)throw Error('Una huella seleccionada no está en el tablero PRE');
 const yes=actual.filter(h=>selected.some(f=>matchesSuffix(f,h,n))).length;
 const no=actual.filter(h=>!selected.some(f=>matchesSuffix(f,h,n))&&
  available.some(f=>matchesSuffix(f,h,n))).length;
 let expected=0,eligible=0;
 for(const head of actual){
  // Condicionar la referencia a la misma fuente y SILUETA. Si una figura
  // ganadora no pertenece a esos grupos no puede acertarse bajo el control.
  let noHit=1;
  let hasPool=false;
  for(const [g,figures] of pool){
   const k=chosenPerGroup.get(g)||0;
   if(!k)continue;
   const winners=figures.filter(f=>matchesSuffix(f,head,n)).length;
   if(winners)hasPool=true;
   // Probabilidad hipergeométrica de seleccionar 0 rutas ganadoras,
   // tomando k lugares al azar SIN reemplazo entre N formas equivalentes.
   const N=figures.length;
   let miss=1;
   for(let i=0;i<k;i++)miss*=Math.max(0,N-winners-i)/(N-i);
   noHit*=miss;
  }
  expected+=1-noHit;
  if(hasPool)eligible++;
 }
 return {
  heads:actual.length,observed:yes,expected,
  otherPhysicalHeads:no,eligibleHeadsFromSameShape:eligible,
  selectedSites:selected.length,availableSites:available.length,
  exposureRatio:selected.length/Math.max(1,available.length),
  matchedExamples:actual.filter(h=>selected.some(f=>matchesSuffix(f,h,n))).slice(0,8)
 };
}
