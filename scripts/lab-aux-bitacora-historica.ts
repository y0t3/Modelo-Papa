/** Cotejo descriptivo de la bitácora del padre (ambas hojas).
 * No obtiene rankings, no inventa predicciones y no mezcla POST con PRE.
 * Un sorteo cabeza+jurisdicción aporta UN evento por tipo VT2/VT3/VT4,
 * independientemente de cuántos recorridos físicos puedan dibujarse.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {descargarCabezas} from '../src/cabezas';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {buildSheet} from '../src/sheet';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';
import {buildAuxPostLedger} from '../src/auxMarkLedger';
import type {MarkKind} from '../src/auxMarkLedger';
async function main(){
const START='2026-08-29',END='2026-10-20';
const dates:string[]=[];
for(let ms=Date.parse(START+'T12:00:00Z');ms<=Date.parse(END+'T12:00:00Z');ms+=86400000)
 dates.push(new Date(ms).toISOString().slice(0,10));
const data=new Map<string,CabezasDia>(),aux=new Map<string,AuxiliaryHeads>();
const errors:Record<string,string>={};let index=0;
await Promise.all(Array.from({length:8},async()=>{
 while(index<dates.length){
  const date=dates[index++];
  try{
   const [a,b]=await Promise.all([descargarCabezas(date,true),fetchAuxiliaryHeads(date)]);
   data.set(date,a);aux.set(date,b.heads);
  }catch(err){errors[date]=String(err);}
 }
}));
const good=dates.filter(d=>data.has(d)&&aux.has(d)&&
 hasDrawResults(data.get(d)!)&&hasNocturnoBase(data.get(d)!));
if(!aux.has('2026-10-20')||
 aux.get('2026-10-20')!.Primera.Santiago!=='6142'||
 aux.get('2026-10-20')!.Matutino.Santiago!=='9634')
 throw Error('No coincide el mapa verificado por el usuario para Santiago 20/10');
const KINDS:MarkKind[]=['vt2','vt3','vt4'];
const total=Object.fromEntries(KINDS.map(k=>[k,{
  observedHeads:0,formableAux:0,formablePlus11:0,both:0,onlyAux:0,
  onlyPlus11:0,neither:0,auxCrossTurnHeads:0,auxPaths:0,plusPaths:0
}])) as unknown as Record<MarkKind,Record<string,number>>;
const byDay:any[]=[],byTurn:Record<Turno,any>=Object.fromEntries(TURNOS.map(t=>[t,{
 cutCount:0,postedHeads:0,newSecondSource:{vt2:0,vt3:0,vt4:0},
 newFamilies:{vt2:0,vt3:0,vt4:0}
}])) as Record<Turno,any>;
for(let i=1;i<good.length;i++){
 const date=good[i];if(date<'2026-09-01')continue;
 const sheet=buildSheet(data.get(date)!,data.get(good[i-1])!);
 const ledger=buildAuxPostLedger(date,aux.get(date)!,data.get(date)!,sheet,'Nocturno');
 for(const kind of KINDS)for(const key of Object.keys(total[kind]))
  total[kind][key]+=(ledger.summary[kind] as unknown as Record<string,number>)[key]||0;
 for(const s of ledger.stages){
  const v=byTurn[s.target];v.cutCount++;
  v.postedHeads+=ledger.marks.filter(m=>m.turn===s.target).length;
  for(const k of KINDS){
   v.newSecondSource[k]+=s.newSecondSource[k];
   v.newFamilies[k]+=s.firstAvailable[k];
  }
 }
 byDay.push({
  date,summary:ledger.summary,
  stages:ledger.stages,
  drawMarks:ledger.marks.map(event=>({
   turn:event.turn,jur:event.jur,head:event.head,
   modalities:Object.fromEntries(KINDS.map(k=>[k,{
    value:event.modalities[k].value,
    family:event.modalities[k].family,
    auxPaths:event.modalities[k].aux.length,
    plusPaths:event.modalities[k].plus11.length,
    auxCrossing:event.modalities[k].aux.filter(p=>p.crossesTurn).length,
    auxSources:[...new Set(event.modalities[k].aux.flatMap(p=>p.source.split('+')))]
   }]))
  }))
 });
}
const result={period:{from:'2026-09-01',to:END},days:byDay.length,
 cuts:byDay.length*5,
 type:'bitácora POST de seis jurisdicciones, geometría previa por turno',
 total,byTurn,byDay,
 distinctions:{
  post:'solamente sufijos exactos de cabezas publicadas',
  pre:'los tableros contienen exclusivamente fuentes que ya habían sorteado antes de cada turno',
  v2:'VT2 cuenta como acierto propio; ninguna modalidad debe desplazarla',
  vt4:'cuatro cifras exactas, no invertir toda la cabeza',
  sources:'una segunda fuente = otra columna física; múltiples rutas no son votos independientes',
  comparison:'no se prueba ganancia ni se fabrican apuestas'}
};
mkdirSync('lab-results',{recursive:true});
writeFileSync('lab-results/bitacora-doble-hoja-2026.json',JSON.stringify(result,null,2));
const day20=byDay.find(d=>d.date==='2026-10-20');
console.log('BITACORA_RESUMEN',JSON.stringify({
 days:result.days,cuts:result.cuts,total,byTurn,errors
}));
console.log('BITACORA_20OCT',JSON.stringify(day20));

}
void main().catch(err=>{console.error('BITACORA_ERROR',err);process.exitCode=1});
