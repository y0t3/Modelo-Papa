import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';

const DIR='auditorias/vt3-madres-vt4-cobertura-115-13oct2026/';
const INPUT='auditorias/vt4-diversidad-madres-top10-115-13oct2026/INPUT_PRE_115.json';
const PRIOR='auditorias/vt4-diversidad-madres-top10-115-13oct2026/PRE_115.json';
const ADMISSION_PRIOR='auditorias/vt4-admision-madres-115-13oct2026/PRE_115.json';
const POST='auditorias/vt4-diversidad-madres-top10-115-13oct2026/OBJETIVOS_POST_115.json';
const FIXTURE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const SOURCE='scripts/lab-vt4-admision-madres.mjs';
const PROTOCOL='PROTOCOLO_VT3_APERTURA_MADRES_VT4_COBERTURA_13OCT2026.md';
const LIMITS=[3,5,10,25,65534];
const METHODS=['TOP5_CUPO2','TOP10_CUPO1','MIX_8MAS2_6A10','MIX_8MAS2_11PLUS',
 'MIX_5MAS5_6PLUS','MIX_5MAS5_11PLUS','ESTRATOS_ANTERIOR'];
const sha=s=>createHash('sha256').update(s).digest('hex');
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const save=(name,obj)=>writeFileSync(DIR+name,JSON.stringify(obj,null,2)+'\n');
const uniq=xs=>[...new Set(xs)],key=x=>x.date+'|'+x.turn;
const mean=xs=>xs.length?xs.reduce((s,x)=>s+x,0)/xs.length:0;
const isHead=x=>/^\d{4}$/.test(x);
mkdirSync(DIR,{recursive:true});
const source=read(SOURCE),start=source.indexOf('function pre()');
assert.ok(start>2000,'Expected source library pre()');
const libFile=resolve('resultados/runtime-vt4-madres-cobertura/admissionLib.mjs');
mkdirSync(dirname(libFile),{recursive:true});
writeFileSync(libFile,source.slice(0,start)+'\nexport {available,choose,generatedAllPhysical};\n');
const {available,choose}=await import(pathToFileURL(libFile).href);
const {buildMotorLalo}=await import(pathToFileURL(resolve('resultados/runtime-vt4-admision/motorLalo.mjs')).href);

function rankTable(pools){
 const table=Buffer.alloc(30000);
 // first 20K: little-endian minimum rooted parent rank, 65535 = absent;
 // next 10K: any physically real path, irrespective of roots.
 for(let n=0;n<10000;n++)table.writeUInt16LE(65535,n*2);
 for(const g of pools.admitted){
  assert.ok(Number.isInteger(g.motherRank)&&g.motherRank>=1&&g.motherRank<65535);
  for(const value of g.values){
   assert.ok(isHead(value));
   const id=Number(value),old=table.readUInt16LE(2*id);
   if(g.motherRank<old)table.writeUInt16LE(g.motherRank,2*id);
   table[20000+id]=1;
  }
 }
 for(const g of pools.onlyPhysical){
  for(const value of g.values){assert.ok(isHead(value));table[20000+Number(value)]=1;}
 }
 let rootNum=0,allNum=0;
 for(let n=0;n<10000;n++){
  if(table.readUInt16LE(n*2)!==65535)rootNum++;
  if(table[20000+n])allNum++;
 }
 assert.ok(allNum>=rootNum&&rootNum>0);
 return {table,rootNum,allNum};
}
function noncollision(chosen,g){
 return !chosen.some(x=>x.id===g.id||x.values.some(y=>g.values.includes(y)));
}
function append(chosen,options,maxSlots=10,uniqMother=false){
 const mothers=new Set(chosen.map(g=>g.mother));
 for(const g of options){
  if(chosen.length>=maxSlots)break;
  if(uniqMother&&mothers.has(g.mother))continue;
  if(!noncollision(chosen,g))continue;
  chosen.push(g);mothers.add(g.mother);
 }
 return chosen;
}
function ensureTen(chosen,pools){
 const missing=10-chosen.length;
 if(missing>0)append(chosen,pools.admitted);
 assert.equal(chosen.length,10);
 return {chosen,backfill:missing};
}
function onePerMother(pools,lower,upper,limit){
 const chosen=[];
 const seen=new Set();
 for(const rank of Array.from({length:Math.max(0,upper-lower+1)},(_,i)=>lower+i)){
  const g=pools.admitted.find(x=>x.motherRank===rank&&!seen.has(x.mother)&&noncollision(chosen,x));
  if(g){chosen.push(g);seen.add(g.mother);}
  if(chosen.length>=limit)break;
 }
 return chosen;
}
function policies(pools){
 const base=choose(pools,'TOP10_CUPO2').chosen;
 assert.equal(base.length,10);
 const cup1=choose(pools,'TOP10_CUPO1').chosen;
 const rootedOthers=pools.admitted.filter(x=>x.motherRank>=11);
 const rank6to10=pools.admitted.filter(x=>x.motherRank>=6&&x.motherRank<=10);
 const backfillOption=(first,extras,nExtras)=>{
  const chosen=first.slice();
  append(chosen,extras,first.length+nExtras,true);
  return ensureTen(chosen,pools);
 };
 const oneEach=onePerMother(pools,1,5,5);
 assert.equal(oneEach.length,5);
 const others6=pools.admitted.filter(g=>g.motherRank>=6);
 const choices={
  TOP5_CUPO2:{chosen:base,backfill:0},
  TOP10_CUPO1:{chosen:cup1,backfill:0},
  MIX_8MAS2_6A10:backfillOption(base.slice(0,8),rank6to10,2),
  MIX_8MAS2_11PLUS:backfillOption(base.slice(0,8),rootedOthers,2),
  MIX_5MAS5_6PLUS:backfillOption(oneEach,others6,5),
  MIX_5MAS5_11PLUS:backfillOption(oneEach,rootedOthers,5),
  ESTRATOS_ANTERIOR:choose(pools,'ADMITIDAS_ESTRATOS')
 };
 for(const [method,choice] of Object.entries(choices)){
  assert.equal(choice.chosen.length,10,method);
  assert.equal(new Set(choice.chosen.flatMap(g=>g.values)).size,
   choice.chosen.flatMap(g=>g.values).length,'repeated exact full head');
 }
 return choices;
}
function serial(choice){
 return {top10:choice.chosen.map((g,i)=>({position:i+1,
  family:g.family,mother:g.mother,motherRank:g.motherRank,values:g.values,
  sourceCount:g.sources,physicalBlocks:g.blocks,evidence:g.evidence,
  physicalPaths:g.paths})),
  backfilledSlots:choice.backfill,
  distinctMotherRanks:new Set(choice.chosen.map(g=>g.motherRank)).size,
  admittedFrom6to10:choice.chosen.filter(g=>g.motherRank>=6&&g.motherRank<=10).length,
  admittedFrom11plus:choice.chosen.filter(g=>g.motherRank>10).length};
}
function before(){
 assert.ok(!existsSync(POST),'POST was not physically hidden');
 assert.ok(!existsSync(FIXTURE),'Fixture with future heads was not physically hidden');
 const inputs=json(INPUT).rows;
 const benchmark=json(PRIOR).rows, oldAdmit=json(ADMISSION_PRIOR).rows;
 assert.equal(inputs.length,115);assert.equal(benchmark.length,115);
 assert.equal(oldAdmit.length,115);
 const records=[],frames=[];
 for(let i=0;i<115;i++){
  const d=inputs[i],b=benchmark[i],prev=oldAdmit[i];
  assert.equal(key(d),key(b));assert.equal(key(d),key(prev));
  assert.equal(d.current.heads[d.turn].length,0);
  assert.ok(d.history.every(x=>x.date<d.date));
  const view=buildMotorLalo(d.current,d.date,d.turn,d.history);
  const pools=available(view,d);
  const c=policies(pools);
  for(const [which,bench] of [['TOP5_CUPO2','CUPO_2'],['TOP10_CUPO1','CUPO_1']]){
   assert.deepEqual(c[which].chosen.map(g=>g.family),
    b.options[bench].ranked.map(g=>g.family),'TOP mismatch '+key(d)+' '+which);
  }
  assert.deepEqual(c.ESTRATOS_ANTERIOR.chosen.map(g=>g.family),
   prev.options.ADMITIDAS_ESTRATOS.rank.map(g=>g.family),'Admission strata mismatch '+key(d));
  const {table,rootNum,allNum}=rankTable(pools);
  frames.push(table);
  const rootRanks=view.ranks.vt3;
  const physicalCountsByBand=Object.fromEntries(
   [3,5,10,25,99999].map(n=>[String(n),
    Array.from({length:10000},(_,id)=>table.readUInt16LE(2*id)<=n).filter(Boolean).length]));
  records.push({i,date:d.date,turn:d.turn,
   motherPool:{admittedFamilies:rootRanks.length,
    rootedVt4Groups:pools.admitted.length,
    nativelyTop10Vt4Groups:pools.native.length,
    unanchoredVt4Groups:pools.onlyPhysical.length,
    rootedExactNumbers:rootNum,allPhysicalExactNumbers:allNum,
    physicalCountsByBand},
   choices:Object.fromEntries(METHODS.map(m=>[m,serial(c[m])]))});
  if(i%20===19)console.log('MADRES_COBERTURA_PRE',i+1);
 }
 const packed=Buffer.concat(frames);
 const archive={date:'2026-10-13',cuts:115,codec:'gzip-base64',
  packedFields:{frameBytes:30000,
   rankU16LittleEndianOffset:0,rankMissing:65535,anyPhysicalU8Offset:20000,
   numericIndexMeaning:'0000..9999, as integer'},
  rawSha256:sha(packed),data:gzipSync(packed,{level:9}).toString('base64')};
 save('MAPAS_FISICOS_PRE_115.json',archive);
 save('PRE_115.json',{date:'2026-10-13',cuts:115,records,methods:METHODS,
  note:'No se usaron las cabezas sorteadas del objetivo para formar la bolsa física o elegir los diez lugares.'});
 save('SELLO.json',{sourceCode:sha(read(SOURCE)),engine:sha(read('src/motorLalo.ts')),
  currentScript:sha(read('scripts/lab-vt3-madres-vt4-cobertura.mjs')),
  protocol:sha(read(PROTOCOL)),input:sha(read(INPUT)),
  prior:sha(read(PRIOR)),admissionPrior:sha(read(ADMISSION_PRIOR)),
  pre:sha(read(DIR+'PRE_115.json')),
  packed:sha(read(DIR+'MAPAS_FISICOS_PRE_115.json'))});
 console.log('MADRES_COBERTURA_PRE_OK',JSON.stringify({cuts:115,
  sizes:{packed:packed.length,packedCompressed:Buffer.from(archive.data,'base64').length,
   profile:read(DIR+'PRE_115.json').length},seal:json(DIR+'SELLO.json')},null,2));
}
function decode(){
 const packed=json(DIR+'MAPAS_FISICOS_PRE_115.json');
 const buff=gunzipSync(Buffer.from(packed.data,'base64'));
 assert.equal(sha(buff),packed.rawSha256);
 assert.equal(buff.length,115*30000);
 return buff;
}
function aggregate(rows,method){
 const sample=rows.map(x=>x.selections[method]);
 return {cuts:rows.length,top3:sample.filter(x=>x.top3).length,
  top5:sample.filter(x=>x.top5).length,
  top10:sample.filter(x=>x.top10).length,
  heads:sample.reduce((s,x)=>s+x.heads.length,0),
  averageMothers:Number(mean(sample.map(x=>x.mothers)).toFixed(3)),
  averageExtra6to10:Number(mean(sample.map(x=>x.admitted6to10)).toFixed(3)),
  averageExtra11plus:Number(mean(sample.map(x=>x.admitted11plus)).toFixed(3)),
  meanBackfills:Number(mean(sample.map(x=>x.backfills)).toFixed(3)),
  gainsVsBase:rows.filter(x=>x.selections[method].top10&&!x.selections.TOP5_CUPO2.top10).map(key),
  lossesVsBase:rows.filter(x=>!x.selections[method].top10&&x.selections.TOP5_CUPO2.top10).map(key)};
}
const levels=[
 {name:'TOP3_VT3',limit:3,rootedOnly:true},
 {name:'TOP5_VT3',limit:5,rootedOnly:true},
 {name:'TOP10_VT3',limit:10,rootedOnly:true},
 {name:'TOP25_VT3',limit:25,rootedOnly:true},
 {name:'TODAS_ADMITIDAS_VT3',limit:65534,rootedOnly:true},
 {name:'TODAS_FISICAS_SIN_RAIZ',limit:65535,rootedOnly:false}
];
function after(){
 const seal=json(DIR+'SELLO.json');
 for(const [f,h] of [[SOURCE,seal.sourceCode],['src/motorLalo.ts',seal.engine],
  ['scripts/lab-vt3-madres-vt4-cobertura.mjs',seal.currentScript],[PROTOCOL,seal.protocol],
  [INPUT,seal.input],[PRIOR,seal.prior],[ADMISSION_PRIOR,seal.admissionPrior],
  [DIR+'PRE_115.json',seal.pre],[DIR+'MAPAS_FISICOS_PRE_115.json',seal.packed]])
   assert.equal(sha(read(f)),h,'PRE was modified '+f);
 const pre=json(DIR+'PRE_115.json').records,goals=json(POST).rows,packed=decode();
 assert.equal(pre.length,115);assert.equal(goals.length,115);
 const output=pre.map((r,i)=>{
  const post=goals[i];assert.equal(key(r),key(post));
  assert.equal(post.heads.length,5);assert.ok(post.heads.every(isHead));
  const offset=i*30000,heads=uniq(post.heads);
  const info=heads.map(head=>{
   const n=Number(head),minMotherRank=packed.readUInt16LE(offset+2*n),
    fullPhysical=Boolean(packed[offset+20000+n]);
   assert.ok(minMotherRank===65535||fullPhysical);
   return {head,lowestRootedMotherRank:minMotherRank===65535?null:minMotherRank,
    physicallyPresent:fullPhysical,
    reachableBy:Object.fromEntries(levels.map(l=>[l.name,l.rootedOnly?
      minMotherRank<=l.limit:fullPhysical]))};
  });
  const coverage=Object.fromEntries(levels.map(l=>{
   const eligible=info.filter(h=>h.reachableBy[l.name]).map(x=>x.head);
   return [l.name,{cutHit:eligible.length>0,heads:eligible}];
  }));
  const selections=Object.fromEntries(METHODS.map(method=>{
   const choice=r.choices[method],groups=choice.top10;
   const hit=n=>groups.slice(0,n).some(g=>g.values.some(v=>heads.includes(v)));
   const found=uniq(groups.flatMap(g=>g.values.filter(x=>heads.includes(x))));
   return [method,{top3:hit(3),top5:hit(5),top10:hit(10),heads:found,
    mothers:choice.distinctMotherRanks,
    admitted6to10:choice.admittedFrom6to10,
    admitted11plus:choice.admittedFrom11plus,
    backfills:choice.backfilledSlots,
    examples:groups.filter(g=>g.values.some(v=>heads.includes(v))).map(g=>({
     head:g.values.filter(v=>heads.includes(v)),family:g.family,mother:g.mother,
     motherRank:g.motherRank,position:g.position}))}];
  }));
  return {date:r.date,turn:r.turn,heads,info,coverage,selections};
 });
 const coverageStats=Object.fromEntries(levels.map(l=>{
  const rows=output.map(x=>x.coverage[l.name]);
  return [l.name,{cuts:rows.filter(x=>x.cutHit).length,
   distinctWinningHeads:rows.reduce((s,x)=>s+x.heads.length,0),
   countOfPhysicalNumbersAvailableMean:Number(mean(pre.map(x=>
    l.name==='TODAS_FISICAS_SIN_RAIZ'?x.motherPool.allPhysicalExactNumbers:
     x.motherPool.physicalCountsByBand[String(l.limit===65534?99999:l.limit)]
   )).toFixed(1))}];
 }));
 for(let i=1;i<levels.length;i++){
  assert.ok(coverageStats[levels[i].name].cuts>=coverageStats[levels[i-1].name].cuts);
  assert.ok(coverageStats[levels[i].name].distinctWinningHeads>=coverageStats[levels[i-1].name].distinctWinningHeads);
 }
 const jumps=Object.fromEntries(levels.slice(1).map((l,i)=>{
  const earlier=levels[i].name;
  const gains=output.flatMap(x=>x.coverage[l.name].heads.filter(h=>
   !x.coverage[earlier].heads.includes(h)).map(head=>({
    date:x.date,turn:x.turn,head,rootRank:x.info.find(z=>z.head===head).lowestRootedMotherRank
   })));
  return [earlier+' → '+l.name,{newHeads:gains.length,examples:gains}];
 }));
 const selection=Object.fromEntries(METHODS.map(m=>[m,aggregate(output,m)]));
 assert.deepEqual([selection.TOP5_CUPO2.top3,selection.TOP5_CUPO2.top5,
   selection.TOP5_CUPO2.top10,selection.TOP5_CUPO2.heads],[0,0,4,4]);
 const byWeek=Object.fromEntries(['X1','Y1','Y2','Y3'].map((w,i)=>{
  const dates=[['2026-09-15','2026-09-19'],['2026-09-21','2026-09-26'],
   ['2026-09-28','2026-10-03'],['2026-10-05','2026-10-10']][i];
  const rows=output.filter(x=>x.date>=dates[0]&&x.date<=dates[1]);
  return [w,{cuts:rows.length,coverage:Object.fromEntries(levels.map(l=>
   [l.name,rows.filter(x=>x.coverage[l.name].cutHit).length])),
   top10:Object.fromEntries(METHODS.map(m=>
    [m,rows.filter(x=>x.selections[m].top10).length]))}];
 }));
 const status={date:'2026-10-13',cuts:115,
  targetHeads:output.reduce((s,x)=>s+x.heads.length,0),
  coverage:coverageStats,jumps,ranking:selection,byWeek,
  exampleLines:output.filter(x=>x.info.some(y=>y.physicallyPresent)).map(x=>({
   date:x.date,turn:x.turn,
   heads:x.info.filter(h=>h.physicallyPresent),
   chosen:Object.fromEntries(METHODS.map(m=>[m,x.selections[m].examples]))
  })),
  integrity:{sealSHA:seal.pre,packedSHA:seal.packed,
   priorTop5twoReproducedFor115:true,priorTop10oneReproducedFor115:true},
  warning:'Techos físicos calculados POST, no pronósticos. Histórico muy reutilizado. El sorteo es aleatorio.'};
 save('POST_115.json',{rows:output});
 save('RESUMEN.json',status);
 console.log('MADRES_COBERTURA_POST_OK',JSON.stringify({
  coverage:status.coverage,jumps:status.jumps,
  ranking:status.ranking,
  examples:status.exampleLines.slice(0,40).map(x=>({date:x.date,turn:x.turn,
   heads:x.heads,winningSelections:Object.fromEntries(Object.entries(x.chosen)
    .filter(([,v])=>v.length))}))
 },null,2));
}
if(process.argv[2]==='pre')before();
else if(process.argv[2]==='post')after();
else throw Error('Usage: pre|post');
