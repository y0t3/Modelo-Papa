import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const ROOT='auditorias/vt3-cotejo-nocturna-13oct2026/';
const OUT='auditorias/vt3-procedencia-empate-13oct2026/';
const read=n=>JSON.parse(readFileSync(n,'utf8'));
const src=read(ROOT+'INPUT_PRE_13OCT.json').rows[4];
const pre=read(ROOT+'PRE_13OCT.json').rows[4];
assert.equal(src.turn,'Nocturno');
const rev=s=>[...s].reverse().join('');
const family=s=>[s,rev(s)].sort().join('/');
const crd=c=>c.row+':'+c.col;
const cells=v=>v.flatMap((z,r)=>/^\d{2}$/.test(z)?[{row:r,col:0,digit:z[0]},{row:r,col:1,digit:z[1]}]:[]);
const priority=x=>[Number(x.branchBlocks>0),Math.min(x.branchBlocks,15),Math.min(x.d7,10),Math.min(x.d1,10),x.sources,x.physicalBlocks];
const oldSort=[...pre.ranks].sort((a,b)=>{
 const A=priority(a),B=priority(b);
 for(let i=0;i<A.length;i++)if(A[i]!==B[i])return B[i]-A[i];
 return a.family.localeCompare(b.family);
});
const flag=x=>priority(x).join('|');
const tied=oldSort.filter(x=>flag(x)===flag(oldSort[10]));
assert.equal(tied.length,11);
assert.equal(tied[0].family,'037/730');assert.equal(tied[1].family,'234/432');
const keys=new Set(tied.map(x=>x.family));
const projected=[];
for(const hist of src.history)for(const [turn,matches] of Object.entries(hist.sheet.matches)){
 for(const match of matches){
  if(match.jurisdiccion==='Montevideo')continue;
  for(const hit of match.hits.filter(x=>x.kind==='vt3')){
   const source=src.current.columns.find(x=>x.id===hit.sourceId);
   if(!source)continue;
   const oldColumn=hist.sheet.columns.find(x=>x.id===hit.sourceId);
   if(!oldColumn)continue;
   for(const path of hit.paths){
    const v=path.map(c=>c.digit).join('');
    if(v!==hit.value||!match.cabeza.endsWith(hit.value))continue;
    if(path.some(c=>oldColumn.values[c.row]?.[c.col]!==c.digit))continue;
    const delta=path.slice(1).map((c,i)=>[c.row-path[i].row,c.col-path[i].col]);
    const present=cells(source.values);
    const byKey=new Map(present.map(c=>[crd(c),c]));
    for(const start of present){
     const nextPath=[start];
     for(const [dr,dc] of delta){
      const last=nextPath.at(-1);
      const next=byKey.get((last.row+dr)+':'+(last.col+dc));
      if(!next||nextPath.includes(next))break;
      nextPath.push(next);
     }
     if(nextPath.length!==3)continue;
     const digits=nextPath.map(x=>x.digit).join(''),f=family(digits);
     if(!keys.has(f))continue;
     projected.push({family:f,source:hit.sourceId,
      event:{date:hist.date,period:hist.period,turn,jurisdiction:match.jurisdiccion,head:match.cabeza},
      oldValue:hit.value,newValue:digits,
      oldCells:path.map(crd),newCells:nextPath.map(crd),
      shift:{row:start.row-path[0].row,col:start.col-path[0].col},
      moves:delta.map(x=>x.join(':')).join('>')});
    }
   }
  }
 }
}
const profiles=tied.map(x=>({family:x.family,officialRank:x.rank,d7FirstRank:oldSort.indexOf(x)+1,
 priority:priority(x),transfers:projected.filter(z=>z.family===x.family)}));
const eventKey=x=>[x.date,x.period,x.turn,x.jurisdiction,x.head].join('|');
const rootKey=x=>eventKey(x.event)+'|'+x.source+'|'+x.oldCells.join('>');
const groups=[];
for(const k of [...new Set(projected.map(x=>eventKey(x.event)))]){
 const entries=projected.filter(x=>eventKey(x.event)===k);
 groups.push({historicalWinner:k,families:[...new Set(entries.map(x=>x.family))].sort(),
  distinctOldPhysicalRoots:new Set(entries.map(rootKey)).size,
  shapes:[...new Set(entries.map(x=>x.oldCells.join('>')))].sort()});
}
groups.sort((a,b)=>b.families.length-a.families.length||a.historicalWinner.localeCompare(b.historicalWinner));
assert.equal(groups.length,4);
assert.deepEqual(groups.map(x=>x.families.length),[5,2,2,2]);
assert.equal(groups.reduce((s,g)=>s+g.distinctOldPhysicalRoots,0),6);
const focus=profiles.find(x=>x.family==='234/432');
assert.equal(focus.transfers.length,1);
const siblings=projected.filter(x=>x.family!==focus.family&&rootKey(x)===rootKey(focus.transfers[0]));
assert.deepEqual(siblings.map(x=>x.family),['768/867']);
mkdirSync(OUT,{recursive:true});
const result={date:'2026-10-13',turn:'Nocturno',status:'RETROSPECTIVO',families:profiles,
 events:groups,totals:{tiedFamilies:tied.length,winnerEvents:groups.length,
  rootPaths:groups.reduce((s,x)=>s+x.distinctOldPhysicalRoots,0),
  sameExactRootAs234:siblings.map(x=>x.family)},sourceDocuments:[
 ROOT+'INPUT_PRE_13OCT.json',ROOT+'PRE_13OCT.json']};
writeFileSync(OUT+'INVENTARIO_PRE_RECONSTRUIDO.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.totals));
