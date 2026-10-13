import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const OLD='auditorias/vt4-transferencia-rutas-ganadoras-115-13oct2026/';
const MOTHERS='auditorias/vt4-hermanas-geometricas-115-13oct2026/PRE_115.json';
const POST='auditorias/vt4-diversidad-madres-top10-115-13oct2026/OBJETIVOS_POST_115.json';
const FIXTURE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const OUT='auditorias/vt4-complementariedad-d1-d7-115-13oct2026/';
const PROTO='PROTOCOLO_VT4_COMPLEMENTARIEDAD_13OCT2026.md';
const METHODS=['BASE_CUPO2','D7_D1_COMBINADO','DOBLE_POR_MADRE','COBERTURA_GLOBAL','EQUILIBRIO_PERIODOS','SOPORTE_TOTAL','HASH_NEUTRAL'];
const read=x=>readFileSync(x,'utf8'),json=x=>JSON.parse(read(x));
const sha=x=>createHash('sha256').update(x).digest('hex');
const save=(x,v)=>writeFileSync(OUT+x,JSON.stringify(v,null,2)+'\n');
const key=r=>r.date+'|'+r.turn;
const uniq=x=>[...new Set(x)];
const avg=x=>x.length?x.reduce((a,b)=>a+b,0)/x.length:0;
const cmpTuple=(a,b)=>{
 for(let i=0;i<Math.max(a.length,b.length);i++){
  const d=(b[i]??0)-(a[i]??0);
  if(d)return d;
 }
 return 0;
};
mkdirSync(OUT,{recursive:true});
const d7=g=>g.signal.d7shape>0, d1=g=>g.signal.d1shape>0;
const exact=g=>g.signal.d7exact+g.signal.d1exact;
const shapes=g=>g.signal.d7shape+g.signal.d1shape;
function physicalCuts(){
 const old=json(OLD+'PRE_115.json').rows;
 const inventories=json(OLD+'INVENTARIO_RUTAS_PRE_115.json').rows;
 const sister=json(MOTHERS).rows;
 assert.equal(old.length,115);assert.equal(inventories.length,115);assert.equal(sister.length,115);
 return old.map((row,i)=>{
  const inf=inventories[i],sib=sister[i];
  assert.equal(key(row),key(inf));assert.equal(key(row),key(sib));
  const byRank=new Map(sib.physicalGroups.map(g=>[g.rank,g]));
  const groups=inf.groups.map(g=>{
   const canonical=byRank.get(g.rank);assert.ok(canonical);
   assert.equal(g.family,canonical.family);
   assert.equal(g.mother,canonical.mother);
   assert.deepEqual(g.values,canonical.values);
   assert.ok(canonical.motherRank>=1&&canonical.motherRank<=5);
   const s=g.signal;
   for(const v of ['d7exact','d7shape','d1exact','d1shape','d7turn','otherSource'])assert.ok(Number.isInteger(s[v])&&s[v]>=0);
   assert.ok(s.d7exact<=s.d7shape&&s.d1exact<=s.d1shape);
   return {rank:g.rank,oldRank:g.rank,motherRank:canonical.motherRank,
    mother:g.mother,family:g.family,values:g.values,signal:s};
  });
  const seen=new Set(groups.map(x=>x.rank));assert.equal(seen.size,groups.length);
  assert.ok([...new Set(groups.map(x=>x.motherRank))].length===5);
  return {row,inf,sib,groups};
 });
}
function scoreGroup(g,mode,parent){
 const s=g.signal;
 if(mode==='EQUILIBRIO_PERIODOS'){
  const prioritizeD7=parent%2===1;
  return prioritizeD7
   ?[Number(d7(g)),s.d7exact,s.d7shape,Number(d1(g)),s.d1exact,s.d1shape]
   :[Number(d1(g)),s.d1exact,s.d1shape,Number(d7(g)),s.d7exact,s.d7shape];
 }
 return [Number(d7(g))+Number(d1(g)),exact(g),shapes(g),s.d7exact,s.d1exact];
}
function scorePair(a,b,mode,covered,motherRank,seed){
 const ds=Number(d7(a)||d7(b)),os=Number(d1(a)||d1(b));
 const both=Number(ds&&os);
 const ext=exact(a)+exact(b),shift=shapes(a)+shapes(b);
 const parentRankPenalty=-(a.rank+b.rank);
 if(mode==='DOBLE_POR_MADRE')return [both,ds+os,ext,shift,parentRankPenalty];
 if(mode==='COBERTURA_GLOBAL')return [
   Number(Boolean(ds)&&!covered.d7)+Number(Boolean(os)&&!covered.d1),
   both,ext,shift,parentRankPenalty];
 if(mode==='EQUILIBRIO_PERIODOS'){
   const preferD7=motherRank%2===1;
   return [
    Number(preferD7?ds:os),Number(preferD7?os:ds),
    both,ext,shift,parentRankPenalty];
 }
 if(mode==='SOPORTE_TOTAL')return [
  Number(d7(a))+Number(d1(a))+Number(d7(b))+Number(d1(b)),
  both,ext,shift,parentRankPenalty];
 if(mode==='HASH_NEUTRAL'){
   return [parseInt(sha(seed+'|'+motherRank+'|'+[a.rank,b.rank].sort((x,y)=>x-y).join('|')).slice(0,12),16)];
 }
 throw Error('Unknown '+mode);
}
function choosePair(groups,method,seed){
 const chosen=[],usedNums=new Set();
 const covered={d7:false,d1:false};
 for(let motherRank=1;motherRank<=5;motherRank++){
  const sisters=groups.filter(g=>g.motherRank===motherRank);
  assert.ok(sisters.length>=2);
  let best=null,bestScore=null;
  for(let i=0;i<sisters.length;i++)for(let j=i+1;j<sisters.length;j++){
   const a=sisters[i],b=sisters[j];
   if(a.values.some(x=>usedNums.has(x))||b.values.some(x=>usedNums.has(x)))continue;
   if(a.values.some(x=>b.values.includes(x)))continue;
   const score=scorePair(a,b,method,covered,motherRank,seed);
   if(best===null||cmpTuple(score,bestScore)<0||
    (cmpTuple(score,bestScore)===0&&(a.rank+b.rank<best[0].rank+best[1].rank))){
      best=[a,b];bestScore=score;
    }
  }
  assert.ok(best,'Cannot select physical two daughters, mother #'+motherRank);
  let ordered=best.slice();
  if(method==='HASH_NEUTRAL'){
    ordered.sort((a,b)=>sha(seed+'|'+a.rank).localeCompare(sha(seed+'|'+b.rank)));
  }else if(method==='EQUILIBRIO_PERIODOS'){
    ordered.sort((a,b)=>cmpTuple(scoreGroup(a,method,motherRank),scoreGroup(b,method,motherRank))||a.rank-b.rank);
  }else ordered.sort((a,b)=>cmpTuple(scoreGroup(a,'GENERAL',motherRank),scoreGroup(b,'GENERAL',motherRank))||a.rank-b.rank);
  for(const g of ordered){
   chosen.push(g);
   for(const v of g.values)usedNums.add(v);
   covered.d7 ||= d7(g);
   covered.d1 ||= d1(g);
  }
 }
 assert.equal(chosen.length,10);
 assert.equal(new Set(chosen.flatMap(g=>g.values)).size,chosen.flatMap(g=>g.values).length);
 return chosen;
}
function physicalCoverage(groups){
 const d7Groups=groups.filter(d7),d1Groups=groups.filter(d1);
 const distinctPair=d7Groups.some(a=>d1Groups.some(b=>a.rank!==b.rank));
 const distinctMotherPair=d7Groups.some(a=>d1Groups.some(b=>a.mother!==b.mother));
 const sameMotherPair=d7Groups.some(a=>d1Groups.some(b=>a.rank!==b.rank&&a.mother===b.mother));
 return {eligibleD7:d7Groups.length,eligibleD1:d1Groups.length,
  bothPossible:distinctPair,differentMothersPossible:distinctMotherPair,
  sameMotherPossible:sameMotherPair,
  exactD7:groups.filter(g=>g.signal.d7exact>0).length,
  exactD1:groups.filter(g=>g.signal.d1exact>0).length};
}
function selectedCoverage(groups){
 const d7Groups=groups.filter(d7),d1Groups=groups.filter(d1);
 return {d7:d7Groups.length,d1:d1Groups.length,
  hasComplement:groups.some(a=>d7(a)&&groups.some(b=>a.rank!==b.rank&&d1(b))),
  hasComplementDifferentMothers:groups.some(a=>d7(a)&&groups.some(b=>a.mother!==b.mother&&d1(b))),
  exactD7:groups.filter(x=>x.signal.d7exact>0).length,
  exactD1:groups.filter(x=>x.signal.d1exact>0).length,
  distinctFour:uniq(groups.flatMap(g=>g.values)).length};
}
function slim(p){
 return p.map((g,i)=>({position:i+1,rank:g.rank,family:g.family,
  mother:g.mother,motherRank:g.motherRank,values:g.values,signal:g.signal}));
}
function pre(){
 assert.ok(!existsSync(POST),'Future heads exposed in PRE');
 assert.ok(!existsSync(FIXTURE),'Original fixture with target results exposed in PRE');
 const cuts=physicalCuts(),out=[];
 for(const cut of cuts){
  const {row,groups}=cut;
  const byRank=new Map(groups.map(g=>[g.rank,g]));
  const toGroups=method=>row.methods[method].map(v=>{
   const g=byRank.get(v.oldRank);assert.ok(g);
   assert.equal(g.family,v.family);
   return g;
  });
  const selections={BASE_CUPO2:toGroups('BASE_CUPO2'),D7_D1_COMBINADO:toGroups('D7_D1_COMBINADO')};
  for(const method of METHODS.slice(2))
   selections[method]=choosePair(groups,method,key(row));
  for(const method of METHODS){
   const selected=selections[method];assert.equal(selected.length,10);
   assert.ok(selected.every((g,i)=>Math.floor(i/2)+1===g.motherRank));
   assert.equal(uniq(selected.flatMap(g=>g.values)).length,selected.flatMap(g=>g.values).length);
  }
  out.push({date:row.date,turn:row.turn,
   physicalEvidence:physicalCoverage(groups),
   markedHistoryRoutes:row.historicalVT4MarkedRoutes,
   historicallyMarkedEvents:row.distinctHistoryEvents,
   methods:Object.fromEntries(METHODS.map(m=>[m,{
    top10:slim(selections[m]),coverage:selectedCoverage(selections[m])}]))
  });
 }
 assert.equal(out.length,115);
 save('PRE_115.json',{date:'2026-10-13',rows:out,methods:METHODS,
  note:'Choices generated without current target heads; D−1/D−7 signals are actual earlier winning marks.'});
 const seal={date:'2026-10-13',code:sha(read('scripts/lab-vt4-complementariedad.mjs')),
  protocol:sha(read(PROTO)),reference:sha(read(OLD+'PRE_115.json')),
  inventory:sha(read(OLD+'INVENTARIO_RUTAS_PRE_115.json')),
  sisters:sha(read(MOTHERS)),pre:sha(read(OUT+'PRE_115.json'))};
 save('SELLO.json',seal);
 console.log('VT4_COMPLEMENTARIEDAD_PRE_OK',JSON.stringify({
  cuts:out.length,
  eligibleComplement:out.filter(x=>x.physicalEvidence.bothPossible).length,
  differentMothers:out.filter(x=>x.physicalEvidence.differentMothersPossible).length,
  selectedComplement:Object.fromEntries(METHODS.map(m=>[m,out.filter(x=>x.methods[m].coverage.hasComplement).length])),
  seal},null,2));
}
const score=(rows,m)=>{
 const values=rows.map(x=>x.methods[m]);
 return {cuts:rows.length,
  top3:values.filter(v=>v.top3).length,
  top5:values.filter(v=>v.top5).length,
  top10:values.filter(v=>v.top10).length,
  heads:values.reduce((s,x)=>s+x.heads.length,0),
  complementaryCuts:values.filter(x=>x.cov.hasComplement).length,
  complementaryAndHit:values.filter(x=>x.cov.hasComplement&&x.top10).length,
  headsInComplementCuts:values.filter(x=>x.cov.hasComplement).reduce((s,x)=>s+x.heads.length,0),
  gainsVsBase:rows.filter(x=>x.methods[m].top10&&!x.methods.BASE_CUPO2.top10).map(key),
  lossesVsBase:rows.filter(x=>!x.methods[m].top10&&x.methods.BASE_CUPO2.top10).map(key),
  gainedHeadsVsBase:rows.flatMap(x=>x.methods[m].heads.filter(h=>!x.methods.BASE_CUPO2.heads.includes(h)).
   map(h=>({date:x.date,turn:x.turn,head:h}))),
  lostHeadsVsBase:rows.flatMap(x=>x.methods.BASE_CUPO2.heads.filter(h=>!x.methods[m].heads.includes(h)).
   map(h=>({date:x.date,turn:x.turn,head:h}))),
  changedTop10:rows.filter(x=>x.methods[m].families.join('|')!==x.methods.BASE_CUPO2.families.join('|')).length
 };
};
function post(){
 const seal=json(OUT+'SELLO.json');
 for(const [path,sig] of [
  ['scripts/lab-vt4-complementariedad.mjs',seal.code],[PROTO,seal.protocol],
  [OLD+'PRE_115.json',seal.reference],[OLD+'INVENTARIO_RUTAS_PRE_115.json',seal.inventory],
  [MOTHERS,seal.sisters],[OUT+'PRE_115.json',seal.pre]])
  assert.equal(sha(read(path)),sig,'Modification detected '+path);
 const candidates=json(OUT+'PRE_115.json').rows,heads=json(POST).rows;
 assert.equal(candidates.length,115);assert.equal(heads.length,115);
 const report=candidates.map((r,i)=>{
  const goal=heads[i];assert.equal(key(r),key(goal));
  assert.equal(goal.heads.length,5);
  const actual=uniq(goal.heads);
  return {date:r.date,turn:r.turn,cohort:
    r.date<='2026-09-19'?'X1':r.date<='2026-09-26'?'Y1':r.date<='2026-10-03'?'Y2':'Y3',
   physicalEvidence:r.physicalEvidence,targets:actual,
   methods:Object.fromEntries(METHODS.map(m=>{
    const top=r.methods[m].top10,hit=n=>top.slice(0,n).some(g=>g.values.some(v=>actual.includes(v)));
    const h=uniq(top.flatMap(g=>g.values.filter(v=>actual.includes(v))));
    return [m,{families:top.map(g=>g.family),
     heads:h,top3:hit(3),top5:hit(5),top10:hit(10),cov:r.methods[m].coverage}];
   }))};
 });
 const overall=Object.fromEntries(METHODS.map(m=>[m,score(report,m)]));
 assert.deepEqual([overall.BASE_CUPO2.top10,overall.BASE_CUPO2.heads],[4,4]);
 assert.deepEqual([overall.D7_D1_COMBINADO.top10,overall.D7_D1_COMBINADO.heads],[4,5]);
 const weeks=Object.fromEntries(['X1','Y1','Y2','Y3'].map(k=>[k,Object.fromEntries(METHODS.map(
  m=>[m,score(report.filter(x=>x.cohort===k),m)]))]));
 const mixed=report.filter(x=>x.physicalEvidence.bothPossible);
 const doubleHits=report.filter(x=>METHODS.some(m=>x.methods[m].heads.length>=2));
 const focus=report.find(x=>x.date==='2026-10-03'&&x.turn==='Matutino');
 assert.ok(focus);
 const note={date:'2026-10-13',cuts:115,overall,weeks,
  signalStats:{
   eligibleWithD7:report.filter(x=>x.physicalEvidence.eligibleD7>0).length,
   eligibleWithD1:report.filter(x=>x.physicalEvidence.eligibleD1>0).length,
   potentialComplementCuts:mixed.length,
   potentialDifferentMother:report.filter(x=>x.physicalEvidence.differentMothersPossible).length,
   potentialSameMother:report.filter(x=>x.physicalEvidence.sameMotherPossible).length,
   cooccurrencesByTurn:Object.fromEntries([...new Set(report.map(x=>x.turn))].map(t=>[
     t,report.filter(x=>x.turn===t&&x.physicalEvidence.bothPossible).length]))
  },doubleHits:doubleHits.map(x=>({date:x.date,turn:x.turn,
   heads:Object.fromEntries(METHODS.map(m=>[m,x.methods[m].heads]))})),
  focusOct3:{date:focus.date,turn:focus.turn,physicalEvidence:focus.physicalEvidence,
   perMethod:Object.fromEntries(METHODS.map(m=>[m,{
    heads:focus.methods[m].heads,top10:focus.methods[m].families,
    complementary:focus.methods[m].cov.hasComplement
   }]))},
  seal,caveat:'Resultados históricos sometidos a investigación repetida. Complementariedad PRE no equivale a capacidad predictiva y la quiniela es aleatoria.'};
 save('POST_115.json',{rows:report});
 save('RESUMEN.json',note);
 console.log('VT4_COMPLEMENTARIEDAD_POST_OK',JSON.stringify({
  signalStats:note.signalStats,
  overall:Object.fromEntries(Object.entries(overall).map(([k,v])=>[k,{
   cuts:v.cuts,top3:v.top3,top5:v.top5,top10:v.top10,heads:v.heads,
   complementaryCuts:v.complementaryCuts,complementaryAndHit:v.complementaryAndHit,
   gainedHeadsVsBase:v.gainedHeadsVsBase,lostHeadsVsBase:v.lostHeadsVsBase
  }])),focus:note.focusOct3,doubleHits:note.doubleHits
 },null,2));
}
if(process.argv[2]==='pre')pre();else if(process.argv[2]==='post')post();
else throw Error('Use pre or post');
