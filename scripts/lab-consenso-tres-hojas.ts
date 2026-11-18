/**
 * Auditoría nueva, fechada 18/11/2026. Compara los motores reales de Modelo
 * Lalo para jornadas COMPLETAS 02-17/11/2026 (18/11 excluido por Nocturno).
 * Rank PRE reconstruido por cortes, resultados POST sólo para cotejo final.
 *
 * Motores: Lalo +11, Aux Ayer / Hoy y Formas Primero (aux cada política).
 * Modalidades: VT2, VT3, lugares 1–5/6–10, top3/5/10 y #11–20.
 * No compara auxiliares usando la misma disponibilidad del turno si no la
 * tenían; Aux Hoy Previa nunca es evaluable.
 * No cambia componentes de producción.
 */
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {nocturnaAnteriorPorJur} from '../src/nocturnaAnteriorPorJur';
import {buildSheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {fetchAuxiliaryHeads,auxiliarySourceDate} from '../src/auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import type {AuxMode} from '../src/auxTemporalModes';
import {buildAuxIndependent} from '../src/motorLaloIntegral';
import type {AuxiliaryHistorical} from '../src/motorLaloIntegral';
import {auxFamily,auxiliaryBoard,collectAuxFamilies,enumerateAuxPaths} from '../src/auxSantiagoNeuquen';
import {selectAuxFormFirst} from '../src/labAuxFormasPrimeroVT3';
import {formPositions} from '../src/motorFormasPrimero';

const FROM=process.env.CONSENSO_FROM||'2026-11-02';
const TO=process.env.CONSENSO_TO||'2026-11-17';
const headJurs=JURS.filter(j=>j!=='Montevideo');
const valid=(s:string)=>/^\d{4}$/.test(s);
const hash=(s:string)=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const drawCache=new Map<string,Promise<CabezasDia>>();
const auxCache=new Map<string,ReturnType<typeof fetchAuxiliaryHeads>>();
function draw(d:string){
 let promise=drawCache.get(d);
 if(!promise){promise=descargarCabezas(d,true);drawCache.set(d,promise)}
 return promise;
}
function aux(d:string){
 let promise=auxCache.get(d);
 if(!promise){promise=fetchAuxiliaryHeads(d);auxCache.set(d,promise)}
 return promise;
}
type Model='lalo'|'aux_ayer'|'aux_hoy'|'formas_ayer'|'formas_hoy';
type Vt='VT2'|'VT3'|'VT4';
type Datum={
 date:string;turn:Turno;model:Model;vt:Vt;
 top:string[];topLength:number;top3:number|null;top5:number|null;
 top10:number|null;first:number|null;second:number|null;
 rank11to20:number|null;winnerDetails:{
  jur:string;head:string;family:string;rank:number|null
 }[];
 formable:number|null;historicalRoots?:number;
 controls:number[];physicalFamilies:number;physicalPool:string[];
};
const rankOnce=(date:string,turn:Turno,model:Model,vt:Vt,top:string[],
 winners:{jur:string;head:string}[],formable:number|null,
 physicalPool:string[],historicalRoots?:number):Datum=>{
 const familyOf=(s:string)=>vt==='VT2'?reversibleFamily(s):auxFamily(s);
 const details=winners.map(w=>{
  const f=vt==='VT4'?w.head:familyOf(w.head.slice(vt==='VT2'?-2:-3));
  const pos=top.findIndex(family=>vt==='VT4'?family.split('/').includes(f):family===f);
  return {...w,family:f,rank:pos<0?null:pos+1};
 });
 const hit=(l:number,h:number)=>details.filter(x=>x.rank!==null&&x.rank>=l&&x.rank<=h).length;
 const n=top.length;
 const controls=n>=10&&vt!=='VT4'?Array.from({length:20},(_,seed)=>{
  const list=[...new Set(physicalPool)].sort((a,b)=>
   hash(date+'|'+turn+'|'+model+'|'+vt+'|control'+seed+'|'+a)-
   hash(date+'|'+turn+'|'+model+'|'+vt+'|control'+seed+'|'+b)||a.localeCompare(b)).slice(0,10);
  const selected=new Set(list);
  return details.filter(x=>selected.has(x.family)).length;
 }):[];
 return {date,turn,model,vt,top,topLength:n,controls,
  physicalFamilies:new Set(physicalPool).size,physicalPool:[...new Set(physicalPool)],
  top3:n>=3?hit(1,3):null,top5:n>=5?hit(1,5):null,
  top10:n>=10?hit(1,10):null,
  first:n>=10?hit(1,5):null,second:n>=10?hit(6,10):null,
  rank11to20:n>=20?hit(11,20):null,
  winnerDetails:details,formable,historicalRoots
 };
};
function summarize(xs:Datum[]){
 const score=(k:keyof Datum)=>xs.reduce((s,r)=>s+(typeof r[k]==='number'&&r[k]!==null?(r[k] as number):0),0);
 const eligible=(k:keyof Datum)=>xs.filter(r=>r[k]!==null&&typeof r[k]==='number').length;
 const sum=xs.reduce((s,r)=>s+r.winnerDetails.length,0);
 const headHits=xs.filter(x=>x.top10!==null).flatMap(x=>
  x.winnerDetails.filter(z=>z.rank!==null&&z.rank<=10));
 const allRanked=xs.flatMap(x=>x.winnerDetails.filter(z=>z.rank!==null));
 return {
  cuts:xs.length,heads:sum,top10EligibleCuts:eligible('top10'),
  top10EligibleHeads:eligible('top10')*5,
  hitsTop3:score('top3'),cutsTop3:eligible('top3'),
  hitsTop5:score('top5'),cutsTop5:eligible('top5'),
  hitsTop10:score('top10'),turnsWithOneOrMoreTop10:xs.filter(x=>(x.top10??0)>0).length,
  hitsFirst5:score('first'),hitsSecond5:score('second'),
  top11to20Hits:score('rank11to20'),top11to20Cuts:eligible('rank11to20'),
  allRankedHeads:allRanked.length,rankedButOutsideTop10:allRanked.filter(x=>x.rank!>10).length,
  validHeadsFormable:xs.filter(x=>x.formable!==null).reduce((s,x)=>s+x.formable!,0),
  headsOnFormableCuts:xs.filter(x=>x.formable!==null).length*5,
  neutralControl:(()=>{
   const totals=Array.from({length:20},(_,i)=>xs.reduce((sum,r)=>sum+(r.controls[i]||0),0));
   return {mean:Number((totals.reduce((a,b)=>a+b,0)/20).toFixed(2)),
    min:Math.min(...totals),max:Math.max(...totals)};
  })(),
  top10HitExamples:headHits.slice(0,20).map(x=>({jur:x.jur,head:x.head,family:x.family,rank:x.rank}))
 };
}
async function one(date:string):Promise<{date:string;rows:Datum[];missing:{turn:Turno;found:number}[]}>{
 const weekDate=shiftDay(date,-7);
 const [current,previous,weekly,noctBase]=await Promise.all([
  draw(date),loadPreviousDraws(date,6,draw),draw(weekDate),
  nocturnaAnteriorPorJur(date,draw)
 ]);
 const hist:LaloHistorical[]=[];
 const latest=previous.at(-1)!,before=previous.at(-2)!;
 hist.push({date:latest.date,period:'D−1',sheet:buildSheet(latest.heads,before.heads)});
 if(weekDate<date&&hasDrawResults(weekly)){
  const beforeWeek=await loadPreviousDraws(weekDate,1,draw);
  hist.push({date:weekDate,period:'D−7',sheet:buildSheet(weekly,beforeWeek[0].heads)});
 }
 const historicalRefs=hist.map(ref=>({
  date:ref.date,period:ref.period,
  heads:ref.date===latest.date?latest.heads:weekly
 }));
 const auxDays=new Set<string>([date,auxiliarySourceDate(date)]);
 for(const p of previous){
  auxDays.add(p.date);auxDays.add(auxiliarySourceDate(p.date));
 }
 for(const ref of historicalRefs){
  auxDays.add(ref.date);auxDays.add(auxiliarySourceDate(ref.date));
 }
 const observations=new Map(await Promise.all([...auxDays].map(async d=>
  [d,(await aux(d)).heads] as const)));
 const auxHist={} as Record<AuxMode,AuxiliaryHistorical[]>;
 const sixHist={} as Record<AuxMode,AuxiliaryHistorical[]>;
 for(const mode of ['anterior','intrajornada'] as const){
  const refDate=(day:string)=>mode==='anterior'?auxiliarySourceDate(day):day;
  auxHist[mode]=historicalRefs.map(ref=>({
   date:ref.date,period:ref.period,
   aux:extractAuxHistoryMode(ref.date,observations.get(refDate(ref.date))!,
    ref.heads,mode)
  }));
  sixHist[mode]=previous.map(p=>({
   date:p.date,period:'D−1' as const,
   aux:extractAuxHistoryMode(p.date,observations.get(refDate(p.date))!,
    p.heads,mode)
  }));
 }
 const whole=buildSheet(current,noctBase.heads);
 const rows:Datum[]=[],missing:{turn:Turno;found:number}[]=[];
 for(const turn of TURNOS){
  const observed=headJurs.map(jur=>({jur,head:current[turn]?.[jur]||''}));
  if(observed.some(x=>!valid(x.head))){
   missing.push({turn,found:observed.filter(x=>valid(x.head)).length});
   continue;
  }
  const pre=preSheetAtCut(whole,turn,TURNOS.indexOf(turn));
  const lalo=buildMotorLalo(pre,date,turn,hist);
  for(const [vt,k] of [['VT2','vt2'],['VT3','vt3'],['VT4','vt4']] as const){
   const ranks=lalo.ranks[k].map(x=>x.family);
   const possible=k==='vt4'?ranks:[...new Set(formPositions(pre,turn,k)
    .map(loc=>{
     const col=pre.columns.find(c=>c.id===loc.source)!;
     return reversibleFamily(loc.cells.map(cell=>col.values[cell.row][cell.col]).join(''));
    }))];
   rows.push(rankOnce(date,turn,'lalo',vt,ranks,observed,null,possible));
  }
  for(const mode of ['anterior','intrajornada'] as const){
   const name:Model=mode==='anterior'?'aux_ayer':'aux_hoy';
   const formName:Model=mode==='anterior'?'formas_ayer':'formas_hoy';
   const source=mode==='anterior'?auxiliarySourceDate(date):date;
   const boardHeads=auxAtCut(observations.get(source)!,turn,mode);
   const board=auxiliaryBoard(boardHeads,turn);
   const ranks=buildAuxIndependent(date,turn,boardHeads,auxHist[mode]);
   for(const [vt,length] of [['VT2',2],['VT3',3],['VT4',4]] as const){
    const values=ranks[length].map(x=>x.family);
    if(length===4){
     const formed=new Set(enumerateAuxPaths(board,4)
      .map(p=>p.map(c=>c.digit).join('')));
     rows.push(rankOnce(date,turn,name,vt,values,observed,
      observed.filter(x=>formed.has(x.head)).length,values));
    }else{
     const physical=collectAuxFamilies(board,length);
     const possible=new Set(physical.map(x=>x.family));
     const hit=observed.filter(x=>possible.has(auxFamily(x.head.slice(-length)))).length;
     rows.push(rankOnce(date,turn,name,vt,values,observed,hit,physical.map(x=>x.family)));
    }
   }
   const forms=selectAuxFormFirst(board,sixHist[mode],date,name);
   const families=forms.top.map(x=>x.family);
   const physical=collectAuxFamilies(board,3).map(x=>x.family);
   const physicalSet=new Set(physical);
   rows.push(rankOnce(date,turn,formName,'VT3',families,observed,
    observed.filter(x=>physicalSet.has(auxFamily(x.head.slice(-3)))).length,
    physical,forms.winnerRoots));
  }
 }
 return {date,rows,missing};
}
async function main(){
 const dates:string[]=[];
 for(let d=FROM;d<=TO;d=shiftDay(d,1))
  if(new Date(d+'T12:00:00Z').getUTCDay()!==0)dates.push(d);
 const successes:Awaited<ReturnType<typeof one>>[]=[];
 const skipped:{date:string;error:string}[]=[];
 for(const date of dates){
  try{
   const result=await one(date);
   successes.push(result);
   const scores=Object.fromEntries(
    (['lalo','aux_ayer','aux_hoy','formas_ayer','formas_hoy'] as Model[])
     .map(model=>[model,Object.fromEntries((['VT2','VT3'] as Vt[])
      .map(vt=>[vt,result.rows.filter(x=>x.model===model&&x.vt===vt)
       .reduce((s,x)=>s+(x.top10??0),0)]))]));
   console.log('BALANCE_DAY',date,
    JSON.stringify({cuts:TURNOS.length-result.missing.length,
     missing:result.missing,score:scores}));
  }catch(e){
   skipped.push({date,error:String(e).slice(0,280)});
   console.log('BALANCE_SKIP',date,String(e).slice(0,250));
  }
 }
 const all=successes.flatMap(x=>x.rows);
 const models=['lalo','aux_ayer','aux_hoy','formas_ayer','formas_hoy'] as Model[];
 const vts=['VT2','VT3','VT4'] as Vt[];
 const byModel=Object.fromEntries(models.map(m=>[m,Object.fromEntries(vts
  .filter(v=>!m.startsWith('formas')||v==='VT3')
  .map(v=>[v,summarize(all.filter(x=>x.model===m&&x.vt===v))]))]));
 const byTurn=Object.fromEntries(TURNOS.map(turn=>[
  turn,Object.fromEntries(models.map(m=>[m,Object.fromEntries(vts
   .filter(v=>!m.startsWith('formas')||v==='VT3')
   .map(v=>[v,summarize(all.filter(x=>x.turn===turn&&x.model===m&&x.vt===v))]))]))
 ]));
 const comparable=Object.fromEntries(vts.map(vt=>{
  const groups=new Map<string,Datum[]>();
  for(const r of all.filter(x=>x.vt===vt&&['lalo','aux_ayer','aux_hoy'].includes(x.model))){
   const id=r.date+'|'+r.turn;
   const pool=groups.get(id)||[];pool.push(r);groups.set(id,pool);
  }
  const common=[...groups.values()].filter(rs=>rs.length===3&&rs.every(r=>r.top10!==null));
  return [vt,{cuts:common.length,heads:common.length*5,
   byMotor:Object.fromEntries((['lalo','aux_ayer','aux_hoy'] as Model[]).map(m=>{
    const xs=common.map(rs=>rs.find(r=>r.model===m)!);
    return [m,summarize(xs)];
   }))}];
 }));
 const pairs=[
  ['aux_hoy','lalo'],['aux_hoy','aux_ayer'],['aux_ayer','lalo'],
  ['formas_ayer','aux_ayer'],['formas_hoy','aux_hoy']
 ] as const;
 const pairedTests=Object.fromEntries(vts.map(vt=>[vt,Object.fromEntries(pairs
  .filter(([a,b])=>vt==='VT3'||(!a.startsWith('formas')&&!b.startsWith('formas')))
  .map(([a,b],p)=>{
   const daily=successes.map(day=>{
    let hitsA=0,hitsB=0,cuts=0;
    for(const turn of TURNOS){
     const A=day.rows.find(r=>r.turn===turn&&r.vt===vt&&r.model===a);
     const B=day.rows.find(r=>r.turn===turn&&r.vt===vt&&r.model===b);
     if(A?.top10===null||B?.top10===null||!A||!B)continue;
     cuts++;hitsA+=A.top10;hitsB+=B.top10;
    }
    return {date:day.date,hitsA,hitsB,cuts,delta:hitsA-hitsB};
   });
   let seed=(20261118+p*197+Number(vt==='VT3')*2003)>>>0;
   const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296};
   const bSamples=Array.from({length:3000},()=>{
    let total=0;
    for(let i=0;i<daily.length;i++)total+=daily[Math.floor(random()*daily.length)].delta;
    return total;
   }).sort((x,y)=>x-y);
   return [a+'__'+b,{
    cuts:daily.reduce((n,x)=>n+x.cuts,0),
    hitsA:daily.reduce((n,x)=>n+x.hitsA,0),
    hitsB:daily.reduce((n,x)=>n+x.hitsB,0),
    difference:daily.reduce((n,x)=>n+x.delta,0),
    dayBootstrap95:[bSamples[74],bSamples[2924]],
    daysBetter:daily.filter(x=>x.delta>0).length,
    daysWorse:daily.filter(x=>x.delta<0).length,
    daysTied:daily.filter(x=>x.delta===0).length
   }];
  }))]));

 /** No se mezclan VT2 y VT3 ni se multiplican eventos por número de rutas
  * físicas. Tres tableros independientes sólo si cada uno tenía PRE completo.
  * Estadísticas se hacen con exactamente los mismos cinco objetivos/corte. */
 const analyzeConsensus=(vt:'VT2'|'VT3')=>{
  type Engines={lalo:Datum;aux_ayer:Datum;aux_hoy?:Datum};
  const allCuts:{date:string;turn:Turno;engines:Engines;winners:string[]}[]=[];
  for(const day of successes){
   for(const turn of TURNOS){
    const group=day.rows.filter(x=>x.turn===turn&&x.vt===vt);
    const lalo=group.find(x=>x.model==='lalo');
    const ayer=group.find(x=>x.model==='aux_ayer');
    const hoy=group.find(x=>x.model==='aux_hoy');
    if(!lalo||!ayer||lalo.top10===null||ayer.top10===null)continue;
    if(turn!=='Previa'&&(!hoy||hoy.top10===null))continue;
    allCuts.push({date:day.date,turn,engines:{lalo,aux_ayer:ayer,...(hoy?{aux_hoy:hoy}:{})},
     winners:lalo.winnerDetails.map(x=>x.family)});
   }
  }
  const scoreOne=(x:string,selected:Set<string>,winners:string[])=>winners.filter(f=>selected.has(f)).length;
  const endpoints=(family:string)=>[...new Set(family.split('/'))].length;
  const sum=(v:number[])=>v.reduce((a,b)=>a+b,0);
  const calc=(cuts:typeof allCuts)=>{
   const physicalBuckets=Array.from({length:4},()=>({observed:0,expectedUniform:0,
    availableFamilias:0,expectedWinnersPerCut:0}));
   const topBuckets=Array.from({length:4},()=>({observed:0,expectedUniform:0,
    selectedFamilias:0}));
   const chosen={lalo:0,ayer:0,hoy:0,fusion:0,rescate:0,geom:0,
    consensusWin:0,consensusWinners:0};
   let rescues=0,changedRescues=0;
   let fusionChanges=0,geomChanges=0;
   let sharedPhys3=0,sharedPhys2=0,unionPhys=0;
   let topOverlap2=0,topOverlap3=0;
   let nTwo=0,nThree=0;
   const daily:{date:string;turn:Turno;lalo:number;fusion:number;
     rescate:number;geom:number;ayer:number;hoy:number;formsIn3:number;
     topOverlap:number}[]=[];
   for(const cut of cuts){
    const models=[cut.engines.lalo,cut.engines.aux_ayer,
     ...(cut.engines.aux_hoy?[cut.engines.aux_hoy]:[])];
    if(models.length===3)nThree++;else nTwo++;
    const [lalo,ayer,hoy]=models;
    const tops=models.map(m=>new Set(m.top.slice(0,10)));
    const physical=models.map(m=>new Set(m.physicalPool));
    const allPhysical=new Set(physical.flatMap(p=>[...p]));
    const allTop=new Set(tops.flatMap(p=>[...p]));
    const ranked=new Set(models.flatMap(x=>x.top.slice(0,20)));
    const win=cut.winners;
    for(const fam of allPhysical){
     const n=physical.filter(p=>p.has(fam)).length;
     const exposure=5*endpoints(fam)/100;
     physicalBuckets[n].availableFamilias++;
     physicalBuckets[n].expectedUniform+=exposure;
    }
    for(const fam of allTop){
     const n=tops.filter(p=>p.has(fam)).length;
     topBuckets[n].selectedFamilias++;
     topBuckets[n].expectedUniform+=5*endpoints(fam)/100;
    }
    for(const fam of win){
     const k=physical.filter(p=>p.has(fam)).length;
     physicalBuckets[k].observed++;
     const j=tops.filter(p=>p.has(fam)).length;
     topBuckets[j].observed++;
    }
    sharedPhys3+=[...allPhysical].filter(f=>physical.every(p=>p.has(f))).length;
    sharedPhys2+=[...allPhysical].filter(f=>physical.filter(p=>p.has(f)).length>=2).length;
    unionPhys+=allPhysical.size;
    topOverlap2+=[...allTop].filter(f=>tops.filter(p=>p.has(f)).length>=2).length;
    topOverlap3+=[...allTop].filter(f=>tops.length===3&&tops.every(p=>p.has(f))).length;
    const base=lalo.top.slice(0,10);
    const secondary=models.slice(1);
    // RESCATE: sólo candidatos 11-20 de Lalo validados también por
    // Top10 de ambas auxiliares. Se sustituyen últimos hasta dos.
    // En Previa hay una única auxiliar y no se ejecuta este rescate.
    const eligibleRescue=models.length===3?lalo.top.slice(10,20)
     .filter(f=>secondary.every(m=>m.top.slice(0,10).includes(f))).slice(0,2):[];
    const rescue=[...base.slice(0,10-eligibleRescue.length),...eligibleRescue];
    rescues+=eligibleRescue.length;
    if(eligibleRescue.length)changedRescues++;
    // GEOMETRÍA: conserva veinte candidatos elegibles de Lalo y suma
    // solamente un desempate físico, no cuenta duplicados geométricos.
    const geom=[...lalo.top.slice(0,20)].sort((a,b)=>{
     const sa=physical.filter(p=>p.has(a)).length,sb=physical.filter(p=>p.has(b)).length;
     const ia=lalo.top.indexOf(a),ib=lalo.top.indexOf(b);
     return (ib-ia)+3*(sb-sa)||ia-ib||a.localeCompare(b);
    }).slice(0,10);
    if(geom.some(x=>!base.includes(x)))geomChanges++;
    // FUSIÓN: puntaje fijo de posiciones 1-20, separado por motor.
    const fused=[...ranked].map(f=>{
     const pts=sum(models.map(m=>{
      const i=m.top.indexOf(f);
      return i<0||i>=20?0:(20-i)/20;
     }));
     const bestRank=Math.min(...models.map(m=>{
      const i=m.top.indexOf(f);return i<0?999:i+1;
     }));
     return {f,pts,bestRank};
    }).sort((a,b)=>b.pts-a.pts||a.bestRank-b.bestRank||
     a.f.localeCompare(b.f)).slice(0,10).map(x=>x.f);
    if(fused.some(x=>!base.includes(x)))fusionChanges++;
    const hits={
     lalo:scoreOne('lalo',new Set(base),win),
     ayer:scoreOne('ayer',tops[1],win),
     hoy:hoy?scoreOne('hoy',tops[2],win):0,
     fusion:scoreOne('fusion',new Set(fused),win),
     rescate:scoreOne('rescate',new Set(rescue),win),
     geom:scoreOne('geom',new Set(geom),win),
     consensusWin:win.filter(f=>tops.filter(p=>p.has(f)).length>=2).length,
     consensusWinners:win.filter(f=>tops.filter(p=>p.has(f)).length===3).length,
    };
    for(const k of Object.keys(hits) as (keyof typeof hits)[])chosen[k]+=hits[k];
    daily.push({date:cut.date,turn:cut.turn,lalo:hits.lalo,ayer:hits.ayer,
     hoy:hits.hoy,fusion:hits.fusion,rescate:hits.rescate,geom:hits.geom,
     formsIn3:win.filter(f=>physical.filter(p=>p.has(f)).length>=3).length,
     topOverlap:hits.consensusWin});
   }
   return {cuts:cuts.length,threeAvailable:nThree,twoAvailable:nTwo,heads:cuts.length*5,
    physical:{bySupport:physicalBuckets,meanUnionFamilies:cuts.length?unionPhys/cuts.length:0,
     meanMultiSheetFamilies:cuts.length?sharedPhys2/cuts.length:0,
     meanTripleSheetFamilies:nThree?sharedPhys3/nThree:0},
    ranked:{bySupport:topBuckets,meanTopOverlap2:cuts.length?topOverlap2/cuts.length:0,
     meanTopOverlap3:nThree?topOverlap3/nThree:0},
    hits:chosen,
    candidateSwitches:{rescueCuts:changedRescues,rescueFamilies:rescues,
     geomCuts:geomChanges,fusionCuts:fusionChanges},
    daily};
  };
  return {all:calc(allCuts),
   pre:calc(allCuts.filter(x=>x.turn==='Previa')),
   three:calc(allCuts.filter(x=>x.turn!=='Previa')),
   byTurn:Object.fromEntries(TURNOS.map(turn=>[turn,calc(allCuts.filter(x=>x.turn===turn))]))
  };
 };
 const crossSheet={VT2:analyzeConsensus('VT2'),VT3:analyzeConsensus('VT3')};
 const result={
  dates:dates,dayCount:successes.length,from:FROM,to:TO,comparable,pairedTests,crossSheet,
  skipped,missingDraws:successes.filter(x=>x.missing.length).map(x=>({
   date:x.date,missing:x.missing})),
  method:'PRE reconstruido: +11 y Aux Ayer/Hoy D−1 y D−7, Formas Primero seis jornadas. Montevideo sólo como fuente, no objetivo. 5 jurisdicciones objetivo por corte. Top10 requiere 10 familias completas.',
  byModel,byTurn,
  rankedExamples:all.filter(x=>x.vt==='VT3'&&x.top10!==null)
   .flatMap(x=>x.winnerDetails.filter(y=>y.rank!==null&&y.rank<=20)
    .map(y=>({date:x.date,turn:x.turn,model:x.model,...y}))).slice(-75),
  daily:successes.map(x=>({date:x.date,cuts:5-x.missing.length,
   hits:Object.fromEntries(models.map(m=>[m,Object.fromEntries(vts
    .filter(v=>!m.startsWith('formas')||v==='VT3')
    .map(v=>[v,x.rows.filter(y=>y.model===m&&y.vt===v)
     .reduce((s,y)=>s+(y.top10??0),0)]))]))}))
 };
 console.log('CONSENSO_JSON_START');
 console.log(JSON.stringify({from:FROM,to:TO,days:successes.length,
  skipped,VT2:{...crossSheet.VT2,all:{...crossSheet.VT2.all,daily:[]},
   three:{...crossSheet.VT2.three,daily:[]},pre:{...crossSheet.VT2.pre,daily:[]},
   byTurn:Object.fromEntries(Object.entries(crossSheet.VT2.byTurn).map(([t,v])=>[t,{...v,daily:[]}]))},
  VT3:{...crossSheet.VT3,all:{...crossSheet.VT3.all,daily:[]},
   three:{...crossSheet.VT3.three,daily:[]},pre:{...crossSheet.VT3.pre,daily:[]},
   byTurn:Object.fromEntries(Object.entries(crossSheet.VT3.byTurn).map(([t,v])=>[t,{...v,daily:[]}]))}}));
 console.log('CONSENSO_JSON_END');
 console.log('BALANCE_JSON_START');
 console.log(JSON.stringify(result));
 console.log('BALANCE_JSON_END');
 if(successes.length<10)throw Error('Menos de 10 fechas completas con recursos: '+
  JSON.stringify(skipped));
}
main().catch(e=>{console.error('BALANCE_ERROR',e);process.exitCode=1});
