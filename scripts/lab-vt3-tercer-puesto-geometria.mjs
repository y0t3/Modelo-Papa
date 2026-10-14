import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const ROOT='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OUT='auditorias/vt3-tercer-puesto-geometria-115-13oct2026/';
const PROTOCOL='PROTOCOLO_VT3_TERCER_PUESTO_GEOMETRIA_13OCT2026.md';
const SOURCE='scripts/lab-vt3-tercer-puesto-geometria.mjs';
const FIXTURE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const TARGET='auditorias/vt4-diversidad-madres-top10-115-13oct2026/OBJETIVOS_POST_115.json';
const SHA_BASE='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const METHODS=['OFICIAL','RANGO5_CONTROL','MAS_D1','MAS_D7','EVENTOS_NO_COMPARTIDOS',
 'FORMAS_DIVERSAS','CONTINUIDAD_DIA','FUENTE_RECIENTE','HASH_NEUTRAL'];
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=x=>createHash('sha256').update(x).digest('hex');
const save=(n,x)=>writeFileSync(OUT+n,JSON.stringify(x,null,2)+'\n');
const unique=a=>[...new Set(a)];
const mean=a=>a.reduce((s,x)=>s+x,0)/(a.length||1);
const key=r=>r.date+'|'+r.turn;
const rev=s=>[...s].reverse().join('');
const fam=s=>[s,rev(s)].sort().join('/');
const event=s=>{
 const p=s.split('|');assert.equal(p.length,8);assert.ok(p[1]==='D−1'||p[1]==='D−7');
 return p.slice(0,5).join('|');
};
function shape(cells){
 const coords=cells.map(s=>s.split(':').map(Number));
 const minR=Math.min(...coords.map(x=>x[0])),minC=Math.min(...coords.map(x=>x[1]));
 const str=coords.map(([r,c])=>(r-minR)+':'+(c-minC));
 return [str.join('>'),str.slice().reverse().join('>')].sort()[0];
}
function byMethod(pool,method,seed){
 if(method==='OFICIAL')return pool[0];
 if(method==='RANGO5_CONTROL')return pool[2];
 function score(x){
  if(method==='MAS_D1')return [x.d1,x.d7,x.blocks];
  if(method==='MAS_D7')return [x.d7,x.d1,x.blocks];
  if(method==='EVENTOS_NO_COMPARTIDOS')return [x.notShared,x.events.length,x.sources];
  if(method==='FORMAS_DIVERSAS')return [x.forms,x.paths,x.sources];
  if(method==='CONTINUIDAD_DIA')return [Number(x.persist),x.blocks,x.forms];
  if(method==='FUENTE_RECIENTE')return [x.latestPaths,x.sources,x.blocks];
  return [0];
 }
 if(method==='HASH_NEUTRAL')return pool.slice().sort((a,b)=>
   sha(seed+'|'+a.family).localeCompare(sha(seed+'|'+b.family)))[0];
 return pool.slice().sort((a,b)=>{
  const x=score(a),y=score(b);
  for(let i=0;i<x.length;i++)if(x[i]!==y[i])return y[i]-x[i];
  return a.rank-b.rank;
 })[0];
}
function pre(){
 for(const p of [ROOT+'POST_115.json',ROOT+'NOCTURNA_POST_DIAGNOSTICO.json',
 TARGET,FIXTURE])assert.ok(!existsSync(p),'Se encontró un objetivo POST durante PRE '+p);
 assert.equal(sha(read(ROOT+'PRE_115.json')),SHA_BASE);
 const input=json(ROOT+'PRE_115.json').rows;
 assert.equal(input.length,115);
 const rows=[],random=[];
 for(let i=0;i<input.length;i++){
  const r=input[i],turnIndex=TURNS.indexOf(r.turn);assert.ok(turnIndex>=0);
  const rank=r.strategies.A_ORIGINAL;
  assert.ok(rank.length>=10);
  const first10=rank.slice(0,10).map(x=>x.family);
  const prev=turnIndex>0?rows[i-1]:null;
  if(turnIndex>0)assert.ok(prev&&prev.date===r.date&&prev.turn===TURNS[turnIndex-1]);
  const prevFamilies=new Set(prev?.allFamilies??[]);
  const witnessed=new Map(r.witnesses.map(x=>[x.family,x.paths]));
  const rootEventSets=new Map();
  const feature=(c,ix)=>{
   const paths=witnessed.get(c.family);assert.ok(paths?.length);
   const anchored=paths.filter(p=>p.anchored);
   assert.ok(anchored.length);
   const ownEvents=unique(anchored.flatMap(p=>p.rootIds.map(event))).sort();
   rootEventSets.set(c.family,ownEvents);
   const forms=unique(paths.map(p=>shape(p.cells))).length;
   const recentSource=turnIndex===0?'prevNocturno':TURNS[turnIndex-1];
   const latestPaths=anchored.filter(p=>p.source===recentSource).length;
   assert.equal(c.rank,ix+1);
   assert.ok(c.blocks>0&&c.sources>0&&c.anchoredPaths>0);
   return {rank:c.rank,family:c.family,d1:c.d1,d7:c.d7,blocks:c.blocks,
    sources:c.sources,paths:paths.length,anchored:c.anchoredPaths,
    events:ownEvents,forms,latestPaths,persist:turnIndex>0&&prevFamilies.has(c.family)};
  };
  const firstTwo=rank.slice(0,2).map(feature);
  const firstEvents=new Set(firstTwo.flatMap(x=>x.events));
  const pool=rank.slice(2,10).map((c,k)=>{
   const f=feature(c,k+2);
   return {...f,notShared:f.events.filter(e=>!firstEvents.has(e)).length};
  });
  const options={};
  for(const method of METHODS){
   const selected=byMethod(pool,method,key(r));
   const reordered=[first10[0],first10[1],selected.family,
    ...first10.slice(2).filter(z=>z!==selected.family)];
   assert.equal(reordered.length,10);assert.equal(unique(reordered).length,10);
   assert.deepEqual([...reordered].sort(),[...first10].sort());
   assert.deepEqual(reordered.slice(0,2),first10.slice(0,2));
   options[method]={third:selected.family,oldRank:selected.rank,
    ranking:reordered,exposedTerminals:unique(fam(selected.family.split('/')[0]).split('/')).length};
  }
  const physicalFamilies=r.strategies.B_INVENTARIO.map(x=>x.family);
  rows.push({date:r.date,turn:r.turn,top10:first10,
   allFamilies:physicalFamilies,
   firstTwo,eligible:pool,options});
  if(i%25===24)console.log('TOP3_PRE',i+1);
 }
 // Seeded neutral control; uint8 arrays encode one of eight physically rooted families.
 let s=20261013>>>0;
 const next=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296};
 for(let rep=0;rep<5000;rep++){
  const selected=rows.map(()=>Math.floor(next()*8));
  assert.ok(selected.every(i=>i>=0&&i<8));
  random.push(Buffer.from(selected).toString('base64'));
 }
 save('PRE_115.json',{cuts:115,methods:METHODS,rows,
  note:'Ranking de las mismas diez familias oficiales; dos puestos fijos, tercero de 3–10'});
 save('NEUTRAL_PRE_5000.json',{runs:5000,kind:'base64(uint8[115])',chosen:random});
 save('SELLO.json',{input:SHA_BASE,protocol:sha(read(PROTOCOL)),script:sha(read(SOURCE)),
  pre:sha(read(OUT+'PRE_115.json')),neutral:sha(read(OUT+'NEUTRAL_PRE_5000.json'))});
 console.log('PRE_VT3_TOP3_OK',JSON.stringify({cuts:115,controlRuns:5000,
  source:SHA_BASE,seal:json(OUT+'SELLO.json')},null,2));
}
function post(){
 const seal=json(OUT+'SELLO.json');
 for(const [p,h] of [[ROOT+'PRE_115.json',seal.input],[PROTOCOL,seal.protocol],
 [SOURCE,seal.script],[OUT+'PRE_115.json',seal.pre],
 [OUT+'NEUTRAL_PRE_5000.json',seal.neutral]])assert.equal(sha(read(p)),h,'PRE alterado '+p);
 const input=json(OUT+'PRE_115.json').rows,goals=json(ROOT+'POST_115.json').rows,
  neutral=json(OUT+'NEUTRAL_PRE_5000.json').chosen;
 assert.equal(input.length,115);assert.equal(goals.length,115);assert.equal(neutral.length,5000);
 const cuts=input.map((r,i)=>{
  const g=goals[i];assert.equal(key(r),key(g));assert.equal(g.targets.length,5);
  const winners=new Set(g.targets.map(h=>{
   assert.match(h,/^\d{4}$/);
   return fam(h.slice(-3));
  }));
  const results=Object.fromEntries(METHODS.map(m=>{
   const z=r.options[m];
   const first3=z.ranking.slice(0,3);
   return [m,{third:z.third,rank:z.oldRank,
    thirdWon:winners.has(z.third),
    top3:first3.some(w=>winners.has(w)),
    top5:z.ranking.slice(0,5).some(w=>winners.has(w)),
    top10:z.ranking.some(w=>winners.has(w)),
    headMatched:g.targets.filter(h=>first3.includes(fam(h.slice(-3))))}];
  }));
  return {date:r.date,turn:r.turn,heads:g.targets,
   matchedPool:r.eligible.filter(c=>winners.has(c.family)).map(x=>({rank:x.rank,family:x.family})),
   results};
 });
 const byMethod=part=>Object.fromEntries(METHODS.map(m=>{
  const subset=part.map(r=>r.results[m]);
  return [m,{cuts:part.length,top3:subset.filter(x=>x.top3).length,
   top5:subset.filter(x=>x.top5).length,top10:subset.filter(x=>x.top10).length,
   slot3Winner:subset.filter(x=>x.thirdWon).length,
   gainedTop3:part.filter(x=>x.results[m].top3&&!x.results.OFICIAL.top3).map(key),
   lostTop3:part.filter(x=>!x.results[m].top3&&x.results.OFICIAL.top3).map(key),
   changedThird:part.filter(x=>x.results[m].third!==x.results.OFICIAL.third).length}];
 }));
 const all=byMethod(cuts);
 assert.deepEqual([all.OFICIAL.top3,all.OFICIAL.top5,all.OFICIAL.top10,all.OFICIAL.slot3Winner],[5,8,15,0]);
 for(const method of METHODS)assert.equal(all[method].top10,15);
 const trials=[];
 for(const enc of neutral){
  const arr=[...Buffer.from(enc,'base64')];assert.equal(arr.length,115);
  let top3=0,slot3=0;
  for(let i=0;i<115;i++){
   const pick=input[i].eligible[arr[i]];
   assert.ok(pick);
   const w=new Set(cuts[i].heads.map(h=>fam(h.slice(-3))));
   top3+=Number(input[i].top10.slice(0,2).some(z=>w.has(z))||w.has(pick.family));
   slot3+=Number(w.has(pick.family));
  }
  trials.push({top3,slot3});
 }
 const sorted=trials.map(x=>x.top3).sort((a,b)=>a-b);
 const expectedThird=mean(input.map(r=>r.eligible.reduce((n,x)=>n+x.events.length,0)));
 const full={date:'2026-10-13',cuts:115,heads:575,methods:all,
  byMonth:Object.fromEntries(['2026-09','2026-10'].map(x=>[x,byMethod(cuts.filter(r=>r.date.startsWith(x)))])),
  byTurn:Object.fromEntries(TURNS.map(x=>[x,byMethod(cuts.filter(r=>r.turn===x))])),
  neutral:{runs:trials.length,mean:mean(sorted),median:sorted[Math.floor(sorted.length*.5)],
   p05:sorted[Math.floor(sorted.length*.05)],p95:sorted[Math.floor(sorted.length*.95)],
   min:sorted[0],max:sorted.at(-1),
   distribution:Object.fromEntries(unique(sorted).map(v=>[v,sorted.filter(x=>x===v).length])),
   tail:Object.fromEntries(METHODS.map(m=>[m,
    (sorted.filter(x=>x>=all[m].top3).length+1)/(sorted.length+1)]))},
  winningSlots:cuts.filter(x=>x.matchedPool.length).map(x=>({
   date:x.date,turn:x.turn,eligibleWinners:x.matchedPool
  })),
  seal,limits:'Mismo inventario del Top10: esto evalúa orden de la plaza #3, NO apertura física ni mejora Top10. Prueba post hoc sobre 115 cortes muchas veces explorados, NO demuestra predicción.'};
 save('POST_115.json',{cuts});
 save('RESUMEN.json',full);
 const trs=METHODS.map(m=>{const s=all[m];return '| '+m+' | '+s.top3+
  ' | '+s.top5+' | '+s.top10+' | '+s.slot3Winner+
  ' | '+s.gainedTop3.length+' | '+s.lostTop3.length+
  ' | '+full.neutral.tail[m].toFixed(4)+' |';}).join('\n');
 const md='# VT3: ensayo del tercer puesto con inventario Top10 idéntico\n\n'+
 'El puesto #3 oficial aportó cero familias acertadas en 115 cortes. Conservamos puestos #1/#2 e idénticas diez familias: solo cambia el orden.\n\n'+
 '| Criterio de tercera VT3 | Top3 | Top5 | Top10 | Tercero ganó | Ganó cortes Top3 | Perdió cortes Top3 | Cola de 5000 neutrales ≥ Top3 |\n'+
 '|---|---:|---:|---:|---:|---:|---:|---:|\n'+trs+
 '\n\n5000 decisiones neutrales ciegas PRE, media Top3: '+full.neutral.mean.toFixed(4)+
 ', P05–P95 '+full.neutral.p05+'–'+full.neutral.p95+
 ', máximo '+full.neutral.max+'.\n\nLos controles ya contemplan la posibilidad de escoger cualquier candidata de #3–#10: si una variante supera el número histórico pero no los controles, no significa progreso predictivo.\n\n'+
 '**Ningún candidato VT3 fue inventado**: rutas, raíces y familias se preservaron. No se debe proclamar beneficio predictivo a partir del historial reutilizado.\n';
 writeFileSync(OUT+'LECTURA.md',md);
 console.log('TOP3_POST_OK',JSON.stringify({full:all,neutral:full.neutral,
  byMonth:Object.fromEntries(Object.entries(full.byMonth).map(([m,v])=>[m,
   Object.fromEntries(METHODS.map(k=>[k,v[k].top3]))]))},null,2));
}
const mode=process.argv[2];if(mode==='pre')pre();else if(mode==='post')post();
else throw Error('Usar pre | post');
