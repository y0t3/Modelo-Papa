/** PRE retro de pulsos cortos; cada ranking se fija antes de comparar cabezas. */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import {buildExperimentalVt2} from '../src/experimentalVt2';
import {pulseOfRank,detectCooccurrence,trackableSignals} from '../src/labRadarVentanaCorta';
import type {Entry} from '../src/labRadarVentanaCorta';
const getCache=new Map<string,Promise<any>>();
const get=(d:string)=>{if(!getCache.has(d))getCache.set(d,descargarCabezas(d,true));return getCache.get(d)!};
const fullCache=new Map<string,Promise<any>>();
const full=(d:string)=>{if(!fullCache.has(d))fullCache.set(d,(async()=>{
 const [heads,base]=await Promise.all([get(d),nocturnaAnteriorPorJur(d,get,20)]);
 if(base.missing.length)throw Error('base missing');
 return {date:d,heads,sheet:buildSheet(heads,base.heads)};
})());return fullCache.get(d)!};
async function main(){
 const rows:{date:string;entries:Entry[];heads:string[]}[]=[];
 const skipped:string[]=[];
 for(let d='2026-06-01';d<='2026-10-28';d=shiftDay(d,1)){
  if(new Date(d+'T12:00:00Z').getUTCDay()===0)continue;
  try{
   const [today,hist,base]=await Promise.all([get(d),loadPreviousDraws(d,6,get),
     nocturnaAnteriorPorJur(d,get,20)]);
   const heads=JURS.filter(j=>j!=='Montevideo')
    .map(j=>today.Nocturno[j]).filter(h=>/^\d{4}$/.test(h));
   if(heads.length<4||base.missing.length||
    TURNOS.reduce((s,t)=>s+JURS.filter(j=>j!=='Montevideo'&&
     /^\d{4}$/.test(today[t]?.[j]||'')).length,0)<20){
    skipped.push(d+' incompleto');continue;
   }
   const past=await Promise.all(hist.map(h=>full(h.date)));
   const wd=shiftDay(d,-7),week=past.find(x=>x.date===wd)||await full(wd);
   const roots=[{date:past.at(-1)!.date,sheet:past.at(-1)!.sheet,
     period:'D−1' as const},...(hasDrawResults(week.heads)?[{
     date:wd,sheet:week.sheet,period:'D−7' as const}]:[])];
   const masked=diaVacio();
   for(const t of TURNOS.slice(0,4))masked[t]={...today[t]};
   const pre=preSheetAtCut(buildSheet(masked,base.heads),'Nocturno',4);
   if(pre.heads.Nocturno.length)throw Error('FUGA POST');
   const lalo=buildMotorLalo(pre,d,'Nocturno',roots);
   const other=buildExperimentalVt2(pre,d,'Nocturno',past.map(x=>({
    date:x.date,sheet:x.sheet,period:'D−1' as const
   })));
   const hit=(fam:string)=>heads.filter(h=>reversibleFamily(h.slice(-2))===fam);
   const entries:Entry[]=[];
   const add=(source:Entry['source'],rank:number,family:string,routes:string[])=>{
    entries.push({date:d,turn:'Nocturno',source,sheet:'PLUS11',length:'VT2',
     rank,family,physicalRoutes:routes,matchedHeads:hit(family),
     preReconstructed:true});
   };
   lalo.ranks.vt2.slice(0,10).forEach((x,i)=>add('LALO',i+1,x.family,
    x.paths.map(p=>p.sourceId+'|'+p.path.map(c=>c.row+':'+c.col).join('>'))));
   other.geometric.forEach((x,i)=>add('GEOMETRIA',i+1,x.family,[x.source+'|'+x.cells.join('>')]));
   other.connected.forEach((x,i)=>add('CONECTADAS',i+1,x.family,[x.source+'|'+x.cells.join('>')]));
   rows.push({date:d,entries,heads});
  }catch(e){
   if(String(e).includes('FUGA'))throw e;
   skipped.push(d+' '+String(e).slice(0,80));
  }
  if(rows.length%20===0)console.log('RADAR_PROGRESS',d,rows.length);
 }
 const entries=rows.flatMap(x=>x.entries);
 const track=rows.map((x,i)=>({
  date:x.date,pulse:[...Array(10)].map((_,k)=>pulseOfRank(rows.slice(0,i+1)
   .flatMap(z=>z.entries.filter(e=>e.source==='LALO'&&e.rank===k+1))).at(-1)!),
  convergences:detectCooccurrence(x.entries)
 }));
 const lookAhead=[] as {window:number;minimum:number;alerts:number;next:number}[];
 for(const [minimum,window] of [[2,3],[2,5],[3,5]]){
  let alerts=0,next=0;
  for(let i=window;i<rows.length;i++)for(let rank=1;rank<=10;rank++){
   const recent=rows.slice(i-window,i).map(x=>x.entries.find(e=>e.source==='LALO'&&e.rank===rank)!);
   if(recent.filter(x=>x?.matchedHeads.length).length<minimum)continue;
   alerts++;
   if(rows[i].entries.find(x=>x.source==='LALO'&&x.rank===rank)?.matchedHeads.length)next++;
  }
  lookAhead.push({window,minimum,alerts,next});
 }
 const report={cuts:rows.length,skipped,lookAhead,
  baseline:entries.filter(x=>x.source==='LALO'&&x.matchedHeads.length>0).length/(rows.length*10),
  events:trackableSignals(entries.filter(x=>x.source==='LALO')),
  crossMotor:track.flatMap(x=>x.convergences.map(z=>({date:x.date,...z}))),
  rank7:track.filter(x=>x.date>='2026-10-19').map(x=>x.pulse[6]),
  days:track};
 fs.mkdirSync('auditorias/radar-ventana-corta',{recursive:true});
 fs.writeFileSync('auditorias/radar-ventana-corta/retro.json',JSON.stringify(report,null,2)+'\n');
 console.log('RADAR_RESUMEN',JSON.stringify({cuts:report.cuts,skipped:skipped.length,
  lookAhead,baseline:report.baseline,rank7:report.rank7,
  events:report.events.length,crossMotor:report.crossMotor.length}));
}
main().catch(e=>{console.error('RADAR_ERROR',e);process.exitCode=1});
