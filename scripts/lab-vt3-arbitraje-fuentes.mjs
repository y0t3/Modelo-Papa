import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const src='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const dst='auditorias/vt3-arbitraje-fuentes-115-13oct2026/';
const protocol='PROTOCOLO_VT3_ARBITRAJE_FUENTES_13OCT2026.md';
const expected='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const turns=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const latest=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const policies=['A_OFICIAL','B_FUENTE_NUEVA','C_NOCTURNA_ANTERIOR_AL_FINAL','D_PERSISTENTE','E_NACIENTE'];
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const save=(p,x)=>writeFileSync(dst+p,JSON.stringify(x,null,2)+'\n');
const family=x=>[x,[...x].reverse().join('')].sort().join('/');
const key=x=>x.date+'|'+x.turn;
mkdirSync(dst,{recursive:true});
assert.equal(sha(read(src+'PRE_115.json')),expected);
function pre(){
 assert.ok(!existsSync(src+'POST_115.json'),'POST presente: separar antes del PRE');
 assert.ok(!existsSync(src+'NOCTURNA_POST_DIAGNOSTICO.json'),'POST nocturno presente');
 const input=json(src+'PRE_115.json').rows;assert.equal(input.length,115);
 const byKey=new Map(input.map(row=>[key(row),row]));
 const out=input.map(row=>{
  const turnIdx=turns.indexOf(row.turn);assert.ok(turnIdx>=0);
  const previous=turnIdx?byKey.get(row.date+'|'+turns[turnIdx-1]):undefined;
  if(turnIdx)assert.ok(previous);
  const previousTop=new Set(previous?.strategies.A_ORIGINAL.slice(0,10).map(f=>f.family)||[]);
  const candidatePaths=new Map(row.witnesses.map(x=>[x.family,x.paths]));
  const official=row.strategies.A_ORIGINAL;
  const annotated=official.map(f=>{
   const paths=candidatePaths.get(f.family);
   assert.ok(paths?.length,'Falta testigo '+f.family);
   const own=[...new Set(paths.filter(p=>p.anchored).map(p=>p.source))];
   assert.ok(own.length,'La familia original no tiene anclaje '+f.family);
   return {family:f.family,originalRank:f.rank,ownSources:own,latestOwn:own.includes(latest[turnIdx]),
     anyIntradayOwn:own.some(s=>s!=='prevNocturno'),
     persistedPrevious:previousTop.has(f.family)};
  });
  const ranked={
   A_OFICIAL:[...annotated],
   B_FUENTE_NUEVA:[...annotated].sort((a,b)=>Number(b.latestOwn)-Number(a.latestOwn)||a.originalRank-b.originalRank),
   C_NOCTURNA_ANTERIOR_AL_FINAL:[...annotated].sort((a,b)=>Number(b.anyIntradayOwn)-Number(a.anyIntradayOwn)||a.originalRank-b.originalRank),
   D_PERSISTENTE:[...annotated].sort((a,b)=>Number(b.persistedPrevious)-Number(a.persistedPrevious)||a.originalRank-b.originalRank),
   E_NACIENTE:[...annotated].sort((a,b)=>Number(a.persistedPrevious)-Number(b.persistedPrevious)||a.originalRank-b.originalRank)
  };
  for(const p of policies){assert.equal(ranked[p].length,official.length);assert.equal(new Set(ranked[p].map(x=>x.family)).size,official.length);
   assert.deepEqual(new Set(ranked[p].map(x=>x.family)),new Set(official.map(x=>x.family)));}
  assert.deepEqual(ranked.A_OFICIAL.map(x=>x.family),official.map(x=>x.family));
  return {date:row.date,turn:row.turn,latestAvailableSource:latest[turnIdx],
   nCandidates:official.length,profiles:annotated,
   rankings:Object.fromEntries(policies.map(p=>[p,ranked[p].slice(0,10)]))};
 });
 save('PRE_115.json',{days:23,cuts:115,policyDescriptions:policies,rows:out});
 save('SELLO.json',{sourcePre:expected,protocol:sha(read(protocol)),
  code:sha(read('scripts/lab-vt3-arbitraje-fuentes.mjs')),pre:sha(read(dst+'PRE_115.json'))});
 console.log('ARBITRAJE_PRE_115_OK',read(dst+'SELLO.json'));
}
function post(){
 const seal=json(dst+'SELLO.json');
 assert.equal(seal.sourcePre,sha(read(src+'PRE_115.json')));
 assert.equal(seal.protocol,sha(read(protocol)));
 assert.equal(seal.code,sha(read('scripts/lab-vt3-arbitraje-fuentes.mjs')));
 assert.equal(seal.pre,sha(read(dst+'PRE_115.json')));
 const pre=json(dst+'PRE_115.json').rows,origPost=json(src+'POST_115.json').rows;
 assert.equal(pre.length,115);assert.equal(origPost.length,115);
 const scores={},byTurn={},byMonth={},paired={},details=[];
 function stat(){return {cuts:0,top3:0,top5:0,top10:0,winningExposures:0};}
 for(const p of policies){scores[p]=stat();paired[p]={gained:[],lost:[]};}
 for(const turn of turns)byTurn[turn]=Object.fromEntries(policies.map(p=>[p,stat()]));
 for(const month of ['2026-09','2026-10'])byMonth[month]=Object.fromEntries(policies.map(p=>[p,stat()]));
 for(let i=0;i<115;i++){
  const r=pre[i],post=origPost[i];
  assert.equal(key(r),key(post));
  const target=new Set(post.targets.map(h=>{assert.match(h,/^\d{4}$/);return family(h.slice(-3))}));
  const result={date:r.date,turn:r.turn,target:post.targets,policy:{}};
  for(const p of policies){
   const list=r.rankings[p];assert.equal(list.length,10);
   const hit=list.filter(x=>target.has(x.family));
   result.policy[p]={hitFamilies:hit.map(x=>({family:x.family,rank:list.indexOf(x)+1,
    originalRank:x.originalRank,ownSources:x.ownSources})),
    top3:hit.some(x=>list.indexOf(x)<3),top5:hit.some(x=>list.indexOf(x)<5),top10:Boolean(hit.length),
    top10Families:list.map(x=>x.family)};
   for(const statObj of [scores[p],byTurn[r.turn][p],byMonth[r.date.slice(0,7)][p]]){
    statObj.cuts++;statObj.top3+=Number(result.policy[p].top3);statObj.top5+=Number(result.policy[p].top5);
    statObj.top10+=Number(result.policy[p].top10);statObj.winningExposures+=hit.length;
   }
  }
  for(const p of policies.slice(1)){
   if(result.policy[p].top10&&!result.policy.A_OFICIAL.top10)paired[p].gained.push(key(r));
   if(!result.policy[p].top10&&result.policy.A_OFICIAL.top10)paired[p].lost.push(key(r));
  }
  details.push(result);
 }
 assert.deepEqual([scores.A_OFICIAL.top3,scores.A_OFICIAL.top5,scores.A_OFICIAL.top10],[5,8,15]);
 assert.equal(Object.values(byTurn).reduce((n,x)=>n+x.Matutino?.top10||0,0),0);
 const summary={cuts:115,days:23,date:'2026-10-13',
  scores,byTurn,byMonth,paired,
  hashes:{sourcePre:expected,sourcePost:sha(read(src+'POST_115.json')),
   seal},
  warning:'Ensayo diseñado tras detectar desigualdad de resultados por turno. El histórico ya fue usado para ajustar varios motores y no es confirmación prospectiva. No cambiar el Top o apostar sobre esta prueba.'};
 save('POST_115.json',{rows:details});
 save('RESUMEN.json',summary);
 console.log('ARBITRAJE_POST_115_OK',JSON.stringify({scores,byTurn,paired},null,2));
}
const mode=process.argv[2];if(mode==='pre')pre();else if(mode==='post')post();else throw Error('Usar pre o post');
