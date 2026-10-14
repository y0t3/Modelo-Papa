import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const ROOT='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OUT='auditorias/vt3-termas-fisicas-fuera-top-115-13oct2026/';
const DOC='PROTOCOLO_VT3_TERMAS_FISICAS_FUERA_TOP_13OCT2026.md';
const THIS='scripts/lab-vt3-termas-fisicas-fuera-top.mjs';
const FIXTURE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const TARGET='resultados/replay-lalo-115/OBJETIVOS_POST_115.json';
const SHA_BASE='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const BANDS=['A_1_3','A_4_10','A_11_PLUS','B_NUEVA_MULTI','B_NUEVA_SIMPLE','B_PERSIST_MULTI',
 'B_PERSIST_SIMPLE','B_PREVIA_MULTI','B_PREVIA_SIMPLE','NO_FISICA'];
const METHODS=['OFICIAL','ANCLADA_11','FISICA_NUEVA','FISICA_PERSISTE',
 'FISICA_MAS_FUENTES','FISICA_MAS_FORMAS','FISICA_HASH_NEUTRO'];
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(name,x)=>writeFileSync(OUT+name,JSON.stringify(x,null,2)+'\n');
const uniq=a=>[...new Set(a)];
const rev=s=>[...s].reverse().join('');
const fam=s=>[s,rev(s)].sort().join('/');
const key=r=>r.date+'|'+r.turn;
const shape=arr=>{
 const coords=arr.map(s=>s.split(':').map(Number));
 const mr=Math.min(...coords.map(x=>x[0])),mc=Math.min(...coords.map(x=>x[1]));
 const steps=coords.map(([r,c])=>(r-mr)+':'+(c-mc));
 return [steps.join('>'),steps.slice().reverse().join('>')].sort()[0];
};
const poolValues=family=>uniq(family.split('/'));
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const rnd=seed=>{let state=seed>>>0;return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296}};
function bp(probs,obs){
 let v=new Float64Array(probs.length+1);v[0]=1;
 for(let i=0;i<probs.length;i++)for(let k=i+1;k>=0;k--)
 v[k]=(v[k]||0)*(1-probs[i])+(k?v[k-1]*probs[i]:0);
 let lo=0,hi=0;for(let i=0;i<v.length;i++){if(i<=obs)lo+=v[i];if(i>=obs)hi+=v[i];}
 return {twoSided:Math.min(1,2*Math.min(lo,hi)),right:hi};
}
mkdirSync(OUT,{recursive:true});
function classify(p){
 if(p.rank!==null)return p.rank<=3?BANDS[0]:p.rank<=10?BANDS[1]:BANDS[2];
 if(p.turnIndex===0)return p.sources>=2?BANDS[7]:BANDS[8];
 return p.newInDay?(p.sources>=2?BANDS[3]:BANDS[4]):(p.sources>=2?BANDS[5]:BANDS[6]);
}
function selector(pool,method,seed){
 const positive=pool.filter(x=>x.rank===null),h=x=>sha('VT3-SIN-RAIZ-13OCT|'+seed+'|'+x.family);
 let pick;
 if(method==='FISICA_HASH_NEUTRO')pick=positive.slice().sort((a,b)=>h(a).localeCompare(h(b)))[0];
 else if(method==='FISICA_NUEVA')pick=positive.slice().sort((a,b)=>
   Number(b.turnIndex>0&&b.newInDay)-Number(a.turnIndex>0&&a.newInDay)||
   b.blocks-a.blocks||b.sources-a.sources||a.family.localeCompare(b.family))[0];
 else if(method==='FISICA_PERSISTE')pick=positive.slice().sort((a,b)=>
   Number(b.turnIndex>0&&!b.newInDay)-Number(a.turnIndex>0&&!a.newInDay)||
   b.blocks-a.blocks||b.sources-a.sources||a.family.localeCompare(b.family))[0];
 else if(method==='FISICA_MAS_FUENTES')pick=positive.slice().sort((a,b)=>
   b.sources-a.sources||b.blocks-a.blocks||a.family.localeCompare(b.family))[0];
 else if(method==='FISICA_MAS_FORMAS')pick=positive.slice().sort((a,b)=>
   b.shapes-a.shapes||b.blocks-a.blocks||a.family.localeCompare(b.family))[0];
 return pick||null;
}
function before(){
 for(const p of [ROOT+'POST_115.json',ROOT+'NOCTURNA_POST_DIAGNOSTICO.json',
  TARGET,FIXTURE])assert.ok(!existsSync(p),'Visible target POST during PRE '+p);
 assert.equal(sha(read(ROOT+'PRE_115.json')),SHA_BASE,'source PRE seal mismatch');
 const original=json(ROOT+'PRE_115.json').rows;
 assert.equal(original.length,115);
 const rows=[],rng=rnd(20261013);
 const randomChoices=Array.from({length:2000},()=>[]);
 let totalUnanchored=0,totalRooted=0;
 const byDate=new Map();
 for(let i=0;i<original.length;i++){
  const r=original[i],id=key(r),ti=TURNS.indexOf(r.turn);
  assert.ok(ti>=0);
  const prev=ti>0?rows[i-1]:null;
  if(ti>0)assert.ok(prev&&prev.date===r.date&&prev.turn===TURNS[ti-1],'previous turn absent '+id);
  const previousFamilies=prev?new Set(prev.physicalFamilies):new Set();
  const anchored=r.strategies.A_ORIGINAL,all=r.strategies.B_INVENTARIO;
  const originalTop=anchored.slice(0,10).map(x=>x.family);
  assert.equal(originalTop.length,10);assert.equal(new Set(originalTop).size,10);
  const ranks=new Map(anchored.map((x,n)=>[x.family,n+1]));
  assert.equal(new Set(all.map(x=>x.family)).size,all.length);
  const witness=new Map(r.witnesses.map(x=>[x.family,x.paths]));
  assert.equal(witness.size,all.length);
  const meta=all.map(b=>{
   const paths=witness.get(b.family);assert.ok(paths?.length);
   const sources=new Set(paths.map(x=>x.source));
   const blocks=new Set(paths.map(x=>x.source+'|'+x.cells.slice().sort().join(',')));
   const shapes=new Set(paths.map(x=>shape(x.cells)));
   const rank=ranks.get(b.family)??null;
   if(rank!==null)assert.ok(paths.some(x=>x.anchored));
   else assert.ok(paths.every(x=>!x.anchored&&!x.rootIds.length),'unanchored borrowed historical root');
   const vals=poolValues(b.family);
   for(const v of vals)assert.match(v,/^\d{3}$/);
   return {family:b.family,rank,turnIndex:ti,newInDay:ti>0&&!previousFamilies.has(b.family),
    sources:sources.size,blocks:blocks.size,paths:paths.length,shapes:shapes.size,values:vals};
  });
  const anchoredN=meta.filter(x=>x.rank!==null),unanchored=meta.filter(x=>x.rank===null);
  assert.equal(anchoredN.length,anchored.length);
  totalUnanchored+=unanchored.length;totalRooted+=anchoredN.length;
  const officialVals=new Set(anchored.slice(0,10).flatMap(x=>poolValues(x.family)));
  const terminalCategories=Array(1000).fill(BANDS[9]),featuresByFamily=Object.fromEntries(meta.map(x=>[x.family,x]));
  for(const f of meta){
   const category=classify(f);
   for(const v of f.values){
    const idn=Number(v);
    assert.equal(terminalCategories[idn],BANDS[9],'overlap of reversible families');
    terminalCategories[idn]=category;
   }
  }
  assert.equal(terminalCategories.length,1000);
  const counts=Object.fromEntries(BANDS.map(b=>[b,terminalCategories.filter(x=>x===b).length]));
  assert.equal(Object.values(counts).reduce((s,n)=>s+n,0),1000);
  const choices={};
  for(const method of METHODS){
   let selected=method==='OFICIAL'?anchored[9]?.family:
    method==='ANCLADA_11'?anchored[10]?.family:selector(meta,method,id)?.family;
   selected=selected||anchored[9].family;
   const families=[...originalTop.slice(0,9),selected];
   assert.equal(families.length,10);assert.equal(new Set(families).size,10);
   choices[method]={families,selected,hasPhysicalOnly:!ranks.has(selected),
    changedFromOfficial:selected!==originalTop[9],
    terminals:uniq(families.flatMap(poolValues)).sort()};
  }
  for(let rep=0;rep<randomChoices.length;rep++){
   const chosen=unanchored.length?unanchored[Math.floor(rng()*unanchored.length)].family:originalTop[9];
   randomChoices[rep].push(chosen);
  }
  rows.push({date:r.date,turn:r.turn,originalTop,physicalFamilies:meta.map(x=>x.family),
   features:meta,counts,choices,terminals:terminalCategories.join('|')});
  if((i+1)%25===0)console.log('PRE_VT3_TERMAS',i+1);
 }
 save('PRE_115.json',{date:'2026-10-13',methods:METHODS,bands:BANDS,rows,
   totalRooted,totalUnanchored,notes:'Las mismas 115 hojas históricas, sin cabezas del turno objetivo'});
 save('NEUTRAL_PRE_2000.json',{seed:20261013,draws:randomChoices});
 save('SELLO.json',{source:SHA_BASE,protocol:sha(read(DOC)),script:sha(read(THIS)),
  pre:sha(read(OUT+'PRE_115.json')),neutral:sha(read(OUT+'NEUTRAL_PRE_2000.json'))});
 console.log('PRE_TERMAS_OK',JSON.stringify({cuts:rows.length,rooted:totalRooted,
  unanchored:totalUnanchored,eligibleIntraday:rows.filter(r=>r.turn!=='Previa').length,
  sourceSHA:SHA_BASE},null,2));
}
function after(){
 const seal=json(OUT+'SELLO.json');
 for(const [p,h] of [[ROOT+'PRE_115.json',seal.source],[DOC,seal.protocol],[THIS,seal.script],
  [OUT+'PRE_115.json',seal.pre],[OUT+'NEUTRAL_PRE_2000.json',seal.neutral]])
 assert.equal(sha(read(p)),h,'PRE was modified '+p);
 const p=json(OUT+'PRE_115.json').rows,post=json(ROOT+'POST_115.json').rows;
 const neutral=json(OUT+'NEUTRAL_PRE_2000.json').draws;
 assert.equal(p.length,115);assert.equal(post.length,115);assert.equal(neutral.length,2000);
 const cases=[],stats=Object.fromEntries(BANDS.map(b=>[b,{terminals:0,observed:0,observedCuts:0,
  expected:0,probs:[],byMonth:{},byTurn:{}}]));
 function targetFam(head){assert.match(head,/^\d{4}$/);return fam(head.slice(-3))}
 for(let i=0;i<115;i++){
  const r=p[i],q=post[i];assert.equal(key(r),key(q));assert.equal(q.targets.length,5);
  const heads=q.targets.map(x=>x.slice(-3)),winnerFamilies=new Set(q.targets.map(targetFam));
  const hitBands=heads.map(t=>r.terminals.split('|')[Number(t)]);
  const results={};
  for(const method of METHODS){
   const choice=r.choices[method],wins=choice.families.filter(x=>winnerFamilies.has(x));
   results[method]={top3:choice.families.slice(0,3).some(x=>winnerFamilies.has(x)),
    top5:choice.families.slice(0,5).some(x=>winnerFamilies.has(x)),
    top10:wins.length>0,wins,selected:choice.selected,changed:choice.changedFromOfficial,
    hasPhysicalOnly:choice.hasPhysicalOnly};
  }
  const winnersOnly=r.features.filter(x=>x.rank===null&&winnerFamilies.has(x.family));
  cases.push({date:r.date,turn:r.turn,heads:q.targets,results,
    headsBand:hitBands,winnersOnly:winnersOnly.map(x=>({...x,band:classify(x)}))});
  for(const band of BANDS){
   const x=stats[band],count=r.counts[band],obs=hitBands.filter(z=>z===band).length;
   x.terminals+=count;x.observed+=obs;x.observedCuts+=Number(obs>0);
   x.expected+=5*count/1000;
   for(let n=0;n<5;n++)x.probs.push(count/1000);
   for(const [g,k] of [['byMonth',r.date.slice(0,7)],['byTurn',r.turn]]){
    if(!x[g][k])x[g][k]={cuts:0,terminals:0,observed:0,expected:0};
    const s=x[g][k];s.cuts++;s.terminals+=count;s.observed+=obs;s.expected+=5*count/1000;
   }
  }
 }
 const bandResults=Object.fromEntries(BANDS.map(b=>{
  const x=stats[b],test=bp(x.probs,x.observed);
  return [b,{avgTerminals:+(x.terminals/115).toFixed(3),observed:x.observed,
   observedCuts:x.observedCuts,expected:+x.expected.toFixed(4),
   ratio:x.expected?+(x.observed/x.expected).toFixed(3):null,
   pTwoSided:test.twoSided,pBonferroni:Math.min(1,10*test.twoSided),
   byMonth:x.byMonth,byTurn:x.byTurn}];
 }));
 assert.equal(BANDS.reduce((s,b)=>s+bandResults[b].observed,0),575);
 const methods=Object.fromEntries(METHODS.map(m=>[m,{
  top3:cases.filter(x=>x.results[m].top3).length,
  top5:cases.filter(x=>x.results[m].top5).length,
  top10:cases.filter(x=>x.results[m].top10).length,
  selectedNew:cases.filter(x=>x.results[m].hasPhysicalOnly).length,
  changedFromOfficial:cases.filter(x=>x.results[m].changed).length,
  gained:cases.filter(x=>x.results[m].top10&&!x.results.OFICIAL.top10).map(key),
  lost:cases.filter(x=>!x.results[m].top10&&x.results.OFICIAL.top10).map(key),
  selectedWinning:cases.filter(x=>x.results[m].selected&&
   x.results[m].wins.includes(x.results[m].selected)).map(key)
 }]));
 assert.deepEqual([methods.OFICIAL.top3,methods.OFICIAL.top5,methods.OFICIAL.top10],[5,8,15]);
 const neutralTotals=[];
 for(const choices of neutral){
  assert.equal(choices.length,115);
  let top10=0,slotWins=0;
  for(let i=0;i<115;i++){
   const c=cases[i],r=p[i],winner=new Set(c.heads.map(targetFam));
   const picked=choices[i];
   assert.ok(r.features.some(x=>x.family===picked),'random pick is not physical');
   const hit=r.originalTop.slice(0,9).some(x=>winner.has(x))||winner.has(picked);
   top10+=Number(hit);slotWins+=Number(winner.has(picked));
  }
  neutralTotals.push({top10,slotWins});
 }
 const sample=neutralTotals.map(x=>x.top10).sort((a,b)=>a-b);
 const neutralStats={reps:sample.length,mean:+mean(sample).toFixed(4),
  p05:sample[Math.floor(sample.length*.05)],median:sample[Math.floor(sample.length*.5)],
  p95:sample[Math.floor(sample.length*.95)],min:sample[0],max:sample.at(-1),
  distribution:Object.fromEntries(uniq(sample).map(z=>[String(z),sample.filter(v=>v===z).length])),
  tail:Object.fromEntries(METHODS.map(m=>[m,
   (sample.filter(x=>x>=methods[m].top10).length+1)/(sample.length+1)]))};
 const winnersOnly=cases.flatMap(x=>x.winnersOnly.map(w=>({
  date:x.date,turn:x.turn,head:x.heads.filter(h=>fam(h.slice(-3))===w.family),
  family:w.family,band:w.band,blocks:w.blocks,sources:w.sources,shapes:w.shapes,
  newInDay:w.newInDay,physicalPaths:w.paths
 })));
 const results={date:'2026-10-13',cuts:115,heads:575,bands:bandResults,
  selectors:methods,neutral:neutralStats,
  unanchoredWinnerFamilies:winnersOnly.length,winnersOnly,
  monthSelectors:Object.fromEntries(['2026-09','2026-10'].map(m=>[m,
   Object.fromEntries(METHODS.map(k=>[k,cases.filter(x=>x.date.startsWith(m)&&x.results[k].top10).length]))])),
  hashes:seal,caution:'Exploratorio en 115 cortes repetidos; 1000 terminaciones uniformes es solo referencia hipotética y no valida predicción'};
 save('POST_115.json',{cases});
 save('RESUMEN.json',results);
 const lines=BANDS.map(b=>{const s=bandResults[b];return '| '+b+' | '+s.avgTerminals+
 ' | '+s.observed+' | '+s.expected+' | '+s.pBonferroni.toFixed(4)+' |';}).join('\n');
 const choices=METHODS.map(m=>{const s=methods[m];return '| '+m+' | '+s.top3+' | '+s.top5+' | '+s.top10+
 ' | '+s.gained.length+' | '+s.lost.length+' | '+s.selectedNew+' |';}).join('\n');
 const md='# Auditoría de ternas VT3 físicamente presentes y no elegidas\n\n'+
 '**115 cortes — sólo lectura de hojas selladas.** Los 79 registros históricos de familia ganadora física sin raíz se contrastaron contra toda la exposición numérica disponible; no equivalen a 79 aciertos Top10.\n\n'+
 '## Exposición ajustada al tamaño de la bolsa\n\n| Clase | Terminaciones 000–999 medias/corte | Cabezas observadas | Esperadas bajo uniforme | p bilateral Bonferroni (10) |\n'+
 '|---|---:|---:|---:|---:|\n'+lines+'\n\n'+
 '## Sustituir una plaza del Top10 (nueve oficiales fijas)\n\n| Política | Top3 | Top5 | Top10 | Ganó cortes | Perdió cortes | Sin raíz seleccionada (cortes) |\n'+
 '|---|---:|---:|---:|---:|---:|---:|\n'+choices+'\n\n'+
 'Control neutral de 2000 decisiones de la misma bolsa PRE, Top10 medio: '+
 neutralStats.mean+', intervalo percentil 5–95: '+neutralStats.p05+'–'+neutralStats.p95+'.\n\n'+
 '**Interpretación:** descripción histórica, no prueba de ventaja; todas las selecciones PRE se fijaron antes de revelar los resultados en el workflow. No se alteró el motor ni la clasificación oficial.\n';
 writeFileSync(OUT+'LECTURA.md',md);
 console.log('POST_TERMAS_OK',JSON.stringify({bands:Object.fromEntries(BANDS.map(b=>[b,{
  obs:bandResults[b].observed,expected:bandResults[b].expected,
  pAdj:bandResults[b].pBonferroni,cutHits:bandResults[b].observedCuts}])),
  methods,neutral:{reps:2000,mean:neutralStats.mean,p95:neutralStats.p95,tail:neutralStats.tail},
  bornWinners:winnersOnly.filter(x=>x.newInDay).length,unanchoredWinnerFamilies:winnersOnly.length},null,2));
}
if(process.argv[2]==='pre')before();else if(process.argv[2]==='post')after();
else throw Error('Usage: pre|post');
