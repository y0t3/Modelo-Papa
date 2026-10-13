import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const mode=process.argv[2];
const base='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const out='auditorias/vt3-espejos-controles-115-13oct2026/';
const protocol='PROTOCOLO_VT3_ESPEJOS_CONTROLES_13OCT2026.md';
const inputSha='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const read=p=>readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const store=(name,x)=>writeFileSync(out+name,JSON.stringify(x,null,2)+'\n');
const family=v=>[v,[...v].reverse().join('')].sort().join('/');
const ends=p=>[p.cells[0],p.cells[2]].sort().join('|');
const unique=a=>new Set(a).size;
mkdirSync(out,{recursive:true});

function classify(row){
 const original=new Map(row.strategies.A_ORIGINAL.map(f=>[f.family,f]));
 const full=new Map(row.strategies.B_INVENTARIO.map(f=>[f.family,f]));
 assert.equal(full.size,row.witnesses.length);
 const candidates=row.witnesses.map(w=>{
  const paths=w.paths,anchors=paths.filter(p=>p.anchored),extras=paths.filter(p=>!p.anchored);
  const originalRecord=original.get(w.family),fullRecord=full.get(w.family);
  assert.ok(fullRecord);
  assert.equal(Boolean(originalRecord),anchors.length>0,'Anclaje/familia incongruente '+w.family);
  assert.equal(fullRecord.paths,paths.length);
  const sources=unique(paths.map(p=>p.source));
  const blocks=unique(paths.map(p=>p.source+'|'+[...p.cells].sort().join(',')));
  const centers=extras.filter(x=>anchors.some(a=>a.source===x.source&&ends(a)===ends(x)&&a.cells[1]!==x.cells[1]));
  const anchorSources=new Set(anchors.map(p=>p.source));
  const second=extras.filter(x=>anchorSources.size&&!anchorSources.has(x.source));
  const parts=w.family.split('/');
  const bucket={sources:Math.min(sources,3),blocks:Math.min(blocks,4),palindrome:Number(parts[0]===parts[1])};
  return {
   family:w.family,originalRank:originalRecord?.rank??null,
   sources,blocks,totalPaths:paths.length,anchoredPaths:anchors.length,
   centerSwap:centers.length>0,secondSource:second.length>0,unanchored:anchors.length===0,
   bucket,
   // Prueba física consultable: ruta concreta; no se presta raíz al extra.
   exampleCenter:centers.slice(0,2).map(p=>({source:p.source,cells:p.cells,value:p.value})),
   exampleSecond:second.slice(0,2).map(p=>({source:p.source,cells:p.cells,value:p.value})),
   sampleAnchor:anchors.slice(0,2).map(p=>({source:p.source,cells:p.cells,value:p.value,rootIds:p.rootIds}))
  };
 });
 assert.equal(candidates.length,full.size);
 return {date:row.date,turn:row.turn,candidates};
}
function pre(){
 assert.equal(sha(read(base+'PRE_115.json')),inputSha,'PRE 115 modificado');
 assert.ok(!existsSync(base+'POST_115.json'),'POST histórico presente durante PRE');
 assert.ok(!existsSync(base+'NOCTURNA_POST_DIAGNOSTICO.json'),'POST nocturno presente durante PRE');
 const inputs=json(base+'PRE_115.json');
 assert.equal(inputs.rows.length,115);
 const rows=inputs.rows.map(classify);
 const noct=classify(json(base+'NOCTURNA_SIMULACION.json').row);
 const meta={rows:115,dates:23,sourceHash:inputSha,protocolHash:sha(read(protocol))};
 store('PRE_115.json',{meta,rows});
 store('NOCTURNA_PRE.json',{diagnostico:'Nocturna conocida; PRE original reproducido',row:noct});
 store('SELLO.json',{preHash:sha(read(out+'PRE_115.json')),nocturnaHash:sha(read(out+'NOCTURNA_PRE.json')),protocolHash:sha(read(protocol)),codeHash:sha(read('scripts/lab-vt3-espejos-controles.mjs'))});
 console.log('ESPEJOS_PRE_115_OK',read(out+'SELLO.json'));
}
const flags=[
 {name:'cambio_centro',field:'centerSwap',control:r=>[Number(!r.unanchored),r.bucket.sources,r.bucket.blocks,r.bucket.palindrome].join('/')},
 {name:'segunda_fuente_sin_raiz',field:'secondSource',control:r=>[Number(!r.unanchored),r.bucket.blocks,r.bucket.palindrome].join('/')},
 {name:'familia_sin_anclaje',field:'unanchored',control:r=>[r.bucket.sources,r.bucket.blocks,r.bucket.palindrome].join('/')}
];
function evaluate(rows,targets){
 assert.equal(rows.length,targets.length);
 const detailed=[];
 for(let i=0;i<rows.length;i++){
  const r=rows[i],t=targets[i];assert.equal(r.date,t.date);assert.equal(r.turn,t.turn);
  const win=new Set(t.targets.map(h=>{assert.match(h,/^\d{4}$/);return family(h.slice(-3))}));
  const annotated=r.candidates.map(c=>({...c,hit:win.has(c.family)}));
  detailed.push({date:r.date,turn:r.turn,targets:t.targets,
   pool:annotated.length,winning:annotated.filter(x=>x.hit).map(x=>x.family),
   originalTop10:annotated.filter(x=>x.hit&&x.originalRank!==null&&x.originalRank<=10).map(x=>x.family),
   rows:annotated});
 }return detailed;
}
function report(cuts){
 const exposure=cuts.flatMap(x=>x.rows);
 const flagsSummary={};
 for(const f of flags){
  const selected=exposure.filter(r=>r[f.field]);
  let matchedObserved=0,matchedExpected=0,matchedN=0,matchedSignalN=0,matchedGroups=0;
  // Unidad de control: familia×corte. No igualar grupos entre fechas.
  for(const c of cuts){
   const groups=new Map();
   for(const x of c.rows){const key=f.control(x);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(x)}
   for(const xs of groups.values()){
    const a=xs.filter(x=>x[f.field]),n=xs.length;
    if(!a.length||a.length===n)continue;
    const winners=xs.filter(x=>x.hit).length;
    matchedObserved+=a.filter(x=>x.hit).length;
    matchedExpected+=winners*a.length/n;
    matchedN+=n;matchedSignalN+=a.length;matchedGroups++;
   }
  }
  flagsSummary[f.name]={familyCutExposures:selected.length,
   winningExposures:selected.filter(x=>x.hit).length,
   originalTop10WinningExposures:selected.filter(x=>x.hit&&x.originalRank!==null&&x.originalRank<=10).length,
   comparableMatchedGroups:matchedGroups,
   comparableFamilyCutExposures:matchedN,
   comparableSignalExposures:matchedSignalN,
   comparableObserved:matchedObserved,
   comparableExpected:matchedExpected};
 }
 return {cuts:cuts.length,winningCuts:cuts.filter(x=>x.winning.length).length,winningExposures:exposure.filter(x=>x.hit).length,
  originalTop10Cuts:cuts.filter(x=>x.originalTop10.length).length,
  originalTop10WinningExposures:exposure.filter(x=>x.hit&&x.originalRank!==null&&x.originalRank<=10).length,
  flags:flagsSummary};
}
function post(){
 const seal=json(out+'SELLO.json');
 assert.equal(seal.preHash,sha(read(out+'PRE_115.json')));assert.equal(seal.nocturnaHash,sha(read(out+'NOCTURNA_PRE.json')));
 assert.equal(seal.codeHash,sha(read('scripts/lab-vt3-espejos-controles.mjs')));
 assert.equal(seal.protocolHash,sha(read(protocol)));
 const pre=json(out+'PRE_115.json'),post=json(base+'POST_115.json');
 const targets=post.rows.map(x=>({date:x.date,turn:x.turn,targets:x.targets}));
 const detail=evaluate(pre.rows,targets);
 const overall=report(detail);
 assert.deepEqual([overall.cuts,overall.winningCuts,overall.winningExposures,overall.originalTop10Cuts],[115,80,143,15],'Control 115/Top10 no reproduce');
 const byMonth=Object.fromEntries(['2026-09','2026-10'].map(m=>[m,report(detail.filter(x=>x.date.startsWith(m)))]));
 const noctPre=json(out+'NOCTURNA_PRE.json').row,noctPost=json(base+'NOCTURNA_POST_DIAGNOSTICO.json');
 const night=evaluate([noctPre],[{date:noctPost.date,turn:noctPost.turn,targets:noctPost.targets}])[0];
 const focus=['851','615','242','290','264'].map(value=>{
  const v=family(value),r=night.rows.find(x=>x.family===v);
  return {value,family:v,physicallyAvailable:Boolean(r),features:r||null};
 });
 store('POST_115.json',{method:'Contraste morfológico exploratorio, no validación predictiva',rows:detail.map(c=>({
  date:c.date,turn:c.turn,winning:c.winning,originalTop10:c.originalTop10,
  features:c.rows.filter(x=>x.hit).map(x=>({family:x.family,originalRank:x.originalRank,centerSwap:x.centerSwap,secondSource:x.secondSource,unanchored:x.unanchored,blocks:x.blocks,sources:x.sources}))
 }))});
 store('RESUMEN.json',{seal,overall,byMonth,limitation:'Mismo histórico ya investigado; controles emparejados descriptivos, muestras correlacionadas. No se extrapola a nuevos sorteos ni se asignan raíces a rutas no ancladas.'});
 store('NOCTURNA_POST_DIAGNOSTICO.json',{knownAfterDraw:true,date:night.date,turn:night.turn,focus});
 console.log('ESPEJOS_POST_115_OK',JSON.stringify({overall,byMonth,focus:focus.map(x=>({value:x.value,exists:x.physicallyAvailable,centerSwap:x.features?.centerSwap,secondSource:x.features?.secondSource,unanchored:x.features?.unanchored}))}));
}
if(mode==='pre')pre();else if(mode==='post')post();else throw Error('Uso: pre | post');
