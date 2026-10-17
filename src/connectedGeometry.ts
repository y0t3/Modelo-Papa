// Laboratorio: configuraciones VT3 compuestas EXCLUSIVAMENTE de recorridos
// que explicaron dos cabezas independientes de una jornada previa, misma fuente.
// Primero CONFIGURACIÓN HISTÓRICA -> luego proyección dentro de +11 PRE
// -> recién entonces leer las cifras actuales de sus dos caminos.
import type {SourceId} from './sheet';
export type Mark={date:string;turn:string;jur:string;head:string;
 source:SourceId;cells:string[]};
export type Trace={source:SourceId;cells:string[];family:string;value:string};
export type Connection='COMPARTEN_UNA_CASILLA'|'COMPARTEN_DOS_CASILLAS'|'SOLO_ROCE';
export type Pair={date:string;source:SourceId;kind:Connection;id:string;
 members:[string[],string[]];minRow:number;
 pastHeads:[string,string];pastTurns:[string,string];pastJur:[string,string];
 events:number};
export type PairMode='UNA_CASILLA_MISMA'|'DOS_CASILLAS_MISMA'|
 'SOLO_ROCE_MISMA'|'SOLAPADAS_OTRA'|'SOLAPADAS_MISMA';
export const pairModes:PairMode[]=[
 'UNA_CASILLA_MISMA','DOS_CASILLAS_MISMA','SOLO_ROCE_MISMA',
 'SOLAPADAS_OTRA','SOLAPADAS_MISMA'];
const parse=(s:string)=>{const parts=s.split(':').map(Number);
 if(parts.length!==2||parts.some(x=>!Number.isInteger(x)))throw Error('Casilla inválida '+s);
 return {row:parts[0],col:parts[1]};
};
const canon=(cells:string[])=>[cells.join('>'),[...cells].reverse().join('>')].sort()[0];
const headId=(m:Mark)=>[m.date,m.turn,m.jur,m.head].join('|');
export function relationship(a:string[],b:string[]):Connection|null{
 if(a.length!==3||b.length!==3)throw Error('Se exigen ternas VT3');
 if(new Set(a).size!==3||new Set(b).size!==3)throw Error('Hay casillas repetidas');
 const overlap=a.filter(c=>b.includes(c)).length;
 if(overlap===3)return null; // mismo trazo no es una configuración
 if(overlap===2)return 'COMPARTEN_DOS_CASILLAS';
 if(overlap===1)return 'COMPARTEN_UNA_CASILLA';
 return a.some(x=>b.some(y=>{
  const p=parse(x),q=parse(y);
  return Math.max(Math.abs(p.row-q.row),Math.abs(p.col-q.col))===1;
 }))?'SOLO_ROCE':null;
}
function normalize(a:string[],b:string[]){
 const minRow=Math.min(...[...a,...b].map(c=>parse(c).row));
 const rel=(cells:string[])=>cells.map(c=>{
  const v=parse(c);return (v.row-minRow)+':'+v.col;
 });
 const pair=[rel(a),rel(b)].sort((x,y)=>canon(x).localeCompare(canon(y)));
 return {minRow,members:pair as [string[],string[]],
  id:pair.map(p=>canon(p)).join('||')};
}
export function connectedWinnerPairs(events:Mark[]):Pair[]{
 const groups=new Map<string,Mark[]>();
 for(const e of events){
  if(!/^\d{4}$/.test(e.head))throw Error('Cabeza histórica inválida');
  if(e.cells.length!==3)throw Error('Camino VT3 inválido');
  const group=e.date+'|'+e.source;
  if(!groups.has(group))groups.set(group,[]);
  groups.get(group)!.push(e);
 }
 const pairs=new Map<string,Pair>();
 for(const list of groups.values()){
  for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
   const x=list[i],y=list[j];
   if(headId(x)===headId(y))continue;
   const kind=relationship(x.cells,y.cells);
   if(!kind)continue;
   const shape=normalize(x.cells,y.cells);
   const key=x.date+'|'+x.source+'|'+kind+'|'+shape.id;
   const id=[headId(x),headId(y)].sort().join('&&');
   const existing=pairs.get(key);
   if(existing){
    // No convertir recorridos alternativos de la misma cabeza en
    // nuevos sorteos; un par de cabezas por testimonio geométrico.
    const witnesses=(existing as Pair&{_ids?:Set<string>})._ids;
    if(!witnesses?.has(id)){existing.events++;witnesses?.add(id)}
   }else{
    const p:Pair&{_ids?:Set<string>}={
     date:x.date,source:x.source,kind,id:shape.id,
     members:shape.members,minRow:shape.minRow,
     pastHeads:[x.head,y.head],pastTurns:[x.turn,y.turn],
     pastJur:[x.jur,y.jur],events:1,_ids:new Set([id])
    };
    pairs.set(key,p);
   }
  }
 }
 return [...pairs.values()].map(p=>{
  const {_ids,...plain}=p as Pair&{_ids?:Set<string>};return plain;
 });
}
const aligned=(template:string[],offset:number)=>template.map(s=>{
 const p=parse(s);return (p.row+offset)+':'+p.col;
});
const same=(kind:Connection,mode:PairMode)=>
 mode==='UNA_CASILLA_MISMA'?kind==='COMPARTEN_UNA_CASILLA':
 mode==='DOS_CASILLAS_MISMA'?kind==='COMPARTEN_DOS_CASILLAS':
 mode==='SOLO_ROCE_MISMA'?kind==='SOLO_ROCE':kind!=='SOLO_ROCE';
export type Proposal={family:string;source:SourceId;cells:string[];digits:string;
 score:number[];firstDate:string;lastDate:string;
 historicConfiguration:string;historySource:SourceId;pastHeads:[string,string];
 proof:[string[],string[]];relativeShift:number;historyDays:number};
export function projectVerifiedConfigurations(historical:Pair[],
 current:Trace[],date:string,weeklyDate:string|null,mode:PairMode):Proposal[]{
 const traceMap=new Map<string,Trace>();
 for(const t of current)traceMap.set(t.source+'|'+canon(t.cells),t);
 const possible=new Map<string,{pair:Pair;source:SourceId;offset:number;
  a:Trace;b:Trace}[]>();
 const byPattern=new Map<string,Pair[]>();
 for(const h of historical){
  if(h.date>=date)throw Error('Se intentó incorporar una coincidencia del futuro');
  if(!same(h.kind,mode))continue;
  const key=h.source+'|'+h.kind+'|'+h.id;
  if(!byPattern.has(key))byPattern.set(key,[]);
  byPattern.get(key)!.push(h);
 }
 // Un conjunto histórico cuenta por jornada/configuración; no se multiplica
 // por existir varios pares de cabezas que trazaron el mismo conjunto.
 for(const history of byPattern.values()){
  const base=history[0], days=[...new Set(history.map(h=>h.date))];
  for(const source of new Set(current.map(t=>t.source))){
   if(mode==='SOLAPADAS_OTRA'&&source===base.source)continue;
   if(mode!=='SOLAPADAS_OTRA'&&source!==base.source)continue;
   for(let offset=0;offset<6;offset++){
    const aCells=aligned(base.members[0],offset);
    const bCells=aligned(base.members[1],offset);
    if([...aCells,...bCells].some(c=>parse(c).row>5))continue;
    const a=traceMap.get(source+'|'+canon(aCells));
    const b=traceMap.get(source+'|'+canon(bCells));
    if(!a||!b)continue;
    const k=source+'|'+base.kind+'|'+base.id+'|'+offset;
    const found=possible.get(k)||[];
    found.push({pair:base,source,offset,a,b});
    possible.set(k,found);
   }
  }
  // Intentional: template repeat days only as history support, not extra
  // candidate copies. Read all generated numbers from CURRENT PRE.
  void days;
 }
 const result=new Map<string,Proposal>();
 for(const found of possible.values()){
  const x=found[0];
  const evidence=byPattern.get(x.pair.source+'|'+x.pair.kind+'|'+x.pair.id)||[];
  const uniqueDates=[...new Set(evidence.map(x=>x.date))].sort();
  const weekly=weeklyDate?uniqueDates.includes(weeklyDate):false;
  const eventPairs=evidence.reduce((n,h)=>n+h.events,0);
  const score=[uniqueDates.length,Number(weekly),Math.min(eventPairs,12),
   -Math.min(...evidence.map(e=>Math.abs(x.offset-e.minRow)))];
  for(const route of [x.a,x.b]){
   const proposal:Proposal={family:route.family,source:x.source,cells:route.cells,
    digits:route.value,score,firstDate:uniqueDates[0],
    lastDate:uniqueDates.at(-1)!,historicConfiguration:x.pair.id,
    historySource:x.pair.source,pastHeads:x.pair.pastHeads,
    proof:x.pair.members,relativeShift:x.offset-x.pair.minRow,
    historyDays:uniqueDates.length};
   const old=result.get(route.family);
   if(!old||compareScore(proposal.score,old.score)<0||
    compareScore(proposal.score,old.score)===0&&
    (proposal.source+'|'+canon(proposal.cells))<
    (old.source+'|'+canon(old.cells)))result.set(route.family,proposal);
  }
 }
 return [...result.values()].sort((a,b)=>compareScore(a.score,b.score)||
   a.source.localeCompare(b.source)||
   canon(a.cells).localeCompare(canon(b.cells))||a.family.localeCompare(b.family));
}
function compareScore(a:number[],b:number[]){
 for(let i=0;i<Math.max(a.length,b.length);i++)
  if((b[i]||0)!==(a[i]||0))return (b[i]||0)-(a[i]||0);
 return 0;
}
