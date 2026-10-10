// Auditoría VT3 específica del Modelo Papá, SIN cambiar el selector vigente.
// VT3 es el objetivo; su VT2 está contenido, no representa un segundo evento
// independiente. Una extensión VT4 solo se considera posibilidad geométrica,
// NO acierto predictivo salvo que se haya elegido la cifra adicional ANTES.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import type {DatedSheet} from './cycle7d';
import type {CombinedCandidate} from './combinedReader7d';
import {readCombined7D} from './combinedReader7d';
import {freezeBeforeTurn7D,physicalPoolBefore7D} from './causalReplay7d';

export type VT3Preview7D={
 value:string;vt2:string;sourceId:string;cells:string[];
 geometry:string;signals:string[];score:number;
 extensionsVT4:string[];
 exactVT3:boolean;vt2ContainedHit:boolean;extensionVT4Covered:boolean;
};
export type VT3Turn7D={date:string;turn:Turno;heads:string[];
 ranked:VT3Preview7D[];physicalPoolSize:number;physicalWinningVT3:number;
 expectedPhysicalHits:number;foundVT3:number;foundVT2:number;
 vt2Only:number;extensionCoverage:number};
export type VT3Summary7D={top:3|5;turns:number;turnsWithVT3:number;abstentions:number;
 picks:number;exactVT3:number;vt2Covered:number;vt2Only:number;
 extensionCoverage:number;physicalExpectedVT3:number;
 geometricDescriptions:Record<string,{picks:number;vt3Hits:number}>;
 rows:VT3Turn7D[];note:string[]};
const onlyHeads=(sheet:DailySheet,turn:Turno)=>[...new Set((sheet.heads[turn]||[])
 .filter(x=>/^\d{4}$/.test(x)))];
const valid=(a:{row:number;col:number},b:{row:number;col:number})=>
 Math.abs(a.row-b.row)<=1&&Math.abs(a.col-b.col)<=1&&
 (a.row!==b.row||a.col!==b.col);
const signature=(p:CombinedCandidate['path'])=>p.slice(1).map((c,i)=>
 (c.row-p[i].row)+':'+(c.col-p[i].col)).join('>');
export function geometricVT4Extensions7D(candidate:CombinedCandidate,
 before:DailySheet):string[]{
 if(candidate.kind!=='vt3'||candidate.path.length!==3)
  throw Error('Se requiere un recorrido VT3 físico');
 const col=before.columns.find(x=>x.id===candidate.sourceId);
 if(!col)return [];
 const route=candidate.path;
 if(route.some((p,i)=>p.row<0||p.row>=6||p.col<0||p.col>=2||
  !/^\d{2}$/.test(col.values[p.row]||'')||
  col.values[p.row][p.col]!==p.digit||
  i>0&&!valid(route[i-1],p)||
  route.some((x,j)=>j<i&&x.row===p.row&&x.col===p.col)))throw Error('Ruta VT3 inválida');
 const prefix=new Set<string>();
 for(let r=0;r<6;r++)for(let c=0;c<2;c++){
  if(!/^\d{2}$/.test(col.values[r]||''))continue;
  const p={row:r,col:c};
  if(!valid(p,route[0])||route.some(x=>x.row===r&&x.col===c))continue;
  prefix.add(col.values[r][c]+candidate.value);
 }
 return [...prefix].sort();
}
const compare=(a:string,b:string)=>a.localeCompare(b);
export function auditVT3Chronological7D(input:DatedSheet[],top:3|5):VT3Summary7D{
 if(top!==3&&top!==5)throw Error('Top VT3 inválido');
 const ordered=[...input].sort((a,b)=>compare(a.date,b.date));
 if(ordered.some((x,i)=>! /^\d{4}-\d{2}-\d{2}$/.test(x.date)||
  i>0&&x.date===ordered[i-1].date))throw Error('Fecha inválida o repetida');
 const rows:VT3Turn7D[]=[];const geometries:VT3Summary7D['geometricDescriptions']={};
 let turnsWithVT3=0,picks=0,exactVT3=0,vt2Covered=0,vt2Only=0;
 let extensionCoverage=0,physicalExpectedVT3=0;
 for(let i=6;i<ordered.length;i++){
  const day=ordered[i],history=ordered.slice(i-6,i);
  for(const turn of TURNOS){
   const before=freezeBeforeTurn7D(day.sheet,turn);
   // Unicamente informacion anterior al turno; se revela la cabeza DESPUÉS de proyectar.
   const projected=readCombined7D(history,before,day.date,turn,{vt3Limit:top});
   const ranked=projected.candidates.filter(x=>x.kind==='vt3');
   const heads=onlyHeads(day.sheet,turn);
   if(!heads.length)continue;
   const physical=physicalPoolBefore7D(history,before,day.date,turn).vt3;
   const actualThree=new Set(heads.map(x=>x.slice(-3)));
   const physicalWinningVT3=[...physical].filter(x=>actualThree.has(x)).length;
   if(ranked.some(x=>!physical.has(x.value)))throw Error('Candidata no incluida en D-7');
   const previews=ranked.map(x=>{
    const embedded=x.value.slice(-2),ext=geometricVT4Extensions7D(x,before);
    const exact=heads.some(h=>h.slice(-3)===x.value);
    const vt2=heads.some(h=>h.slice(-2)===embedded);
    const coverage=ext.some(v=>heads.includes(v));
    const geometry=signature(x.path);
    if(!geometries[geometry])geometries[geometry]={picks:0,vt3Hits:0};
    geometries[geometry].picks++;
    if(exact)geometries[geometry].vt3Hits++;
    return {value:x.value,vt2:embedded,sourceId:x.sourceId,
     cells:x.path.map(p=>p.row+':'+p.col),geometry,
     signals:x.signals.map(s=>s.name),score:x.score,extensionsVT4:ext,
     exactVT3:exact,vt2ContainedHit:vt2,extensionVT4Covered:coverage};
   });
   const hits=previews.filter(x=>x.exactVT3).length;
   const vt2hits=previews.filter(x=>x.vt2ContainedHit).length;
   const vt2only=previews.filter(x=>x.vt2ContainedHit&&!x.exactVT3).length;
   const extended=previews.filter(x=>x.extensionVT4Covered).length;
   const random=physical.size?previews.length*physicalWinningVT3/physical.size:0;
   rows.push({date:day.date,turn,heads,ranked:previews,
    physicalPoolSize:physical.size,physicalWinningVT3,
    expectedPhysicalHits:random,foundVT3:hits,foundVT2:vt2hits,
    vt2Only:vt2only,extensionCoverage:extended});
   picks+=previews.length;exactVT3+=hits;vt2Covered+=vt2hits;
   vt2Only+=vt2only;extensionCoverage+=extended;physicalExpectedVT3+=random;
   if(previews.length)turnsWithVT3++;
  }
 }
 return {top,turns:rows.length,turnsWithVT3,abstentions:rows.length-turnsWithVT3,
  picks,exactVT3,vt2Covered,vt2Only,extensionCoverage,
  physicalExpectedVT3,geometricDescriptions:geometries,rows,
  note:[
   'Ranking VT3 por recorrido ganador D-7 sin cambiar los pesos existentes.',
   'Acierto VT3 implica el VT2 sufijo en la misma cabeza: NO es una segunda observacion independiente.',
   'VT2 solo registra cuantas lecturas cortas coincidieron SIN acertar el VT3 completo.',
   'Extensión VT4 es cobertura de prefijos fisicamente contiguos, NO pronostico VT4 sin prefijo previamente elegido.',
   'Control fisico D-7 usa el mismo presupuesto de cifras seleccionadas por turno.',
   'Esta auditoria retrospectiva NO demuestra rendimiento prospectivo.'
  ]};
}
