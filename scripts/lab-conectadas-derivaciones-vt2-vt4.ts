// Laboratorio VT2 y VT4 desde madres VT3 físicamente seleccionadas.
// Misma extensión para Geometría Completa y Configuraciones Conectadas.
// VT2: segmento físicamente contiguo de la madre. VT4: [cifra] + [VT3 madre],
// NUNCA invertir toda VT4 ni inventar otra madre por su sufijo.
import {cellsFromPlus11} from '../src/paths';
import type {Path,Cell} from '../src/paths';
import type {SheetColumn,SourceId} from '../src/sheet';
import {reversibleFamily,vt4PrefixFamily} from '../src/motorLalo';
export type Mother={family:string;source:SourceId;cells:string[];value:string};
export type Vt2Candidate={family:string;mother:string;source:SourceId;cells:string[];
 values:string[]};
export type Vt4Candidate={family:string;mother:string;addedDigit:string;source:SourceId;
 paths:{value:string;cells:string[]}[]};
export type Derivations={vt2:Vt2Candidate[];vt4:Vt4Candidate[];physicalVt4Paths:number};
const ck=(p:Path)=>p.map(c=>c.row+':'+c.col);
const isNeighbor=(a:Cell,b:Cell)=>Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1;
function parentPath(m:Mother,cols:Map<SourceId,SheetColumn>):Path|null{
 const c=cols.get(m.source);if(!c)return null;
 const lookup=new Map(cellsFromPlus11(c.values).map(p=>[p.row+':'+p.col,p]));
 const p=m.cells.map(x=>lookup.get(x));
 if(p.length!==3||p.some(x=>!x)||new Set(m.cells).size!==3)return null;
 const path=p as Path;
 if(!isNeighbor(path[0],path[1])||!isNeighbor(path[1],path[2]))return null;
 if(path.map(x=>x.digit).join('')!==m.value)throw Error('La madre no coincide con el PRE');
 if(reversibleFamily(m.value)!==m.family)throw Error('Familia VT3 madre contradictoria');
 return path;
}
export function deriveFromMothers(mothers:Mother[],columns:SheetColumn[],
 maxMothers=10):Derivations{
 const col=new Map(columns.map(c=>[c.id,c]));
 const selected=mothers.slice(0,maxMothers);
 const vt2:Vt2Candidate[]=[],seen2=new Set<string>();
 const buckets:Vt4Candidate[][]=[];
 let physicalVt4Paths=0;
 for(const mother of selected){
  const path=parentPath(mother,col);
  if(!path){buckets.push([]);continue}
  for(const two of [path.slice(0,2),path.slice(1,3)]){
   const value=two.map(x=>x.digit).join('');
   const family=reversibleFamily(value);
   if(seen2.has(family))continue;seen2.add(family);
   vt2.push({family,mother:mother.family,source:mother.source,cells:ck(two),values:[value]});
  }
  const options=new Map<string,Vt4Candidate>();
  const column=col.get(mother.source)!;
  const physical=cellsFromPlus11(column.values);
  for(const oriented of [path,[...path].reverse()]){
   for(const added of physical){
    if(oriented.includes(added)||!isNeighbor(added,oriented[0]))continue;
    const digits=[added,...oriented].map(c=>c.digit).join('');
    const allowed=vt4PrefixFamily(mother.family,added.digit);
    if(!allowed.includes(digits))throw Error('VT4 crea madre diferente: '+digits);
    const key=mother.family+'|'+added.digit;
    const exists=options.get(key);
    physicalVt4Paths++;
    const physicalPath={value:digits,cells:ck([added,...oriented])};
    if(exists){
     if(!exists.paths.some(p=>p.value===digits&&p.cells.join('>')===physicalPath.cells.join('>')))
      exists.paths.push(physicalPath);
    }else options.set(key,{family:allowed.join('/'),mother:mother.family,
     addedDigit:added.digit,source:mother.source,paths:[physicalPath]});
   }
  }
  buckets.push([...options.values()].sort((a,b)=>
   b.paths.length-a.paths.length||
   a.addedDigit.localeCompare(b.addedDigit)||
   a.source.localeCompare(b.source)));
 }
 // Round robin: una hija física de cada madre primero, sin privilegiar
 // cuatro hijas de la misma VT3 ante otras madres ya seleccionadas.
 const vt4:Vt4Candidate[]=[],seen4=new Set<string>();
 const total=Math.max(0,...buckets.map(xs=>xs.length));
 for(let slot=0;slot<total;slot++)for(const bucket of buckets){
  const item=bucket[slot];
  if(!item)continue;
  const key=item.mother+'|'+item.addedDigit;
  if(seen4.has(key))continue;seen4.add(key);
  vt4.push(item);
 }
 return {vt2,vt4,physicalVt4Paths};
}
export const vt2Hits=(families:string[],heads:string[])=>
 heads.filter(h=>/^\d{4}$/.test(h)&&families.includes(reversibleFamily(h.slice(-2)))).length;
export const vt4Hits=(candidates:Vt4Candidate[],heads:string[],limit:number)=>
 heads.filter(h=>/^\d{4}$/.test(h)&&candidates.slice(0,limit)
  .some(x=>x.paths.some(p=>p.value===h))).length;
export const physicalVt4ForHead=(heads:string[],candidates:Vt4Candidate[])=>
 heads.filter(h=>/^\d{4}$/.test(h)&&candidates.some(x=>
  x.paths.some(p=>p.value===h))).length;
