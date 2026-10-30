/**
 * Laboratorio de PUESTOS VT3 de Lalo mirando EXCLUSIVAMENTE sus dos
 * terminaciones exactas VT2. PRE: sólo top VT2/VT3; POST: heads.
 *
 * Criterio de puesto importante: cada cabeza se cuenta como ÚNICA
 * para la unión de 10 puestos; puede figurar en varios puestos al
 * estudiar el puesto individual, pero se informa el solapamiento.
 */
export type PositionCut={
 date:string;turn:string;
 top2:string[];
 rows:{rank:number;tails:string[]}[];
 heads:{jur:string;head:string}[];
};
export type PositionDay={
 date:string;turn:string;rank:number;
 distinct:number;newDistinct:number;
 hits:number;incrementalHits:number;uniqueHits:number;
 hit:boolean;incremental:boolean;
};
export type RankPeriod={
 rank:number;cuts:number;exposures:number;outsideExposures:number;
 hitDays:number;hitHeads:number;
 incrementalDays:number;incrementalHeads:number;
 uniqueHeads:number;maxConsecutiveIncremental:number;
 perExposure:number;perOutsideExposure:number|null;
};
export type AlertResult={criterion:string;window:number;minimum:number;
 alerts:number;hitsAfterAlert:number;withoutAlert:number;
 hitsWithoutAlert:number;byRank:Record<number,{alerts:number;wins:number}>;
 };
export function positionDays(cuts:readonly PositionCut[]):PositionDay[]{
 const out:PositionDay[]=[];
 const seen=new Set<string>();
 for(const c of cuts){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(c.date))throw Error('Fecha inválida');
  const top=new Set(c.top2);
  const valid=c.heads.filter(h=>/^\d{4,5}$/.test(h.head));
  const present=new Set(c.rows.map(x=>x.rank));
  if(present.size!==c.rows.length)throw Error('Puesto duplicado');
  for(const row of c.rows){
   if(row.rank<1||row.rank>10||row.tails.some(s=>!/^[0-9]{2}$/.test(s)))
    throw Error('Lectura VT2 inválida');
   const id=c.date+'|'+c.turn+'|'+row.rank;
   if(seen.has(id))throw Error('Observación repetida '+id);
   seen.add(id);
   const tails=new Set(row.tails),novel=new Set([...tails].filter(t=>!top.has(t)));
   const other=new Set(c.rows.filter(r=>r.rank!==row.rank).flatMap(r=>r.tails));
   const unique=new Set([...novel].filter(t=>!other.has(t)));
   const hits=valid.filter(h=>tails.has(h.head.slice(-2))).length;
   const incrementalHits=valid.filter(h=>novel.has(h.head.slice(-2))).length;
   const uniqueHits=valid.filter(h=>unique.has(h.head.slice(-2))).length;
   out.push({date:c.date,turn:c.turn,rank:row.rank,
    distinct:tails.size,newDistinct:novel.size,
    hits,incrementalHits,uniqueHits,hit:hits>0,
    incremental:incrementalHits>0});
  }
 }
 return out.sort((a,b)=>a.date.localeCompare(b.date)||
  a.turn.localeCompare(b.turn)||a.rank-b.rank);
}
export function rankSummary(rows:readonly PositionDay[]):RankPeriod[]{
 const ret:RankPeriod[]=[];
 for(let rank=1;rank<=10;rank++){
  const arr=rows.filter(x=>x.rank===rank).sort((a,b)=>a.date.localeCompare(b.date));
  let streak=0,max=0;
  for(const x of arr){streak=x.incremental?streak+1:0;max=Math.max(max,streak);}
  const sum=(fn:(x:PositionDay)=>number)=>arr.reduce((n,x)=>n+fn(x),0);
  const exp=sum(x=>x.distinct),newExp=sum(x=>x.newDistinct);
  ret.push({rank,cuts:arr.length,exposures:exp,outsideExposures:newExp,
   hitDays:sum(x=>Number(x.hit)),hitHeads:sum(x=>x.hits),
   incrementalDays:sum(x=>Number(x.incremental)),
   incrementalHeads:sum(x=>x.incrementalHits),
   uniqueHeads:sum(x=>x.uniqueHits),
   maxConsecutiveIncremental:max,
   perExposure:exp?sum(x=>x.hits)/exp:0,
   perOutsideExposure:newExp?sum(x=>x.incrementalHits)/newExp:null
  });
 }
 return ret;
}
export function alertSummary(rows:readonly PositionDay[],
 window:number,minimum:number):AlertResult{
 if(window<2||minimum>window||minimum<1)throw Error('Ventana inválida');
 const byRank:Record<number,{alerts:number;wins:number}>={};
 let alerts=0,hitsAfterAlert=0,withoutAlert=0,hitsWithoutAlert=0;
 for(let rank=1;rank<=10;rank++){
  const group=rows.filter(x=>x.rank===rank)
   .sort((a,b)=>a.date.localeCompare(b.date));
  byRank[rank]={alerts:0,wins:0};
  for(let i=window;i<group.length;i++){
   const current=group[i],prior=group.slice(i-window,i);
   if(!current.newDistinct)continue;
   const isAlert=prior.filter(x=>x.incremental).length>=minimum;
   if(isAlert){
    alerts++;byRank[rank].alerts++;
    if(current.incremental){hitsAfterAlert++;byRank[rank].wins++;}
   }else{
    withoutAlert++;hitsWithoutAlert+=Number(current.incremental);
   }
  }
 }
 return {criterion:minimum+' de '+window,window,minimum,
  alerts,hitsAfterAlert,withoutAlert,hitsWithoutAlert,byRank};
}
export function periodProfile(cuts:readonly PositionCut[]){
 const days=positionDays(cuts),turns=[...new Set(cuts.map(x=>x.turn))];
 const study=(rows:PositionDay[])=>({
  ranking:rankSummary(rows),
  alerts:[alertSummary(rows,3,2),alertSummary(rows,5,2)],
  exposures:rows.reduce((n,x)=>n+x.newDistinct,0),
  incrementalHeadsByPosition:rows.reduce((n,x)=>n+x.incrementalHits,0),
  uniqueHeadsByPosition:rows.reduce((n,x)=>n+x.uniqueHits,0)
 });
 return {all:study(days),
  byTurn:Object.fromEntries(turns.map(turn=>
   [turn,study(days.filter(x=>x.turn===turn))])),
  byMonth:Object.fromEntries([...new Set(cuts.map(x=>x.date.slice(0,7)))].sort()
   .map(month=>[month,study(days.filter(x=>x.date.startsWith(month)))])),
  perTurnByMonth:Object.fromEntries(turns.map(turn=>
   [turn,Object.fromEntries([...new Set(cuts.map(x=>x.date.slice(0,7)))].sort()
    .map(month=>[month,study(days.filter(x=>x.turn===turn&&x.date.startsWith(month)))]))]))
 };
}
export function fixedWinnerTrainTest(cuts:readonly PositionCut[],splitDate:string){
 const pre=periodProfile(cuts.filter(c=>c.date<splitDate));
 const post=periodProfile(cuts.filter(c=>c.date>=splitDate));
 const comparison=Object.fromEntries(Object.entries(pre.byTurn).map(([turn,b])=>{
  const ranked=[...b.ranking].sort((a,c)=>
   (c.perOutsideExposure??-1)-(a.perOutsideExposure??-1)||
   c.outsideExposures-a.outsideExposures||a.rank-c.rank);
  const winner=ranked.find(x=>x.outsideExposures>=10)||ranked[0];
  const after=post.byTurn[turn]?.ranking.find(x=>x.rank===winner.rank);
  const others=post.byTurn[turn]?.ranking.filter(x=>x.rank!==winner.rank)||[];
  return [turn,{trainedRank:winner.rank,
   train:{incrementalHeads:winner.incrementalHeads,
    exposed:winner.outsideExposures,
    rate:winner.perOutsideExposure},
   test:after?{incrementalHeads:after.incrementalHeads,
    exposed:after.outsideExposures,rate:after.perOutsideExposure}:null,
   otherRanksTest:{incrementalHeads:others.reduce((s,x)=>s+x.incrementalHeads,0),
    exposed:others.reduce((s,x)=>s+x.outsideExposures,0)}
  }];
 }));
 return {splitDate,comparison};
}
