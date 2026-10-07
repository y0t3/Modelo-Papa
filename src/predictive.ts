import type {DailySheet,SourceId} from './sheet';
import type {Path,Cell} from './paths';
import {TURNOS} from './domain';
import type {Turno} from './domain';
import {buildRouteHistory} from './routeHistory';

export type PredictiveRoute={
  family:string; value:string; sourceId:SourceId; sourceTurn:string;
  path:Path; support:number; templates:number; historyWeeks:number; state:'NACE'|'OBSERVAR'|'CONFIRMA'|'ACTIVA';
};
export type PredictiveFamily={family:string;support:number;templates:number;historyWeeks:number;state:string;hit:boolean;hitHeads:string[]};
export type PredictiveView={target:Turno;routes:PredictiveRoute[];families:number;hotFamilies:PredictiveFamily[]};

const fam=(v:string)=>{const r=v.split('').reverse().join('');return v<=r?v+'/'+r:r+'/'+v};
const sig=(p:Path)=>p.slice(1).map((x,i)=>[x.row-p[i].row,x.col-p[i].col] as const);
const sigKey=(p:Path)=>sig(p).map(x=>x.join(',')).join(';');
const cells=(values:string[])=>values.flatMap((v,row)=>/^\d{2}$/.test(v)?[
 {row,col:0,digit:v[0]},{row,col:1,digit:v[1]}
]:[]);
const at=(cs:Cell[],r:number,c:number)=>cs.find(x=>x.row===r&&x.col===c);

function apply(values:string[],moves:readonly (readonly [number,number])[]):Path[]{
 const cs=cells(values),out:Path[]=[];
 for(const start of cs){let p:Path=[start],cur=start,ok=true;
  for(const [dr,dc] of moves){const n=at(cs,cur.row+dr,cur.col+dc);if(!n||p.some(x=>x.row===n.row&&x.col===n.col)){ok=false;break}p=[...p,n];cur=n}
  if(ok)out.push(p);
 } return out;
}
const valueOf=(p:Path)=>p.map(x=>x.digit).join('');

export function upcomingTarget(sheet:DailySheet):Turno{
 for(const t of TURNOS) if(sheet.matches[t].length===0) return t;
 return 'Nocturno';
}

export function buildPredictive(current:DailySheet,d7:DailySheet,target:Turno,older:DailySheet[]=[]):PredictiveView{
 const idx=TURNOS.indexOf(target);
 const available=current.columns.slice(0,idx+1);
 const templates=new Map<string,Path>(),history=new Map<string,Set<number>>();
 const routeHistory=buildRouteHistory([d7,...older],target);
 // D−7 remains the causal selector. D−14/D−21 only measure persistence.
 for(const m of d7.matches[target]) for(const h of m.hits) if(h.kind==='vt3') for(const p of h.paths) templates.set(sigKey(p),p);
 for(const rh of routeHistory){
  if(!history.has(rh.signature))history.set(rh.signature,new Set());
  rh.weeks.forEach(w=>history.get(rh.signature)!.add(w));
 }

 const raw:PredictiveRoute[]=[];
 for(const tp of templates.values()){
  const moves=sig(tp);
  for(const col of available) for(const p of apply(col.values,moves)){
   const value=valueOf(p),family=fam(value);
   raw.push({family,value,sourceId:col.id,sourceTurn:col.sourceLabel,path:p,support:1,templates:1,historyWeeks:history.get(sigKey(tp))?.size||1,state:'NACE'});
   const rev=[...p].reverse(),rv=valueOf(rev),rf=fam(rv);
   raw.push({family:rf,value:rv,sourceId:col.id,sourceTurn:col.sourceLabel,path:rev,support:1,templates:1,historyWeeks:history.get(sigKey(tp))?.size||1,state:'NACE'});
  }
 }
 const familySupport=new Map<string,Set<string>>();
 const familyTemplates=new Map<string,Set<string>>();
 for(const r of raw){
  if(!familySupport.has(r.family))familySupport.set(r.family,new Set());
  familySupport.get(r.family)!.add(r.sourceId);
  if(!familyTemplates.has(r.family))familyTemplates.set(r.family,new Set());
  familyTemplates.get(r.family)!.add(sigKey(r.path));
 }
 const seen=new Set<string>(),routes:PredictiveRoute[]=[];
 for(const r of raw){
  const key=r.family+'|'+r.sourceId+'|'+r.path.map(x=>x.row+','+x.col).join('>');
  if(seen.has(key))continue;seen.add(key);
  const support=familySupport.get(r.family)!.size,templates=familyTemplates.get(r.family)!.size;
  const state=(support>=2&&r.historyWeeks>=2)||support>=3?'ACTIVA':support>=2?'CONFIRMA':r.historyWeeks>=2||templates>=2?'OBSERVAR':'NACE';
  routes.push({...r,support,templates,state});
 }
 routes.sort((a,b)=>b.support-a.support||b.templates-a.templates||a.family.localeCompare(b.family));
 const actualHeads=current.matches[target].map(m=>m.cabeza),actualFamilies=new Map<string,string[]>();
 for(const h of actualHeads){const v=h.slice(-3),f=fam(v);if(!actualFamilies.has(f))actualFamilies.set(f,[]);actualFamilies.get(f)!.push(h)}
 const hotFamilies=[...new Set(routes.map(r=>r.family))].map(f=>{const rr=routes.filter(r=>r.family===f),support=Math.max(...rr.map(r=>r.support)),templates=Math.max(...rr.map(r=>r.templates));const historyWeeks=Math.max(...rr.map(r=>r.historyWeeks));return {family:f,support,templates,historyWeeks,state:(support>=2&&historyWeeks>=2)||support>=3?'ACTIVA':support>=2?'CONFIRMA':historyWeeks>=2||templates>=2?'OBSERVAR':'NACE',hit:actualFamilies.has(f),hitHeads:actualFamilies.get(f)||[]}}).sort((a,b)=>b.support-a.support||b.historyWeeks-a.historyWeeks||b.templates-a.templates||a.family.localeCompare(b.family));
 return {target,routes,families:hotFamilies.length,hotFamilies};
}
