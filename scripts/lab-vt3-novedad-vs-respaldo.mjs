import assert from 'node:assert/strict';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const TRANS='auditorias/vt3-transiciones-individuales-115-13oct2026/';
const GEO='auditorias/vt3-geometria-completa-vs-anclada-115-14oct2026/';
const BASE='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OUT='auditorias/vt3-novedad-vs-respaldo-115-14oct2026/';
const PROTO='PROTOCOLO_VT3_NOVEDAD_VS_RESPALDO_14OCT2026.md';
const SCRIPT='scripts/lab-vt3-novedad-vs-respaldo.mjs';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const MODELS=['OFICIAL','GEOMETRIA_COMPLETA_ANTERIOR','ACUMULADO','NOVEDAD_FUENTE','NOVEDAD_RAIZ'];
const K=[3,5,10];
const text=p=>readFileSync(p,'utf8'),j=p=>JSON.parse(text(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(n,d)=>writeFileSync(OUT+n,JSON.stringify(d,null,2)+'\n');
const family=v=>[v,[...v].reverse().join('')].sort().join('/');
const label=r=>r.date+'|'+r.turn;
const isInt=n=>Number.isInteger(n)&&n>=0;
const novel=r=>r.turn!=='Previa';
function baseTuple(p){
 return [Number(p.anchored),Math.min(10,p.d1+p.d7),
  p.sourceCount,p.blockCount,p.pathCount];
}
function eventTuple(p,mode){
 const news=Number(p.newSource);
 const birth=Number(p.birth),converge=Number(p.converge);
 const anchor=Number(p.newAnchor),blocks=Number(p.newBlocks2);
 if(mode==='NOVEDAD_FUENTE')return [news,anchor,birth,converge,blocks,...baseTuple(p)];
 if(mode==='NOVEDAD_RAIZ')return [anchor,birth,converge,news,blocks,...baseTuple(p)];
 if(mode==='ACUMULADO')return baseTuple(p);
 throw Error('Método desconocido '+mode);
}
function choose(profiles,mode){
 const ordered=profiles.slice().sort((a,b)=>{
  const aa=eventTuple(a,mode),bb=eventTuple(b,mode);
  for(let i=0;i<aa.length;i++)if(aa[i]!==bb[i])return bb[i]-aa[i];
  return a.family.localeCompare(b.family);
 });
 return ordered.slice(0,10).map(p=>p.family);
}
function validateRow(row,last){
 const ti=TURNS.indexOf(row.turn);
 assert.ok(ti>=0);assert.equal(row.profiles.length>0,true);
 const m=new Map();
 let nBirth=0,nConverge=0,nStable=0,nAnch=0,nInitial=0;
 for(const p of row.profiles){
  assert.match(p.family,/^\d{3}\/\d{3}$/);
  assert.equal(family(p.family.split('/')[0]),p.family);
  assert.ok(!m.has(p.family),'Duplicated family '+label(row));
  m.set(p.family,p);
  for(const k of ['sourceCount','blockCount','pathCount','d1','d7','latestPathCount',
   'latestBlockCount','latestAnchoredPaths','latestSourcesRootIds','ageTurns'])assert.ok(isInt(p[k]),'invalid '+k);
  for(const k of ['newSource','newAnchor','birth','converge','newBlocks2','anchored','nonInitialStable'])
   assert.equal(typeof p[k],'boolean',k);
  if(ti===0){
   assert.equal(p.state,'INICIAL');
   assert.equal(p.latestPathCount,p.pathCount);
   assert.equal(p.ageTurns,0);
   assert.equal(p.birth,false);assert.equal(p.converge,false);
   assert.equal(p.nonInitialStable,false);
   nInitial++;
  }else{
   assert.equal(p.newSource,p.latestPathCount>0);
   assert.equal(p.newSource,p.birth||p.converge);
   assert.equal(p.nonInitialStable,!p.newSource);
   assert.equal(p.state,p.birth?'NACE_FISICAMENTE':p.converge?'CONVERGE_FUENTES':'YA_PRESENTE');
   if(p.birth)nBirth++;
   if(p.converge)nConverge++;
   if(p.nonInitialStable)nStable++;
   if(p.newAnchor){nAnch++;assert.ok(p.newSource&&p.anchored);}
  }
  assert.ok(p.sourceCount>=1&&p.sourceCount<=ti+1);
  assert.ok(p.blockCount>=p.sourceCount);
 }
 if(last&&last.date===row.date){
  assert.equal(ti,TURNS.indexOf(last.turn)+1);
  for(const [name,old] of last._lookup){
   const now=m.get(name);
   assert.ok(now,'presencia perdida intradía '+label(row)+' '+name);
   assert.ok(now.sourceCount>=old.sourceCount,'fuentes que desaparecen '+name);
   assert.ok(now.blockCount>=old.blockCount,'bloques que desaparecen '+name);
   assert.ok(now.pathCount>=old.pathCount,'rutas que desaparecen '+name);
   if(now.newSource)assert.ok(now.sourceCount>=old.sourceCount+1);
   else {
    assert.equal(now.sourceCount,old.sourceCount);
    assert.equal(now.blockCount,old.blockCount);
    assert.equal(now.pathCount,old.pathCount);
   }
  }
 }else assert.equal(ti,0);
 return {lookup:m,stats:{birth:nBirth,converge:nConverge,stable:nStable,
   anchoredNews:nAnch,initial:nInitial,
   familyCount:m.size}};
}
function asPRE(){
 for(const path of [BASE+'POST_115.json',BASE+'NOCTURNA_POST_DIAGNOSTICO.json',
  TRANS+'POST_115.json'])assert.ok(!existsSync(path),'POST visible durante PRE: '+path);
 const ts=j(TRANS+'SELLO.json'),gs=j(GEO+'SELLO.json');
 assert.equal(ts.pre,sha(text(TRANS+'PRE_115.json')));
 assert.equal(gs.generatedPre,sha(text(GEO+'PRE_115.json')));
 assert.equal(ts.basePre,gs.basePre);
 const original=j(TRANS+'PRE_115.json').rows,compare=j(GEO+'PRE_115.json').rows;
 assert.equal(original.length,115);assert.equal(compare.length,115);
 const rows=[];let previous=null;
 let totals={birth:0,converge:0,stable:0,anchoredNews:0,initial:0,profiles:0};
 for(let i=0;i<original.length;i++){
  const old=original[i],ref=compare[i];assert.equal(label(old),label(ref));
  const t=validateRow(old,previous);
  for(const k of ['birth','converge','stable','anchoredNews','initial'])
   totals[k]+=t.stats[k];
  totals.profiles+=t.stats.familyCount;
  const profiles=old.profiles.map(p=>{
   const ini=old.turn==='Previa';
   return {family:p.family,anchored:p.anchored,d1:p.d1,d7:p.d7,
    sourceCount:p.sourceCount,blockCount:p.blockCount,pathCount:p.pathCount,
    ageTurns:p.ageTurns,firstSource:p.firstSource,
    state:p.state,birth:p.birth,converge:p.converge,
    newSource:!ini&&p.newSource,newAnchor:!ini&&p.newAnchor,
    newBlocks2:!ini&&p.newBlocks2,
    latestPathCount:ini?0:p.latestPathCount,
    latestBlockCount:ini?0:p.latestBlockCount};
  });
  const picks={OFICIAL:ref.official,GEOMETRIA_COMPLETA_ANTERIOR:ref.selections.F_D1.top};
  for(const mode of ['ACUMULADO','NOVEDAD_FUENTE','NOVEDAD_RAIZ'])
   picks[mode]=choose(profiles,mode);
  assert.ok(MODELS.every(k=>picks[k].length===10));
  for(const k of MODELS){
   assert.equal(new Set(picks[k]).size,10);
   assert.ok(picks[k].every(f=>t.lookup.has(f)),'selected family absent in physical atlas');
  }
  rows.push({date:old.date,turn:old.turn,profileCount:profiles.length,
   changes:t.stats,profiles,picks});
  previous={date:old.date,turn:old.turn,_lookup:t.lookup};
 }
 assert.equal(new Set(rows.map(x=>x.date)).size,23);
 assert.equal(totals.profiles,15273);
 const pre={protocol:'VT3_EVENTOS_FISICOS_VS_PRESENCIA_V1',date:'2026-10-14',
  days:23,cuts:115,totals,rows,
  note:'Recorridos viejos permanecen; estados de cada familia son acumulativos por turno y novedades solo de nueva fuente. Familias y selección se congelan antes de POST.'};
 save('PRE_115.json',pre);
 const seal={transitionsPre:ts.pre,previousGeometryPre:gs.generatedPre,
  originalBasePre:ts.basePre,protocol:sha(text(PROTO)),
  script:sha(text(SCRIPT)),pre:sha(text(OUT+'PRE_115.json'))};
 save('SELLO.json',seal);
 console.log('NOVEDAD_VT3_PRE_OK',JSON.stringify({totals,seal,
  last:rows.at(-1)&&{date:rows.at(-1).date,turn:rows.at(-1).turn,
   official:rows.at(-1).picks.OFICIAL.slice(0,3),
   accumulated:rows.at(-1).picks.ACUMULADO.slice(0,3),
   newSource:rows.at(-1).picks.NOVEDAD_FUENTE.slice(0,3),
   newRoot:rows.at(-1).picks.NOVEDAD_RAIZ.slice(0,3)}}));
}
function prng(s){return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}
function shuffle(a,rnd){
 const out=a.slice();
 for(let i=out.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));
  [out[j],out[i]]=[out[i],out[j]];}
 return out;
}
const hit=(top,winning,k)=>top.slice(0,k).some(f=>winning.has(f));
function asPOST(){
 const seal=j(OUT+'SELLO.json'),ts=j(TRANS+'SELLO.json'),gs=j(GEO+'SELLO.json');
 assert.equal(seal.transitionsPre,sha(text(TRANS+'PRE_115.json')));
 assert.equal(seal.transitionsPre,ts.pre);
 assert.equal(seal.previousGeometryPre,gs.generatedPre);
 assert.equal(seal.previousGeometryPre,sha(text(GEO+'PRE_115.json')));
 assert.equal(seal.originalBasePre,ts.basePre);
 assert.equal(seal.protocol,sha(text(PROTO)));
 assert.equal(seal.script,sha(text(SCRIPT)));
 assert.equal(seal.pre,sha(text(OUT+'PRE_115.json')));
 const pre=j(OUT+'PRE_115.json'),post=j(BASE+'POST_115.json').rows;
 assert.equal(pre.rows.length,115);assert.equal(post.length,115);
 const values=pre.rows.map((r,i)=>{
  const p=post[i];assert.equal(label(r),label(p));assert.equal(p.targets.length,5);
  const wins=new Set(p.targets.map(h=>{assert.match(h,/^\d{4}$/);return family(h.slice(-3));}));
  const byFamily=new Map(r.profiles.map(f=>[f.family,f]));
  const exposed=r.profiles.filter(x=>wins.has(x.family));
  return {date:r.date,turn:r.turn,wins,byFamily,exposed,r};
 });
 assert.equal(values.reduce((n,v)=>n+v.exposed.length,0),143);
 const score=Object.fromEntries(MODELS.map(m=>[m,{top3:0,top5:0,top10:0}]));
 const observations=values.map(v=>{
  const decisions={};
  for(const m of MODELS){
   decisions[m]=Object.fromEntries(K.map(k=>['top'+k,hit(v.r.picks[m],v.wins,k)]));
   for(const k of K)score[m]['top'+k]+=Number(decisions[m]['top'+k]);
  }
  return {date:v.date,turn:v.turn,decisions,
   winningFamilies:v.exposed.map(p=>({family:p.family,state:p.state,
    newSource:p.newSource,newAnchor:p.newAnchor}))};
 });
 assert.deepEqual([score.OFICIAL.top3,score.OFICIAL.top5,score.OFICIAL.top10],[5,8,15]);
 assert.deepEqual([score.GEOMETRIA_COMPLETA_ANTERIOR.top3,
  score.GEOMETRIA_COMPLETA_ANTERIOR.top5,score.GEOMETRIA_COMPLETA_ANTERIOR.top10],[8,10,16]);
 const r=prng(20261014),N=2000;
 const pools=values.map(v=>({full:v.r.profiles.map(p=>p.family),
  newFirst:v.r.profiles.filter(p=>p.newSource).map(p=>p.family),
  old:v.r.profiles.filter(p=>!p.newSource).map(p=>p.family)}));
 const neutral={TODAS:{top3:[],top5:[],top10:[]},NOVEDAD:{top3:[],top5:[],top10:[]}};
 for(let run=0;run<N;run++){
  const total={TODAS:{top3:0,top5:0,top10:0},NOVEDAD:{top3:0,top5:0,top10:0}};
  for(let i=0;i<values.length;i++){
   const o=pools[i],w=values[i].wins;
   const all=shuffle(o.full,r).slice(0,10);
   const news=shuffle(o.newFirst,r).concat(shuffle(o.old,r)).slice(0,10);
   assert.equal(all.length,10);assert.equal(news.length,10);
   for(const k of K){
    total.TODAS['top'+k]+=Number(hit(all,w,k));
    total.NOVEDAD['top'+k]+=Number(hit(news,w,k));
   }
  }
  for(const mode of ['TODAS','NOVEDAD'])for(const k of K)
   neutral[mode]['top'+k].push(total[mode]['top'+k]);
 }
 const candidateModes={TODAS:['ACUMULADO','NOVEDAD_FUENTE','NOVEDAD_RAIZ'],NOVEDAD:['NOVEDAD_FUENTE','NOVEDAD_RAIZ']};
 const neutrality=Object.fromEntries(Object.entries(neutral).map(([model,ranges])=>[model,
  Object.fromEntries(Object.entries(ranges).map(([k,arr])=>{
   const sorted=arr.slice().sort((a,b)=>a-b);
   return [k,{runs:N,mean:Number((arr.reduce((a,b)=>a+b,0)/N).toFixed(4)),
    p05:sorted[99],median:sorted[999],p95:sorted[1899],
    tails:Object.fromEntries(candidateModes[model].map(m=>[m,
     Number(((arr.filter(x=>x>=score[m][k]).length+1)/(N+1)).toFixed(5))]))}];
  }))]));
 const byMonth=Object.fromEntries([...new Set(values.map(x=>x.date.slice(0,7)))].map(month=>
 [month,{cuts:values.filter(v=>v.date.startsWith(month)).length,
  methods:Object.fromEntries(MODELS.map(m=>[m,
   Object.fromEntries(K.map(k=>['top'+k,
    observations.filter(o=>o.date.startsWith(month)&&o.decisions[m]['top'+k]).length]))]))}]));
 const byTurn=Object.fromEntries(TURNS.map(turn=>[turn,{
  cuts:values.filter(v=>v.turn===turn).length,
  methods:Object.fromEntries(MODELS.map(m=>[m,
   Object.fromEntries(K.map(k=>['top'+k,observations.filter(o=>o.turn===turn&&o.decisions[m]['top'+k]).length]))]))}]));
 const paired=Object.fromEntries(['NOVEDAD_FUENTE','NOVEDAD_RAIZ'].map(m=>[m,
  Object.fromEntries(['ACUMULADO','OFICIAL','GEOMETRIA_COMPLETA_ANTERIOR'].map(b=>[b,
   Object.fromEntries(K.map(k=>{
    const key='top'+k;
    const gains=observations.filter(o=>o.decisions[m][key]&&!o.decisions[b][key]).map(label);
    const losses=observations.filter(o=>!o.decisions[m][key]&&o.decisions[b][key]).map(label);
    return [key,{gains,losses,net:gains.length-losses.length}];
   }))]))]));
 const turnover=Object.fromEntries(MODELS.map(m=>{
  let old=null,same3=0,same5=0,same10=0,transitions=0;
  for(const v of values){
   if(old&&old.date===v.date){
    transitions++;
    for(const k of K)if(JSON.stringify(v.r.picks[m].slice(0,k))===JSON.stringify(old.r.picks[m].slice(0,k))){
     if(k===3)same3++;if(k===5)same5++;if(k===10)same10++;
    }
   }
   old=v;
  }
  assert.equal(transitions,92);
  return [m,{intradayTransitions:transitions,same3,same5,same10}];
 }));
 const profileStats={winningPhysicallyPresent:143,exposures:pre.totals.profiles,
  newSource:{exposures:0,winners:0},newAnchor:{exposures:0,winners:0},
  birth:{exposures:0,winners:0},converge:{exposures:0,winners:0},
  stable:{exposures:0,winners:0},initial:{exposures:0,winners:0},
  byTop:{}};
 for(const v of values){
  for(const p of v.r.profiles){
   const win=v.wins.has(p.family);
   const keys=[p.newSource&&'newSource',p.newAnchor&&'newAnchor',p.birth&&'birth',
    p.converge&&'converge',p.state==='YA_PRESENTE'&&'stable',p.state==='INICIAL'&&'initial'].filter(Boolean);
   for(const k of keys){profileStats[k].exposures++;profileStats[k].winners+=Number(win);}
  }
 }
 for(const m of MODELS){
  profileStats.byTop[m]=Object.fromEntries(K.map(k=>{
   let countNew=0,countRootNew=0,countHitsViaNew=0,countHitsViaStable=0;
   for(const v of values){
    for(const f of v.r.picks[m].slice(0,k)){
     const p=v.byFamily.get(f);
     countNew+=Number(p.newSource);countRootNew+=Number(p.newAnchor);
     if(v.wins.has(f)){countHitsViaNew+=Number(p.newSource);
      countHitsViaStable+=Number(!p.newSource);}
    }
   }
   return ['top'+k,{selectedFresh:countNew,selectedNewAnchor:countRootNew,
    winningFamilyExposuresViaFresh:countHitsViaNew,
    winningFamilyExposuresViaOther:countHitsViaStable}];
  }));
 }
 const changes=Object.fromEntries(['NOVEDAD_FUENTE','NOVEDAD_RAIZ'].map(m=>[m,
  Object.fromEntries(K.map(k=>['top'+k,
   values.filter(v=>JSON.stringify(v.r.picks[m].slice(0,k))!==JSON.stringify(v.r.picks.ACUMULADO.slice(0,k))).length]))]));
 const diagnostic={scope:'Exploratorio: 115 cortes reutilizados. Acierto de terna en cinco cabezas, NO posicion sorteada.',
  days:23,cuts:115,score,profileStats,changesFromAccumulated:changes,
  turnover,paired,byMonth,byTurn,neutrality,
  caveats:[
   'Las columnas viejas no desaparecen dentro del día: presencia acumulada 1→0 es imposible.',
   'Previa se clasifica como INICIAL, no NACE/SUMA_FUENTE intradía.',
   'Los nuevos recorridos cuentan una vez por familia y nueva fuente para prioridad, no por multiplicidad de rutas.',
   'Estas fechas fueron utilizadas para generar numerosas hipótesis: controles neutralizados no prueban pronóstico real.',
   'No modificar motor oficial, VT4 ni sellos PRE verdaderamente prospectivos.'
  ],seal,postBaseSha:sha(text(BASE+'POST_115.json'))};
 save('POST_115.json',{rows:observations});
 save('RESUMEN.json',diagnostic);
 console.log('NOVEDAD_VT3_POST_OK',JSON.stringify({score,profileStats,
  changes,turnover,byMonth,neutrality},null,2));
}
if(process.argv[2]==='pre'){mkdirSync(OUT,{recursive:true});asPRE();}
else if(process.argv[2]==='post'){mkdirSync(OUT,{recursive:true});asPOST();}
else throw Error('Usage: pre|post');
