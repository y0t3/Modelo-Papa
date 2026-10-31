/**
 * LAB AUX: embudo entre candidatos físicamente formables, raíces históricas
 * y Top10. Comparación pareada: 10 lugares por selector, canales rootless /
 * históricos 21+ / ambos; 1 o 3 cupos contra controles neutrales del MISMO pool.
 * Formas Primero es una fuente PRE independiente de formas físicas.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {TURNOS,JURS} from '../src/domain';
import type {Turno,CabezasDia} from '../src/domain';
import {shiftDay} from '../src/dates';
import {loadPreviousDraws,hasDrawResults} from '../src/drawHistory';
import {fetchAuxiliaryHeads,auxiliarySourceDate} from '../src/auxSantiagoSource';
import {auxAtCut,extractAuxHistoryMode} from '../src/auxTemporalModes';
import type {AuxMode} from '../src/auxTemporalModes';
import {buildAuxIndependent} from '../src/motorLaloIntegral';
import type {AuxiliaryHistorical,AuxRank} from '../src/motorLaloIntegral';
import {auxFamily,auxiliaryBoard,collectAuxFamilies}
 from '../src/auxSantiagoNeuquen';
import {selectAuxFormFirst} from '../src/labAuxFormasPrimeroVT3';
import {selectAuxEmbudo,sourceGroup} from '../src/labAuxEmbudoVT3';
import type {SourceClass,Quota,Admission} from '../src/labAuxEmbudoVT3';

const from=process.env.EMBUDO_FROM||'2026-06-01';
const to=process.env.EMBUDO_TO||'2026-08-31';
const label=process.env.EMBUDO_LABEL||'test';
const skipOctober=process.env.EMBUDO_SKIP_OCT_EARLY==='1';
const modeNames=['anterior','intrajornada'] as const;
const boardName=(m:AuxMode)=>m==='anterior'?'AUX_AYER':'AUX_HOY';
const categories=['unranked','deep','outside20'] as const;
const quotas=[1,3] as const;
const keyOf=(c:SourceClass,q:Quota)=>c+'_'+q;
const drawCache=new Map<string,Promise<CabezasDia>>();
const auxCache=new Map<string,ReturnType<typeof fetchAuxiliaryHeads>>();
const draws=(date:string)=>{
 if(!drawCache.has(date))drawCache.set(date,descargarCabezas(date,true));
 return drawCache.get(date)!;
};
const aux=(date:string)=>{
 if(!auxCache.has(date))auxCache.set(date,fetchAuxiliaryHeads(date));
 return auxCache.get(date)!;
};
type Outcome={slots:number;heads:number;families:number;add:number;lost:number;
 admitted:number;neutral:number[];neutralSlots:number[]};
type Cut={
 date:string;turn:Turno;board:string;stage:'temprana'|'completa';
 totalHeads:number;formableHeads:number;physicalCount:number;
 rankedCount:number;officialSlots:number;formsSlots:number;
 officialHits:number;formsHits:number;rank11to20Hits:number;
 physicalPools:Record<'top10'|'rank11to20'|'deep'|'unranked',number>;
 winnerPools:Record<'top10'|'rank11to20'|'deep'|'unranked'|'unformable',number>;
 variants:Record<string,Outcome>;
 admissions:Record<string,Admission[]>;
 winners:{jur:string;head:string;family:string;originalRank:number|null;
 physical:boolean;formsRank:number|null;source:string}[];
};
const sum=<T>(a:T[],fn:(x:T)=>number)=>a.reduce((n,x)=>n+fn(x),0);
function summary(rows:Cut[]){
 const variants=Object.keys(rows[0]?.variants||{});
 const add=(kind:'physicalPools'|'winnerPools',id:string)=>sum(rows,r=>
  ((r[kind] as Record<string,number>)[id]||0));
 const exp=Object.fromEntries(['top10','rank11to20','deep','unranked']
  .map(c=>[c,{physicalFamilies:add('physicalPools',c),
   winningHeads:add('winnerPools',c)}]));
 const variantsSummary=Object.fromEntries(variants.map(v=>{
  const nulls=Array.from({length:5},(_,i)=>sum(rows,r=>r.variants[v].neutral[i]));
  return [v,{hits:sum(rows,r=>r.variants[v].heads),
   slots:sum(rows,r=>r.variants[v].slots),
   admitted:sum(rows,r=>r.variants[v].admitted),
   rescued:sum(rows,r=>r.variants[v].add),lost:sum(rows,r=>r.variants[v].lost),
   neutral:nulls,neutralMean:nulls.reduce((a,b)=>a+b,0)/5}];
 }));
 return {cuts:rows.length,heads:sum(rows,r=>r.totalHeads),
  formableHeads:sum(rows,r=>r.formableHeads),
  original:sum(rows,r=>r.officialHits),forms:sum(rows,r=>r.formsHits),
  next:sum(rows,r=>r.rank11to20Hits),
  originalSlots:sum(rows,r=>r.officialSlots),
  pool:exp,unformableHeads:add('winnerPools','unformable'),
  variants:variantsSummary};
}
async function main(){
 const rows:Cut[]=[],skipped:{date:string;reason:string}[]=[];
 for(let date=from;date<=to;date=shiftDay(date,1)){
  if(new Date(date+'T12:00:00Z').getUTCDay()===0)continue;
  if(skipOctober&&date>='2026-10-01'&&date<'2026-10-12')continue;
  try{
   const weekDate=shiftDay(date,-7);
   const [today,previous,week]=await Promise.all([
    draws(date),loadPreviousDraws(date,6,draws),draws(weekDate)]);
   if(TURNOS.some(t=>JURS.filter(j=>j!=='Montevideo')
    .some(j=>!/^\d{4}$/.test(today[t]?.[j]||''))))
     throw Error('Jornada incompleta: '+date);
   const requestDates=new Set<string>([date,auxiliarySourceDate(date),
    weekDate,auxiliarySourceDate(weekDate)]);
   for(const p of previous){requestDates.add(p.date);
    requestDates.add(auxiliarySourceDate(p.date));}
   const obs=new Map(await Promise.all([...requestDates].map(async d=>
    [d,(await aux(d)).heads] as const)));
   const memories={} as Record<AuxMode,AuxiliaryHistorical[]>;
   const base={} as Record<AuxMode,AuxiliaryHistorical[]>;
   const last=previous.at(-1)!;
   const refs=[{date:last.date,heads:last.heads,period:'D−1' as const},
    ...(hasDrawResults(week)?[{date:weekDate,heads:week,period:'D−7' as const}]:[])];
   for(const mode of modeNames){
    const d=(date:string)=>mode==='anterior'?auxiliarySourceDate(date):date;
    memories[mode]=previous.map(p=>({date:p.date,period:'D−1',
     aux:extractAuxHistoryMode(p.date,obs.get(d(p.date))!,p.heads,mode)}));
    base[mode]=refs.map(p=>({date:p.date,period:p.period,
     aux:extractAuxHistoryMode(p.date,obs.get(d(p.date))!,p.heads,mode)}));
   }
   const daily:Cut[]=[];
   for(const turn of TURNOS){
    const heads=JURS.filter(j=>j!=='Montevideo')
     .map(jur=>({jur,head:today[turn]?.[jur]||''}))
     .filter(h=>/^\d{4}$/.test(h.head))
     .map(h=>({...h,family:auxFamily(h.head.slice(-3))}));
    for(const mode of modeNames){
     const raw=obs.get(mode==='anterior'?auxiliarySourceDate(date):date)!;
     const current=auxAtCut(raw,turn,mode);
     const board=auxiliaryBoard(current,turn);
     const phys=collectAuxFamilies(board,3).map(f=>f.family);
     const valid=new Set(phys);
     const history=buildAuxIndependent(date,turn,current,base[mode])[3];
     const ranked=new Map(history.map(x=>[x.family,x.rank]));
     if(history.some(x=>!valid.has(x.family)))throw Error('FUGA físico-ranking');
     const forms=selectAuxFormFirst(board,memories[mode],date,
      boardName(mode),100).top;
     if(forms.some(f=>!valid.has(f.family)))throw Error('FUGA físico-formas');
     const formsTop=forms.slice(0,10);
     const shapeRank=new Map(formsTop.map(f=>[f.family,f.rank]));
     const official=new Set(history.slice(0,10).map(x=>x.family));
     const next=new Set(history.slice(10,20).map(x=>x.family));
     const selectedForm=new Set(formsTop.map(f=>f.family));
     const winners=heads.map(h=>{
      const r=ranked.get(h.family)??null;
      const physical=valid.has(h.family);
      const source=!physical?'unformable':r===null?'unranked':
       r<=10?'top10':r<=20?'rank11to20':'deep';
      return {...h,originalRank:r,physical,
       formsRank:shapeRank.get(h.family)??null,source};
     });
     const physicalPools={
      top10:phys.filter(f=>(ranked.get(f)??999)<=10).length,
      rank11to20:phys.filter(f=>{const r=ranked.get(f)??999;return r>10&&r<=20}).length,
      deep:phys.filter(f=>{const r=ranked.get(f);return r!==undefined&&r>20}).length,
      unranked:phys.filter(f=>!ranked.has(f)).length
     };
     const winnerPools={
      top10:winners.filter(w=>w.source==='top10').length,
      rank11to20:winners.filter(w=>w.source==='rank11to20').length,
      deep:winners.filter(w=>w.source==='deep').length,
      unranked:winners.filter(w=>w.source==='unranked').length,
      unformable:winners.filter(w=>w.source==='unformable').length
     };
     const variants:Record<string,Outcome>={};
     const admissions:Record<string,Admission[]>={};
     for(const category of categories)for(const quota of quotas){
      const key=keyOf(category,quota);
      const first=selectAuxEmbudo({historical:history,physical:phys,forms,
       category,quota,seed:date+'|'+turn+'|'+mode});
      const nulls=Array.from({length:5},(_,i)=>selectAuxEmbudo({
       historical:history,physical:phys,forms,category,quota,
       seed:[date,turn,mode,category,quota,i].join('|'),neutral:true
      }));
      if(nulls.some(n=>n.admissions.length!==first.admissions.length||
        n.families.length!==first.families.length))
        throw Error('FUGA control pareado: presupuesto distinto');
      const got=new Set(first.families);
      const add=new Set(first.admissions.map(f=>f.family));
      const dropped=new Set(first.dropped);
      const hits=winners.filter(w=>got.has(w.family)).length;
      const saved=winners.filter(w=>add.has(w.family)).length;
      const lost=winners.filter(w=>dropped.has(w.family)).length;
      if(hits!==winners.filter(w=>official.has(w.family)).length+saved-lost)
        throw Error('FUGA conteo: rescate neto no coincide');
      variants[key]={slots:first.families.length,heads:hits,
       families:[...new Set(winners.filter(w=>got.has(w.family)).map(w=>w.family))].length,
       add:saved,lost,admitted:first.admissions.length,
       neutral:nulls.map(n=>{
        const s=new Set(n.families);
        return winners.filter(w=>s.has(w.family)).length;
       }),neutralSlots:nulls.map(n=>n.families.length)};
      admissions[key]=first.admissions;
     }
     daily.push({date,turn,board:boardName(mode),
      stage:turn==='Vespertino'||turn==='Nocturno'?'completa':'temprana',
      totalHeads:heads.length,formableHeads:winners.filter(w=>w.physical).length,
      physicalCount:phys.length,rankedCount:history.length,
      officialSlots:official.size,formsSlots:selectedForm.size,
      officialHits:winners.filter(w=>official.has(w.family)).length,
      formsHits:winners.filter(w=>selectedForm.has(w.family)).length,
      rank11to20Hits:winners.filter(w=>next.has(w.family)).length,
      physicalPools,winnerPools,variants,admissions,winners});
    }
   }
   rows.push(...daily);
   console.log('EMBUDO_DAY',date,JSON.stringify(daily.map(x=>({
    turn:x.turn,board:x.board,physical:x.formableHeads,
    classified:x.winnerPools,official:x.officialHits,forms:x.formsHits,
    hybrid:Object.fromEntries(Object.entries(x.variants)
      .map(([k,v])=>[k,v.heads]))
   }))));
  }catch(e){
   if(String(e).includes('FUGA'))throw e;
   skipped.push({date,reason:String(e).slice(0,240)});
   console.log('EMBUDO_SKIP',date,String(e).slice(0,180));
  }
 }
 const boards=['AUX_AYER','AUX_HOY'],stages=['temprana','completa'];
 const aggregate=(fn:(c:Cut)=>boolean)=>summary(rows.filter(fn));
 const result={
  label,from,to,dates:new Set(rows.map(c=>c.date)).size,
  cuts:rows.length,skipped,
  method:'PRE reconstruido en 10 puestos; H7+3 u H9+1 complementado con familias unranked/21+/outside20, prioridad física Formas Primero; controles neutrales exactamente mismo pool y cantidad. Cabezas únicamente en POST',
  byBoardStage:Object.fromEntries(boards.map(board=>[board,
   Object.fromEntries(stages.map(stage=>[stage,
    {all:aggregate(r=>r.board===board&&r.stage===stage),
     byMonth:Object.fromEntries([...new Set(rows.map(r=>r.date.slice(0,7)))].sort()
      .map(month=>[month,aggregate(r=>r.board===board&&r.stage===stage&&r.date.startsWith(month))])),
     byTurn:Object.fromEntries(TURNOS.filter(t=>rows.some(r=>r.board===board&&r.stage===stage&&r.turn===t))
      .map(turn=>[turn,aggregate(r=>r.board===board&&r.stage===stage&&r.turn===turn)]))
    }]))
  ])),
  headCases:rows.filter(r=>r.formableHeads>0).map(r=>({
   date:r.date,turn:r.turn,board:r.board,stage:r.stage,
   winners:r.winners.filter(w=>w.physical),
   variants:Object.fromEntries(Object.entries(r.variants).map(([k,v])=>[k,
    {rescued:v.add,lost:v.lost,hitHeads:v.heads,admitted:v.admitted,neutral:v.neutral}])),
   admissions:r.admissions
  })),
  cutsDetail:rows
 };
 fs.mkdirSync('auditorias/aux-embudo-vt3',{recursive:true});
 fs.writeFileSync('auditorias/aux-embudo-vt3/'+label+'.json',JSON.stringify(result,null,2)+'\n');
 console.log('EMBUDO_SUMMARY',JSON.stringify({
  label,dates:result.dates,cuts:rows.length,skipped,
  byBoardStage:Object.fromEntries(boards.map(board=>[board,
   Object.fromEntries(stages.map(stage=>[stage,
    result.byBoardStage[board][stage]]))
  ])),
  cases30:result.headCases.filter(r=>r.date==='2026-10-30')
 }));
 if(rows.length<Number(process.env.EMBUDO_MIN_CUTS||100))
  throw Error('Cobertura insuficiente de cortes: '+rows.length);
}
main().catch(e=>{console.error('EMBUDO_ERROR',e);process.exitCode=1});
