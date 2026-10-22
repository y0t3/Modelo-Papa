import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import {previousDrawDay,shiftDay} from '../src/dates';
import {TURNOS,JURS} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {predictMode,extractHistoryMode} from '../src/auxTemporalModes';
import type {AuxTemporalMode} from '../src/auxTemporalModes';
import type {AuxiliarHistory,AuxiliarView,AuxiliarFamily} from '../src/motorLaloAuxiliar';
const dates=['2026-10-12','2026-10-13','2026-10-14','2026-10-15',
 '2026-10-16','2026-10-17','2026-10-19','2026-10-20'];
const kinds=[2,3,4] as const,tops=[3,5,10] as const;
const modes=['anterior','intrajornada','alternado'] as const;
type Mode=typeof modes[number];type N=typeof kinds[number];type T=typeof tops[number];
type Day={heads:CabezasDia;aux:AuxiliaryHeads};
type View=Record<AuxTemporalMode,AuxiliarView>;
const cache=new Map<string,Promise<Day>>();
function get(d:string):Promise<Day>{
 if(!cache.has(d))cache.set(d,Promise.all([descargarCabezas(d,true),fetchAuxiliaryHeads(d)])
  .then(([heads,a])=>({heads,aux:a.heads})));
 return cache.get(d)!;
}
async function refs(date:string,mode:AuxTemporalMode):Promise<AuxiliarHistory[]>{
 const dates=[{date:previousDrawDay(date),period:'D−1' as const},
 {date:shiftDay(date,-7),period:'D−7' as const}],out:AuxiliarHistory[]=[];
 for(const item of dates){
  if(item.date>=date)continue;
  const source=mode==='anterior'?previousDrawDay(item.date):item.date;
  const [draw,aux]=await Promise.all([get(item.date),get(source)]);
  out.push({date:item.date,period:item.period,
   aux:extractHistoryMode(item.date,aux.aux,draw.heads,mode),
   ...(mode==='anterior'?{sourceDate:source}:{})});
 }
 return out;
}
function select(v:View,n:N,top:T,mode:Mode):AuxiliarFamily[]{
 if(mode!=='alternado')return v[mode].ranks[n].slice(0,top);
 const a=v.anterior.ranks[n],b=v.intrajornada.ranks[n];
 const found:AuxiliarFamily[]=[],used=new Set<string>();
 for(let i=0;i<Math.max(a.length,b.length)&&found.length<top;i++)
  for(const f of [a[i],b[i]]){
   if(!f||used.has(f.family))continue;
   found.push(f);used.add(f.family);
   if(found.length===top)break;
  }
 return found;
}
async function run(){
 const entries:any[]=[],sealed:any[]=[];
 for(const date of dates){
  const today=await get(date),old=await get(previousDrawDay(date));
  const [previous,progressive]=await Promise.all([
   refs(date,'anterior'),refs(date,'intrajornada')]);
  for(const turn of TURNOS){
   // La función de predicción recibe solo fuentes permitidas y raíces viejas.
   const views:View={
    anterior:predictMode(date,turn,old.aux,previous,'anterior'),
    intrajornada:predictMode(date,turn,today.aux,progressive,'intrajornada')};
   if(turn==='Previa'&&kinds.some(n=>views.intrajornada.ranks[n].length))
    throw Error('Fuga temporal intrajornada '+date);
   const ranks:any={};
   for(const n of kinds){
    ranks[n]={};
    for(const mode of modes)ranks[n][mode]=select(views,n,10,mode)
     .map(f=>({family:f.family,values:f.values}));
   }
   sealed.push({date,turn,sourceAnterior:previousDrawDay(date),
    sourceIntrajornada:date,ranks});
   // Cotejo POST: recién aquí se leen cabezas del turno que se evalúa.
   for(const jur of JURS){
    const head=today.heads[turn]?.[jur];
    if(!head||!/^\d{4}$/.test(head))continue;
    const hits:any={};
    for(const n of kinds){
     hits[n]={};
     for(const mode of modes){
      hits[n][mode]={};
      for(const top of tops)hits[n][mode][top]=select(views,n,top,mode)
       .some(f=>f.values.includes(head.slice(-n)));
     }
    }
    entries.push({date,turn,jur,head,hits});
   }
  }
  console.log('AUX_AB_DIA',date,entries.filter(x=>x.date===date).length);
 }
 if(entries.length===0)throw Error('No se encontraron cabezas: revisar parsing/fechas');
 const summary:any[]=[];
 for(const n of kinds)for(const top of tops)for(const mode of modes){
  const hit=entries.filter(x=>x.hits[n][mode][top]);
  summary.push({kind:'VT'+n,top,mode,hits:hit.length,total:entries.length,
   cortes:new Set(hit.map(x=>x.date+'|'+x.turn)).size});
 }
 const comparison=kinds.map(n=>{
  const a=entries.filter(x=>x.hits[n].anterior[10]&&!x.hits[n].intrajornada[10]).length;
  const b=entries.filter(x=>!x.hits[n].anterior[10]&&x.hits[n].intrajornada[10]).length;
  const both=entries.filter(x=>x.hits[n].anterior[10]&&x.hits[n].intrajornada[10]).length;
  return {kind:'VT'+n,onlyAnterior:a,onlyIntrajornada:b,both,
   neither:entries.length-a-b-both};
 });
 const root='auditorias/aux-temporal-ab-21oct2026/resultados';
 fs.mkdirSync(root,{recursive:true});
 fs.writeFileSync(root+'/tops-antes-de-cada-sorteo.json',JSON.stringify(sealed,null,2));
 fs.writeFileSync(root+'/resultado-por-cabeza.json',JSON.stringify(entries,null,2));
 fs.writeFileSync(root+'/resumen.json',JSON.stringify({dates,summary,comparison},null,2));
 console.log('AUX_AB_RESULT',JSON.stringify({summary,comparison}));
}
void run().catch(e=>{console.error('AUX_AB_ERROR',e);process.exitCode=1});
