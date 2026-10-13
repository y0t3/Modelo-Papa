import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const base='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const vig='auditorias/vt3-vigencia-fisica-115-13oct2026/';
const prior='PROTOCOLO_VT3_VIGENCIA_CONTROLES_13OCT2026.md';
const sha=s=>createHash('sha256').update(s).digest('hex');
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const save=(p,o)=>writeFileSync(vig+p,JSON.stringify(o,null,2)+'\n');
const family=s=>[s,[...s].reverse().join('')].sort().join('/');
const torder=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const targetFamily=h=>{assert.ok(h.length===4&&[...h].every(x=>x>='0'&&x<='9'));return family(h.slice(-3))};
const policies=['OFICIAL','NUEVA_7','ACTIVA_1','NACE_HOY'];
const limits=[3,5,10];
const expectedMain='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';

function buildPre(){
 assert.ok(!existsSync(base+'POST_115.json'),'POST 115 debe apartarse antes del PRE');
 assert.ok(!existsSync(base+'NOCTURNA_POST_DIAGNOSTICO.json'),'POST nocturno debe apartarse antes del PRE');
 const hist=json(base+'PRE_115.json').rows,
       v=json(vig+'PRE_115.json').rows,
       noct=json(base+'NOCTURNA_SIMULACION.json').row;
 assert.equal(sha(read(base+'PRE_115.json')),expectedMain);
 assert.equal(hist.length,115);assert.equal(v.length,115);
 assert.equal(noct.date,'2026-10-12');assert.equal(noct.turn,'Nocturno');
 const priorDays=[...new Set(hist.filter(r=>r.turn==='Nocturno').map(r=>r.date))].sort();
 assert.equal(priorDays.length,23);
 const seen={};
 for(const window of [1,2,7]){
  const past=new Set(priorDays.slice(-window));
  const rows=hist.filter(r=>r.turn==='Nocturno'&&past.has(r.date));
  assert.equal(rows.length,window);
  seen[window]={dates:[...past],families:rows.map(r=>new Set(r.strategies.B_INVENTARIO.map(f=>f.family)))};
 }
 const ranked=Object.fromEntries(['OFICIAL','NUEVA_1','NUEVA_2','NUEVA_7','ACTIVA_1','ACTIVA_2','ACTIVA_7']
  .map(p=>[p,[]]));
 const candidates=noct.strategies.A_ORIGINAL.map((f,index)=>{
  const present=Object.fromEntries([1,2,7].map(w=>[w,seen[w].families.filter(s=>s.has(f.family)).length]));
  return {family:f.family,originalRank:f.rank,originalIndex:index,d1:f.d1,d7:f.d7,bif:f.bif,
   physicalAppearances:present};
 });
 function order(fn,descending=true){
  return [...candidates].sort((a,b)=>((descending?fn(b)-fn(a):fn(a)-fn(b))||a.originalIndex-b.originalIndex))
   .map(x=>x.family);
 }
 ranked.OFICIAL=candidates.map(x=>x.family);
 for(const win of [1,2,7]){
  ranked['NUEVA_'+win]=order(f=>Number(f.physicalAppearances[win]===0));
  ranked['ACTIVA_'+win]=order(f=>f.physicalAppearances[win]);
 }
 assert.equal(new Set(ranked.OFICIAL).size,ranked.OFICIAL.length);
 assert.deepEqual(ranked.OFICIAL,noct.strategies.A_ORIGINAL.map(x=>x.family));
 save('NOCTURNA_VIGENCIA_PRE.json',{note:'12/10 Nocturna: reordenación retrospectiva con históricos PRE, sin objetivos. NO reemplaza el sello PRE original anterior al sorteo.',
  historyDates:Object.fromEntries(Object.entries(seen).map(([window,p])=>[window,p.dates])),
  nocturnaDate:noct.date,turn:noct.turn,profiles:candidates,rankings:ranked});
 const seal={inputBasePre:sha(read(base+'PRE_115.json')),
  inputVigenciaPre:sha(read(vig+'PRE_115.json')),
  inputNocturnaPre:sha(read(base+'NOCTURNA_SIMULACION.json')),
  protocol:sha(read(prior)),script:sha(read('scripts/lab-vt3-vigencia-controles.mjs')),
  nocturnaPre:sha(read(vig+'NOCTURNA_VIGENCIA_PRE.json'))};
 // The sets in 'seen' above serialize as {}, but they are just audit dates; profiles retain correct presence counts.
 save('SELLO_CONTROLES.json',seal);
 console.log('NOCTURNA_VIGENCIA_PRE_OK',JSON.stringify({top10:Object.fromEntries(Object.entries(ranked).map(([k,v])=>[k,v.slice(0,10)])),seal},null,2));
}
function negativeControls(){
 const seal=json(vig+'SELLO_CONTROLES.json');
 assert.equal(seal.inputBasePre,sha(read(base+'PRE_115.json')));
 assert.equal(seal.inputVigenciaPre,sha(read(vig+'PRE_115.json')));
 assert.equal(seal.inputNocturnaPre,sha(read(base+'NOCTURNA_SIMULACION.json')));
 assert.equal(seal.protocol,sha(read(prior)));
 assert.equal(seal.script,sha(read('scripts/lab-vt3-vigencia-controles.mjs')));
 assert.equal(seal.nocturnaPre,sha(read(vig+'NOCTURNA_VIGENCIA_PRE.json')));
 const pre=json(vig+'PRE_115.json').rows,post=json(base+'POST_115.json').rows;
 const dates=[...new Set(pre.map(x=>x.date))].sort();assert.equal(dates.length,23);
 const pm=new Map(pre.map(x=>[x.date+'|'+x.turn,x]));
 const om=new Map(post.map(x=>[x.date+'|'+x.turn,x]));
 const period=dates.map(d=>torder.map(t=>{
  const p=pm.get(d+'|'+t),o=om.get(d+'|'+t);
  assert.ok(p&&o,'Falta PRE o POST');
  assert.equal(o.targets.length,5);
  return {p,goals:new Set(o.targets.map(targetFamily))};
 }));
 // Each 23×23×5 source-day/target-day pair keeps sort-specific heads aligned.
 const matrix=policies.map(()=>limits.map(()=>Array.from({length:23},()=>Array.from({length:23},()=>0))));
 for(let i=0;i<23;i++)for(let j=0;j<23;j++)for(let t=0;t<5;t++){
  for(let pp=0;pp<policies.length;pp++)for(let lim=0;lim<limits.length;lim++){
   const names=period[i][t].p.rankings[policies[pp]].slice(0,limits[lim]);
   matrix[pp][lim][i][j]+=Number(names.some(f=>period[j][t].goals.has(f)));
  }
 }
 const identity=dates.map((_,i)=>i);
 const count=a=>Object.fromEntries(policies.map((pol,p)=>[pol,Object.fromEntries(limits.map((lim,l)=>
  [lim,a.reduce((n,j,i)=>n+matrix[p][l][i][j],0)]))]));
 const real=count(identity);
 assert.deepEqual(Object.values(real.OFICIAL),[5,8,15]);
 assert.deepEqual(Object.values(real.NUEVA_7),[8,11,14]);
 const measures={};
 for(const limit of limits){
  measures['ORIGINAL_TOP'+limit]=r=>r.OFICIAL[limit];
  measures['NUEVA_7_TOP'+limit]=r=>r.NUEVA_7[limit];
  measures['DELTA_NUEVA_7_VS_ORIGINAL_TOP'+limit]=r=>r.NUEVA_7[limit]-r.OFICIAL[limit];
 }
 for(const p of ['ACTIVA_1','NACE_HOY'])for(const limit of limits)
  measures[p+'_TOP'+limit]=r=>r[p][limit];
 const actual=Object.fromEntries(Object.entries(measures).map(([name,fn])=>[name,fn(real)]));
 function summarize(scoreRows){
  return Object.fromEntries(Object.entries(measures).map(([name,fn])=>{
   const vals=scoreRows.map(fn).sort((a,b)=>a-b);
   const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
   const ge=vals.filter(x=>x>=actual[name]).length;
   return [name,{real:actual[name],mean:Number(mean.toFixed(5)),p05:vals[Math.floor(.05*(vals.length-1))],
    median:vals[Math.floor(.5*(vals.length-1))],p95:vals[Math.floor(.95*(vals.length-1))],
    atLeastReal:ge,oneSidedTail:(ge+1)/(vals.length+1)}];
  }));
 }
 const rot=Array.from({length:22},(_,j)=>({lag:j+1,scores:count(identity.map(i=>(i+j+1)%23))}));
 function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296}}
 const schemes={free:[identity],sameWeekday:[...new Set(dates.map(d=>new Date(d+'T12:00:00Z').getUTCDay()))].map(dw=>
  dates.map((d,i)=>new Date(d+'T12:00:00Z').getUTCDay()===dw?i:-1).filter(x=>x>=0))};
 const results={};
 for(const [sid,[name,groups]] of Object.entries(schemes).entries()){
  const next=rng(20261013+sid*431),evaluations=[];
  for(let r=0;r<20000;r++){
   const a=[...identity];
   for(const group of groups){
    const values=group.map(i=>a[i]);
    for(let k=values.length-1;k>0;k--){const j=Math.floor(next()*(k+1));[values[k],values[j]]=[values[j],values[k]];}
    group.forEach((i,j)=>a[i]=values[j]);
   }
   assert.equal(new Set(a).size,23);
   evaluations.push(count(a));
  }
  results[name]={repetitions:20000,groups:groups.map(g=>g.length),metrics:summarize(evaluations)};
 }
 const noct=json(vig+'NOCTURNA_VIGENCIA_PRE.json');
 const npost=json(base+'NOCTURNA_POST_DIAGNOSTICO.json');
 const targets=npost.targets;
 assert.equal(targets.length,5);
 const wins=new Set(targets.map(targetFamily));
 const originalNocturna=json(base+'NOCTURNA_SIMULACION.json').row;
 const physical=new Map(originalNocturna.strategies.B_INVENTARIO.map(f=>[f.family,f]));
 const anchored=new Map(originalNocturna.strategies.A_ORIGINAL.map(f=>[f.family,f]));
 const watched=targets.map(h=>{
  const f=targetFamily(h),x=physical.get(f),a=anchored.get(f);
  return {head:h,vt3:h.slice(-3),family:f,physicalPossible:Boolean(x),anchored:Boolean(a),
   physicalRank:x?.rank??null,originalRank:a?.rank??null,
   roots:a?{d1:a.d1,d7:a.d7,bif:a.bif}:null,
   historicalAppearances:noct.profiles.find(p=>p.family===f)?.physicalAppearances??null,
   ranks:Object.fromEntries(Object.entries(noct.rankings).map(([policy,ordered])=>[policy,ordered.indexOf(f)+1||null]))};
 });
 const candidates=Object.fromEntries(Object.entries(noct.rankings).map(([m,names])=>{
  const hits=names.filter(x=>wins.has(x));
  return [m,{top3:hits.filter(f=>names.indexOf(f)<3),top5:hits.filter(f=>names.indexOf(f)<5),
   top10:hits.filter(f=>names.indexOf(f)<10),winnerFamilies:hits}];
 }));
 save('NOCTURNA_VIGENCIA_POST.json',{date:'2026-10-12',nocturnaTargetHeads:targets,
   names:targets.map(h=>({head:h,vt3:family(h.slice(-3))})),
   diagnostics:watched,candidates,
   interpretation:'Diagnóstico retrospectivo de sorteo YA CONOCIDO, no predicción ni nueva validación. Ninguna permutación abre familias sin anclaje.'});
 const summary={date:'2026-10-13',days:23,cuts:115,real,rotations: {count:22, metrics:summarize(rot.map(x=>x.scores))},
   placebo:results,seal,nocturnaPRE:sha(read(vig+'NOCTURNA_VIGENCIA_PRE.json')),
   nocturnaPOST:sha(read(vig+'NOCTURNA_VIGENCIA_POST.json')),
   limitation:'Todos los criterios diseñados sobre muestra histórica conocida. Comparación por turnos mantiene los sorteos completos por fecha. P exploratorio; sin evidencia independiente de pronóstico.'};
 save('RESUMEN_CONTROLES.json',summary);
 save('ROTACIONES_CONTROLES.json',rot);
 console.log('VIGENCIA_CONTROLES_POST_OK',JSON.stringify({real,rotation:summary.rotations.metrics,
  placebo:Object.fromEntries(Object.entries(results).map(([method,rs])=>[method,
   Object.fromEntries(Object.entries(rs.metrics).filter(([k])=>k.includes('NUEVA_7')||k==='ORIGINAL_TOP3'))])),
  nocturnaTargets:targets,watched,
  nocturnaCandidates:candidates},null,2));
}
const mode=process.argv[2];if(mode==='pre')buildPre();else if(mode==='post')negativeControls();else throw Error('Usar pre o post');
