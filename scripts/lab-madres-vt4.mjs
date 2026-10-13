import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';

// Node 24, sin dependencias. Copia de laboratorio: src/motorLalo.ts queda intacto.
const mode=process.argv[2];
const out='auditorias/madres-vt3-hijas-vt4-115-13oct2026';
const source='resultados/replay-lalo-115';
const runtime='resultados/runtime-madres';
const hash=s=>createHash('sha256').update(s).digest('hex');
const read=p=>readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const save=(name,obj)=>writeFileSync(`${out}/${name}`,JSON.stringify(obj,null,2)+'\n');
mkdirSync(out,{recursive:true});
const engineSource=read('src/motorLalo.ts');
assert.equal(hash(engineSource),'7715327e6922c3c6f032c1075e6bb08927d5ef51c41552fa9e5758814c746074');
function compile(path,code=read(path)){
 const dest=resolve(runtime,path.replace(/\.ts$/,'.mjs'));
 mkdirSync(dirname(dest),{recursive:true});
 writeFileSync(dest,stripTypeScriptTypes(code).replace(/from '(\.{1,2}\/[^']+)'/g,(_,p)=>`from '${p}.mjs'`));
 return pathToFileURL(dest).href;
}
for(const file of ['domain','dates','paths','sheet','motorLalo'])compile(`src/${file}.ts`);
if(mode==='prepare'){
 await import(compile('scripts/replay-lalo115.ts'));
 process.exit(0);
}
const {buildMotorLalo,reversibleFamily}=await import(pathToFileURL(resolve(runtime,'src/motorLalo.mjs')));
const {TURNOS}=await import(pathToFileURL(resolve(runtime,'src/domain.mjs')));
// Únicos cambios al motor: callback de orden VT3 y renumeración antes de puerta de 10 madres.
const signature='historical:LaloHistorical[]):LaloView{';
const ranking="const vt3=rank(base.vt3,roots,'vt3');";
assert.equal(engineSource.split(signature).length,2);
assert.equal(engineSource.split(ranking).length,2);
const variant=engineSource.replace(signature,'historical:LaloHistorical[], selector=(families,roots)=>families):LaloView{')
 .replace(ranking,"const vt3=selector(rank(base.vt3,roots,'vt3'),roots).map((f,i)=>({...f,rank:i+1}));");
const {buildMotorLalo:buildLab}=await import(compile('src/motorLab.ts',variant));
const cell=c=>`${c.row}:${c.col}`;
const block=p=>p.map(cell).sort().join(',');
function features(f,roots){
 const rs=[...new Set(f.paths.flatMap(p=>p.rootIds))].map(id=>{assert.ok(roots.has(id));return roots.get(id)});
 const events=new Set(rs.map(r=>[r.date,r.oldTurn,r.jurisdiction,r.head].join('|'))).size;
 const historicalBlocks=new Set(rs.map(r=>[r.date,r.sourceId,[...r.oldCells].sort().join(',')].join('|'))).size;
 const currentBlocks=new Set(f.paths.map(p=>p.sourceId+'|'+block(p.path))).size;
 const sources=new Set(f.paths.map(p=>p.sourceId)).size;
 return {family:f.family,originalRank:f.rank,events,historicalBlocks,currentBlocks,sources,
  preferred:sources===1&&currentBlocks>=2&&events>=2&&historicalBlocks>=2};
}
const methods=['original','raices_distintas','control_bloques'];
const select=method=>(families,roots)=>{
 const flags=new Map(families.map(f=>{const z=features(f,roots);return [f.family,method==='raices_distintas'?z.preferred:z.sources===1&&z.currentBlocks>=2]}));
 return method==='original'?families:[...families].sort((a,b)=>Number(flags.get(b.family))-Number(flags.get(a.family))||a.rank-b.rank);
};
function audit(view,current){
 const mothers=view.ranks.vt3.slice(0,10);
 assert.equal(mothers.length,10);
 for(const f of view.ranks.vt4)for(const p of f.paths){
  assert.equal(p.path.length,4);assert.equal(new Set(p.path.map(cell)).size,4);
  const column=current.columns.find(c=>c.id===p.sourceId);assert.ok(column);
  for(let i=0;i<4;i++){
   const c=p.path[i];assert.equal(column.values[c.row]?.[c.col],c.digit);
   if(i)assert.equal(Math.max(Math.abs(c.row-p.path[i-1].row),Math.abs(c.col-p.path[i-1].col)),1);
  }
  assert.equal(reversibleFamily(p.path.map(c=>c.digit).join('')),f.family);
  for(const mother of p.mothers){
   const m=mothers.find(x=>x.family===mother);assert.ok(m,'Madre fuera de cupo');
   const segments=[p.path.slice(0,3),p.path.slice(1)].map(s=>s.map(cell).join('>'));
   assert.ok(m.paths.some(q=>q.sourceId===p.sourceId&&[q.path,[...q.path].reverse()].some(s=>segments.includes(s.map(cell).join('>')))),'Hija sin tramo propio');
  }
 }
}
if(mode==='pre'){
 assert.ok(!existsSync(`${source}/OBJETIVOS_POST_115.json`),'POST presente');
 const input=json(`${source}/INPUT_PRE_115.json`);assert.equal(input.rows.length,115);
 const rows=[];
 for(const r of input.rows){
  assert.ok(r.history.every(h=>h.date<r.date));
  for(const t of TURNOS.slice(TURNOS.indexOf(r.turn)))assert.equal(r.current.heads[t].length,0);
  assert.ok(r.current.columns.slice(TURNOS.indexOf(r.turn)+1).every(c=>c.values.every(v=>v==='--')));
  const official=buildMotorLalo(r.current,r.date,r.turn,r.history);
  const fs=official.ranks.vt3.map(f=>features(f,new Map(official.roots.map(x=>[x.id,x]))));
  const strategies={};
  for(const method of methods){
   const m=buildLab(r.current,r.date,r.turn,r.history,select(method));
   if(method==='original')assert.deepEqual(m,official,'Copia de laboratorio divergente');
   assert.deepEqual(m.ranks.vt3.map(f=>f.family).sort(),official.ranks.vt3.map(f=>f.family).sort());
   audit(m,r.current);
   strategies[method]={mothers:m.ranks.vt3.slice(0,10).map(f=>fs.find(x=>x.family===f.family)),
    vt3:m.ranks.vt3.slice(0,10).map(f=>f.family),
    vt4:m.ranks.vt4.map(f=>({family:f.family,rank:f.rank,blocks:f.physicalBlocks,sources:f.sourceCount,mothers:f.parentFamilies})),
    witnesses:m.ranks.vt4.slice(0,10).map(f=>({family:f.family,paths:f.paths.map(p=>({source:p.sourceId,cells:p.path.map(cell),value:p.value,mothers:p.mothers}))}))};
  }
  rows.push({date:r.date,turn:r.turn,strategies});
  if(rows.length%25===0)console.log('PRE',rows.length);
 }
 save('PRE_115.json',{protocol:'PROTOCOLO_MADRES_VT3_HIJAS_VT4_13OCT2026.md',engineSha256:hash(engineSource),inputSha256:hash(read(`${source}/INPUT_PRE_115.json`)),rows});
 writeFileSync(`${out}/PRE_SHA256.txt`,hash(read(`${out}/PRE_115.json`))+'\n');
 console.log('PRE_OK',rows.length,hash(read(`${out}/PRE_115.json`)));
}else if(mode==='post'){
 assert.equal(hash(read(`${out}/PRE_115.json`)),read(`${out}/PRE_SHA256.txt`).trim());
 const pre=json(`${out}/PRE_115.json`),targets=json(`${source}/OBJETIVOS_POST_115.json`);
 assert.equal(pre.rows.length,115);assert.equal(targets.rows.length,115);
 const stats=Object.fromEntries(methods.map(m=>[m,{vt3Top3:0,vt3Top5:0,vt3Top10:0,vt4Top3:0,vt4Top5:0,vt4Top10:0,poolHitCuts:0,winningFamilies:0,totalDaughters:0,motherBlocks:0,expectedTop10:0}]));
 const rows=[];
 for(let i=0;i<115;i++){
  const p=pre.rows[i],t=targets.rows[i];assert.equal(p.date,t.date);assert.equal(p.turn,t.turn);
  const w3=new Set(t.targetHeads.map(h=>reversibleFamily(h.slice(-3)))),w4=new Set(t.targetHeads.map(reversibleFamily));
  const row={date:p.date,turn:p.turn,targets:t.targetHeads,strategies:{}};
  for(const m of methods){
   const s=p.strategies[m],b=stats[m],hits=s.vt4.filter(f=>w4.has(f.family));
   const v={pool:s.vt4.length,hits: hits.map(f=>({family:f.family,rank:f.rank,mothers:f.mothers})),motherFamilies:s.mothers.map(f=>f.family)};
   b.totalDaughters+=s.vt4.length;b.winningFamilies+=hits.length;if(hits.length)b.poolHitCuts++;
   b.motherBlocks+=s.mothers.reduce((n,f)=>n+f.currentBlocks,0);
   for(const k of [3,5,10]){
    v['vt3Top'+k]=s.vt3.slice(0,k).some(f=>w3.has(f));v['vt4Top'+k]=hits.some(f=>f.rank<=k);
    if(v['vt3Top'+k])b['vt3Top'+k]++;if(v['vt4Top'+k])b['vt4Top'+k]++;
   }
   let no=1;for(let j=0;j<Math.min(10,s.vt4.length);j++)no*=(s.vt4.length-hits.length-j)/(s.vt4.length-j);
   b.expectedTop10+=1-no;row.strategies[m]=v;
  }
  rows.push(row);
 }
 assert.deepEqual([stats.original.vt3Top3,stats.original.vt3Top5,stats.original.vt3Top10,stats.original.vt4Top10,stats.original.poolHitCuts,stats.original.totalDaughters],[5,8,15,0,7,7669]);
 const paired=Object.fromEntries(methods.slice(1).map(m=>[m,{
  changedMotherSets:rows.filter(r=>[...r.strategies[m].motherFamilies].sort().join()!==[...r.strategies.original.motherFamilies].sort().join()).length,
  gainedPoolCuts:rows.filter(r=>r.strategies[m].hits.length&&!r.strategies.original.hits.length).map(r=>r.date+' '+r.turn),
  lostPoolCuts:rows.filter(r=>!r.strategies[m].hits.length&&r.strategies.original.hits.length).map(r=>r.date+' '+r.turn),
  gainedTop10Cuts:rows.filter(r=>r.strategies[m].vt4Top10&&!r.strategies.original.vt4Top10).map(r=>r.date+' '+r.turn),
  lostTop10Cuts:rows.filter(r=>!r.strategies[m].vt4Top10&&r.strategies.original.vt4Top10).map(r=>r.date+' '+r.turn)
 }]));
 const perDay=[...new Set(rows.map(r=>r.date))].map(date=>({date,methods:Object.fromEntries(methods.map(m=>[m,{
  poolCuts:rows.filter(r=>r.date===date&&r.strategies[m].hits.length).length,
  top10Cuts:rows.filter(r=>r.date===date&&r.strategies[m].vt4Top10).length
 }]))}));
 const summary={cuts:115,days:23,preSha256:hash(read(`${out}/PRE_115.json`)),stats,paired,perDay,
  limitation:'Exploratorio sobre fechas reutilizadas. Control bloques parcial, no igualación exacta de densidad. Referencia uniforme condicionada a bolsa no prueba ventaja. Nocturna 12/10 excluida.'};
 save('POST_115.json',{summary,rows});save('RESUMEN.json',summary);console.log(JSON.stringify(summary,null,2));
}else throw Error('Usar prepare | pre | post');
