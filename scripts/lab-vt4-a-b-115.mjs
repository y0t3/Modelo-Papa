import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';

const BASE='auditorias/vt4-a-b-concentrado-rondas-15oct2026';
const INPUT='auditorias/vt4-diversidad-madres-top10-115-13oct2026/INPUT_PRE_115.json';
const GOALS='auditorias/vt4-diversidad-madres-top10-115-13oct2026/OBJETIVOS_POST_115.json';
const SEALED=BASE+'/PRE_115.json',HASH=BASE+'/PRE_SHA256.txt';
const mode=process.argv[2];
assert.ok(['pre','post'].includes(mode),'Uso: node lab-vt4-a-b.mjs pre|post');
const read=x=>readFileSync(x,'utf8');
const sha=x=>createHash('sha256').update(x).digest('hex');
const save=(name,obj)=>{mkdirSync(dirname(name),{recursive:true});writeFileSync(name,JSON.stringify(obj,null,2)+'\n')};
const engine=read('src/motorLalo.ts');
// El control y la alternativa comparten la generación y el ranking intramadre.
// ÚNICA diferencia = intercalación por rondas antes de rankear el resultado.
const needle='const ranked4=distributeVt4ByMother(daughtersByPhysicalStrength,selectedMothers);';
assert.equal(engine.split(needle).length,2);
const oldEngine=engine.replace(needle,'const ranked4=daughtersByPhysicalStrength;');
const RUNTIME='resultados/runtime-vt4-a-b';
for(const name of ['domain','dates','paths','sheet','motorLalo','motorConcentrado']){
 const from=name==='motorConcentrado'?oldEngine:
  name==='motorLalo'?engine:read('src/'+name+'.ts');
 const dest=resolve(RUNTIME,name+'.mjs');
 mkdirSync(dirname(dest),{recursive:true});
 writeFileSync(dest,stripTypeScriptTypes(from).replace(
  /from '(\.{1,2}\/[^']+)'/g,(_,p)=>"from '"+p+".mjs'"));
}
const imp=async name=>import(pathToFileURL(resolve(RUNTIME,name+'.mjs')).href);
const [{buildMotorLalo:roundModel},{buildMotorLalo:oldModel},{TURNOS}]=await Promise.all(
 ['motorLalo','motorConcentrado','domain'].map(imp));
const METHODS=['concentrado','rondas'];
const KINDS=['vt2','vt3','vt4'];
const cell=c=>c.row+':'+c.col;
const describe=f=>({
 family:f.family,rank:f.rank,
 parents:f.parentFamilies,
 sourceCount:f.sourceCount,physicalBlocks:f.physicalBlocks,
 values:[...new Set(f.paths.map(p=>p.value))].sort(),
 routes:f.paths.length
});
const summarizeTop=(arr,limit)=>({
 top:arr.slice(0,limit).map(describe),
 distinctMothers:new Set(arr.slice(0,limit).flatMap(x=>x.parentFamilies)).size,
 distinctExactValues:new Set(arr.slice(0,limit).flatMap(f=>f.paths.map(p=>p.value))).size
});
const candidateEqual=(one,two)=>{
 const canonical=rs=>rs.map(f=>{
  const {rank,...same}=f;return same
 }).sort((a,b)=>a.family.localeCompare(b.family));
 assert.deepEqual(canonical(one.map(describe)),canonical(two.map(describe)),
  'Sólo cambia la posición, nunca el conjunto VT4 ni testigos');
};

if(mode==='pre'){
 assert.ok(!existsSync(GOALS),'PRE aislado: objetivos futuros visibles en el directorio');
 assert.ok(!existsSync(SEALED),'No sobrescribir PRE anterior');
 assert.ok(existsSync(INPUT),'Falta el archivo con los 115 cortes PRE');
 const input=jsonSafe(INPUT);
 assert.equal(input.rows.length,115);
 const rows=[];
 for(const [i,x] of input.rows.entries()){
  assert.ok(x.history.every(h=>h.date<x.date),'Fuga temporal de fuentes pasadas');
  const turnIndex=TURNOS.indexOf(x.turn);assert.ok(turnIndex>=0);
  assert.equal(x.current.heads[x.turn].length,0,'El objetivo no puede figurar en PRE');
  assert.ok(x.current.columns.slice(turnIndex+1).every(
   col=>col.values.every(v=>v==='--')),'Celdas futuras visibles');
  const concentrated=oldModel(x.current,x.date,x.turn,x.history);
  const rounds=roundModel(x.current,x.date,x.turn,x.history);
  assert.deepEqual(concentrated.roots,rounds.roots,'Cambian raíces entre modelos');
  assert.deepEqual(concentrated.ranks.vt2,rounds.ranks.vt2,'Cambió VT2');
  assert.deepEqual(concentrated.ranks.vt3,rounds.ranks.vt3,'Cambió VT3');
  candidateEqual(concentrated.ranks.vt4,rounds.ranks.vt4);
  for(const f of rounds.ranks.vt4)for(const p of f.paths){
   assert.equal(p.path.length,4);
   assert.equal(new Set(p.path.map(cell)).size,4);
   assert.equal(p.addedDigit,p.path[0].digit);
   assert.equal(p.value,p.path.map(q=>q.digit).join(''));
   assert.ok(f.parentFamilies.some(m=>m.split('/').includes(p.value.slice(1))),
    'VT4 no tiene madre VT3 derecha después del prefijo');
   assert.ok(p.path.slice(1).every((c,idx,arr)=>idx===0||
    Math.max(Math.abs(c.row-arr[idx-1].row),Math.abs(c.col-arr[idx-1].col))===1));
  }
  const tops=Object.fromEntries(METHODS.map(method=>{
   const view=method==='concentrado'?concentrated:rounds;
   return [method,{
    availableVt4:view.ranks.vt4.length,
    mothersVt3:view.ranks.vt3.slice(0,10).map(f=>f.family),
    allDaughters:view.ranks.vt4.map(describe),
    top3:summarizeTop(view.ranks.vt4,3),
    top5:summarizeTop(view.ranks.vt4,5),
    top10:summarizeTop(view.ranks.vt4,10),
   }];
  }));
  rows.push({date:x.date,turn:x.turn,methods:tops});
  if((i+1)%25===0)console.log('PRE',i+1);
 }
 const pre={protocol:'VT4_AB_SIN_CABEZAS_OBJETIVO',engineSha256:sha(engine),
  controlSourceSha256:sha(oldEngine),inputSha256:sha(read(INPUT)),
  phase:'RECONSTRUCCION_RETROSPECTIVA_115_PRE_AISLADOS',
  warning:'Rankings construidos después de los sorteos con entradas recortadas. No son pronósticos prospectivos auténticos.',
  dateCreatedUtc:new Date().toISOString(),rows};
 save(SEALED,pre);
 writeFileSync(HASH,sha(read(SEALED))+'\n');
 console.log('VT4_AB_PRE_OK',rows.length,'hash',sha(read(SEALED)));
}else{
 assert.ok(existsSync(SEALED)&&existsSync(HASH)&&existsSync(GOALS),'Falta PRE sellado o objetivos POST');
 assert.equal(sha(read(SEALED)),read(HASH).trim(),'El PRE fue alterado');
 const pre=jsonSafe(SEALED),goals=jsonSafe(GOALS);
 assert.equal(pre.rows.length,115);assert.equal(goals.rows.length,115);
 const stats=Object.fromEntries(METHODS.map(m=>[m,{
  cutsWithTop3:0,cutsWithTop5:0,cutsWithTop10:0,
  drawnHeadsMatchedTop3:0,drawnHeadsMatchedTop5:0,drawnHeadsMatchedTop10:0,
  distinctMothersTop3:0,distinctMothersTop5:0,distinctMothersTop10:0,
  distinctNumbersTop10:0
 }]));
 const paired={top3:{gained:[],lost:[]},top5:{gained:[],lost:[]},top10:{gained:[],lost:[]}};
 const rows=[];
 for(let i=0;i<115;i++){
  const p=pre.rows[i],g=goals.rows[i];
  assert.equal(p.date,g.date);assert.equal(p.turn,g.turn);
  const heads=g.heads||g.targetHeads;assert.equal(heads.length,5);
  assert.ok(heads.every(h=>/^\d{4}$/.test(h)));
  const checked={};
  for(const m of METHODS){
   const d=p.methods[m],entry={};
   for(const n of [3,5,10]){
    const subset=d['top'+n].top;
    const matched=heads.filter(h=>subset.some(f=>f.values.includes(h)));
    entry['top'+n]={hit:matched.length>0,matchedHeads:matched,
     families:subset.filter(f=>f.values.some(h=>heads.includes(h))).map(f=>f.family),
     distinctMothers:d['top'+n].distinctMothers,
     distinctNumbers:d['top'+n].distinctExactValues
    };
    stats[m]['cutsWithTop'+n]+=Number(matched.length>0);
    stats[m]['drawnHeadsMatchedTop'+n]+=matched.length;
    stats[m]['distinctMothersTop'+n]+=d['top'+n].distinctMothers;
   }
   stats[m].distinctNumbersTop10+=d.top10.distinctExactValues;
   checked[m]=entry;
  }
  for(const n of [3,5,10]){
   const before=checked.concentrado['top'+n].hit,after=checked.rondas['top'+n].hit;
   const key=p.date+' '+p.turn;
   if(!before&&after)paired['top'+n].gained.push(key);
   if(before&&!after)paired['top'+n].lost.push(key);
  }
  rows.push({date:p.date,turn:p.turn,heads,methods:checked});
 }
 const byDay=[...new Set(rows.map(r=>r.date))].map(date=>({
  date,rows:rows.filter(r=>r.date===date).map(r=>({
   turn:r.turn,concentrado:r.methods.concentrado.top10.hit,rondas:r.methods.rondas.top10.hit
  }))
 }));
 const result={phase:'POST_DE_PRE_RETROSPECTIVOS',cuts:115,days:byDay.length,
  drawnHeads:575,preSha256:sha(read(SEALED)),engineSha256:pre.engineSha256,
  stats,meanDistinctMothers:Object.fromEntries(METHODS.map(m=>[m,stats[m].distinctMothersTop10/115])),
  meanDistinctExactNumbers:Object.fromEntries(METHODS.map(m=>[m,stats[m].distinctNumbersTop10/115])),
  paired,byDay,warning:'Exploratorio: los 115 cortes comparten jornadas, el método por rondas fue diseñado después de ver múltiples historiales. No afirmar mejora prospectiva sin sellos futuros.'};
 save(BASE+'/RESUMEN.json',result);
 save(BASE+'/POST_115.json',{summary:result,rows});
 console.log('VT4_AB_POST_OK '+JSON.stringify({stats,means:result.meanDistinctMothers,
  discordant:paired,meanDistinctExactNumbers:result.meanDistinctExactNumbers},null,2));
}
function jsonSafe(path){return JSON.parse(read(path))}
