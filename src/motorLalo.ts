// Modelo Lalo · único motor experimental de candidatos VT2/VT3/VT4.
// PRE: no lee current.heads ni current.matches (objetivo/futuro).
// Hoja marcada = POST a cabezas publicadas, nunca un dibujo predictivo.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet,SourceId} from './sheet';
import {cellsFromPlus11} from './paths';
import type {Cell,Path} from './paths';

export type LaloKind='vt2'|'vt3'|'vt4';
export type RootPeriod='D−7'|'D−1';
export type RootRef={
 id:string;period:RootPeriod;date:string;head:string;jurisdiction:string;
 oldTurn:Turno;sourceId:SourceId;oldCells:string[];
};
export type LaloRoute={
 kind:LaloKind;family:string;value:string;sourceId:SourceId;path:Path;
 origin:'TRASLADO'|'BIFURCACIÓN'|'DESDE_VT3';
 rootIds:string[];mother?:string;mothers?:string[];addedDigit?:string;
};
export type LaloFamily={
 kind:LaloKind;family:string;rank:number;paths:LaloRoute[];
 sourceCount:number;directRoots:number;d7Roots:number;d1Roots:number;
 physicalBlocks:number;branchBlocks:number;parentFamilies:string[];
 vt4Meta?:Vt4MotherExtension;physicalValues?:string[];
 state:'EN_FORMACIÓN'|'EN_SEGUIMIENTO'|'CON_APOYO';
 rationale:string;
};
export type Vt4MotherExtension={motherFamily:string;addedDigit:string;side:'ANTES'|'DESPUES'};
export type LaloView={
 target:Turno;date:string;status:'EXPERIMENTAL_SIN_VALIDACIÓN';
 roots:RootRef[];
 ranks:Record<LaloKind,LaloFamily[]>;
};
export type LaloHistorical={date:string;sheet:DailySheet;period:RootPeriod};

const rev=(v:string)=>[...v].reverse().join('');
export const reversibleFamily=(value:string)=>[value,rev(value)].sort().join('/');
const coord=(p:Cell)=>p.row+':'+p.col;
const position=(p:Path)=>p.map(coord).join('>');
const reverseKey=(p:Path)=>[position(p),position([...p].reverse())].sort()[0];
const blockKey=(p:Path)=>p.map(coord).sort().join(',');
const edge=(a:Cell,b:Cell)=>[coord(a),coord(b)].sort().join('~');
const edges=(p:Path)=>new Set(p.slice(1).map((c,i)=>edge(p[i],c)));
const isAdjacent=(a:Cell,b:Cell)=>Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1;
const moves=(p:Path)=>p.slice(1).map((c,i)=>[c.row-p[i].row,c.col-p[i].col] as const);
const pathValue=(p:Path)=>p.map(x=>x.digit).join('');
const canonical=(kind:LaloKind,s:SourceId,p:Path)=>kind+'|'+s+'|'+reverseKey(p);
const valid=(path:Path,n:number)=>path.length===n&&new Set(path.map(coord)).size===n&&
 path.every((c,i)=>c.row>=0&&c.row<6&&c.col>=0&&c.col<2&&
 (!i||isAdjacent(path[i-1],c)));
const allPaths=(values:string[],length:number):Path[]=>{
 const cells=cellsFromPlus11(values),out:Path[]=[];
 const go=(p:Path)=>{
  if(p.length===length){out.push(p);return}
  const last=p[p.length-1];
  for(const c of cells)if(!p.includes(c)&&isAdjacent(last,c))go([...p,c]);
 };
 for(const c of cells)go([c]);
 return out;
};
const transferred=(values:string[],old:Path):Path[]=>{
 const cells=cellsFromPlus11(values),out:Path[]=[];
 for(const start of cells){
  const p:Path=[start];
  for(const [dr,dc] of moves(old)){
   const last=p[p.length-1],next=cells.find(c=>c.row===last.row+dr&&c.col===last.col+dc);
   if(!next||p.includes(next))break;
   p.push(next);
  }
  if(valid(p,old.length))out.push(p);
 }
 return out;
};

type Working={kind:LaloKind;family:string;paths:Map<string,LaloRoute>;vt4Meta?:Vt4MotherExtension};

/** Familia VT4: cifra extra en el mismo extremo + VT3, nunca inversa de las cuatro cifras. */
export function vt4MotherFamily(motherFamily:string,addedDigit:string,side:Vt4MotherExtension['side']):string{
 const pieces=motherFamily.split('/');
 if(pieces.length!==2||!pieces.every(x=>/^\d{3}$/.test(x))||
  [...pieces[0]].reverse().join('')!==pieces[1]||!/^\d$/.test(addedDigit))
  throw Error('Madre VT3/cifra extra inválida');
 const options=pieces.map(x=>side==='ANTES'?addedDigit+x:x+addedDigit);
 return options.sort().join('/');
}

/** Un único rótulo por madre+cifra+extremo; sólo guardar rutas físicas existentes. */
function selectVt4(groups:Map<string,Working>,mother:string,extra:string,
 side:Vt4MotherExtension['side'],source:SourceId,path:Path){
 if(!valid(path,4))return;
 const f=vt4MotherFamily(mother,extra,side),v=pathValue(path);
 if(!f.split('/').includes(v))throw Error('La VT4 no coincide con la madre VT3 y extremo');
 const key='vt4|'+mother+'|'+extra+'|'+side;
 let candidate=groups.get(key);
 if(!candidate){
  candidate={kind:'vt4',family:f,paths:new Map(),
   vt4Meta:{motherFamily:mother,addedDigit:extra,side}};
  groups.set(key,candidate);
 }
 const pkey=canonical('vt4',source,path);
 const prior=candidate.paths.get(pkey);
 if(prior){
  if(!prior.mothers?.includes(mother)){
   prior.mothers=[...(prior.mothers||[]),mother];
   if(!prior.mother)prior.mother=mother;
  }
 }else{
  candidate.paths.set(pkey,{kind:'vt4',family:f,value:v,sourceId:source,
   path,origin:'DESDE_VT3',rootIds:[],mother,mothers:[mother],addedDigit:extra});
 }
}

const selectKind=(families:Map<string,Working>,kind:LaloKind,value:string,source:SourceId,
 path:Path,origin:LaloRoute['origin'],rootId?:string,mother?:string,extra?:string)=>{
 if(!valid(path,kind==='vt2'?2:kind==='vt3'?3:4))return;
 const f=reversibleFamily(value),key=kind+'|'+f;
 let candidate=families.get(key);
 if(!candidate){candidate={kind,family:f,paths:new Map()};families.set(key,candidate)}
 const pkey=canonical(kind,source,path);
 const prior=candidate.paths.get(pkey);
 if(prior){
  if(rootId&&!prior.rootIds.includes(rootId))prior.rootIds.push(rootId);
  if(prior.origin!=='TRASLADO'&&origin==='TRASLADO')prior.origin=origin;
  if(mother){if(!prior.mother)prior.mother=mother;if(!prior.mothers)prior.mothers=prior.mother?[prior.mother]:[];if(!prior.mothers.includes(mother))prior.mothers.push(mother)}
 }else candidate.paths.set(pkey,{kind,family:f,value,sourceId:source,path,
  origin,rootIds:rootId?[rootId]:[],mother,mothers:mother?[mother]:[],addedDigit:extra});
};

const rank=(groups:Map<string,Working>,roots:Map<string,RootRef>,
 kind:LaloKind,motherRanks?:Map<string,number>):LaloFamily[]=>{
 const all=[...groups.values()].filter(g=>g.kind===kind).map(group=>{
  const paths=[...group.paths.values()];
  const sourceCount=new Set(paths.map(p=>p.sourceId)).size;
  const directIds=new Set(paths.flatMap(p=>p.rootIds));
  // Una misma cabeza completa puede haber generado muchos dibujos: NO son
  // varias confirmaciones históricas independientes.
  const uniqueEvents=new Map<string,RootRef>();
  for(const id of directIds){
   const old=roots.get(id);if(!old)continue;
   const event=[old.date,old.oldTurn,old.jurisdiction,old.head].join('|');
   uniqueEvents.set(event,old);
  }
  const d7Roots=[...uniqueEvents.values()].filter(r=>r.period==='D−7').length;
  const d1Roots=[...uniqueEvents.values()].filter(r=>r.period==='D−1').length;
  const physicalBlocks=new Set(paths.map(p=>p.sourceId+'|'+blockKey(p.path))).size;
  const branchBlocks=new Set(paths.filter(p=>p.origin==='BIFURCACIÓN').map(p=>p.sourceId+'|'+blockKey(p.path))).size;
  const parentFamilies=[...new Set(paths.flatMap(p=>p.mothers|| (p.mother?[p.mother]:[])))].sort();
  const parentRank=kind==='vt4'?Math.min(...parentFamilies.map(p=>motherRanks?.get(p)||99)):99;
  // Descriptivos, NO probabilidades ni pesos entrenados.
  // VT3: priorizar bifurcaciones verdaderas; D−1 y D−7 aportan raíces, no votos por recorrido.
  const importance=kind==='vt3'?
   [branchBlocks>0?1:0,Math.min(branchBlocks,15),Math.min(d1Roots,10),Math.min(d7Roots,10),sourceCount,physicalBlocks]:
   kind==='vt2'?
   [directIds.size>0?1:0,Math.min(d1Roots,10),Math.min(d7Roots,10),parentFamilies.length,sourceCount,physicalBlocks]:
   [-parentRank,sourceCount,physicalBlocks,Math.min(parentFamilies.length,5)];
  const state:LaloFamily['state']=uniqueEvents.size>=2||sourceCount>=2?'CON_APOYO':
   uniqueEvents.size||parentFamilies.length?'EN_SEGUIMIENTO':'EN_FORMACIÓN';
  const rationale=kind==='vt4'?
   'Cifra '+group.vt4Meta?.addedDigit+' '+(group.vt4Meta?.side==='ANTES'?'antes':'después')+
   ' de madre '+group.vt4Meta?.motherFamily+
   ' · '+physicalBlocks+' bloque(s) físicos · variantes trazadas: '+
   [...new Set(paths.map(p=>p.value))].sort().join(', '):
   (d7Roots?d7Roots+' raíz/raíces D−7 · ':'')+
   (d1Roots?d1Roots+' raíz/raíces D−1 · ':'')+
   (branchBlocks?branchBlocks+' bifurcación(es) · ':'')+
   (parentFamilies.length?parentFamilies.length+' madre(s) VT3 · ':'')+
   sourceCount+' fuente(s)';
  const physicalValues=kind==='vt4'?[...new Set(paths.map(p=>p.value))].sort():undefined;
  return {...group,paths,sourceCount,directRoots:uniqueEvents.size,d7Roots,d1Roots,
   physicalBlocks,branchBlocks,parentFamilies,state,rationale,importance,parentRank,
   physicalValues};
 });
 all.sort((a,b)=>{
  for(let i=0;i<Math.max(a.importance.length,b.importance.length);i++){
   const diff=(b.importance[i]||0)-(a.importance[i]||0);
   if(diff)return diff;
  }
  return a.family.localeCompare(b.family);
 });
 return all.map(({importance,parentRank,...f},i)=>({...f,rank:i+1}));
};

/** La única entrada PRE del sistema. Altera el pasado disponible, NUNCA el objetivo. */
export function buildMotorLalo(current:DailySheet,date:string,target:Turno,
 historical:LaloHistorical[]):LaloView{
 const targetIdx=TURNOS.indexOf(target);
 if(targetIdx<0)throw Error('Turno inválido');
 const visible=current.columns.slice(0,targetIdx+1);
 if(historical.some(h=>h.date>=date))throw Error('Fuga temporal: una hoja histórica no precede el objetivo');
 const roots=new Map<string,RootRef>();
 const base:Record<'vt2'|'vt3',Map<string,Working>>={vt2:new Map(),vt3:new Map()};
 for(const historic of historical){
  for(const t of TURNOS)for(const match of historic.sheet.matches[t]||[])
   for(const hit of match.hits){
    if(match.jurisdiccion==='Montevideo')continue; // solo geometría del +11
    if(hit.kind!=='vt2'&&hit.kind!=='vt3')continue;
    const column=visible.find(x=>x.id===hit.sourceId);
    if(!column)continue;
    for(const oldPath of hit.paths){
     const oldColumn=historic.sheet.columns.slice(0,TURNOS.indexOf(t)+1)
      .find(x=>x.id===hit.sourceId);
     // La huella antigua debe coincidir REALMENTE con una cabeza completa
     // anterior y con los dígitos físicos de su fuente, no sólo con su forma.
     if(!oldColumn||!/^\d{4}$/.test(match.cabeza)||
      !match.cabeza.endsWith(hit.value)||
      !valid(oldPath,Number(hit.kind.slice(-1)))||
      pathValue(oldPath)!==hit.value||
      oldPath.some(c=>oldColumn.values[c.row]?.[c.col]!==c.digit))continue;
     const id=[historic.date,historic.period,t,match.jurisdiccion,match.cabeza,
      hit.kind,hit.sourceId,reverseKey(oldPath)].join('|');
     if(!roots.has(id))roots.set(id,{id,period:historic.period,date:historic.date,
      head:match.cabeza,jurisdiction:match.jurisdiccion,oldTurn:t,
      sourceId:hit.sourceId,oldCells:oldPath.map(coord)});
     // Todas las traslaciones rígidas que mantienen su fuente original.
     for(const projected of transferred(column.values,oldPath))
      selectKind(base[hit.kind],hit.kind,pathValue(projected),column.id,projected,'TRASLADO',id);
    }
   }
 }
 // Familias VT3 bifurcadas: una ruta nueva comparte un BORDE completo
 // con una huella trasladada de SU MISMA familia y FUENTE.
 for(const column of visible){
  const pool=allPaths(column.values,3);
  const direct=[...base.vt3.values()].flatMap(x=>[...x.paths.values()])
   .filter(p=>p.sourceId===column.id&&p.origin==='TRASLADO');
  const byEdge=new Map<string,LaloRoute[]>();
  for(const d of direct)for(const e of edges(d.path)){
   const k=d.family+'|'+e,ls=byEdge.get(k)||[];ls.push(d);byEdge.set(k,ls);
  }
  for(const p of pool){
   const family=reversibleFamily(pathValue(p));
   const supporters=new Map<string,LaloRoute>();
   for(const e of edges(p))for(const d of byEdge.get(family+'|'+e)||[])
    if(blockKey(d.path)!==blockKey(p))supporters.set(canonical('vt3',d.sourceId,d.path),d);
   for(const d of supporters.values()){
    for(const rootId of d.rootIds)
     selectKind(base.vt3,'vt3',pathValue(p),column.id,p,'BIFURCACIÓN',rootId);
   }
  }
 }
 const vt3=rank(base.vt3,roots,'vt3');
 const selectedMothers=vt3.slice(0,10);
 const vt2=base.vt2;
 // La VT2 derivada SIEMPRE tiene dos casilleros físicos consecutivos de la VT3.
 for(const mother of selectedMothers)for(const p of mother.paths)
  for(const segment of [p.path.slice(0,2),p.path.slice(1,3)]){
   if(segment.length!==2)continue;
   selectKind(vt2,'vt2',pathValue(segment),p.sourceId,segment,'DESDE_VT3',
    undefined,mother.family);
  }
 const ranked2=rank(vt2,roots,'vt2');
 const vt4=new Map<string,Working>();
 // Cada hija tiene SU testigo de cuatro celdas (no se prestan testigos entre hermanas).
 for(const mother of selectedMothers)for(const parent of mother.paths){
  const column=visible.find(c=>c.id===parent.sourceId);
  if(!column)continue;
  const cells=cellsFromPlus11(column.values);
  for(const oriented of [parent.path,[...parent.path].reverse()])
   for(const c of cells){
    if(oriented.includes(c))continue;
    for(const [candidate,side] of [
     [[c,...oriented],'ANTES'],[[...oriented,c],'DESPUES']
    ] as const){
     if(!valid(candidate,4))continue;
     // El rótulo conserva la terna madre reversible y la posición de la cifra.
     // Las variantes visibles sólo se respaldan si existe cada camino completo.
     selectVt4(vt4,mother.family,c.digit,side,parent.sourceId,candidate);
    }
   }
 }
 const motherPositions=new Map(vt3.map(x=>[x.family,x.rank]));
 const ranked4=rank(vt4,roots,'vt4',motherPositions);
 return {target,date,status:'EXPERIMENTAL_SIN_VALIDACIÓN',
  roots:[...roots.values()],ranks:{vt2:ranked2,vt3,vt4:ranked4}};
}

/** POST separado: jamás se invoca desde buildMotorLalo. */
export function compareMotorLaloAfterDraw(view:LaloView,heads:string[]):Record<LaloKind,string[]>{
 const actual=heads.filter(h=>/^\d{4}$/.test(h));
 return Object.fromEntries((['vt2','vt3','vt4'] as LaloKind[]).map(k=>{
  const n=Number(k.slice(-1));
  const observed=new Set(actual.map(h=>reversibleFamily(h.slice(-n))));
  return [k,view.ranks[k].slice(0,10).filter(f=>
   k==='vt4'?f.paths.some(p=>actual.includes(p.value)):observed.has(f.family)
  ).map(f=>f.family)];
 })) as Record<LaloKind,string[]>;
}
