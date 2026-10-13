import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const B='auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/', H='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/', F='auditorias/vt3-memoria-corta-online-90-13oct2026/', O='auditorias/vt3-voto-unico-forma-90-13oct2026/';
const P='PROTOCOLO_VT3_VOTO_UNICO_FORMA_13OCT2026.md',SHA='42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e';
const MODES=['ORIGINAL_3_EJEMPLOS','FIRMA_CONJUNTO_3','FORMA_INDIVIDUAL_3','FORMA_INDIVIDUAL_1','PRESENCIA_FORMAS'];
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p)),digest=s=>createHash('sha256').update(s).digest('hex'),save=(n,v)=>writeFileSync(O+n,JSON.stringify(v,null,2)+'\n');
const key=r=>r.date+'|'+r.turn,uniq=a=>[...new Set(a)],family=h=>{let s=h.slice(-3);return [s,[...s].reverse().join('')].sort().join('/')};
mkdirSync(O,{recursive:true});
function pre(){
 assert.equal(digest(read(B+'PRE_115.json')),SHA);
 for(const file of [B+'POST_115.json',H+'POST_115.json',F+'POST_90.json'])assert.ok(!existsSync(file),'POST visible: '+file);
 const d=json(B+'PRE_115.json');assert.equal(d.rows.length,115);
 const list=d.rows.flatMap((r,i)=>r.week===d.weeks[0]?[]:[{i,date:r.date,turn:r.turn,week:r.week,
  original:r.original,outsiders:r.profiles.filter(x=>!r.original.includes(x.family)).map(x=>({family:x.family,shapes:x.geo.shapes,rooted:x.rooted,rank:x.originalRank}))}]);
 assert.equal(list.length,90);
 save('PRE_90.json',{rows:list,weeks:d.weeks,models:MODES});
 save('SELLO.json',{source:SHA,script:digest(read('scripts/lab-vt3-voto-unico-forma.mjs')),protocol:digest(read(P)),pre:digest(read(O+'PRE_90.json'))});
 console.log('VOTO_UNICO_PRE_OK',list.length);
}
function sim(a,b){const bs=new Set(b);const common=a.filter(x=>bs.has(x)).length;return a.length+b.length?common/(a.length+b.length-common):0}
function score(c,bank,mode){
 const forms=uniq(bank.flatMap(x=>x.geo.shapes));
 if(mode==='PRESENCIA_FORMAS')return sim(c.geo.shapes,forms);
 const items=mode==='ORIGINAL_3_EJEMPLOS'?bank.map(x=>x.geo.shapes):
   mode==='FIRMA_CONJUNTO_3'?uniq(bank.map(x=>JSON.stringify(x.geo.shapes.slice().sort()))).map(x=>JSON.parse(x)):
   forms.map(x=>[x]);
 const sorted=items.map(x=>sim(c.geo.shapes,x)).sort((a,b)=>b-a);
 const n=mode==='FORMA_INDIVIDUAL_1'?1:3;
 return sorted.slice(0,n).reduce((s,x)=>s+x,0)/Math.min(n,sorted.length);
}
function third(r,bank,mode){
 assert.ok(bank.length);
 const out=r.profiles.filter(x=>!r.original.includes(x.family));
 out.sort((a,b)=>{const d=score(b,bank,mode)-score(a,bank,mode);
  return Math.abs(d)>1e-10?d:Number(b.rooted)-Number(a.rooted)||(a.originalRank??9999)-(b.originalRank??9999)||a.family.localeCompare(b.family)});
 return out[0].family;
}
const combine=(r,x)=>[...r.original.slice(0,2),x,...r.original.slice(2,9)];
const check=(top,truth)=>({top,top3:top.slice(0,3).some(x=>truth.has(x)),top5:top.slice(0,5).some(x=>truth.has(x)),top10:top.some(x=>truth.has(x))});
function post(){
 const seal=json(O+'SELLO.json');
 for(const [p,h] of [[B+'PRE_115.json',seal.source],['scripts/lab-vt3-voto-unico-forma.mjs',seal.script],[P,seal.protocol],[O+'PRE_90.json',seal.pre]])assert.equal(digest(read(p)),h);
 const data=json(B+'PRE_115.json'),heads=json(H+'POST_115.json').rows,old=json(F+'POST_90.json').rows;
 assert.equal(heads.length,115);assert.equal(old.length,90);
 const goals=heads.map((x,i)=>{assert.equal(key(x),key(data.rows[i]));return new Set(x.targets.map(family))});
 const byOld=new Map(old.map(x=>[key(x),x]));assert.equal(byOld.size,90);
 const records=[];
 for(let w=0;w<data.weeks.length-1;w++){
  const current=data.weeks[w],following=data.weeks[w+1];
  const train=data.rows.flatMap((r,i)=>r.week===current?[i]:[]),test=data.rows.flatMap((r,i)=>r.week===following?[i]:[]);
  assert.equal(test.length,30);
  const memory=json(B+'MEMORIA_SEMANA_'+current+'.json').casebook.flatMap(b=>b.exemplars.map(e=>({...e,date:b.date,i:train.find(j=>key(data.rows[j])===b.date+'|'+b.turn)})));
  assert.ok(memory.length);
  const recent=[];
  for(const i of test){
   const row=data.rows[i],past=recent.flatMap(x=>x.examples);
   const banks={ESTATICA:memory,ONLINE:[...memory,...past]};
   const choices={};
   for(const [kind,bank] of Object.entries(banks)){
    assert.ok(bank.every(x=>x.i<i));
    choices[kind]=Object.fromEntries(MODES.map(m=>[m,combine(row,third(row,bank,m))]));
   }
   const frozen=byOld.get(key(row));assert.ok(frozen);
   assert.deepEqual(choices.ESTATICA.ORIGINAL_3_EJEMPLOS,frozen.methods.ESTATICA_SEMANA_X.top);
   assert.deepEqual(choices.ONLINE.ORIGINAL_3_EJEMPLOS,frozen.methods.ONLINE_ACUMULATIVA.top);
   // Only now read the head of this cut.
   const result=goals[i];
   records.push({i,date:row.date,turn:row.turn,week:following,original:check(row.original,result),
    memorySize:memory.length,addedExampleCount:past.length,
    uniqueStaticForms:uniq(memory.flatMap(x=>x.geo.shapes)).length,
    uniqueOnlineForms:uniq(banks.ONLINE.flatMap(x=>x.geo.shapes)).length,
    methods:Object.fromEntries(Object.entries(choices).map(([label,opts])=>[label,Object.fromEntries(Object.entries(opts).map(([method,top])=>[method,check(top,result)]))]))});
   const examples=row.profiles.filter(p=>result.has(p.family)).map(p=>({i,date:row.date,turn:row.turn,family:p.family,geo:p.geo}));
   recent.push({i,examples});
  }
 }
 assert.equal(records.length,90);
 const stats=rs=>{
  const original={top3:rs.filter(r=>r.original.top3).length,top5:rs.filter(r=>r.original.top5).length,top10:rs.filter(r=>r.original.top10).length};
  return {official:original,...Object.fromEntries(['ESTATICA','ONLINE'].map(kind=>[kind,Object.fromEntries(MODES.map(m=>{
   const v=rs.map(r=>r.methods[kind][m]);
   return [m,{top3:v.filter(x=>x.top3).length,top5:v.filter(x=>x.top5).length,top10:v.filter(x=>x.top10).length,
    gains3:rs.filter(r=>r.methods[kind][m].top3&&!r.original.top3).map(key),
    losses3:rs.filter(r=>!r.methods[kind][m].top3&&r.original.top3).map(key),
    gains10:rs.filter(r=>r.methods[kind][m].top10&&!r.original.top10).map(key),
    losses10:rs.filter(r=>!r.methods[kind][m].top10&&r.original.top10).map(key),
    changedVsOriginalLearner:rs.filter(r=>r.methods[kind][m].top[2]!==r.methods[kind].ORIGINAL_3_EJEMPLOS.top[2]).length}];
  }))]))};
 const all=stats(records);
 assert.deepEqual([all.official.top3,all.official.top10],[3,11]);
 assert.deepEqual([all.ESTATICA.ORIGINAL_3_EJEMPLOS.top3,all.ESTATICA.ORIGINAL_3_EJEMPLOS.top10],[4,12]);
 assert.deepEqual([all.ONLINE.ORIGINAL_3_EJEMPLOS.top3,all.ONLINE.ORIGINAL_3_EJEMPLOS.top10],[4,12]);
 const dates=uniq(records.map(r=>r.date));
 const byWeek=Object.fromEntries(uniq(records.map(r=>r.week)).map(week=>[week,stats(records.filter(r=>r.week===week))]));
 const firstDays=new Set(uniq(records.map(r=>r.week)).map(week=>records.find(r=>r.week===week).date));
 const firstDay=stats(records.filter(r=>firstDays.has(r.date)));
 const signatures={staticAvg:records.reduce((s,r)=>s+r.uniqueStaticForms,0)/90,onlineAvg:records.reduce((s,r)=>s+r.uniqueOnlineForms,0)/90};
 save('POST_90.json',{rows:records});
 save('RESUMEN.json',{date:'2026-10-13',cuts:90,dates:dates.length,all,byWeek,firstDay,signatures,
 seal,oldDecisionSHA:digest(read(F+'POST_90.json')),
 warning:'Histórico ya explorado intensamente. Estas comparaciones no acreditan ventaja predictiva en sorteos aleatorios.'});
 console.log('VOTO_UNICO_POST_OK',JSON.stringify({all,firstDay,byWeek,signatures},null,2));
}
if(process.argv[2]==='pre')pre();else if(process.argv[2]==='post')post();else throw Error('Usar pre/post');