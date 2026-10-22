import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import {previousDrawDay,shiftDay} from '../src/dates';
import {TURNOS,JURS} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {predictMode,extractHistoryMode,auxAtCut} from '../src/auxTemporalModes';
import {auxiliaryBoard,findAuxPaths} from '../src/auxSantiagoNeuquen';
import type {AuxTemporalMode} from '../src/auxTemporalModes';
import type {AuxiliarHistory,AuxiliarView,AuxiliarFamily} from '../src/motorLaloAuxiliar';
// Recorrido retrospectivo ampliado, excluyendo domingos sin sorteo.
const dates:string[]=[];
for(let d='2026-10-01';d<='2026-10-20';d=shiftDay(d,1))
 if(new Date(d+'T12:00:00').getDay()!==0)dates.push(d);
const kinds=[2,3,4] as const,tops=[3,5,10] as const;
// Etapas sin parámetros calibrados a las cabezas: cambio fijo por turno.
const modes=['anterior','intrajornada','alternado',
 'etapa_mat_anterior','etapa_mat_intra','etapa_mat_dual',
 'etapa_tarde_dual'] as const;
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
function effective(turn:typeof TURNOS[number],mode:Mode):
 'anterior'|'intrajornada'|'alternado'{
 if(mode==='etapa_mat_anterior')return TURNOS.indexOf(turn)<=2?'anterior':'intrajornada';
 if(mode==='etapa_mat_intra')return TURNOS.indexOf(turn)<=1?'anterior':'intrajornada';
 if(mode==='etapa_mat_dual')return TURNOS.indexOf(turn)<=1?'anterior':
  turn==='Matutino'?'alternado':'intrajornada';
 if(mode==='etapa_tarde_dual')return TURNOS.indexOf(turn)<=2?'anterior':'alternado';
 return mode;
}
function select(v:View,n:N,top:T,mode:Mode,turn:typeof TURNOS[number]):AuxiliarFamily[]{
 const policy=effective(turn,mode);
 if(policy!=='alternado')return v[policy].ranks[n].slice(0,top);
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
    for(const mode of modes)ranks[n][mode]=select(views,n,10,mode,turn)
     .map(f=>({family:f.family,values:f.values}));
   // Cada política respeta el presupuesto estricto y la unidad familia.
   for(const mode of modes){
    if(ranks[n][mode].length>10||new Set(ranks[n][mode].map((x:any)=>x.family)).size!==ranks[n][mode].length)
     throw Error('Cupo de familias inválido: '+date+' '+turn+' '+mode);
   }
   }
   sealed.push({date,turn,sourceAnterior:previousDrawDay(date),
    sourceIntrajornada:date,ranks});
   const physical={
    anterior:auxiliaryBoard(auxAtCut(old.aux,turn,'anterior'),turn),
    intrajornada:auxiliaryBoard(auxAtCut(today.aux,turn,'intrajornada'),turn)
   };
   // Cotejo POST: recién aquí se leen cabezas del turno que se evalúa.
   for(const jur of JURS){
    const head=today.heads[turn]?.[jur];
    if(!head||!/^\d{4}$/.test(head))continue;
    const hits:any={};
    for(const n of kinds){
     hits[n]={};
     for(const mode of modes){
      hits[n][mode]={};
      for(const top of tops)hits[n][mode][top]=select(views,n,top,mode,turn)
       .some(f=>f.values.includes(head.slice(-n)));
     }
    }
    const formed={
     anterior:findAuxPaths(physical.anterior,head.slice(-3)).length>0,
     intrajornada:findAuxPaths(physical.intrajornada,head.slice(-3)).length>0
    };
    entries.push({date,turn,jur,head,hits,formed});
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
 // Estadísticas por etapa y por turno: distinguir cobertura de disponibilidad.
 const stages=[
  {stage:'tempranos',turns:['Previa','Primera']},
  {stage:'transicion',turns:['Matutino']},
  {stage:'tardios',turns:['Vespertino','Nocturno']}
 ];
 const stageStats=stages.flatMap(stage=>kinds.flatMap(n=>tops.flatMap(top=>modes.map(mode=>{
  const sample=entries.filter(x=>stage.turns.includes(x.turn));
  const hit=sample.filter(x=>x.hits[n][mode][top]);
  return {stage:stage.stage,kind:'VT'+n,top,mode,
   observed:sample.length,hits:hit.length,
   cuts:new Set(hit.map(x=>x.date+'|'+x.turn)).size};
 }))));
 const turnStats=TURNOS.flatMap(turn=>kinds.flatMap(n=>tops.flatMap(top=>modes.map(mode=>{
  const sample=entries.filter(x=>x.turn===turn);
  return {turn,kind:'VT'+n,top,mode,observed:sample.length,
   hits:sample.filter(x=>x.hits[n][mode][top]).length};
 }))));
 const winnersVt3=entries.filter(x=>modes.some(mode=>x.hits[3][mode][10]))
  .map(x=>({date:x.date,turn:x.turn,jur:x.jur,head:x.head,
    matches:Object.fromEntries(modes.map(mode=>[mode,x.hits[3][mode][10]])),
    formed:x.formed}));
 const formationByTurn=TURNOS.map(turn=>{
  const sample=entries.filter(x=>x.turn===turn);
  return {turn,total:sample.length,
   formableAnterior:sample.filter(x=>x.formed.anterior).length,
   formableIntrajornada:sample.filter(x=>x.formed.intrajornada).length,
   both:sample.filter(x=>x.formed.anterior&&x.formed.intrajornada).length};
 });
 const root='auditorias/aux-temporal-ab-21oct2026/resultados';
 fs.mkdirSync(root,{recursive:true});
 fs.writeFileSync(root+'/tops-antes-de-cada-sorteo.json',JSON.stringify(sealed,null,2));
 fs.writeFileSync(root+'/resultado-por-cabeza.json',JSON.stringify(entries,null,2));
 fs.writeFileSync(root+'/resumen.json',JSON.stringify({dates,summary,comparison,stageStats,turnStats,
  winnersVt3,formationByTurn},null,2));
 const vt3=entries.filter(x=>x.hits[3].anterior[10]||x.hits[3].intrajornada[10])
  .map(x=>({date:x.date,turn:x.turn,jur:x.jur,head:x.head,
   top10Anterior:x.hits[3].anterior[10],top10Intrajornada:x.hits[3].intrajornada[10],formed:x.formed}));
 const physicalSummary={anterior:entries.filter(x=>x.formed.anterior).length,
  intrajornada:entries.filter(x=>x.formed.intrajornada).length,
  ambos:entries.filter(x=>x.formed.anterior&&x.formed.intrajornada).length};
 const vt3ByTurn=TURNOS.map(turn=>({turn,
  anterior:entries.filter(x=>x.turn===turn&&x.hits[3].anterior[10]).length,
  intrajornada:entries.filter(x=>x.turn===turn&&x.hits[3].intrajornada[10]).length}));
 console.log('AUX_AB_VT3_EVENTOS',JSON.stringify(vt3));
 console.log('AUX_AB_VT3_FISICOS',JSON.stringify(physicalSummary));
 console.log('AUX_AB_VT3_POR_TURNO',JSON.stringify(vt3ByTurn));
 console.log('AUX_ETAPAS_DATOS',JSON.stringify({days:dates.length,heads:entries.length,
  stageStats:stageStats.filter(x=>x.kind==='VT3'&&x.top===10),
  turnStats:turnStats.filter(x=>x.kind==='VT3'&&x.top===10),
  winnersVt3,formationByTurn}));
 console.log('AUX_ETAPAS_TOPS',JSON.stringify(summary));
}
void run().catch(e=>{console.error('AUX_AB_ERROR',e);process.exitCode=1});
