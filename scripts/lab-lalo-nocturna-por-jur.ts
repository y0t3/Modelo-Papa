/**
 * AUDITORIA D−1 real contra D−1 por fecha de calendario (domingo omitido).
 * Aislar ausencia de datos: no cambiar motor, top, geom. Se mantienen
 * columnas PRE originales al comparar D1; D7 y los cortes PRE idénticos.
 * Separado: cambiar también la Nocturna PRE por la jornada completa
 * anterior es un contrafactual más amplio, NO equiparable automáticamente
 * con el D−1 aislado.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {previousDrawDay,shiftDay} from '../src/dates';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical,LaloKind,LaloView} from '../src/motorLalo';
import {findPaths} from '../src/paths';
const cache=new Map<string,Promise<CabezasDia>>();
const get=(d:string)=>{if(!cache.has(d))cache.set(d,descargarCabezas(d,true));return cache.get(d)!};
const count=(x:CabezasDia)=>TURNOS.reduce((n,t)=>n+JURS.filter(j=>
 /^\d{4}$/.test(x[t]?.[j]||'')).length,0);
async function lastComplete(date:string):Promise<string>{
 let d=date;
 for(let k=0;k<12;k++){
  d=previousDrawDay(d);
  if(count(await get(d))>=20)return d;
 }
 throw Error('No hay dia previo con cobertura >=20: '+date);
}
const cases:any[]=[],days:any[]=[];
function period(d:string){
 return d<='2026-07-31'?'JUN_JUL':
  d<='2026-09-30'?'AGO_SEP':d<='2026-10-23'?'OCT':'24_OCT';
}
function category(rank:number|null){
 if(rank===null)return 'NO_RECONOCIDO';
 if(rank<=3)return 'TOP3';if(rank<=5)return 'TOP5';
 if(rank<=10)return 'TOP10';return 'FUERA_TOP10';
}
async function main(){
 let dates=0,changedDates=0;
 for(let date='2026-06-01';date<='2026-10-24';date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00').getDay()===0)continue;
  const [today,priorComplete]=await Promise.all([get(date),lastComplete(date)]);
  if(count(today)<20)continue;
  const priorScheduled=previousDrawDay(date);
  const [old,prevComplete,oldPrev,completePrev]=await Promise.all([
   get(priorScheduled),get(priorComplete),get(previousDrawDay(priorScheduled)),
   get(previousDrawDay(priorComplete))
  ]);
  const wk=shiftDay(date,-7),wkPrior=previousDrawDay(wk);
  const [week,weekPrev]=await Promise.all([get(wk),get(wkPrior)]);
  const historicWeek:LaloHistorical={date:wk,period:'D−7',
   sheet:buildSheet(week,weekPrev)};
  const rootBase:LaloHistorical={date:priorScheduled,period:'D−1',
   sheet:buildSheet(old,oldPrev)};
  const rootFixed:LaloHistorical={date:priorComplete,period:'D−1',
   sheet:buildSheet(prevComplete,completePrev)};
  const changed=priorScheduled!==priorComplete;
  if(changed){
   console.log('MEZCLA_DATOS',JSON.stringify({
    date,holiday:priorScheduled,lastComplete:priorComplete,
    holidayHeads:Object.fromEntries(TURNOS.map(t=>[t,
     JURS.filter(j=>/^\d{4}$/.test(old[t]?.[j]||''))
      .map(j=>({jur:j,head:old[t][j]}))])),
    holidayNocturna:Object.fromEntries(JURS.map(j=>[j,old.Nocturno?.[j]||'----'])),
    lastCompleteNocturna:Object.fromEntries(JURS.map(j=>[j,prevComplete.Nocturno?.[j]||'----']))
   }));
   changedDates++;
  }
  dates++;
  const dayInfo:any={date,heads:count(today),priorScheduled,
   scheduledHeads:count(old),priorComplete,completeHeads:count(prevComplete),
   changed,turns:[]};
  for(const [idx,turn] of TURNOS.entries()){
   const masked=diaVacio();
   for(const t of TURNOS.slice(0,idx))masked[t]={...today[t]};
   const board=buildSheet(masked,old);
   const boardFixed=buildSheet(masked,prevComplete);
   const merged=diaVacio();
   // Cada jurisdicción conserva SU última Nocturna realmente publicada.
   merged.Nocturno=Object.fromEntries(JURS.map(j=>[
    j,/^\d{4}$/.test(old.Nocturno?.[j]||'')?
     old.Nocturno[j]:(prevComplete.Nocturno?.[j]||'----')
   ]));
   const boardMerged=buildSheet(masked,merged);
   const original=buildMotorLalo(board,date,turn,[rootBase,historicWeek]);
   const restoreD1=buildMotorLalo(board,date,turn,[rootFixed,historicWeek]);
   const restoreBoth=buildMotorLalo(boardFixed,date,turn,[rootFixed,historicWeek]);
   const mergedOnly=buildMotorLalo(boardMerged,date,turn,[rootBase,historicWeek]);
   const mergedAndD1=buildMotorLalo(boardMerged,date,turn,[rootFixed,historicWeek]);
   const views={ORIGINAL:original,D1_CORREGIDO:restoreD1,
    HOJA_Y_D1_CORREGIDOS:restoreBoth,
    HOJA_COMPUESTA:mergedOnly,HOJA_COMPUESTA_Y_D1:mergedAndD1};
   const tops:any={};let newFam:any={};
   for(const kind of ['vt2','vt3','vt4'] as LaloKind[]){
    tops[kind]=Object.fromEntries(Object.entries(views).map(([k,v])=>
     [k,v.ranks[kind].slice(0,10).map(x=>x.family)]));
    if(kind==='vt3')newFam={
     soloD1:restoreD1.ranks.vt3.filter(x=>!
      original.ranks.vt3.some(y=>y.family===x.family)).map(x=>x.family),
     todo:restoreBoth.ranks.vt3.filter(x=>!
      original.ranks.vt3.some(y=>y.family===x.family)).map(x=>x.family),
     compuesto:mergedAndD1.ranks.vt3.filter(x=>!
      original.ranks.vt3.some(y=>y.family===x.family)).map(x=>x.family)
    };
   }
   const row:any={date,turn,changed,kindCounts:Object.fromEntries(
    (['vt2','vt3','vt4'] as LaloKind[]).map(kind=>
     [kind,Object.fromEntries(Object.entries(views).map(([k,v])=>[k,v.ranks[kind].length]))])
   ),newFamilies:newFam};
   dayInfo.turns.push(row);
   for(const jur of JURS){
    const head=today[turn]?.[jur]||'';
    if(!/^\d{4}$/.test(head))continue;
    const family=reversibleFamily(head.slice(-3));
    const rank=(v:LaloView)=>v.ranks.vt3.find(x=>x.family===family)?.rank||null;
    const columnsBase=board.columns.slice(0,idx+1);
    const columnsRestored=boardFixed.columns.slice(0,idx+1);
    const columnsMerged=boardMerged.columns.slice(0,idx+1);
    const exact=columnsBase.some(c=>findPaths(c.values,head.slice(-3)).length>0);
    const exactRestored=columnsRestored.some(c=>findPaths(c.values,head.slice(-3)).length>0);
    const exactMerged=columnsMerged.some(c=>findPaths(c.values,head.slice(-3)).length>0);
    cases.push({date,turn,jur,head,family,period:period(date),changed,
     exactBase:exact,exactRestored,exactMerged,
     rank:{ORIGINAL:rank(original),D1_CORREGIDO:rank(restoreD1),
      HOJA_Y_D1_CORREGIDOS:rank(restoreBoth),
      HOJA_COMPUESTA:rank(mergedOnly),HOJA_COMPUESTA_Y_D1:rank(mergedAndD1)}});
   }
  }
  days.push(dayInfo);
  if(changed)console.log('MEZCLA_FECHA',date,JSON.stringify({
   scheduled:priorScheduled,scheduledHeads:count(old),
   completed:priorComplete,validHeads:count(prevComplete),
   sample:dayInfo.turns.map(x=>({turn:x.turn,kindCounts:x.kindCounts.vt3,
    recovered:x.newFamilies.soloD1.length,
    withBoard:x.newFamilies.todo.length,
    withMerged:x.newFamilies.compuesto.length}))
  }));
 }
 const periods=['JUN_JUL','AGO_SEP','OCT','24_OCT','TOTAL'];
 const summary:any[]=[];
 for(const p of periods)for(const mode of ['ORIGINAL','D1_CORREGIDO','HOJA_Y_D1_CORREGIDOS',
  'HOJA_COMPUESTA','HOJA_COMPUESTA_Y_D1']){
  const arr=cases.filter(x=>p==='TOTAL'||x.period===p);
  const ranked=(n:number)=>arr.filter(x=>x.rank[mode]!==null&&x.rank[mode]<=n);
  summary.push({period:p,mode,heads:arr.length,
   ranked:arr.filter(x=>x.rank[mode]!==null).length,
   top3:ranked(3).length,top5:ranked(5).length,top10:ranked(10).length,
   exactHeadCounts:arr.filter(x=>mode==='HOJA_Y_D1_CORREGIDOS'?
    x.exactRestored:mode.startsWith('HOJA_COMPUESTA')?x.exactMerged:x.exactBase).length,
   exactTop10:ranked(10).filter(x=>mode==='HOJA_Y_D1_CORREGIDOS'?
    x.exactRestored:mode.startsWith('HOJA_COMPUESTA')?x.exactMerged:x.exactBase).length});
 }
 const transitions=cases.filter(x=>x.changed&&
  (x.rank.ORIGINAL!==x.rank.D1_CORREGIDO||
   x.rank.ORIGINAL!==x.rank.HOJA_Y_D1_CORREGIDOS||
   x.rank.ORIGINAL!==x.rank.HOJA_COMPUESTA_Y_D1))
  .map(x=>({...x,categories:Object.fromEntries(Object.entries(x.rank)
    .map(([k,v])=>[k,category(v as number|null)]))}));
 const folder='auditorias/lalo-vt3-feriados-d1-25oct/por-jurisdiccion';
 fs.mkdirSync(folder,{recursive:true});
 fs.writeFileSync(folder+'/resumen.json',JSON.stringify({
  dayCount:dates,changedDates,summary},null,2));
 fs.writeFileSync(folder+'/dias-afectados.json',JSON.stringify(days.filter(x=>x.changed),null,2));
 fs.writeFileSync(folder+'/cabezas.json',JSON.stringify(cases,null,2));
 fs.writeFileSync(folder+'/cambios-cabezas.json',JSON.stringify(transitions,null,2));
 console.log('MEZCLA_RESUMEN',JSON.stringify({days:dates,changedDates,summary}));
 console.log('MEZCLA_CABEZAS_CAMBIADAS',JSON.stringify(transitions));
}
void main().catch(e=>{console.error('MEZCLA_ERROR',e);process.exitCode=1});
