/** Auditoría independiente del 24/10: rutas ganadoras no seleccionadas. PRE solo turnos anteriores. */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {shiftDay} from '../src/dates';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {findPaths} from '../src/paths';
import {buildMotorLalo,reversibleFamily,vt4PrefixFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';

async function main(){
 const date='2026-10-24',weekly=shiftDay(date,-7);
 const cache=new Map<string,Promise<any>>();
 const get=(d:string)=>{
  if(!cache.has(d))cache.set(d,descargarCabezas(d,true));
  return cache.get(d)!;
 };
 const [today,prior,base,week]=await Promise.all([
  get(date),loadPreviousDraws(date,6,get),nocturnaAnteriorPorJur(date,get,20),get(weekly)
 ]);
 const latest=prior[prior.length-1];
 const [oldBase,weekBase]=await Promise.all([
  nocturnaAnteriorPorJur(latest.date,get,20),
  nocturnaAnteriorPorJur(weekly,get,20)
 ]);
 if(base.missing.length||oldBase.missing.length||weekBase.missing.length)
  throw Error('Bases incompletas');
 const history:LaloHistorical[]=[
  {date:latest.date,period:'D−1',sheet:buildSheet(latest.heads,oldBase.heads)},
  ...(hasDrawResults(week)?[{
   date:weekly,period:'D−7' as const,sheet:buildSheet(week,weekBase.heads)
  }]:[])
 ];
 if(history.some(h=>h.date>=date))throw Error('Fuga temporal');
 const check=JSON.parse(fs.readFileSync(
  'auditorias/lalo-retro-sabado24-vt234/retro-pre-24oct.json','utf8'));
 const findings:any[]=[],totals:any={};
 for(const [index,turn] of TURNOS.entries()){
  const pre=diaVacio();
  for(const earlier of TURNOS.slice(0,index))pre[earlier]={...today[earlier]};
  const sheet=buildSheet(pre,base.heads);
  if(sheet.heads[turn].length||sheet.matches[turn].length)
   throw Error('Fuga en turno '+turn);
  const cols=sheet.columns.slice(0,index+1);
  const view=buildMotorLalo(sheet,date,turn,history);
  for(const kind of ['vt2','vt3','vt4'] as const){
   if(view.ranks[kind].slice(0,10).map(f=>f.family).join('|')!==
      check.rows[index].basic[kind].map((f:any)=>f.family).join('|'))
    throw Error('No reproduce ranking PRE '+turn+' '+kind);
  }
  for(const jur of JURS){
   const head=today[turn][jur]||'----';
   if(!/^\d{4}$/.test(head))continue;
   const paths:any={};
   for(const kind of ['vt2','vt3','vt4'] as const){
    const n=Number(kind.slice(-1)),suffix=head.slice(-n);
    const exact=cols.flatMap(c=>findPaths(c.values,suffix)
     .map(p=>({source:c.id,coords:p.map(x=>x.row+':'+x.col),
      pathDigits:p.map(x=>x.digit).join(''),
      mother:kind==='vt4'?reversibleFamily(head.slice(1)):null})));
    const ranked=kind==='vt4'?
     view.ranks.vt4.find(f=>f.paths.some(p=>p.value===head)):
     view.ranks[kind].find(f=>f.family===reversibleFamily(suffix));
    paths[kind]={
     physicallyPossible:exact.length>0,paths:exact,
     family:kind==='vt4'?head:reversibleFamily(suffix),
     recognized:!!ranked,rank:ranked?.rank??null,
     evidence:ranked?{d1Roots:ranked.d1Roots,d7Roots:ranked.d7Roots,
      directRoots:ranked.directRoots,branches:ranked.branchBlocks,
      parentFamilies:ranked.parentFamilies}:null
    };
   }
   if(!paths.vt3.physicallyPossible&&!paths.vt4.physicallyPossible)continue;
   const motherRoutes=(paths.vt4.paths as any[]).map(p=>{
    const mother=view.ranks.vt3.find(f=>f.family===p.mother);
    return {...p,motherRank:mother?.rank??null,
     motherInTop10:!!mother&&mother.rank<=10,
     prefixAllowed:vt4PrefixFamily(p.mother,head[0]).includes(head),
     exactMotherGenerated:!!mother&&mother.paths.some(x=>x.sourceId===p.source&&
      x.path.map(q=>q.row+':'+q.col).join('|')===
       p.coords.slice(1).join('|'))};
   });
   findings.push({turn,jur,head,...paths,motherRoutes});
  }
 }
 const outcomes={
  vt3:{unrecognized:0,below10:0,top10:0},
  vt4:{unrecognized:0,below10:0,top10:0}
 };
 for(const row of findings)for(const kind of ['vt3','vt4'] as const){
  const f=row[kind];
  if(!f.physicallyPossible)continue;
  if(f.rank===null)outcomes[kind].unrecognized++;
  else if(f.rank>10)outcomes[kind].below10++;
  else outcomes[kind].top10++;
 }
 const saved={date,classification:outcomes,findings,
  historyDates:history.map(h=>({date:h.date,period:h.period})),
  source:'Reevaluación del replay PRE, solo resultados POST para seleccionar la lista a auditar'};
 fs.mkdirSync('auditorias/lalo-retro-sabado24-vt234',{recursive:true});
 fs.writeFileSync('auditorias/lalo-retro-sabado24-vt234/rastro-faltantes-24oct.json',
  JSON.stringify(saved,null,2)+'\n');
 console.log('RASTRO_CLASIFICACION',JSON.stringify({
  outcomes,findings:findings.map(x=>({
   turn:x.turn,jur:x.jur,head:x.head,
   vt3:{family:x.vt3.family,paths:x.vt3.paths.length,rank:x.vt3.rank,
    evidence:x.vt3.evidence},
   vt4:{paths:x.vt4.paths.length,rank:x.vt4.rank,
    mothers:x.motherRoutes.map((m:any)=>({
     source:m.source,family:m.mother,motherRank:m.motherRank,
     motherInTop10:m.motherInTop10,exactMotherGenerated:m.exactMotherGenerated,
     prefixAllowed:m.prefixAllowed
    }))}
  }))}));
}
main().catch(e=>{console.error('RASTRO_ERROR',e);process.exitCode=1});
