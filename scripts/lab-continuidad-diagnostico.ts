/**
 * Auditoría posterior al replay ANCLADO, antes de discutir mejoras.
 * Concentración de hits y comparación pareada POR DÍA con MV1 y nulos.
 * Bootstrap exploratorio: previamente se probaron múltiples enfoques.
 */
import {readFileSync,writeFileSync} from 'node:fs';
type Kind=2|3|4;
type M={hit3:number;hit5:number;expected3:number;expected5:number;
 raw3:number;raw5:number};
type Case={jur:string;head:string;hitAnchored:boolean;hitLalo:boolean;
 rootFamilies:{family:string;roots:number;d1:number;d7:number;sampleRoots:string[]}[]};
type Cut={date:string;turn:string;heads:{jur:string;head:string}[];
 byLength:Record<Kind,{methods:{ANCLADO:M;LALO:M;GEOMETRIA:M};
  nulls:M[];anchored:{candidates:number;roots:number;fallback:number};
  winningHeads:Case[]}>};
const years=['2024','2025','2026'];
const kinds:Kind[]=[2,3,4];
let state=0xa8713bbf;
const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
 return (state>>>0)/4294967296};
const report:any={diagnostic:'concentración temporal y comparaciones parejas',
 bootstrapUnit:'jornada completa, cortes del mismo día juntos',
 bootstrapReps:2999,years:[]};
for(const year of years){
 const raw=JSON.parse(readFileSync('lab-results/continuidad-posicional-'+year+'.json','utf8'));
 const cuts=raw.cuts as Cut[];
 const period:any={year,modalities:[]};
 for(const kind of kinds){
  const keys=['hit3','hit5'] as const;
  const detail:any={kind,byMetric:[],anchorHitCases:[]};
  for(const key of keys){
   const adjusted=key==='hit3'?'expected3':'expected5';
   const dates=[...new Set(cuts.map(c=>c.date))];
   const dayBlocks=dates.map(date=>{
    const xs=cuts.filter(c=>c.date===date);
    const anchor=xs.reduce((n,c)=>n+c.byLength[kind].methods.ANCLADO[key],0);
    const official=xs.reduce((n,c)=>n+c.byLength[kind].methods.LALO[key],0);
    const expectation=xs.reduce((n,c)=>n+c.byLength[kind].methods.ANCLADO[adjusted],0);
    const officialExpectation=xs.reduce((n,c)=>n+c.byLength[kind].methods.LALO[adjusted],0);
    const number=xs[0]?.byLength[kind].nulls.length||0;
    const nullHits=Array.from({length:number},(_,seed)=>
     xs.reduce((n,c)=>n+c.byLength[kind].nulls[seed][key],0));
    const nullExp=Array.from({length:number},(_,seed)=>
     xs.reduce((n,c)=>n+c.byLength[kind].nulls[seed][adjusted],0));
    return {date,anchor,official,expectation,officialExpectation,
     nullHits,nullExp};
   });
   const totalAnchor=dayBlocks.reduce((n,c)=>n+c.anchor,0);
   const totalOfficial=dayBlocks.reduce((n,c)=>n+c.official,0);
   const nulls=dayBlocks[0]?.nullHits.map((_,i)=>({
    hits:dayBlocks.reduce((n,c)=>n+c.nullHits[i],0),
    expected:dayBlocks.reduce((n,c)=>n+c.nullExp[i],0)
   }))||[];
   const n=totalAnchor-dayBlocks.reduce((n,c)=>n+c.expectation,0);
   const nOff=totalOfficial-dayBlocks.reduce((n,c)=>n+c.officialExpectation,0);
   const diffAgainstNull=n-(nulls.reduce((n,x)=>n+x.hits-x.expected,0)/
    Math.max(1,nulls.length));
   const deltasOfficial=dayBlocks.map(x=>(x.anchor-x.expectation)-
    (x.official-x.officialExpectation));
   const deltasControl=dayBlocks.map(x=>(x.anchor-x.expectation)-
    x.nullHits.reduce((n,h,i)=>n+h-x.nullExp[i],0)/Math.max(1,x.nullHits.length));
   const paired=(values:number[])=>{
    const samples:number[]=[];
    for(let i=0;i<2999;i++){
     let total=0;for(let j=0;j<values.length;j++)
      total+=values[Math.floor(rand()*values.length)];
     samples.push(total);
    }
    samples.sort((a,b)=>a-b);
    return [Number(samples[Math.floor(samples.length*.025)].toFixed(3)),
     Number(samples[Math.floor(samples.length*.975)].toFixed(3))];
   };
   const actualDiff=Number((n-nOff).toFixed(3));
   const nullRange=[Math.min(...nulls.map(x=>x.hits)),
    Math.max(...nulls.map(x=>x.hits))];
   const topNull=Number((nulls.filter(x=>x.hits-x.expected>=n).length+1)/
    (nulls.length+1));
   detail.byMetric.push({metric:key,anchor:totalAnchor,
    lalo:totalOfficial,anchorExpected:Number(dayBlocks.reduce(
     (n,c)=>n+c.expectation,0).toFixed(3)),
    nullHitsMean:Number((nulls.reduce((n,x)=>n+x.hits,0)/
     Math.max(1,nulls.length)).toFixed(3)),
    nullHitsRange:nullRange,
    fractionNullsAtLeastObserved:Number(topNull.toFixed(4)),
    daysWithAnyAnchorHits:dayBlocks.filter(x=>x.anchor>0).length,
    maxHitsSameDay:Math.max(...dayBlocks.map(x=>x.anchor)),
    anchoredMinusLaloExposureAdjusted:actualDiff,
    dayBootstrapCI95vsLalo:paired(deltasOfficial),
    anchoredMinusAverageNullExposureAdjusted:Number(diffAgainstNull.toFixed(3)),
    dayBootstrapCI95vsNull:paired(deltasControl)
   });
  }
  for(const c of cuts){
   for(const head of c.byLength[kind].winningHeads){
    if(!head.hitAnchored)continue;
    detail.anchorHitCases.push({date:c.date,turn:c.turn,jur:head.jur,
     head:head.head,laloAlso:head.hitLalo,
     evidence:head.rootFamilies.map(f=>({
      family:f.family,roots:f.roots,d1:f.d1,d7:f.d7,
      sourceEvents:f.sampleRoots
     }))});
   }
  }
  period.modalities.push(detail);
 }
 report.years.push(period);
 console.log('ANCLA_DIAGNOSTICO',JSON.stringify({
  year,modalities:period.modalities.map((m:any)=>({
   kind:m.kind,metrics:m.byMetric,
   top3Cases:m.anchorHitCases.slice(0,25)
  }))
 }).slice(0,25000));
}
writeFileSync('lab-results/continuidad-diagnostico-tres-anios.json',
 JSON.stringify(report,null,2));
