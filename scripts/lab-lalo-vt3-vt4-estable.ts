/** Test del flujo íntegro VT3 -> VT2 -> VT4, invariable salvo orden. */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {previousDrawDay,shiftDay} from '../src/dates';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloFamily,LaloHistorical,LaloKind,LaloView} from '../src/motorLalo';
const dates:string[]=[];
for(let d='2026-08-17';d<='2026-10-22';d=shiftDay(d,1))
 if(new Date(d+'T12:00:00').getDay()!==0)dates.push(d);
const cache=new Map<string,Promise<CabezasDia>>();
function get(d:string):Promise<CabezasDia>{
 if(!cache.has(d))cache.set(d,descargarCabezas(d,true));
 return cache.get(d)!;
}
function pre(day:CabezasDia,turn:Turno){
 const out=diaVacio();
 for(const t of TURNOS.slice(0,TURNOS.indexOf(turn)))out[t]={...day[t]};
 return out;
}
function span(date:string){
 if(date<='2026-08-31')return 'AGO_17_31';
 if(date<='2026-09-14')return 'SEP_01_14';
 if(date<='2026-09-30')return 'SEP_15_30';
 if(date<='2026-10-21')return 'OCT_01_21';
 return 'OCT_22';
}
function match(view:LaloView,k:LaloKind,head:string){
 if(k==='vt4')return view.ranks.vt4.find(f=>
  f.paths.some(p=>p.value===head))?.rank||null;
 const suffix=head.slice(-Number(k.slice(-1)));
 const family=reversibleFamily(suffix);
 return view.ranks[k].find(f=>f.family===family)?.rank||null;
}
async function main(){
 const events:any[]=[],stability:any[]=[];
 for(const date of dates){
  const prior=previousDrawDay(date),beforePrior=previousDrawDay(prior);
  const prevWeek=shiftDay(date,-7),beforeWeek=previousDrawDay(prevWeek);
  const [current,previous,older,week,weekPrev]=await Promise.all([
   get(date),get(prior),get(beforePrior),get(prevWeek),get(beforeWeek)
  ]);
  const history:LaloHistorical[]=[
   {date:prior,period:'D−1',sheet:buildSheet(previous,older)},
   {date:prevWeek,period:'D−7',sheet:buildSheet(week,weekPrev)}
  ];
  for(const turn of TURNOS){
   const sheet=buildSheet(pre(current,turn),previous);
   const original=buildMotorLalo(sheet,date,turn,history,'ORIGINAL');
   const changed=buildMotorLalo(sheet,date,turn,history,'BIFURCACION_LUEGO_D1_TOP10_VT4_ESTABLE');
   // Una prioridad limitada a VT3 NO puede alterar el Top ni los caminos
   // de las dos modalidades complementarias. Invariante físico/semántico.
   const fingerprint=(r:LaloFamily[])=>JSON.stringify(r.map(f=>({
    rank:f.rank,family:f.family,values:f.paths.map(p=>
     p.sourceId+'|'+p.value+'|'+p.path.map(c=>c.row+':'+c.col).join('>')
    ).sort()
   })));
   for(const kind of ['vt2','vt4'] as LaloKind[])
    if(fingerprint(original.ranks[kind])!==fingerprint(changed.ranks[kind]))
     throw Error('La prioridad VT3 modificó '+kind+' '+date+' '+turn);
   const originalMothers=new Set(original.ranks.vt3.slice(0,10).map(x=>x.family));
   const changedMothers=new Set(changed.ranks.vt3.slice(0,10).map(x=>x.family));
   if(originalMothers.size!==changedMothers.size||
    [...originalMothers].some(x=>!changedMothers.has(x)))
    throw Error('La prioridad VT3 cambió madres físicas '+date+' '+turn);
   // Ninguna variante puede inventar VT3 ni modificar la geometría física.
   const names=(r:LaloFamily[])=>r.map(x=>x.family).sort();
   if(JSON.stringify(names(original.ranks.vt3))!==
      JSON.stringify(names(changed.ranks.vt3)))
    throw Error('Familias VT3 cambiaron: '+date+' '+turn);
   stability.push({date,turn,baseMothers:original.ranks.vt3.slice(0,10)
    .map(x=>x.family),newMothers:changed.ranks.vt3.slice(0,10).map(x=>x.family),
    changedMotherCount:original.ranks.vt3.slice(0,10)
     .filter(x=>!changed.ranks.vt3.slice(0,10).some(y=>y.family===x.family)).length,
    vt2Before:original.ranks.vt2.length,vt2After:changed.ranks.vt2.length,
    vt4Before:original.ranks.vt4.length,vt4After:changed.ranks.vt4.length});
   for(const jur of JURS){
    const head=current[turn]?.[jur]||'';
    if(!/^\d{4}$/.test(head))continue;
    for(const kind of ['vt2','vt3','vt4'] as LaloKind[]){
     const a=match(original,kind,head),b=match(changed,kind,head);
     events.push({date,period:span(date),turn,jur,head,kind,original:a,variant:b});
    }
   }
  }
  console.log('LALO_INTEGRAL_DIA',date);
 }
 if(events.length<4000)throw Error('muestra incompleta '+events.length);
 const summary:any[]=[];
 const periods=['AGO_17_31','SEP_01_14','SEP_15_30','OCT_01_21','OCT_22','TOTAL'];
 const kinds=['vt2','vt3','vt4'] as LaloKind[];
 for(const kind of kinds)for(const period of periods){
  const sample=events.filter(x=>x.kind===kind&&
   (period==='TOTAL'||x.period===period));
  const result:any={kind,period,heads:sample.length};
  for(const k of [3,5,10]){
   const a=sample.filter(e=>e.original!==null&&e.original<=k);
   const b=sample.filter(e=>e.variant!==null&&e.variant<=k);
   const gain=b.filter(e=>e.original===null||e.original>k);
   const lost=a.filter(e=>e.variant===null||e.variant>k);
   result['top'+k]={base:a.length,variant:b.length,gained:gain.length,lost:lost.length,
    gains:gain.map(x=>({date:x.date,turn:x.turn,jur:x.jur,head:x.head,
     before:x.original,after:x.variant})),
    losses:lost.map(x=>({date:x.date,turn:x.turn,jur:x.jur,head:x.head,
     before:x.original,after:x.variant}))};
  }
  summary.push(result);
 }
 const folder='auditorias/lalo-selector-periodos-23oct/integrado-top10-vt4-estable';
 fs.mkdirSync(folder,{recursive:true});
 fs.writeFileSync(folder+'/resultados.json',JSON.stringify({summary,stability},null,2));
 fs.writeFileSync(folder+'/por-cabeza.json',JSON.stringify(events,null,2));
 console.log('LALO_ESTABLE_RESUMEN',JSON.stringify(summary.map(x=>({
  kind:x.kind,period:x.period,heads:x.heads,
  top3:{base:x.top3.base,variant:x.top3.variant,gained:x.top3.gained,lost:x.top3.lost},
  top5:{base:x.top5.base,variant:x.top5.variant,gained:x.top5.gained,lost:x.top5.lost},
  top10:{base:x.top10.base,variant:x.top10.variant,gained:x.top10.gained,lost:x.top10.lost}
 }))));
 console.log('LALO_ESTABLE_MADRES',JSON.stringify({
  cuts:stability.length,
  cutsWithChangedMothers:stability.filter(x=>x.changedMotherCount>0).length,
  totalMotherChanges:stability.reduce((a,x)=>a+x.changedMotherCount,0)
 }));
}
void main().catch(e=>{console.error('LALO_ESTABLE_ERROR',e);process.exitCode=1});
