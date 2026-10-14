import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
const DATE='2026-10-13';
const OUT='auditorias/vt3-cotejo-nocturna-13oct2026/';
const HEADS=OUT+'OBJETIVOS_POST_13OCT.json';
const PRE_INPUT=OUT+'INPUT_PRE_13OCT.json';
const FIXTURE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const PRIOR='auditorias/vt3-en-vivo-13oct2026/';
const PROTOCOL='PROTOCOLO_VT3_COTEJO_NOCTURNA_13OCT2026.md';
const RULE='PROTOCOLO_VT3_TERCERO_PROSPECTIVO_14OCT2026.md';
const SCRIPT='scripts/lab-vt3-cotejo-nocturna-13oct2026.mjs';
const EXPECT_MAT='067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41';
const JUR=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const previous12=[
 ['7447','0334','5276','4616','2403','----'],
 ['3825','9554','3107','2696','7634','----'],
 ['2436','3489','1099','8362','2400','----'],
 ['2716','3433','4801','4903','3245','----'],
 ['9851','1615','7242','8290','3264','----']
];
const SHA12=''; // Same previous-day numbers as sealed PRE Matutina.
const read=p=>readFileSync(p,'utf8'),j=p=>JSON.parse(read(p));
const sha=x=>createHash('sha256').update(x).digest('hex');
const save=(name,obj)=>writeFileSync(OUT+name,JSON.stringify(obj,null,2)+'\n');
const unique=x=>[...new Set(x)];
const canon=x=>[x,[...x].reverse().join('')].sort().join('/');
const turnKey=x=>x.date+'|'+x.turn;
mkdirSync(OUT,{recursive:true});
const runtime='resultados/runtime-vt3-cotejo-nocturna-13oct';
for(const k of ['domain','dates','paths','sheet','motorLalo','vt3Audit']){
 const dest=resolve(runtime,k+'.mjs');mkdirSync(dirname(dest),{recursive:true});
 writeFileSync(dest,stripTypeScriptTypes(read('src/'+k+'.ts')).replace(/from '(\.{1,2}\/[^']+)'/g,(_,p)=>"from '"+p+".mjs'"));
}
const load=async k=>import(pathToFileURL(resolve(runtime,k+'.mjs')).href);
const {TURNOS,diaVacio}=await load('domain');
const {buildSheet}=await load('sheet');
const {buildMotorLalo}=await load('motorLalo');
const {auditVt3Family}=await load('vt3Audit');
function draw(raw,date){
 assert.ok(raw[date]&&raw[date].length===5,'Falta fecha cruda '+date);
 const result=diaVacio();
 for(let ti=0;ti<TURNOS.length;ti++)for(let k=0;k<JUR.length;k++){
  const h=raw[date][ti][k];
  assert.ok(h==='----'||/^\d{4}$/.test(h));
  result[TURNOS[ti]][JUR[k]]=h;
 }
 return result;
}
function choose(view,date,turn){
 const ranked=view.ranks.vt3;
 assert.ok(ranked.length>=10);
 const selected=ranked.slice(2,10).sort((a,b)=>
   b.d1Roots-a.d1Roots||b.d7Roots-a.d7Roots||
   b.physicalBlocks-a.physicalBlocks||a.rank-b.rank)[0];
 const neutral=ranked.slice(2,10).sort((a,b)=>
  sha(date+'|'+turn+'|'+a.family).localeCompare(sha(date+'|'+turn+'|'+b.family)))[0];
 assert.ok(selected.rank>=3&&selected.rank<=10);
 const original=ranked.slice(0,10).map(x=>x.family);
 const variant=(third)=>[...original.slice(0,2),third,...original.slice(2).filter(x=>x!==third)];
 const d1=variant(selected.family),hash=variant(neutral.family);
 assert.deepEqual(d1.slice(0,2),original.slice(0,2));
 assert.deepEqual(d1.slice().sort(),original.slice().sort());
 assert.deepEqual(hash.slice().sort(),original.slice().sort());
 return {official:original,d1,hash,selected:{family:selected.family,oldRank:selected.rank,
  d1:selected.d1Roots,d7:selected.d7Roots,blocks:selected.physicalBlocks},
  neutral:{family:neutral.family,oldRank:neutral.rank}};
}
function prepare(){
 assert.ok(existsSync(HEADS));
 const published=j(HEADS);
 assert.equal(published.date,DATE);
 assert.deepEqual(Object.keys(published.turns),TURNOS);
 assert.equal(published.jurisdictions.length,5);
 for(const [t,hs] of Object.entries(published.turns)){
  assert.equal(hs.length,5,t);hs.forEach(h=>assert.match(h,/^\d{4}$/));
 }
 const raw=JSON.parse(gunzipSync(Buffer.from(read(FIXTURE).trim(),'base64')).toString('utf8'));
 assert.equal(Object.keys(raw).length,30);
 assert.ok(!raw[DATE]);assert.ok(!raw['2026-10-12']);
 raw['2026-10-12']=previous12;
 const history=[
  {date:'2026-10-12',period:'D−1',sheet:buildSheet(draw(raw,'2026-10-12'),draw(raw,'2026-10-10'))},
  {date:'2026-10-06',period:'D−7',sheet:buildSheet(draw(raw,'2026-10-06'),draw(raw,'2026-10-05'))}
 ];
 const entries=TURNOS.map((turn,i)=>{
  const current=diaVacio();
  for(let t=0;t<i;t++)for(let z=0;z<5;z++)
   current[TURNOS[t]][JUR[z]]=published.turns[TURNOS[t]][z];
  const sheet=buildSheet(current,draw(raw,'2026-10-12'));
  assert.equal(sheet.heads[turn].length,0);
  for(const t of TURNOS.slice(i))assert.equal(sheet.heads[t].length,0);
  for(const col of sheet.columns.slice(i+1))
   assert.ok(col.values.every(x=>x==='--'));
  const expectedPrev=published.turns[turn];
  assert.ok(expectedPrev.every(x=>!sheet.heads[turn].includes(x)));
  return {date:DATE,turn,current:sheet,history,knownPriorTurns:TURNOS.slice(0,i),
   knownPriorHeads:TURNOS.slice(0,i).map(t=>published.turns[t])};
 });
 save('INPUT_PRE_13OCT.json',{rows:entries,sourceDate:DATE,
  historical:'12 Oct D−1, 06 Oct D−7; Montevideo vacío 12 Oct',
  replayMode:'RETROSPECTIVO_PRE_RECONSTRUIDO',
  inputTargetsSha256:sha(read(HEADS))});
 console.log('13OCT_PREPARE_OK',JSON.stringify({cuts:entries.length,
  byTurn:entries.map(x=>({turn:x.turn,earlierTurns:x.knownPriorTurns.length,
   targetCount:x.current.heads[x.turn].length})),headSha:sha(read(HEADS))}));
}
function pre(){
 for(const p of [HEADS,FIXTURE,OUT+'POST_13OCT.json'])
  assert.ok(!existsSync(p),'Archivo futuro visible en fase PRE '+p);
 const source=j(PRE_INPUT);
 assert.equal(source.rows.length,5);
 const matSeal=j(PRIOR+'SELLO.json');
 assert.equal(matSeal.matutina,EXPECT_MAT);
 assert.equal(sha(read(PRIOR+'MATUTINA_PRE_SELLADA.json')),EXPECT_MAT);
 const mat=j(PRIOR+'MATUTINA_PRE_SELLADA.json');
 const rows=source.rows.map(r=>{
  assert.equal(r.date,DATE);
  const ti=TURNOS.indexOf(r.turn);assert.ok(ti>=0);
  assert.equal(r.current.heads[r.turn].length,0);
  assert.ok(r.history.every(h=>h.date<r.date));
  assert.ok(r.current.columns.slice(ti+1).every(col=>col.values.every(v=>v==='--')));
  const view=buildMotorLalo(r.current,r.date,r.turn,r.history);
  const decision=choose(view,r.date,r.turn);
  const top=view.ranks.vt3.map(x=>({family:x.family,rank:x.rank,roots:x.directRoots,
   d1:x.d1Roots,d7:x.d7Roots,physicalBlocks:x.physicalBlocks,
   branchBlocks:x.branchBlocks,sources:x.sourceCount,paths:x.paths.length}));
  const vt4=view.ranks.vt4.slice(0,10).map(x=>({family:x.family,rank:x.rank,
   parents:x.parentFamilies,values:unique(x.paths.map(p=>p.value))}));
  const result={date:r.date,turn:r.turn,previousDates:r.history.map(x=>x.date),
   rootCount:view.roots.length,sourceColumns:r.current.columns.slice(0,ti+1)
    .map(col=>({source:col.id,values:col.values})),
   ranks:top,rankedVt4:vt4,decision};
  if(r.turn==='Matutino'){
   assert.deepEqual(top.map(x=>x.family),mat.ranking.map(x=>x.family),
    'Cambió orden de PRE previamente sellado antes de la Matutina');
   assert.deepEqual(result.sourceColumns,mat.sourceColumns);
   for(let k=0;k<top.length;k++){
    const a=top[k],b=mat.ranking[k];
    assert.deepEqual([a.rank,a.d1,a.d7,a.branchBlocks,a.physicalBlocks,a.sources,a.paths],
     [b.rank,b.d1,b.d7,b.branchBlocks,b.physicalBlocks,b.sources,b.paths],
     'Cambió evidencia previa a sorteo Matutino en rango '+(k+1));
   }
  }
  return result;
 });
 save('PRE_13OCT.json',{date:DATE,
  status:'RETROSPECTIVA_EXCEPTO_BASE_MATUTINO_SELLADA_ANTES_DEL_SORTEO',
  ruleChallengerDefinedAfterDraw:true,matutinoPriorSeal:EXPECT_MAT,
  rows});
 const seal={date:DATE,source:sha(read(PRE_INPUT)),matutina:EXPECT_MAT,
  protocol:sha(read(PROTOCOL)),rule:sha(read(RULE)),script:sha(read(SCRIPT)),
  code:sha(read('src/motorLalo.ts')),audit:sha(read('src/vt3Audit.ts')),
  pre:sha(read(OUT+'PRE_13OCT.json'))};
 save('SELLO.json',seal);
 console.log('13OCT_PRE_OK',JSON.stringify({verifiedMatOriginalSeal:true,
  matutinaOldSeal:EXPECT_MAT,byTurn:rows.map(x=>({turn:x.turn,
   top3:x.decision.official.slice(0,3),d1Third:x.decision.selected,
   physicalSources:x.sourceColumns.map(c=>c.source)})),seal},null,2));
}
function post(){
 const seal=j(OUT+'SELLO.json');
 for(const [p,exp] of [[PRE_INPUT,seal.source],[PROTOCOL,seal.protocol],[RULE,seal.rule],
  [SCRIPT,seal.script],['src/motorLalo.ts',seal.code],
  ['src/vt3Audit.ts',seal.audit],[OUT+'PRE_13OCT.json',seal.pre]])
  assert.equal(sha(read(p)),exp,'Sellos cambiados '+p);
 assert.equal(sha(read(PRIOR+'MATUTINA_PRE_SELLADA.json')),seal.matutina);
 const pre=j(OUT+'PRE_13OCT.json').rows,inputs=j(PRE_INPUT).rows,actual=j(HEADS);
 assert.equal(sha(read(HEADS)),j(PRE_INPUT).inputTargetsSha256);
 const cases=pre.map((r,i)=>{
  const inp=inputs[i],heads=actual.turns[r.turn],ti=TURNOS.indexOf(r.turn);
  assert.equal(turnKey(r),turnKey(inp));assert.equal(heads.length,5);
  const view=buildMotorLalo(inp.current,inp.date,inp.turn,inp.history);
  assert.deepEqual(view.ranks.vt3.map(x=>x.family),r.ranks.map(x=>x.family));
  const check=choose(view,r.date,r.turn);
  assert.deepEqual(check,r.decision);
  const entries=heads.map((head,j)=>{
   const d=auditVt3Family(inp.current,view,r.turn,head);
   assert.ok(d);
   const matches4=view.ranks.vt4.filter(x=>x.paths.some(p=>p.value===head));
   return {jurisdiction:JUR[j],head,vt3:head.slice(-3),family:d.family,
    physicalRoutes:d.physicalRoutes,admittedRoutes:d.admittedRoutes,
    physicalSources:d.physicalSources,status:d.status,originalRank:d.officialRank,
    d1:d.d1Events,d7:d.d7Events,branchBlocks:d.branchBlocks,
    top3Official:d.top3,top5Official:d.officialRank!==null&&d.officialRank<=5,
    top10Official:d.top10,
    rankD1:r.decision.d1.indexOf(d.family)+1||null,
    rankHash:r.decision.hash.indexOf(d.family)+1||null,
    vt4InTop10:matches4.some(x=>x.rank<=10),
    vt4OwnPhysicalWitness:matches4.length>0,
    vt4Rank:matches4.length?Math.min(...matches4.map(x=>x.rank)):null,
    paths:d.routes.map(p=>({source:p.source,value:p.value,cells:p.cells,admitted:p.admitted}))};
  });
  const makes=(names)=>entries.some(e=>names.includes(e.family));
  return {date:r.date,turn:r.turn,sourceColumns:r.sourceColumns,
   heads:entries,official:{top3:r.decision.official.slice(0,3),
    top5:r.decision.official.slice(0,5),top10:r.decision.official,
    hits3:makes(r.decision.official.slice(0,3)),
    hits5:makes(r.decision.official.slice(0,5)),hits10:makes(r.decision.official)},
   challenger:{top3:r.decision.d1.slice(0,3),
    top5:r.decision.d1.slice(0,5),top10:r.decision.d1,
    third:r.decision.selected,hits3:makes(r.decision.d1.slice(0,3)),
    hits5:makes(r.decision.d1.slice(0,5)),hits10:makes(r.decision.d1)},
   hashNeutral:{top3:r.decision.hash.slice(0,3),
    hits3:makes(r.decision.hash.slice(0,3)),selected:r.decision.neutral},
   vt4ExactHeadsTop10:entries.filter(x=>x.vt4InTop10).map(x=>x.head),
   validity:r.turn==='Matutino'?'TOP_OFICIAL_PRE_EXISTENTE_SELLADO':'RECONSTRUIDO_TRAS_PUBLICACION'};
 });
 const totals={turns:5,heads:25};
 for(const name of ['official','challenger','hashNeutral']){
  totals[name]={
   top3:cases.filter(x=>x[name].hits3).length,
   hitTurns:cases.filter(x=>x[name].hits3).map(x=>x.turn)
  };
  if(name!=='hashNeutral'){
   totals[name].top5=cases.filter(x=>x[name].hits5).length;
   totals[name].top10=cases.filter(x=>x[name].hits10).length;
  }
 }
 totals.physicalHeadCount=cases.flatMap(x=>x.heads).filter(x=>x.physicalRoutes>0).length;
 totals.admittedHeadCount=cases.flatMap(x=>x.heads).filter(x=>x.originalRank!==null).length;
 totals.exactVt4Top10HeadCount=cases.reduce((s,x)=>s+x.vt4ExactHeadsTop10.length,0);
 save('POST_13OCT.json',{cases});
 save('RESUMEN.json',{totals,
  noFutureLeak:pre.every(r=>inputs.find(x=>turnKey(x)===turnKey(r))?.current.heads[r.turn].length===0),
  previouslySealedMatutinoOfficial:true,
  disclaimer:'Sólo el Top oficial Matutino existía sellado antes del sorteo, challenger D−1 definida después. Todos los cinco challengers y cuatro bases adicionales son retrospectivos.',sources:actual.sources,
  matrices:cases.map(x=>({turn:x.turn,
   officialTop3:x.official.top3,d1Third:x.challenger.third,challengerTop3:x.challenger.top3,
   outcomes:x.heads.map(e=>({head:e.head,family:e.family,rank:e.originalRank,
    phys:e.physicalRoutes,selectedD1Rank:e.rankD1})),
   official:{t3:x.official.hits3,t5:x.official.hits5,t10:x.official.hits10},
   challenger:{t3:x.challenger.hits3,t5:x.challenger.hits5,t10:x.challenger.hits10}}))});
 const text='# Cotejo VT3 y Nocturna completa del 13/10/2026\n\n'+
 'Comparación histórica del motor oficial y challenger de tercera plaza D−1. Sólo **el Top oficial Matutino** existía sellado previamente; la challenger y los otros cuatro turnos se cotejan retrospectivamente.\n\n'+
 '| Turno | Cabezas (Ciudad/Provincia/Córdoba/Santa Fe/Entre Ríos) | VT3 Top3 oficial | Tercera challenger D−1 | Acierto oficial Top3 / Top10 | Challenger Top3 / Top10 |\n'+
 '|---|---|---|---|---|---|\n'+cases.map(c=>'| '+c.turn+
 ' | '+c.heads.map(x=>x.head).join(' · ')+
 ' | '+c.official.top3.join(', ')+
 ' | '+c.challenger.third.family+
 ' | '+Number(c.official.hits3)+' / '+Number(c.official.hits10)+
 ' | '+Number(c.challenger.hits3)+' / '+Number(c.challenger.hits10)+' |').join('\n')+'\n\n'+
 'Totales: '+JSON.stringify(totals)+
 '\n\nLas tres cifras se comparan como familia reversible VT3; las cuaternas exactas se cuentan separadamente por camino físico propio VT4. No se presta una cifra nueva ni se invierte la cuaterna.\n';
 writeFileSync(OUT+'LECTURA.md',text);
 console.log('13OCT_POST_OK',JSON.stringify({totals,summary:cases.map(c=>({turn:c.turn,
  winnerFamilies:c.heads.map(x=>({head:x.head,family:x.family,officialRank:x.originalRank,
   physical:x.physicalRoutes,rankD1:x.rankD1,vt4Rank:x.vt4Rank})),
  official:c.official,challenger:c.challenger,neutral:c.hashNeutral}))},null,2));
}
const command=process.argv[2];
if(command==='prepare')prepare();else if(command==='pre')pre();else if(command==='post')post();
else throw Error('Usar prepare | pre | post');
