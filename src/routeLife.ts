import type {DailySheet} from './sheet';
import type {Turno} from './domain';
import type {Path} from './paths';

export type RouteLifeState='NACE'|'OBSERVAR'|'CONFIRMA'|'ACTIVA'|'DECAE'|'MUERE';
export type RouteLifePoint={week:number;present:boolean;wins:number;paths:number};
export type RouteLife={signature:string;state:RouteLifeState;appearances:number;winningWeeks:number;lastSeen:number;streak:number;points:RouteLifePoint[]};

const sig=(p:Path)=>p.slice(1).map((x,i)=>`${x.row-p[i].row},${x.col-p[i].col}`).join(';');
const winningSigs=(sheet:DailySheet,target:Turno)=>{
 const m=new Map<string,{wins:Set<string>;paths:number}>();
 for(const hit of sheet.matches[target]) for(const h of hit.hits) if(h.kind==='vt3') for(const p of h.paths){
  const k=sig(p);if(!m.has(k))m.set(k,{wins:new Set(),paths:0});const x=m.get(k)!;x.wins.add(hit.cabeza);x.paths++;
 } return m;
};

export function buildRouteLives(sheetsNewestFirst:DailySheet[],target:Turno):RouteLife[]{
 const maps=sheetsNewestFirst.map(s=>winningSigs(s,target));
 const keys=new Set<string>();maps.forEach(m=>m.forEach((_,k)=>keys.add(k)));
 const out:RouteLife[]=[];
 for(const signature of keys){
  const points=maps.map((m,i)=>{const x=m.get(signature);return {week:i+1,present:!!x,wins:x?.wins.size||0,paths:x?.paths||0}});
  const appearances=points.filter(x=>x.present).length,winningWeeks=points.filter(x=>x.wins>0).length;
  const first=points.findIndex(x=>x.present),lastSeen=first<0?99:first+1;
  let streak=0;for(const x of points){if(x.present)streak++;else break}
  let state:RouteLifeState;
  if(lastSeen>=3)state='MUERE';
  else if(lastSeen===2)state='DECAE';
  else if(streak>=3&&winningWeeks>=3)state='ACTIVA';
  else if(streak>=2&&winningWeeks>=2)state='CONFIRMA';
  else if(appearances>=2)state='OBSERVAR';
  else state='NACE';
  out.push({signature,state,appearances,winningWeeks,lastSeen,streak,points});
 }
 const rank:Record<RouteLifeState,number>={ACTIVA:5,CONFIRMA:4,OBSERVAR:3,NACE:2,DECAE:1,MUERE:0};
 return out.sort((a,b)=>rank[b.state]-rank[a.state]||b.winningWeeks-a.winningWeeks||b.appearances-a.appearances||a.signature.localeCompare(b.signature));
}
