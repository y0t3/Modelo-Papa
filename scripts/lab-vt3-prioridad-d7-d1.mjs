import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const SOURCE='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const LIVE='auditorias/vt3-cotejo-nocturna-13oct2026/';
const OUT='auditorias/vt3-prioridad-d7-contra-d1-120-14oct2026/';
const PROTO='PROTOCOLO_VT3_PRIORIDAD_D7_D1_14OCT2026.md';
const SCRIPT='scripts/lab-vt3-prioridad-d7-d1.mjs';
const SOURCE_SHA='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const METHODS=['OFICIAL','D7_ANTES_D1','D7_SOLO_RANGO3','D7_SOLO_RANGO10','D1_SOLO_RANGO10',
 'HASH_D7_RANGO3','HASH_D7_RANGO10'];
const CLASSES=['D7_SOLO','D1_SOLO','AMBAS','NINGUNA'];
const read=p=>readFileSync(p,'utf8'),J=p=>JSON.parse(read(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(n,x)=>writeFileSync(OUT+n,JSON.stringify(x,null,2)+'\n');
const uniq=x=>[...new Set(x)],name=x=>x.date+'|'+x.turn;
const rev=t=>[...t].reverse().join(''),family=s=>[s,rev(s)].sort().join('/');
const target=h=>{assert.match(h,/^\d{4}$/);return family(h.slice(-3));};
const asValues=f=>uniq(f.split('/'));
const klass=x=>x.d1>0&&x.d7>0?'AMBAS':x.d7>0?'D7_SOLO':x.d1>0?'D1_SOLO':'NINGUNA';
const tuple=x=>[Number(x.bif>0),Math.min(x.bif,15),Math.min(x.d7,10),
 Math.min(x.d1,10),x.sources,x.blocks];
function cmp(a,b){const ta=tuple(a),tb=tuple(b);for(let i=0;i<ta.length;i++)
 if(ta[i]!==tb[i])return tb[i]-ta[i];return a.family.localeCompare(b.family);}
function prefer(x,y){return Number(y.bif>0)-Number(x.bif>0)||y.bif-x.bif||
 y.d7-x.d7||y.sources-x.sources||y.blocks-x.blocks||x.rank-y.rank;}
function preferD1(x,y){return Number(y.bif>0)-Number(x.bif>0)||y.bif-x.bif||
 y.d1-x.d1||y.sources-x.sources||y.blocks-x.blocks||x.rank-y.rank;}
function xorshift(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296}}
function putThird(list,f){
 if(!f)return [...list];
 assert.ok(list.includes(f));
 const out=[...list.slice(0,2),f,...list.slice(2).filter(x=>x!==f)];
 assert.deepEqual(out.slice().sort(),list.slice().sort());
 return out;
}
function putTenth(list,f){
 if(!f)return [...list];
 assert.ok(!list.includes(f));
 const out=[...list.slice(0,9),f];
 assert.equal(uniq(out).length,10);
 return out;
}
mkdirSync(OUT,{recursive:true});
function buildRow(date,turn,raw,kind){
 let profiles=[];
 if(kind==='HISTORICAL'){
  assert.ok(raw.strategies.A_ORIGINAL.length>=30);
  profiles=raw.strategies.A_ORIGINAL.map(f=>({family:f.family,rank:f.rank,
   d1:f.d1,d7:f.d7,bif:f.bif,sources:f.sources,blocks:f.blocks,paths:f.paths}));
  const physical=new Set(raw.witnesses.map(x=>x.family));
  assert.equal(physical.size,raw.witnesses.length);
  for(const x of profiles)assert.ok(physical.has(x.family),'Anclada inexistente fisicamente '+x.family);
  assert.deepEqual(profiles.slice(0,10).map(x=>x.family),
   raw.strategies.A_ORIGINAL.slice(0,10).map(x=>x.family));
 }else{
  assert.ok(raw.ranks.length>=30);
  profiles=raw.ranks.map(f=>({family:f.family,rank:f.rank,
   d1:f.d1,d7:f.d7,bif:f.branchBlocks,sources:f.sources,
   blocks:f.physicalBlocks,paths:f.paths}));
 }
 assert.ok(profiles.every((x,i)=>x.rank===i+1));
 const official=profiles.slice(0,10).map(x=>x.family);
 const full=profiles.slice().sort(cmp);
 const d7=full.map(x=>x.family);
 assert.deepEqual(full.slice().sort((a,b)=>a.rank-b.rank).map(x=>x.family),profiles.map(x=>x.family));
 assert.equal(uniq(official).length,10);
 const pool3=profiles.slice(2,30).filter(x=>klass(x)==='D7_SOLO');
 const pool10=profiles.slice(10,30).filter(x=>klass(x)==='D7_SOLO');
 const pool10D1=profiles.slice(10,30).filter(x=>klass(x)==='D1_SOLO');
 const best3=pool3.slice().sort(prefer)[0];
 const best10=pool10.slice().sort(prefer)[0];
 const best10D1=pool10D1.slice().sort(preferD1)[0];
 const hashChoice=(set,salt)=>set.slice().sort((a,b)=>
  sha('20261014|'+salt+'|'+date+'|'+turn+'|'+a.family)
   .localeCompare(sha('20261014|'+salt+'|'+date+'|'+turn+'|'+b.family)))[0];
 const strategies={
  OFICIAL:official,
  D7_ANTES_D1:d7.slice(0,10),
  D7_SOLO_RANGO3:putThird(official,best3?.family),
  D7_SOLO_RANGO10:putTenth(official,best10?.family),
  D1_SOLO_RANGO10:putTenth(official,best10D1?.family),
  HASH_D7_RANGO3:putThird(official,hashChoice(pool3,'3')?.family),
  HASH_D7_RANGO10:putTenth(official,hashChoice(pool10,'10')?.family)
 };
 for(const [policy,names] of Object.entries(strategies)){
  assert.equal(names.length,10);
  assert.equal(uniq(names).length,10);
  for(const f of names)assert.ok(profiles.some(p=>p.family===f));
  if(policy.endsWith('RANGO3')){
   assert.deepEqual(names.slice(0,2),official.slice(0,2));
   assert.deepEqual(names.slice().sort(),official.slice().sort());
  }
  if(policy.endsWith('RANGO10'))
   assert.deepEqual(names.slice(0,9),official.slice(0,9));
 }
 const exposure=Object.fromEntries(CLASSES.map(c=>[c,{
  families:profiles.filter(x=>klass(x)===c).length,
  terminals:profiles.filter(x=>klass(x)===c).reduce((s,p)=>s+asValues(p.family).length,0),
  top10:profiles.slice(0,10).filter(x=>klass(x)===c).length
 }]));
 return {date,turn,kind,official,strategies,profiles,pool3:pool3.map(x=>x.family),
  pool10:pool10.map(x=>x.family),pool10D1:pool10D1.map(x=>x.family),
  chosen:{best3:best3?.family||null,best10:best10?.family||null,
   best10D1:best10D1?.family||null},exposure,
  d7NewRank:Object.fromEntries(profiles.slice(0,40).map(x=>[x.family,d7.indexOf(x.family)+1]))};
}
function pre(){
 for(const p of [SOURCE+'POST_115.json',SOURCE+'NOCTURNA_POST_DIAGNOSTICO.json',
  LIVE+'OBJETIVOS_POST_13OCT.json',LIVE+'POST_13OCT.json',
  LIVE+'RESUMEN.json','fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64',
  OUT+'POST_120.json'])
 assert.ok(!existsSync(p),'POST visible durante PRE: '+p);
 assert.equal(sha(read(SOURCE+'PRE_115.json')),SOURCE_SHA);
 const h=J(SOURCE+'PRE_115.json').rows,l=J(LIVE+'PRE_13OCT.json').rows;
 assert.equal(h.length,115);assert.equal(l.length,5);
 const rows=h.map(r=>buildRow(r.date,r.turn,r,'HISTORICAL'))
  .concat(l.map(r=>buildRow(r.date,r.turn,r,'13OCT')));
 assert.equal(rows.length,120);
 assert.equal(uniq(rows.map(name)).length,120);
 const rng=xorshift(20261014);
 const neutral=Array.from({length:2000},()=>
  Buffer.from(rows.flatMap(r=>{
   const a=r.pool3.length?Math.floor(rng()*r.pool3.length):255;
   const b=r.pool10.length?Math.floor(rng()*r.pool10.length):255;
   return [a,b];
  })).toString('base64'));
 save('PRE_120.json',{date:'2026-10-14',rows,classes:CLASSES,methods:METHODS,
  note:'Admisión físicamente anclada intacta; 13oct y 115 son retroanálisis'});
 save('NEUTRAL_PRE_2000.json',{encoding:'base64(uint8[240])',repetitions:2000,
  candidates:'pool3, pool10 sorted by original VT3 ranking',values:neutral});
 save('SELLO.json',{source:SOURCE_SHA,livePre:sha(read(LIVE+'PRE_13OCT.json')),
  protocol:sha(read(PROTO)),script:sha(read(SCRIPT)),
  pre:sha(read(OUT+'PRE_120.json')),neutral:sha(read(OUT+'NEUTRAL_PRE_2000.json'))});
 console.log('PRE_VT3_D7D1_OK',JSON.stringify({cuts:rows.length,
  pool3Cuts:rows.filter(r=>r.pool3.length).length,
  pool10Cuts:rows.filter(r=>r.pool10.length).length,
  d7Only:rows.reduce((s,r)=>s+r.exposure.D7_SOLO.families,0),
  seals:J(OUT+'SELLO.json')},null,2));
}
function post(){
 const seal=J(OUT+'SELLO.json');
 for(const [p,s] of [[SOURCE+'PRE_115.json',seal.source],
  [LIVE+'PRE_13OCT.json',seal.livePre],[PROTO,seal.protocol],[SCRIPT,seal.script],
  [OUT+'PRE_120.json',seal.pre],[OUT+'NEUTRAL_PRE_2000.json',seal.neutral]])
 assert.equal(sha(read(p)),s,'Sello modificado '+p);
 const pre=J(OUT+'PRE_120.json').rows;
 const h=J(SOURCE+'POST_115.json').rows,l=J(LIVE+'OBJETIVOS_POST_13OCT.json');
 assert.equal(h.length,115);assert.equal(l.date,'2026-10-13');
 const neutral=J(OUT+'NEUTRAL_PRE_2000.json').values;
 assert.equal(neutral.length,2000);
 const outcomes=pre.map((r,i)=>{
  const heads=i<115?h[i].targets:l.turns[r.turn];
  if(i<115)assert.equal(name(r),name(h[i]));
  assert.equal(heads.length,5);
  const win=new Set(heads.map(target));
  const method={};
  for(const m of METHODS){
   const list=r.strategies[m];
   method[m]={top3:list.slice(0,3).some(f=>win.has(f)),
    top5:list.slice(0,5).some(f=>win.has(f)),
    top10:list.some(f=>win.has(f)),
    hits:list.filter(f=>win.has(f)),
    third:list[2],tenth:list[9]};
  }
  const classes=Object.fromEntries(CLASSES.map(k=>[k,{
   observedHeads:heads.filter(x=>r.profiles.some(p=>p.family===target(x)&&klass(p)===k)).length,
   winnerFamilies:r.profiles.filter(p=>klass(p)===k&&win.has(p.family)).map(x=>({family:x.family,rank:x.rank})),
   expectedHeads:5*r.exposure[k].terminals/1000
  }]));
  return {date:r.date,turn:r.turn,kind:r.kind,heads,winnerFamilies:[...win],
   methods:method,classes};
 });
 const score=(cuts)=>Object.fromEntries(METHODS.map(m=>[m,{
  cuts:cuts.length,top3:cuts.filter(o=>o.methods[m].top3).length,
  top5:cuts.filter(o=>o.methods[m].top5).length,
  top10:cuts.filter(o=>o.methods[m].top10).length,
  gained3:cuts.filter(o=>o.methods[m].top3&&!o.methods.OFICIAL.top3).map(name),
  lost3:cuts.filter(o=>!o.methods[m].top3&&o.methods.OFICIAL.top3).map(name),
  gained10:cuts.filter(o=>o.methods[m].top10&&!o.methods.OFICIAL.top10).map(name),
  lost10:cuts.filter(o=>!o.methods[m].top10&&o.methods.OFICIAL.top10).map(name)
 }]));
 const all=score(outcomes),historical=score(outcomes.slice(0,115)),case13=score(outcomes.slice(115));
 assert.deepEqual([historical.OFICIAL.top3,historical.OFICIAL.top5,historical.OFICIAL.top10],[5,8,15]);
 assert.deepEqual([case13.OFICIAL.top3,case13.OFICIAL.top5,case13.OFICIAL.top10],[0,1,1]);
 const neutralScores=[];
 for(const enc of neutral){
  const values=[...Buffer.from(enc,'base64')];assert.equal(values.length,240);
  const sums=[0,0,0,0]; // top3 and top10 total, historical
  for(let i=0;i<120;i++){
   const r=pre[i],o=outcomes[i],win=new Set(o.winnerFamilies);
   const a=values[2*i],b=values[2*i+1];
   const sel3=a===255?null:r.pool3[a],sel10=b===255?null:r.pool10[b];
   if(sel3!==null)assert.ok(r.pool3.includes(sel3));
   if(sel10!==null)assert.ok(r.pool10.includes(sel10));
   const original=r.official;
   const top3=[...original.slice(0,2),sel3||original[2]].some(f=>win.has(f));
   const top10=[...original.slice(0,9),sel10||original[9]].some(f=>win.has(f));
   sums[0]+=Number(top3);sums[1]+=Number(top10);
   if(i<115){sums[2]+=Number(top3);sums[3]+=Number(top10)}
  }
  neutralScores.push(sums);
 }
 const dist=(index,real)=>{
  const scores=neutralScores.map(x=>x[index]).sort((a,b)=>a-b);
  return {reps:scores.length,mean:scores.reduce((s,v)=>s+v,0)/scores.length,
   min:scores[0],p05:scores[99],median:scores[999],p95:scores[1899],max:scores.at(-1),
   observed:real,tailAtLeast:(scores.filter(x=>x>=real).length+1)/(scores.length+1),
   counts:Object.fromEntries(uniq(scores).map(v=>[v,scores.filter(x=>x===v).length]))};
 };
 const controls={
  d7Third120:dist(0,all.D7_SOLO_RANGO3.top3),
  d7Tenth120:dist(1,all.D7_SOLO_RANGO10.top10),
  d7Third115:dist(2,historical.D7_SOLO_RANGO3.top3),
  d7Tenth115:dist(3,historical.D7_SOLO_RANGO10.top10)
 };
 const cls=Object.fromEntries(CLASSES.map(k=>{
  const obs=outcomes.reduce((s,o)=>s+o.classes[k].observedHeads,0);
  const exp=outcomes.reduce((s,o)=>s+o.classes[k].expectedHeads,0);
  return [k,{observed:obs,expected:Number(exp.toFixed(3)),
   winnerFamilies:outcomes.reduce((s,o)=>s+o.classes[k].winnerFamilies.length,0),
   meanFamilies:pre.reduce((s,r)=>s+r.exposure[k].families,0)/120,
   meanTerminals:pre.reduce((s,r)=>s+r.exposure[k].terminals,0)/120}];
 }));
 const noct=pre.find(r=>r.date==='2026-10-13'&&r.turn==='Nocturno');
 const noctOutcome=outcomes.find(r=>r.date==='2026-10-13'&&r.turn==='Nocturno');
 const focal=noct.profiles.find(p=>p.family==='234/432');
 assert.equal(focal?.rank,21);
 assert.equal(klass(focal),'D7_SOLO');
 assert.ok(noctOutcome.heads.includes('1234'));
 const casebook={head:'1234',date:'2026-10-13',turn:'Nocturno',family:focal.family,
  officialRank:focal.rank,roots:{d1:focal.d1,d7:focal.d7},
  d7FirstRank:noct.d7NewRank[focal.family],
  pool3:nocT(noct.pool3),pool10:nocT(noct.pool10),
  chosen:noct.chosen,
  originalTop10:noct.official,orderingD7:noct.strategies.D7_ANTES_D1.slice(0,10),
  vt3WinByMethod:Object.fromEntries(METHODS.map(m=>[m,
   noct.strategies[m].indexOf(focal.family)<0?null:noct.strategies[m].indexOf(focal.family)+1])),
  note:'Se conoce la cabeza al diseñar esta prueba; describir sólo, nunca usar como evidencia externa.'
 };
 function nocT(pool){return {size:pool.length,first12:pool.slice(0,12)}}
 const byMonth=Object.fromEntries(['2026-09','2026-10'].map(m=>[m,score(outcomes.filter(o=>o.date.startsWith(m)&&o.kind==='HISTORICAL'))]));
 const byTurn=Object.fromEntries(TURNS.map(t=>[t,score(outcomes.filter(o=>o.turn===t&&o.kind==='HISTORICAL'))]));
 const summary={date:'2026-10-14',cuts:120,historical:115,case13Cuts:5,
  metrics:{all,historical,case13},cls,controls,casebook,byMonth,byTurn,seal,
  warning:'Investigación post hoc. Exposición uniformemente aleatoria es referencia descriptiva, no validación externa. Todos los rankings de raíz admitida, sin nuevas rutas ni préstamos.'};
 save('POST_120.json',{outcomes});
 save('RESUMEN.json',summary);
 const mRows=METHODS.map(m=>{
  const a=historical[m],b=case13[m];
  return '| '+m+' | '+a.top3+' | '+a.top5+' | '+a.top10+
   ' | '+b.top3+' | '+b.top5+' | '+b.top10+' |';
 }).join('\n');
 const classes=CLASSES.map(k=>{
  const x=cls[k];return '| '+k+' | '+x.meanFamilies.toFixed(1)+
   ' | '+x.observed+' | '+x.expected.toFixed(2)+' |';
 }).join('\n');
 const md='# Arbitraje de raíces VT3 D−7 frente a D−1\n\n**Estudio retrospectivo**, fuente original PRE sellada y resultados ocultos en fase PRE del laboratorio. Motor principal intacto.\n\n'+
 '| Método | Hist. Top3 | Hist. Top5 | Hist. Top10 | 13/10 Top3 | 13/10 Top5 | 13/10 Top10 |\n|---|---:|---:|---:|---:|---:|---:|\n'+mRows+
 '\n\n| Tipo de raíz propia | Familias medias por corte | Cabezas observadas | Esperadas por exposición bajo uniforme |\n|---|---:|---:|---:|\n'+classes+
 '\n\n## Nocturna 13/10 y \`1234\`\n'+
 'Familia \`234/432\`, puesto oficial #21. Nuevo rango D7-primero: **#'+
 casebook.d7FirstRank+'**. Bolsa elegible D7-solo #3–30: **'+casebook.pool3.size+
 '**; bolsa #11–30: **'+casebook.pool10.size+
 '**. La política de abrir sólo una plaza final eligió \`'+
 (casebook.chosen.best10||'ninguna')+'\`; fue seleccionada la ganadora: **'+
 String(casebook.chosen.best10===focal.family)+'**.\n\n'+
 '## Controles neutrales PRE\n'+
 'Tercera plaza D7-solo en 115: '+JSON.stringify(controls.d7Third115)+
 '\n\nDécima plaza D7-solo en 115: '+JSON.stringify(controls.d7Tenth115)+
 '\n\nLos 115 cortes ya estaban explorados y la política surgió tras 13/10. Aunque una variante mejore, no demuestra pronóstico. La selección entre candidatos equivalentes debe validarse en sorteos nuevos auténticamente sellados.\n';
 writeFileSync(OUT+'LECTURA.md',md);
 console.log('POST_VT3_D7D1_OK',JSON.stringify({
  historical,case13,cls,controls:Object.fromEntries(Object.entries(controls).map(([k,v])=>[k,{
   mean:v.mean,p95:v.p95,tail:v.tailAtLeastObserved,obs:v.observed}])),casebook},null,2));
}
if(process.argv[2]==='pre')pre();else if(process.argv[2]==='post')post();else throw Error('Use pre|post');
