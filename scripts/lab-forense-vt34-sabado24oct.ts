/**
 * LAB: forense física de las 5 cabezas VT3 y dos VT4 del sábado 24/10.
 * Reproduce el motor con CORTE PRE individual, mantiene sus reglas
 * intactas y lo coteja con la foto PRE previamente versionada.
 * Los resultados objetivo se leen SOLAMENTE DESPUÉS de terminar
 * los candidatos para ese corte y únicamente para etiquetar POST.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {shiftDay} from '../src/dates';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import type {SourceId} from '../src/sheet';
import {findPaths} from '../src/paths';
import type {Path} from '../src/paths';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloFamily,LaloHistorical,LaloView} from '../src/motorLalo';
const expected=JSON.parse(fs.readFileSync(
 'auditorias/lalo-retro-sabado24-vt234/retro-pre-24oct.json','utf8'));
const byDate=new Map<string,Promise<CabezasDia>>();
const get=(d:string)=>{
 if(!byDate.has(d))byDate.set(d,descargarCabezas(d,true));
 return byDate.get(d)!;
};
const fmt=(p:Path)=>p.map(c=>c.row+':'+c.col).join('>');
const key=(p:Path)=>[fmt(p),fmt([...p].reverse())].sort()[0];
const geometry=(p:Path)=>{
 const mr=Math.min(...p.map(x=>x.row)),mc=Math.min(...p.map(x=>x.col));
 return [p,[...p].reverse()].map(seq=>seq.map(
  x=>(x.row-mr)+':'+(x.col-mc)).join('>')).sort()[0];
};
const value=(p:Path)=>p.map(c=>c.digit).join('');
const familyInfo=(v:LaloFamily|null)=>v?{
 rank:v.rank,family:v.family,
 sourceCount:v.sourceCount,directRoots:v.directRoots,
 d1Roots:v.d1Roots,d7Roots:v.d7Roots,
 physicalBlocks:v.physicalBlocks,branchBlocks:v.branchBlocks,
 parentFamilies:v.parentFamilies,state:v.state,
 rationale:v.rationale,
 visiblePaths:v.paths.map(p=>({value:p.value,sourceId:p.sourceId,
  origin:p.origin,position:key(p.path),rootCount:p.rootIds.length}))
}:null;
const allCandidates=(view:LaloView,kind:'vt2'|'vt3'|'vt4')=>
 view.ranks[kind].slice(0,10).map(f=>({
 family:f.family,values:[...new Set(f.paths.map(p=>p.value))].sort()
}));
async function main(){
 if(expected.targetDate!=='2026-10-24'||expected.rows.length!==5)
  throw Error('PRE snapshot not found or wrong target');
 const date='2026-10-24';
 const [target,previous,prior]=await Promise.all([
  get(date),loadPreviousDraws(date,6,get),
  nocturnaAnteriorPorJur(date,get,20)
 ]);
 const latest=previous.at(-1)!,weekly=shiftDay(date,-7);
 const [d1Base,d7Heads,d7Base]=await Promise.all([
  nocturnaAnteriorPorJur(latest.date,get,20),
  get(weekly),nocturnaAnteriorPorJur(weekly,get,20)
 ]);
 if(prior.missing.length||d1Base.missing.length||d7Base.missing.length)
  throw Error('Missing real Nocturna rows');
 const historical:LaloHistorical[]=[
  {date:latest.date,period:'D−1',sheet:buildSheet(latest.heads,d1Base.heads)},
  ...(hasDrawResults(d7Heads)?[{
   date:weekly,period:'D−7' as const,sheet:buildSheet(d7Heads,d7Base.heads)
  }]:[])
 ];
 // All target heads reside in 'target'; never pass them into the PRE motor.
 const rootEvidence=historical.flatMap(h=>TURNOS.flatMap(t=>
  (h.sheet.matches[t]||[]).flatMap(m=>
   m.jurisdiccion==='Montevideo'?[]:m.hits.filter(x=>x.kind==='vt3')
   .flatMap(hit=>hit.paths.map(path=>({
    date:h.date,period:h.period,source:hit.sourceId,
    oldTurn:t,jur:m.jurisdiccion,head:m.cabeza,
    shape:geometry(path),path:key(path)
   }))))));
 const rows:any[]=[],defects:any[]=[];
 for(const [i,turn] of TURNOS.entries()){
  const pre=diaVacio();
  for(const t of TURNOS.slice(0,i))pre[t]={...target[t]};
  const sheet=buildSheet(pre,prior.heads);
  if(TURNOS.slice(i).some(t=>sheet.matches[t].length||sheet.heads[t].length))
   throw Error('FUTURE HEADS LEAK '+turn);
  const view=buildMotorLalo(sheet,date,turn,historical);
  const priorCut=expected.rows.find((x:any)=>x.turn===turn);
  if(!priorCut)throw Error('PRE snapshot missing '+turn);
  for(const kind of ['vt2','vt3','vt4'] as const){
   const actual=allCandidates(view,kind);
   const seal=priorCut.basic[kind];
   if(actual.length!==seal.length||actual.some((x,j)=>
     x.family!==seal[j].family||
     x.values.join('|')!==seal[j].physicalValues.join('|')))
    throw Error('RANKING DIFFERS FROM PRE SNAPSHOT '+turn+' '+kind);
  }
  const visible=sheet.columns.slice(0,i+1);
  const actual=JURS.filter(j=>j!=='Montevideo'||turn==='Nocturno')
   .filter(j=>/^\d{4}$/.test(target[turn]?.[j]||''))
   .map(j=>({jur:j,head:target[turn][j]}));
  const out:any={turn,availableSources:visible.map(v=>v.id),
   knownEarlierTurns:TURNOS.slice(0,i),heads:actual.length,cases:[]};
  for(const a of actual){
   const suffix=a.head.slice(-3),family=reversibleFamily(suffix);
   const same=visible.flatMap(c=>findPaths(c.values,suffix)
    .map(p=>({source:c.id,value:suffix,shape:geometry(p),
     position:key(p),physicalCells:p.map(v=>({
      row:v.row,col:v.col,digit:v.digit}))})));
   const full=visible.flatMap(c=>findPaths(c.values,a.head)
    .map(p=>({source:c.id,physicalCells:p.map(v=>({
     row:v.row,col:v.col,digit:v.digit})),
     position:key(p),shape:geometry(p),
     mother:reversibleFamily(value(p.slice(1))),
     motherPath:key(p.slice(1)),addedDigit:p[0].digit})));
   if(same.length===0&&full.length>0)throw Error('Impossible VT4 without VT3 suffix');
   const vt3=view.ranks.vt3.find(x=>x.family===family)||null;
   const motherRanks=full.map(p=>({
    source:p.source,head:a.head,physicalPath:p.position,
    mother:p.mother,addedDigit:p.addedDigit,
    motherRecognizedRank:view.ranks.vt3.find(f=>f.family===p.mother)?.rank??null,
    motherTop10:view.ranks.vt3.slice(0,10).some(f=>f.family===p.mother),
    motherHasCorrectSourcePath:!!view.ranks.vt3.find(f=>f.family===p.mother)
     ?.paths.some(r=>r.sourceId===p.source&&key(r.path)===p.motherPath),
    vt4GeneratedByEngine:view.ranks.vt4.some(f=>f.paths.some(r=>
     r.value===a.head&&r.sourceId===p.source&&key(r.path)===p.position))
   }));
   const generated4=view.ranks.vt4.find(f=>f.paths.some(r=>r.value===a.head))||null;
   const matchingHistoric=same.flatMap(p=>rootEvidence.filter(r=>
    r.source===p.source&&r.shape===p.shape).map(r=>({
     priorDate:r.date,period:r.period,source:r.source,
     oldHead:r.head,oldTurn:r.oldTurn,oldJur:r.jur,
     currentPath:p.position,oldPath:r.path
    })));
   const matchingOtherSources=same.flatMap(p=>rootEvidence.filter(r=>
    r.source!==p.source&&r.shape===p.shape).map(r=>({
     priorDate:r.date,period:r.period,oldSource:r.source,
     currentSource:p.source,oldHead:r.head
    })));
   const pathCounts={vt2:visible.reduce((n,c)=>
    n+findPaths(c.values,a.head.slice(-2)).length,0),
    vt3:same.length,vt4:full.length};
   const detail={
    ...a,vt3Suffix:suffix,vt3Family:family,
    physicalCounts:pathCounts,
    vt3Status:!same.length?'NO_FORMABLE':!vt3?'FORMABLE_NO_RECONOCIDA':
     vt3.rank>10?'RECONOCIDA_FUERA_TOP10':'TOP10',
    vt4Status:!full.length?'NO_FORMABLE':
     !generated4?'FORMABLE_SIN_HIJA_GENERADA':
     generated4.rank>10?'HIJA_GENERADA_FUERA_TOP10':'TOP10',
    vt3Motor:familyInfo(vt3),vt4Motor:familyInfo(generated4),
    physicalVt3Routes:same,
    physicalVt4Routes:full,
    vt4MotherAnalysis:motherRanks,
    sameSourceShapeRoots:matchingHistoric,
    otherSourceShapeRoots:matchingOtherSources.slice(0,40)
   };
   out.cases.push(detail);
   if(same.length||full.length)defects.push({turn,...detail});
  }
  rows.push(out);
  console.log('FORENSE_TURNO',turn,JSON.stringify({
   heads:out.heads,withVt3:out.cases.filter((v:any)=>v.physicalCounts.vt3>0).length,
   withVt4:out.cases.filter((v:any)=>v.physicalCounts.vt4>0).length,
   statuses:out.cases.filter((v:any)=>v.physicalCounts.vt3>0)
    .map((v:any)=>({head:v.head,jur:v.jur,vt3Status:v.vt3Status,
     vt3Rank:v.vt3Motor?.rank??null,vt4Status:v.vt4Status,
     vt4Rank:v.vt4Motor?.rank??null}))}));
 }
 const vt3=defects.filter(x=>x.physicalCounts.vt3>0),
  vt4=defects.filter(x=>x.physicalCounts.vt4>0);
 if(vt3.length!==5||vt4.length!==2)
  throw Error('Physical counts changed: '+vt3.length+' VT3 '+vt4.length+' VT4');
 const diagnostics={
  date,status:'RETROSPECTIVE_REPLAY_NO_PROSPECTIVE_CLAIM',
  historicalRootDates:historical.map(x=>({date:x.date,period:x.period})),
  totalHeads:rows.reduce((s,r)=>s+r.heads,0),
  vt3Cases:vt3.map(x=>({
   turn:x.turn,jur:x.jur,head:x.head,
   vt3Family:x.vt3Family,paths:x.physicalCounts.vt3,
   status:x.vt3Status,motorRank:x.vt3Motor?.rank??null,
   rootsSameSourceShape:x.sameSourceShapeRoots.length,
   rootsOtherSourceShape:x.otherSourceShapeRoots.length,
   motorBreakdown:x.vt3Motor&&{
    branchBlocks:x.vt3Motor.branchBlocks,d1Roots:x.vt3Motor.d1Roots,
    d7Roots:x.vt3Motor.d7Roots,physicalBlocks:x.vt3Motor.physicalBlocks,
    state:x.vt3Motor.state
   }
  })),
  vt4Cases:vt4.map(x=>({
   turn:x.turn,jur:x.jur,head:x.head,
   paths:x.physicalCounts.vt4,status:x.vt4Status,
   engineRank:x.vt4Motor?.rank??null,
   mothers:x.vt4MotherAnalysis
  })),
  totals:{
   vt3Formable:vt3.length,
   vt3NotRecognized:vt3.filter(x=>x.vt3Status==='FORMABLE_NO_RECONOCIDA').length,
   vt3RecognizedOutside10:vt3.filter(x=>x.vt3Status==='RECONOCIDA_FUERA_TOP10').length,
   vt4Formable:vt4.length,
   vt4NotGenerated:vt4.filter(x=>x.vt4Status==='FORMABLE_SIN_HIJA_GENERADA').length,
   vt4GeneratedOutside10:vt4.filter(x=>x.vt4Status==='HIJA_GENERADA_FUERA_TOP10').length
  }
 };
 const output='auditorias/lalo-forense-24oct-vt34/resultados';
 fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(output+'/detalle-forense.json',JSON.stringify({rows},null,2));
 fs.writeFileSync(output+'/resumen-forense.json',JSON.stringify(diagnostics,null,2));
 console.log('FORENSE_RESUMEN',JSON.stringify(diagnostics));
}
main().catch(e=>{console.error('FORENSE_ERROR',e);process.exitCode=1});
