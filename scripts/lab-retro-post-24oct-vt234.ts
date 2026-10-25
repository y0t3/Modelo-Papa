/**
 * Compare against the frozen-in-job historical replay file only.
 * VT4 must be a physically valid full 4-digit path from a ranked VT4
 * mother; DO NOT treat reversal of full VT4 as the same candidate.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import {reversibleFamily} from '../src/motorLalo';
const root='auditorias/lalo-retro-sabado24-vt234/resultados';
const pre=JSON.parse(fs.readFileSync(root+'/retro-pre-24oct.json','utf8'));
type Kind='vt2'|'vt3'|'vt4';
type Candidate={rank:number;family:string;physicalValues:string[];motherFamilies:string[]};
const match=(kind:Kind,head:string,f:Candidate)=>{
 if(kind==='vt4')return f.physicalValues.includes(head);
 return f.family===reversibleFamily(head.slice(-Number(kind.slice(-1))));
};
const sum=(arr:any[],key:string)=>arr.reduce((a,c)=>a+c[key],0);
async function main(){
 const heads=await descargarCabezas('2026-10-24',true);
 const rows:any[]=[];
 for(const cutoff of pre.rows){
  const turn=cutoff.turn;
  const actual=JURS
   .filter(j=>j!=='Montevideo'||turn==='Nocturno')
   .filter(j=>/^\d{4}$/.test(heads[turn]?.[j]||''))
   .map(j=>({jur:j,head:heads[turn][j]}));
  const hits=(set:Candidate[],kind:Kind,n:number)=>
   actual.flatMap(x=>set.slice(0,n)
    .filter(f=>match(kind,x.head,f))
    .map(f=>({jur:x.jur,head:x.head,kind,family:f.family,rank:f.rank,
     motherFamilies:f.motherFamilies})));
  const scores:any={};
  for(const kind of ['vt2','vt3','vt4'] as Kind[]){
   const base=cutoff.basic[kind] as Candidate[];
   scores[kind]=Object.fromEntries([3,5,10].map(n=>
    ['top'+n,{hits:hits(base,kind,n),
     headsWon:new Set(hits(base,kind,n).map(x=>x.jur+'|'+x.head)).size}]));
  }
  scores.pulso=Object.fromEntries([3,5,10].map(n=>
   ['top'+n,{hits:hits(cutoff.pulse.vt3,'vt3',n),
    headsWon:new Set(hits(cutoff.pulse.vt3,'vt3',n)
     .map(x=>x.jur+'|'+x.head)).size}]));
  rows.push({turn,actual,availableHeads:actual.length,
   montevideoTurnIncluded:turn==='Nocturno',scores,
   formedCovers:{
    vt2:actual.filter(x=>cutoff.basic.vt2.some((c:Candidate)=>match('vt2',x.head,c))).length,
    vt3:actual.filter(x=>cutoff.basic.vt3.some((c:Candidate)=>match('vt3',x.head,c))).length,
    vt4:actual.filter(x=>cutoff.basic.vt4.some((c:Candidate)=>match('vt4',x.head,c))).length,
   },
   targetBeforePreviousSourcedOnly:cutoff.usedCurrentDateTurnRows});
 }
 const totals:any={};
 for(const kind of ['vt2','vt3','vt4','pulso']){
  totals[kind]=Object.fromEntries([3,5,10].map(n=>
   ['top'+n,{headsWon:sum(rows.map(x=>x.scores[kind]['top'+n]),'headsWon'),
    byTurn:rows.map(x=>({turn:x.turn,won:x.scores[kind]['top'+n].headsWon}))}]));
 }
 const actualTotal=rows.reduce((n,x)=>n+x.availableHeads,0);
 const summary={kind:'RETROSPECTIVE_REPLAY_POST_NOT_PRE_SALED',
  target:'2026-10-24',actualTotal,
  publishedHeadsByTurn:rows.map(x=>({turn:x.turn,number:x.availableHeads,
   heads:x.actual})),totals,rows,
  explanations:[
   'Saturday: Montevideo has only Nocturno, not Previa/Primera/Matutino/Vespertino.',
   'VT2 suffix last two, exact reversible family; VT3 suffix last three, exact reversible family.',
   'VT4 full four digits must match actual physical path.value of ranked mother, no full four reversal.',
   'Counts separate per modality; one head can contribute to VT2 VT3 and VT4 independently.',
   'Pulse only reorders identical VT3 Top10; VT2 and VT4 unaltered official priorities.'
  ]};
 fs.writeFileSync(root+'/retro-post-24oct.json',JSON.stringify(summary,null,2)+'\n');
 console.log('RETRO_POST_RESUMEN',JSON.stringify({
  total:actualTotal,
  byTurn:summary.publishedHeadsByTurn,
  totals:Object.fromEntries(Object.entries(totals).map(([k,v]:any)=>
   [k,Object.fromEntries(Object.entries(v).map(([m,z]:any)=>[m,z.headsWon]))])),
  postHits:rows.map(x=>({turn:x.turn,
   vt2:x.scores.vt2.top10.hits,vt3:x.scores.vt3.top10.hits,
   vt4:x.scores.vt4.top10.hits,pulse:x.scores.pulso.top3.hits}))
 }));
 console.log('RETRO_POST_JSON',JSON.stringify(summary));
}
main().catch(e=>{console.error('RETRO_POST_ERROR',e);process.exitCode=1});
