// LAB: motor de configuraciones conectadas VT2. No se utiliza en la APK.
import type {DailySheet,SourceId} from './sheet';
import {TURNOS} from './domain';
import type {Turno} from './domain';
import {reversibleFamily} from './motorLalo';
import {cellsFromPlus11} from './paths';
import {projectVerifiedConfigurations} from './connectedGeometry';
import type {Mark,Pair,Trace,Proposal} from './connectedGeometry';
import type {ConnectedDay} from './connectedVt3';
const coord=(c:{row:number;col:number})=>c.row+':'+c.col;
const canon=(cs:string[])=>[cs.join('>'),[...cs].reverse().join('>')].sort()[0];
const step=(a:string,b:string)=>{const [ar,ac]=a.split(':').map(Number),[br,bc]=b.split(':').map(Number);
 return Math.max(Math.abs(ar-br),Math.abs(ac-bc))===1;};
const hId=(m:Mark)=>[m.date,m.turn,m.jur,m.head].join('|');
export function marksVt2(day:ConnectedDay,withMontevideo=false):Mark[]{
 const result:Mark[]=[],seen=new Set<string>();
 for(const turn of TURNOS)for(const m of day.sheet.matches[turn]||[]){
  if((!withMontevideo&&m.jurisdiccion==='Montevideo')||!/^[0-9]{4}$/.test(m.cabeza))continue;
  for(const hit of m.hits){
   if(hit.kind!=='vt2'||hit.value!==m.cabeza.slice(-2))continue;
   const col=day.sheet.columns.find(x=>x.id===hit.sourceId);
   if(!col)continue;
   for(const path of hit.paths){
    if(path.length!==2||path.map(x=>x.digit).join('')!==hit.value)continue;
    const cs=path.map(coord);
    if(!step(cs[0],cs[1])||path.some(x=>col.values[x.row]?.[x.col]!==x.digit))continue;
    const id=hId({date:day.date,turn,jur:m.jurisdiccion,head:m.cabeza,
      source:hit.sourceId,cells:cs})+'|'+hit.sourceId+'|'+canon(cs);
    if(seen.has(id))continue;seen.add(id);
    result.push({date:day.date,turn,jur:m.jurisdiccion,head:m.cabeza,
     source:hit.sourceId,cells:cs});
   }
  }
 }
 return result;
}
export function winnerPairsVt2(marks:Mark[]):Pair[]{
 const groups=new Map<string,Mark[]>();
 for(const m of marks){if(m.cells.length!==2)throw Error('VT2 no posee dos celdas');
  const k=m.date+'|'+m.source,list=groups.get(k)||[];
  list.push(m);groups.set(k,list);
 }
 const pairs=new Map<string,Pair&{ids:Set<string>}>();
 for(const list of groups.values())for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
  const a=list[i],b=list[j];if(hId(a)===hId(b))continue;
  if(a.cells.filter(x=>b.cells.includes(x)).length!==1)continue;
  const minRow=Math.min(...[...a.cells,...b.cells].map(x=>Number(x.split(':')[0])));
  const normalize=(cs:string[])=>cs.map(x=>{const [r,c]=x.split(':').map(Number);return (r-minRow)+':'+c;});
  const members=[normalize(a.cells),normalize(b.cells)].sort((x,y)=>canon(x).localeCompare(canon(y))) as [string[],string[]];
  const id=members.map(canon).join('||');
  const key=a.date+'|'+a.source+'|'+id,identity=[hId(a),hId(b)].sort().join('&&');
  const old=pairs.get(key);
  if(old){if(!old.ids.has(identity)){old.events++;old.ids.add(identity)}}
  else pairs.set(key,{date:a.date,source:a.source,kind:'COMPARTEN_UNA_CASILLA',id,
   members,minRow,pastHeads:[a.head,b.head],pastTurns:[a.turn,b.turn],
   pastJur:[a.jur,b.jur],events:1,ids:new Set([identity])});
 }
 return [...pairs.values()].map(({ids,...p})=>p);
}
export function connectedVt2(pre:DailySheet,date:string,target:Turno,
 days:ConnectedDay[],withMontevideo=false):{top:Proposal[],availableFamilies:number,historicalPairs:number}{
 const unique=new Map<string,ConnectedDay>();
 for(const day of days){if(day.date>=date)throw Error('VT2: referencia futura');unique.set(day.date,day)}
 const recent=[...unique.values()].sort((a,b)=>b.date.localeCompare(a.date))
  .filter(x=>TURNOS.some(t=>(x.sheet.heads[t]||[]).length>0)).slice(0,6);
 const historical=winnerPairsVt2(recent.flatMap(d=>marksVt2(d,withMontevideo)));
 const current:Trace[]=[],seen=new Set<string>();
 for(const column of pre.columns.slice(0,TURNOS.indexOf(target)+1)){
  const cells=cellsFromPlus11(column.values);
  for(const a of cells)for(const b of cells){
   const cs=[coord(a),coord(b)];if(a===b||!step(cs[0],cs[1]))continue;
   const key=column.id+'|'+canon(cs);if(seen.has(key))continue;seen.add(key);
   const value=a.digit+b.digit;
   current.push({source:column.id as SourceId,cells:cs,value,family:reversibleFamily(value)});
  }
 }
 const d7=new Date(date+'T00:00:00Z');d7.setUTCDate(d7.getUTCDate()-7);
 const weekly=d7.toISOString().slice(0,10);
 const out=projectVerifiedConfigurations(historical,current,date,
  recent.some(d=>d.date===weekly)?weekly:null,'SOLAPADAS_OTRA');
 return {top:out.slice(0,10),availableFamilies:out.length,historicalPairs:historical.length};
}
