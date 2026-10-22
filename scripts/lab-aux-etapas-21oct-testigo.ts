/** Fecha testigo independiente de la comparación que definió las etapas: 21/10/2026. */
import {descargarCabezas} from '../src/cabezas';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import {previousDrawDay,shiftDay} from '../src/dates';
import {TURNOS,JURS} from '../src/domain';
import type {Turno,CabezasDia} from '../src/domain';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {auxAtCut,extractHistoryMode,predictMode} from '../src/auxTemporalModes';
import type {AuxTemporalMode} from '../src/auxTemporalModes';
import {auxiliaryBoard,findAuxPaths} from '../src/auxSantiagoNeuquen';
import type {AuxiliarHistory,AuxiliarView,AuxiliarFamily} from '../src/motorLaloAuxiliar';
const date='2026-10-21';
type Day={heads:CabezasDia;aux:AuxiliaryHeads};
const memory=new Map<string,Promise<Day>>();
function get(d:string):Promise<Day>{
 if(!memory.has(d))memory.set(d,Promise.all([
  descargarCabezas(d,true),fetchAuxiliaryHeads(d)
 ]).then(([heads,a])=>({heads,aux:a.heads})));
 return memory.get(d)!;
}
async function historic(mode:AuxTemporalMode):Promise<AuxiliarHistory[]>{
 const periods=[{date:previousDrawDay(date),period:'D−1' as const},
  {date:shiftDay(date,-7),period:'D−7' as const}];
 return Promise.all(periods.map(async x=>{
  const source=mode==='anterior'?previousDrawDay(x.date):x.date;
  const [draw,aux]=await Promise.all([get(x.date),get(source)]);
  return {date:x.date,period:x.period,
   aux:extractHistoryMode(x.date,aux.aux,draw.heads,mode),
   ...(mode==='anterior'?{sourceDate:source}:{})};
 }));
}
function combined(a:AuxiliarFamily[],b:AuxiliarFamily[],limit:number){
 const out:AuxiliarFamily[]=[],seen=new Set<string>();
 for(let i=0;out.length<limit&&i<Math.max(a.length,b.length);i++)
  for(const f of [a[i],b[i]]){
   if(!f||seen.has(f.family))continue;
   out.push(f);seen.add(f.family);
   if(out.length>=limit)break;
  }
 return out;
}
async function main(){
 const [today,yesterday,ha,hi]=await Promise.all([
  get(date),get(previousDrawDay(date)),historic('anterior'),historic('intrajornada')]);
 const results:any[]=[];
 const modes=['anterior','intrajornada','etapa_A','etapa_mat_dual'] as const;
 const modesN=[2,3,4] as const,limits=[3,5,10] as const;
 for(const turn of TURNOS){
  const views={anterior:predictMode(date,turn,yesterday.aux,ha,'anterior'),
   intrajornada:predictMode(date,turn,today.aux,hi,'intrajornada')};
  const sel=(n:2|3|4,mode:typeof modes[number],k:number):AuxiliarFamily[]=>{
   if(mode==='anterior'||mode==='intrajornada')return views[mode].ranks[n].slice(0,k);
   if(mode==='etapa_A')return (TURNOS.indexOf(turn)<=2?
    views.anterior:views.intrajornada).ranks[n].slice(0,k);
   if(TURNOS.indexOf(turn)<=1)return views.anterior.ranks[n].slice(0,k);
   if(turn==='Matutino')return combined(views.anterior.ranks[n],
    views.intrajornada.ranks[n],k);
   return views.intrajornada.ranks[n].slice(0,k);
  };
  const published=JURS.map(jur=>({jur,head:today.heads[turn]?.[jur]||''}))
   .filter(x=>/^\d{4}$/.test(x.head));
  const outcomes:any={};
  for(const n of modesN){
   outcomes[n]={};
   for(const mode of modes){
    outcomes[n][mode]={};
    for(const k of limits){
     const ranks=sel(n,mode,k);
     outcomes[n][mode][k]=published.filter(x=>
      ranks.some(f=>f.values.includes(x.head.slice(-n))))
      .map(x=>({jur:x.jur,head:x.head,family:ranks.find(f=>
       f.values.includes(x.head.slice(-n)))?.family}));
    }
   }
  }
  results.push({turn,published:published.length,outcomes,
   cellsAnterior:auxiliaryBoard(auxAtCut(yesterday.aux,turn,'anterior'),turn).cells.length,
   cellsIntrajornada:auxiliaryBoard(auxAtCut(today.aux,turn,'intrajornada'),turn).cells.length,
   physicallyVT3:{anterior:published.filter(x=>
    findAuxPaths(auxiliaryBoard(auxAtCut(yesterday.aux,turn,'anterior'),turn),
     x.head.slice(-3)).length).length,
    intrajornada:published.filter(x=>
     findAuxPaths(auxiliaryBoard(auxAtCut(today.aux,turn,'intrajornada'),turn),
     x.head.slice(-3)).length).length}});
 }
 const count=results.reduce((sum,x)=>sum+x.published,0);
 const full=results.every(x=>x.published>=4)&&
  results.find(x=>x.turn==='Nocturno')?.published>=5;
 console.log('AUX_ETAPAS_21OCT',
  JSON.stringify({date,count,full,results}));
}
void main().catch(e=>{console.error('AUX_ETAPAS_21OCT_ERROR',e);process.exitCode=1});
