import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {gunzipSync} from 'node:zlib';

const mode=process.argv[2],out='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026';
const source='resultados/replay-lalo-115',runtime='resultados/runtime-vt3-cobertura';
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const hash=s=>createHash('sha256').update(s).digest('hex');
mkdirSync(out,{recursive:true});
const save=(name,x)=>writeFileSync(`${out}/${name}`,JSON.stringify(x,null,2)+'\n');
assert.equal(hash(read('src/motorLalo.ts')),'7715327e6922c3c6f032c1075e6bb08927d5ef51c41552fa9e5758814c746074');
function compile(path){
 const dest=resolve(runtime,path.replace(/\.ts$/,'.mjs'));mkdirSync(dirname(dest),{recursive:true});
 writeFileSync(dest,stripTypeScriptTypes(read(path)).replace(/from '(\.{1,2}\/[^']+)'/g,(_,p)=>`from '${p}.mjs'`));return pathToFileURL(dest).href;
}
for(const name of ['domain','dates','paths','sheet','motorLalo'])compile(`src/${name}.ts`);
if(mode==='prepare'){await import(compile('scripts/replay-lalo115.ts'));process.exit(0)}
const module=name=>import(pathToFileURL(resolve(runtime,`src/${name}.mjs`)));
const {buildMotorLalo,reversibleFamily}=await module('motorLalo');
const {cellsFromPlus11,findPaths}=await module('paths');
const {TURNOS,JURS,diaVacio}=await module('domain');
const {buildSheet}=await module('sheet');
const methods=['A_ORIGINAL','B_INVENTARIO','C_SIN_PRIORIDAD_BIF','D_AMBOS'];
const coord=c=>`${c.row}:${c.col}`;
const seq=p=>p.map(coord).join('>');
const key=(s,p)=>s+'|'+[seq(p),seq([...p].reverse())].sort()[0];
const block=p=>p.map(coord).sort().join(',');
const adj=(a,b)=>Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1;
function inventory(columns){
 const families=new Map();
 for(const col of columns){
  const cells=cellsFromPlus11(col.values);
  const visit=path=>{
   if(path.length===3){
    const value=path.map(c=>c.digit).join(''),family=reversibleFamily(value);
    if(!families.has(family))families.set(family,new Map());
    const k=key(col.id,path);if(!families.get(family).has(k))families.get(family).set(k,{source:col.id,path,value,rootIds:[],anchored:false});return;
   }
   for(const c of cells)if(!path.includes(c)&&(!path.length||adj(path.at(-1),c)))visit([...path,c]);
  };visit([]);
 }
 return families;
}
function features(f,paths){
 return {family:f.family,originalRank:f.rank??null,d1:f.d1Roots??0,d7:f.d7Roots??0,bif:f.branchBlocks??0,
  sources:new Set(paths.map(p=>p.source)).size,blocks:new Set(paths.map(p=>p.source+'|'+block(p.path))).size,
  paths:paths.length,anchoredPaths:paths.filter(p=>p.anchored).length};
}
const priority=(f,late)=>late?[Math.min(f.d1,10),Math.min(f.d7,10),f.sources,f.blocks,Number(f.bif>0),Math.min(f.bif,15)]:[Number(f.bif>0),Math.min(f.bif,15),Math.min(f.d1,10),Math.min(f.d7,10),f.sources,f.blocks];
function rank(fs,late){
 return [...fs].sort((a,b)=>{const x=priority(a,late),y=priority(b,late);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return y[i]-x[i];return a.family.localeCompare(b.family)}).map((f,i)=>({...f,rank:i+1}));
}
function cut(row){
 const {date,turn,current,history}=row,ti=TURNOS.indexOf(turn);
 assert.ok(history.every(h=>h.date<date));
 for(const t of TURNOS.slice(ti))assert.equal(current.heads[t].length,0);
 assert.ok(current.columns.slice(ti+1).every(c=>c.values.every(v=>v==='--')));
 const engine=buildMotorLalo(current,date,turn,history),original=engine.ranks.vt3;
 const physical=inventory(current.columns.slice(0,ti+1));
 const accepted=original.map(f=>features(f,f.paths.map(p=>({source:p.sourceId,path:p.path,anchored:true}))));
 const origMap=new Map(original.map(f=>[f.family,f]));
 const full=[],witnesses=[];
 for(const [family,pathMap] of physical){
  const f=origMap.get(family);
  for(const p of f?.paths||[]){const q=pathMap.get(key(p.sourceId,p.path));assert.ok(q,'Ruta original ausente en inventario');q.anchored=true;q.rootIds=[...p.rootIds]}
  const paths=[...pathMap.values()];
  // Segunda enumeración independiente del DFS: findPaths usado por la hoja.
  const target=family.split('/')[0];
  const expected=current.columns.slice(0,ti+1).flatMap(c=>findPaths(c.values,target).map(p=>key(c.id,p)));
  assert.deepEqual([...new Set(expected)].sort(),[...pathMap.keys()].sort());
  for(const p of paths){assert.equal(p.path.length,3);assert.equal(new Set(p.path.map(coord)).size,3);assert.ok(p.path.slice(1).every((c,i)=>adj(p.path[i],c)));assert.equal(reversibleFamily(p.value),family);if(!p.anchored)assert.equal(p.rootIds.length,0)}
  full.push(features(f||{family},paths));
  witnesses.push({family,paths:paths.map(p=>({source:p.source,cells:p.path.map(coord),value:p.value,anchored:p.anchored,rootIds:p.rootIds}))});
 }
 const strategies={A_ORIGINAL:rank(accepted,false),B_INVENTARIO:rank(full,false),C_SIN_PRIORIDAD_BIF:rank(accepted,true),D_AMBOS:rank(full,true)};
 assert.deepEqual(strategies.A_ORIGINAL.map(f=>f.family),original.map(f=>f.family),'Orden original distinto');
 assert.deepEqual(strategies.A_ORIGINAL.map(f=>[f.blocks,f.sources]),original.map(f=>[f.physicalBlocks,f.sourceCount]));
 for(const m of methods){assert.ok(strategies[m].length>=10);assert.equal(new Set(strategies[m].map(f=>f.family)).size,strategies[m].length)}
 return {date,turn,strategies,witnesses};
}
function nocturna(){
 const sealed=json('auditorias/vt3-nocturna-12oct2026/NOCTURNA_PRE_SELLADO.json');
 const raw=JSON.parse(gunzipSync(Buffer.from(read('fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64').trim(),'base64')));
 const day=date=>{const d=diaVacio();TURNOS.forEach((t,i)=>JURS.forEach((j,k)=>d[t][j]=raw[date][i][k]));return d};
 const history=[{date:'2026-10-10',period:'D−1',sheet:buildSheet(day('2026-10-10'),day('2026-10-09'))},{date:'2026-10-05',period:'D−7',sheet:buildSheet(day('2026-10-05'),day('2026-10-03'))}];
 const current={columns:sealed.sourceColumns,heads:Object.fromEntries(TURNOS.map(t=>[t,[]])),matches:Object.fromEntries(TURNOS.map(t=>[t,[]]))};
 const row=cut({date:sealed.date,turn:'Nocturno',current,history});
 assert.deepEqual(row.strategies.A_ORIGINAL.map(f=>({family:f.family,rank:f.rank,d1:f.d1,d7:f.d7,bif:f.bif,blocks:f.blocks,sources:f.sources,paths:f.paths})),sealed.ranks.vt3.map(f=>({family:f.family,rank:f.rank,d1:f.d1Roots,d7:f.d7Roots,bif:f.branchBlocks,blocks:f.physicalBlocks,sources:f.sourceCount,paths:f.paths})));
 return row;
}
if(mode==='pre'){
 assert.ok(!existsSync(`${source}/OBJETIVOS_POST_115.json`),'POST presente');
 const input=json(`${source}/INPUT_PRE_115.json`);assert.equal(input.rows.length,115);
 const rows=input.rows.map((r,i)=>{const x=cut(r);if((i+1)%25===0)console.log('PRE',i+1);return x});
 save('PRE_115.json',{protocolHash:hash(read('PROTOCOLO_VT3_COBERTURA_BIFURCACIONES_13OCT2026.md')),inputHash:hash(read(`${source}/INPUT_PRE_115.json`)),rows});
 save('NOCTURNA_SIMULACION.json',{note:'Simulación retrospectiva separada: el resultado del 12/10 ya se conoce.',row:nocturna()});
 save('SELLO.json',{preHash:hash(read(`${out}/PRE_115.json`)),nocturnaHash:hash(read(`${out}/NOCTURNA_SIMULACION.json`)),codeHash:hash(read('scripts/lab-vt3-cobertura-bifurcaciones.mjs'))});
 console.log('PRE_OK',read(`${out}/SELLO.json`));
}else if(mode==='post'){
 const seal=json(`${out}/SELLO.json`);assert.equal(seal.preHash,hash(read(`${out}/PRE_115.json`)));assert.equal(seal.nocturnaHash,hash(read(`${out}/NOCTURNA_SIMULACION.json`)));assert.equal(seal.codeHash,hash(read('scripts/lab-vt3-cobertura-bifurcaciones.mjs')));
 const pre=json(`${out}/PRE_115.json`),post=json(`${source}/OBJETIVOS_POST_115.json`);assert.equal(pre.rows.length,115);assert.equal(post.rows.length,115);
 function evaluate(p,o){
  assert.equal(p.date,o.date);assert.equal(p.turn,o.turn);
  const wins=new Set(o.targetHeads.map(h=>{assert.match(h,/^\d{4}$/);return reversibleFamily(h.slice(-3))}));
  const result={date:p.date,turn:p.turn,targets:o.targetHeads,strategies:{}};
  for(const m of methods){
   const pool=p.strategies[m],hits=pool.filter(f=>wins.has(f.family));
   const expected={};
   for(const k of [3,5,10]){let no=1;for(let j=0;j<Math.min(k,pool.length);j++)no*=(pool.length-hits.length-j)/(pool.length-j);expected[k]=1-no}
   const sourceMemberships={};
   for(const f of pool.slice(0,10))for(const s of new Set(p.witnesses.find(x=>x.family===f.family).paths.filter(q=>m==='A_ORIGINAL'||m==='C_SIN_PRIORIDAD_BIF'?q.anchored:true).map(q=>q.source)))sourceMemberships[s]=(sourceMemberships[s]||0)+1;
   result.strategies[m]={pool:pool.length,hits: hits.map(f=>({family:f.family,rank:f.rank,originalRank:f.originalRank,anchoredPaths:f.anchoredPaths})),top3:hits.some(f=>f.rank<=3),top5:hits.some(f=>f.rank<=5),top10:hits.some(f=>f.rank<=10),top10Names:pool.slice(0,10).map(f=>f.family),expected,sourceMemberships,unanchoredTop10:pool.slice(0,10).filter(f=>!f.anchoredPaths).length};
  }return result;
 }
 const rows=pre.rows.map((p,i)=>evaluate(p,post.rows[i]));
 const summarize=rs=>Object.fromEntries(methods.map(m=>[m,{cuts:rs.length,top3:rs.filter(r=>r.strategies[m].top3).length,top5:rs.filter(r=>r.strategies[m].top5).length,top10:rs.filter(r=>r.strategies[m].top10).length,poolCuts:rs.filter(r=>r.strategies[m].hits.length).length,winningFamilies:rs.reduce((n,r)=>n+r.strategies[m].hits.length,0),totalFamilies:rs.reduce((n,r)=>n+r.strategies[m].pool,0),newWinningFamilies:rs.reduce((n,r)=>n+r.strategies[m].hits.filter(f=>f.originalRank===null).length,0),newWinningTop10:rs.reduce((n,r)=>n+r.strategies[m].hits.filter(f=>f.originalRank===null&&f.rank<=10).length,0),unanchoredTop10:rs.reduce((n,r)=>n+r.strategies[m].unanchoredTop10,0),expectedTop10:rs.reduce((n,r)=>n+r.strategies[m].expected[10],0)}]));
 const stats=summarize(rows),a=stats.A_ORIGINAL;assert.deepEqual([a.top3,a.top5,a.top10,a.poolCuts,a.winningFamilies,a.totalFamilies],[5,8,15,46,64,6389]);
 const paired=Object.fromEntries(methods.slice(1).map(m=>[m,{gained:rows.filter(r=>r.strategies[m].top10&&!r.strategies.A_ORIGINAL.top10).map(r=>`${r.date} ${r.turn}`),lost:rows.filter(r=>!r.strategies[m].top10&&r.strategies.A_ORIGINAL.top10).map(r=>`${r.date} ${r.turn}`),changedTops:rows.filter(r=>r.strategies[m].top10Names.join()!==r.strategies.A_ORIGINAL.top10Names.join()).length}]));
 const group=fn=>Object.fromEntries([...new Set(rows.map(fn))].map(key=>[key,summarize(rows.filter(r=>fn(r)===key))]));
 const summary={cuts:115,days:23,seal,stats,paired,byMonth:group(r=>r.date.slice(0,7)),byTurn:group(r=>r.turn),byDay:group(r=>r.date),limitation:'Histórico reutilizado. Estudio exploratorio. Referencia de misma bolsa no iguala geometría. Nocturna 12/10 separada y conocida.'};
 save('POST_115.json',{summary,rows});save('RESUMEN.json',summary);
 const n=json(`${out}/NOCTURNA_SIMULACION.json`).row;
 const noct=evaluate(n,{date:n.date,turn:n.turn,targetHeads:['9851','1615','7242','8290','3264']});
 noct.targetRanks=Object.fromEntries(['851','615','242','290','264'].map(v=>[v,Object.fromEntries(methods.map(m=>[m,n.strategies[m].find(f=>f.family===reversibleFamily(v))?.rank??null]))]));
 save('NOCTURNA_POST_DIAGNOSTICO.json',noct);
 console.log(JSON.stringify({stats,paired,nocturna:noct.targetRanks},null,2));
}else throw Error('Use prepare | pre | post');
