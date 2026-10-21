/**
 * LALO · VT2 + VT3 + VT4 COMO ACIERTOS DIFERENTES, MISMA AUDITORÍA.
 * Segundo tablero RAW Santiago-Neuquén, con contacto transversal permitido.
 * Datos PRE solamente; las marcas exactas de ganadores son POST y provienen
 * ÚNICAMENTE de fechas anteriores D−1 / D−7 (sin mirar cabezas objetivo).
 *
 * Tres lectores, en cada modalidad:
 * - AUX_RAICES: memoria de rutas ganadoras exactas de dicha longitud
 * - AUX_GEOMETRIA: todos los recorridos físicos, por bloques diferentes
 * - AUX_ALEATORIO: familias formables, orden pseudoaleatorio fijo
 * - LALO_MV1: salida inalterada de buildMotorLalo
 *
 * VT4: agrupar prefijo añadido + familia VT3 madre. NO invertir VT4 entero.
 * Medir Top1/Top3/Top5/Top6 por GRUPOS/FAMILIAS (no apostar que grupo
 * representa exactamente un solo boleto). Medir tambien número REAL de
 * terminaciones por grupo y cobertura a priori del azar.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';
import {buildSheet} from '../src/sheet';
import type {DailySheet} from '../src/sheet';
import {preSheetAtCut} from '../src/infoCandidatos';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {auxiliaryBoard,findAuxPaths,enumerateAuxPaths,auxFamily,auxCanonicalPath}
 from '../src/auxSantiagoNeuquen';
import type {AuxPath,AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {projectAuxShape} from '../src/auxWinningMemory';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import type {AuxSourceObservation} from '../src/auxSantiagoSource';

type Kind=2|3|4;
type Mode='AUX_RAICES'|'AUX_GEOMETRIA'|'AUX_ALEATORIO'|'LALO_MV1';
const KINDS:Kind[]=[2,3,4];
const MODES:Mode[]=['AUX_RAICES','AUX_GEOMETRIA','AUX_ALEATORIO','LALO_MV1'];
const K_LIST=[1,3,5,6] as const;
const FIRST_MONTH_DAY='08-01',LAST_DAY='10-20';
const valid=(h:string)=>/^\d{4}$/.test(h);
const daySequence=(start:string,end:string)=>{
 const dates:string[]=[];
 for(let ms=Date.parse(start+'T12:00:00Z');ms<=Date.parse(end+'T12:00:00Z');ms+=86400000)
  dates.push(new Date(ms).toISOString().slice(0,10));
 return dates;
};
const d7=(s:string)=>{const d=new Date(s+'T12:00:00Z');
 d.setUTCDate(d.getUTCDate()-7);return d.toISOString().slice(0,10)};
const rootKey=(date:string,turn:Turno,jur:string,head:string)=>
 [date,turn,jur,head].join('|');
const pathBlock=(p:AuxPath)=>p.map(c=>c.row+':'+c.col).sort().join(',');
const formatFamily=(value:string,kind:Kind):string=>{
 if(kind===4){
  const parent=auxFamily(value.slice(-3));
  return parent.split('/').map(f=>value[0]+f).join('/');
 }
 return auxFamily(value);
};
const hash=(s:string)=>{let h=2166136261;for(const c of s){
 h^=c.charCodeAt(0);h=Math.imul(h,16777619);
 }return h>>>0;};
const numbersInFamily=(f:string)=>[...new Set(f.split('/'))];
type Family={
 family:string; values:string[];paths:AuxPath[];blocks:number;
 crossing:boolean;rootEvents:number;d1:number;d7:number;
};
type WinningMark={
 id:string;kind:Kind;date:string;targetTurn:Turno;jur:string;head:string;
 family:string;paths:AuxPath[];
};
type HistDay={date:string;marks:Record<Kind,WinningMark[]>};
type Cut={
 year:string;date:string;turn:Turno;
 heads:{jur:string;head:string}[];
 cells:number;historicRootEvents:Record<Kind,number>;
 familyCounts:Record<Kind,Record<Mode,number>>;
 ranks:Record<Kind,Record<Mode,{family:string;values:string[];roots:number;
  d1:number;d7:number;blocks:number;crossing:boolean}[]>>;
 outcomes:Record<Kind,Record<Mode,{hits:Record<string,number>;
  expectedUniform:Record<string,number>;rawSelections:Record<string,number>;
  uniqueHeadHits:Record<string,number>}>>;
 // Union de los tres tipos (con 3 ó 5 familias de CADA modalidad).
 combined:Record<Mode,{top3:number;top5:number;
  rawEntriesTop3:number;rawEntriesTop5:number}>;
};
function marksOf(date:string,aux:AuxiliaryHeads,outcomes:CabezasDia):HistDay{
 const marks:HistDay['marks']={2:[],3:[],4:[]};
 for(const turn of TURNOS){
  const board=auxiliaryBoard(aux,turn);
  for(const jur of JURS){
   const head=outcomes[turn]?.[jur]||'';
   if(!valid(head))continue;
   for(const kind of KINDS){
    const paths=findAuxPaths(board,head.slice(-kind));
    if(!paths.length)continue;
    marks[kind].push({id:rootKey(date,turn,jur,head),kind,date,
     targetTurn:turn,jur,head,family:formatFamily(head.slice(-kind),kind),paths});
   }
  }
 }
 return {date,marks};
}
function collectCandidates(board:ReturnType<typeof auxiliaryBoard>,
 historical:{period:'D−1'|'D−7';day:HistDay}[],kind:Kind,
 origin:'GEOMETRY'|'ROOT'):Map<string,Family>{
 const groups=new Map<string,{paths:Map<string,AuxPath>;
  rootEvents:Set<string>;d1:Set<string>;d7:Set<string>}>();
 function add(path:AuxPath,rootId?:string,period?:'D−1'|'D−7'){
  const family=formatFamily(path.map(c=>c.digit).join(''),kind);
  const group=groups.get(family)||{paths:new Map(),rootEvents:new Set<string>(),
   d1:new Set<string>(),d7:new Set<string>()};
  group.paths.set(auxCanonicalPath(path),path);
  if(rootId){
   group.rootEvents.add(rootId);
   (period==='D−1'?group.d1:group.d7).add(rootId);
  }
  groups.set(family,group);
 }
 if(origin==='GEOMETRY'){
  for(const path of enumerateAuxPaths(board,kind))add(path);
 }else for(const {period,day} of historical)
  for(const mark of day.marks[kind])
   for(const path of mark.paths)
    for(const projected of projectAuxShape(board,path))
     add(projected,mark.id,period);
 return new Map([...groups].map(([family,g])=>[family,{
  family,values:kind===4?[...new Set([...g.paths.values()].map(p=>p.map(c=>c.digit).join('')))]:numbersInFamily(family),paths:[...g.paths.values()],
  blocks:new Set([...g.paths.values()].map(pathBlock)).size,
  crossing:[...g.paths.values()].some(p=>new Set(p.map(c=>c.source)).size>1),
  rootEvents:g.rootEvents.size,d1:g.d1.size,d7:g.d7.size
 }]));
}
function rankedFamilies(candidates:Map<string,Family>,mode:Mode,
 date:string,turn:Turno):Family[]{
 return [...candidates.values()].sort((a,b)=>{
  if(mode==='AUX_RAICES'){
   for(const field of ['rootEvents','d1','d7','blocks'] as const)
    if(a[field]!==b[field])return b[field]-a[field];
  }else if(mode==='AUX_GEOMETRIA'&&a.blocks!==b.blocks)
   return b.blocks-a.blocks;
  const rnd=hash(date+'|'+turn+'|'+mode+'|'+a.family)-
   hash(date+'|'+turn+'|'+mode+'|'+b.family);
  return rnd||a.family.localeCompare(b.family);
 });
}
function officialFamilies(ranks:ReturnType<typeof buildMotorLalo>,kind:Kind):Family[]{
 const seen=new Set<string>(),out:Family[]=[];
 const list=ranks.ranks[('vt'+kind) as 'vt2'|'vt3'|'vt4'];
 for(const item of list){
  // Cada Lalo VT4 es una FAMILIA DE EXTENSIONES DE MADRE VT3,
  // no dar vuelta los 4 dígitos completos.
  const unique=kind===4?[...new Set(item.paths.map(x=>x.value))]:
   numbersInFamily(item.family);
  if(!unique.length)continue;
  const family=kind===4?formatFamily(unique[0],4):item.family;
  if(seen.has(family))continue;
  seen.add(family);
  out.push({family,values:unique,paths:[],rootEvents:item.directRoots,
   blocks:item.physicalBlocks,crossing:false,d1:item.d1Roots,d7:item.d7Roots});
 }
 return out;
}
function calculate(candidates:Family[],heads:{jur:string;head:string}[],
 kind:Kind):Cut['outcomes'][Kind][Mode]{
 const hits:Record<string,number>={},expectedUniform:Record<string,number>={},
  rawSelections:Record<string,number>={},uniqueHeadHits:Record<string,number>={};
 for(const k of K_LIST){
  const first=candidates.slice(0,k),values=new Set(first.flatMap(x=>x.values));
  const trueHits=heads.filter(h=>values.has(h.head.slice(-kind))).length;
  const totalRaw=values.size;
  hits['top'+k]=trueHits;
  uniqueHeadHits['top'+k]=trueHits; // a head once per modality
  rawSelections['top'+k]=totalRaw;
  expectedUniform['top'+k]=Number(
   (heads.length*totalRaw/(10**kind)).toFixed(6));
 }
 return {hits,expectedUniform,rawSelections,uniqueHeadHits};
}
function combinedKinds(ranks:Cut['ranks'],heads:{jur:string;head:string}[],
 mode:Mode,k:number):{hits:number;entries:number}{
 const byKind=KINDS.map(kind=>
  new Set(ranks[kind][mode].slice(0,k).flatMap(x=>x.values)));
 const success=heads.filter(h=>KINDS.some((kind,i)=>
  byKind[i].has(h.head.slice(-kind)))).length;
 return {hits:success,entries:byKind.reduce((n,s)=>n+s.size,0)};
}
function summarize(cuts:Cut[]){
 const heads=cuts.reduce((n,c)=>n+c.heads.length,0);
 const out:any={days:new Set(cuts.map(c=>c.date)).size,cuts:cuts.length,heads,
  kind:{},combination:{}};
 for(const kind of KINDS){
  out.kind['vt'+kind]={};
  for(const mode of MODES){
   const xx=cuts.map(x=>x.outcomes[kind][mode]);
   out.kind['vt'+kind][mode]=Object.fromEntries(K_LIST.map(k=>[
    'top'+k,{
     hitHeads:xx.reduce((n,x)=>n+x.hits['top'+k],0),
     expectedUniform:Number(xx.reduce((n,x)=>n+x.expectedUniform['top'+k],0).toFixed(3)),
     rawSelections:xx.reduce((n,x)=>n+x.rawSelections['top'+k],0),
     activeCuts:xx.filter(x=>x.rawSelections['top'+k]>0).length
    }
   ]));
  }
 }
 for(const mode of MODES)
  out.combination[mode]={
   top3:cuts.reduce((n,c)=>n+c.combined[mode].top3,0),
   top5:cuts.reduce((n,c)=>n+c.combined[mode].top5,0),
   rawEntriesTop3:cuts.reduce((n,c)=>n+c.combined[mode].rawEntriesTop3,0),
   rawEntriesTop5:cuts.reduce((n,c)=>n+c.combined[mode].rawEntriesTop5,0)
  };
 return out;
}
async function analyze(year:string){
 const dates=daySequence(year+'-07-15',year+'-'+LAST_DAY);
 const source=new Map<string,CabezasDia>(),aux=new Map<string,AuxSourceObservation>();
 const errors:Record<string,string>={};let index=0;
 await Promise.all(Array.from({length:8},async()=>{
  while(index<dates.length){
   const date=dates[index++];
   try{const [a,b]=await Promise.all([
    descargarCabezas(date,true),fetchAuxiliaryHeads(date)]);
    source.set(date,a);aux.set(date,b);
   }catch(e){errors[date]=String(e)}
  }
 }));
 if(Object.keys(errors).length>7)throw Error('Demasiados errores '+year+' '+JSON.stringify(errors));
 if(year==='2026'){
  const x=aux.get('2026-10-20')?.heads;
  if(x?.Primera.Santiago!=='6142'||x?.Matutino.Santiago!=='9634'||
   x?.Primera.Neuquen!=='0245')throw Error('Mapeo 20/oct incompatible con Vivitusuerte');
 }
 const good=dates.filter(d=>source.has(d)&&aux.has(d)&&
  hasDrawResults(source.get(d)!)&&hasNocturnoBase(source.get(d)!));
 const sheets=new Map<string,DailySheet>(),histDay=new Map<string,HistDay>();
 for(let i=1;i<good.length;i++)sheets.set(good[i],
  buildSheet(source.get(good[i])!,source.get(good[i-1])!));
 for(const d of good)
  histDay.set(d,marksOf(d,aux.get(d)!.heads,source.get(d)!));
 const cuts:Cut[]=[];
 for(let i=2;i<good.length;i++){
  const date=good[i];if(date<year+'-'+FIRST_MONTH_DAY)continue;
  const prev=good[i-1],weekly=d7(date);
  const mainHistory:LaloHistorical[]=[
   {date:prev,period:'D−1',sheet:sheets.get(prev)!},
   ...(sheets.has(weekly)?[{date:weekly,period:'D−7' as const,
    sheet:sheets.get(weekly)!}]:[])
  ];
  const auxHistory=[
   {period:'D−1' as const,day:histDay.get(prev)!},
   ...(histDay.has(weekly)&&weekly!==prev?[{
    period:'D−7' as const,day:histDay.get(weekly)!}]:[])
  ];
  if(auxHistory.some(h=>h.day.date>=date))throw Error('FUGA AUX');
  const current=source.get(date)!,daySheet=sheets.get(date)!;
  for(const turn of TURNOS){
   const pre=preSheetAtCut(daySheet,turn,TURNOS.indexOf(turn));
   if(pre.heads[turn].length||pre.matches[turn].length)
    throw Error('FUGA +11');
   const board=auxiliaryBoard(aux.get(date)!.heads,turn);
   if(board.cells.some(c=>!board.visibleTurns.includes(c.source)))
    throw Error('FUGA columnas futuras AUX');
   const official=buildMotorLalo(pre,date,turn,mainHistory);
   const ranks={} as Cut['ranks'];
   const outcomes={} as Cut['outcomes'];
   const historicRootEvents={} as Record<Kind,number>;
   const familyCounts={} as Cut['familyCounts'];
   const heads=JURS.flatMap(jur=>{
    const head=current[turn]?.[jur]||'';
    return valid(head)?[{jur,head}]:[];
   });
   for(const kind of KINDS){
    const sourceGroups=collectCandidates(board,auxHistory,kind,'ROOT'),
     physical=collectCandidates(board,auxHistory,kind,'GEOMETRY');
    const proposed:Record<Mode,Family[]>={
     AUX_RAICES:rankedFamilies(sourceGroups,'AUX_RAICES',date,turn),
     AUX_GEOMETRIA:rankedFamilies(physical,'AUX_GEOMETRIA',date,turn),
     AUX_ALEATORIO:rankedFamilies(physical,'AUX_ALEATORIO',date,turn),
     LALO_MV1:officialFamilies(official,kind)
    };
    historicRootEvents[kind]=auxHistory.reduce(
     (n,x)=>n+x.day.marks[kind].length,0);
    ranks[kind]=Object.fromEntries(MODES.map(mode=>[mode,proposed[mode]
     .slice(0,10).map(x=>({family:x.family,values:x.values,
      roots:x.rootEvents,d1:x.d1,d7:x.d7,blocks:x.blocks,crossing:x.crossing}))
    ])) as Cut['ranks'][Kind];
    outcomes[kind]=Object.fromEntries(MODES.map(mode=>[mode,
     calculate(proposed[mode],heads,kind)])) as Cut['outcomes'][Kind];
    familyCounts[kind]=Object.fromEntries(MODES.map(mode=>
     [mode,proposed[mode].length])) as Record<Mode,number>;
   }
   const combined={} as Cut['combined'];
   for(const mode of MODES){
    const k3=combinedKinds(ranks,heads,mode,3),k5=combinedKinds(ranks,heads,mode,5);
    combined[mode]={top3:k3.hits,top5:k5.hits,
     rawEntriesTop3:k3.entries,rawEntriesTop5:k5.entries};
   }
   cuts.push({year,date,turn,heads,cells:board.cells.length,
    historicRootEvents,familyCounts,ranks,outcomes,combined});
   if(date===year+'-10-20')console.log('TRIPLE_CORTE',JSON.stringify({
    year,turn,cells:board.cells.length,roots:historicRootEvents,
    familyCounts,main:KINDS.map(kind=>({kind,
     top5:Object.fromEntries(MODES.map(mode=>[mode,ranks[kind][mode].slice(0,5)])),
     results:Object.fromEntries(MODES.map(mode=>
      [mode,outcomes[kind][mode].hits.top5]))
    })),combined}));
  }
 }
 const result={year,daysDownloaded:good.length,
  dateRange:{from:year+'-'+FIRST_MONTH_DAY,to:year+'-'+LAST_DAY},
  errors,summary:summarize(cuts),
  months:[...new Set(cuts.map(c=>c.date.slice(0,7)))].map(month=>({
   month,summary:summarize(cuts.filter(c=>c.date.startsWith(month)))
  })),
  byTurn:TURNOS.map(turn=>({turn,summary:summarize(cuts.filter(c=>c.turn===turn))})),
  cuts};
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/lalo-triple-modalidad-'+year+'.json',
  JSON.stringify(result,null,2));
 console.log('TRIPLE_RESUMEN',JSON.stringify({year,result:result.summary,
  months:result.months,byTurn:result.byTurn.map(x=>({turn:x.turn,
   combined:x.summary.combination}))}));
 return result;
}
async function main(){
 for(const year of ['2024','2025','2026'])await analyze(year);
}
void main().catch(e=>{console.error('TRIPLE_ERROR',e);process.exitCode=1});
