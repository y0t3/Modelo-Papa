import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const BASE='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const DEST='auditorias/vt3-top3-transferencia-d7-115-13oct2026/';
const PROTO='PROTOCOLO_VT3_TOP3_TRANSFERENCIA_D7_13OCT2026.md';
const BASESHA='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const SOURCE=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const TURN=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const MODELS=['OFICIAL','ABS_ANCLADA','ABS_FISICA','FORMA_FUENTE_ANCLADA','FORMA_FUENTE_FISICA',
 'FORMA_LIBRE_ANCLADA','FORMA_LIBRE_FISICA','NEGATIVO_ABS'];
const read=f=>readFileSync(f,'utf8'),load=f=>JSON.parse(read(f));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(f,x)=>writeFileSync(DEST+f,JSON.stringify(x,null,2)+'\n');
const id=r=>r.date+'|'+r.turn;
const family=h=>{assert.match(h,/^\d{4}$/);const t=h.slice(-3);return [t,[...t].reverse().join('')].sort().join('/')};
const uniq=a=>[...new Set(a)];
const monday=d=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()-((t.getUTCDay()+6)%7));return t.toISOString().slice(0,10)};
const coord=t=>{const x=t.split(':').map(Number);assert.ok(x.length===2&&x[0]>=0&&x[0]<6&&x[1]>=0&&x[1]<2);return x;};
function shape(cells){
 const xy=cells.map(coord),minR=Math.min(...xy.map(x=>x[0])),minC=Math.min(...xy.map(x=>x[1]));
 const nodes=xy.map(([r,c])=>(r-minR)+':'+(c-minC));
 return [nodes.join('>'),nodes.slice().reverse().join('>')].sort()[0];
}
function orient(cells){return [cells.join('>'),cells.slice().reverse().join('>')].sort()[0]}
function geometry(path){
 assert.ok(SOURCE.includes(path.source));
 assert.equal(path.cells.length,3);
 assert.equal(new Set(path.cells).size,3);
 for(let i=1;i<3;i++){
  const a=coord(path.cells[i-1]),b=coord(path.cells[i]);
  assert.equal(Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1])),1);
 }
 return {ABS:path.source+'|'+orient(path.cells),
  FORMA_FUENTE:path.source+'|'+shape(path.cells),FORMA_LIBRE:shape(path.cells)};
}
mkdirSync(DEST,{recursive:true});
function pre(){
 assert.equal(sha(read(BASE+'PRE_115.json')),BASESHA);
 assert.ok(!existsSync(BASE+'POST_115.json'));
 assert.ok(!existsSync(BASE+'NOCTURNA_POST_DIAGNOSTICO.json'));
 const original=load(BASE+'PRE_115.json').rows;
 assert.equal(original.length,115);
 const rows=original.map(r=>{
  const anchored=new Map(r.strategies.A_ORIGINAL.map(c=>[c.family,c.rank]));
  const physical=new Set(r.strategies.B_INVENTARIO.map(x=>x.family));
  const witnesses=new Map(r.witnesses.map(x=>[x.family,x.paths]));
  assert.equal(witnesses.size,physical.size);
  const candidates=[...physical].map(f=>{
   const paths=witnesses.get(f);assert.ok(paths?.length);
   const tokens=paths.map(geometry);
   const absolute=uniq(tokens.map(x=>x.ABS));
   return {family:f,rooted:anchored.has(f),rank:anchored.get(f)??null,
    pathCount:paths.length,tokens:{ABS:absolute,
    FORMA_FUENTE:uniq(tokens.map(x=>x.FORMA_FUENTE)),
    FORMA_LIBRE:uniq(tokens.map(x=>x.FORMA_LIBRE))}};
  });
  const top10=r.strategies.A_ORIGINAL.slice(0,10).map(x=>x.family);
  assert.ok(top10.every(f=>physical.has(f)));
  return {date:r.date,turn:r.turn,week:monday(r.date),top10,candidates};
 });
 const by=new Map(rows.map((r,i)=>[id(r),i]));
 assert.equal(by.size,115);
 const evaluated=[],missing=[];
 for(let i=0;i<115;i++){
  const d=new Date(rows[i].date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-7);
  const before=d.toISOString().slice(0,10),prior=by.get(before+'|'+rows[i].turn);
  if(prior===undefined){missing.push({date:rows[i].date,turn:rows[i].turn});continue}
  assert.ok(prior<i);
  evaluated.push({index:i,referenceIndex:prior,referenceDate:before,date:rows[i].date,turn:rows[i].turn});
 }
 assert.ok(evaluated.length>60);
 save('PRE_115.json',{rows,evaluated,missing,methods:MODELS});
 const seal={input:BASESHA,protocol:sha(read(PROTO)),
  code:sha(read('scripts/lab-vt3-top3-transferencia-d7.mjs')),
  pre:sha(read(DEST+'PRE_115.json'))};
 save('SELLO.json',seal);
 console.log('VT3_TOP3_D7_PRE_OK',JSON.stringify({cuts:rows.length,
  evaluated:evaluated.length,missing:missing.length,first:evaluated.slice(0,2),seal}));
}
function post(){
 const s=load(DEST+'SELLO.json');
 assert.equal(s.input,sha(read(BASE+'PRE_115.json')));
 assert.equal(s.protocol,sha(read(PROTO)));
 assert.equal(s.code,sha(read('scripts/lab-vt3-top3-transferencia-d7.mjs')));
 assert.equal(s.pre,sha(read(DEST+'PRE_115.json')));
 const prepared=load(DEST+'PRE_115.json'),basePost=load(BASE+'POST_115.json').rows;
 const rows=prepared.rows;
 const outcomes=basePost.map((r,i)=>{
  assert.equal(id(rows[i]),id(r));
  return new Set(r.targets.map(family));
 });
 const cases=[];
 for(const p of prepared.evaluated){
  const past=rows[p.referenceIndex],current=rows[p.index];
  const priorOutcome=outcomes[p.referenceIndex]; // Only prior D-7 results
  const positive=past.candidates.filter(q=>priorOutcome.has(q.family));
  const teacherOrder=(a,b)=>Number(b.rooted)-Number(a.rooted)||
    (a.rank??9999)-(b.rank??9999)||a.family.localeCompare(b.family);
  const teacher=positive.sort(teacherOrder).slice(0,3);
  // Fully supervised teaching of known D-7 heads, not guessing past.
  assert.equal(teacher.length>0,positive.length>0);
  const negative=past.candidates.filter(q=>!priorOutcome.has(q.family))
   .sort((a,b)=>sha('20261013|'+past.date+'|'+past.turn+'|'+a.family+'|neg')
    .localeCompare(sha('20261013|'+past.date+'|'+past.turn+'|'+b.family+'|neg')))
   .slice(0,teacher.length);
  const template=(families,k)=>new Set(families.flatMap(x=>x.tokens[k]));
  const learned={ABS:template(teacher,'ABS'),FORMA_FUENTE:template(teacher,'FORMA_FUENTE'),FORMA_LIBRE:template(teacher,'FORMA_LIBRE')};
  const negativeAbs=template(negative,'ABS');
  function select(k,bag,ref){
   const pool=bag==='ANCLADA'?current.candidates.filter(x=>x.rooted):current.candidates;
   const candidates=pool.map(q=>({
    family:q.family,rooted:q.rooted,rank:q.rank,
    matches:q.tokens[k].filter(t=>ref.has(t)).length
   })).sort((a,b)=>b.matches-a.matches||Number(b.rooted)-Number(a.rooted)||
     (a.rank??9999)-(b.rank??9999)||a.family.localeCompare(b.family));
   return candidates.slice(0,3);
  }
  const top3={
   OFICIAL:current.top10.slice(0,3),
   ABS_ANCLADA:select('ABS','ANCLADA',learned.ABS).map(x=>x.family),
   ABS_FISICA:select('ABS','FISICA',learned.ABS).map(x=>x.family),
   FORMA_FUENTE_ANCLADA:select('FORMA_FUENTE','ANCLADA',learned.FORMA_FUENTE).map(x=>x.family),
   FORMA_FUENTE_FISICA:select('FORMA_FUENTE','FISICA',learned.FORMA_FUENTE).map(x=>x.family),
   FORMA_LIBRE_ANCLADA:select('FORMA_LIBRE','ANCLADA',learned.FORMA_LIBRE).map(x=>x.family),
   FORMA_LIBRE_FISICA:select('FORMA_LIBRE','FISICA',learned.FORMA_LIBRE).map(x=>x.family),
   NEGATIVO_ABS:select('ABS','FISICA',negativeAbs).map(x=>x.family)
  };
  const ranked=Object.fromEntries(MODELS.map(k=>{
   const chosen=top3[k],all=[...chosen];
   assert.equal(chosen.length,3);assert.equal(new Set(chosen).size,3);
   for(const family of current.top10){if(all.length>=10)break;if(!all.includes(family))all.push(family)}
   assert.equal(all.length,10);assert.equal(new Set(all).size,10);
   return [k,{top3:chosen,top10:all}];
  }));
  // No target result for the current date is accessed above this line.
  const objective=outcomes[p.index],witness=new Set(current.candidates.map(x=>x.family));
  const ceiling=[...objective].filter(x=>witness.has(x));
  const result=Object.fromEntries(MODELS.map(k=>{
   const m=ranked[k];
   return [k,{...m,hitTop3:m.top3.some(x=>objective.has(x)),
    hitTop10:m.top10.some(x=>objective.has(x)),winnersTop3:m.top3.filter(x=>objective.has(x))}];
  }));
  const exactMatched=current.candidates.filter(q=>q.tokens.ABS.some(t=>learned.ABS.has(t)));
  const shapedMatched=current.candidates.filter(q=>q.tokens.FORMA_FUENTE.some(t=>learned.FORMA_FUENTE.has(t)));
  cases.push({...p,week:current.week,
   trainedPositiveFamilies:teacher.map(x=>x.family),
   physicallyPossiblePriorWinners:positive.length,
   trainedNegativeControl:negative.map(x=>x.family),
   copiedTemplates:Object.fromEntries(Object.entries(learned).map(([k,v])=>[k,v.size])),
   exactMatchingFamilies:exactMatched.length,
   exactMatchingRooted:exactMatched.filter(x=>x.rooted).length,
   shapedMatchingFamilies:shapedMatched.length,
   physicalCeilingWinnerFamilies:ceiling,physicalCeilingCut:ceiling.length>0,
   currentResults:basePost[p.index].targets,
   methods:result});
 }
 function measure(rs,k){
  return {cuts:rs.length,top3:rs.filter(x=>x.methods[k].hitTop3).length,
   top10:rs.filter(x=>x.methods[k].hitTop10).length,
   gainsTop3:rs.filter(x=>x.methods[k].hitTop3&&!x.methods.OFICIAL.hitTop3).map(id),
   lossesTop3:rs.filter(x=>!x.methods[k].hitTop3&&x.methods.OFICIAL.hitTop3).map(id),
   gainsTop10:rs.filter(x=>x.methods[k].hitTop10&&!x.methods.OFICIAL.hitTop10).map(id),
   lossesTop10:rs.filter(x=>!x.methods[k].hitTop10&&x.methods.OFICIAL.hitTop10).map(id)};
 }
 const summary=rs=>Object.fromEntries(MODELS.map(k=>[k,measure(rs,k)]));
 const total=summary(cases);
 const weeks=uniq(cases.map(x=>x.week)).sort();
 const byWeek=Object.fromEntries(weeks.map(w=>[w,summary(cases.filter(x=>x.week===w))]));
 const byTurn=Object.fromEntries(TURN.map(t=>[t,summary(cases.filter(x=>x.turn===t))]));
 const sStats={
  evaluated:cases.length,skippedWithoutD7:prepared.missing.length,
  days:uniq(cases.map(x=>x.date)).length,
  priorPhysicalWinnerExposures:cases.reduce((n,c)=>n+c.physicallyPossiblePriorWinners,0),
  teacherPositiveFamilyExposures:cases.reduce((n,c)=>n+c.trainedPositiveFamilies.length,0),
  currentPhysicallyReachableCuts:cases.filter(x=>x.physicalCeilingCut).length,
  currentPhysicallyReachableFamilies:cases.reduce((n,c)=>n+c.physicalCeilingWinnerFamilies.length,0),
  exactMatchedCuts:cases.filter(x=>x.exactMatchingFamilies>0).length,
  averageMatchingFamilies:cases.reduce((n,c)=>n+c.exactMatchingFamilies,0)/cases.length,
  shapeMatchedCuts:cases.filter(x=>x.shapedMatchingFamilies>0).length,
  averageShapeMatchingFamilies:cases.reduce((n,c)=>n+c.shapedMatchingFamilies,0)/cases.length};
 save('POST_115.json',{rows:cases});
 save('RESUMEN.json',{date:'2026-10-13',total,byWeek,byTurn,stats:sStats,
  missing:prepared.missing,seal:s,postSHA:sha(read(BASE+'POST_115.json')),
  warning:'Solo D-7 se usó para entrenar; evaluación retrospectiva con datos ya examinados en múltiples hipótesis, no prueba de predictibilidad del azar.'});
 console.log('VT3_TOP3_D7_POST_OK',JSON.stringify({
  stats:sStats,
  top:Object.fromEntries(MODELS.map(k=>[k,{top3:total[k].top3,top10:total[k].top10,
   gained:total[k].gainsTop3,lost:total[k].lossesTop3}])),
  byWeek:Object.fromEntries(Object.entries(byWeek).map(([w,details])=>[w,Object.fromEntries(MODELS.map(k=>[k,details[k].top3]))]))
 },null,2));
}
if(process.argv[2]==='pre')pre();
else if(process.argv[2]==='post')post();
else throw Error('Use pre|post');
