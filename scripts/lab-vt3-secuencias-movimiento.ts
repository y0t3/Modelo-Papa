// Laboratorio visual VT3: secuencia acumulativa de familias de una jornada.
// Estados: nacimiento, nueva fuente de una familia existente, persistencia.
// No se comparan cifras de un sorteo objetivo hasta sellar su corte PRE.
// No modifica la APK, buildMotorLalo ni buildVt3Shadow.
import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {descargarCabezas} from '../src/cabezas';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';
import {buildSheet} from '../src/sheet';
import type {SourceId} from '../src/sheet';
import {allPhysicalVt3,buildVt3Shadow} from '../src/vt3Shadow';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical,RootRef} from '../src/motorLalo';

const ranges=[['2026-06-01','2026-07-31','JUNIO_JULIO'],
 ['2026-08-15','2026-10-15','AGOSTO_OCTUBRE']] as const;
const SOURCE:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
// Fechas sin sorteo; el agregador puede rellenarlas de forma incorrecta.
const VERIFIED_PARTIAL_DATES:Record<string,string>={'2026-06-20':'0963','2026-07-09':'0802'};
type Stage='BASE_NOCTURNA'|'NUEVA_FAMILIA'|'REFUERZO_NUEVA_FUENTE'|'SIN_CAMBIO';
type Route={source:SourceId;shape:string;cells:string[];value:string};
type Family={family:string;firstSource:SourceId;sources:SourceId[];paths:Route[];
 shapes:string[]};
type Snapshot=Map<string,Family>;
type RecordRow={family:string;status:Stage;firstSource:SourceId;
 sourceCount:number;routeCount:number;shapeCount:number;newPaths:number;
 newShapes:number;sourceIncorporated:SourceId;d1Roots:number;d7Roots:number;
 winnerHeads:number;top3Lalo:boolean;top3Geo:boolean};
type Cut={date:string;period:string;turn:Turno;sourceIncorporated:SourceId;
 heads:number;physicalWinningHeads:number;physicallyAvailableFamilies:number;
 newBorn:number;reinforced:number;unchanged:number;statusForWinningHeads:Record<string,number>;
 rows:RecordRow[];winners:{jur:string;head:string;family:string;present:boolean}[];
 geoTop3:string[];laloTop3:string[]};
type DayResult={date:string;heads:CabezasDia};
const asDate=(s:string)=>Date.parse(s+'T12:00:00Z');
const dates=(start:string,end:string)=>{const a:string[]=[];
 for(let t=asDate(start);t<=asDate(end);t+=86400000)
  a.push(new Date(t).toISOString().slice(0,10));return a;};
const back=(date:string,n:number)=>new Date(asDate(date)-n*86400000).toISOString().slice(0,10);
const pathShape=(cells:string[])=>{
 const p=cells.map(c=>c.split(':').map(Number));
 const steps=(ls:number[][])=>ls.slice(1).map((v,i)=>[v[0]-ls[i][0],v[1]-ls[i][1]].join(',')).join(';');
 return [steps(p),steps([...p].reverse())].sort()[0];
};
const pathId=(x:{row:number;col:number})=>x.row+':'+x.col;
const familySnapshot=(sheet:ReturnType<typeof buildSheet>,turn:Turno):Snapshot=>{
 const m:Snapshot=new Map();
 for(const col of sheet.columns.slice(0,TURNOS.indexOf(turn)+1)){
  const physical=allPhysicalVt3(col.values);
  for(const p of physical){
   const family=reversibleFamily(p.map(c=>c.digit).join(''));
   if(!m.has(family))m.set(family,{family,firstSource:col.id,sources:[],paths:[],shapes:[]});
   const info=m.get(family)!;
   if(!info.sources.includes(col.id))info.sources.push(col.id);
   const cells=p.map(pathId),shape=pathShape(cells);
   info.paths.push({source:col.id,cells,shape,value:p.map(x=>x.digit).join('')});
   if(!info.shapes.includes(shape))info.shapes.push(shape);
  }
 }
 return m;
};
const previousPathsEqual=(old:Family,newer:Family)=>{
 for(const source of old.sources){
  const from=old.paths.filter(p=>p.source===source)
   .map(p=>p.cells.join('>')+'|'+p.value).sort();
  const current=newer.paths.filter(p=>p.source===source)
   .map(p=>p.cells.join('>')+'|'+p.value).sort();
  if(JSON.stringify(from)!==JSON.stringify(current))
   throw Error('Fuente antigua mutó entre PREs: '+source+' '+old.family);
 }
};
const rootKey=(source:SourceId,shape:string)=>source+'|'+shape;
const eventId=(r:RootRef)=>[r.date,r.oldTurn,r.jurisdiction,r.head].join('|');
const makeRoots=(roots:RootRef[],date:string)=>{
 const out=new Map<string,{d1:Set<string>;d7:Set<string>}>();
 for(const r of roots){
  if(r.date>=date)throw Error('Raíz futura');
  if(r.oldCells.length!==3)continue; // VT2 histórico no es huella VT3
  const k=rootKey(r.sourceId,pathShape(r.oldCells));
  if(!out.has(k))out.set(k,{d1:new Set(),d7:new Set()});
  out.get(k)![r.period==='D−1'?'d1':'d7'].add(eventId(r));
 }
 return out;
};
const band=(n:number)=>n<=2?'1-2':n<=5?'3-5':n<=12?'6-12':'13+';
const stratum=(r:RecordRow)=>r.firstSource+'|'+band(r.routeCount);
async function download(start:string,end:string){
 const list=dates(start,end),out:DayResult[]=[];
 for(let i=0;i<list.length;i+=8){
  const chunk=await Promise.all(list.slice(i,i+8).map(async date=>{
   for(let trial=0;trial<3;trial++){
    try{return {date,heads:await descargarCabezas(date,true)}}
    catch(e){if(trial===2)throw Error('Descarga falló '+date+': '+String(e))}
   }
   throw Error('Descarga imposible '+date);
  }));
  out.push(...chunk);
 }
 return out.filter(d=>hasDrawResults(d.heads)&&hasNocturnoBase(d.heads))
  .sort((a,b)=>a.date.localeCompare(b.date));
}
function summarize(cuts:Cut[]){
 const periods=['TOTAL',...ranges.map(r=>r[2])];
 const ans=Object.fromEntries(periods.map(period=>{
  const selected=period==='TOTAL'?cuts:cuts.filter(c=>c.period===period);
  const rows=selected.flatMap(c=>c.rows);
  const statuses:Stage[]=['BASE_NOCTURNA','NUEVA_FAMILIA','REFUERZO_NUEVA_FUENTE','SIN_CAMBIO'];
  const byStage=Object.fromEntries(statuses.map(stage=>{
   const x=rows.filter(r=>r.status===stage);
   return [stage,{exposures:x.length,winningHeads:x.reduce((n,r)=>n+r.winnerHeads,0),
    winningFamilies:x.filter(r=>r.winnerHeads>0).length,
    d7Evidence:x.filter(r=>r.d7Roots>0).length,
    d1Evidence:x.filter(r=>r.d1Roots>0).length,
    geoTop3Slots:x.filter(r=>r.top3Geo).length,
    geoTop3WinningHeads:x.filter(r=>r.top3Geo).reduce((n,r)=>n+r.winnerHeads,0)}];
  }));
  const neutral=Object.fromEntries(statuses.filter(k=>k!=='BASE_NOCTURNA').map(stage=>{
   let expected=0,observed=0,compared=0;
   for(const cut of selected){
    const groups=new Map<string,RecordRow[]>();
    for(const r of cut.rows){
     const k=stratum(r);
     if(!groups.has(k))groups.set(k,[]);
     groups.get(k)!.push(r);
    }
    for(const rs of groups.values()){
     const marked=rs.filter(r=>r.status===stage);
     if(marked.length>0&&marked.length<rs.length)compared++;
     const hits=rs.reduce((n,r)=>n+r.winnerHeads,0);
     expected+=marked.length/rs.length*hits;
     observed+=marked.reduce((n,r)=>n+r.winnerHeads,0);
    }
   }
   return [stage,{observed,neutralExpected:expected,difference:observed-expected,
    comparableStrata:compared}];
  }));
  const global={days:new Set(selected.map(c=>c.date)).size,cuts:selected.length,
   heads:selected.reduce((n,c)=>n+c.heads,0),
   physicalWinners:selected.reduce((n,c)=>n+c.physicalWinningHeads,0),
   geoTop3:selected.reduce((n,c)=>n+c.rows.filter(r=>r.top3Geo)
    .reduce((n,r)=>n+r.winnerHeads,0),0),
   laloTop3:selected.reduce((n,c)=>n+c.rows.filter(r=>r.top3Lalo)
    .reduce((n,r)=>n+r.winnerHeads,0),0),
   byStage,neutral,
   byTurn:Object.fromEntries(TURNOS.map(turn=>{
    const xs=selected.filter(c=>c.turn===turn);
    return [turn,{cuts:xs.length,physicalWinners:xs.reduce((n,c)=>n+c.physicalWinningHeads,0),
     newbornHeadHits:xs.flatMap(c=>c.rows).filter(r=>r.status==='NUEVA_FAMILIA')
      .reduce((n,r)=>n+r.winnerHeads,0),
     reinforcedHeadHits:xs.flatMap(c=>c.rows).filter(r=>r.status==='REFUERZO_NUEVA_FUENTE')
      .reduce((n,r)=>n+r.winnerHeads,0)}];
   }))};
  return [period,global];
 }));
 return ans;
}
function caseTimeline(dayCuts:Cut[],family:string,snapshots:Snapshot[]){
 return {date:dayCuts[0].date,family,
  frames:dayCuts.map((c,i)=>{
   const f=snapshots[i].get(family);
   const match=c.winners.filter(x=>x.family===family);
   return {target:c.turn,available:!!f,birth:f?.firstSource||null,
    sources:f?.sources||[],
    paths:f?.paths.map(p=>({source:p.source,number:p.value,cells:p.cells}))||[],
    status:c.rows.find(r=>r.family===family)?.status||null,
    winnerHeads:match.map(x=>x.head),
    candidateGeoTop3:c.geoTop3.includes(family),
    candidateLaloTop3:c.laloTop3.includes(family)};
  })};
}
async function main(){
 const allValid=await download('2026-05-14','2026-10-15');
 for(const [date,head] of Object.entries(VERIFIED_PARTIAL_DATES))
  if(allValid.find(d=>d.date===date)?.heads.Nocturno.Montevideo!==head)
   throw Error('Nocturna confirmada modificada: '+date);
 const byDate=new Map(allValid.map(d=>[d.date,d]));
 const cuts:Cut[]=[];
 const stories:any[]=[];
 const excluded:{date:string;reason:string}[]=[];
 for(const [from,to,period] of ranges){
  for(const day of allValid.filter(d=>d.date>=from&&d.date<=to&&
   TURNOS.some(t=>JURS.some(j=>j!=='Montevideo'&&/^\d{4}$/.test(d.heads[t][j]))))){
   // Montevideo es fuente histórica, no objetivo argentino de cinco cabezas.
   const before=allValid.filter(d=>d.date<day.date);
   if(before.length<2){excluded.push({date:day.date,reason:'Falta historia Nocturna previa'});continue}
   const prior=before.at(-1)!,priorPrior=before.at(-2)!;
   const week=byDate.get(back(day.date,7));
   const beforeWeek=week?allValid.filter(d=>d.date<week.date).at(-1):null;
   const history:LaloHistorical[]=[
    {date:prior.date,period:'D−1',sheet:buildSheet(prior.heads,priorPrior.heads)},
    ...(week&&beforeWeek?[{date:week.date,period:'D−7' as const,
     sheet:buildSheet(week.heads,beforeWeek.heads)}]:[])
   ];
   const snapshots:Snapshot[]=[];
   const dayCuts:Cut[]=[];
   let priorSnapshot:Snapshot|null=null;
   for(const turn of TURNOS){
    const partial=diaVacio(),idx=TURNOS.indexOf(turn);
    for(const past of TURNOS.slice(0,idx))for(const j of JURS)
     partial[past][j]=day.heads[past][j];
    const pre=buildSheet(partial,prior.heads);
    if(pre.heads[turn].length||pre.matches[turn].length)
     throw Error('Fuga temporal '+day.date+' '+turn);
    const now=familySnapshot(pre,turn);
    const official=buildMotorLalo(pre,day.date,turn,history);
    const geo=buildVt3Shadow(pre,day.date,turn,history,official);
    if(geo.availableFamilies!==now.size)
     throw Error('La familia física difiere del motor original');
    const root=makeRoots(official.roots,day.date);
    const heads=JURS.filter(j=>j!=='Montevideo')
     .map(j=>({jur:j,head:day.heads[turn]?.[j]}))
     .filter(x=>/^\d{4}$/.test(x.head||''))
     .map(x=>({...x,family:reversibleFamily(x.head.slice(-3))}));
    const count=new Map<string,number>();
    for(const h of heads)count.set(h.family,(count.get(h.family)||0)+1);
    const latest=pre.columns[idx].id;
    const rankedOfficial=new Set(official.ranks.vt3.slice(0,3).map(x=>x.family));
    const rankedGeo=new Set(geo.top.slice(0,3).map(x=>x.family));
    const rows:RecordRow[]=[];
    for(const f of now.values()){
     const priorFamily=priorSnapshot?.get(f.family);
     if(priorFamily)previousPathsEqual(priorFamily,f);
     const currentColPaths=f.paths.filter(p=>p.source===latest);
     const earlierShapes=new Set(priorFamily?.shapes||[]);
     const newShapes=[...new Set(currentColPaths.map(p=>p.shape))]
      .filter(shape=>!earlierShapes.has(shape));
     const status:Stage=idx===0?'BASE_NOCTURNA':
      !priorFamily?'NUEVA_FAMILIA':
      f.sources.length>priorFamily.sources.length?'REFUERZO_NUEVA_FUENTE':'SIN_CAMBIO';
     if(status==='NUEVA_FAMILIA'&&f.firstSource!==latest)
      throw Error('Nacimiento asignado fuera de la nueva fuente');
     const evidenceD1=new Set<string>(),evidenceD7=new Set<string>();
     for(const path of f.paths){
      const refs=root.get(rootKey(path.source,path.shape));
      for(const x of refs?.d1||[])evidenceD1.add(x);
      for(const x of refs?.d7||[])evidenceD7.add(x);
     }
     rows.push({family:f.family,status,firstSource:f.firstSource,
      sourceCount:f.sources.length,routeCount:f.paths.length,shapeCount:f.shapes.length,
      newPaths:status==='SIN_CAMBIO'?0:currentColPaths.length,newShapes:newShapes.length,
      sourceIncorporated:latest,d1Roots:evidenceD1.size,d7Roots:evidenceD7.size,
      winnerHeads:count.get(f.family)||0,
      top3Lalo:rankedOfficial.has(f.family),top3Geo:rankedGeo.has(f.family)});
    }
    if(rows.reduce((n,r)=>n+r.winnerHeads,0)!==heads.filter(h=>now.has(h.family)).length)
     throw Error('Desfase de aciertos por familia física');
    const cut:Cut={date:day.date,period,turn,sourceIncorporated:latest,
     heads:heads.length,
     physicalWinningHeads:heads.filter(h=>now.has(h.family)).length,
     physicallyAvailableFamilies:now.size,
     newBorn:rows.filter(r=>r.status==='NUEVA_FAMILIA').length,
     reinforced:rows.filter(r=>r.status==='REFUERZO_NUEVA_FUENTE').length,
     unchanged:rows.filter(r=>r.status==='SIN_CAMBIO').length,
     statusForWinningHeads:Object.fromEntries(['BASE_NOCTURNA','NUEVA_FAMILIA',
      'REFUERZO_NUEVA_FUENTE','SIN_CAMBIO'].map(status=>
      [status,rows.filter(r=>r.status===status).reduce((n,r)=>n+r.winnerHeads,0)])),
     rows,winners:heads.map(h=>({...h,present:now.has(h.family)})),
     geoTop3:geo.top.slice(0,3).map(f=>f.family),
     laloTop3:official.ranks.vt3.slice(0,3).map(f=>f.family)};
    snapshots.push(now);dayCuts.push(cut);cuts.push(cut);
    priorSnapshot=now;
   }
   const winningFamilies=new Set(dayCuts.flatMap(c=>c.winners.filter(w=>w.present).map(w=>w.family)));
   const focus=new Set([...winningFamilies]);
   // Controles no ganadores, elegidos ANTES de saber qué familias aciertan
   // mediante el ranking geométrico construido en cada PRE.
   for(const c of dayCuts)for(const f of c.geoTop3)focus.add(f);
   for(const f of focus)
    stories.push(caseTimeline(dayCuts,f,snapshots));
  }
 }
 const includedDates=Object.fromEntries(ranges.map(([from,to,period])=>[
  period,allValid.filter(d=>d.date>=from&&d.date<=to).map(d=>({
   date:d.date,hash:createHash('sha256').update(JSON.stringify(d.heads)).digest('hex'),
   nocturna: JURS.filter(j=>/^\\d{4}$/.test(d.heads.Nocturno?.[j]||'')).length
  }))
 ]));
 const realBaseForTargets=Object.fromEntries(['2026-06-22','2026-07-10'].map(date=>{
  const prior=allValid.filter(d=>d.date<date).at(-1);
  if(!prior)throw Error('Falta base '+date);
  return [date,{sourceDate:prior.date,night:prior.heads.Nocturno.Montevideo,
   montevideoPlus11:buildSheet(diaVacio(),prior.heads).columns[0].values[5]}];
 }));
 const report={includedDates,realBaseForTargets,protocol:{
  scope:'Hoja PRE acumulativa, cinco cortes por jornada y familia reversible VT3',
  state:'NACIMIENTO = familia inexistente en todas las fuentes anteriores; REFUERZO = familia ya existente que aparece en la nueva fuente; SIN CAMBIO = idénticos caminos anteriores',
  roots:'Huellas ganadoras de cabezas previas D−1 y D−7; solo misma forma/fuente, no equivale a repetir cifra',
  comparison:'Control neutral en corte+fuente de nacimiento+banda de cantidad de caminos (observaciones dependientes, no prueba confirmatoria)',
  caution:'Resultados históricos conocidos. Exposiciones de familia repetidas por jornada. No interpretar como probabilidades de apuesta.',
  calendarExclusions:[],verifiedUruguayNightSources:VERIFIED_PARTIAL_DATES
 },summary:summarize(cuts),excluded,storiesCount:stories.length,
  cuts:cuts.map(({rows,...rest})=>({...rest,
   candidates:rows.map(r=>({family:r.family,state:r.status,origin:r.firstSource,
    sources:r.sourceCount,paths:r.routeCount,shapes:r.shapeCount,
    addedPaths:r.newPaths,addedShapes:r.newShapes,d1:r.d1Roots,d7:r.d7Roots,
    win:r.winnerHeads,geoTop:r.top3Geo,laloTop:r.top3Lalo}))})),
  stories};
 const summary=report.summary;
 if(summary.JUNIO_JULIO.cuts<245||summary.JUNIO_JULIO.cuts>275||
  summary.AGOSTO_OCTUBRE.cuts!==265)
  throw Error('Muestra incompatible con los dos periodos previstos: '+JSON.stringify({
   june:summary.JUNIO_JULIO.cuts,aug:summary.AGOSTO_OCTUBRE.cuts,excluded}));
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/VT3_MOVIMIENTOS_FUENTE_VERIFICADA_JUN_OCT_2026.json',
  JSON.stringify(report,null,2)+'\n');
 console.log('MOVIMIENTOS_VT3_START');
 console.log(JSON.stringify({summary,excluded,storiesCount:stories.length,realBaseForTargets},null,2));
 console.log('MOVIMIENTOS_VT3_END');
}
main().catch(e=>{console.error('MOVIMIENTOS_VT3_ERROR',e);process.exitCode=1});
