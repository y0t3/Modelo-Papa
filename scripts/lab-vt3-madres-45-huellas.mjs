import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const ROOT='auditorias/';
const SISTER=ROOT+'vt4-hermanas-geometricas-115-13oct2026/';
const VIG=ROOT+'vt3-vigencia-fisica-115-13oct2026/';
const HISTORY=ROOT+'vt4-transferencia-rutas-ganadoras-115-13oct2026/';
const MAP=ROOT+'vt3-madres-vt4-cobertura-115-13oct2026/';
const TARGET=ROOT+'vt4-diversidad-madres-top10-115-13oct2026/OBJETIVOS_POST_115.json';
const FIXTURE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const OTHER_POST=MAP+'POST_115.json';
const OUT=ROOT+'vt3-madres-45-huellas-115-13oct2026/';
const PROTOCOL='PROTOCOLO_VT3_MADRES_45_HUELLAS_13OCT2026.md';
const SCRIPT='scripts/lab-vt3-madres-45-huellas.mjs';
const METHODS=['BASE_1_2','PUESTOS_4_5','D1_PROPIA','D7_PROPIA',
 'DOBLE_RAIZ_PROPIA','BLOQUES_VT3','REUSO_EXACTO_DOS','MEMORIA_HIJAS',
 'MAS_CUATERNAS_CONTROL','HASH_NEUTRAL'];
const read=p=>readFileSync(p,'utf8');
const j=p=>JSON.parse(read(p));
const sha=p=>createHash('sha256').update(p).digest('hex');
const write=(name,content)=>writeFileSync(OUT+name,JSON.stringify(content,null,2)+'\n');
const id=r=>r.date+'|'+r.turn;
const uniq=a=>[...new Set(a)];
const avg=a=>a.reduce((s,v)=>s+v,0)/(a.length||1);
const cmpTuple=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++){
 const d=(b[i]??0)-(a[i]??0);if(d)return d;
 }return 0;};
const sri=j(SISTER+'SELLO.json'),vri=j(VIG+'SELLO.json');
const hri=j(HISTORY+'SELLO.json'),mri=j(MAP+'SELLO.json');
for(const [p,expected] of [
 [SISTER+'PRE_115.json',sri.pre],
 [VIG+'PRE_115.json',vri.generatedPre],
 [HISTORY+'INVENTARIO_RUTAS_PRE_115.json',hri.inventory],
 [MAP+'MAPAS_FISICOS_PRE_115.json',mri.packed]
 ]){assert.equal(sha(read(p)),expected,'Original sealed PRE not identical '+p);}
const physicalArchive=j(MAP+'MAPAS_FISICOS_PRE_115.json');
const physical=gunzipSync(Buffer.from(physicalArchive.data,'base64'));
assert.equal(sha(physical),physicalArchive.rawSha256);
assert.equal(physical.length,115*30000);
mkdirSync(OUT,{recursive:true});
function top2(mothers,method,seed){
 if(method==='BASE_1_2')return mothers.slice(0,2);
 if(method==='PUESTOS_4_5')return mothers.slice(3,5);
 function tuple(x){
  if(method==='D1_PROPIA')return [x.d1,x.d7,x.paths];
  if(method==='D7_PROPIA')return [x.d7,x.d1,x.paths];
  if(method==='DOBLE_RAIZ_PROPIA')return [Number(x.d1>0&&x.d7>0),Math.min(x.d1,x.d7),x.d1+x.d7,x.blocks];
  if(method==='BLOQUES_VT3')return [x.blocks,x.branch,x.paths,x.sources];
  if(method==='REUSO_EXACTO_DOS')return [Number(x.reuse2),x.seen2,x.blocks];
  if(method==='MEMORIA_HIJAS')return [x.historicalD1AndD7,x.historicalExact,x.historicalShapes,x.groups];
  if(method==='MAS_CUATERNAS_CONTROL')return [x.values.length,x.groups];
  return [0];
 }
 if(method==='HASH_NEUTRAL')return mothers.slice().sort((a,b)=>
  sha('vt3-45-neutral|'+seed+'|'+a.family).localeCompare(
  sha('vt3-45-neutral|'+seed+'|'+b.family))).slice(0,2);
 return mothers.slice().sort((a,b)=>cmpTuple(tuple(a),tuple(b))||a.rank-b.rank).slice(0,2);
}
function pre(){
 for(const x of [TARGET,FIXTURE,OTHER_POST])assert.ok(!existsSync(x),'POST visible during PRE: '+x);
 const a=j(SISTER+'PRE_115.json').rows,b=j(VIG+'PRE_115.json').rows,
  c=j(HISTORY+'INVENTARIO_RUTAS_PRE_115.json').rows;
 assert.equal(a.length,115);assert.equal(b.length,115);assert.equal(c.length,115);
 const rows=[],check={rankFirst3:0,rankFourFiveExtra:0,overlaps:0};
 for(let i=0;i<115;i++){
  const x=a[i],v=b[i],hist=c[i],seed=id(x);
  assert.equal(id(v),seed);assert.equal(id(hist),seed);
  assert.equal(x.topMothers.length,5);
  const mothers=x.topMothers.map((m,ix)=>{
   assert.equal(m.rank,ix+1);
   const vg=v.profiles.find(z=>z.family===m.family);
   assert.ok(vg);assert.equal(vg.officialRank,m.rank);
   const groups=hist.groups.filter(g=>g.mother===m.family);
   const sisters=x.physicalGroups.filter(g=>g.mother===m.family);
   assert.ok(groups.length>=2,'At least 2 physical daughters required');
   assert.equal(groups.length,sisters.length);
   const native=new Map(sisters.map(z=>[z.rank,z]));
   for(const g of groups){const s=native.get(g.rank);assert.ok(s);
    assert.equal(g.family,s.family);
    assert.deepEqual(g.values,s.values);
   }
   const numbers=uniq(groups.flatMap(g=>g.values)).sort();
   const shapeD1=groups.filter(g=>g.signal.d1shape>0);
   const shapeD7=groups.filter(g=>g.signal.d7shape>0);
   return {rank:m.rank,family:m.family,d1:vg.rootD1,d7:vg.rootD7,
    paths:vg.anchoredPaths,branch:vg.blocks?m.branch:vg.blocks,
    blocks:vg.blocks,sources:vg.currentSources,reuse2:Boolean(vg.activity?.[2]?.sameAnchoredRoute),
    seen2:vg.activity?.[2]?.familySeenDays??0,mature:Boolean(vg.mature),born:Boolean(vg.born),
    groups:groups.length,historicalD1AndD7:Number(shapeD1.length>0&&shapeD7.length>0),
    historicalExact:groups.filter(g=>g.signal.d1exact>0||g.signal.d7exact>0).length,
    historicalShapes:shapeD1.length+shapeD7.length,
    withD1Groups:shapeD1.length,withD7Groups:shapeD7.length,
    values:numbers,groupsDetail:groups.map(g=>({family:g.family,values:g.values,
     d1shape:g.signal.d1shape,d7shape:g.signal.d7shape,
     d1exact:g.signal.d1exact,d7exact:g.signal.d7exact}))};
  });
  const first3=new Set(mothers.slice(0,3).flatMap(m=>m.values));
  const fourthFifth=new Set(mothers.slice(3).flatMap(m=>m.values));
  const overlap= [...fourthFifth].filter(z=>first3.has(z)).length;
  check.overlaps+=overlap;
  let firstFromMap=0,subseqFromMap=0;
  for(let k=0;k<10000;k++){
   const rank=physical.readUInt16LE(i*30000+k*2);
   firstFromMap+=Number(rank<=3);
   subseqFromMap+=Number(rank>=4&&rank<=5);
  }
  assert.equal(first3.size,firstFromMap,'Rooted maternal Top3 physical map mismatch '+seed);
  assert.equal([...fourthFifth].filter(z=>!first3.has(z)).length,subseqFromMap,
   'New exposure from mothers 4+5 not same as independently sealed physical map '+seed);
  check.rankFirst3+=firstFromMap;check.rankFourFiveExtra+=subseqFromMap;
  const choices={};
  for(const method of METHODS){
   const selected=top2(mothers,method,seed);
   assert.equal(selected.length,2);
   assert.equal(uniq(selected.map(m=>m.rank)).length,2);
   choices[method]={ranks:selected.map(m=>m.rank),mothers:selected.map(m=>m.family),
    values:uniq(selected.flatMap(m=>m.values)).sort()};
  }
  rows.push({date:x.date,turn:x.turn,cohort:x.cohort,mothers,choices,
   physicalTop3:first3.size,newFourFive:subseqFromMap});
 }
 write('PRE_115.json',{rows,methods:METHODS,check,
  note:'Todos los perfiles, huellas y selecciones se determinaron sin disponer de cabezas objetivo.'});
 write('SELLO.json',{sisters:sri.pre,vigencia:vri.generatedPre,marks:hri.inventory,
  maps:mri.packed,protocol:sha(read(PROTOCOL)),script:sha(read(SCRIPT)),
  pre:sha(read(OUT+'PRE_115.json'))});
 console.log('VT3_MADRES_45_PRE_OK',JSON.stringify({cuts:rows.length,check,seal:j(OUT+'SELLO.json')},null,2));
}
function poissonBinomialTail(probs,observed){
 let dp=new Float64Array(probs.length+1);dp[0]=1;
 for(let i=0;i<probs.length;i++)for(let k=i+1;k>=0;k--)
  dp[k]=(dp[k]||0)*(1-probs[i])+(k?dp[k-1]*probs[i]:0);
 let lo=0,hi=0;
 for(let k=0;k<dp.length;k++){if(k<=observed)lo+=dp[k];if(k>=observed)hi+=dp[k];}
 return {oneSidedHigh:Math.min(1,hi),twoSided:Math.min(1,2*Math.min(lo,hi))};
}
function aggregate(cases,method){
 const info=cases.map(c=>c.methods[method]);
 const result={cuts:cases.length,heads:info.reduce((s,x)=>s+x.heads.length,0),
  hitsInCuts:info.filter(x=>x.heads.length>0).length,
  meanEligibleNumbers:+avg(info.map(x=>x.poolSize)).toFixed(3),
  expectedHeads:+info.reduce((s,x)=>s+5*x.poolSize/10000,0).toFixed(5),
  expectedCutHits:+info.reduce((s,x)=>s+1-Math.pow(1-x.poolSize/10000,5),0).toFixed(5)};
 const probs=info.flatMap(x=>Array(5).fill(x.poolSize/10000));
 const test=poissonBinomialTail(probs,result.heads);
 result.oneSidedHigh=test.oneSidedHigh;result.pTwoSided=test.twoSided;
 result.pAdjustedBonferroni=Math.min(1,test.twoSided*METHODS.length);
 return result;
}
function post(){
 const seal=j(OUT+'SELLO.json');
 for(const [path,h] of [
 [SISTER+'PRE_115.json',seal.sisters],[VIG+'PRE_115.json',seal.vigencia],
 [HISTORY+'INVENTARIO_RUTAS_PRE_115.json',seal.marks],
 [MAP+'MAPAS_FISICOS_PRE_115.json',seal.maps],
 [PROTOCOL,seal.protocol],[SCRIPT,seal.script],[OUT+'PRE_115.json',seal.pre]])
 assert.equal(sha(read(path)),h,'PRE integrity broken '+path);
 const p=j(OUT+'PRE_115.json').rows,goals=j(TARGET).rows;
 assert.equal(goals.length,115);assert.equal(p.length,115);
 const cases=[];
 for(let i=0;i<115;i++){
  const x=p[i],g=goals[i];
  assert.equal(id(x),id(g));assert.equal(g.heads.length,5);
  const results={};
  for(const method of METHODS){
   const choice=x.choices[method];
   results[method]={poolSize:choice.values.length,
    heads:uniq(g.heads.filter(h=>choice.values.includes(h))),
    mothers:choice.mothers,ranks:choice.ranks};
  }
  const positives=x.mothers.map(m=>({...m,
   hitHeads:uniq(g.heads.filter(h=>m.values.includes(h))),
   winningGroups:m.groupsDetail.filter(z=>z.values.some(v=>g.heads.includes(v)))}));
  cases.push({date:x.date,turn:x.turn,cohort:x.cohort,heads:g.heads,
   methods:results,positives});
 }
 const all=Object.fromEntries(METHODS.map(z=>[z,aggregate(cases,z)]));
 const months=Object.fromEntries(uniq(cases.map(x=>x.date.slice(0,7))).map(m=>
 [m,Object.fromEntries(METHODS.map(z=>[z,aggregate(cases.filter(x=>x.date.startsWith(m)),z)]))]));
 const matched=[];
 for(const r of cases){
  const winners=r.positives.filter(m=>m.rank>=4&&m.rank<=5&&m.hitHeads.length>0);
  for(const w of winners){
   const others=r.positives.filter(x=>x.rank!==w.rank&&!x.hitHeads.length);
   others.sort((a,b)=>Math.abs(a.values.length-w.values.length)-
    Math.abs(b.values.length-w.values.length)||a.rank-b.rank);
   matched.push({date:r.date,turn:r.turn,head:w.hitHeads,mother:w.family,
    rank:w.rank,winner:{d1:w.d1,d7:w.d7,branch:w.branch,
     blocks:w.blocks,paths:w.paths,sourceCount:w.sources,
     eligibleNumbers:w.values.length,withD1Groups:w.withD1Groups,
     withD7Groups:w.withD7Groups,winningGroups:w.winningGroups},
    nearControl:others.length?{rank:others[0].rank,family:others[0].family,
     d1:others[0].d1,d7:others[0].d7,
     branch:others[0].branch,blocks:others[0].blocks,paths:others[0].paths,
     eligibleNumbers:others[0].values.length,
     withD1Groups:others[0].withD1Groups,
     withD7Groups:others[0].withD7Groups}:null});
  }
 }
 const rankSummaries=Array.from({length:5},(_,i)=>{
  const parents=cases.map(x=>x.positives[i]);
  const winnerCases=parents.filter(z=>z.hitHeads.length>0);
  return {rank:i+1,cuts:115,winningCuts:winnerCases.length,
   winningHeads:parents.reduce((s,x)=>s+x.hitHeads.length,0),
   meanExactNumbers:avg(parents.map(x=>x.values.length)),
   winnersWithD1:winnerCases.filter(x=>x.d1>0).length,
   winnersWithD7:winnerCases.filter(x=>x.d7>0).length,
   winnersWithBoth:winnerCases.filter(x=>x.d1>0&&x.d7>0).length,
   allMothersWithD1:parents.filter(x=>x.d1>0).length,
   allMothersWithD7:parents.filter(x=>x.d7>0).length,
   allMothersWithBoth:parents.filter(x=>x.d1>0&&x.d7>0).length};
 });
 const report={date:'2026-10-13',scope:'Diagnóstico retrospectivo con PRE sellados',
 cuts:115,heads:575,all,months,rankSummaries,matched,integrity:seal,
 warning:'Criterios fijados luego de múltiples análisis de las mismas 115 muestras. No es pronóstico nuevo; cobertura con dos madres no equivale a diez agrupaciones VT4.'};
 write('POST_115.json',{cases});
 write('RESUMEN.json',report);
 const lines=METHODS.map(method=>{
  const s=all[method];return '| '+method+' | '+s.meanEligibleNumbers+
   ' | '+s.heads+' / '+s.expectedHeads+' | '+s.hitsInCuts+
   ' | '+s.pAdjustedBonferroni.toFixed(4)+' |';
 }).join('\n');
 const md='# Comparación ciega de madres VT3 #4/#5\n\n'+
 'Se cruzaron tres fuentes PRE ya selladas. El nuevo cálculo de exposición reproduce el mapa físico sellado por rango materno. Ningún Top de la aplicación fue cambiado.\n\n'+
 '| Dos madres elegidas por | Cuaternas físicas medias por turno | Cabezas exactas observadas / referencia | Cortes con coincidencia | p bilateral ajustado (10 métodos) |\n'+
 '|---|---:|---:|---:|---:|\n'+lines+'\n\n'+
 '## Casos 4/5 vs madre negativa con exposición más parecida\n'+
 matched.map(x=>'- '+x.date+' '+x.turn+': '+x.head.join(',')+
 ' ← #'+x.rank+' '+x.mother+', D−1='+x.winner.d1+', D−7='+x.winner.d7+
 ', bloques='+x.winner.blocks+', bolsa='+x.winner.eligibleNumbers+
 '; control #'+(x.nearControl?.rank??'sin')+
 ' bolsa='+ (x.nearControl?.eligibleNumbers??'NA')).join('\n')+
 '\n\n**Distinción crucial:** aquí se evalúa la elegibilidad de **todas** las hijas físicas de dos madres, no diez selecciones VT4. Los p-valores son descriptivos post hoc, con exploración previa reiterada, no una ventaja demostrada. Consultar RESUMEN.json para meses y señales detalladas.\n';
 writeFileSync(OUT+'LECTURA.md',md);
 console.log('VT3_MADRES_45_POST_OK',JSON.stringify({
  all:Object.fromEntries(METHODS.map(m=>[m,{obs:all[m].heads,exp:all[m].expectedHeads,
   cuts:all[m].hitsInCuts,meanPool:all[m].meanEligibleNumbers,
   pAdj:all[m].pAdjustedBonferroni}])),
  rankSummaries,matched:matched.map(x=>({cut:x.date+' '+x.turn,head:x.head,
   rank:x.rank,d1:x.winner.d1,d7:x.winner.d7,
   controlRank:x.nearControl?.rank,controlD1:x.nearControl?.d1,
   controlD7:x.nearControl?.d7})),
  byMonth:Object.fromEntries(Object.entries(months).map(([m,x])=>[m,
   {base:x.BASE_1_2.heads,rank45:x.PUESTOS_4_5.heads,d1:x.D1_PROPIA.heads,d7:x.D7_PROPIA.heads}]))
 },null,2));
}
const mode=process.argv[2];
if(mode==='pre')pre();
else if(mode==='post')post();
else throw Error('Usage: pre|post');
