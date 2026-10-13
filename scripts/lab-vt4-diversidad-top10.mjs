import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync,renameSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';

const OUT='auditorias/vt4-diversidad-madres-top10-115-13oct2026/';
const INPUT=OUT+'INPUT_PRE_115.json',GOALS=OUT+'OBJETIVOS_POST_115.json';
const FILE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const FULL_RAW_SHA='7e393c54b073cae83ae972b8511e533b61fbc087fe574a8dde84ae9100530217';
const PROTOCOL='PROTOCOLO_VT4_DIVERSIDAD_MADRES_TOP10_13OCT2026.md';
const KINDS=['ORIGINAL_CORREGIDO','UNICO_NUMERO','CUPO_1','CUPO_2','CUPO_3','RONDA_MADRES','BASE_NEUTRAL'];
const TURNOS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const JURS=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const sha=s=>createHash('sha256').update(s).digest('hex');
const read=f=>readFileSync(f,'utf8'),json=f=>JSON.parse(read(f));
const save=(name,value)=>writeFileSync(OUT+name,JSON.stringify(value,null,2)+'\n');
const key=r=>r.date+'|'+r.turn;
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
const rng=seed=>{let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296}};
mkdirSync(OUT,{recursive:true});
const runtime='resultados/runtime-vt4-diversidad';
for(const name of ['domain','dates','paths','sheet','motorLalo']){
 const dest=resolve(runtime,name+'.mjs');mkdirSync(dirname(dest),{recursive:true});
 const js=stripTypeScriptTypes(read('src/'+name+'.ts')).replace(/from '(\.{1,2}\/[^']+)'/g,(_,p)=>"from '"+p+".mjs'");
 writeFileSync(dest,js);
}
const fromRuntime=async k=>import(pathToFileURL(resolve(runtime,k+'.mjs')).href);
const {buildMotorLalo}=await fromRuntime('motorLalo');
const {buildSheet}=await fromRuntime('sheet');
const {diaVacio}=await fromRuntime('domain');
const {shiftDay}=await fromRuntime('dates');

const is4=v=>/^\d{4}$/.test(v);
const family=string=>string;
function draw(raw,date){
 const vals=raw[date];assert.ok(vals,'Falta fecha '+date);
 const day=diaVacio();
 TURNOS.forEach((t,i)=>JURS.forEach((j,k)=>{day[t][j]=vals[i][k]}));
 return day;
}
function prepare(){
 assert.ok(existsSync(FILE));
 const decoded=gunzipSync(Buffer.from(read(FILE).trim(),'base64'));
 assert.equal(sha(decoded),FULL_RAW_SHA);
 const raw=JSON.parse(decoded.toString('utf8'));
 const days=Object.keys(raw).sort();
 assert.equal(days.length,30);
 const evaluation=days.filter(d=>d>='2026-09-15');
 assert.equal(evaluation.length,23);
 const entries=[],goals=[];
 for(const date of evaluation){
  const earlier=days.filter(d=>d<date);
  const d1=earlier.at(-1),d2=earlier.at(-2),d7=shiftDay(date,-7);
  assert.ok(d1&&d2);
  const trueDay=draw(raw,date);
  const history=[{date:d1,period:'D−1',sheet:buildSheet(draw(raw,d1),draw(raw,d2))}];
  if(raw[d7]){
   const idx=days.indexOf(d7),prevWeek=days[idx-1];
   assert.ok(prevWeek);
   history.push({date:d7,period:'D−7',sheet:buildSheet(draw(raw,d7),draw(raw,prevWeek))});
  }
  for(let ti=0;ti<TURNOS.length;ti++){
   const turn=TURNOS[ti];
   const past=draw(raw,date);
   for(const t of TURNOS.slice(ti))for(const jur of JURS)past[t][jur]='----';
   const current=buildSheet(past,draw(raw,d1));
   assert.equal(current.heads[turn].length,0);
   assert.ok(current.columns.slice(ti+1).every(c=>c.values.every(v=>v==='--')));
   entries.push({date,turn,current,history});
   goals.push({date,turn,heads:JURS.slice(0,5).map(j=>trueDay[turn][j])});
  }
 }
 assert.equal(entries.length,115);assert.equal(goals.length,115);
 save('INPUT_PRE_115.json',{rows:entries,sourceSHA:FULL_RAW_SHA,
  note:'Cada actual y los turnos siguientes están en ----, historial sólo fechas anteriores.'});
 save('OBJETIVOS_POST_115.json',{rows:goals,note:'Inaccesible físicamente durante pre.'});
 console.log('VT4_DIVERSIDAD_PREPARE_OK',entries.length,goals.length);
}
// A "group" is a mother VT3 + added digit + extension side; its printed
// two-member label is theoretical, and only physical route.value is admitted.
function groupsOf(view){
 const v=view.ranks.vt4;
 const motherRanks=new Map(view.ranks.vt3.map(x=>[x.family,x.rank]));
 assert.ok(view.ranks.vt3.length>=10);
 return v.map(g=>{
  const members=[...new Set(g.paths.map(p=>p.value))].sort();
  assert.ok(members.every(is4));
  assert.ok(members.length>=1);
  assert.ok(g.parentFamilies.length>0);
  assert.ok(g.parentFamilies.every(m=>motherRanks.has(m)&&motherRanks.get(m)<=10));
  const mother=g.parentFamilies.slice().sort((a,b)=>(motherRanks.get(a)-motherRanks.get(b))||a.localeCompare(b))[0];
  const motherRank=motherRanks.get(mother);
  // Las etiquetas pueden coincidir (p. ej. 4444): cada grupo se identifica por su rango y madre física.
  for(const p of g.paths){
   assert.ok(p.mothers?.includes(mother));
   assert.equal(p.path.length,4);
   assert.equal(new Set(p.path.map(x=>x.row+':'+x.col)).size,4);
   for(let k=1;k<4;k++)assert.equal(Math.max(
    Math.abs(p.path[k].row-p.path[k-1].row),
    Math.abs(p.path[k].col-p.path[k-1].col)),1);
   assert.equal(p.path.map(c=>c.digit).join(''),p.value);
  }
  return {
   family:g.family,orderRank:g.rank,values:members,
   mother, motherRank,allMothers:g.parentFamilies,
   paths:g.paths.length,sourceCount:g.sourceCount,
   physicalBlocks:g.physicalBlocks
  };
 });
}
function choose(all,method,seed){
 assert.ok(all.length>=10);
 const selected=[],usedValues=new Set(),usedGroups=new Set(),motherCount=new Map();
 const pool=method==='BASE_NEUTRAL'?[...all].sort((a,b)=>{
  const aHash=sha(seed+'|'+a.family),bHash=sha(seed+'|'+b.family);
  return aHash.localeCompare(bHash)||a.orderRank-b.orderRank
 }):all;
 const canUse=g=>!usedGroups.has(g.orderRank)&&!g.values.some(v=>usedValues.has(v));
 function add(g){
  assert.ok(canUse(g));
  selected.push(g);
  usedGroups.add(g.orderRank);
  for(const value of g.values)usedValues.add(value);
  motherCount.set(g.mother,1+(motherCount.get(g.mother)||0));
 }
 if(method==='ORIGINAL_CORREGIDO')return {
  picks:all.slice(0,10),
  collisions:10-[...new Set(all.slice(0,10).flatMap(g=>g.values))].length,
  backfill:0,representedValues:[...new Set(all.slice(0,10).flatMap(g=>g.values))]
 };
 if(/^CUPO_[123]$/.test(method)){
  const cap=Number(method.at(-1));
  for(const g of all)if(selected.length<10&&canUse(g)&&(motherCount.get(g.mother)||0)<cap)add(g);
  const protectedCount=selected.length;
  for(const g of all)if(selected.length<10&&canUse(g))add(g);
  assert.equal(selected.length,10);
  return {picks:selected,collisions:0,backfill:10-protectedCount,representedValues:[...usedValues]};
 }
 if(method==='RONDA_MADRES'){
  for(let i=1;i<=10&&selected.length<10;i++){
   for(let motherRank=1;motherRank<=10&&selected.length<10;motherRank++){
    const g=all.find(g=>g.motherRank===motherRank&&canUse(g)&&(motherCount.get(g.mother)||0)<i);
    if(g)add(g);
   }
  }
  for(const g of all)if(selected.length<10&&canUse(g))add(g);
 }else{
  for(const g of pool)if(selected.length<10&&canUse(g))add(g);
 }
 assert.equal(selected.length,10,'Bolsas VT4 insuficientes para diez hijas numéricamente no repetidas');
 return {picks:selected,collisions:0,backfill:0,representedValues:[...usedValues]};
}
function describe(row,picks,goals){
 const list=picks.picks;
 assert.equal(list.length,10);
 const hit=(n)=>list.slice(0,n).some(x=>x.values.some(v=>goals.includes(v)));
 return {top3:hit(3),top5:hit(5),top10:hit(10),
  thirdValues:list.slice(0,3).flatMap(x=>x.values),
  top10Values:list.flatMap(x=>x.values),
  uniqueMothers:new Set(list.map(x=>x.mother)).size,
  unique4:new Set(list.flatMap(x=>x.values)).size,
  mothers:list.map(x=>x.motherRank),
  first3:list.slice(0,3).map(x=>x.family),
  changedAgainstCorrected:list.map(x=>x.family).join('|')!==
   row[0].family+ '|' +row.slice(1,10).map(x=>x.family).join('|'),
  backfill:picks.backfill,
  duplicateGroupsByValue:list.length===new Set(list.flatMap(x=>x.values)).size?0:
   list.reduce((n,x)=>n+x.values.length,0)-new Set(list.flatMap(x=>x.values)).size
 };
}
function pre(){
 assert.ok(!existsSync(GOALS),'POST accesible durante PRE');
 assert.ok(!existsSync(FILE),'Fixture con cabezas futuras accesible durante PRE');
 const ins=json(INPUT).rows;
 assert.equal(ins.length,115);
 const rows=[];let pathSeen=0;
 for(const [i,r] of ins.entries()){
  const ti=TURNOS.indexOf(r.turn);assert.ok(ti>=0);
  assert.ok(r.history.every(x=>x.date<r.date));
  assert.equal(r.current.heads[r.turn].length,0);
  assert.ok(r.current.columns.slice(ti+1).every(c=>c.values.every(v=>v==='--')));
  const model=buildMotorLalo(r.current,r.date,r.turn,r.history);
  const all=groupsOf(model);assert.ok(all.length>=10);
  pathSeen+=all.reduce((s,x)=>s+x.paths,0);
  const choices=Object.fromEntries(KINDS.map(k=>[k,choose(all,k,'20261013|'+key(r))]));
  const rankTop=model.ranks.vt4.slice(0,10).map(x=>x.family);
  assert.deepEqual(choices.ORIGINAL_CORREGIDO.picks.map(x=>x.family),rankTop);
  const record={date:r.date,turn:r.turn,i,availableGroups:all.length,
   mothersAvailable:new Set(all.map(x=>x.mother)).size,
   baselineOriginalTop:rankTop,
   options:Object.fromEntries(KINDS.map(k=>[k,{
    ranked:choices[k].picks.map(x=>({
     family:x.family,values:x.values,
     mother:x.mother,motherRank:x.motherRank,
     physicalPathCount:x.paths,sources:x.sourceCount,physicalBlocks:x.physicalBlocks
    })),
    extraSlotsToBackfill:choices[k].backfill,
    exactDistinct4:new Set(choices[k].picks.flatMap(x=>x.values)).size,
    distinctMothers:new Set(choices[k].picks.map(x=>x.mother)).size,
    repeatedValues:choices[k].picks.reduce((n,x)=>n+x.values.length,0)-
      new Set(choices[k].picks.flatMap(x=>x.values)).size
   }]))};
  for(const kind of KINDS)assert.equal(record.options[kind].ranked.length,10);
  rows.push(record);
  if(i%25===24)console.log('VT4_DIV_PRE_CUTS',i+1);
 }
 assert.equal(rows.length,115);
 save('PRE_115.json',{date:'2026-10-13',cuts:115,rows,
  note:'Ranking VT4 madre orientada, diez plazas por método, sin lectura de objetivos.'});
 save('SELLO.json',{date:'2026-10-13',engine:sha(read('src/motorLalo.ts')),
  script:sha(read('scripts/lab-vt4-diversidad-top10.mjs')),
  protocol:sha(read(PROTOCOL)),source:sha(read(INPUT)),
  pre:sha(read(OUT+'PRE_115.json')),totalPathsScanned:pathSeen});
 console.log('VT4_DIV_PRE_OK',JSON.stringify({cuts:115,pathSeen,seal:json(OUT+'SELLO.json')}));
}
function scored(cuts,name){
 const subset=cuts.map(x=>x.methods[name]);
 return {cuts:cuts.length,top3:subset.filter(x=>x.top3).length,
  top5:subset.filter(x=>x.top5).length,top10:subset.filter(x=>x.top10).length,
  meanMothers:Number(mean(subset.map(x=>x.mothers)).toFixed(3)),
  meanDistinctFour:Number(mean(subset.map(x=>x.distinctFour)).toFixed(3)),
  meanOverflow:Number(mean(subset.map(x=>x.backfill)).toFixed(3)),
  recoveredTop10:cuts.filter(x=>x.methods[name].top10&&!x.methods.ORIGINAL_CORREGIDO.top10).map(key),
  lostTop10:cuts.filter(x=>!x.methods[name].top10&&x.methods.ORIGINAL_CORREGIDO.top10).map(key),
  recoveredTop3:cuts.filter(x=>x.methods[name].top3&&!x.methods.ORIGINAL_CORREGIDO.top3).map(key),
  lostTop3:cuts.filter(x=>!x.methods[name].top3&&x.methods.ORIGINAL_CORREGIDO.top3).map(key)};
}
function post(){
 const seal=json(OUT+'SELLO.json');
 for(const [file,digest] of [['src/motorLalo.ts',seal.engine],['scripts/lab-vt4-diversidad-top10.mjs',seal.script],
  [PROTOCOL,seal.protocol],[INPUT,seal.source],[OUT+'PRE_115.json',seal.pre]])
  assert.equal(sha(read(file)),digest,'PRE modificado: '+file);
 const preRows=json(OUT+'PRE_115.json').rows,outcome=json(GOALS).rows;
 assert.equal(outcome.length,115);assert.equal(preRows.length,115);
 const results=preRows.map((r,i)=>{
  const target=outcome[i];
  assert.equal(key(target),key(r));
  assert.ok(target.heads.length===5&&target.heads.every(is4));
  const map=Object.fromEntries(KINDS.map(k=>{
   const p=r.options[k],groups=p.ranked;
   const hit=n=>groups.slice(0,n).some(x=>x.values.some(v=>target.heads.includes(v)));
   return [k,{
    top3:hit(3),top5:hit(5),top10:hit(10),
    mothers:p.distinctMothers,distinctFour:p.exactDistinct4,
    backfill:p.extraSlotsToBackfill,
    top10Groups:groups.map(x=>x.family),
    matched:groups.filter(x=>x.values.some(v=>target.heads.includes(v))).map(x=>({
     family:x.family,rank:groups.indexOf(x)+1,heads:x.values.filter(v=>target.heads.includes(v)),mother:x.mother
    }))
   }];
  }));
  return {date:r.date,turn:r.turn,heads:target.heads,methods:map};
 });
 const total=Object.fromEntries(KINDS.map(k=>[k,scored(results,k)]));
 const byTurn=Object.fromEntries(TURNOS.map(t=>[t,Object.fromEntries(KINDS.map(k=>[k,scored(results.filter(x=>x.turn===t),k)]))]));
 const byWeek=Object.fromEntries([...new Set(results.map(x=>x.date.slice(0,8)+String(Math.floor((Number(x.date.slice(-2))-1)/7))))].map(week=>{
   const cuts=results.filter(x=>x.date.slice(0,8)+String(Math.floor((Number(x.date.slice(-2))-1)/7))===week);
   return [week,Object.fromEntries(KINDS.map(k=>[k,scored(cuts,k)]))];
 }));
 const momHistogram=Object.fromEntries(KINDS.map(k=>[k,
  Object.fromEntries([1,2,3,4,5,6,7,8,9,10].map(m=>[m,
   preRows.reduce((n,r)=>n+r.options[k].ranked.filter(x=>x.motherRank===m).length,0)
  ]))]));
 const comparison=results.map(x=>({
  date:x.date,turn:x.turn,
  groupedWins:Object.fromEntries(KINDS.map(k=>[k,x.methods[k].matched])),
  policies:Object.fromEntries(KINDS.map(k=>[k,{
   top3:x.methods[k].top3,top5:x.methods[k].top5,top10:x.methods[k].top10,
   mothers:x.methods[k].mothers,distinctFour:x.methods[k].distinctFour
  }]))
 }));
 save('POST_115.json',{rows:comparison});
 save('RESUMEN.json',{
  date:'2026-10-13',cuts:115,methodNames:KINDS,total,byTurn,byWeek,
  motherPlaceHistogram:momHistogram,
  preSha:seal.pre,
  disclaimer:'La muestra histórica ya se reutilizó muchas veces. No hay señal predictiva validada por estos resultados retrospectivos.'
 });
 console.log('VT4_DIV_POST_OK',JSON.stringify({total,domination:momHistogram},null,2));
}
const mode=process.argv[2];
if(mode==='prepare')prepare();else if(mode==='pre')pre();else if(mode==='post')post();
else throw Error('Usar prepare, pre, post');
