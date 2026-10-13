import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/';
const out='auditorias/vt3-vigencia-fisica-115-13oct2026/';
const protocol='PROTOCOLO_VT3_VIGENCIA_FISICA_13OCT2026.md';
const expectedPre='be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612';
const turns=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const policies=['OFICIAL','NUEVA_1','NUEVA_2','NUEVA_7','ACTIVA_1','ACTIVA_2','ACTIVA_7',
 'MADURA_HOY','NACE_HOY','CAMBIO_ACTUAL','MISMA_RUTA_2','RUTA_RENOVADA_2'];
const read=p=>readFileSync(p,'utf8');
const load=p=>JSON.parse(read(p));
const hash=s=>createHash('sha256').update(s).digest('hex');
const save=(name,obj)=>writeFileSync(out+name,JSON.stringify(obj,null,2)+'\n');
const fam=x=>[x,[...x].reverse().join('')].sort().join('/');
const id=x=>x.date+'|'+x.turn;
const canonical=p=>{const forward=p.cells.join('>'),reverse=[...p.cells].reverse().join('>');
 return p.source+'|'+[forward,reverse].sort()[0]};
mkdirSync(out,{recursive:true});
assert.equal(hash(read(root+'PRE_115.json')),expectedPre);
const headPool=(row)=>new Set(row.strategies.B_INVENTARIO.map(f=>f.family));
const anchorPool=(row)=>new Set(row.strategies.A_ORIGINAL.map(f=>f.family));
const anchorKeys=(row,family)=>{
 const obj=row.witnesses.find(x=>x.family===family);
 return new Set((obj?.paths||[]).filter(x=>x.anchored).map(canonical));
};
const days=[...new Set(load(root+'PRE_115.json').rows.map(x=>x.date))].sort();
assert.equal(days.length,23);
function pre(){
 assert.ok(!existsSync(root+'POST_115.json'),'POST se debe separar antes de PRE');
 assert.ok(!existsSync(root+'NOCTURNA_POST_DIAGNOSTICO.json'),'POST nocturno se debe separar');
 const raw=load(root+'PRE_115.json').rows;
 assert.equal(raw.length,115);
 const map=new Map(raw.map(x=>[id(x),x]));
 assert.equal(map.size,115);
 let nMature=0,nBorn=0,nStatic=0,sameRoute=0,withPast1=0,withPast2=0,withPast7=0;
 let candidatesAll=0,shortIncomplete=0;
 const output=[];
 for(let dayIdx=0;dayIdx<days.length;dayIdx++)for(let ti=0;ti<turns.length;ti++){
  const date=days[dayIdx],turn=turns[ti],row=map.get(date+'|'+turn);
  assert.ok(row,'faltan cortes '+date+turn);
  const priorInDay=ti>0?map.get(date+'|'+turns[ti-1]):null;
  const current=row.strategies.A_ORIGINAL;
  const profiles=current.map((f,i)=>{
   const anchorCurrent=anchorKeys(row,f.family);
   assert.ok(anchorCurrent.size>0);
   const previousWasAnchored=priorInDay?anchorPool(priorInDay).has(f.family):false;
   const previousAnchors=priorInDay?anchorKeys(priorInDay,f.family):new Set();
   const added=[...anchorCurrent].filter(x=>!previousAnchors.has(x));
   const mature=Boolean(ti>0&&previousWasAnchored&&added.length>0);
   const born=Boolean(ti>0&&!previousWasAnchored&&added.length>0);
   const activity={};
   for(const window of [1,2,7]){
    const fullWindow=dayIdx>=window;
    const prevDates=fullWindow?days.slice(dayIdx-window,dayIdx):[];
    const prev=prevDates.map(d=>map.get(d+'|'+turn));
    assert.ok(prev.every(Boolean));
    activity[window]={
     fullWindow,
     familySeenDays:fullWindow?prev.filter(x=>headPool(x).has(f.family)).length:null,
     sameAnchoredRoute:fullWindow?prev.some(x=>{
      const prevKeys=anchorKeys(x,f.family);
      return [...anchorCurrent].some(k=>prevKeys.has(k));
     }):null
    };
   }
   const profile={family:f.family,officialRank:f.rank,originalIndex:i,rootD1:f.d1,rootD7:f.d7,
     currentSources:f.sources,blocks:f.blocks,anchoredPaths:f.anchoredPaths,
     mature,born,staticToday:Boolean(ti>0&&!mature&&!born),
     addedAnchoredPaths:added.length,previousAnchoredPaths:previousAnchors.size,
     activity};
   nMature+=Number(mature);nBorn+=Number(born);nStatic+=Number(profile.staticToday);
   candidatesAll++;if(!activity[7].fullWindow)shortIncomplete++;
   if(activity[1].familySeenDays>0)withPast1++;
   if(activity[2].familySeenDays>0)withPast2++;
   if(activity[7].familySeenDays>0)withPast7++;
   if(activity[2].sameAnchoredRoute)sameRoute++;
   return profile;
  });
  const sortBy=(metric,descending=true,hasFullWindow=true)=>{
   return [...profiles].sort((a,b)=>{
     const av=metric(a),bv=metric(b);
     return (descending?bv-av:av-bv)||a.originalIndex-b.originalIndex;
   }).slice(0,10).map(f=>f.family);
  };
  const ordering={
   OFICIAL:profiles.slice(0,10).map(f=>f.family),
   NUEVA_1:sortBy(f=>Number(f.activity[1].fullWindow&&f.activity[1].familySeenDays===0)),
   NUEVA_2:sortBy(f=>Number(f.activity[2].fullWindow&&f.activity[2].familySeenDays===0)),
   NUEVA_7:sortBy(f=>Number(f.activity[7].fullWindow&&f.activity[7].familySeenDays===0)),
   ACTIVA_1:sortBy(f=>f.activity[1].familySeenDays||0),
   ACTIVA_2:sortBy(f=>f.activity[2].familySeenDays||0),
   ACTIVA_7:sortBy(f=>f.activity[7].familySeenDays||0),
   MADURA_HOY:sortBy(f=>Number(f.mature)),
   NACE_HOY:sortBy(f=>Number(f.born)),
   CAMBIO_ACTUAL:sortBy(f=>f.mature?2:f.born?1:0),
   MISMA_RUTA_2:sortBy(f=>Number(f.activity[2].sameAnchoredRoute===true)),
   RUTA_RENOVADA_2:sortBy(f=>Number(f.activity[2].fullWindow&&!f.activity[2].sameAnchoredRoute))
  };
  const allowed=new Set(current.map(f=>f.family));
  for(const policy of policies){
   const chosen=ordering[policy];assert.equal(chosen.length,10);
   assert.equal(new Set(chosen).size,10);
   for(const f of chosen)assert.ok(allowed.has(f));
  }
  assert.deepEqual(ordering.OFICIAL,current.slice(0,10).map(f=>f.family));
  output.push({date,turn,dayIdx,withinDayPreviousTurn:ti>0?turns[ti-1]:null,
    profiles,rankings:ordering});
 }
 const summary={days:days.length,cuts:115,policies,candidatesAll,nMature,nBorn,nStatic,
  withPast1,withPast2,withPast7,sameRoute,shortIncomplete,first5Dates:days.slice(0,5),
  after5Dates:days.slice(5),after7Dates:days.slice(7)};
 save('PRE_115.json',{summary,rows:output});
 const seal={inputPre:expectedPre,inputModelSha:hash(read('src/motorLalo.ts')),
  protocol:hash(read(protocol)),script:hash(read('scripts/lab-vt3-vigencia-fisica.mjs')),
  generatedPre:hash(read(out+'PRE_115.json'))};
 save('SELLO.json',seal);
 console.log('VIGENCIA_PRE_OK',JSON.stringify({summary,seal},null,2));
}
function post(){
 const seal=load(out+'SELLO.json');
 assert.equal(seal.inputPre,hash(read(root+'PRE_115.json')));
 assert.equal(seal.inputModelSha,hash(read('src/motorLalo.ts')));
 assert.equal(seal.protocol,hash(read(protocol)));
 assert.equal(seal.script,hash(read('scripts/lab-vt3-vigencia-fisica.mjs')));
 assert.equal(seal.generatedPre,hash(read(out+'PRE_115.json')));
 const pre=load(out+'PRE_115.json').rows,post=load(root+'POST_115.json').rows;
 assert.equal(pre.length,115);assert.equal(post.length,115);
 const cases=[];
 const stat=()=>({cuts:0,top3:0,top5:0,top10:0,winningFamiliesInTop10:0});
 const sum=rows=>{
  const scores=Object.fromEntries(policies.map(p=>[p,stat()]));
  const paired=Object.fromEntries(policies.filter(p=>p!=='OFICIAL').map(p=>[p,{gained:[],lost:[],changedFamilies:0}]));
  for(const r of rows){
   for(const p of policies){
    const x=r.results[p],s=scores[p];
    s.cuts++;s.top3+=Number(x.top3);s.top5+=Number(x.top5);s.top10+=Number(x.top10);
    s.winningFamiliesInTop10+=x.hitFamilies.length;
   }
   for(const p of policies.filter(p=>p!=='OFICIAL')){
    if(r.results[p].top10&&!r.results.OFICIAL.top10)paired[p].gained.push(r.date+'|'+r.turn);
    if(!r.results[p].top10&&r.results.OFICIAL.top10)paired[p].lost.push(r.date+'|'+r.turn);
    if(r.results[p].top10Names.join('|')!==r.results.OFICIAL.top10Names.join('|'))paired[p].changedFamilies++;
   }
  }return {scores,paired};
 };
 const status={mature:{exposures:0,winningExposures:0,top10RealExposures:0,top10RealWinning:0},
  born:{exposures:0,winningExposures:0,top10RealExposures:0,top10RealWinning:0},
  static:{exposures:0,winningExposures:0,top10RealExposures:0,top10RealWinning:0}};
 for(let i=0;i<115;i++){
  const cut=pre[i],p=post[i];assert.equal(id(cut),id(p));
  assert.equal(p.targets.length,5);
  const goals=new Set(p.targets.map(h=>{assert.match(h,/^\d{4}$/);return fam(h.slice(-3))}));
  const first10=new Set(cut.rankings.OFICIAL);
  for(const prof of cut.profiles){
   const category=prof.mature?'mature':prof.born?'born':'static';
   const st=status[category],hit=goals.has(prof.family),inTop=first10.has(prof.family);
   st.exposures++;st.winningExposures+=Number(hit);
   st.top10RealExposures+=Number(inTop);
   st.top10RealWinning+=Number(hit&&inTop);
  }
  const results={};
  for(const policy of policies){
   const names=cut.rankings[policy],hits=names.filter(x=>goals.has(x));
   results[policy]={top3:names.slice(0,3).some(x=>goals.has(x)),
    top5:names.slice(0,5).some(x=>goals.has(x)),
    top10:hits.length>0,hitFamilies:hits,top10Names:names};
  }
  cases.push({date:cut.date,turn:cut.turn,dayIdx:cut.dayIdx,results});
 }
 // output scorer assertions
 const all=sum(cases);
 assert.deepEqual([all.scores.OFICIAL.top3,all.scores.OFICIAL.top5,all.scores.OFICIAL.top10],[5,8,15]);
 const splitBy=(fn)=>Object.fromEntries([...new Set(cases.map(fn))].map(name=>[name,sum(cases.filter(x=>fn(x)===name))]));
 const after5=sum(cases.filter(x=>x.dayIdx>=5)),after7=sum(cases.filter(x=>x.dayIdx>=7));
 const results={date:'2026-10-13',days:23,cuts:115,preStats:load(out+'PRE_115.json').summary,
  all,after5,after7,byTurn:splitBy(x=>x.turn),byMonth:splitBy(x=>x.date.slice(0,7)),
  winningStatusInAnchoredPool:status,
  seal,sourcePost:hash(read(root+'POST_115.json')),
  caveat:'Mismo histórico fuertemente reutilizado para diseñar reglas. Comparaciones exploratorias; sin ventaja predictiva confirmada. Familias PRE y caminos físicos inalterados.'};
 save('POST_115.json',{cases});
 save('RESUMEN.json',results);
 console.log('VIGENCIA_POST_OK',JSON.stringify({preStats:results.preStats,
  full:Object.fromEntries(policies.map(x=>[x,results.all.scores[x]])),
  after5:Object.fromEntries(policies.map(x=>[x,results.after5.scores[x].top10])),
  after7:Object.fromEntries(policies.map(x=>[x,results.after7.scores[x].top10])),
  byMonth:Object.fromEntries(Object.entries(results.byMonth).map(([m,v])=>[m,Object.fromEntries(policies.map(x=>[x,v.scores[x].top10]))])),
  byTurn:Object.fromEntries(Object.entries(results.byTurn).map(([m,v])=>[m,Object.fromEntries(policies.map(x=>[x,v.scores[x].top10]))])),
  winningStatus:status},null,2));
}
const mode=process.argv[2];
if(mode==='pre')pre();else if(mode==='post')post();else throw Error('Usar pre o post');
