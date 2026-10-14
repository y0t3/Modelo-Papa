import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
const DATE='2026-10-13';
const BASE='auditorias/vt3-cotejo-nocturna-13oct2026/';
const OUT='auditorias/vt3-causas-anclaje-13oct2026/';
const SCRIPT='scripts/lab-vt3-causas-anclaje.mjs';
const PROTOCOL='PROTOCOLO_VT3_CAUSAS_ANCLAJE_13OCT2026.md';
const EXPECT_MAT='067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41';
const TURNS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const JUR=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos'];
const read=p=>readFileSync(p,'utf8'),J=p=>JSON.parse(read(p));
const hash=s=>createHash('sha256').update(s).digest('hex');
const save=(n,v)=>writeFileSync(OUT+n,JSON.stringify(v,null,2)+'\n');
const key=r=>r.date+'|'+r.turn,rev=s=>[...s].reverse().join(''),
 fam=s=>[s,rev(s)].sort().join('/'),unique=x=>[...new Set(x)];
const coord=c=>c.row+':'+c.col,position=p=>p.map(coord).join('>');
const canonical=(source,p)=>source+'|'+[position(p),position([...p].reverse())].sort()[0];
const edge=(a,b)=>[a,b].sort().join('~'),block=p=>p.map(coord).sort().join(',');
const adj=(a,b)=>Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1;
const normalized=(cells)=>{
 const points=cells.map(s=>s.split(':').map(Number));
 const lowR=Math.min(...points.map(x=>x[0])),lowC=Math.min(...points.map(x=>x[1]));
 const translated=points.map(([r,c])=>(r-lowR)+':'+(c-lowC));
 return [translated.join('>'),translated.slice().reverse().join('>')].sort()[0];
};
const edges=cells=>new Set(cells.slice(1).map((v,i)=>edge(cells[i],v)));
const countOrZero=(a,k)=>a.filter(x=>x===k).length;
mkdirSync(OUT,{recursive:true});
const runtime='resultados/runtime-vt3-causas-13oct';
for(const name of ['domain','dates','paths','sheet','motorLalo','vt3Audit']){
 const dest=resolve(runtime,name+'.mjs');mkdirSync(dirname(dest),{recursive:true});
 writeFileSync(dest,stripTypeScriptTypes(read('src/'+name+'.ts')).replace(
  /from '(\.{1,2}\/[^']+)'/g,(_,v)=>"from '"+v+".mjs'"));
}
const load=async n=>import(pathToFileURL(resolve(runtime,n+'.mjs')).href);
const {buildMotorLalo}=await load('motorLalo');
const {cellsFromPlus11,findPaths}=await load('paths');
const {auditVt3Family}=await load('vt3Audit');
const sortFamily=(a,b)=>a.family.localeCompare(b.family);
function inventory(input,view){
 const t=TURNS.indexOf(input.turn);assert.ok(t>=0);
 const visible=input.current.columns.slice(0,t+1);
 const all=new Map();
 for(const source of visible){
  const cells=cellsFromPlus11(source.values);
  function dfs(p){
   if(p.length===3){
    const family=fam(p.map(x=>x.digit).join(''));
    if(!all.has(family))all.set(family,[]);
    const list=all.get(family),physicalKey=canonical(source.id,p);
    if(!list.some(x=>x.physicalKey===physicalKey))
      list.push({source:source.id,physicalKey,value:p.map(x=>x.digit).join(''),
       cells:p.map(coord),shape:normalized(p.map(coord)),block:source.id+'|'+block(p)});
    return;
   }
   for(const c of cells)if(!p.includes(c)&&(!p.length||adj(p.at(-1),c)))dfs([...p,c]);
  }
  dfs([]);
 }
 // Validate exhaustive DFS against independent findPaths for EVERY family in each available source.
 for(const [family,physical] of all){
  for(const source of visible){
   const expected=new Set(unique(family.split('/')).flatMap(letters=>
    findPaths(source.values,letters).map(p=>canonical(source.id,p))));
   const observed=new Set(physical.filter(p=>p.source===source.id).map(p=>p.physicalKey));
   assert.deepEqual([...observed].sort(),[...expected].sort(),
    'Enumeración física no exhaustiva '+input.turn+'|'+family+'|'+source.id);
  }
 }
 const anchoredRanks=new Map(view.ranks.vt3.map(x=>[x.family,x]));
 for(const f of view.ranks.vt3)assert.ok(all.has(f.family),
  'Candidato oficial no existe físicamente '+key(input)+' '+f.family);
 const witnesses=new Map();
 for(const f of view.ranks.vt3)for(const p of f.paths){
  const routeKey=canonical(p.sourceId,p.path);
  if(!witnesses.has(f.family))witnesses.set(f.family,new Map());
  const map=witnesses.get(f.family);
  assert.ok(!map.has(routeKey),'Camino anclado duplicado '+routeKey);
  map.set(routeKey,p);
 }
 const historicalRoots=view.roots.filter(r=>r.oldCells.length===3);
 const historicalRootsByFamily=new Map();
 for(const root of historicalRoots){
  const family=fam(root.head.slice(-3));
  if(!historicalRootsByFamily.has(family))historicalRootsByFamily.set(family,[]);
  historicalRootsByFamily.get(family).push(root);
 }
 const profiles=[];
 for(const [family,paths] of all){
  const official=anchoredRanks.get(family)||null;
  const found=witnesses.get(family)||new Map();
  for(const w of found.keys())assert.ok(paths.some(p=>p.physicalKey===w),
   'Camino del motor no encontrado en DFS '+key(input)+' '+family);
  const members=paths.map(p=>{
   const anchored=found.get(p.physicalKey)||null;
   const candidateRoots=historicalRoots.filter(r=>r.sourceId===p.source);
   const sameShape=candidateRoots.filter(r=>normalized(r.oldCells)===p.shape);
   const sameFamily=candidateRoots.filter(r=>fam(r.head.slice(-3))===family);
   const sameFamilyAndShape=sameShape.filter(r=>fam(r.head.slice(-3))===family);
   const ownAnchored=anchored?.rootIds.map(id=>view.roots.find(r=>r.id===id)).filter(Boolean)||[];
   const shareEdge=paths.filter(other=>{
    if(other.physicalKey===p.physicalKey||other.source!==p.source)return false;
    if(!found.has(other.physicalKey)||other.block===p.block)return false;
    const a=edges(p.cells),b=edges(other.cells);
    return [...a].some(e=>b.has(e));
   });
   return {...p,admitted:Boolean(anchored),origin:anchored?.origin||null,
    ownRoots:ownAnchored.map(r=>({
     period:r.period,date:r.date,head:r.head,oldTurn:r.oldTurn,
     source:r.sourceId,oldCells:r.oldCells
    })),
    rootCandidatesSameSource:candidateRoots.length,
    geomRootsSameSource:unique(sameShape.map(r=>r.id)).length,
    ownFamilyRootsSameSource:unique(sameFamily.map(r=>r.id)).length,
    sameFamilyGeomRoots:unique(sameFamilyAndShape.map(r=>r.id)).length,
    rootedSiblingEdge:shareEdge.map(x=>x.physicalKey)};
  });
  const sources=unique(paths.map(p=>p.source)).sort();
  const blocks=unique(paths.map(p=>p.block)).length;
  const shapes=unique(paths.map(p=>p.shape)).length;
  const admittedRoutes=members.filter(x=>x.admitted);
  const ownOldRoots=historicalRootsByFamily.get(family)||[];
  const category=!official?'FISICA_SIN_RAIZ':official.rank<=3?'ADMITIDA_TOP3':
   official.rank<=10?'ADMITIDA_4_10':'ADMITIDA_11_PLUS';
  const profile={family,category,rank:official?.rank||null,
   sourceIds:sources,sourceCount:sources.length,blockCount:blocks,
   shapeCount:shapes,physicalPaths:paths.length,admittedPaths:admittedRoutes.length,
   bifurcations:official?.branchBlocks||0,d1:official?.d1Roots||0,d7:official?.d7Roots||0,
   ownHistoricalRoots:ownOldRoots.length,
   sameSourceHistoricalRoots:unique(members.flatMap(x=>x.ownRoots
    .map(y=>y.date+'|'+y.head))).length,
   physicalRootCandidatesSameSource:members.reduce((s,x)=>s+x.rootCandidatesSameSource,0),
   geomRootOpportunities:members.reduce((s,x)=>s+x.geomRootsSameSource,0),
   ownFamilyRootOpportunities:members.reduce((s,x)=>s+x.ownFamilyRootsSameSource,0),
   sameFamilyGeomOpportunities:members.reduce((s,x)=>s+x.sameFamilyGeomRoots,0),
   paths:members};
  if(!official){
   assert.equal(profile.admittedPaths,0);
   assert.equal(profile.d1+profile.d7,0);
   assert.ok(members.every(x=>x.rootedSiblingEdge.length===0),
    'Ruta física sin raíz con bifurcación desde la MISMA familia y fuente: revisar motor');
  }else{
   assert.ok(profile.admittedPaths>0);
   assert.equal(profile.d1,official.d1Roots);assert.equal(profile.d7,official.d7Roots);
  }
  profiles.push(profile);
 }
 const byCategory=Object.fromEntries(['ADMITIDA_TOP3','ADMITIDA_4_10',
  'ADMITIDA_11_PLUS','FISICA_SIN_RAIZ'].map(c=>[c,profiles.filter(p=>p.category===c).length]));
 assert.equal(Object.values(byCategory).reduce((a,b)=>a+b,0),profiles.length);
 const rankProfiles=profiles.filter(x=>x.rank!==null).sort((a,b)=>a.rank-b.rank);
 assert.equal(rankProfiles.length,view.ranks.vt3.length);
 const officialPriority=p=>[Number(p.bifurcations>0),Math.min(p.bifurcations,15),
  Math.min(p.d1,10),Math.min(p.d7,10),p.sourceCount,p.blockCount];
 const compareTo=(q,rank)=>{
  if(q.rank===null)return null;
  const boundary=rankProfiles[rank-1];
  if(!boundary)return null;
  const names=['Bifurcación presente','Bloques bifurcados','Antecedentes D−1','Antecedentes D−7',
   'Cantidad de fuentes','Cantidad de bloques físicos'];
  const a=officialPriority(q),b=officialPriority(boundary);
  const first=a.findIndex((x,i)=>x!==b[i]);
  return {boundary:boundary.family,boundaryRank:rank,own:q.family,ownRank:q.rank,
   criterion:first>=0?names[first]:'Desempate alfabético',
   candidateValue:first>=0?a[first]:null,boundaryValue:first>=0?b[first]:null,
   candidateTuple:a,boundaryTuple:b};
 };
 for(const p of profiles)if(p.rank!==null){
  p.vsTop3=compareTo(p,3);p.vsTop10=compareTo(p,10);
 }
 const identity=p=>p.sourceIds.join(',')+'|'+p.physicalPaths+'|'+p.blockCount;
 for(const p of profiles){
  const targetPool=profiles.filter(q=>q.family!==p.family&&q.category===p.category);
  p.sameStrict=targetPool.filter(q=>identity(q)===identity(p)).map(q=>q.family);
  p.sameRelaxed=targetPool.filter(q=>q.sourceIds.join(',')===p.sourceIds.join(',')&&
   q.physicalPaths===p.physicalPaths).map(q=>q.family);
  // Additional same-class/source control; avoids declaring uniqueness from an empty exact cohort.
  p.sameSourceOnly=targetPool.filter(q=>q.sourceIds.join(',')===p.sourceIds.join(','))
   .map(q=>q.family);
 }
 return {date:input.date,turn:input.turn,sourceColumns:visible.map(x=>({id:x.id,values:x.values})),
  previousHistory:input.history.map(x=>({date:x.date,period:x.period})),
  rootEventCount:view.roots.length,historicalVt3RootCount:historicalRoots.length,
  physicalFamilyCount:profiles.length,physicalPathCount:profiles.reduce((n,p)=>n+p.physicalPaths,0),
  admitCount:rankProfiles.length,byCategory,profiles:profiles.sort(sortFamily)};
}
function prepare(){
 for(const p of [BASE+'OBJETIVOS_POST_13OCT.json',BASE+'POST_13OCT.json',
  BASE+'RESUMEN.json','fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64'])
  assert.ok(!existsSync(p),'Resultado visible durante PRE '+p);
 assert.equal(hash(read('auditorias/vt3-en-vivo-13oct2026/MATUTINA_PRE_SELLADA.json')),EXPECT_MAT);
 const inputs=J(BASE+'INPUT_PRE_13OCT.json').rows;
 const old=J(BASE+'PRE_13OCT.json').rows;
 assert.equal(inputs.length,5);assert.equal(old.length,5);
 const stages=[];
 for(let i=0;i<5;i++){
  const inp=inputs[i],prior=old[i];
  assert.equal(key(inp),key(prior));
  const ti=TURNS.indexOf(inp.turn);assert.equal(i,ti);
  assert.equal(inp.current.heads[inp.turn].length,0);
  for(const t of TURNS.slice(ti))assert.equal(inp.current.heads[t].length,0);
  assert.ok(inp.history.every(h=>h.date<inp.date));
  const view=buildMotorLalo(inp.current,inp.date,inp.turn,inp.history);
  assert.deepEqual(view.ranks.vt3.map(f=>f.family),prior.ranks.map(f=>f.family));
  assert.deepEqual(inp.current.columns.slice(0,ti+1).map(c=>({source:c.id,values:c.values})),prior.sourceColumns);
  const stage=inventory(inp,view);
  stages.push(stage);
  console.log('VT3_CAUSAS_PRE',JSON.stringify({
   turn:stage.turn,physicalFamilies:stage.physicalFamilyCount,
   admitted:stage.admitCount,rootless:stage.byCategory.FISICA_SIN_RAIZ,
   physicalRoutes:stage.physicalPathCount}));
 }
 save('PRE_5_TURNOS.json',{date:DATE,stages,
  warning:'Aislamiento intraejecución en prueba retrospectiva: no implica PRE prospectivo'});
 const seal={source:hash(read(BASE+'INPUT_PRE_13OCT.json')),
  oldPre:hash(read(BASE+'PRE_13OCT.json')),matutina:EXPECT_MAT,
  protocol:hash(read(PROTOCOL)),script:hash(read(SCRIPT)),
  motor:hash(read('src/motorLalo.ts')),audit:hash(read('src/vt3Audit.ts')),
  pre:hash(read(OUT+'PRE_5_TURNOS.json'))};
 save('SELLO.json',seal);
 console.log('VT3_CAUSAS_PRE_SELLADO',JSON.stringify({
  stages:stages.length,seal,physics:stages.map(x=>[x.turn,x.physicalFamilyCount,x.admitCount])}));
}
function post(){
 const seal=J(OUT+'SELLO.json');
 for(const [p,h] of [[BASE+'INPUT_PRE_13OCT.json',seal.source],
  [BASE+'PRE_13OCT.json',seal.oldPre],
  ['auditorias/vt3-en-vivo-13oct2026/MATUTINA_PRE_SELLADA.json',seal.matutina],
  [PROTOCOL,seal.protocol],[SCRIPT,seal.script],['src/motorLalo.ts',seal.motor],
  ['src/vt3Audit.ts',seal.audit],[OUT+'PRE_5_TURNOS.json',seal.pre]])
  assert.equal(hash(read(p)),h,'Cambiaron PRE o código '+p);
 const PRE=J(OUT+'PRE_5_TURNOS.json').stages;
 const actual=J(BASE+'OBJETIVOS_POST_13OCT.json');
 const post13=J(BASE+'POST_13OCT.json').cases;
 assert.equal(PRE.length,5);assert.equal(post13.length,5);
 const selected={Matutino:['1057'],Nocturno:['1234','4625','9192']};
 const cases=[],coverage=[];
 for(let i=0;i<5;i++){
  const p=PRE[i],heads=actual.turns[p.turn],targets=post13[i].heads;
  assert.equal(p.turn,post13[i].turn);assert.equal(heads.length,5);
  const winningFamilies=new Set(heads.map(h=>fam(h.slice(-3))));
  const observed=heads.map((head,j)=>{
   assert.equal(targets[j].head,head);
   const family=fam(head.slice(-3)),data=p.profiles.find(x=>x.family===family)||null;
   assert.equal(data?.rank??null,targets[j].originalRank);
   assert.equal(data?.physicalPaths??0,targets[j].physicalRoutes);
   const cls=data?.category||'SIN_FORMACION_FISICA';
   const strict=data?.sameStrict||[],relaxed=data?.sameRelaxed||[],sourceOnly=data?.sameSourceOnly||[];
   const negativeExpected=xs=>xs.filter(f=>!winningFamilies.has(f));
   return {jurisdiction:JUR[j],head,family,category:cls,
    ranking:data?.rank??null,d1:data?.d1??0,d7:data?.d7??0,
    bifurcations:data?.bifurcations??0,physicalPaths:data?.physicalPaths??0,
    admittedPaths:data?.admittedPaths??0,
    sources:data?.sourceIds||[],blocks:data?.blockCount??0,forms:data?.shapeCount??0,
    ownOldRoots:data?.ownHistoricalRoots??0,
    rootCandidateGeometryCount:data?.geomRootOpportunities??0,
    ownFamilyGeomOpportunities:data?.sameFamilyGeomOpportunities??0,
    ownFamilyRoots:data?.ownFamilyRootOpportunities??0,
    rankWhyTop3:data?.vsTop3||null,rankWhyTop10:data?.vsTop10||null,
    strictMatchedComparables:strict.length,strictOtherWinners:strict.length-negativeExpected(strict).length,
    relaxedMatchedComparables:relaxed.length,relaxedOtherWinners:relaxed.length-negativeExpected(relaxed).length,
    sameSourceComparables:sourceOnly.length,
    comparableNonWinners:negativeExpected(strict).slice(0,12),
    paths:data?.paths||[]};
  });
  for(const head of selected[p.turn]||[])assert.ok(observed.some(x=>x.head===head&&x.physicalPaths>0),
   'Foco de investigación no forma camino físico '+p.turn+' '+head);
  const classes=['ADMITIDA_TOP3','ADMITIDA_4_10','ADMITIDA_11_PLUS',
   'FISICA_SIN_RAIZ','SIN_FORMACION_FISICA'];
  const byOutcome=Object.fromEntries(classes.map(c=>[c,observed.filter(x=>x.category===c).length]));
  coverage.push({turn:p.turn,totalPhysicalFamilies:p.physicalFamilyCount,
   totalAdmitted:p.admitCount,totalWithoutRoot:p.byCategory.FISICA_SIN_RAIZ,
   observed:byOutcome});
  cases.push({turn:p.turn,heads:observed});
 }
 const focal=cases.flatMap(c=>c.heads).filter(x=>selected[cases.find(z=>z.heads.includes(x)).turn]?.includes(x.head));
 const none=cases.flatMap(x=>x.heads).filter(x=>x.category==='SIN_FORMACION_FISICA');
 const summary={date:DATE,cuts:5,heads:25,focused:focal,coverage,
  allObserved:cases.flatMap(c=>c.heads.map(x=>({turn:c.turn,head:x.head,
   category:x.category,physical:x.physicalPaths,rank:x.ranking}))),
  totals:{noPhysical:none.length,physicalRootless:coverage.reduce((s,x)=>s+x.observed.FISICA_SIN_RAIZ,0),
   admittedLow:coverage.reduce((s,x)=>s+x.observed.ADMITIDA_11_PLUS,0),
   admittedTop10:coverage.reduce((s,x)=>s+x.observed.ADMITIDA_4_10+x.observed.ADMITIDA_TOP3,0)},
  seal,warning:'Causas mecánicas verificadas en código y hoja; 13/10 ya publicado y muy analizado. Los comparables no son pruebas predictivas.'};
 assert.equal(summary.totals.noPhysical,18);
 assert.equal(summary.totals.physicalRootless,4);
 assert.equal(summary.totals.admittedLow,2);
 assert.equal(summary.totals.admittedTop10,1);
 save('POST_13OCT.json',{cases});
 save('RESUMEN.json',summary);
 const matrix=focal.map(x=>[
  x.head,x.family,x.category,x.ranking??'–',x.physicalPaths,
  x.sources.join(', '),x.ownFamilyRoots,x.ownFamilyGeomOpportunities,
  x.strictMatchedComparables,x.relaxedMatchedComparables].join(' | ')).map(s=>'| '+s+' |').join('\n');
 const md='# Análisis de causas reales de admisión VT3, 13/10/2026\n\n'+
 'No es una prueba prospectiva. Se censaron todas las familias VT3 físicas por corte y se selló inventario antes de cotejar el resultado conocido del 13/10 dentro del laboratorio.\n\n'+
 '| Cabeza | Familia | Situación | Rango | Caminos físicos | Fuente(s) | Raíces propias candidatas en fuentes | Raíces de igual forma/familia | Controles exactos | Controles relajados |\n'+
 '|---|---|---|---:|---:|---|---:|---:|---:|---:|\n'+matrix+'\n\n'+
 'El criterio de admisión actual exige traslado válido de D−1/D−7 en la misma fuente o bifurcación geométrica con borde común con ruta admitida **de la misma familia**. Un camino que se pueda dibujar no basta para asignarle raíces. Una raíz geométricamente parecida pero de otra familia tampoco se puede prestar.\n\n'+
 '## Censo de exposición por corte\n\n| Turno | Familias físicas | Admitidas | Físicas sin raíz | Cabezas sin físico | Cabezas sin raíz | Cabezas admitidas fuera Top10 |\n|---|---:|---:|---:|---:|---:|---:|\n'+coverage.map(x=>
 '| '+x.turn+' | '+x.totalPhysicalFamilies+' | '+x.totalAdmitted+
 ' | '+x.totalWithoutRoot+' | '+x.observed.SIN_FORMACION_FISICA+
 ' | '+x.observed.FISICA_SIN_RAIZ+' | '+x.observed.ADMITIDA_11_PLUS+' |').join('\n')+
 '\n\n## Qué falta para subir al Top\n\n'+
 focal.map(x=>'- **'+x.head+' / '+x.family+'**: '+(x.rankWhyTop10?
 'puesto '+x.ranking+'; frente al límite #10 domina '+x.rankWhyTop10.criterion+
 ' ('+x.rankWhyTop10.candidateValue+' propio vs '+x.rankWhyTop10.boundaryValue+' en el corte).':
 'No tiene rango VT3: '+x.physicalPaths+' camino(s) físico(s) sin traslado o bifurcación raíz propia admitida.')+
 ' Compite con '+x.strictMatchedComparables+' familias no ganadoras o comparables (excluyendo la propia) en su mismo estrato estricto.' ).join('\n')+
 '\n\n**No promover cambios de ranking ni de admisión con esta muestra**. Revisar testigos y negativas antes de cualquier hipótesis nueva, preservando el papel de VT3 como madre de VT4.\n';
 writeFileSync(OUT+'LECTURA.md',md);
 console.log('VT3_CAUSAS_POST_OK',JSON.stringify({
  focus:focal.map(x=>({head:x.head,family:x.family,category:x.category,rank:x.ranking,
   paths:x.physicalPaths,rootOpp:x.ownFamilyRootOpportunities,
   sameShape:x.ownFamilyGeomOpportunities,strict:x.strictMatchedComparables,
   relaxed:x.relaxedMatchedComparables,reason:x.rankWhyTop10,
   pathsD:x.paths.map(y=>({source:y.source,value:y.value,cells:y.cells,
    admitted:y.admitted,origin:y.origin,roots:y.ownRoots.length,
    shapeRoots:y.geomRootsSameSource,ownRoots:y.ownFamilyRootsSameSource}))})),
  coverage,totals:summary.totals},null,2));
}
if(process.argv[2]==='pre')prepare();
else if(process.argv[2]==='post')post();
else throw Error('Uso: pre|post');
