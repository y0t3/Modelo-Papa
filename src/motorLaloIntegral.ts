/**
 * MODELO LALO INTEGRAL · laboratorio independiente, sin alterar MV1.
 *
 * Una sola decisión VT2/VT3/VT4 basada en:
 *   a) motor oficial +11, cuyos recorridos NO cruzan columnas;
 *   b) marcas GANADORAS antiguas Santiago-Neuquén, trasladadas como
 *      movimientos físicos a una grilla RAW que SÍ cruza turnos por roce.
 *
 * Se juntan FAMILIAS, no se mezclan geometrías. Una coincidencia física
 * no es un voto independiente por ruta ni una cabeza inventada.
 *
 * Política fija de selección, NO entrenada mirando el resultado objetivo:
 *   score = 65 / rankMV1 + 35 / rankAUX, término ausente = 0.
 * Se prioriza así la selección de Lalo, sin prohibir candidatas solo AUX.
 * El respaldo de ambas hojas queda EXPLICADO pero no recibe un peso extra
 * por cantidad de caminos; estudios anteriores no validaron ese peso.
 *
 * VT4: hija = cifra prefijada a MADRE VT3. Las madres admisibles salen
 * de las primeras 10 familias VT3 del propio INTEGRAL. Nunca se invierte
 * la cuaterna, y solo se cubren orientaciones físicamente comprobadas.
 *
 * Es una hipótesis para backtest, NO la implementación de producción.
 */
import {TURNOS,JURS} from './domain';
import type {Turno,CabezasDia} from './domain';
import type {DailySheet} from './sheet';
import {auxiliaryBoard,findAuxPaths,auxCanonicalPath} from './auxSantiagoNeuquen';
import type {AuxiliaryHeads,AuxiliaryBoard,AuxPath,AuxSourceTurn} from './auxSantiagoNeuquen';
import {projectAuxShape} from './auxWinningMemory';
import {buildMotorLalo,reversibleFamily,vt4PrefixFamily} from './motorLalo';
import type {LaloView,LaloHistorical,LaloKind} from './motorLalo';
export type IntegralKind=2|3|4;
export type AuxWinningEvent={id:string;date:string;turn:Turno;jur:string;
 head:string;length:IntegralKind;paths:AuxPath[]};
export type IntegralAuxHistory={date:string;
 events:Record<IntegralKind,AuxWinningEvent[]>};
export type IntegralPast={date:string;period:'D−1'|'D−7';
 plus11:DailySheet;aux:IntegralAuxHistory};
export type IntegralFamily={
 kind:IntegralKind;family:string;mother:string|null;rank:number;
 values:string[];score:number;
 laloRank:number|null;auxRank:number|null;rootEvents:number;
 d1Roots:number;d7Roots:number;
 plus11Sources:string[];auxSources:AuxSourceTurn[];
 auxCrossTurn:boolean;plus11Paths:number;auxPaths:number;
 evidence:'LALO'|'AUX'|'DOS_HOJAS';
};
export type IntegralPrediction={
 date:string;turn:Turno;status:'LABORATORIO_NO_VALIDADO';
 ranks:Record<IntegralKind,IntegralFamily[]>;
 baseline:LaloView;auxiliaryCandidates:Record<IntegralKind,IntegralFamily[]>;
 statement:string
};
const KINDS:IntegralKind[]=[2,3,4];
const digits=(s:string)=>/^\d{4}$/.test(s);
const pathKey=(p:AuxPath)=>p.map(c=>c.row+':'+c.col).sort().join(',');
const motherOf=(v:string)=>reversibleFamily(v.slice(1));
const familyOf=(n:IntegralKind,v:string)=>
 n===4?vt4PrefixFamily(motherOf(v),v[0]).join('/'):reversibleFamily(v);
const motherFromLabel=(n:IntegralKind,f:string)=>
 n===4?motherOf(f.split('/')[0]):null;
const members=(family:string)=>[...new Set(family.split('/'))];
type AuxGroup={family:string;mother:string|null;values:Set<string>;
 roots:Set<string>;d1:Set<string>;d7:Set<string>;paths:Map<string,AuxPath>;
 crossing:boolean;sources:Set<AuxSourceTurn>};
type AuxRank={family:string;mother:string|null;rank:number;values:string[];
 roots:number;d1:number;d7:number;paths:AuxPath[];crossing:boolean;
 sources:AuxSourceTurn[]};
export function extractIntegralAuxHistory(date:string,aux:AuxiliaryHeads,
 draws:CabezasDia):IntegralAuxHistory{
 const events:Record<IntegralKind,AuxWinningEvent[]>={2:[],3:[],4:[]};
 for(const turn of TURNOS){
  const board=auxiliaryBoard(aux,turn);
  if(!board.cells.length)continue;
  for(const jur of JURS){
   const head=draws[turn]?.[jur]||'';
   if(!digits(head))continue;
   // Recolectar SOLO cabezas que realmente salieron y sus sufijos exactos.
   for(const length of KINDS){
    const routes=findAuxPaths(board,head.slice(-length));
    if(!routes.length)continue;
    events[length].push({
     id:[date,turn,jur,head,'VT'+length].join('|'),
     date,turn,jur,head,length,paths:routes
    });
   }
  }
 }
 return {date,events};
}
/** Traslada solamente la FORMA (contactos) de ganadoras anteriores. */
function auxiliaryRanks(board:AuxiliaryBoard,history:IntegralPast[],
 length:IntegralKind):AuxRank[]{
 const groups=new Map<string,AuxGroup>();
 for(const record of history){
  for(const mark of record.aux.events[length]){
   for(const oldPath of mark.paths){
    for(const path of projectAuxShape(board,oldPath)){
     const value=path.map(c=>c.digit).join('');
     const family=familyOf(length,value);
     if(!family)continue;
     const group=groups.get(family)||{
      family,mother:motherFromLabel(length,family),
      values:new Set<string>(),roots:new Set<string>(),d1:new Set<string>(),
      d7:new Set<string>(),paths:new Map<string,AuxPath>(),
      crossing:false,sources:new Set<AuxSourceTurn>()
     };
     group.roots.add(mark.id);
     (record.period==='D−1'?group.d1:group.d7).add(mark.id);
     const unique=auxCanonicalPath(path);
     if(!group.paths.has(unique))group.paths.set(unique,path);
     if(length===4)group.values.add(value);
     else members(family).forEach(v=>group.values.add(v));
     const sources=new Set(path.map(c=>c.source));
     if(sources.size>1)group.crossing=true;
     sources.forEach(src=>group.sources.add(src));
     groups.set(family,group);
    }
   }
  }
 }
 const ranked=[...groups.values()].map(g=>({
  family:g.family,mother:g.mother,rank:0,values:[...g.values].sort(),
  roots:g.roots.size,d1:g.d1.size,d7:g.d7.size,
  paths:[...g.paths.values()],crossing:g.crossing,
  sources:[...g.sources].sort()
 }));
 ranked.sort((a,b)=>b.roots-a.roots||b.d1-a.d1||b.d7-a.d7||
  Number(b.crossing)-Number(a.crossing)||
  new Set(b.paths.map(pathKey)).size-new Set(a.paths.map(pathKey)).size||
  a.family.localeCompare(b.family));
 return ranked.map((a,i)=>({...a,rank:i+1}));
}

/** Lector AUX independiente, sin mezclar los rankings de Lalo. */
export function buildAuxIndependent(date:string,target:Turno,
 auxHeads:AuxiliaryHeads,history:IntegralPast[]):
 Record<IntegralKind,AuxRank[]>{
 if(history.some(h=>h.date>=date))throw Error('Fuga en lectura AUX');
 const board=auxiliaryBoard(auxHeads,target);
 const result={} as Record<IntegralKind,AuxRank[]>;
 const vt3=auxiliaryRanks(board,history,3);
 const mothers=new Set(vt3.slice(0,10).map(x=>x.family));
 result[3]=vt3;result[2]=auxiliaryRanks(board,history,2);
 result[4]=auxiliaryRanks(board,history,4)
  .filter(x=>x.mother!==null&&mothers.has(x.mother))
  .map((x,i)=>({...x,rank:i+1}));
 return result;
}

export function buildMotorLaloIntegral(date:string,target:Turno,
 maskedPlus11:DailySheet,auxHeads:AuxiliaryHeads,
 history:IntegralPast[]):IntegralPrediction{
 if(!TURNOS.includes(target))throw Error('Turno objetivo no reconocido');
 if(history.some(h=>h.date>=date||h.aux.date!==h.date))
  throw Error('Fuga temporal: raíces auxiliares posteriores al PRE');
 if(new Set(history.map(h=>h.date)).size!==history.length)
  throw Error('Jornada histórica duplicada');
 const old:LaloHistorical[]=history.map(h=>({
  date:h.date,period:h.period,sheet:h.plus11
 }));
 const main=buildMotorLalo(maskedPlus11,date,target,old);
 const board=auxiliaryBoard(auxHeads,target);
 const ranks={} as IntegralPrediction['ranks'];
 const auxOnly={} as IntegralPrediction['auxiliaryCandidates'];
 for(const kind of [3,2,4] as IntegralKind[]){
  const label=('vt'+kind) as LaloKind;
  const lalo=main.ranks[label];
  const aux=auxiliaryRanks(board,history,kind);
  const mL=new Map(lalo.map((c,i)=>[c.family,{...c,rank:i+1}]));
  const mA=new Map(aux.map((c,i)=>[c.family,c]));
  const unique=new Set<string>([...mL.keys(),...mA.keys()]);
  // Restricción de genealogía de VT4, ANTES de ordenar las hijas.
  const mothers=kind===4?
   new Set(ranks[3].slice(0,10).map(f=>f.family)):null;
  const result:IntegralFamily[]=[];
  for(const family of unique){
   const l=mL.get(family),a=mA.get(family);
   const mother=motherFromLabel(kind,family);
   if(kind===4&&!mothers?.has(mother||''))continue;
   // No convertir familia en "invertir 4 cifras": únicamente lo formado.
   const lvalues=l?(kind===4?[...new Set(l.paths.map(p=>p.value))]:members(family)):[];
   const values=[...new Set([...lvalues,...(a?.values||[])])].sort();
   if(!values.length||values.some(s=>s.length!==kind))continue;
   const plus11Sources=[...new Set(l?.paths.map(p=>p.sourceId)||[])];
   const auxSourceSet=new Set<AuxSourceTurn>(a?.sources||[]);
   // Corroborar caminos físicos auxiliares de familias admitidas por Lalo,
   // aunque NO tengan raíces históricas propias en la auxiliar.
   let extraAuxPaths=0,extraCross=false;
   for(const value of lvalues){
    for(const p of findAuxPaths(board,value)){
     extraAuxPaths++;
     const sources=new Set(p.map(c=>c.source));
     sources.forEach(x=>auxSourceSet.add(x));
     if(sources.size>1)extraCross=true;
    }
   }
   const existsOnPlus11=plus11Sources.length>0;
   const existsOnAux=auxSourceSet.size>0;
   const familyEntry:IntegralFamily={
    kind,family,mother,rank:0,values,
    score:Number(((l?65/l.rank:0)+(a?35/a.rank:0)).toFixed(9)),
    laloRank:l?.rank||null,auxRank:a?.rank||null,
    rootEvents:a?.roots||0,d1Roots:a?.d1||0,d7Roots:a?.d7||0,
    plus11Sources,auxSources:[...auxSourceSet].sort(),
    plus11Paths:l?.paths.length||0,
    auxPaths:(a?.paths.length||0)+extraAuxPaths,
    auxCrossTurn:!!a?.crossing||extraCross,
    evidence:existsOnPlus11&&existsOnAux?'DOS_HOJAS':
     existsOnPlus11?'LALO':'AUX'
   };
   result.push(familyEntry);
  }
  result.sort((a,b)=>b.score-a.score||
   (a.laloRank??999)-(b.laloRank??999)||
   (a.auxRank??999)-(b.auxRank??999)||a.family.localeCompare(b.family));
  ranks[kind]=result.map((x,i)=>({...x,rank:i+1}));
  auxOnly[kind]=ranks[kind].filter(x=>x.auxRank!==null);
 }
 return {date,turn:target,status:'LABORATORIO_NO_VALIDADO',
  ranks,baseline:main,auxiliaryCandidates:auxOnly,
  statement:'Integral 65%/35% por posición; geometrías +11/AUX independientes; '+
   'VT4 solo hija de madre VT3 priorizada. Reconstrucción PRE, no pronóstico sellado.'};
}
