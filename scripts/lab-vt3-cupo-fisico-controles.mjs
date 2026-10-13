import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const SRC='auditorias/vt3-transformaciones-bloque-115-13oct2026/';
const BASE='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OUT='auditorias/vt3-cupo-fisico-controles-115-13oct2026/';
const PROTOCOL='PROTOCOLO_VT3_CUPO_FISICO_CONTROLES_13OCT2026.md';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const methods=['ORIGINAL','RENEW_LAST_BLOCKS','RENEW_MOST_BLOCKS','RENEW_MOST_SOURCES',
 'RENEW_FEWEST_BLOCKS','RENEW_ALPHABETIC','RENEW_REVERSE_ALPHA','RENEW_HASH_FIXED'];
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(name,x)=>writeFileSync(OUT+name,JSON.stringify(x,null,2)+'\n');
const key=x=>x.date+'|'+x.turn;
const fam=h=>{assert.match(h,/^\d{4}$/);let t=h.slice(-3);return [t,[...t].reverse().join('')].sort().join('/')};
function xorshift(seed){let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296}}
mkdirSync(OUT,{recursive:true});
function validate(){
 const seal=json(SRC+'SELLO.json');
 assert.equal(seal.pre,sha(read(SRC+'PRE_115.json')));
 assert.equal(seal.nocturna,sha(read(SRC+'NOCTURNA_PRE.json')));
 return seal;
}
function policiesFor(row){
 const original=row.rankings.ORIGINAL;
 assert.equal(original.length,10);
 const eligible=row.profiles.filter(p=>!p.anchored&&p.allSourcesNew);
 const sort=(cmp)=>eligible.slice().sort(cmp).map(x=>x.family);
 const lexical=(a,b)=>a.family.localeCompare(b.family);
 const pref=(a,b)=>Number(b.latestPhysical)-Number(a.latestPhysical);
 const hashKey=p=>sha('20261013|'+row.date+'|'+row.turn+'|'+p.family);
 const ranked={
  RENEW_LAST_BLOCKS:sort((a,b)=>pref(a,b)||b.blockCount-a.blockCount||lexical(a,b)),
  RENEW_MOST_BLOCKS:sort((a,b)=>b.blockCount-a.blockCount||pref(a,b)||lexical(a,b)),
  RENEW_MOST_SOURCES:sort((a,b)=>b.sourceCount-a.sourceCount||b.blockCount-a.blockCount||lexical(a,b)),
  RENEW_FEWEST_BLOCKS:sort((a,b)=>a.blockCount-b.blockCount||lexical(a,b)),
  RENEW_ALPHABETIC:sort(lexical),
  RENEW_REVERSE_ALPHA:sort((a,b)=>lexical(b,a)),
  RENEW_HASH_FIXED:sort((a,b)=>hashKey(a).localeCompare(hashKey(b)))
 };
 const tops={ORIGINAL:[...original]};
 for(const [method,arr] of Object.entries(ranked)){
  tops[method]=arr.length?original.slice(0,9).concat(arr[0]):[...original];
  assert.equal(tops[method].length,10);
  assert.equal(new Set(tops[method]).size,10);
  assert.deepEqual(tops[method].slice(0,9),original.slice(0,9));
 }
 // Integrity check of the historical 18/115 approach, byte-for-byte list of families.
 assert.deepEqual(tops.RENEW_LAST_BLOCKS,row.rankings.ABIERTA_FUENTE_RENOVADA_1);
 return {date:row.date,turn:row.turn,eligibles:eligible.map(x=>x.family),
  eligibleCount:eligible.length,tops,
  poolStats:{latest:eligible.filter(x=>x.latestPhysical).length,
   minBlocks:eligible.length?Math.min(...eligible.map(x=>x.blockCount)):null,
   maxBlocks:eligible.length?Math.max(...eligible.map(x=>x.blockCount)):null}};
}
function prepare(){
 for(const p of [SRC+'POST_115.json',SRC+'NOCTURNA_POST.json',
  BASE+'POST_115.json',BASE+'NOCTURNA_POST_DIAGNOSTICO.json'])
  assert.ok(!existsSync(p),'POST visible before PRE: '+p);
 const old=json(SRC+'PRE_115.json').rows;
 assert.equal(old.length,115);
 const rows=old.map(policiesFor);
 assert.equal(rows.length,115);
 assert.equal(new Set(rows.map(key)).size,115);
 const rng=xorshift(20261013),R=2000;
 const randomRows=[];
 for(let sample=0;sample<R;sample++){
  const choices=rows.map(c=>c.eligibles.length?
   c.eligibles[Math.floor(rng()*c.eligibles.length)]:null);
  randomRows.push(choices);
 }
 const n=policiesFor(json(SRC+'NOCTURNA_PRE.json'));
 save('PRE_115.json',{rows,methods,randomReps:R});
 save('RANDOM_PRE.json',{seed:20261013,randomReps:R,choices:randomRows});
 save('NOCTURNA_PRE.json',n);
 const srcSeal=validate();
 const seal={srcSealSha256:sha(read(SRC+'SELLO.json')),srcPre:srcSeal.pre,
  protocol:sha(read(PROTOCOL)),code:sha(read('scripts/lab-vt3-cupo-fisico-controles.mjs')),
  pre:sha(read(OUT+'PRE_115.json')),random:sha(read(OUT+'RANDOM_PRE.json')),
  nocturna:sha(read(OUT+'NOCTURNA_PRE.json'))};
 save('SELLO.json',seal);
 console.log('VT3_CUPO_PRE_OK',JSON.stringify({cuts:rows.length,eligibleCuts:rows.filter(x=>x.eligibleCount).length,
  eligibleAvg:rows.reduce((x,r)=>x+r.eligibleCount,0)/rows.length,randomDraws:R*rows.length,seal}));
}
function evaluate(){
 const seal=json(OUT+'SELLO.json');
 assert.equal(seal.srcSealSha256,sha(read(SRC+'SELLO.json')));
 assert.equal(seal.srcPre,validate().pre);
 assert.equal(seal.protocol,sha(read(PROTOCOL)));
 assert.equal(seal.code,sha(read('scripts/lab-vt3-cupo-fisico-controles.mjs')));
 assert.equal(seal.pre,sha(read(OUT+'PRE_115.json')));
 assert.equal(seal.random,sha(read(OUT+'RANDOM_PRE.json')));
 assert.equal(seal.nocturna,sha(read(OUT+'NOCTURNA_PRE.json')));
 const cuts=json(OUT+'PRE_115.json').rows;
 const post=json(BASE+'POST_115.json').rows;
 const random=json(OUT+'RANDOM_PRE.json').choices;
 assert.equal(cuts.length,115);assert.equal(post.length,115);assert.equal(random.length,2000);
 const results=cuts.map((cut,i)=>{
  const p=post[i];assert.equal(key(cut),key(p));
  const goals=new Set(p.targets.map(fam));
  const hits=Object.fromEntries(methods.map(m=>{
   const top=cut.tops[m];
   return [m,{top3:top.slice(0,3).some(f=>goals.has(f)),
    top5:top.slice(0,5).some(f=>goals.has(f)),
    top10:top.some(f=>goals.has(f)),
    hits:top.filter(f=>goals.has(f)),
    rank10Winner:goals.has(top[9])}];
  }));
  return {date:cut.date,turn:cut.turn,goals:[...goals],hits};
 });
 function summarize(rs){
  return Object.fromEntries(methods.map(m=>{
   const gained=rs.filter(x=>x.hits[m].top10&&!x.hits.ORIGINAL.top10).map(key);
   const lost=rs.filter(x=>!x.hits[m].top10&&x.hits.ORIGINAL.top10).map(key);
   return [m,{cuts:rs.length,top3:rs.filter(x=>x.hits[m].top3).length,
    top5:rs.filter(x=>x.hits[m].top5).length,
    top10:rs.filter(x=>x.hits[m].top10).length,
    tenthWinning:rs.filter(x=>x.hits[m].rank10Winner).length,
    gained,lost}];
  }));
 }
 const total=summarize(results);
 assert.deepEqual([total.ORIGINAL.top3,total.ORIGINAL.top5,total.ORIGINAL.top10,total.ORIGINAL.tenthWinning],[5,8,15,0]);
 assert.equal(total.RENEW_LAST_BLOCKS.top10,18);
 const byMonth=Object.fromEntries([...new Set(cuts.map(x=>x.date.slice(0,7)))].map(m=>[m,summarize(results.filter(x=>x.date.startsWith(m)))]));
 const byTurn=Object.fromEntries(TURNS.map(t=>[t,summarize(results.filter(x=>x.turn===t))]));
 const neutral=[];
 for(const choices of random){
  assert.equal(choices.length,cuts.length);
  let cutsWithHit=0,winAtSlot=0;
  for(let i=0;i<115;i++){
   const c=cuts[i],targets=new Set(results[i].goals),selected=choices[i];
   if(selected!==null)assert.ok(c.eligibles.includes(selected));
   const prefixWin=c.tops.ORIGINAL.slice(0,9).some(f=>targets.has(f));
   cutsWithHit+=Number(prefixWin||selected!==null&&targets.has(selected));
   winAtSlot+=Number(selected!==null&&targets.has(selected));
  }
  neutral.push({top10:cutsWithHit,tenthWinning:winAtSlot});
 }
 const neutralValues=neutral.map(x=>x.top10).sort((a,b)=>a-b);
 const average=neutralValues.reduce((a,b)=>a+b,0)/neutralValues.length;
 const distribution={draws:neutralValues.length,
  mean:average,median:neutralValues[Math.floor(neutralValues.length/2)],
  p05:neutralValues[Math.floor(neutralValues.length*.05)],
  p95:neutralValues[Math.floor(neutralValues.length*.95)],
  max:neutralValues.at(-1),min:neutralValues[0],
  relativeToRenewed18:neutralValues.filter(v=>v>=total.RENEW_LAST_BLOCKS.top10).length/neutralValues.length,
  histogram:Object.fromEntries([...new Set(neutralValues)].map(v=>[String(v),neutralValues.filter(x=>x===v).length]))};
 const dates=[...new Set(cuts.map(x=>x.date))].sort();
 assert.equal(dates.length,23);
 const preMap=new Map(cuts.map(x=>[key(x),x]));
 const postMap=new Map(post.map(x=>[key(x),x]));
 const matrices=methods.map(()=>Array.from({length:23},()=>Array(23).fill(0)));
 for(let i=0;i<23;i++)for(let j=0;j<23;j++)for(const t of TURNS){
  const c=preMap.get(dates[i]+'|'+t),p=postMap.get(dates[j]+'|'+t);
  const goals=new Set(p.targets.map(fam));
  methods.forEach((m,k)=>matrices[k][i][j]+=Number(c.tops[m].some(f=>goals.has(f))));
 }
 const ids=dates.map((_,i)=>i);
 const count=assign=>methods.map((m,k)=>assign.reduce((s,j,i)=>s+matrices[k][i][j],0));
 assert.equal(count(ids)[0],15);
 const controls={};
 const weekday=d=>new Date(d+'T12:00:00Z').getUTCDay();
 const group=(fn)=>{
  const by=new Map();dates.forEach((d,i)=>{const k=fn(d);
   if(!by.has(k))by.set(k,[]);by.get(k).push(i);});
  return [...by.values()];
 };
 const schemes={free:[ids],sameWeekday:group(weekday),sameMonth:group(d=>d.slice(0,7))};
 const companions=['ORIGINAL','RENEW_HASH_FIXED','RENEW_MOST_BLOCKS'];
 for(const [i,[name,groups]] of Object.entries(schemes).entries()){
  const rand=xorshift(20261013+i*1009);
  const distr=Object.fromEntries(companions.map(c=>[c,[]]));
  for(let n=0;n<10000;n++){
   const shuffled=[...ids];
   for(const positions of groups){
    const pool=positions.map(i=>shuffled[i]);
    for(let k=pool.length-1;k>0;k--){const j=Math.floor(rand()*(k+1));[pool[k],pool[j]]=[pool[j],pool[k]]}
    positions.forEach((position,k)=>shuffled[position]=pool[k]);
   }
   const values=count(shuffled),chosen=values[methods.indexOf('RENEW_LAST_BLOCKS')];
   for(const c of companions)distr[c].push(chosen-values[methods.indexOf(c)]);
  }
  controls[name]=Object.fromEntries(companions.map(c=>{
   const sorted=distr[c].sort((a,b)=>a-b);
   const actual=total.RENEW_LAST_BLOCKS.top10-total[c].top10;
   return [c,{observedDelta:actual,meanDelta:Number((sorted.reduce((a,b)=>a+b,0)/sorted.length).toFixed(4)),
    p05:sorted[499],median:sorted[4999],p95:sorted[9499],
    tailAtLeastObserved:(sorted.filter(x=>x>=actual).length+1)/(sorted.length+1)}];
  }));
 }
 const npre=json(OUT+'NOCTURNA_PRE.json'),npost=json(BASE+'NOCTURNA_POST_DIAGNOSTICO.json');
 const nwins=new Set(npost.targets.map(fam));
 const watch=npost.targets.map(head=>{const f=fam(head);return {head,family:f,eligible:npre.eligibles.includes(f),
  ranks:Object.fromEntries(methods.map(m=>[m,npre.tops[m].indexOf(f)<0?null:npre.tops[m].indexOf(f)+1]))}});
 save('POST_115.json',{cuts:results});
 save('NOCTURNA_POST.json',{heads:npost.targets,watch,top:Object.fromEntries(methods.map(m=>[m,npre.tops[m].filter(f=>nwins.has(f))])),
  warning:'Relectura retrospectiva, no sello predictivo anterior al sorteo'});
 const recap={date:'2026-10-13',cuts:115,days:23,
  policies:total,byMonth,byTurn,eligibleCounts:{
   total:cuts.reduce((x,r)=>x+r.eligibleCount,0),
   cutsWithEligible:cuts.filter(x=>x.eligibleCount>0).length,
   mean:cuts.reduce((x,r)=>x+r.eligibleCount,0)/cuts.length,
   max:Math.max(...cuts.map(x=>x.eligibleCount))
  },neutral,neutralDistribution:distribution,permutationControls:controls,
  seal,postHash:sha(read(BASE+'POST_115.json')),
  caution:'Reutilización intensiva de 23 jornadas; controles no son validación ciega ni prueba de predicción en sorteos aleatorios.'};
 // The 2000 outcomes stored as two summaries each; order matches sealed RANDOM_PRE.
 save('RESUMEN.json',recap);
 console.log('VT3_CUPO_POST_OK',JSON.stringify({total,distribution,controls,watch},null,2));
}
if(process.argv[2]==='pre')prepare();
else if(process.argv[2]==='post')evaluate();
else throw Error('use pre|post');
