import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical,LaloFamily,RootRef} from '../src/motorLalo';
import type {DailySheet} from '../src/sheet';
import type {Turno} from '../src/domain';
import {TURNOS} from '../src/domain';

const dir='resultados/lab-raices-independientes-115';
const source='resultados/replay-lalo-115';
mkdirSync(dir,{recursive:true});
const load=(file:string)=>JSON.parse(readFileSync(file,'utf8'));
const save=(file:string,value:unknown)=>writeFileSync(join(dir,file),JSON.stringify(value,null,2)+'\n');
type Bucket='A_RAIZ_REPETIDA'|'B_RAICES_MISMO_BLOQUE'|'C_BLOQUES_MISMA_FUENTE'|'D_FUENTES_DISTINTAS'|'U_SIN_RAIZ';
const bucketNames:Bucket[]=['A_RAIZ_REPETIDA','B_RAICES_MISMO_BLOQUE','C_BLOQUES_MISMA_FUENTE','D_FUENTES_DISTINTAS','U_SIN_RAIZ'];
const cell=(p:{row:number;col:number})=>p.row+':'+p.col;
const block=(p:{row:number;col:number}[])=>p.map(cell).sort().join(',');
const historicBlock=(r:RootRef)=>[r.date,r.sourceId,[...r.oldCells].sort().join(',')].join('|');
const event=(r:RootRef)=>[r.date,r.oldTurn,r.jurisdiction,r.head].join('|');
const finite=(n:number)=>Number(n.toFixed(3));
function features(f:LaloFamily,rootMap:Map<string,RootRef>){
 const rootIds=[...new Set(f.paths.flatMap(p=>p.rootIds))];
 const roots=rootIds.map(id=>{
  const root=rootMap.get(id);assert.ok(root,'Raiz ausente '+id);return root;
 });
 const events=new Set(roots.map(event));
 const oldBlocks=new Set(roots.map(historicBlock));
 const currentBlocks=new Set(f.paths.map(p=>p.sourceId+'|'+block(p.path)));
 const sources=new Set(f.paths.map(p=>p.sourceId));
 const periods=new Set(roots.map(r=>r.period));
 for(const p of f.paths){
  assert.equal(p.path.length,3);
  assert.equal(new Set(p.path.map(cell)).size,3);
  for(let i=1;i<3;i++)assert.equal(Math.max(
   Math.abs(p.path[i].row-p.path[i-1].row),
   Math.abs(p.path[i].col-p.path[i-1].col)),1);
  assert.equal(reversibleFamily(p.path.map(v=>v.digit).join('')),f.family);
  assert.ok(p.rootIds.every(id=>rootMap.get(id)?.sourceId===p.sourceId),'Raiz prestada entre fuentes');
 }
 let bucket:Bucket='U_SIN_RAIZ';
 if(sources.size>=2)bucket='D_FUENTES_DISTINTAS';
 else if(currentBlocks.size>=2)bucket='C_BLOQUES_MISMA_FUENTE';
 else if(events.size>=2||oldBlocks.size>=2)bucket='B_RAICES_MISMO_BLOQUE';
 else if(roots.length)bucket='A_RAIZ_REPETIDA';
 assert.equal(sources.size,f.sourceCount);
 assert.equal(currentBlocks.size,f.physicalBlocks);
 return {
  family:f.family,rank:f.rank,bucket,
  physicalPaths:f.paths.length,rootWitnesses:rootIds.length,
  independentHeadEvents:events.size,historicalBlocks:oldBlocks.size,
  currentBlocks:currentBlocks.size,sources:sources.size,
  d1:periods.has('D−1'),d7:periods.has('D−7'),
  d1HeadEvents:new Set(roots.filter(r=>r.period==='D−1').map(event)).size,
  d7HeadEvents:new Set(roots.filter(r=>r.period==='D−7').map(event)).size,
 };
}
function pre(){
 const input=load(join(source,'INPUT_PRE_115.json'));
 assert.equal(input.rows.length,115);
 const rows=[];
 for(const {date,turn,current,history} of input.rows as {
  date:string;turn:Turno;current:DailySheet;history:LaloHistorical[]}[]){
  assert.ok(history.every(x=>x.date<date),'fuga temporal');
  assert.equal(current.heads[turn].length,0,'objetivo dentro del PRE');
  const ti=TURNOS.indexOf(turn);
  assert.ok(current.columns.slice(ti+1).every(c=>c.values.every(v=>v==='--')),'columnas futuras');
  const engine=buildMotorLalo(current,date,turn,history);
  const roots=new Map(engine.roots.map(r=>[r.id,r]));
  const families=engine.ranks.vt3.map(f=>features(f,roots));
  assert.ok(families.every((f,i)=>f.rank===i+1));
  rows.push({date,turn,families});
 }
 save('INDEPENDENCIA_PRE_115.json',{
  method:'Testigos individuales por familia: eventos de cabezas completas, bloques historicos, bloques actuales y fuentes fisicas. No usa POST.',
  chronological:true,rows});
 console.log('INDEPENDENCIA_PRE_OK',rows.length,'cortes');
}
function post(){
 const pre=load(join(dir,'INDEPENDENCIA_PRE_115.json'));
 const objectives=load(join(source,'OBJETIVOS_POST_115.json'));
 assert.equal(pre.rows.length,115);assert.equal(objectives.rows.length,115);
 const stats=Object.fromEntries(bucketNames.map(k=>[k,{
  exposures:0,eligible:0,expected:0,top3Exposures:0,top10Exposures:0,top10Eligible:0,
  bothPeriods:0,eventsMultiple:0,paths:0,blocks:0,
 }])) as Record<Bucket,{
  exposures:number;eligible:number;expected:number;top3Exposures:number;
  top10Exposures:number;top10Eligible:number;bothPeriods:number;
  eventsMultiple:number;paths:number;blocks:number;
 }>;
 const crossNames=['C_UN_EVENTO','C_MULTIPLES_EVENTOS'] as const;
 const cross=Object.fromEntries(crossNames.map(k=>[k,{exposures:0,eligible:0,expected:0,top10Exposures:0,top10Eligible:0,bothPeriods:0}])) as
 Record<typeof crossNames[number],{exposures:number,eligible:number,expected:number,top10Exposures:number,top10Eligible:number,bothPeriods:number}>;
 const perCut=[];const top={3:0,5:0,10:0};let poolWinCuts=0;
 for(let i=0;i<115;i++){
  const row=pre.rows[i],o=objectives.rows[i];
  assert.equal(row.date,o.date);assert.equal(row.turn,o.turn);
  const wins=new Set((o.targetHeads as string[]).filter(h=>/^\d{4}$/.test(h))
   .map(h=>reversibleFamily(h.slice(-3))));
  const matching=row.families.filter((f:{family:string})=>wins.has(f.family));
  const size=row.families.length;
  if(matching.length)poolWinCuts++;
  const hitRanks=matching.map((f:{rank:number})=>f.rank);
  for(const k of [3,5,10] as const)if(hitRanks.some((rank:number)=>rank<=k))top[k]++;
  const matchedCounts:Record<string,number>={};
  for(const f of row.families){
   const s=stats[f.bucket as Bucket];s.exposures++;
   s.expected+=size?matching.length/size:0;
   s.paths+=f.physicalPaths;s.blocks+=f.currentBlocks;
   if(f.d1&&f.d7)s.bothPeriods++;
   if(f.independentHeadEvents>=2)s.eventsMultiple++;
   if(f.rank<=3)s.top3Exposures++;
   if(f.rank<=10)s.top10Exposures++;
   if(f.bucket==='C_BLOQUES_MISMA_FUENTE'){
    const sub=f.independentHeadEvents>1?'C_MULTIPLES_EVENTOS':'C_UN_EVENTO';
    const z=cross[sub];z.exposures++;z.expected+=size?matching.length/size:0;
    if(f.rank<=10)z.top10Exposures++;
    if(f.d1&&f.d7)z.bothPeriods++;
    if(wins.has(f.family)){z.eligible++;if(f.rank<=10)z.top10Eligible++}
   }
   if(wins.has(f.family)){
    s.eligible++;matchedCounts[f.bucket]=(matchedCounts[f.bucket]||0)+1;
    if(f.rank<=10)s.top10Eligible++;
   }
  }
  perCut.push({date:row.date,turn:row.turn,pool:size,eligible:matching.length,
   top3:hitRanks.some((n:number)=>n<=3),top5:hitRanks.some((n:number)=>n<=5),
   top10:hitRanks.some((n:number)=>n<=10),
   matchedCounts,winningRankDetails:matching.map((f:any)=>({
    family:f.family,rank:f.rank,bucket:f.bucket,headEvents:f.independentHeadEvents,
    sources:f.sources,currentBlocks:f.currentBlocks,d1:f.d1,d7:f.d7
   }))});
 }
 assert.equal(perCut.length,115);
 const summary={nCuts:115,nDays:new Set(perCut.map(x=>x.date)).size,
  poolWinCuts,officialTop:top,
  cBlocksByHistoricalEventCount:Object.fromEntries(crossNames.map(k=>[k,{
   ...cross[k],expected:finite(cross[k].expected),
   observedPer1000:finite(1000*cross[k].eligible/Math.max(1,cross[k].exposures)),
   expectedPer1000:finite(1000*cross[k].expected/Math.max(1,cross[k].exposures))
  }])),
  metricsByBucket:Object.fromEntries(bucketNames.map(k=>[k,{
   ...stats[k],expected:finite(stats[k].expected),
   shareMatchedPer1000Exposures:finite(1000*stats[k].eligible/Math.max(1,stats[k].exposures)),
   expectedPer1000Exposures:finite(1000*stats[k].expected/Math.max(1,stats[k].exposures))
  }])),
  caveats:'Retrospectivo y exploratorio. Exposiciones repetidas entre cortes; proporciones NO son probabilidades de loteria. Los 115 cortes fueron investigados previamente. Sin modificacion de ranking ni de VT4.'};
 save('INDEPENDENCIA_POST_115.json',{summary,rows:perCut});
 console.log('INDEPENDENCIA_POST_OK',JSON.stringify(summary));
}
const mode=process.argv[2];
if(mode==='pre')pre();else if(mode==='post')post();
else throw Error('Use pre | post');