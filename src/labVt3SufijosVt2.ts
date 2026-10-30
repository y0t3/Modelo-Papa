/**
 * LAB: "VT2 invisibles" dentro de los recorridos físicos del Top10 VT3 de Lalo.
 *
 * buildMotorLalo YA genera VT2 desde segmentos de madres VT3 y luego
 * las reordena; aquí hacemos visible qué subconjunto sale del Top10.
 * PRE no recibe cabezas objetivo. POST exclusivamente en comparePOST.
 *
 * Si VT3 se recorre A→B→C, los sufijos físicos de dos cifras son
 * B→C y, al recorrer la VT3 INVERSA C→B→A, B→A. Son las dos
 * aristas A-B y B-C; no se permite unir A-C con salto.
 */
import {reversibleFamily} from './motorLalo';
import type {LaloView} from './motorLalo';
import type {SourceId} from './sheet';

export type Vt3Edge={
 family:string;value:string;sourceId:SourceId;
 site:string;cells:{row:number;col:number;digit:string}[];
 vt3Mother:string;vt3Rank:number;which:'FINAL_DIRECTA'|'FINAL_INVERSA';
};
export type DerivedVt2={
 family:string;motherRanks:number[];mothers:string[];
 firstParentRank:number;allVt2Rank:number|null;
 edges:Vt3Edge[];uniqueSites:number;physicalSources:number;
 prefixes:string[];notInTopVt2:boolean;
};
export type Vt3AsVt2Preview={
 date:string;turn:string;vt2Top:string[];vt3Top:string[];
 derived:DerivedVt2[];missingFromVt2Top:DerivedVt2[];
 hiddenFamilies:number;allVt2Families:number;
};
const reverse=(s:string)=>[...s].reverse().join('');
const coord=(c:{row:number;col:number})=>c.row+':'+c.col;
const site=(source:string,a:{row:number;col:number},
 b:{row:number;col:number})=>
 source+'|'+[coord(a),coord(b)].sort().join('~');
const adjacent=(a:{row:number;col:number},b:{row:number;col:number})=>
 Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1;
export function vt2InsideVt3PRE(view:LaloView):Vt3AsVt2Preview{
 const top2=view.ranks.vt2.slice(0,10),top3=view.ranks.vt3.slice(0,10);
 const shown2=new Set(top2.map(f=>f.family));
 const rank2=new Map(view.ranks.vt2.map(f=>[f.family,f.rank]));
 const map=new Map<string,Vt3Edge[]>();
 for(const mother of top3)for(const route of mother.paths){
  const p=route.path;
  if(p.length!==3||new Set(p.map(coord)).size!==3||
   !adjacent(p[0],p[1])||!adjacent(p[1],p[2])||
   p.some(c=>!/^[0-9]$/.test(c.digit)))continue;
  const a=p.slice(1,3);
  const b=[...p.slice(0,2)].reverse();
  const candidates=[
   {cells:a,which:'FINAL_DIRECTA' as const},
   {cells:b,which:'FINAL_INVERSA' as const}
  ];
  for(const child of candidates){
   const value=child.cells.map(c=>c.digit).join('');
   const family=reversibleFamily(value);
   const entry:Vt3Edge={family,value,sourceId:route.sourceId,
    site:site(route.sourceId,child.cells[0],child.cells[1]),
    cells:child.cells.map(c=>({row:c.row,col:c.col,digit:c.digit})),
    vt3Mother:mother.family,vt3Rank:mother.rank,which:child.which};
   const list=map.get(family)||[];
   // Una misma arista en ambos sentidos es UNA evidencia física;
   // distintas madres sí quedan como genealogía, no como votos.
   if(!list.some(v=>v.site===entry.site&&v.vt3Mother===entry.vt3Mother))
    list.push(entry);
   map.set(family,list);
  }
 }
 const derived=[...map].map(([family,edges])=>{
  const mothers=[...new Set(edges.map(p=>p.vt3Mother))];
  const motherRanks=[...new Set(edges.map(p=>p.vt3Rank))].sort((a,b)=>a-b);
  return {family,edges,mothers,motherRanks,
   firstParentRank:motherRanks[0],allVt2Rank:rank2.get(family)||null,
   uniqueSites:new Set(edges.map(p=>p.site)).size,
   physicalSources:new Set(edges.map(p=>p.sourceId)).size,
   prefixes:[...new Set(edges.map(e=>e.value))].sort(),
   notInTopVt2:!shown2.has(family)
  } as DerivedVt2;
 }).sort((a,b)=>a.firstParentRank-b.firstParentRank||
  b.physicalSources-a.physicalSources||
  b.uniqueSites-a.uniqueSites||
  a.family.localeCompare(b.family));
 return {date:view.date,turn:view.target,
  vt2Top:top2.map(x=>x.family),vt3Top:top3.map(x=>x.family),
  derived,missingFromVt2Top:derived.filter(x=>x.notInTopVt2),
  hiddenFamilies:derived.filter(x=>x.notInTopVt2).length,
  allVt2Families:view.ranks.vt2.length};
}
export type PostResult={heads:number;top10Wins:number;derivedWins:number;
 extraWins:number;topOnlyWins:number;bothWins:number;neitherWins:number;
 vt3ExactWins:number;topFamilies:number;derivedFamilies:number;
 hiddenFamilies:number;hiddenInsideVt2All:number;
 missingVt2Ranks:number[];
 cases:{jur:string;head:string;vt2:string;vt3:string;
  inTop10:boolean;inDerived:boolean;vt2Rank:number|null;
  fromMotherRanks:number[];vt3FullInTop:boolean}[];
};
export function evaluateEmbeddedVt2POST(pre:Vt3AsVt2Preview,
 heads:{jur:string;head:string}[]):PostResult{
 const shown=new Set(pre.vt2Top),derived=new Map(pre.derived.map(x=>[x.family,x]));
 const top3=new Set(pre.vt3Top);
 const actual=heads.filter(x=>/^\d{4,5}$/.test(x.head));
 const cases=actual.map(x=>{
  const vt2=reversibleFamily(x.head.slice(-2));
  const vt3=reversibleFamily(x.head.slice(-3));
  const d=derived.get(vt2);
  return {jur:x.jur,head:x.head,vt2,vt3,inTop10:shown.has(vt2),
   inDerived:!!d,vt2Rank:d?.allVt2Rank??null,
   fromMotherRanks:d?.motherRanks??[],
   vt3FullInTop:top3.has(vt3)};
 });
 const both=cases.filter(x=>x.inTop10&&x.inDerived).length;
 const extra=cases.filter(x=>!x.inTop10&&x.inDerived).length;
 const topOnly=cases.filter(x=>x.inTop10&&!x.inDerived).length;
 return {heads:cases.length,top10Wins:both+topOnly,
  derivedWins:both+extra,extraWins:extra,
  bothWins:both,topOnlyWins:topOnly,
  neitherWins:cases.length-both-extra-topOnly,
  vt3ExactWins:cases.filter(x=>x.vt3FullInTop).length,
  topFamilies:pre.vt2Top.length,derivedFamilies:pre.derived.length,
  hiddenFamilies:pre.hiddenFamilies,
  hiddenInsideVt2All:pre.missingFromVt2Top.filter(x=>x.allVt2Rank!==null).length,
  missingVt2Ranks:pre.missingFromVt2Top.map(x=>x.allVt2Rank).filter((x):x is number=>x!==null),
  cases};
}
/** Compare EXTRA coverage with same number of non-top10 VT2 families.
 * Baseline is PRE-defined rank 11... (in Lalo's existing order) that
 * do NOT belong to the derived family set; otherwise overlap would
 * make the control artificially favorable to VT3 by construction.
 */
export function equalBudgetPOST(pre:Vt3AsVt2Preview,
 allVt2Families:{family:string;rank:number}[],
 heads:{jur:string;head:string}[],budgets:number[]=[3,5,10,15,20]){
 const top=new Set(pre.vt2Top),hidden=pre.missingFromVt2Top;
 const derivedSet=new Set(pre.derived.map(x=>x.family));
 const control=allVt2Families.filter(x=>
  !top.has(x.family)&&!derivedSet.has(x.family)).sort((a,b)=>a.rank-b.rank);
 const winners=heads.filter(x=>/^\d{4,5}$/.test(x.head))
  .map(x=>reversibleFamily(x.head.slice(-2)));
 return budgets.map(k=>{
  const focus=new Set(hidden.slice(0,k).map(x=>x.family));
  const baseline=new Set(control.slice(0,focus.size).map(x=>x.family));
  return {budget:k,focusSize:focus.size,controlSize:baseline.size,
   hiddenAvailable:hidden.length,controlAvailable:control.length,
   focusHitHeads:winners.filter(f=>focus.has(f)).length,
   controlHitHeads:winners.filter(f=>baseline.has(f)).length,
   focusFamilies:[...focus],controlFamilies:[...baseline],
   focusDistinctHits:new Set(winners.filter(f=>focus.has(f))).size,
   controlDistinctHits:new Set(winners.filter(f=>baseline.has(f))).size};
 });
}
