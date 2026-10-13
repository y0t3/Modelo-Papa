import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const src='auditorias/vt3-nacimientos-convergencias-115-13oct2026/';
const origin='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const out='auditorias/vt3-equilibrio-estados-115-13oct2026/';
const protocol='PROTOCOLO_VT3_EQUILIBRIO_ESTADOS_13OCT2026.md';
const expectedInput='512331f2695e2b632c7f2077f2dd7437041d00ee724556cf754e22f986a07f2b';
const expectedNoct='86426d26f2a90032ae7266bc094642c558628cf43c02b9838f31134bed33b5d8';
const states=['NACE_FISICAMENTE','CONVERGE_FUENTES','YA_PRESENTE'];
const turns=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const policies=['OFICIAL','M1_P3','M2_P3','M3_P3','M2_P5','M2_P0','CAP6_P3',
 'M1_P3_BRIDGE1','M2_P3_BRIDGE1','M2_P3_FRESH1','M2_P3_BRIDGE2',
 'OPEN_BRIDGE1_ORIG','OPEN_BRIDGE2_ORIG','M2_P3_HASH_CONTROL'];
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const hash=s=>createHash('sha256').update(s).digest('hex');
const save=(f,x)=>writeFileSync(out+f,JSON.stringify(x,null,2)+'\n');
const key=x=>x.date+'|'+x.turn;
const rev=s=>[...s].reverse().join('');
const family=s=>[s,rev(s)].sort().join('/');
const toFamily=h=>{assert.match(h,/^\d{4}$/);return family(h.slice(-3))};
const categorical=f=>f.state==='INICIAL'?'INICIAL':f.state;
const customHash=(date,turn,f)=>hash('20261013|balance|null|'+date+'|'+turn+'|'+f);
mkdirSync(out,{recursive:true});
assert.equal(hash(read(src+'PRE_115.json')),expectedInput,'PRE de familias modificado');
assert.equal(hash(read(src+'NOCTURNA_PRE.json')),expectedNoct,'PRE nocturno modificado');

function build(cut){
 const top=cut.rankings.ORIGINAL;
 assert.equal(top.length,10);assert.equal(new Set(top).size,10);
 const anchored=cut.profiles.filter(x=>x.anchored).sort((a,b)=>a.originalRank-b.originalRank);
 const originFamilies=anchored.map(x=>x.family);
 assert.equal(new Set(originFamilies).size,originFamilies.length);
 assert.deepEqual(top,originFamilies.slice(0,10));
 assert.ok(anchored.length>=10,'Bolsa insuficiente');
 const byFamily=new Map(cut.profiles.map(f=>[f.family,f]));
 assert.equal(byFamily.size,cut.profiles.length);
 if(cut.turn==='Previa')assert.ok(anchored.every(x=>x.state==='INICIAL'));
 else assert.ok(anchored.every(x=>states.includes(x.state)));
 const opening=(name)=>cut.rankings[name].filter(f=>!byFamily.get(f).anchored);
 const openBridge1=opening('OPEN_BRIDGE_1');
 const openBridge2=opening('OPEN_BRIDGE_2');
 const openFresh1=opening('OPEN_FRESH_1');
 assert.ok(openBridge1.length<=1&&openBridge2.length<=2&&openFresh1.length<=1);
 assert.deepEqual(cut.rankings.OPEN_BRIDGE_1,originFamilies.slice(0,10-openBridge1.length).concat(openBridge1));
 assert.deepEqual(cut.rankings.OPEN_BRIDGE_2,originFamilies.slice(0,10-openBridge2.length).concat(openBridge2));
 assert.deepEqual(cut.rankings.OPEN_FRESH_1,originFamilies.slice(0,10-openFresh1.length).concat(openFresh1));
 const policiesOut={OFICIAL:[...top]};
 const meta={};
 function doMin(name,min,protect,opened=[],mode='rank'){
  const open=[...opened];
  const capacity=10-open.length;
  assert.ok(capacity>=8,'Cupo anclado menor a ocho');
  const protectedPrefix=anchored.slice(0,protect);
  const chosen=[...protectedPrefix];
  const selected=new Set(chosen.map(x=>x.family));
  const counts=Object.fromEntries(states.map(s=>[s,0]));
  for(const x of chosen)if(states.includes(x.state))counts[x.state]++;
  if(cut.turn!=='Previa'){
   for(const state of states){
    const group=anchored.filter(x=>x.state===state&&!selected.has(x.family));
    if(mode==='hash')group.sort((a,b)=>customHash(cut.date,cut.turn,a.family).localeCompare(customHash(cut.date,cut.turn,b.family)));
    let remaining=Math.min(min-counts[state],group.length);
    while(remaining>0&&chosen.length<capacity){
     const x=group.shift();
     chosen.push(x);selected.add(x.family);counts[state]++;remaining--;
    }
   }
  }
  for(const x of anchored){
   if(chosen.length>=capacity)break;
   if(selected.has(x.family))continue;
   chosen.push(x);selected.add(x.family);
   if(states.includes(x.state))counts[x.state]++;
  }
  assert.equal(chosen.length,capacity,name);
  chosen.sort((a,b)=>a.originalRank-b.originalRank);
  const list=chosen.map(x=>x.family).concat(open);
  assert.equal(list.length,10);assert.equal(new Set(list).size,10);
  assert.deepEqual(list.slice(0,protect),top.slice(0,protect),'Se perdió prefijo protegido');
  if(cut.turn==='Previa')assert.deepEqual(list.slice(0,capacity),top.slice(0,capacity));
  policiesOut[name]=list;
  const available=Object.fromEntries(states.map(s=>[s,anchored.filter(x=>x.state===s).length]));
  const realized=Object.fromEntries(states.map(s=>[s,chosen.filter(x=>x.state===s).length]));
  meta[name]={min,protect,open:open.length,available,realized,
   deficits:Object.fromEntries(states.map(s=>[s,Math.max(0,Math.min(min,available[s])-realized[s])])),
   promotedAnchored:chosen.filter(x=>x.originalRank>10).map(x=>x.family),
   displacedOfficial:top.filter(f=>!list.includes(f))};
 }
 function doCap(name,cap,protect){
  const chosen=[...anchored.slice(0,protect)];
  const counts=Object.fromEntries(states.map(s=>[s,0]));
  for(const x of chosen)if(states.includes(x.state))counts[x.state]++;
  const selected=new Set(chosen.map(x=>x.family));
  for(const x of anchored){
   if(chosen.length>=10)break;
   if(selected.has(x.family))continue;
   if(cut.turn!=='Previa'&&counts[x.state]>=cap)continue;
   chosen.push(x);selected.add(x.family);
   if(states.includes(x.state))counts[x.state]++;
  }
  for(const x of anchored){
   if(chosen.length>=10)break;
   if(selected.has(x.family))continue;
   chosen.push(x);selected.add(x.family);
   if(states.includes(x.state))counts[x.state]++;
  }
  assert.equal(chosen.length,10);
  chosen.sort((a,b)=>a.originalRank-b.originalRank);
  const list=chosen.map(x=>x.family);
  assert.deepEqual(list.slice(0,protect),top.slice(0,protect));
  policiesOut[name]=list;
  meta[name]={cap,protect,realized:counts,promotedAnchored:chosen.filter(x=>x.originalRank>10).map(x=>x.family),
   displacedOfficial:top.filter(f=>!list.includes(f))};
 }
 doMin('M1_P3',1,3);
 doMin('M2_P3',2,3);
 doMin('M3_P3',3,3);
 doMin('M2_P5',2,5);
 doMin('M2_P0',2,0);
 doCap('CAP6_P3',6,3);
 doMin('M1_P3_BRIDGE1',1,3,openBridge1);
 doMin('M2_P3_BRIDGE1',2,3,openBridge1);
 doMin('M2_P3_FRESH1',2,3,openFresh1);
 doMin('M2_P3_BRIDGE2',2,3,openBridge2);
 policiesOut.OPEN_BRIDGE1_ORIG=[...cut.rankings.OPEN_BRIDGE_1];
 policiesOut.OPEN_BRIDGE2_ORIG=[...cut.rankings.OPEN_BRIDGE_2];
 doMin('M2_P3_HASH_CONTROL',2,3,[],'hash');
 for(const p of policies){
  const names=policiesOut[p];assert.ok(names,'Falta política '+p);assert.equal(names.length,10);
  assert.equal(new Set(names).size,10);
  assert.ok(names.every(f=>byFamily.has(f)),'Familia inventada');
  for(const x of names.filter(f=>!byFamily.get(f).anchored))assert.ok(p.includes('BRIDGE')||p.includes('FRESH'),'Familia sin raíz en política anclada');
  if(p.startsWith('M')||p.startsWith('CAP'))assert.deepEqual(names.slice(0,p.includes('_P5')?5:p.includes('_P0')?0:3),top.slice(0,p.includes('_P5')?5:p.includes('_P0')?0:3));
 }
 return {date:cut.date,turn:cut.turn,rankings:policiesOut,
  byFamily:Object.fromEntries(cut.profiles.map(f=>[f.family,{state:categorical(f),anchored:f.anchored,
   officialRank:f.originalRank,ageTurns:f.ageTurns,anchoredNeighbors:f.anchoredNeighborFamilies}])),
  stateCounts:Object.fromEntries(['INICIAL',...states].map(st=>[st,anchored.filter(x=>x.state===st).length])),
  meta};
}
function pre(){
 assert.ok(!existsSync(src+'POST_115.json'));
 assert.ok(!existsSync(src+'NOCTURNA_POST.json'));
 assert.ok(!existsSync(origin+'POST_115.json'));
 assert.ok(!existsSync(origin+'NOCTURNA_POST_DIAGNOSTICO.json'));
 const original=json(src+'PRE_115.json').rows;
 assert.equal(original.length,115);
 const rows=original.map(build);
 const noct=build(json(src+'NOCTURNA_PRE.json'));
 assert.equal(noct.date,'2026-10-12');assert.equal(noct.turn,'Nocturno');
 const dates=[...new Set(rows.map(x=>x.date))].sort();
 assert.equal(dates.length,23);
 assert.equal(rows.length,115);
 for(const d of dates)assert.deepEqual(rows.filter(x=>x.date===d).map(x=>x.turn),turns);
 save('PRE_115.json',{rows,policies,days:dates,notes:'Sólo historial PRE. Sin cabezas objetivo. Familias sin raíz sólo en cupos explícitos.'});
 save('NOCTURNA_PRE.json',noct);
 const seal={sourcePre:expectedInput,sourceNocturna:expectedNoct,script:hash(read('scripts/lab-vt3-equilibrio-estados.mjs')),
   protocol:hash(read(protocol)),pre:hash(read(out+'PRE_115.json')),nocturnaPre:hash(read(out+'NOCTURNA_PRE.json'))};
 save('SELLO.json',seal);
 console.log('VT3_ESTADOS_PRE_OK',JSON.stringify({dates:dates.length,turns:rows.length,metaSample:rows[4].meta.M2_P3,seal}));
}
function post(){
 const seal=json(out+'SELLO.json');
 assert.equal(seal.sourcePre,hash(read(src+'PRE_115.json')));
 assert.equal(seal.sourceNocturna,hash(read(src+'NOCTURNA_PRE.json')));
 assert.equal(seal.script,hash(read('scripts/lab-vt3-equilibrio-estados.mjs')));
 assert.equal(seal.protocol,hash(read(protocol)));
 assert.equal(seal.pre,hash(read(out+'PRE_115.json')));
 assert.equal(seal.nocturnaPre,hash(read(out+'NOCTURNA_PRE.json')));
 const preRows=json(out+'PRE_115.json').rows;
 const origPost=json(src+'POST_115.json').rows;
 assert.equal(preRows.length,115);assert.equal(origPost.length,115);
 const jPost=json(src+'NOCTURNA_POST.json');
 const actualRows=preRows.map((c,i)=>{
  const r=origPost[i];assert.equal(key(c),key(r));
  const goals=new Set(r.heads.map(toFamily));
  const scores=Object.fromEntries(policies.map(p=>{
   const names=c.rankings[p],wins=names.filter(f=>goals.has(f));
   const originalTop=new Set(c.rankings.OFICIAL);
   return [p,{top3:names.slice(0,3).some(f=>goals.has(f)),
    top5:names.slice(0,5).some(f=>goals.has(f)),
    top10:wins.length>0,
    winningFamilies:wins,
    introduced:names.filter(f=>!originalTop.has(f)),
    displaced:c.rankings.OFICIAL.filter(f=>!names.includes(f)),
    introducedWinning:wins.filter(f=>!originalTop.has(f))}];
  }));
  return {date:c.date,turn:c.turn,heads:r.heads,scores};
 });
 const summarize=rows=>{
  const scores=Object.fromEntries(policies.map(p=>[p,{cuts:0,top3:0,top5:0,top10:0,
   winningFamilies:0,promotedWinners:0,changedTop10Cuts:0,numberIntroduced:0}]));
  const paired=Object.fromEntries(policies.filter(p=>p!=='OFICIAL').map(p=>[p,{gained:[],lost:[] }]));
  for(const r of rows)for(const p of policies){
   const x=r.scores[p],c=scores[p];
   c.cuts++;c.top3+=Number(x.top3);c.top5+=Number(x.top5);c.top10+=Number(x.top10);
   c.winningFamilies+=x.winningFamilies.length;
   c.promotedWinners+=x.introducedWinning.length;
   c.changedTop10Cuts+=Number(x.introduced.length>0);
   c.numberIntroduced+=x.introduced.length;
   if(p!=='OFICIAL'){
    if(x.top10&&!r.scores.OFICIAL.top10)paired[p].gained.push(key(r));
    if(!x.top10&&r.scores.OFICIAL.top10)paired[p].lost.push(key(r));
   }
  }
  return {scores,paired};
 };
 const all=summarize(actualRows);
 assert.deepEqual([all.scores.OFICIAL.top3,all.scores.OFICIAL.top5,all.scores.OFICIAL.top10],[5,8,15]);
 assert.deepEqual([all.scores.OPEN_BRIDGE1_ORIG.top10,all.scores.OPEN_BRIDGE2_ORIG.top10],[16,17]);
 const byTurn=Object.fromEntries(turns.map(t=>[t,summarize(actualRows.filter(r=>r.turn===t))]));
 const byMonth=Object.fromEntries([...new Set(actualRows.map(r=>r.date.slice(0,7)))].map(m=>[m,summarize(actualRows.filter(r=>r.date.startsWith(m)))]));
 const noct=json(out+'NOCTURNA_PRE.json'),nGoals=new Set(jPost.heads.map(toFamily));
 const noctRanks=Object.fromEntries(policies.map(p=>[p,{top10:noct.rankings[p],
   hits:noct.rankings[p].filter(f=>nGoals.has(f))}]));
 const watch=jPost.heads.map(h=>{const f=toFamily(h),pf=noct.byFamily[f];
  return {head:h,family:f,state:pf?.state??'NO_FISICA',
   anchored:pf?.anchored??false,officialRank:pf?.officialRank??null,
   ranks:Object.fromEntries(policies.map(p=>[p,noct.rankings[p].indexOf(f)===-1?null:noct.rankings[p].indexOf(f)+1]))};
 });
 save('POST_115.json',{rows:actualRows});
 save('NOCTURNA_POST.json',{heads:jPost.heads,watch,rankings:noctRanks,
   warning:'Simulación de corte del 12/10 ya conocido; no reemplaza predicción sellada antes del sorteo.'});
 const dates=[...new Set(preRows.map(r=>r.date))].sort();
 const mapPre=new Map(preRows.map(r=>[key(r),r]));
 const mapPost=new Map(origPost.map(r=>[key(r),r]));
 const matrices=policies.map(()=>Array.from({length:23},()=>Array(23).fill(0)));
 for(let i=0;i<23;i++)for(let j=0;j<23;j++)for(const turn of turns){
  const c=mapPre.get(dates[i]+'|'+turn),r=mapPost.get(dates[j]+'|'+turn);
  assert.ok(c&&r);
  const goals=new Set(r.heads.map(toFamily));
  policies.forEach((p,k)=>matrices[k][i][j]+=Number(c.rankings[p].some(f=>goals.has(f))));
 }
 const ids=dates.map((_,i)=>i);
 const evaluate=assignment=>policies.map((p,k)=>assignment.reduce((n,j,i)=>n+matrices[k][i][j],0));
 const observed=evaluate(ids);
 assert.equal(observed[0],15);
 const rand=seed=>{let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296}};
 const rng=rand(20261013),N=20000;
 const perm=policies.map(()=>[]),rotations=policies.map(()=>[]);
 for(let lag=1;lag<23;lag++){
  const s=evaluate(ids.map(x=>(x+lag)%23));
  s.forEach((v,k)=>rotations[k].push(v-s[0]));
 }
 for(let rep=0;rep<N;rep++){
  const shuffled=[...ids];
  for(let i=22;i>0;i--){const j=Math.floor(rng()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
  const s=evaluate(shuffled);
  s.forEach((v,k)=>perm[k].push(v-s[0]));
 }
 const quantile=(data,p)=>{const a=[...data].sort((a,b)=>a-b);return a[Math.floor((a.length-1)*p)]};
 const controls=Object.fromEntries(policies.filter(p=>p!=='OFICIAL').map(p=>{
  const k=policies.indexOf(p),values=perm[k],actual=observed[k]-observed[0];
  const pass=values.filter(x=>x>=actual).length;
  return [p,{observedDifference:actual,placeboMean:Number((values.reduce((n,v)=>n+v,0)/N).toFixed(4)),
   p05:quantile(values,.05),median:quantile(values,.5),p95:quantile(values,.95),
   tailAtLeastObserved:(pass+1)/(N+1),
   rotationsAtLeast:rotations[k].filter(x=>x>=actual).length,
   rotationsMin:Math.min(...rotations[k]),rotationsMax:Math.max(...rotations[k])}];
 }));
 const report={date:'2026-10-13',days:23,cuts:115,all,byTurn,byMonth,controls,
   seal,sourcePost:hash(read(src+'POST_115.json')),sourceNocturnaPost:hash(read(src+'NOCTURNA_POST.json')),
   interpretation:'Mismas 23 jornadas usadas para explorar políticas: posible sobreajuste. No existe demostración de predictibilidad de lotería.'};
 save('RESUMEN.json',report);
 console.log('VT3_ESTADOS_POST_OK',JSON.stringify({scores:all.scores,
  paired:Object.fromEntries(Object.entries(all.paired).map(([p,x])=>[p,{gain:x.gained,loss:x.lost}])),
  byMonth:Object.fromEntries(Object.entries(byMonth).map(([m,v])=>[m,Object.fromEntries(policies.map(p=>[p,v.scores[p].top10]))])),
  controls,watch},null,2));
}
if(process.argv[2]==='pre')pre();else if(process.argv[2]==='post')post();else throw Error('Use pre | post');
