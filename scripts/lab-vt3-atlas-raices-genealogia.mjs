import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const ROOT='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const ATLAS='auditorias/vt3-atlas-cuatro-dimensiones-115-14oct2026/';
const OUT='auditorias/vt3-atlas-raices-verificadas-115-14oct2026/';
const SELF='scripts/lab-vt3-atlas-raices-genealogia.mjs';
const PROTO='PROTOCOLO_VT3_ATLAS_RAICES_GENEALOGIA_14OCT2026.md';
const read=f=>readFileSync(f,'utf8'),json=f=>JSON.parse(read(f));
const hash=v=>createHash('sha256').update(v).digest('hex');
const save=(f,v)=>writeFileSync(OUT+f,JSON.stringify(v,null,2)+'\n');
const fam=v=>[v,[...v].reverse().join('')].sort().join('/');
const sig=path=>{
 const pts=path.map(s=>s.split(':').map(Number));
 const moves=ps=>ps.slice(1).map((p,i)=>(p[0]-ps[i][0])+','+(p[1]-ps[i][1])).join(';');
 return [moves(pts),moves([...pts].reverse())].sort()[0];
};
const pos=path=>{const x=path.map(s=>s.split(':').map(Number));
 return {row:Math.min(...x.map(a=>a[0])),col:Math.min(...x.map(a=>a[1]))};};
const id=r=>r.date+'|'+r.turn;
const KEYS=['MUTATION','SHIFT_BIG','CHANGE_NUMERIC','D7_BIG','MULTI_ROOT'];
function getRoot(rootId,route,now){
 const p=rootId.split('|');
 assert.equal(p.length,8,'Root ID incompatible: '+rootId);
 const [date,period,oldTurn,jurisdiction,head,kind,source,geometry]=p;
 assert.ok(date<now);
 assert.ok(period==='D−1'||period==='D−7');
 assert.match(head,/^\d{4}$/);
 assert.equal(kind,'vt3');assert.equal(source,route.source);
 const old=geometry.split('>');
 assert.equal(old.length,3);assert.equal(new Set(old).size,3);
 assert.equal(sig(old),sig([...old].reverse()));
 for(let k=1;k<3;k++){
  const [r,c]=old[k].split(':').map(Number),[u,v]=old[k-1].split(':').map(Number);
  assert.equal(Math.max(Math.abs(r-u),Math.abs(c-v)),1);
 }
 const start=pos(old),end=route.pos;
 const dr=end.row-start.row,dc=end.col-start.col;
 const structural=sig(old)!==route.shape;
 return {rootId,date,period,oldTurn,jurisdiction,head,source,
  oldCells:old,oldFamily:fam(head.slice(-3)),newFamily:route.family,
  deltaRow:dr,deltaCol:dc,structuralMutation:structural,
  sameShape:!structural,changedNumeric:fam(head.slice(-3))!==route.family};
}
const priority=p=>3*Number(p.flags.MUTATION)+2*Number(p.flags.SHIFT_BIG)+Number(p.flags.CHANGE_NUMERIC);
function prepare(){
 assert.ok(!existsSync(ROOT+'POST_115.json'),'POST de resultados presente durante PRE');
 assert.ok(!existsSync(ROOT+'NOCTURNA_POST_DIAGNOSTICO.json'));
 const seal=json(ATLAS+'SELLO.json');
 assert.equal(hash(read(ATLAS+'PRE_115.json')),seal.pre);
 assert.equal(hash(read(ATLAS+'EVENTOS_PRE_115.json')),seal.routesPre);
 const profiles=json(ATLAS+'PRE_115.json').rows;
 const events=json(ATLAS+'EVENTOS_PRE_115.json').rows;
 assert.equal(profiles.length,115);assert.equal(events.length,115);
 const rows=[];let edges=0,rootsSeen=new Set(),families=0,rootedFamilies=0,mutated=0;
 for(let i=0;i<profiles.length;i++){
  const p=profiles[i],e=events[i];assert.equal(id(p),id(e));
  const byFamily=new Map();
  for(const route of e.events){
   if(!byFamily.has(route.family))byFamily.set(route.family,[]);
   byFamily.get(route.family).push(route);
  }
  const profiles2=p.profiles.map(old=>{
   families++;
   const routes=byFamily.get(old.family)||[];
   const edgesOwn=[],rootsOwn=new Map();
   for(const route of routes)for(const rootId of route.rootIds){
    const ancestor=getRoot(rootId,route,p.date);
    edgesOwn.push(ancestor);
    rootsSeen.add(rootId);edges++;
    const k=[ancestor.date,ancestor.oldTurn,ancestor.jurisdiction,ancestor.head].join('|');
    if(!rootsOwn.has(k))rootsOwn.set(k,ancestor);
   }
   const any=f=>edgesOwn.some(f);
   const flags={
    MUTATION:any(x=>x.structuralMutation),
    SHIFT_BIG:any(x=>x.sameShape&&Math.abs(x.deltaRow)>=2),
    CHANGE_NUMERIC:any(x=>x.changedNumeric),
    D7_BIG:any(x=>x.period==='D−7'&&x.sameShape&&Math.abs(x.deltaRow)>=2),
    MULTI_ROOT:rootsOwn.size>=2
   };
   rootedFamilies+=Number(old.anchored);
   mutated+=Number(flags.MUTATION);
   assert.equal(old.anchored,edgesOwn.length>0,'Anclaje debe tener huella histórica propia');
   return {family:old.family,officialRank:old.officialRank,anchored:old.anchored,
    d1:old.d1,d7:old.d7,sources:old.sources,blocks:old.blocks,
    rootRoutes:edgesOwn.length,independentHistoricalHeads:rootsOwn.size,
    oldFamilies:[...new Set(edgesOwn.map(x=>x.oldFamily))].sort(),
    distinctDeltas:[...new Set(edgesOwn.map(x=>x.deltaRow+','+x.deltaCol))].sort(),
    flags,score:priority({flags})};
  });
  const byName=new Map(profiles2.map(x=>[x.family,x]));
  const official=p.ranking.OFICIAL;
  assert.equal(official.length,10);
  const eligible3=official.slice(2).map(x=>byName.get(x));
  assert.ok(eligible3.every(Boolean));
  const rootPool=profiles2.filter(x=>x.anchored&&x.officialRank>10&&x.officialRank<=30&&x.score>0)
   .sort((a,b)=>b.score-a.score||a.officialRank-b.officialRank);
  const chosen3=eligible3.slice().sort((a,b)=>b.score-a.score||a.officialRank-b.officialRank)[0];
  const chosen10=rootPool[0]||null;
  const top3=official.slice(0,2).concat(chosen3.family,official.slice(2).filter(x=>x!==chosen3.family));
  const top10=chosen10?official.slice(0,9).concat(chosen10.family):official;
  assert.equal(top3.length,10);assert.equal(new Set(top3).size,10);
  assert.equal(top10.length,10);assert.equal(new Set(top10).size,10);
  rows.push({date:p.date,turn:p.turn,profiles:profiles2,
   choices:{official,top3,top10},eligibility:{third:eligible3.map(x=>x.family),
    tenth:rootPool.map(x=>x.family)},third:chosen3.family,tenth:chosen10?.family??null});
 }
 save('PRE_115.json',{date:'2026-10-14',cuts:115,
  summary:{familyCutRecords:families,rootedFamilyCutRecords:rootedFamilies,
   rootRouteAttributions:edges,uniqueRootIds:rootsSeen.size,
   recordsWithShapeMutation:mutated},rows,
  note:'Sin resultados actuales. El rootId pertenece a una cabeza histórica ya conocida antes del corte.'});
 const gen={preAtlas:seal.pre,preAtlasRoutes:seal.routesPre,
  protocol:hash(read(PROTO)),code:hash(read(SELF)),pre:hash(read(OUT+'PRE_115.json'))};
 save('SELLO.json',gen);
 console.log('ATLAS_RAICES_PRE_OK',JSON.stringify({summary:json(OUT+'PRE_115.json').summary,seal:gen}));
}
const random=seed=>{let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296};};
function contrast(){
 const seal=json(OUT+'SELLO.json');
 assert.equal(seal.protocol,hash(read(PROTO)));assert.equal(seal.code,hash(read(SELF)));
 assert.equal(seal.pre,hash(read(OUT+'PRE_115.json')));
 assert.equal(seal.preAtlas,hash(read(ATLAS+'PRE_115.json')));
 assert.equal(seal.preAtlasRoutes,hash(read(ATLAS+'EVENTOS_PRE_115.json')));
 const source=json(OUT+'PRE_115.json'),rows=source.rows,post=json(ROOT+'POST_115.json').rows;
 assert.equal(rows.length,115);assert.equal(post.length,115);
 const vals=Object.fromEntries(KEYS.map(x=>[x,{exposures:0,winners:0}]));
 const matched=Object.fromEntries(KEYS.map(x=>[x,{observed:0,expected:0,mixedBins:0,notComparablePositive:0}]));
 let allWinningAnchored=0,allWinningPhys=0;
 const cuts=[],winnerSamples=[];
 for(let i=0;i<115;i++){
  const r=rows[i],p=post[i];assert.equal(id(r),id(p));
  const winners=new Set(p.targets.map(x=>fam(x.slice(-3))));
  const anchored=r.profiles.filter(x=>x.anchored);
  const bins=new Map();
  for(const f of anchored){
   const positive=winners.has(f.family);allWinningAnchored+=Number(positive);
   for(const k of KEYS)if(f.flags[k]){
    vals[k].exposures++;vals[k].winners+=Number(positive);
   }
   const cls=[Number(f.family.split('/')[0]===f.family.split('/')[1]),
    Math.min(2,f.sources),Math.min(3,f.blocks),
    f.d1&&f.d7?'both':f.d1?'d1':f.d7?'d7':'none'].join('|');
   if(!bins.has(cls))bins.set(cls,[]);
   bins.get(cls).push(f);
   if(positive&&winnerSamples.length<40)winnerSamples.push({date:r.date,turn:r.turn,
    family:f.family,rank:f.officialRank,score:f.score,flags:f.flags,shifts:f.distinctDeltas,
    ancestralFamilies:f.oldFamilies});
  }
  allWinningPhys+=r.profiles.filter(x=>winners.has(x.family)).length;
  for(const bin of bins.values()){
   const won=bin.filter(x=>winners.has(x.family));
   if(!won.length)continue;
   for(const k of KEYS){
    const count=bin.filter(x=>x.flags[k]).length;
    if(bin.length<2||count===0||count===bin.length){
     matched[k].notComparablePositive+=won.length;continue;
    }
    matched[k].mixedBins++;matched[k].observed+=won.filter(x=>x.flags[k]).length;
    matched[k].expected+=won.length*count/bin.length;
   }
  }
  const trial=Object.fromEntries(Object.entries(r.choices).map(([k,selected])=>[k,{
   top3:selected.slice(0,3).some(x=>winners.has(x)),
   top5:selected.slice(0,5).some(x=>winners.has(x)),
   top10:selected.some(x=>winners.has(x))}]));
  cuts.push({date:r.date,turn:r.turn,trials:trial,third:r.third,tenth:r.tenth,
   eligibleThird:r.eligibility.third.length,eligibleTenth:r.eligibility.tenth.length});
 }
 const score=Object.fromEntries(['official','top3','top10'].map(k=>[k,{
  top3:cuts.filter(x=>x.trials[k].top3).length,
  top5:cuts.filter(x=>x.trials[k].top5).length,
  top10:cuts.filter(x=>x.trials[k].top10).length,
  gains10:cuts.filter(x=>x.trials[k].top10&&!x.trials.official.top10).map(id),
  losses10:cuts.filter(x=>!x.trials[k].top10&&x.trials.official.top10).map(id)
 }]));
 assert.deepEqual([score.official.top3,score.official.top5,score.official.top10],[5,8,15]);
 const rand=random(20261015),thirdNull=[],tenthNull=[];
 for(let j=0;j<2000;j++){
  let n3=0,n10=0;
  for(let i=0;i<115;i++){
   const r=rows[i],winners=new Set(post[i].targets.map(x=>fam(x.slice(-3))));
   const orig=r.choices.official;
   const third=r.eligibility.third[Math.floor(rand()*r.eligibility.third.length)];
   const tenth=r.eligibility.tenth.length?r.eligibility.tenth[Math.floor(rand()*r.eligibility.tenth.length)]:orig[9];
   n3+=Number(orig.slice(0,2).some(f=>winners.has(f))||winners.has(third));
   n10+=Number(orig.slice(0,9).some(f=>winners.has(f))||winners.has(tenth));
  }
  thirdNull.push(n3);tenthNull.push(n10);
 }
 function neutral(numbers,actual){
  const sorted=[...numbers].sort((a,b)=>a-b);
  return {controls:numbers.length,mean:Math.round(10000*numbers.reduce((a,b)=>a+b,0)/numbers.length)/10000,
   p05:sorted[99],median:sorted[999],p95:sorted[1899],observed:actual,
   upperTail:(numbers.filter(x=>x>=actual).length+1)/(numbers.length+1)};
 }
 const out={scope:'RETROSPECTIVO, NO PREDICTIVO',cuts:115,
  pre:source.summary,signals:vals,winningAnchoredFamilyCutRecords:allWinningAnchored,
  winningPhysicalFamilyCutRecords:allWinningPhys,
  matched:Object.fromEntries(Object.entries(matched).map(([k,v])=>[k,{...v,
   expected:Number(v.expected.toFixed(4)),excess:Number((v.observed-v.expected).toFixed(4))}])),
  scorecard:score,neutral:{third:neutral(thirdNull,score.top3.top3),
   tenth:neutral(tenthNull,score.top10.top10)},
  opportunity:{cutsWithEligibleRootedTenth:rows.filter(r=>r.eligibility.tenth.length>0).length,
   candidateTenthRecords:rows.reduce((a,r)=>a+r.eligibility.tenth.length,0),
   changedThird:rows.filter(r=>r.third!==r.choices.official[2]).length},
  winningExamples:winnerSamples,seal,
  warnings:[
   'Estas raíces antiguas sí están sustentadas por cabezas ganadoras históricas, pero son cientos de recorridos dependientes.',
   'El mismo rootId puede sostener varias familias y recorridos: su multiplicación no es evidencia independiente.',
   '115 cortes ya investigados repetidamente, por lo que asociaciones y mejoras son solo exploratorias.',
   'No se modifica selección oficial, VT4 ni sello de predicción real.'
  ]};
 save('POST_115.json',{rows:cuts});
 save('RESUMEN.json',out);
 console.log('ATLAS_RAICES_POST_OK',JSON.stringify({pre:out.pre,signals:out.signals,
  matched:out.matched,scorecard:out.scorecard,neutral:out.neutral,
  opportunity:out.opportunity,winners:out.winningAnchoredFamilyCutRecords},null,2));
}
if(process.argv[2]==='pre'){mkdirSync(OUT,{recursive:true});prepare();}
else if(process.argv[2]==='post'){mkdirSync(OUT,{recursive:true});contrast();}
else throw Error('Expected pre|post');
