/**
 * Holdout fechado de VT3: JULIO completo y 23 OCT (no usados al escoger regla).
 * NO modifica ningún motor. Ejecuta el selector fijo y verifica:
 * - PRE con solo turnos anteriores disponibles
 * - VT3 mismo conjunto de familias y mismo Top10
 * - VT2/VT4 ranking exacto y trayectoria física idénticos por corte
 * - aciertos VT2/VT3/VT4 Top3,5,10 con diferencias pareadas por jornada
 * - cobertura VT3: familias físicamente formadas vs familias seleccionadas.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {previousDrawDay,shiftDay} from '../src/dates';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {findPaths} from '../src/paths';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloFamily,LaloHistorical,LaloKind,LaloView} from '../src/motorLalo';

const cutoff='2026-10-22';
const dates:string[]=[];
for(let d='2026-07-01';d<='2026-07-31';d=shiftDay(d,1))
 if(new Date(d+'T12:00:00').getDay()!==0)dates.push(d);
dates.push('2026-10-23');
const datesChecked=[...dates];
const cached=new Map<string,Promise<CabezasDia>>();
function load(d:string){
 if(!cached.has(d))cached.set(d,descargarCabezas(d,true));
 return cached.get(d)!;
}
function availableBefore(data:CabezasDia,target:Turno){
 const out=diaVacio();
 for(const t of TURNOS.slice(0,TURNOS.indexOf(target)))out[t]={...data[t]};
 return out;
}
function hit(view:LaloView,k:LaloKind,head:string):number|null{
 if(k==='vt4')return view.ranks.vt4.find(f=>f.paths.some(p=>p.value===head))?.rank||null;
 const v=reversibleFamily(head.slice(-Number(k.slice(-1))));
 return view.ranks[k].find(f=>f.family===v)?.rank||null;
}
function fingerprint(xs:LaloFamily[]){
 return JSON.stringify(xs.map(x=>({
  rank:x.rank,family:x.family,
  sourceCount:x.sourceCount,
  paths:x.paths.map(p=>[
   p.sourceId,p.value,p.path.map(c=>c.row+':'+c.col+':'+c.digit).join('>')
  ].join('|')).sort()
 })));
}
const isWon=(r:number|null,k:number)=>r!==null&&r<=k;
type Row={date:string;turn:Turno;jur:string;head:string;kind:LaloKind;
  original:number|null;variant:number|null;physical:boolean;
  rankFamilyOriginal:string|null;rankFamilyVariant:string|null;
};
async function main(){
 const rows:Row[]=[],turns:any[]=[],errors:string[]=[];
 for(const date of dates){
  const prev=previousDrawDay(date),prevprev=previousDrawDay(prev);
  const week=shiftDay(date,-7),weekPrev=previousDrawDay(week);
  if(prev>=date||week>=date)throw Error('Fuga histórica '+date);
  const [today,yesterday,older,wk,wkPrev]=await Promise.all([
   load(date),load(prev),load(prevprev),load(week),load(weekPrev)
  ]);
  const history:LaloHistorical[]=[
   {date:prev,period:'D−1',sheet:buildSheet(yesterday,older)},
   {date:week,period:'D−7',sheet:buildSheet(wk,wkPrev)}
  ];
  let headsCount=0;
  for(const turn of TURNOS){
   const sheet=buildSheet(availableBefore(today,turn),yesterday);
   const original=buildMotorLalo(sheet,date,turn,history,'ORIGINAL');
   const trial=buildMotorLalo(sheet,date,turn,history,
    'BIFURCACION_LUEGO_D1_TOP10_VT4_ESTABLE');
   for(const kind of ['vt2','vt4'] as const)
    if(fingerprint(original.ranks[kind])!==fingerprint(trial.ranks[kind]))
     throw Error('Alteración de '+kind+' en '+date+' '+turn);
   const baseMothers=original.ranks.vt3.slice(0,10).map(x=>x.family).sort().join(',');
   const trialMothers=trial.ranks.vt3.slice(0,10).map(x=>x.family).sort().join(',');
   if(baseMothers!==trialMothers)
    throw Error('Hijas VT3 cambiadas '+date+' '+turn);
   if(original.ranks.vt3.map(x=>x.family).sort().join(',')!==
      trial.ranks.vt3.map(x=>x.family).sort().join(','))
    throw Error('Universo VT3 cambió '+date+' '+turn);
   const physicalSheets=sheet.columns.slice(0,TURNOS.indexOf(turn)+1);
   turns.push({date,turn,vt3Candidates:original.ranks.vt3.length,
    vt3Top10Families:baseMothers.split(',').filter(Boolean).length,
    vt4Candidates:original.ranks.vt4.length,
    sourceColumns:physicalSheets.map(c=>c.id),
    drawsInCut:TURNOS.slice(0,TURNOS.indexOf(turn)).map(t=>
     ({turn:t,present:JURS.filter(j=>/^\d{4}$/.test(today[t][j]||'')).length}))
   });
   for(const jur of JURS){
    const head=today[turn]?.[jur]||'';
    if(!/^\d{4}$/.test(head))continue;
    headsCount++;
    for(const kind of ['vt2','vt3','vt4'] as LaloKind[]){
     const n=Number(kind.slice(-1));
     const suffix=head.slice(-n);
     const physical=kind==='vt4'?
       physicalSheets.some(c=>findPaths(c.values,head).length>0):
       physicalSheets.some(c=>findPaths(c.values,suffix).length>0);
     const b=hit(original,kind,head),v=hit(trial,kind,head);
     const lookup=(r:LaloView,rank:number|null)=>r.ranks[kind].find(x=>x.rank===rank)?.family||null;
     rows.push({date,turn,jur,head,kind,original:b,variant:v,
      physical,rankFamilyOriginal:lookup(original,b),
      rankFamilyVariant:lookup(trial,v)});
    }
   }
  }
  if(date==='2026-10-23'&&headsCount<20)
   throw Error('23/10 incompleto para control: '+headsCount+' cabezas');
  console.log('HOLDOUT_LALO_DIA',date,headsCount);
 }
 const byPeriod=(date:string)=>date.startsWith('2026-07')?'JULIO':'23_OCT';
 const report:any[]=[];
 for(const kind of ['vt2','vt3','vt4'] as LaloKind[])
  for(const period of ['JULIO','23_OCT','TOTAL'])
   for(const limit of [3,5,10]){
    const pool=rows.filter(x=>x.kind===kind&&
     (period==='TOTAL'||byPeriod(x.date)===period));
    const before=pool.filter(x=>isWon(x.original,limit));
    const after=pool.filter(x=>isWon(x.variant,limit));
    const gained=pool.filter(x=>!isWon(x.original,limit)&&isWon(x.variant,limit));
    const lost=pool.filter(x=>isWon(x.original,limit)&&!isWon(x.variant,limit));
    const physicalHeads=pool.filter(x=>x.physical).length;
    report.push({kind,period,top:limit,examined:pool.length,
     physicalHeads,baseline:before.length,variant:after.length,
     gained:gained.length,lost:lost.length,
     gains:gained.map(x=>({date:x.date,turn:x.turn,jur:x.jur,head:x.head,
      previousRank:x.original,newRank:x.variant})),
     losses:lost.map(x=>({date:x.date,turn:x.turn,jur:x.jur,head:x.head,
      previousRank:x.original,newRank:x.variant}))});
   }
 const perDay:any[]=[];
 const julyDates=dates.filter(x=>x.startsWith('2026-07'));
 for(const date of [...julyDates,'2026-10-23']){
  const vt3=rows.filter(x=>x.kind==='vt3'&&x.date===date);
  perDay.push({date,total:vt3.length,formable:vt3.filter(x=>x.physical).length,
   baselineTop3:vt3.filter(x=>isWon(x.original,3)).length,
   trialTop3:vt3.filter(x=>isWon(x.variant,3)).length,
   top3Gains:vt3.filter(x=>!isWon(x.original,3)&&isWon(x.variant,3)),
   top3Losses:vt3.filter(x=>isWon(x.original,3)&&!isWon(x.variant,3))
  });
 }
 const out='auditorias/lalo-selector-periodos-23oct/holdout-julio-23oct';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/comparaciones.json',JSON.stringify({report,perDay,datesChecked},null,2));
 fs.writeFileSync(out+'/por-cabeza.json',JSON.stringify(rows,null,2));
 fs.writeFileSync(out+'/cortes-pre.json',JSON.stringify(turns,null,2));
 const short=report.filter(x=>x.kind==='vt3')
  .map(x=>({period:x.period,top:x.top,base:x.baseline,
   trial:x.variant,win:x.gained,loss:x.lost,n:x.examined,
   physicallyPossible:x.physicalHeads}));
 console.log('HOLDOUT_LALO_VT3',JSON.stringify(short));
 console.log('HOLDOUT_LALO_VT2_VT4',JSON.stringify(report.filter(x=>x.kind!=='vt3')
  .map(x=>({kind:x.kind,period:x.period,top:x.top,base:x.baseline,
   trial:x.variant,n:x.examined}))));
 console.log('HOLDOUT_LALO_DAYS',JSON.stringify(perDay.map(x=>({
  date:x.date,heads:x.total,formable:x.formable,
  before:x.baselineTop3,after:x.trialTop3,
  gains:x.top3Gains.map((e:Row)=>e.turn+' '+e.jur+' '+e.head),
  losses:x.top3Losses.map((e:Row)=>e.turn+' '+e.jur+' '+e.head)
 }))));
 console.log('HOLDOUT_LALO_CHECKS',JSON.stringify({days:dates.length,
  cuts:turns.length,heads:rows.length/3,unmodifiedVT2VT4:true}));
}
void main().catch(e=>{console.error('HOLDOUT_LALO_ERROR',e);process.exitCode=1});
