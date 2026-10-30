/**
 * Top10 VT3 leído literalmente como Top10 de terminaciones VT2.
 * No hay rutas físicas nuevas, permutaciones, inversión de VT2,
 * ni aumento de puestos. Cada puesto VT3 aporta únicamente la
 * terminación de SUS DOS lecturas tal como figuran en el ranking.
 */
import type {LaloView} from './motorLalo';

export type Vt3TailRow={
 rank:number;vt3:string[];tails:string[];familyLabel:string;
};
export type Vt3TailPreview={
 date:string;turn:string;
 rows:Vt3TailRow[];
 uniqueTails:string[];
 vt2TopTails:string[];
};
export type PublishedHead={jur:string;head:string};
const onlyDigits=(v:string,n:number)=>new RegExp('^\\d{'+n+'}$').test(v);
export function twoLastFromVt3Readings(readings:readonly string[]):string[]{
 if(readings.length!==2||readings.some(v=>!onlyDigits(v,3)))
  throw Error('Se necesitan las dos lecturas VT3 de un puesto');
 return readings.map(value=>value.slice(-2));
}
export function topVt3AsVt2PRE(view:LaloView):Vt3TailPreview{
 const rows=view.ranks.vt3.slice(0,10).map(f=>{
  const vt3=f.family.split('/');
  const tails=twoLastFromVt3Readings(vt3);
  return {rank:f.rank,vt3,tails,familyLabel:f.family};
 });
 const vt2TopTails=[...new Set(view.ranks.vt2.slice(0,10)
  .flatMap(f=>f.family.split('/')))];
 return {date:view.date,turn:view.target,rows,
  uniqueTails:[...new Set(rows.flatMap(x=>x.tails))],
  vt2TopTails};
}
export type TailOutcome={
 heads:number;vt2TopHitHeads:number;vt3TailHitHeads:number;
 both:number;tailOnly:number;topOnly:number;neither:number;
 exactVt3HitHeads:number;
 distinctTails:number;distinctTop2:number;
 ranks:{rank:number;pair:string;tails:string[];
  exposed:number;hitHeads:number;hit:boolean;
  matched:{jur:string;head:string;ending:string}[]}[];
 extras:{jur:string;head:string;ending:string;ranks:number[]}[];
};
export function evaluateTailPOST(pre:Vt3TailPreview,
 allHeads:readonly PublishedHead[]):TailOutcome{
 const valid=allHeads.filter(h=>/^\d{4,5}$/.test(h.head));
 const topSet=new Set(pre.vt2TopTails);
 const tailSet=new Set(pre.uniqueTails);
 const both=valid.filter(h=>topSet.has(h.head.slice(-2))&&
  tailSet.has(h.head.slice(-2))).length;
 const tailOnly=valid.filter(h=>!topSet.has(h.head.slice(-2))&&
  tailSet.has(h.head.slice(-2))).length;
 const topOnly=valid.filter(h=>topSet.has(h.head.slice(-2))&&
  !tailSet.has(h.head.slice(-2))).length;
 const ranks=pre.rows.map(r=>{
  const selected=new Set(r.tails);
  const matched=valid.filter(h=>selected.has(h.head.slice(-2)))
   .map(h=>({jur:h.jur,head:h.head,ending:h.head.slice(-2)}));
  return {rank:r.rank,pair:r.vt3.join(' / '),tails:r.tails,
   exposed:selected.size,hitHeads:matched.length,hit:matched.length>0,
   matched};
 });
 const extras=valid.filter(h=>tailSet.has(h.head.slice(-2))&&
  !topSet.has(h.head.slice(-2))).map(h=>({
  jur:h.jur,head:h.head,ending:h.head.slice(-2),
  ranks:ranks.filter(r=>r.tails.includes(h.head.slice(-2))).map(r=>r.rank)
 }));
 return {heads:valid.length,
  vt2TopHitHeads:both+topOnly,vt3TailHitHeads:both+tailOnly,
  both,tailOnly,topOnly,neither:valid.length-both-tailOnly-topOnly,
  exactVt3HitHeads:valid.filter(h=>pre.rows.some(r=>
   r.vt3.includes(h.head.slice(-3)))).length,
  distinctTails:pre.uniqueTails.length,
  distinctTop2:pre.vt2TopTails.length,
  ranks,extras};
}
export type RankPulse={
 key:string;turn:string;rank:number;date:string;
 priorCount:number;active:boolean;
 eligible:boolean;nowHit:boolean;exposed:number;hitHeads:number;
};
export function rankTailsPulses(
 records:{date:string;turn:string;rank:number;exposed:number;
  hit:boolean;hitHeads:number}[],
 window=3,minimum=2):{
 eligible:number;alerts:number;alertHits:number;nonAlerts:number;
 nonAlertHits:number;byRank:Record<number,{alerts:number;hits:number}>;
 pulses:RankPulse[];
}{
 if(window<2||window>8||minimum<1||minimum>window)
  throw Error('Regla inválida');
 const group=new Map<string,typeof records>();
 for(const item of records){
  const k=item.turn+'|'+item.rank;
  const l=group.get(k)||[];
  if(l.some(x=>x.date===item.date))throw Error('Doble fecha y puesto');
  l.push(item);group.set(k,l);
 }
 const pulses:RankPulse[]=[];
 for(const [key,items] of group){
  const ordered=[...items].sort((a,b)=>a.date.localeCompare(b.date));
  for(let i=0;i<ordered.length;i++){
   const row=ordered[i],past=ordered.slice(Math.max(0,i-window),i);
   const eligible=past.length===window&&row.exposed>0;
   const priorCount=past.filter(p=>p.hit&&p.exposed>0).length;
   pulses.push({key,turn:row.turn,rank:row.rank,date:row.date,
    priorCount,active:eligible&&priorCount>=minimum,eligible,
    nowHit:row.hit,exposed:row.exposed,hitHeads:row.hitHeads});
  }
 }
 const eligible=pulses.filter(p=>p.eligible);
 const alerts=eligible.filter(p=>p.active);
 const rest=eligible.filter(p=>!p.active);
 const byRank=Object.fromEntries(Array.from({length:10},(_,i)=>i+1).map(rank=>{
  const a=alerts.filter(p=>p.rank===rank);
  return [rank,{alerts:a.length,hits:a.filter(x=>x.nowHit).length}];
 }));
 return {eligible:eligible.length,alerts:alerts.length,
  alertHits:alerts.filter(p=>p.nowHit).length,
  nonAlerts:rest.length,nonAlertHits:rest.filter(p=>p.nowHit).length,
  byRank,pulses};
}
