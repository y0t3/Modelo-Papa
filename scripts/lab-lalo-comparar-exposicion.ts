/**
 * Control comparativo de exposición, con igualdad de cortes.
 * No presupone pagos ni rentabilidad; mide cabezas ganadoras por
 * terminaciones apostadas. La suma de aciertos VT2 VT3 VT4 se informa
 * aparte de la cantidad de cabezas distintas cubiertas.
 */
import {readFileSync,writeFileSync} from 'node:fs';
type Kind=2|3|4;
type Mode='AUX_RAICES'|'AUX_GEOMETRIA'|'AUX_ALEATORIO'|'LALO_MV1';
type R={family:string;values:string[]};
type Cut={year:string;date:string;turn:string;
 heads:{jur:string;head:string}[];
 ranks:Record<Kind,Record<Mode,R[]>>;
 outcomes:Record<Kind,Record<Mode,{hits:Record<string,number>;
  expectedUniform:Record<string,number>;rawSelections:Record<string,number>}>>;
};
const MODES:Mode[]=['AUX_RAICES','AUX_GEOMETRIA','AUX_ALEATORIO','LALO_MV1'];
const KINDS:Kind[]=[2,3,4];
const all:Cut[]=['2024','2025','2026'].flatMap(y=>{
 const x=JSON.parse(readFileSync('lab-results/lalo-triple-modalidad-'+y+'.json','utf-8'));
 return x.cuts as Cut[];
});
const elig=all.filter(c=>c.turn!=='Previa');
const selected=(c:Cut,kind:Kind,mode:Mode,k:number)=>
 new Set(c.ranks[kind][mode].slice(0,k).flatMap(f=>f.values));
const cells=(c:Cut,kind:Kind,mode:Mode,k:number)=>{
 const set=selected(c,kind,mode,k);
 return {hits:c.heads.filter(h=>set.has(h.head.slice(-kind))).length,
  raw:set.size,exp:c.heads.length*set.size/(10**kind)};
};
const flat=(rows:Cut[],kind:Kind,mode:Mode,k:number)=>{
 const vals=rows.map(c=>cells(c,kind,mode,k));
 return {winningHeads:vals.reduce((n,x)=>n+x.hits,0),
  rawBets:vals.reduce((n,x)=>n+x.raw,0),
  uniformExpected:Number(vals.reduce((n,x)=>n+x.exp,0).toFixed(3)),
  per100RawBets:Number((100*vals.reduce((n,x)=>n+x.hits,0)/
   Math.max(1,vals.reduce((n,x)=>n+x.raw,0))).toFixed(3)),
  activeCuts:vals.filter(x=>x.raw>0).length};
};
type Merge='LALO'|'AUX'|'INTERSECCION'|'UNION';
function merged(c:Cut,kind:Kind,kindMerge:Merge,k:number){
 const a=selected(c,kind,'AUX_RAICES',k),l=selected(c,kind,'LALO_MV1',k);
 if(kindMerge==='LALO')return l;
 if(kindMerge==='AUX')return a;
 if(kindMerge==='UNION')return new Set([...a,...l]);
 return new Set([...l].filter(x=>a.has(x)));
}
function combined(c:Cut,merge:Merge,k:number){
 const perKind=KINDS.map(kind=>merged(c,kind,merge,k));
 const uniqueHits=c.heads.filter(h=>KINDS.some((kind,i)=>perKind[i].has(
  h.head.slice(-kind)))).length;
 const prizeOccurrences=c.heads.reduce((n,h)=>n+KINDS.filter((kind,i)=>
  perKind[i].has(h.head.slice(-kind))).length,0);
 const selections=perKind.map(x=>x.size);
 return {uniqueHits,prizeOccurrences,rawBets:selections.reduce((a,b)=>a+b,0),
  betsByKind:selections};
}
function aggregate(rows:Cut[],k:number){
 const allReports=Object.fromEntries((['LALO','AUX','INTERSECCION','UNION'] as Merge[])
  .map(method=>{
   const arr=rows.map(c=>combined(c,method,k));
   return [method,{
    distinctWinningHeads:arr.reduce((a,x)=>a+x.uniqueHits,0),
    prizeOccurrencesAcrossKinds:arr.reduce((a,x)=>a+x.prizeOccurrences,0),
    rawBets:arr.reduce((a,x)=>a+x.rawBets,0),
    rawBetsByKind:KINDS.map((_,i)=>arr.reduce((a,x)=>a+x.betsByKind[i],0)),
    exposurePerCut:Number((arr.reduce((a,x)=>a+x.rawBets,0)/Math.max(1,arr.length))
     .toFixed(2))
   }];
  }));
 return {maxFamiliesPerKind:k,methods:allReports};
}
const byYear=['2024','2025','2026'].map(year=>{
 const allYear=all.filter(c=>c.year===year),comparable=elig.filter(c=>c.year===year);
 return {year,allCuts:allYear.length,comparableCuts:comparable.length,
  comparableHeads:comparable.reduce((a,c)=>a+c.heads.length,0),
  byKind:Object.fromEntries(KINDS.map(kind=>['vt'+kind,Object.fromEntries(
   MODES.map(method=>[method,{
    top3:flat(comparable,kind,method,3),
    top5:flat(comparable,kind,method,5)
   }]))])),
  combinedTop3:aggregate(comparable,3),
  combinedTop5:aggregate(comparable,5)};
});
const results={goal:'Poner VT2, VT3 y VT4 al mismo nivel, comparar con igual horario y exposición',
 periods:'Agosto a 20 de octubre 2024, 2025, 2026; última actualización 21oct2026',
 principle:'TopK es número de familias; terminaciones apostables y exposiciones se cuentan separadas',
 caveat:'No hay probabilidades confirmadas ni PnL sin tablas de pagos, reglas de apuesta y montos',
 byYear};
console.log('TRIPLE_COMPARACION',JSON.stringify(results));
writeFileSync('lab-results/lalo-triple-comparacion.json',JSON.stringify(results,null,2));
