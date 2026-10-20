// Diagnóstico retrospectivo, NO regla predictiva. Toda lectura se ejecuta en PRE.
// Reutiliza motor oficial, sombra geométrica y Conectadas de la app.
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {DailySheet,SourceId} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical,RootRef} from '../src/motorLalo';
import {buildVt3Shadow,allPhysicalVt3} from '../src/vt3Shadow';
import {buildVt3Trial} from '../src/vt3Trial';
import {buildConnectedVt3,verifiedMarks} from '../src/connectedVt3';
import {connectedWinnerPairs,projectVerifiedConfigurations} from '../src/connectedGeometry';
import type {Trace} from '../src/connectedGeometry';
import {findPaths} from '../src/paths';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';

const days=['02','03','05','06','07','08','09','10','12','13','14','15','16','17','19']
 .map(d=>'2026-10-'+d);
const jur=JURS.filter(j=>j!=='Montevideo');
const coord=(c:{row:number;col:number})=>c.row+':'+c.col;
const positionKey=(cells:string[])=>[cells.join('>'),[...cells].reverse().join('>')].sort()[0];
const sourceOrder:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
function physicalFamilies(pre:DailySheet,turn:Turno){
 const by=new Map<string,{family:string;paths:{source:SourceId;value:string;cells:string[]}[]}>();
 for(const col of pre.columns.slice(0,TURNOS.indexOf(turn)+1))
  for(const p of allPhysicalVt3(col.values)){
   const value=p.map(x=>x.digit).join(''),family=reversibleFamily(value);
   const old=by.get(family)||{family,paths:[]};
   old.paths.push({source:col.id,value,cells:p.map(coord)});
   by.set(family,old);
  }
 return [...by.values()].map(x=>({...x,sourceCount:new Set(x.paths.map(p=>p.source)).size,
  routeCount:x.paths.length,latestSource:Math.max(...x.paths.map(p=>sourceOrder.indexOf(p.source)))}));
}
function diagnosticRank(pre:DailySheet,turn:Turno,historical:LaloHistorical[],roots:RootRef[]){
 // Reproducir exactamente los siete atributos y desempates de buildVt3Shadow,
 // pero sin truncar Top10. No se inyectan candidatos en ningún motor.
 const n=TURNOS.indexOf(turn);
 const points=(cells:string[])=>cells.map(x=>x.split(':').map(Number));
 const geom=(cells:string[])=>{
  const p=points(cells);
  const moves=(cs:number[][])=>cs.slice(1).map((x,i)=>
   (x[0]-cs[i][0])+','+(x[1]-cs[i][1])).join(';');
  return [moves(p),moves([...p].reverse())].sort()[0];
 };
 const location=(cells:string[])=>{
  const xy=points(cells);
  return {row:Math.min(...xy.map(x=>x[0])),col:Math.min(...xy.map(x=>x[1]))};
 };
 const physical=(sheet:DailySheet)=>sheet.columns.slice(0,n+1).flatMap(col=>
  allPhysicalVt3(col.values).map(p=>{
   const cells=p.map(coord),value=p.map(x=>x.digit).join('');
   return {family:reversibleFamily(value),source:col.id,
    cells,key:col.id+'|'+positionKey(cells),shape:geom(cells),pos:location(cells)};
  }));
 const references=(period:'D−1'|'D−7')=>new Map(
  Array.from(new Set(physical(historical.find(h=>h.period===period)?.sheet||{columns:[],matches:{},heads:{}}).map(x=>x.source+'|'+x.shape)))
  .map(key=>[key,physical(historical.find(h=>h.period===period)?.sheet||{columns:[],matches:{},heads:{}})
   .filter(x=>x.source+'|'+x.shape===key).map(x=>x.pos)])
 );
 const old1=references('D−1'),old7=references('D−7');
 const anchor=new Map<string,{row:number;col:number;event:string}[]>();
 for(const root of roots.filter(r=>r.oldCells.length===3)){
  const k=root.sourceId+'|'+geom(root.oldCells);
  const pos=location(root.oldCells);
  const ls=anchor.get(k)||[];
  ls.push({...pos,event:[root.date,root.oldTurn,root.jurisdiction,root.head].join('|')});
  anchor.set(k,ls);
 }
 const options=physical(pre).map(x=>{
  const key=x.source+'|'+x.shape;
  const a=old1.get(key)||[],b=old7.get(key)||[],c=anchor.get(key)||[];
  const shift=(y:{row:number;col:number})=>Math.abs(y.row-x.pos.row)+Math.abs(y.col-x.pos.col);
  const score=[
   a.some(y=>Math.abs(y.row-x.pos.row)>=2)?1:0,Math.max(0,...a.map(shift)),
   b.some(y=>Math.abs(y.row-x.pos.row)>=2)?1:0,Math.max(0,...b.map(shift)),
   c.some(y=>Math.abs(y.row-x.pos.row)>=2)?1:0,Math.max(0,...c.map(shift)),
   new Set(c.map(y=>y.event)).size
  ];
  return {...x,score,old1:a.length,old7:b.length,rootEvents:new Set(c.map(y=>y.event)).size};
 }).sort((a,b)=>{
  for(let k=0;k<7;k++)if(a.score[k]!==b.score[k])return b.score[k]-a.score[k];
  return sourceOrder.indexOf(a.source)-sourceOrder.indexOf(b.source)||
   a.pos.row-b.pos.row||a.pos.col-b.pos.col||a.key.localeCompare(b.key);
 });
 const seen=new Set<string>();
 return options.filter(x=>{if(seen.has(x.family))return false;seen.add(x.family);return true;});
}

async function main(){
 const store=new Map<string,CabezasDia>();
 for(const date of days){
  try{store.set(date,await descargarCabezas(date,true))}
  catch(e){console.log('SIN_DATOS',date,String(e))}
 }
 const valid=days.filter(d=>store.has(d)&&hasDrawResults(store.get(d)!)&&hasNocturnoBase(store.get(d)!));
 const daySheets=new Map<string,DailySheet>();
 for(let i=1;i<valid.length;i++)
  daySheets.set(valid[i],buildSheet(store.get(valid[i])!,store.get(valid[i-1])!));
 const records:any[]=[],misses:any[]=[],snapshots:any[]=[];
 for(let k=1;k<valid.length;k++){
  const date=valid[k];if(date<'2026-10-12')continue;
  const previous=valid[k-1],beforePrevious=valid[k-2];
  if(!beforePrevious)continue;
  const recent=valid.slice(Math.max(1,k-6),k);
  const weeklyDate=new Date(date+'T00:00:00Z');
  weeklyDate.setUTCDate(weeklyDate.getUTCDate()-7);
  const d7=weeklyDate.toISOString().slice(0,10);
  const historical:LaloHistorical[]=[
   {date:previous,period:'D−1',sheet:daySheets.get(previous)!},
   ...(daySheets.has(d7)?[{date:d7,period:'D−7' as const,sheet:daySheets.get(d7)!}]:[])
  ];
  const pastDays=recent.map(d=>({date:d,sheet:daySheets.get(d)!}));
  const sheet=buildSheet(store.get(date)!,store.get(previous)!);
  for(const turn of TURNOS){
   const pre=preSheetAtCut(sheet,turn,TURNOS.indexOf(turn));
   const official=buildMotorLalo(pre,date,turn,historical);
   const geo=buildVt3Shadow(pre,date,turn,historical,official);
   const trial=buildVt3Trial(official,geo);
   const connected=buildConnectedVt3(pre,date,turn,pastDays);
   const all=physicalFamilies(pre,turn);
   const geoAll=diagnosticRank(pre,turn,historical,official.roots);
   if(geoAll.slice(0,10).map(x=>x.family).join('|')!==geo.top.map(x=>x.family).join('|'))
    throw Error('Reproducción de orden geométrico no coincide '+date+' '+turn);
   const historicalPairs=connectedWinnerPairs(pastDays.flatMap(verifiedMarks));
   const traces:Trace[]=all.flatMap(x=>x.paths.map(p=>({
    family:x.family,source:p.source,cells:p.cells,value:p.value
   })));
   const connectedAll=projectVerifiedConfigurations(historicalPairs,traces,date,
    recent.includes(d7)?d7:null,'SOLAPADAS_OTRA');
   if(connectedAll.slice(0,10).map(x=>x.family).join('|')!==connected.top.map(x=>x.family).join('|'))
    throw Error('Reproducción de Conectadas no coincide '+date+' '+turn);
   const rank=(families:string[],family:string)=>{const i=families.indexOf(family);return i<0?null:i+1};
   const orderPhys=[...all].sort((a,b)=>b.sourceCount-a.sourceCount||
    b.routeCount-a.routeCount||a.family.localeCompare(b.family));
   const physRanks=orderPhys.map(x=>x.family);
   const audit=jur.flatMap(j=>{
    const head=store.get(date)![turn][j];if(!/^\d{4}$/.test(head))return [];
    const suffix=head.slice(-3),family=reversibleFamily(suffix);
    const traces=pre.columns.slice(0,TURNOS.indexOf(turn)+1).flatMap(col=>{
     const paths=findPaths(col.values,suffix);
     return paths.map(p=>({source:col.id,cells:p.map(coord),value:p.map(x=>x.digit).join('')}));
    });
    if(!traces.length)return [];
    const original=official.ranks.vt3.find(x=>x.family===family);
    const geom=geoAll.find(x=>x.family===family);
    const cfg=connectedAll.find(x=>x.family===family);
    const detail={date,turn,jur:j,head,suffix,family,physicalPaths:traces,
     physical:all.find(x=>x.family===family),
     officialRank:original?.rank??null,geoRank:rank(geoAll.map(x=>x.family),family),
     trialRank:rank(trial.top.map(x=>x.family),family),connectedRank:rank(connectedAll.map(x=>x.family),family),
     physicalBreadthRank:rank(physRanks,family),
     officialEvidence:original?{sourceCount:original.sourceCount,roots:original.directRoots,
       d1:original.d1Roots,d7:original.d7Roots,branches:original.branchBlocks,
       physicalBlocks:original.physicalBlocks,
       origins:original.paths.map(p=>({source:p.sourceId,origin:p.origin,
        rootIds:p.rootIds.length,value:p.value,cells:p.path.map(coord)})).slice(0,10)}:null,
     geoEvidence:geom?{score:geom.score,old1:geom.old1,old7:geom.old7,
      rootEvents:geom.rootEvents,source:geom.source,cells:geom.cells}:null,
     connectedEvidence:cfg?{score:cfg.score,historyDays:cfg.historyDays,
       historySource:cfg.historySource,source:cfg.source,pastHeads:cfg.pastHeads,
       cells:cfg.cells}:null,
     size:{physicalFamilies:all.length,officialFamilies:official.ranks.vt3.length,
      geometricFamilies:geoAll.length,connectedFamilies:connectedAll.length}};
    records.push(detail);
    if(date==='2026-10-19'&&((turn==='Vespertino'&&['8701','5073'].includes(head))||
      (turn==='Nocturno'&&head==='3419')))misses.push(detail);
    return [detail];
   });
   const controls={date,turn,heads:jur.length,physicalHeads:audit.length,
    officialTop3:audit.filter(x=>x.officialRank!==null&&x.officialRank<=3).length,
    officialTop6:audit.filter(x=>x.officialRank!==null&&x.officialRank<=6).length,
    officialTop10:audit.filter(x=>x.officialRank!==null&&x.officialRank<=10).length,
    geoTop6:audit.filter(x=>x.geoRank!==null&&x.geoRank<=6).length,
    cfgTop6:audit.filter(x=>x.connectedRank!==null&&x.connectedRank<=6).length,
    breadthTop6:audit.filter(x=>x.physicalBreadthRank!==null&&x.physicalBreadthRank<=6).length,
    physicalFamilies:all.length,roots:official.roots.length};
   snapshots.push(controls);
   console.log('CONTROL',JSON.stringify(controls));
  }
 }
 for(const item of misses)console.log('FRONTERA_19OCT',JSON.stringify(item));
 const total={cuts:snapshots.length,heads:snapshots.reduce((s,x)=>s+x.heads,0),
  physicallyPossible:snapshots.reduce((s,x)=>s+x.physicalHeads,0),
  officialTop6:snapshots.reduce((s,x)=>s+x.officialTop6,0),
  geoTop6:snapshots.reduce((s,x)=>s+x.geoTop6,0),
  cfgTop6:snapshots.reduce((s,x)=>s+x.cfgTop6,0),
  breadthTop6:snapshots.reduce((s,x)=>s+x.breadthTop6,0),
  targetMisses:misses.length};
 const summary={dates:valid,targets:misses,totals:total,byDay:[...new Set(snapshots.map(x=>x.date))].map(date=>{
  const x=snapshots.filter(x=>x.date===date);
  return {date,physical:x.reduce((n,i)=>n+i.physicalHeads,0),
   official6:x.reduce((n,i)=>n+i.officialTop6,0),
   geo6:x.reduce((n,i)=>n+i.geoTop6,0),
   cfg6:x.reduce((n,i)=>n+i.cfgTop6,0),
   breadth6:x.reduce((n,i)=>n+i.breadthTop6,0)};
 })};
 console.log('RESUMEN_FRONTERA',JSON.stringify(summary));
}
void main().catch(e=>{console.error('ERROR_FRONTERA',e);process.exitCode=1});
