import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
const DIR='auditorias/vt4-admision-madres-115-13oct2026/';
const INPUT='auditorias/vt4-diversidad-madres-top10-115-13oct2026/INPUT_PRE_115.json';
const PRIOR='auditorias/vt4-diversidad-madres-top10-115-13oct2026/PRE_115.json';
const POST='auditorias/vt4-diversidad-madres-top10-115-13oct2026/OBJETIVOS_POST_115.json';
const FIXTURE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const PROTOCOL='PROTOCOLO_VT4_ADMISION_MADRES_13OCT2026.md';
const METHODS=['BASE_CORREGIDA','TOP10_CUPO2','ADMITIDAS_CUPO2','ADMITIDAS_ESTRATOS','FISICAS_ESTRATOS','FISICAS_DOS_NUEVAS','FISICAS_ORDEN_GLOBAL'];
const read=p=>readFileSync(p,'utf8'),j=p=>JSON.parse(read(p)),hash=v=>createHash('sha256').update(v).digest('hex');
const save=(name,content)=>writeFileSync(DIR+name,JSON.stringify(content,null,2)+'\n');
const coord=c=>c.row+':'+c.col,pt=p=>p.map(coord).join('>');
const canonPath=(s,p)=>s+'|'+[pt(p),pt([...p].reverse())].sort()[0];
const canonMother=v=>[v,[...v].reverse().join('')].sort().join('/');
const neighbours=(a,b)=>Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1;
const uniq=a=>[...new Set(a)];
const isFour=x=>/^\d{4}$/.test(x);
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const key=x=>x.date+'|'+x.turn;
const currentWeek=d=>d.slice(0,8)+Math.floor((Number(d.slice(8))-1)/7);
mkdirSync(DIR,{recursive:true});
const runtime='resultados/runtime-vt4-admision';
for(const name of ['domain','dates','paths','sheet','motorLalo']){
 const target=resolve(runtime,name+'.mjs');mkdirSync(dirname(target),{recursive:true});
 writeFileSync(target,stripTypeScriptTypes(read('src/'+name+'.ts')).replace(/from '(\.{1,2}\/[^']+)'/g,(_,p)=>"from '"+p+".mjs'"));
}
const {buildMotorLalo}=await import(pathToFileURL(resolve(runtime,'motorLalo.mjs')).href);
const {cellsFromPlus11}=await import(pathToFileURL(resolve(runtime,'paths.mjs')).href);

function physical3(values){
 const cells=cellsFromPlus11(values),all=new Map();
 function walk(p){
  if(p.length===3){const id=[pt(p),pt([...p].reverse())].sort()[0];if(!all.has(id))all.set(id,p);return;}
  for(const c of cells)if(!p.includes(c)&&(!p.length||neighbours(p.at(-1),c)))walk([...p,c]);
 }
 walk([]);
 return [...all.values()];
}
function extCandidate(groups,mother,rank,admittedRoute,s,p,sourceCells){
 const [a,b]=mother.split('/');assert.equal(a.length,3);assert.equal(b,[...a].reverse().join(''));
 for(const oriented of [p,[...p].reverse()])for(const c of sourceCells){
  if(oriented.includes(c))continue;
  for(const side of ['prefix','suffix']){
   const candidate=side==='prefix'?[c,...oriented]:[...oriented,c];
   if(!candidate.slice(1).every((x,i)=>neighbours(candidate[i],x)))continue;
   const added=c.digit,value=candidate.map(x=>x.digit).join('');
   assert.ok((side==='prefix'?[added+a,added+b]:[a+added,b+added]).includes(value));
   const k=mother+'|'+side+'|'+added+'|'+(admittedRoute?'ROOTED':'ONLY_PHYSICAL');
   if(!groups.has(k))groups.set(k,{id:k,mother,motherRank:rank,admittedRoute,
    family:[...new Set(side==='prefix'?[added+a,added+b]:[a+added,b+added])].join('/'),
    pathMap:new Map(),side,added});
   const group=groups.get(k);
   const pk=canonPath(s,candidate);
   if(!group.pathMap.has(pk))group.pathMap.set(pk,{source:s,value,points:candidate,
     key:pk,block:s+'|'+candidate.map(coord).sort().join(',')});
  }
 }
}
function generatedAllPhysical(view,current,turn){
 const idx=['Previa','Primera','Matutino','Vespertino','Nocturno'].indexOf(turn);
 const sources=current.columns.slice(0,idx+1),rootedGroups=new Map(),onlyGroups=new Map();
 const admitted=new Map(view.ranks.vt3.map(f=>[f.family,{
  rank:f.rank,keys:new Set(f.paths.map(p=>canonPath(p.sourceId,p.path)))}]));
 let physicalMothers=0,rootedPaths=0;
 for(const src of sources){
  const cells=cellsFromPlus11(src.values),paths=physical3(src.values);
  for(const p of paths){
   const mother=canonMother(p.map(x=>x.digit).join(''));
   const rec=admitted.get(mother),rooted=Boolean(rec?.keys.has(canonPath(src.id,p)));
   physicalMothers++;rootedPaths+=Number(rooted);
   extCandidate(rooted?rootedGroups:onlyGroups,mother,rec?.rank??null,rooted,src.id,p,cells);
  }
 }
 const extract=groups=>[...groups.values()].map(g=>{
  const paths=[...g.pathMap.values()],sources=new Set(paths.map(x=>x.source)),
    blocks=new Set(paths.map(x=>x.block));
  return {id:g.id,family:g.family,mother:g.mother,motherRank:g.motherRank,
   evidence:g.admittedRoute?'ROOTED':'ONLY_PHYSICAL',
   values:uniq(paths.map(p=>p.value)).sort(),
   sources:sources.size,blocks:blocks.size,paths:paths.length,
   physicalKeys:paths.map(p=>p.key)
  };
 });
 return {rooted:extract(rootedGroups),unanchored:extract(onlyGroups),
  physicalMothers,rootedMotherPaths:rootedPaths};
}
function sortedGroups(a){
 return a.slice().sort((x,y)=>(x.motherRank??9999)-(y.motherRank??9999)||
  y.sources-x.sources||y.blocks-x.blocks||x.family.localeCompare(y.family)||x.id.localeCompare(y.id));
}
function available(view,input){
 const v=view.ranks.vt4,motherRank=new Map(view.ranks.vt3.map(x=>[x.family,x.rank]));
 const native=v.map(g=>{
  assert.equal(g.parentFamilies.length,1);
  const mother=g.parentFamilies[0];const mr=motherRank.get(mother);
  assert.ok(mr<=10);
  return {id:'NATIVE|'+g.rank,family:g.family,mother,motherRank:mr,
   evidence:'ROOTED',values:uniq(g.paths.map(p=>p.value)).sort(),
   sources:g.sourceCount,blocks:g.physicalBlocks,paths:g.paths.length,rank:g.rank,
   physicalKeys:g.paths.map(p=>canonPath(p.sourceId,p.path))};
 });
 const all=generatedAllPhysical(view,input.current,input.turn);
 // Every physical path of every original VT4 group must appear with its exact
 // mother VT3 and anchored 3-cell segment in the independent enumeration.
 const rootedKeys=new Map(all.rooted.map(g=>[g.id,new Set(g.physicalKeys)]));
 for(const g of native){
  const p=view.ranks.vt4[g.rank-1].paths[0],added=p.addedDigit;
  assert.ok(added?.length===1);
  const sideChoices=[];
  for(const side of ['prefix','suffix']){
   const id=g.mother+'|'+side+'|'+added+'|ROOTED';
   const root=rootedKeys.get(id);
   if(root&&g.physicalKeys.every(p=>root.has(p)))sideChoices.push(id);
  }
  assert.ok(sideChoices.length,'Ruta nativa sin madre física anclada: '+input.date+' '+input.turn+' '+g.family);
 }
 const added=sortedGroups(all.rooted.filter(g=>g.motherRank>10));
 const admitted=[...native,...added];
 const distinctNativeEvidence=new Set(native.flatMap(g=>g.physicalKeys));
 // Each ROOTED generation is from a true accepted maternal path.
 assert.ok(all.rooted.length>=native.length);
 assert.ok(all.unanchored.length);
 const physical=sortedGroups(all.unanchored).sort((x,y)=>
  Number(y.motherRank===null)-Number(x.motherRank===null)||
  y.sources-x.sources||y.blocks-x.blocks||(x.motherRank??9999)-(y.motherRank??9999)||x.family.localeCompare(y.family));
 return {native,admitted,onlyPhysical:physical,
  extraStats:{allPhysicalThreePaths:all.physicalMothers,
   acceptedPhysicalThreePaths:all.rootedMotherPaths,
   allRootedVt4Groups:all.rooted.length,
   unanchoredVt4Groups:all.unanchored.length,
   admittedBeyondTenGroups:added.length,originalVt4Groups:native.length,
   nativePhysicalKeys:distinctNativeEvidence.size}};
}
function selected(groups){
 const used=new Set(),groupsSeen=new Set(),rows=[],perMother=new Map();
 const accepts=g=>!groupsSeen.has(g.id)&&!g.values.some(x=>used.has(x));
 const add=g=>{
  assert.ok(accepts(g));rows.push(g);groupsSeen.add(g.id);
  for(const v of g.values)used.add(v);
  perMother.set(g.mother,(perMother.get(g.mother)||0)+1);
 };
 return {rows,used,perMother,accepts,add};
}
function priorityBucket(g,mode){
 if(mode==='ADMITIDAS_ESTRATOS'){
  const r=g.motherRank;
  return r<=5?0:r<=10?1:r<=25?2:3;
 }
 if(mode==='FISICAS_ESTRATOS'){
  if(g.evidence==='ONLY_PHYSICAL')return 3;
  return g.motherRank<=5?0:g.motherRank<=10?1:2;
 }
 throw Error(mode);
}
function choose(pools,mode){
 if(mode==='BASE_CORREGIDA')return {chosen:pools.native.slice(0,10),overflow:0,limits:[],deficits:[]};
 const c=selected(pools.admitted),deficits=[];
 if(mode==='TOP10_CUPO2'||mode==='ADMITIDAS_CUPO2'||mode==='FISICAS_ORDEN_GLOBAL'){
  const all=mode==='TOP10_CUPO2'?pools.native:
   mode==='ADMITIDAS_CUPO2'?pools.admitted:[...pools.admitted,...pools.onlyPhysical];
  if(mode==='FISICAS_ORDEN_GLOBAL'){
   for(const g of all)if(c.rows.length<10&&c.accepts(g))c.add(g);
  }else{
   for(const g of all)if(c.rows.length<10&&c.accepts(g)&&(c.perMother.get(g.mother)||0)<2)c.add(g);
   for(const g of all)if(c.rows.length<10&&c.accepts(g))c.add(g);
  }
 }else if(mode==='FISICAS_DOS_NUEVAS'){
  const base=choose(pools,'TOP10_CUPO2').chosen;
  for(const g of base.slice(0,8))c.add(g);
  let n=0;
  for(const g of pools.onlyPhysical)if(n<2&&c.accepts(g)){c.add(g);n++;}
  if(n<2)deficits.push({bucket:'SIN_ANCLAJE',missing:2-n});
  for(const g of pools.admitted)if(c.rows.length<10&&c.accepts(g))c.add(g);
  for(const g of pools.onlyPhysical)if(c.rows.length<10&&c.accepts(g))c.add(g);
 }else{
  const quotas=mode==='ADMITIDAS_ESTRATOS'?[4,2,2,2]:
    mode==='FISICAS_ESTRATOS'?[4,2,2,2]:null;
  assert.ok(quotas);
  const full=mode==='FISICAS_ESTRATOS'?[...pools.admitted,...pools.onlyPhysical]:pools.admitted;
  const strata=Array.from({length:4},(_,b)=>full.filter(g=>priorityBucket(g,mode)===b));
  for(let b=0;b<4;b++){
   const before=c.rows.length;
   for(const g of strata[b])if(c.rows.length-before<quotas[b]&&c.accepts(g)&&
    (c.perMother.get(g.mother)||0)<2)c.add(g);
   const remaining=quotas[b]-(c.rows.length-before);
   if(remaining>0)deficits.push({bucket:b,missing:remaining});
  }
  for(const g of full)if(c.rows.length<10&&c.accepts(g))c.add(g);
 }
 assert.equal(c.rows.length,10,'No hay diez grupos físicos únicos para '+mode);
 return {chosen:c.rows,overflow:deficits.reduce((n,x)=>n+x.missing,0),deficits,
  limits:c.rows.map(x=>x.evidence)};
}
function methodResult(c){
 return {
  rank:c.chosen.map((g,i)=>({rank:i+1,family:g.family,values:g.values,
   mother:g.mother,motherRank:g.motherRank,evidence:g.evidence,
   physicalRoutes:g.paths,sourceCount:g.sources,blocks:g.blocks})),
  uniqueNumbers:new Set(c.chosen.flatMap(g=>g.values)).size,
  distinctMothers:new Set(c.chosen.map(g=>g.mother)).size,
  unanchoredSlots:c.chosen.filter(x=>x.evidence==='ONLY_PHYSICAL').length,
  mothersAfterTen:c.chosen.filter(x=>x.evidence==='ROOTED'&&x.motherRank>10).length,
  deficits:c.deficits,overflow:c.overflow
 };
}
function pre(){
 assert.ok(!existsSync(POST),'POST visible');
 assert.ok(!existsSync(FIXTURE),'Fixture completo visible');
 const pre=j(INPUT).rows,prev=j(PRIOR).rows;
 assert.equal(pre.length,115);assert.equal(prev.length,115);
 const rows=[];
 for(let i=0;i<115;i++){
  const cut=pre[i];assert.equal(key(cut),key(prev[i]));
  assert.equal(cut.current.heads[cut.turn].length,0);
  assert.ok(cut.history.every(x=>x.date<cut.date));
  const view=buildMotorLalo(cut.current,cut.date,cut.turn,cut.history);
  const pools=available(view,cut);
  const picks=Object.fromEntries(METHODS.map(method=>[method,methodResult(choose(pools,method))]));
  assert.deepEqual(picks.TOP10_CUPO2.rank.map(x=>x.family),prev[i].options.CUPO_2.ranked.map(x=>x.family),
   'No reproduce el control VT4 corregido previo: '+key(cut));
  for(const method of METHODS)assert.equal(picks[method].rank.length,10);
  rows.push({i,date:cut.date,turn:cut.turn,
   tiers:pools.extraStats,vt3Count:view.ranks.vt3.length,
   options:picks});
  if(i%20===19)console.log('ADMISION_PRE_CUT',i+1);
 }
 save('PRE_115.json',{date:'2026-10-13',cuts:rows.length,rows});
 const seal={input:hash(read(INPUT)),prior:hash(read(PRIOR)),
  protocol:hash(read(PROTOCOL)),code:hash(read('scripts/lab-vt4-admision-madres.mjs')),
  pre:hash(read(DIR+'PRE_115.json'))};
 save('SELLO.json',seal);
 console.log('ADMISION_PRE_OK',JSON.stringify({cuts:rows.length,seal}));
}
function aggregate(rows,method){
 const sample=rows.map(r=>r.results[method]);
 return {cuts:rows.length,top3:sample.filter(x=>x.top3).length,
  top5:sample.filter(x=>x.top5).length,top10:sample.filter(x=>x.top10).length,
  meanDistinctMothers:Number(mean(sample.map(x=>x.distinctMothers)).toFixed(3)),
  meanDistinctFour:Number(mean(sample.map(x=>x.uniqueNumbers)).toFixed(3)),
  meanUnanchoredSlots:Number(mean(sample.map(x=>x.unanchoredSlots)).toFixed(3)),
  meanBeyondTop10Slots:Number(mean(sample.map(x=>x.mothersAfterTen)).toFixed(3)),
  meanQuotasUnfilled:Number(mean(sample.map(x=>x.overflow)).toFixed(3)),
  gainsVsCupo2:rows.filter(r=>r.results[method].top10&&!r.results.TOP10_CUPO2.top10).map(key),
  lossesVsCupo2:rows.filter(r=>!r.results[method].top10&&r.results.TOP10_CUPO2.top10).map(key),
  changedTop10:rows.filter(r=>r.results[method].families.join('|')!==r.results.TOP10_CUPO2.families.join('|')).length};
}
function post(){
 const seal=j(DIR+'SELLO.json');
 for(const [p,h] of [[INPUT,seal.input],[PRIOR,seal.prior],[PROTOCOL,seal.protocol],
  ['scripts/lab-vt4-admision-madres.mjs',seal.code],[DIR+'PRE_115.json',seal.pre]])
  assert.equal(hash(read(p)),h);
 const pre=j(DIR+'PRE_115.json').rows,goals=j(POST).rows;
 assert.equal(pre.length,115);assert.equal(goals.length,115);
 const rows=pre.map((cut,i)=>{
  const g=goals[i];assert.equal(key(cut),key(g));
  assert.ok(g.heads.length===5&&g.heads.every(isFour));
  const results=Object.fromEntries(METHODS.map(method=>{
   const option=cut.options[method],groups=option.rank;
   const hit=n=>groups.slice(0,n).some(gr=>gr.values.some(v=>g.heads.includes(v)));
   const matched=groups.flatMap(gr=>gr.values.filter(x=>g.heads.includes(x)).map(head=>({
    head,family:gr.family,rank:gr.rank,mother:gr.mother,evidence:gr.evidence})));
   return [method,{top3:hit(3),top5:hit(5),top10:hit(10),
    matched,families:groups.map(x=>x.family),
    uniqueNumbers:option.uniqueNumbers,distinctMothers:option.distinctMothers,
    unanchoredSlots:option.unanchoredSlots,mothersAfterTen:option.mothersAfterTen,
    overflow:option.overflow}];
  }));
  return {date:cut.date,turn:cut.turn,targets:g.heads,results};
 });
 const total=Object.fromEntries(METHODS.map(m=>[m,aggregate(rows,m)]));
 assert.deepEqual([total.TOP10_CUPO2.top3,total.TOP10_CUPO2.top5,total.TOP10_CUPO2.top10],[0,0,4]);
 const weeks=Object.fromEntries(uniq(rows.map(r=>currentWeek(r.date))).map(week=>[
  week,Object.fromEntries(METHODS.map(m=>[m,aggregate(rows.filter(r=>currentWeek(r.date)===week),m)]))]));
 const draws=rows.filter(x=>METHODS.some(m=>x.results[m].top10));
 save('POST_115.json',{rows});
 save('RESUMEN.json',{date:'2026-10-13',cuts:115,total,weeks,
  rescuedOrHitCuts:draws.map(x=>({date:x.date,turn:x.turn,
   hits:Object.fromEntries(METHODS.map(m=>[m,x.results[m].matched]))})),
  physicalAdmissionNotes:'ROOTED path only if actual VT3 admitted path; ONLY_PHYSICAL means a different real path with no historical root, never borrowed.',
  warning:'Histórico explorado exhaustivamente. Conteos retrospectivos no prueban ventaja predictiva. Sorteos aleatorios.',seal});
 console.log('ADMISION_POST_OK',JSON.stringify({total,draws:draws.map(x=>({date:x.date,turn:x.turn,
  hit:Object.fromEntries(METHODS.map(m=>[m,x.results[m].matched]))}))},null,2));
}
if(process.argv[2]==='pre')pre();else if(process.argv[2]==='post')post();else throw Error('use pre/post');
