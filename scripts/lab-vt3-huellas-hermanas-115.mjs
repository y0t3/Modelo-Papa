import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const IN='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const OUT='auditorias/vt3-huellas-hermanas-115-14oct2026/';
const FILE='scripts/lab-vt3-huellas-hermanas-115.mjs';
const SHA='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const read=f=>readFileSync(f,'utf8');
const parse=f=>JSON.parse(read(f));
const sha=s=>createHash('sha256').update(s).digest('hex');
const unique=a=>[...new Set(a)];
const reverse=s=>[...s].reverse().join('');
const family=s=>[s,reverse(s)].sort().join('/');
const path=s=>s.split('>').map(x=>x.split(':').map(Number));
const canon=s=>[s,s.split('>').reverse().join('>')].sort()[0];
const canonNow=(p)=>canon(p.join('>'));
const makeStats=()=>({rootGroups:0,hitGroups:0,nearest:0,farthest:0,bestRank:0,
 expected:0,familyBins:Object.fromEntries(['0','1','2+'].map(x=>[x,{n:0,wins:0}]))});
function displacement(old,newCells) {
 for(const p of [newCells,[...newCells].reverse()]){
  const dr=p[0][0]-old[0][0],dc=p[0][1]-old[0][1];
  if(old.every((x,i)=>p[i][0]===x[0]+dr&&p[i][1]===x[1]+dc))
   return {row:dr,col:dc,abs:Math.abs(dr)+Math.abs(dc)};
 }
 return null;
}
function fnv(s,seed){
 let h=(2166136261^seed)>>>0;
 for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);
 return h>>>0;
}
function xorshift(seed){
 let s=seed>>>0;
 return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0};
}
function inspect(pre,post){
 const all=makeStats(),byMonth={},byTurn={},neutralGroups=[];
 const rows=[], examples=[];
 let directRecords=0,rankedRecords=0,onlyBifurcationPaths=0;
 let previousDate='',previousPaths=new Map();
 for(let i=0;i<pre.rows.length;i++){
  const r=pre.rows[i],o=post.rows[i];
  assert.equal(r.date,o.date);assert.equal(r.turn,o.turn);
  if(r.date!==previousDate){previousPaths=new Map();previousDate=r.date}
  const month=r.date.slice(0,7);
  byMonth[month]??=makeStats();byTurn[r.turn]??=makeStats();
  const accum=[all,byMonth[month],byTurn[r.turn]];
  const wins=new Set(o.targets.map(h=>{assert.match(h,/^\d{4}$/);return family(h.slice(-3))}));
  const ranks=new Map(r.strategies.A_ORIGINAL.map(x=>[x.family,x.rank]));
  const physical=new Map(r.witnesses.map(w=>[w.family,new Set(w.paths.map(p=>p.source+'|'+canonNow(p.cells)))]));
  const rootGroups=new Map(),ownDisplacements=new Map();
  for(const w of r.witnesses){
   if(!ranks.has(w.family))continue;
   for(const p of w.paths.filter(x=>x.anchored&&x.rootIds.length)){
    const now=path(p.cells.join('>'));
    let isTranslated=false;
    for(const rootId of p.rootIds){
     const fields=rootId.split('|');
     assert.equal(fields.length,8);
     assert.equal(fields[6],p.source,'Una huella D-7/D-1 no puede prestar la fuente');
     const delta=displacement(path(fields[7]),now);
     if(!delta)continue; // herencia por bifurcación no es nuevo traslado
     isTranslated=true;
     const key=fields.slice(0,5).join('|')+'|'+fields[6]+'|'+canon(fields[7]);
     const group=rootGroups.get(key)??new Map();
     const member={family:w.family,rank:ranks.get(w.family),
       shift:delta.abs,shiftRow:delta.row,shiftCol:delta.col};
     if(!group.has(w.family)||group.get(w.family).shift>member.shift)
      group.set(w.family,member);
     rootGroups.set(key,group);
     const old=ownDisplacements.get(w.family);
     if(old===undefined||member.shift<old)ownDisplacements.set(w.family,member.shift);
    }
    if(!isTranslated)onlyBifurcationPaths++;
   }
  }
  rankedRecords+=ranks.size;directRecords+=ownDisplacements.size;
  let groups=0,hitGroups=0;
  let prevFamilies=0,prevSameRoute=0;
  for(const [f,dist] of ownDisplacements){
   const category=dist===0?'0':dist===1?'1':'2+';
   for(const stat of accum){
    stat.familyBins[category].n++;
    stat.familyBins[category].wins+=Number(wins.has(f));
   }
   if(previousPaths.has(f)){
    prevFamilies++;
    if([...physical.get(f)].some(x=>previousPaths.get(f).has(x)))prevSameRoute++;
   }
  }
  for(const [root,group] of rootGroups){
   const members=[...group.values()];
   if(members.length<2)continue;
   groups++;
   const winners=members.filter(x=>wins.has(x.family));
   hitGroups+=Number(winners.length>0);
   const nearest=[...members].sort((a,b)=>a.shift-b.shift||a.rank-b.rank)[0];
   const farthest=[...members].sort((a,b)=>b.shift-a.shift||a.rank-b.rank)[0];
   const rankBest=[...members].sort((a,b)=>a.rank-b.rank)[0];
   for(const stat of accum){
    stat.rootGroups++;stat.hitGroups+=Number(winners.length>0);
    stat.nearest+=Number(wins.has(nearest.family));
    stat.farthest+=Number(wins.has(farthest.family));
    stat.bestRank+=Number(wins.has(rankBest.family));
    stat.expected+=winners.length/members.length;
   }
   neutralGroups.push({root,choices:members.map(x=>({id:root+'|'+x.family,
     won:wins.has(x.family)}))});
   if(winners.length && examples.length<30)
    examples.push({date:r.date,turn:r.turn,root,members,winners:winners.map(x=>x.family)});
  }
  rows.push({date:r.date,turn:r.turn,rootGroups:groups,hitGroups,
   directFamilies:ownDisplacements.size,rankedFamilies:ranks.size,
   dayPersistentDirectFamilies:prevFamilies,
   physicallyIdenticalPersistentFamilies:prevSameRoute});
  previousPaths=physical;
 }
 assert.equal(rows.length,115);assert.equal(rankedRecords,6389);
 const nextSeed=xorshift(0x715e93b),neutral=[];
 for(let j=0;j<3000;j++){
  const seed=nextSeed();let wins=0;
  for(const g of neutralGroups){
   let best=4294967296,chosen=false;
   for(const c of g.choices){const score=fnv(c.id,seed);
    if(score<best){best=score;chosen=c.won}
   }
   wins+=Number(chosen);
  }
  neutral.push(wins);
 }
 neutral.sort((a,b)=>a-b);
 const tail=(v,above=true)=>(neutral.filter(x=>above?x>=v:x<=v).length+1)/(neutral.length+1);
 const small=x=>({...x,expected:Number(x.expected.toFixed(4))});
 const result={
  date:'2026-10-14',scope:'Retrospectivo y exploratorio, 115 cortes; NO es Top3/Top10',
  sourceSha:SHA,sourcePostSha:sha(read(IN+'POST_115.json')),
  scriptSha:sha(read(FILE)),cuts:115,days:unique(rows.map(r=>r.date)).length,
  rankedFamilyCutRecords:rankedRecords,directTranslationFamilyCutRecords:directRecords,
  bifurcationOnlyAnchoredPathRecords:onlyBifurcationPaths,
  global:small(all),
  byMonth:Object.fromEntries(Object.entries(byMonth).map(([k,v])=>[k,small(v)])),
  byTurn:Object.fromEntries(Object.entries(byTurn).map(([k,v])=>[k,small(v)])),
  withinDay:{persistentFamilies:rows.reduce((s,r)=>s+r.dayPersistentDirectFamilies,0),
   identicalPhysicalRouteInPreviousTurn:rows.reduce((s,r)=>s+r.physicallyIdenticalPersistentFamilies,0)},
  neutral:{controls:neutral.length,mean:Number((neutral.reduce((s,v)=>s+v,0)/neutral.length).toFixed(4)),
   min:neutral[0],p05:neutral[149],median:neutral[1499],p95:neutral[2849],max:neutral.at(-1),
   nearestUpperTail:tail(all.nearest),nearestLowerTail:tail(all.nearest,false),
   farthestUpperTail:tail(all.farthest),bestRankUpperTail:tail(all.bestRank),
   method:'Para cada réplica, hash FNV32 estable de (evento+huella antigua+familia), y mismo seed en todos los turnos'},
  examples,rows,
  limitations:[
   'Cada root-group con ganador suma una oportunidad; una cabeza puede contribuir a varias raíces y turnos. No son pruebas independientes.',
   'El mejor rango oficial es una regla previa del motor, pero el historial completo ya se exploró repetidamente.',
   'No hubo modificación de familias, fuentes, rutas válidas, clasificación oficial, VT4 ni main.',
   'No hay sello prospectivo de este experimento; nueva hipótesis necesita sorteo genuinamente no observado.'
  ]
 };
 return result;
}
assert.equal(sha(read(IN+'PRE_115.json')),SHA);
const p=parse(IN+'PRE_115.json'),q=parse(IN+'POST_115.json');
const result=inspect(p,q);
assert.equal(result.global.rootGroups,2168);
assert.equal(result.global.hitGroups,100);
assert.equal(result.global.nearest,18);
assert.equal(result.global.farthest,30);
assert.equal(result.global.bestRank,39);
assert.equal(result.withinDay.persistentFamilies,4774);
assert.equal(result.withinDay.identicalPhysicalRouteInPreviousTurn,4774);
mkdirSync(OUT,{recursive:true});
writeFileSync(OUT+'RESUMEN.json',JSON.stringify(result,null,2)+'\n');
console.log('HUELLAS_EXACTAS_115_OK',JSON.stringify({
 groups:result.global.rootGroups,positive:result.global.hitGroups,
 nearest:result.global.nearest,farthest:result.global.farthest,
 bestRank:result.global.bestRank,neutral:result.neutral}));
