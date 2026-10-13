import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const BASE='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OTHER='auditorias/vt3-transiciones-individuales-115-13oct2026/';
const OUT='auditorias/vt3-transformaciones-bloque-115-13oct2026/';
const PH='PROTOCOLO_VT3_TRANSFORMACIONES_BLOQUE_13OCT2026.md';
const SHA='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const PRIOR='02a1a4a10de5371c87f2fa2d7fbdbc6a8672642a9664ef2cba0eeefa99613224';
const turns=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const flags=['exactBlock','changeOneCell','translated','cleanTranslation','disjointSource','allSourcesNew','changedShape'];
const policies=['ORIGINAL','ANCLADA_TRASLADA','ANCLADA_CAMBIO_1_CELDA','ANCLADA_IDENTICA','ANCLADA_FUENTE_RENOVADA','ANCLADA_TRASLADA_O_CAMBIA','ABIERTA_TRASLADA_1','ABIERTA_CAMBIO_1_CELDA','ABIERTA_FUENTE_RENOVADA_1','ABIERTA_TRASLADA_CONTROL_HASH'];
const read=x=>readFileSync(x,'utf8'),load=x=>JSON.parse(read(x));
const hash=x=>createHash('sha256').update(x).digest('hex');
const save=(f,x)=>writeFileSync(OUT+f,JSON.stringify(x,null,2)+'\n');
const key=x=>x.date+'|'+x.turn;
const fam=x=>[x,[...x].reverse().join('')].sort().join('/');
const goal=h=>{assert.match(h,/^\d{4}$/);return fam(h.slice(-3));};
mkdirSync(OUT,{recursive:true});
assert.equal(hash(read(BASE+'PRE_115.json')),SHA);
assert.equal(hash(read(OTHER+'PRE_115.json')),PRIOR);
const bk=cs=>cs.slice().sort().join(',');
function norm(cs){
 const xy=cs.map(x=>x.split(':').map(Number)),minR=Math.min(...xy.map(x=>x[0])),minC=Math.min(...xy.map(x=>x[1]));
 return xy.map(([r,c])=>(r-minR)+':'+(c-minC)).sort().join(',');
}
function group(witnesses){
 const result=new Map();
 for(const p of witnesses){
  assert.equal(p.cells.length,3);assert.equal(new Set(p.cells).size,3);
  const source=p.source;
  assert.ok(['prevNocturno','Previa','Primera','Matutino','Vespertino'].includes(source));
  const k=bk(p.cells);
  if(!result.has(source))result.set(source,new Map());
  if(!result.get(source).has(k))result.get(source).set(k,{k,cells:k.split(','),shape:norm(p.cells)});
 }
 return result;
}
function calculate(row,old){
 const historic=old?new Map(old.witnesses.map(x=>[x.family,group(x.paths)])):new Map();
 const witnessed=new Map(row.witnesses.map(x=>[x.family,group(x.paths)]));
 const admitted=new Map(row.strategies.A_ORIGINAL.map(x=>[x.family,x]));
 const profiles=row.strategies.B_INVENTARIO.map(f=>{
  const current=witnessed.get(f.family);assert.ok(current);
  const past=historic.get(f.family)||new Map();
  const common=[...current.keys()].filter(s=>past.has(s));
  let identical=0,changedOne=0,shift=0,changedShape=0,total=0,anyOverlap=false;
  for(const source of common)for(const x of current.get(source).values())for(const y of past.get(source).values()){
   assert.equal(x.cells.length,3);assert.equal(y.cells.length,3);
   total++;
   const intersect=x.cells.filter(a=>y.cells.includes(a)).length;
   if(intersect)anyOverlap=true;
   if(x.k===y.k)identical++;
   if(x.k!==y.k&&intersect===2)changedOne++;
   if(x.k!==y.k&&x.shape===y.shape)shift++;
   if(x.shape!==y.shape)changedShape++;
  }
  const a=admitted.get(f.family);
  const v={
   family:f.family,anchored:Boolean(a),originalRank:a?.rank??null,
   palindrome:f.family.split('/')[0]===f.family.split('/')[1],
   sourceCount:f.sources,blockCount:f.blocks,
   d1:a?.d1||0,d7:a?.d7||0,
   rootType:a?.d1&&a?.d7?'ambas':a?.d1?'D-1':a?.d7?'D-7':'ninguna',
   hasPrevious:Boolean(old),commonSources:common.length,
   exactBlock:identical>0,changeOneCell:changedOne>0,
   translated:shift>0,cleanTranslation:shift>0&&identical===0,
   disjointSource:common.length>0&&!anyOverlap,
   allSourcesNew:Boolean(old&&common.length===0),
   changedShape:changedShape>0,
   identicalPairs:identical,oneCellPairs:changedOne,translatedPairs:shift,shapeDifferentPairs:changedShape,
   comparableBlockPairs:total,
   latestPhysical:current.has(['prevNocturno','Previa','Primera','Matutino','Vespertino'][turns.indexOf(row.turn)])
  };
  assert.equal(common.length>0,total>0);
  if(v.cleanTranslation)assert.ok(v.translated&&!v.exactBlock);
  if(v.disjointSource)assert.ok(!v.exactBlock&&!v.changeOneCell);
  return v;
 });
 const anchor=profiles.filter(x=>x.anchored).sort((a,b)=>a.originalRank-b.originalRank);
 const orig=row.strategies.A_ORIGINAL.map(x=>x.family);
 assert.deepEqual(anchor.map(x=>x.family),orig);
 assert.ok(orig.length>=10);
 const results={ORIGINAL:orig.slice(0,10)};
 const order=(name,fn)=>results[name]=anchor.slice().sort((a,b)=>fn(b)-fn(a)||a.originalRank-b.originalRank)
  .slice(0,10).map(x=>x.family);
 order('ANCLADA_TRASLADA',x=>Number(x.cleanTranslation));
 order('ANCLADA_CAMBIO_1_CELDA',x=>Number(x.changeOneCell));
 order('ANCLADA_IDENTICA',x=>Number(x.exactBlock));
 order('ANCLADA_FUENTE_RENOVADA',x=>Number(x.allSourcesNew));
 order('ANCLADA_TRASLADA_O_CAMBIA',x=>x.cleanTranslation?2:x.changeOneCell?1:0);
 const others=profiles.filter(x=>!x.anchored);
 const open=(name,test,cmp)=>{let eligible=others.filter(test).sort(cmp);
  results[name]=eligible.length?orig.slice(0,9).concat(eligible[0].family):orig.slice(0,10);};
 const cmp=(field)=>(a,b)=>b[field]-a[field]||b.sourceCount-a.sourceCount||b.blockCount-a.blockCount||a.family.localeCompare(b.family);
 open('ABIERTA_TRASLADA_1',x=>x.cleanTranslation,cmp('translatedPairs'));
 open('ABIERTA_CAMBIO_1_CELDA',x=>x.changeOneCell,cmp('oneCellPairs'));
 open('ABIERTA_FUENTE_RENOVADA_1',x=>x.allSourcesNew,(a,b)=>
  Number(b.latestPhysical)-Number(a.latestPhysical)||b.blockCount-a.blockCount||a.family.localeCompare(b.family));
 const h=x=>hash('20261013|'+row.date+'|'+row.turn+'|'+x.family);
 open('ABIERTA_TRASLADA_CONTROL_HASH',x=>x.cleanTranslation,(a,b)=>h(a).localeCompare(h(b)));
 for(const name of policies){
  assert.equal(results[name].length,10);
  assert.equal(new Set(results[name]).size,10);
  if(!old)assert.deepEqual(results[name],orig.slice(0,10));
  if(name.startsWith('ABIERTA'))assert.deepEqual(results[name].slice(0,9),orig.slice(0,9));
 }
 return {date:row.date,turn:row.turn,priorDate:old?.date??null,profiles,rankings:results};
}
function pre(){
 for(const path of [BASE+'POST_115.json',BASE+'NOCTURNA_POST_DIAGNOSTICO.json',OTHER+'POST_115.json',OTHER+'NOCTURNA_POST.json'])
  assert.ok(!existsSync(path),'POST visible: '+path);
 const source=load(BASE+'PRE_115.json').rows;
 const dates=[...new Set(source.map(x=>x.date))].sort();
 assert.equal(source.length,115);assert.equal(dates.length,23);
 const m=new Map(source.map(x=>[key(x),x]));
 const rows=[];
 for(let i=0;i<dates.length;i++)for(const turn of turns){
  const row=m.get(dates[i]+'|'+turn);assert.ok(row);
  const prior=i?m.get(dates[i-1]+'|'+turn):null;
  rows.push(calculate(row,prior));
 }
 const noct=load(BASE+'NOCTURNA_SIMULACION.json').row;
 assert.equal(noct.date,'2026-10-12');assert.equal(noct.turn,'Nocturno');
 assert.equal(dates.at(-1),'2026-10-10');
 const noctRow=calculate(noct,m.get('2026-10-10|Nocturno'));
 save('PRE_115.json',{dates,rows});
 save('NOCTURNA_PRE.json',noctRow);
 const seal={sourcePre:SHA,priorLabPre:PRIOR,protocol:hash(read(PH)),
  code:hash(read('scripts/lab-vt3-transformaciones-bloque.mjs')),
  pre:hash(read(OUT+'PRE_115.json')),nocturna:hash(read(OUT+'NOCTURNA_PRE.json'))};
 save('SELLO.json',seal);
 console.log('VT3_BLOQUES_PRE_PASS',JSON.stringify({cuts:rows.length,
  families:rows.reduce((n,r)=>n+r.profiles.length,0),seal}));
}
function post(){
 const s=load(OUT+'SELLO.json');
 assert.equal(s.sourcePre,hash(read(BASE+'PRE_115.json')));
 assert.equal(s.priorLabPre,hash(read(OTHER+'PRE_115.json')));
 assert.equal(s.protocol,hash(read(PH)));
 assert.equal(s.code,hash(read('scripts/lab-vt3-transformaciones-bloque.mjs')));
 assert.equal(s.pre,hash(read(OUT+'PRE_115.json')));
 assert.equal(s.nocturna,hash(read(OUT+'NOCTURNA_PRE.json')));
 const rows=load(OUT+'PRE_115.json').rows,post=load(BASE+'POST_115.json').rows;
 assert.equal(rows.length,115);assert.equal(post.length,115);
 const scored=rows.map((c,i)=>{
  const r=post[i];assert.equal(key(c),key(r));
  const wins=new Set(r.targets.map(goal));
  const tests=Object.fromEntries(policies.map(p=>{
   const names=c.rankings[p],hits=names.filter(f=>wins.has(f));
   return [p,{top3:names.slice(0,3).some(f=>wins.has(f)),
    top5:names.slice(0,5).some(f=>wins.has(f)),top10:hits.length>0,hits}];
  }));
  return {date:c.date,turn:c.turn,targets:r.targets,tests};
 });
 function stats(selection){
  return Object.fromEntries(policies.map(p=>{
   const cuts=selection.length,top3=selection.filter(r=>r.tests[p].top3).length;
   const top5=selection.filter(r=>r.tests[p].top5).length;
   const top10=selection.filter(r=>r.tests[p].top10).length;
   const gains=selection.filter(r=>r.tests[p].top10&&!r.tests.ORIGINAL.top10).map(key);
   const losses=selection.filter(r=>!r.tests[p].top10&&r.tests.ORIGINAL.top10).map(key);
   return [p,{cuts,top3,top5,top10,gains,losses}];
  }));
 }
 const total=stats(scored);
 assert.deepEqual([total.ORIGINAL.top3,total.ORIGINAL.top5,total.ORIGINAL.top10],[5,8,15]);
 const month=Object.fromEntries([...new Set(rows.map(r=>r.date.slice(0,7)))].map(m=>
  [m,stats(scored.filter(r=>r.date.startsWith(m)))]));
 const turn=Object.fromEntries(turns.map(t=>[t,stats(scored.filter(r=>r.turn===t))]));
 const signals=Object.fromEntries(flags.map(f=>[f,{exposures:0,winners:0,anchored:0,anchoredWinners:0}]));
 const matched=Object.fromEntries(flags.map(f=>[f,{observed:0,expected:0,mixedGroups:0,excludedWinners:0}]));
 for(let i=0;i<115;i++){
  const winners=new Set(post[i].targets.map(goal)),bins=new Map();
  for(const p of rows[i].profiles){
   for(const f of flags)if(p[f]){
    const x=signals[f];x.exposures++;x.winners+=Number(winners.has(p.family));
    x.anchored+=Number(p.anchored);x.anchoredWinners+=Number(p.anchored&&winners.has(p.family));
   }
   const label=[Number(p.anchored),Number(p.palindrome),Math.min(2,p.sourceCount),
    Math.min(3,p.blockCount),p.rootType].join('|');
   if(!bins.has(label))bins.set(label,[]);
   bins.get(label).push(p);
  }
  for(const group of bins.values()){
   const hits=group.filter(x=>winners.has(x.family));if(!hits.length)continue;
   for(const f of flags){
    const count=group.filter(x=>x[f]).length,t=matched[f];
    if(group.length<2||count===0||count===group.length){t.excludedWinners+=hits.length;continue}
    t.mixedGroups++;t.observed+=hits.filter(x=>x[f]).length;
    t.expected+=hits.length*count/group.length;
   }
  }
 }
 for(const x of Object.values(matched)){x.expected=Number(x.expected.toFixed(5));x.delta=Number((x.observed-x.expected).toFixed(5))}
 const dates=[...new Set(rows.map(r=>r.date))].sort(),N=10000;
 const P=new Map(rows.map(r=>[key(r),r])),O=new Map(post.map(r=>[key(r),r]));
 const mx=policies.map(()=>Array.from({length:23},()=>Array(23).fill(0)));
 for(let i=0;i<23;i++)for(let j=0;j<23;j++)for(const t of turns){
  const a=P.get(dates[i]+'|'+t),b=O.get(dates[j]+'|'+t),wins=new Set(b.targets.map(goal));
  policies.forEach((p,k)=>mx[k][i][j]+=Number(a.rankings[p].some(f=>wins.has(f))));
 }
 const ids=dates.map((_,i)=>i),evalScores=perm=>policies.map((p,k)=>
  perm.reduce((n,j,i)=>n+mx[k][i][j],0));
 assert.equal(evalScores(ids)[0],15);
 let seed=20261013;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296};
 const placebo=policies.map(()=>[]);
 for(let n=0;n<N;n++){
  const shuffle=[...ids];
  for(let k=22;k>0;k--){let j=Math.floor(random()*(k+1));[shuffle[k],shuffle[j]]=[shuffle[j],shuffle[k]];}
  const vals=evalScores(shuffle);vals.forEach((v,k)=>placebo[k].push(v-vals[0]));
 }
 const controls=Object.fromEntries(policies.slice(1).map(p=>{
  const v=placebo[policies.indexOf(p)].sort((a,b)=>a-b);
  const difference=total[p].top10-15;
  return [p,{delta:difference,nullMean:Number((v.reduce((a,b)=>a+b,0)/N).toFixed(4)),
    p05:v[Math.floor((N-1)*.05)],median:v[Math.floor((N-1)*.5)],
    p95:v[Math.floor((N-1)*.95)],
    upperTail:(v.filter(x=>x>=difference).length+1)/(N+1)}];
 }));
 const n=load(OUT+'NOCTURNA_PRE.json'),np=load(BASE+'NOCTURNA_POST_DIAGNOSTICO.json');
 const nw=new Set(np.targets.map(goal));
 const nocturnal={
  heads:np.targets,
  cases:np.targets.map(h=>{const f=goal(h),x=n.profiles.find(p=>p.family===f);
   return {head:h,family:f,profile:x||null,
    ranks:Object.fromEntries(policies.map(policy=>[policy,n.rankings[policy].indexOf(f)<0?null:n.rankings[policy].indexOf(f)+1]))}
  }),
  top:Object.fromEntries(policies.map(policy=>[policy,n.rankings[policy].filter(f=>nw.has(f))])),
  warning:'Diagnóstico retrospectivo; no modifica predicción real sellada el 12/10.'};
 save('POST_115.json',{rows:scored});
 save('NOCTURNA_POST.json',nocturnal);
 save('RESUMEN.json',{days:23,cuts:115,total,
   excludingFirstDay:stats(scored.filter(r=>r.date!=='2026-09-15')),
   byMonth:month,byTurn:turn,signals,matched,controls,
   seal:s,postHash:hash(read(BASE+'POST_115.json')),
   limitation:'Retrospectiva en 23 días reutilizados. Ninguna transformación demuestra capacidad predictiva.'});
 console.log('VT3_BLOQUES_POST_PASS',JSON.stringify({results:Object.fromEntries(policies.map(p=>[p,total[p].top10])),
   signals,matched,controls,nocturnal:nocturnal.cases.map(x=>({head:x.head,
    exact:x.profile?.exactBlock,shift:x.profile?.cleanTranslation,oneCell:x.profile?.changeOneCell,
    renewed:x.profile?.allSourcesNew}))},null,2));
}
if(process.argv[2]==='pre')pre();
else if(process.argv[2]==='post')post();
else throw Error('use pre|post');
