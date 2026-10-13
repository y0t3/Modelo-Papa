import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {stripTypeScriptTypes} from 'node:module';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const runtime='resultados/runtime-auditoria-nocturna';
mkdirSync(runtime,{recursive:true});
assert.equal(createHash('sha256').update(readFileSync('src/motorLalo.ts')).digest('hex'),'7715327e6922c3c6f032c1075e6bb08927d5ef51c41552fa9e5758814c746074');
for(const name of ['motorLalo','sheet','domain','paths'])writeFileSync(`${runtime}/${name}.mjs`,stripTypeScriptTypes(readFileSync(`src/${name}.ts`,'utf8')).replace(/from '(\.{1,2}\/[^']+)'/g,(_,p)=>`from '${p}.mjs'`));
const module=name=>import(pathToFileURL(resolve(runtime,`${name}.mjs`)));
const {buildMotorLalo,reversibleFamily}=await module('motorLalo');
const {buildSheet}=await module('sheet');
const {diaVacio,JURS,TURNOS}=await module('domain');
const {findPaths}=await module('paths');
const dir='auditorias/vt3-nocturna-12oct2026';
const sealed=JSON.parse(readFileSync(`${dir}/NOCTURNA_PRE_SELLADO.json`,'utf8'));
const raw=JSON.parse(gunzipSync(Buffer.from(readFileSync('fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64','utf8').trim(),'base64')));
function day(date){const d=diaVacio();TURNOS.forEach((t,i)=>JURS.forEach((j,k)=>d[t][j]=raw[date][i][k]));return d}
const history=[{date:'2026-10-10',period:'D−1',sheet:buildSheet(day('2026-10-10'),day('2026-10-09'))},{date:'2026-10-05',period:'D−7',sheet:buildSheet(day('2026-10-05'),day('2026-10-03'))}];
const current={columns:sealed.sourceColumns,heads:Object.fromEntries(TURNOS.map(t=>[t,[]])),matches:Object.fromEntries(TURNOS.map(t=>[t,[]]))};
const motor=buildMotorLalo(current,sealed.date,'Nocturno',history);
for(const k of ['vt2','vt3','vt4']){
 const compact=motor.ranks[k].map(f=>({family:f.family,rank:f.rank,sourceCount:f.sourceCount,paths:f.paths.length,physicalBlocks:f.physicalBlocks,directRoots:f.directRoots,d7Roots:f.d7Roots,d1Roots:f.d1Roots,branchBlocks:f.branchBlocks,parentFamilies:f.parentFamilies,rationale:f.rationale}));
 assert.deepEqual(compact,sealed.ranks[k],`Replay no coincide con sello: ${k}`);
}
assert.equal(motor.roots.length,sealed.roots);
const coord=c=>`${c.row}:${c.col}`;
const pathkey=p=>[p.map(coord).join('>'),[...p].reverse().map(coord).join('>')].sort()[0];
const priority=f=>[Number(f.branchBlocks>0),Math.min(f.branchBlocks,15),Math.min(f.d1Roots,10),Math.min(f.d7Roots,10),f.sourceCount,f.physicalBlocks];
const details=[];
for(const value of ['815','851','615','242','290','264']){
 const family=reversibleFamily(value),f=motor.ranks.vt3.find(x=>x.family===family);
 const physical=current.columns.flatMap(c=>findPaths(c.values,value).map(path=>({source:c.id,path,value,enginePath:!!f?.paths.some(p=>p.sourceId===c.id&&pathkey(p.path)===pathkey(path))})));
 const roots=[...new Set(f?.paths.flatMap(p=>p.rootIds)||[])].map(id=>motor.roots.find(r=>r.id===id));
 details.push({value,family,sealedRank:f?.rank??null,physical,engine:f,roots,
  priority:f?priority(f):null,
  exclusionByFirstKey:f?motor.ranks.vt3.filter(x=>x.rank<f.rank).reduce((s,x)=>{const a=priority(x),b=priority(f),i=a.findIndex((v,k)=>v!==b[k]);s[i<0?'alfabetico':['hayBifurcacion','bloquesBifurcacion','raicesD1','raicesD7','fuentes','bloques'][i]]=(s[i<0?'alfabetico':['hayBifurcacion','bloquesBifurcacion','raicesD1','raicesD7','fuentes','bloques'][i]]||0)+1;return s},{}):null});
}
const allPhysical=new Map();
for(const c of current.columns)for(let n=0;n<1000;n++){
 const v=String(n).padStart(3,'0'),f=reversibleFamily(v);if(v>v.split('').reverse().join(''))continue;
 const ps=findPaths(c.values,v);if(!ps.length)continue;
 const entry=allPhysical.get(f)||[];entry.push({source:c.id,paths:[...new Set(ps.map(pathkey))].length});allPhysical.set(f,entry);
}
const bySource=current.columns.map(c=>({source:c.id,physicalFamilies:[...allPhysical.values()].filter(a=>a.some(x=>x.source===c.id)).length,engineFamilies:motor.ranks.vt3.filter(f=>f.paths.some(p=>p.sourceId===c.id)).length,top10:motor.ranks.vt3.slice(0,10).filter(f=>f.paths.some(p=>p.sourceId===c.id)).map(f=>f.family),historicVT3Roots:motor.roots.filter(r=>r.oldCells.length===3&&r.sourceId===c.id).map(r=>({date:r.date,head:r.head,turn:r.oldTurn,jur:r.jurisdiction,cells:r.oldCells}))}));
const output={sealedAt:sealed.sealedAtUtc,replayExact:true,physicalFamilies:allPhysical.size,engineFamilies:motor.ranks.vt3.length,bySource,details,top10:motor.ranks.vt3.slice(0,10).map(f=>({family:f.family,priority:priority(f),sources:[...new Set(f.paths.map(p=>p.sourceId))]}))};
writeFileSync(`${dir}/DIAGNOSTICO_VT3.json`,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({...output,details:details.map(({engine,...d})=>({...d,physical:d.physical.map(p=>({...p,path:p.path.map(coord)}))}))},null,2));
