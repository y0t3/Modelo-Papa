import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const base='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const out='auditorias/vt3-por-turno-115-13oct2026/';
const protocol='PROTOCOLO_VT3_POR_TURNO_13OCT2026.md';
const turns=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const methods=['A_ORIGINAL','B_INVENTARIO'];
const expectedSHA='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const read=x=>readFileSync(x,'utf8');
const json=x=>JSON.parse(read(x));
const hash=s=>createHash('sha256').update(s).digest('hex');
const save=(name,v)=>writeFileSync(out+name,JSON.stringify(v,null,2)+'\n');
const family=s=>[s,[...s].reverse().join('')].sort().join('/');
mkdirSync(out,{recursive:true});
assert.equal(hash(read(base+'PRE_115.json')),expectedSHA);
const p=json(base+'PRE_115.json').rows,o=json(base+'POST_115.json').rows;
assert.equal(p.length,115);assert.equal(o.length,115);
const dates=[...new Set(p.map(x=>x.date))].sort();
assert.equal(dates.length,23);
const id=r=>r.date+'|'+r.turn;
const pm=new Map(p.map(x=>[id(x),x])),om=new Map(o.map(x=>[id(x),x]));
const P=dates.map(d=>turns.map(t=>{const row=pm.get(d+'|'+t);assert.ok(row);return row}));
const O=dates.map(d=>turns.map(t=>{
 const row=om.get(d+'|'+t);assert.ok(row);assert.equal(row.targets.length,5);
 return {heads:row.targets,families:new Set(row.targets.map(h=>{assert.match(h,/^\d{4}$/);return family(h.slice(-3))}))};
}));
const details=[],totals=Object.fromEntries(turns.map(t=>[t,{cuts:0,physicalCuts:0,anchoredCuts:0,top10Cuts:0,
 physicalWinningFamilies:0,anchoredWinningFamilies:0,top10WinningFamilies:0,
 sourcePresenceTop10:{},physicalAvailableButMissingTop10:0,persistedTop10Wins:0,top10Wins:[] }]));
for(let i=0;i<23;i++)for(let ti=0;ti<5;ti++){
 const r=P[i][ti],win=O[i][ti].families,stats=totals[turns[ti]];
 const A=r.strategies.A_ORIGINAL,B=r.strategies.B_INVENTARIO;
 const witness=new Map(r.witnesses.map(x=>[x.family,x.paths]));
 const anchorRanks=new Map(A.map(x=>[x.family,x])), fullRanks=new Map(B.map(x=>[x.family,x]));
 const physical=B.filter(f=>win.has(f.family)), anchored=A.filter(f=>win.has(f.family)),top10=A.slice(0,10).filter(f=>win.has(f.family));
 const previousTop=ti?new Set(P[i][ti-1].strategies.A_ORIGINAL.slice(0,10).map(x=>x.family)):new Set();
 function annotate(f){
  const orig=anchorRanks.get(f.family),full=fullRanks.get(f.family),routes=witness.get(f.family);
  assert.ok(full&&routes?.length);
  return {family:f.family,originalRank:orig?.rank??null,physicalRank:full.rank,
   sources:[...new Set(routes.map(x=>x.source))].sort(),
   anchoredSources:[...new Set(routes.filter(x=>x.anchored).map(x=>x.source))].sort(),
   d1:orig?.d1??0,d7:orig?.d7??0,bif:orig?.bif??0,
   paths:routes.length,anchoredPaths:routes.filter(x=>x.anchored).length,
   inheritedTop10PreviousTurn:previousTop.has(f.family)};
 }
 const physicalDetail=physical.map(annotate),anchoredDetail=anchored.map(annotate),topDetail=top10.map(annotate);
 const sourceTop=A.slice(0,10).flatMap(x=>[...new Set((witness.get(x.family)||[]).filter(y=>y.anchored).map(y=>y.source))]);
 for(const source of sourceTop)stats.sourcePresenceTop10[source]=(stats.sourcePresenceTop10[source]||0)+1;
 stats.cuts++;stats.physicalCuts+=Number(physical.length>0);stats.anchoredCuts+=Number(anchored.length>0);
 stats.top10Cuts+=Number(top10.length>0);stats.physicalWinningFamilies+=physical.length;
 stats.anchoredWinningFamilies+=anchored.length;stats.top10WinningFamilies+=top10.length;
 stats.physicalAvailableButMissingTop10+=Number(physical.length>0&&top10.length===0);
 stats.persistedTop10Wins+=topDetail.filter(x=>x.inheritedTop10PreviousTurn).length;
 for(const x of topDetail)stats.top10Wins.push({date:dates[i],...x});
 details.push({date:dates[i],turn:turns[ti],targetHeads:O[i][ti].heads,
  physicalCount:B.length,anchoredCount:A.length,physicalWinning:physicalDetail,
  anchoredWinning:anchoredDetail,top10Winning:topDetail,
  originalTop10:A.slice(0,10).map(x=>({family:x.family,originalRank:x.rank,sources:[...new Set((witness.get(x.family)||[]).filter(y=>y.anchored).map(y=>y.source))]}))});
}
assert.equal(Object.values(totals).reduce((sum,x)=>sum+x.top10Cuts,0),15);
assert.equal(Object.values(totals).reduce((sum,x)=>sum+x.physicalCuts,0),80);
assert.equal(totals.Matutino.top10Cuts,8);
assert.equal(totals.Vespertino.top10Cuts,0);
save('CASOS_115.json',{days:23,cuts:115,detail:details});
const channels=['top10','anchored','physical'];
const matrix=turns.map((t,ti)=>Array.from({length:23},(_,i)=>
 Array.from({length:23},(_,j)=>{
  const a=P[i][ti].strategies.A_ORIGINAL,b=P[i][ti].strategies.B_INVENTARIO,win=O[j][ti].families;
  return [Number(a.slice(0,10).some(x=>win.has(x.family))),
          Number(a.some(x=>win.has(x.family))),
          Number(b.some(x=>win.has(x.family)))];
 })));
function random(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
const identity=dates.map((_,i)=>i);
const weekday=d=>new Date(d+'T12:00:00Z').getUTCDay();
function groups(fn){const x=new Map();dates.forEach((d,i)=>{const k=fn(d);if(!x.has(k))x.set(k,[]);x.get(k).push(i)});return [...x.values()];}
const methodsShuffle={all:[identity],sameWeekday:groups(weekday)};
function shuffle(groups,rng){
 const a=[...identity];
 for(const g of groups){const tmp=g.map(i=>a[i]);
  for(let k=tmp.length-1;k>0;k--){const j=Math.floor(rng()*(k+1));[tmp[k],tmp[j]]=[tmp[j],tmp[k]]}
  for(let k=0;k<g.length;k++)a[g[k]]=tmp[k];
 }
 return a;
}
function score(assignment){return turns.map((t,ti)=>channels.map((_,ch)=>
 assignment.reduce((n,j,i)=>n+matrix[ti][i][j][ch],0)));}
function quantile(nums,p){const a=[...nums].sort((x,y)=>x-y);return a[Math.floor((a.length-1)*p)]}
const actual=score(identity),rep=20000;
const byScheme={};
for(const [ix,[name,group]] of Object.entries(methodsShuffle).entries()){
 const rng=random(20261013+ix*313);
 const results=turns.map(()=>channels.map(()=>[]));
 for(let k=0;k<rep;k++){
  const counts=score(shuffle(group,rng));
  for(let t=0;t<5;t++)for(let ch=0;ch<3;ch++)results[t][ch].push(counts[t][ch]);
 }
 byScheme[name]=Object.fromEntries(turns.map((turn,t)=>
  [turn,Object.fromEntries(channels.map((channel,ch)=>{
   const v=results[t][ch],real=actual[t][ch],count=v.filter(x=>x>=real).length;
   return [channel,{real,mean:v.reduce((a,b)=>a+b,0)/rep,p05:quantile(v,.05),p50:quantile(v,.5),p95:quantile(v,.95),
    empiricalTail:(count+1)/(rep+1),bonferroniFiveTurns:Math.min(1,(count+1)/(rep+1)*5)}];
  }))]));
}
const summary={context:'POST-motivado: se inspeccionó Matutino 8/23 y Vespertino 0/23 ANTES de definir esta prueba',
 period:'15/09 a 10/10/2026',date:'2026-10-13',cuts:115,days:23,byTurn:totals,
 placebo:byScheme,
 checks:{top10:15,anchoredCuts:Object.values(totals).reduce((s,r)=>s+r.anchoredCuts,0),
  physicalCuts:80,
  selectedAndPreviouslyListed:totals.Matutino.persistedTop10Wins,
  remarks:'Los turnos y las muestras fueron elegidos tras resultados conocidos. Múltiples tests y tuning previo impiden validación predictiva; la comparación es descriptiva.'},
 hashes:{protocol:hash(read(protocol)),sourcePre:expectedSHA,sourcePost:hash(read(base+'POST_115.json')),
    script:hash(read('scripts/lab-vt3-por-turno.mjs'))}};
save('RESUMEN.json',summary);
save('SELLO.json',{hashes:summary.hashes,resumen:hash(read(out+'RESUMEN.json')),
 cases:hash(read(out+'CASOS_115.json'))});
console.log('VT3_POR_TURNO_OK',JSON.stringify({byTurn:Object.fromEntries(Object.entries(totals).map(([t,s])=>[t,{top10:s.top10Cuts,anchored:s.anchoredCuts,physical:s.physicalCuts,
 winners:s.top10Wins.map(w=>({date:w.date,f:w.family,rank:w.originalRank,source:w.anchoredSources,d1:w.d1,d7:w.d7,bif:w.bif}))}])),
 placebo:Object.fromEntries(Object.entries(byScheme).map(([method,r])=>[method,Object.fromEntries(turns.map(t=>[t,r[t].top10]))]))},null,2));
