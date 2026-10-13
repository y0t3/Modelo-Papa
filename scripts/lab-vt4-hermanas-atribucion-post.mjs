import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const DIR='auditorias/vt4-hermanas-geometricas-115-13oct2026/';
const read=p=>readFileSync(p,'utf8'),j=p=>JSON.parse(read(p));
const sha=x=>createHash('sha256').update(x).digest('hex');
const output=DIR+'ANALISIS_HERMANAS_GANADORAS.json';
const raw=j(DIR+'PRE_115.json');
const seal=j(DIR+'SELLO.json');
assert.equal(sha(read(DIR+'PRE_115.json')),seal.pre);
const post=j('auditorias/vt4-diversidad-madres-top10-115-13oct2026/OBJETIVOS_POST_115.json');
const report=j(DIR+'RESUMEN.json');
const cases=[];
for(const [i,r] of raw.rows.entries()){
 const heads=post.rows[i].heads;
 const winners=r.physicalGroups.filter(g=>g.motherRank<=5&&g.values.some(x=>heads.includes(x)));
 if(!winners.length)continue;
 const base=r.options.BASE_CUPO2.top10;
 const one={date:r.date,turn:r.turn,heads,fullMotherInventory:r.topMothers,
  winners:winners.map(g=>{
   const sisters=r.physicalGroups.filter(x=>x.mother===g.mother).sort((a,b)=>a.rank-b.rank);
   const order=sisters.findIndex(x=>x.id===g.id)+1;
   const selected=base.filter(x=>x.mother===g.mother);
   const comparison=selected.map(b=>{
    const s=sisters.find(x=>x.rank===b.rank);
    assert.ok(s);
    return {family:s.family,rank:s.rank,readableValues:s.values,
     sources:s.sources,blocks:s.blocks,paths:s.paths,shapes:s.shapeCount,
     fractionUnique:s.fractionUnique,physicalEvidence:s.witnesses,
     actualWinner:heads.some(h=>s.values.includes(h))};
   });
   const actualInBase=selected.some(b=>b.rank===g.rank);
   return {headMatched:g.values.filter(x=>heads.includes(x)),family:g.family,
    mother:g.mother,motherRank:g.motherRank,
    actualInBase,originalVt4Rank:g.rank,siblingRankByOriginalOrder:order,
    siblingsCompeting:sisters.length,
    own:{values:g.values,sourceCount:g.sources,blocks:g.blocks,paths:g.paths,uniqueShapes:g.shapeCount,
     fractionUnique:g.fractionUnique,physicalEvidence:g.witnesses},
    siblingsSelectedInCurrentTop10:comparison
   };
  })};
 cases.push(one);
}
assert.equal(cases.length,6);
assert.equal(cases.flatMap(x=>x.winners).length,7);
const present=cases.flatMap(x=>x.winners).filter(x=>!x.actualInBase);
assert.equal(present.length,3);
const day=j('auditorias/vt4-admision-madres-115-13oct2026/13OCT_POST.json');
const first=day.cases.find(x=>x.turn==='Primera');
const mother=first.focus.rootedMatches.find(x=>x.mother==='485/584');
assert.ok(mother);
const top=first.policies.TOP10_CUPO2.top10;
const analysis={date:'2026-10-13',cuts:115,
 comparisonMadeAfterDraw:true,
 uniqueCutsWithPhysicallyReachableFourByFiveMothers:cases.length,
 physicalWinningGroupExposures:7,
 baseSelectedWinningGroupExposures:7-present.length,
 rejectedWinningGroupExposures:present.length,
 missedAmongPhysicallyReachable:present.map(x=>({head:x.headMatched[0],family:x.family,mother:x.mother,
  motherRank:x.motherRank,siblingRank:x.siblingRankByOriginalOrder,
  paths:x.own.paths,shapes:x.own.uniqueShapes,
  selectedSisters:x.siblingsSelectedInCurrentTop10.map(z=>({family:z.family,rank:z.rank,paths:z.paths,
    blocks:z.blocks,sources:z.sources,shapes:z.shapes,actualWinner:z.actualWinner}))})),
 cases,
 firstOct13:{head:'5485',mother:'485/584',motherRank:5,
 actualRootedGroup:mother,
 sistersSelectedForMotherRank5:top.filter(x=>x.startsWith('485')||x.startsWith('584')),
 explanation:'Post hoc case, not one of 115 historical cuts. No policy was adapted to favor 5485.'},
 caution:'Explanations of winning siblings are POST attribution, not predictions; target labels never used to rank groups in PRE.'};
mkdirSync(DIR,{recursive:true});
writeFileSync(output,JSON.stringify(analysis,null,2)+'\n');
console.log('VT4_HERMANAS_ATRIBUCION_OK',JSON.stringify({
  opportunities:cases.length,winningGroups:7,missed:analysis.missedAmongPhysicallyReachable,
  oct13:analysis.firstOct13
},null,2));
