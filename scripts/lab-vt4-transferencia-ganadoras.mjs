import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const DIR='auditorias/vt4-transferencia-rutas-ganadoras-115-13oct2026/';
const IN='auditorias/vt4-diversidad-madres-top10-115-13oct2026/INPUT_PRE_115.json';
const POST='auditorias/vt4-diversidad-madres-top10-115-13oct2026/OBJETIVOS_POST_115.json';
const FUTURE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const PREV='auditorias/vt4-hermanas-geometricas-115-13oct2026/PRE_115.json';
const BENCH='auditorias/vt4-diversidad-madres-top10-115-13oct2026/PRE_115.json';
const PROTO='PROTOCOLO_VT4_TRANSFERENCIA_RUTAS_D7_D1_13OCT2026.md';
const METHODS=['BASE_CUPO2','D7_EXACTO','D7_TRASLADO','D7_MISMO_TURNO','D1_EXACTO','D1_TRASLADO','D7_D1_COMBINADO','OTRA_FUENTE_CONTROL','CONTROL_HASH'];
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=x=>createHash('sha256').update(x).digest('hex');
const save=(f,x)=>writeFileSync(DIR+f,JSON.stringify(x,null,2)+'\n');
const key=x=>x.date+'|'+x.turn;
const uniq=x=>[...new Set(x)];
const mean=arr=>arr.reduce((s,x)=>s+x,0)/(arr.length||1);
const pcoords=p=>p.map(c=>typeof c==='string'?c:c.row+':'+c.col);
const coordsId=p=>pcoords(p).join('>');
const reverseId=p=>[coordsId(p),coordsId([...p].reverse())].sort()[0];
const shape=p=>{
 const coords=pcoords(p).map(s=>s.split(':').map(Number));
 const r0=Math.min(...coords.map(x=>x[0])),c0=Math.min(...coords.map(x=>x[1]));
 const vec=coords.map(x=>(x[0]-r0)+':'+(x[1]-c0));
 return [vec.join('>'),vec.slice().reverse().join('>')].sort()[0];
};
const digits=p=>p.map(c=>c.digit).join('');
const is4=s=>/^\d{4}$/.test(s);
mkdirSync(DIR,{recursive:true});

function markedRoutes(input){
 const marks=[],seen=new Set();
 for(const h of input.history){
  assert.ok(h.date<input.date);
  for(const [turn,matches] of Object.entries(h.sheet.matches)){
   for(const m of matches){
    // For comparable provenance to the original Lalo engine, the history
    // is taken from five Argentinian draws, no borrowed Montevideo roots.
    if(m.jurisdiccion==='Montevideo')continue;
    assert.ok(is4(m.cabeza));
    const event=[h.date,h.period,turn,m.jurisdiccion,m.cabeza].join('|');
    for(const hit of m.hits.filter(x=>x.kind==='vt4')){
     assert.equal(hit.value,m.cabeza);
     const available=h.sheet.columns.slice(0,['Previa','Primera','Matutino','Vespertino','Nocturno'].indexOf(turn)+1);
     const col=available.find(x=>x.id===hit.sourceId);
     assert.ok(col,'Historical mark references an invisible source');
     for(const p of hit.paths){
      assert.equal(p.length,4);
      assert.equal(digits(p),m.cabeza);
      assert.equal(uniq(pcoords(p)).length,4);
      for(let k=1;k<4;k++)
       assert.equal(Math.max(Math.abs(p[k].row-p[k-1].row),
        Math.abs(p[k].col-p[k-1].col)),1);
      for(const c of p)assert.equal(col.values[c.row][c.col],c.digit);
      const id=event+'|'+hit.sourceId+'|'+reverseId(p);
      if(seen.has(id))continue;
      seen.add(id);
      marks.push({event,period:h.period,date:h.date,oldTurn:turn,
       source:hit.sourceId,path:reverseId(p),shape:shape(p),head:m.cabeza});
     }
    }
   }
  }
 }
 return marks;
}
function vfyWitness(w,src){
 const col=src.find(x=>x.id===w.source);
 assert.ok(col,'Candidate route references source unavailable in PRE '+w.source);
 const cells=w.cells.map(s=>s.split(':').map(Number));
 assert.equal(cells.length,4);
 assert.equal(uniq(w.cells).length,4);
 for(let k=0;k<4;k++){
  const [row,colidx]=cells[k];assert.equal(col.values[row][colidx],w.read[k]);
  if(k)assert.equal(Math.max(Math.abs(row-cells[k-1][0]),Math.abs(colidx-cells[k-1][1])),1);
 }
 return {shape:shape(w.cells),exact:reverseId(w.cells)};
}
function signals(g,marks,available){
 const eventSets=Object.fromEntries(
  ['d7exact','d7shape','d7turn','d1exact','d1shape','otherSource'].map(z=>[z,new Set()])
 );
 for(const w of g.witnesses){
  const geom=vfyWitness(w,available);
  assert.equal(geom.shape,w.shape,'Path shape normalization disagrees with saved evidence');
  for(const h of marks){
   if(geom.shape!==h.shape)continue;
   if(w.source!==h.source){eventSets.otherSource.add(h.event);continue;}
   if(h.period==='D−7'){
    eventSets.d7shape.add(h.event);
    if(geom.exact===h.path)eventSets.d7exact.add(h.event);
    if(h.oldTurn===available.targetTurn)eventSets.d7turn.add(h.event);
   }else if(h.period==='D−1'){
    eventSets.d1shape.add(h.event);
    if(geom.exact===h.path)eventSets.d1exact.add(h.event);
   }
  }
 }
 return Object.fromEntries(Object.entries(eventSets).map(([k,s])=>[k,s.size]));
}
function score(g,method){
 const x=g.signal;
 if(method==='D7_EXACTO')return [x.d7exact,x.d7shape];
 if(method==='D7_TRASLADO')return [x.d7shape,x.d7exact];
 if(method==='D7_MISMO_TURNO')return [x.d7turn,x.d7exact,x.d7shape];
 if(method==='D1_EXACTO')return [x.d1exact,x.d1shape];
 if(method==='D1_TRASLADO')return [x.d1shape,x.d1exact];
 if(method==='D7_D1_COMBINADO')return [x.d7exact,x.d1exact,x.d7shape,x.d1shape];
 if(method==='OTRA_FUENTE_CONTROL')return [x.otherSource];
 return [0];
}
function rankWithin(all,method,seed){
 if(method==='BASE_CUPO2')return all.slice().sort((a,b)=>a.rank-b.rank);
 if(method==='CONTROL_HASH')return all.slice().sort((a,b)=>sha(seed+'|'+a.family+'|'+a.rank).localeCompare(
  sha(seed+'|'+b.family+'|'+b.rank))||a.rank-b.rank);
 return all.slice().sort((a,b)=>{
  const s=score(a,method),t=score(b,method);
  for(let i=0;i<s.length;i++)if(s[i]!==t[i])return t[i]-s[i];
  return a.rank-b.rank;
 });
}
function select(groups,method,seed){
 const selected=[],used=new Set(),signalCount={};
 for(let parent=1;parent<=5;parent++){
  const options=rankWithin(groups.filter(g=>g.motherRank===parent),method,seed);
  assert.ok(options.length>=2);
  let n=0;
  for(const g of options){
   if(n>=2)break;
   if(g.values.some(v=>used.has(v)))continue;
   selected.push(g);
   for(const v of g.values)used.add(v);
   n++;
  }
  assert.equal(n,2,'Cannot satisfy two daughters per mother');
 }
 assert.equal(selected.length,10);
 return selected;
}
const compactOption=(groups,method,seed)=>select(groups,method,seed).map((g,i)=>({
 rank:i+1,family:g.family,oldRank:g.rank,mother:g.mother,
 values:g.values,physicalPaths:g.paths,signal:g.signal
}));
function pre(){
 assert.ok(!existsSync(POST),'Future results visible in PRE');
 assert.ok(!existsSync(FUTURE),'Complete fixture visible in PRE');
 const inputs=json(IN).rows,groupsPrev=json(PREV).rows,bench=json(BENCH).rows;
 assert.equal(inputs.length,115);assert.equal(groupsPrev.length,115);assert.equal(bench.length,115);
 const rows=[],inventory=[];
 for(let i=0;i<115;i++){
  const input=inputs[i],snapshot=groupsPrev[i],reference=bench[i];
  assert.equal(key(input),key(snapshot));assert.equal(key(input),key(reference));
  assert.ok(input.history.every(h=>h.date<input.date));
  assert.equal(input.current.heads[input.turn].length,0);
  const available=input.current.columns.slice(0,['Previa','Primera','Matutino','Vespertino','Nocturno'].indexOf(input.turn)+1);
  available.targetTurn=input.turn;
  const marks=markedRoutes(input);
  const groups=snapshot.physicalGroups.filter(g=>g.motherRank<=5).map(g=>({
   rank:g.rank,family:g.family,values:g.values,mother:g.mother,motherRank:g.motherRank,
   paths:g.paths,witnesses:g.witnesses,signal:signals(g,marks,available)
  }));
  const methods=Object.fromEntries(METHODS.map(m=>[m,compactOption(groups,m,key(input))]));
  assert.deepEqual(methods.BASE_CUPO2.map(g=>g.family),
   reference.options.CUPO_2.ranked.map(g=>g.family),'Baseline selection changed '+key(input));
  rows.push({date:input.date,turn:input.turn,cut:i,
   historicalVT4MarkedRoutes:marks.length,
   distinctHistoryEvents:uniq(marks.map(m=>m.event)).length,
   d7Marks:marks.filter(x=>x.period==='D−7').length,
   d1Marks:marks.filter(x=>x.period==='D−1').length,
   physicalSiblingsEligible:groups.length,
   groupsWithAnyD7:groups.filter(g=>g.signal.d7shape>0).length,
   groupsWithAnyD1:groups.filter(g=>g.signal.d1shape>0).length,
   groupsWithExactD7:groups.filter(g=>g.signal.d7exact>0).length,
   methods});
  inventory.push({
   date:input.date,turn:input.turn,
   historicalVT4MarkedRoutes:marks.length,
   marks:marks.map(m=>({date:m.date,period:m.period,oldTurn:m.oldTurn,source:m.source,
    path:m.path,shape:m.shape,event:m.event})),
   groups:groups.map(g=>({rank:g.rank,family:g.family,mother:g.mother,signal:g.signal,
    values:g.values,
    witnesses:g.witnesses.map(w=>({source:w.source,read:w.read,cells:w.cells,shape:w.shape}))}))
  });
  if(i%25===24)console.log('VT4_D7_PRE_CUT',i+1);
 }
 save('PRE_115.json',{date:'2026-10-13',cuts:rows.length,rows});
 save('INVENTARIO_RUTAS_PRE_115.json',{date:'2026-10-13',rows:inventory});
 save('SELLO.json',{date:'2026-10-13',code:sha(read('scripts/lab-vt4-transferencia-ganadoras.mjs')),
  protocol:sha(read(PROTO)),input:sha(read(IN)),previous:sha(read(PREV)),
  baseline:sha(read(BENCH)),pre:sha(read(DIR+'PRE_115.json')),
  inventory:sha(read(DIR+'INVENTARIO_RUTAS_PRE_115.json'))});
 console.log('VT4_D7_PRE_OK',JSON.stringify({cuts:115,
  historyMarks:rows.reduce((s,x)=>s+x.historicalVT4MarkedRoutes,0),
  cutsWithAnyHistoricalWinnerPath:rows.filter(x=>x.historicalVT4MarkedRoutes).length,
  cutsWithOneD7Match:rows.filter(x=>x.groupsWithAnyD7).length,
  cutsWithExactD7Match:rows.filter(x=>x.groupsWithExactD7).length,
  sel:json(DIR+'SELLO.json')}));
}
const evalCuts=(rows,method)=>{
 const results=rows.map(x=>x.results[method]);
 return {cuts:rows.length,top3:results.filter(r=>r.top3).length,
  top5:results.filter(r=>r.top5).length,top10:results.filter(r=>r.top10).length,
  gainsTop10:rows.filter(x=>x.results[method].top10&&!x.results.BASE_CUPO2.top10).map(key),
  lossesTop10:rows.filter(x=>!x.results[method].top10&&x.results.BASE_CUPO2.top10).map(key),
  changedTop10:rows.filter(x=>x.results[method].groups.join('|')!==x.results.BASE_CUPO2.groups.join('|')).length};
};
function post(){
 const seal=json(DIR+'SELLO.json');
 for(const [p,digest] of [['scripts/lab-vt4-transferencia-ganadoras.mjs',seal.code],
  [PROTO,seal.protocol],[IN,seal.input],[PREV,seal.previous],[BENCH,seal.baseline],
  [DIR+'PRE_115.json',seal.pre],[DIR+'INVENTARIO_RUTAS_PRE_115.json',seal.inventory]])
  assert.equal(sha(read(p)),digest,'PRE changed: '+p);
 const pre=json(DIR+'PRE_115.json').rows,goals=json(POST).rows,inventory=json(DIR+'INVENTARIO_RUTAS_PRE_115.json').rows;
 assert.equal(pre.length,115);assert.equal(goals.length,115);
 const cuts=pre.map((x,i)=>{
  const target=goals[i];assert.equal(key(x),key(target));
  assert.equal(target.heads.length,5);
  const results=Object.fromEntries(METHODS.map(m=>{
   const top=x.methods[m];
   const hit=n=>top.slice(0,n).some(g=>g.values.some(v=>target.heads.includes(v)));
   return [m,{top3:hit(3),top5:hit(5),top10:hit(10),groups:top.map(g=>g.family),
    matches:top.flatMap(g=>g.values.filter(v=>target.heads.includes(v)).map(head=>({
     head,family:g.family,rank:g.rank,mother:g.mother,signal:g.signal}))) }];
  }));
  return {date:x.date,turn:x.turn,targets:target.heads,
   historicalVT4MarkedRoutes:x.historicalVT4MarkedRoutes,
   groupsWithD7:x.groupsWithAnyD7,groupsWithD1:x.groupsWithAnyD1,
   results};
 });
 const aggregate=Object.fromEntries(METHODS.map(m=>[m,evalCuts(cuts,m)]));
 const potential=inventory.map((r,i)=>{
  const target=goals[i].heads;
  const hitGroups=r.groups.filter(g=>g.values.some(v=>target.includes(v)));
  return {date:r.date,turn:r.turn,
   winners:hitGroups.map(g=>({family:g.family,mother:g.mother,
    number:g.values.filter(v=>target.includes(v)),signal:g.signal,
    traces:g.witnesses})),
   selected:cuts[i].results.BASE_CUPO2.matches,
   actualHistoryMarks:r.historicalVT4MarkedRoutes};
 }).filter(r=>r.winners.length);
 const signalAvailability={
  meanMarkedRoutes:Number(mean(pre.map(x=>x.historicalVT4MarkedRoutes)).toFixed(3)),
  cutsWithD7SourceAndShape:pre.filter(x=>x.groupsWithAnyD7>0).length,
  cutsWithD1SourceAndShape:pre.filter(x=>x.groupsWithAnyD1>0).length,
  cutsWithD7Exact:pre.filter(x=>x.groupsWithExactD7>0).length,
  cutsNoHistoricalVt4Marks:pre.filter(x=>x.historicalVT4MarkedRoutes===0).length,
  winnersWithinMotherPool:potential.length
 };
 save('POST_115.json',{cuts});
 save('RESUMEN.json',{date:'2026-10-13',cuts:115,aggregate,signalAvailability,
  recoverableCases:potential,sel:seal,
  caveat:'Cotejo de muestras retrospectivas reutilizadas extensamente; no prueba ventaja predictiva. Selecciones PRE generadas sin objetivos del turno.'});
 console.log('VT4_D7_POST_OK',JSON.stringify({aggregate,signalAvailability,
  recoverable:potential.map(x=>({date:x.date,turn:x.turn,
   wins:x.winners.map(g=>({family:g.family,number:g.number,signal:g.signal})),
   originallySelected:x.selected}))},null,2));
}
if(process.argv[2]==='pre')pre();
else if(process.argv[2]==='post')post();
else throw Error('Use pre/post');
