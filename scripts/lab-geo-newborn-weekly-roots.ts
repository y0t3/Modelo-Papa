// Laboratorio 265 PRE: familias VT3 nacidas en otra columna vs antecedentes
// ganadores verificados del mismo día de la semana anterior y jornada previa.
// Un evento = una cabeza histórica completa, no su cantidad de recorridos.
// Cada camino actual respeta fuente fija y tres celdas contiguas.
// No se alteran los dos motores originales ni la APK. No se lee el sorteo
// objetivo hasta después de generar todos los Top3.
import {TURNOS} from '../src/domain';
import type {Turno} from '../src/domain';
import type {DailySheet} from '../src/sheet';
import type {LaloView,RootRef} from '../src/motorLalo';
import {reversibleFamily} from '../src/motorLalo';
import {allPhysicalVt3} from '../src/vt3Shadow';
import type {NormalCut} from './lab-geo-normalization';
import {canonicalShape} from './lab-geo-winning-roots';

const SOURCES=['prevNocturno','Previa','Primera','Matutino','Vespertino'] as const;
type Source=typeof SOURCES[number];
export type BirthMode='NOCTURNA_TRES'|'COMBINADO_LIBRE'|'DOS_UNA_OTRA'|
 'DOS_UNA_NUEVA'|'DOS_UNA_D7'|'DOS_UNA_D7_NACIMIENTO'|
 'DOS_UNA_D1'|'DOS_UNA_D7_PRIORIDAD';
const MODES:BirthMode[]=['NOCTURNA_TRES','COMBINADO_LIBRE','DOS_UNA_OTRA',
 'DOS_UNA_NUEVA','DOS_UNA_D7','DOS_UNA_D7_NACIMIENTO','DOS_UNA_D1',
 'DOS_UNA_D7_PRIORIDAD'];
type FamilyEvidence={
 family:string;birth:Source;rank:number;paths:number;birthPaths:number;
 priorD7:number;priorD1:number;birthD7:number;birthD1:number;
 hasD7:boolean;hasD1:boolean;
 winnerHeads:number;
 evidence:{period:string;date:string;head:string;jur:string;source:string;
  oldCells:string[];newCells:string[];translatedRows:number;translatedCols:number}[]
};
export type BirthCut={
 date:string;turn:Turno;period:string;newFamilies:number;
 winnersBornAfterNocturna:number;winnersAll:number;
 candidates:FamilyEvidence[];
 methods:Record<BirthMode,{
  top3:string[];heads:number;newBornSelected:string|null;
  weeklyRootSelected:boolean;weeklyRootInBirthSource:boolean;
 }>;
};
const pathId=(p:{row:number;col:number})=>p.row+':'+p.col;
const eventId=(r:RootRef)=>[r.date,r.oldTurn,r.jurisdiction,r.head].join('|');
const getPos=(cells:string[])=>{
 const a=cells.map(c=>c.split(':').map(Number));
 return {row:Math.min(...a.map(x=>x[0])),col:Math.min(...a.map(x=>x[1]))};
};
const sizeBand=(n:number)=>n<=2?'1-2':n<=5?'3-5':n<=12?'6-12':'13+';
const uniq=<T>(v:T[])=>[...new Set(v)];
export function inspectNewbornRoots(date:string,turn:Turno,period:string,
 pre:DailySheet,view:LaloView,normal:NormalCut,winners:string[]):BirthCut{
 if(view.date!==date||view.target!==turn||normal.date!==date||normal.turn!==turn)
  throw Error('Corte PRE incongruente');
 if(pre.heads[turn].length||pre.matches[turn].length)
  throw Error('Fuga del sorteo objetivo');
 const visible=pre.columns.slice(0,TURNOS.indexOf(turn)+1);
 const byFamily=new Map<string,{birth:Source;paths:{
  source:Source;cells:string[];shape:string}[]}>();
 for(const col of visible){
  for(const p of allPhysicalVt3(col.values)){
   const f=reversibleFamily(p.map(x=>x.digit).join(''));
   const source=col.id as Source;
   let entry=byFamily.get(f);
   if(!entry){entry={birth:source,paths:[]};byFamily.set(f,entry)}
   const cells=p.map(pathId);
   entry.paths.push({source,cells,shape:canonicalShape(cells)});
  }
 }
 if(byFamily.size!==normal.rankedCombined.length)
  throw Error('Listado físico no coincide con ranking normalizado');
 const roots=new Map<string,RootRef[]>();
 for(const root of view.roots){
  if(root.date>=date||root.oldCells.length!==3)continue;
  if(root.period!=='D−7'&&root.period!=='D−1')throw Error('Período raíz inválido');
  const key=root.sourceId+'|'+canonicalShape(root.oldCells);
  if(!roots.has(key))roots.set(key,[]);
  roots.get(key)!.push(root);
 }
 const ranks=new Map(normal.rankedCombined.map(r=>[r.family,r.rank]));
 const candidates:FamilyEvidence[]=[];
 for(const [family,e] of byFamily){
  if(e.birth==='prevNocturno')continue;
  const known=new Map<string,{root:RootRef;newCells:string[]}>();
  const birthKnown=new Set<string>();
  for(const path of e.paths){
   for(const root of roots.get(path.source+'|'+path.shape)||[]){
    const id=eventId(root)+'|'+root.period;
    if(!known.has(id))known.set(id,{root,newCells:path.cells});
    if(path.source===e.birth)birthKnown.add(id);
   }
  }
  const hits=[...known.entries()];
  const yesterday=hits.filter(([id])=>id.endsWith('|D−1'));
  const week=hits.filter(([id])=>id.endsWith('|D−7'));
  const birthWeek=week.filter(([id])=>birthKnown.has(id));
  const birthYesterday=yesterday.filter(([id])=>birthKnown.has(id));
  candidates.push({family,birth:e.birth,rank:ranks.get(family)||999,
   paths:e.paths.length,birthPaths:e.paths.filter(p=>p.source===e.birth).length,
   priorD7:week.length,priorD1:yesterday.length,birthD7:birthWeek.length,
   birthD1:birthYesterday.length,hasD7:week.length>0,hasD1:yesterday.length>0,
   winnerHeads:winners.filter(f=>f===family).length,
   evidence:hits.slice(0,6).map(([,ref])=>{
    const now=getPos(ref.newCells),old=getPos(ref.root.oldCells);
    return {period:ref.root.period,date:ref.root.date,head:ref.root.head,
     jur:ref.root.jurisdiction,source:ref.root.sourceId,
     oldCells:ref.root.oldCells,newCells:ref.newCells,
     translatedRows:now.row-old.row,translatedCols:now.col-old.col};
   })});
 }
 candidates.sort((a,b)=>a.rank-b.rank||a.family.localeCompare(b.family));
 const methodRows={} as BirthCut['methods'];
 const fixed=normal.results.COMBINADO_SOLO_NOCTURNA.families;
 if(fixed.length!==3||new Set(fixed).size!==3)throw Error('Base Nocturna incompleta');
 const top2=fixed.slice(0,2),top3=fixed.slice(0,3);
 const choose=(mode:BirthMode)=>{
  if(mode==='NOCTURNA_TRES')return top3;
  if(mode==='COMBINADO_LIBRE')return normal.results.COMBINADO.families;
  if(mode==='DOS_UNA_OTRA')return normal.results.COMBINADO_2_NOCTURNA_1_OTRA.families;
  let chosen:FamilyEvidence|undefined;
  if(mode==='DOS_UNA_NUEVA')chosen=candidates[0];
  if(mode==='DOS_UNA_D7')chosen=candidates.find(c=>c.priorD7>0);
  if(mode==='DOS_UNA_D7_NACIMIENTO')chosen=candidates.find(c=>c.birthD7>0);
  if(mode==='DOS_UNA_D1')chosen=candidates.find(c=>c.priorD1>0);
  if(mode==='DOS_UNA_D7_PRIORIDAD')chosen=[...candidates].sort((a,b)=>
   b.priorD7-a.priorD7||a.rank-b.rank)[0];
  return [...top2,chosen?.family||top3[2]];
 };
 for(const mode of MODES){
  const top=choose(mode);
  if(top.length!==3||new Set(top).size!==3||top.some(f=>!byFamily.has(f)))
   throw Error('Top3 contiene familias imposibles '+mode);
  const novel=top.find(f=>byFamily.get(f)?.birth!=='prevNocturno')||null;
  const novelty=novel?candidates.find(c=>c.family===novel):undefined;
  methodRows[mode]={top3:top,heads:winners.filter(f=>top.includes(f)).length,
   newBornSelected:novel,weeklyRootSelected:!!novelty?.priorD7,
   weeklyRootInBirthSource:!!novelty?.birthD7};
 }
 if(methodRows.NOCTURNA_TRES.heads!==normal.results.COMBINADO_SOLO_NOCTURNA.headHits||
   methodRows.COMBINADO_LIBRE.heads!==normal.results.COMBINADO.headHits||
   methodRows.DOS_UNA_OTRA.heads!==normal.results.COMBINADO_2_NOCTURNA_1_OTRA.headHits)
  throw Error('Los controles existentes ya no reproducen sus aciertos');
 return {date,turn,period,newFamilies:candidates.length,winnersBornAfterNocturna:
  candidates.reduce((n,c)=>n+c.winnerHeads,0),winnersAll:winners.length,
  candidates,methods:methodRows};
}
function summary(rows:BirthCut[]){
 const candidates=rows.flatMap(r=>r.candidates);
 const labels=['D7_EN_CUALQUIER_FUENTE','D7_EN_FUENTE_DE_NACIMIENTO',
  'D1_EN_CUALQUIER_FUENTE','SIN_D7'] as const;
 const split=(c:FamilyEvidence,label:typeof labels[number])=>
  label==='D7_EN_CUALQUIER_FUENTE'?c.priorD7>0:
  label==='D7_EN_FUENTE_DE_NACIMIENTO'?c.birthD7>0:
  label==='D1_EN_CUALQUIER_FUENTE'?c.priorD1>0:c.priorD7===0;
 const evidence=Object.fromEntries(labels.map(label=>{
  const chosen=candidates.filter(c=>split(c,label));
  return [label,{exposures:chosen.length,
   winningFamilyExposures:chosen.filter(c=>c.winnerHeads>0).length,
   winningHeads:chosen.reduce((n,c)=>n+c.winnerHeads,0),
   datesWithWinning:new Set(rows.filter(r=>r.candidates.some(c=>
    split(c,label)&&c.winnerHeads>0)).map(r=>r.date)).size}];
 }));
 // Estratos POR CORTE, columna de nacimiento y cantidad de caminos;
 // se preserva cuántas familias tienen huella histórica en cada estrato.
 // Permite un control numérico descriptivo, no un p-valor confirmatorio.
 const expected=Object.fromEntries(labels.slice(0,3).map(label=>{
  let observed=0,neutralExpectation=0,comparableGroups=0;
  for(const cut of rows){
   const by=new Map<string,FamilyEvidence[]>();
   for(const c of cut.candidates){
    const key=c.birth+'|'+sizeBand(c.birthPaths);
    if(!by.has(key))by.set(key,[]);
    by.get(key)!.push(c);
   }
   for(const group of by.values()){
    const marked=group.filter(c=>split(c,label));
    observed+=marked.reduce((n,c)=>n+c.winnerHeads,0);
    if(marked.length&&marked.length<group.length)comparableGroups++;
    neutralExpectation+=marked.length/group.length*
     group.reduce((n,c)=>n+c.winnerHeads,0);
   }
  }
  return [label,{observed,neutralExpectation,
   comparableGroups,excess:observed-neutralExpectation}];
 }));
 const modes=Object.fromEntries(MODES.map(mode=>{
  const hits=rows.reduce((n,c)=>n+c.methods[mode].heads,0);
  const baseline=rows.reduce((n,c)=>n+c.methods.NOCTURNA_TRES.heads,0);
  const gains=rows.filter(c=>c.methods[mode].heads>c.methods.NOCTURNA_TRES.heads);
  const losses=rows.filter(c=>c.methods[mode].heads<c.methods.NOCTURNA_TRES.heads);
  return [mode,{headHits:hits,baselineHits:baseline,
   cutsWithWinner:rows.filter(c=>c.methods[mode].heads>0).length,
   selectionsOfNewFamily:rows.filter(c=>c.methods[mode].newBornSelected!==null).length,
   selectedWithD7:rows.filter(c=>c.methods[mode].weeklyRootSelected).length,
   selectedWithD7AtBirthSource:rows.filter(c=>c.methods[mode].weeklyRootInBirthSource).length,
   gains:gains.map(c=>({date:c.date,turn:c.turn,won:c.candidates.filter(f=>
    c.methods[mode].top3.includes(f.family)&&f.winnerHeads>0).map(f=>f.family),
    selected:c.methods[mode]})),
   losses:losses.map(c=>({date:c.date,turn:c.turn,lost:c.methods.NOCTURNA_TRES.top3.filter(f=>
    !c.methods[mode].top3.includes(f)),selected:c.methods[mode]}))
  }];
 }));
 return {days:new Set(rows.map(r=>r.date)).size,cuts:rows.length,
  validHeads:rows.reduce((n,r)=>n+r.winnersAll,0),
  newbornFamilyExposures:candidates.length,
  newbornWinningHeadExposures:rows.reduce((n,r)=>n+r.winnersBornAfterNocturna,0),
  evidence,expected,modes};
}
export function summarizeNewbornRoots(rows:BirthCut[]){
 const periods=[...new Set(rows.map(c=>c.period))];
 return {protocol:{
  definition:'Familia VT3 nacida en columna intradía: ausente en Nocturna anterior; tiene tres celdas contiguas reales.',
  weeklyEvidence:'Al menos una cabeza ganadora realmente verificada en la misma fuente y forma física, de la hoja D−7; no se exige misma cifra numérica, sí traslado rígido posible.',
  rootDedup:'Cada fecha + turno + jurisdicción + cabeza + periodo histórico cuenta una vez por familia.',
  control:'Expectativa neutra dentro del mismo corte, primera columna y banda de cantidad de caminos físicos en columna inicial.',
  warnings:'Corpus retrospectivo reiteradamente explorado. Los turnos del mismo día no son independientes. No extrapolar tasas a sorteos futuros.'
 },summary:{TOTAL:summary(rows),...Object.fromEntries(periods.map(p=>
  [p,summary(rows.filter(r=>r.period===p))]))},
  examples:rows.flatMap(r=>r.candidates.filter(c=>c.winnerHeads>0&&c.birthD7>0)
   .map(c=>({date:r.date,turn:r.turn,family:c.family,birth:c.birth,
    paths:c.paths,d7:c.priorD7,birthD7:c.birthD7,headHits:c.winnerHeads,
    evidence:c.evidence.filter(x=>x.period==='D−7').slice(0,3)}))),
  rows};
}
