// MODELO PAPÁ — continuidad de forma VT3 DESPLAZADA entre D−14 y D−7.
// Una forma es la secuencia ordenada de pasos entre celdas. La figura puede
// mudar de fila o lado dentro de la MISMA columna física. Las dos hojas
// históricas deben haber marcado realmente la forma como ganadora.
// Sin nuevas candidatas: se reordena el Top3 físico D−7 congelado.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import type {DatedSheet} from './cycle7d';
import type {MarkedPath} from './markedSheet7d';
import {reconstructMarkedMoments} from './markedSheet7d';
import {readCombined7D} from './combinedReader7d';
import {freezeBeforeTurn7D,physicalPoolBefore7D} from './causalReplay7d';

export type TranslatedVT3Proof={
 sourceId:string;headD14:string;headD7:string;
 coordinatesD14:string[];coordinatesD7:string[];
 steps:string;moveRows:number;moveCols:number;
 movement:'SUBE'|'BAJA'|'LATERAL';
};
export type TranslatedVT3Candidate={
 value:string;vt2:string;sourceId:string;score:number;
 representativeRoute:string[];proofs:TranslatedVT3Proof[];
};
export type TranslatedVT3Selection={
 date:string;turn:Turno;bothWeeks:boolean;poolSize:number;
 movementEligible:number;baseline:TranslatedVT3Candidate[];
 translated:TranslatedVT3Candidate[];changed:number;
};
export type TranslatedVT3Turn={
 date:string;turn:Turno;heads:string[];baseline:string[];translated:string[];
 selection:TranslatedVT3Selection;hitsBaseline:number;hitsTranslated:number;
 vt2Baseline:number;vt2Translated:number;physicalPoolSize:number;
 expectedPhysical:number;
};
export type TranslatedVT3Audit={
 protocol:'VT3_TRANSLATED_WINNER_GEOMETRY_D14_D7_V1';
 turns:number;picks:number;movementEligible:number;changed:number;
 baselineHits:number;translatedHits:number;vt2Baseline:number;vt2Translated:number;
 turnsImproved:number;turnsWorsened:number;turnsEqual:number;
 expectedPhysical:number;directionCounts:Record<string,number>;
 rows:TranslatedVT3Turn[];notes:string[];
};
const dayMinus=(date:string,n:number)=>{
 const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-n);
 return d.toISOString().slice(0,10);
};
const pos=(p:{row:number;col:number})=>p.row+':'+p.col;
const coords=(p:{row:number;col:number}[])=>p.map(pos);
const shape=(p:{row:number;col:number}[])=>p.slice(1).map((x,i)=>
  (x.row-p[i].row)+','+(x.col-p[i].col)).join('>');
const currentValue=(path:MarkedPath,current:DailySheet):string|undefined=>{
 const col=current.columns.find(x=>x.id===path.sourceId);
 if(!col)return undefined;
 const values=path.route.map(x=>col.values[x.row]?.[x.col]||'');
 return values.every(x=>/^\d$/.test(x))?values.join(''):undefined;
};
const heads=(sheet:DailySheet,turn:Turno)=>
 [...new Set((sheet.heads[turn]||[]).filter(x=>/^\d{4}$/.test(x)))];
const cmp=(a:string,b:string)=>a.localeCompare(b);
/** No puntúa por cantidad de marcas superpuestas: prioridad binaria por candidato. */
export function selectTranslatedVT3D14D7(prior:DatedSheet[],before:DailySheet,
 date:string,turn:Turno):TranslatedVT3Selection{
 if(!TURNOS.includes(turn)||prior.some(x=>x.date>=date))throw Error('Fuga temporal o turno inválido');
 const d7=prior.find(x=>x.date===dayMinus(date,7));
 const d14=prior.find(x=>x.date===dayMinus(date,14));
 const safe=freezeBeforeTurn7D(before,turn);
 const last6=[...prior].sort((a,b)=>cmp(a.date,b.date)).slice(-6);
 const universe=readCombined7D(last6,safe,date,turn,{vt3Limit:'ALL'})
  .candidates.filter(x=>x.kind==='vt3');
 const weeks=d7&&d14?reconstructMarkedMoments([d14,d7]):[];
 const marked7=weeks.find(x=>x.date===d7?.date&&x.turn===turn)?.marks.filter(x=>x.kind==='vt3')||[];
 const marked14=weeks.find(x=>x.date===d14?.date&&x.turn===turn)?.marks.filter(x=>x.kind==='vt3')||[];
 // Turno de salida ya emparejado; la clave conserva origen de columna,
 // geometría en orden y sentidos, sin permitir atravesar columnas.
 const oldShapes=new Map<string,MarkedPath[]>();
 for(const m of marked14){
  const key=m.sourceId+'|'+shape(m.route);
  const arr=oldShapes.get(key)||[];arr.push(m);oldShapes.set(key,arr);
 }
 const enriched:TranslatedVT3Candidate[]=universe.map(c=>{
  const proofs:TranslatedVT3Proof[]=[];
  const visited=new Set<string>();
  for(const fresh of marked7){
   if(fresh.sourceId!==c.sourceId||currentValue(fresh,safe)!==c.value)continue;
   const old=oldShapes.get(fresh.sourceId+'|'+shape(fresh.route))||[];
   for(const past of old){
    // Misma ruta absoluta no es TRASLACIÓN: ya se probó aparte.
    if(past.cells.join('>')===fresh.cells.join('>'))continue;
    const dr=fresh.route[0].row-past.route[0].row;
    const dc=fresh.route[0].col-past.route[0].col;
    if(dr===0&&dc===0)throw Error('Geometría idéntica con huella distinta');
    const proofKey=past.cells.join('>')+'|'+fresh.cells.join('>');
    if(visited.has(proofKey))continue;visited.add(proofKey);
    proofs.push({sourceId:fresh.sourceId,headD14:past.head,headD7:fresh.head,
     coordinatesD14:[...past.cells],coordinatesD7:[...fresh.cells],
     steps:shape(fresh.route),moveRows:dr,moveCols:dc,
     movement:dr<0?'SUBE':dr>0?'BAJA':'LATERAL'});
   }
  }
  return {value:c.value,vt2:c.value.slice(-2),sourceId:c.sourceId,
   representativeRoute:coords(c.path),score:c.score,proofs};
 });
 const limit=Math.min(3,enriched.length);
 const baseline=enriched.slice(0,limit);
 const translated=[...enriched].sort((a,b)=>
  Number(b.proofs.length>0)-Number(a.proofs.length>0)||
  b.score-a.score||cmp(a.value,b.value)).slice(0,limit);
 const old=new Set(baseline.map(x=>x.value));
 return {date,turn,bothWeeks:!!d7&&!!d14,poolSize:enriched.length,
  movementEligible:enriched.filter(x=>x.proofs.length>0).length,
  baseline,translated,changed:translated.filter(x=>!old.has(x.value)).length};
}
export function auditTranslatedVT3D14D7(input:DatedSheet[]):TranslatedVT3Audit{
 const days=[...input].sort((a,b)=>cmp(a.date,b.date));
 if(days.some((x,i)=>!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||
  (i>0&&x.date===days[i-1].date)))throw Error('Fechas duplicadas o inválidas');
 const rows:TranslatedVT3Turn[]=[];
 let picks=0,movementEligible=0,changed=0,baselineHits=0,translatedHits=0;
 let vt2Baseline=0,vt2Translated=0,turnsImproved=0,turnsWorsened=0,turnsEqual=0;
 let expectedPhysical=0;
 const directionCounts:Record<string,number>={SUBE:0,BAJA:0,LATERAL:0};
 for(let i=6;i<days.length;i++){
  const day=days[i],prior=days.slice(0,i);
  for(const turn of TURNOS){
   const safe=freezeBeforeTurn7D(day.sheet,turn);
   const selection=selectTranslatedVT3D14D7(prior,safe,day.date,turn);
   const actual=heads(day.sheet,turn);
   if(!actual.length||!selection.bothWeeks)continue;
   const base=selection.baseline.map(x=>x.value);
   const projected=selection.translated.map(x=>x.value);
   if(base.length!==projected.length||new Set(projected).size!==projected.length)
    throw Error('Cambió el presupuesto de candidatos');
   const eligible=physicalPoolBefore7D(prior,safe,day.date,turn).vt3;
   if([...base,...projected].some(x=>!eligible.has(x)))
    throw Error('Candidata no pertenece a rutas ganadoras físicas de D−7');
   const winner3=new Set(actual.map(x=>x.slice(-3)));
   const winner2=new Set(actual.map(x=>x.slice(-2)));
   const hb=base.filter(x=>winner3.has(x)).length;
   const ht=projected.filter(x=>winner3.has(x)).length;
   const b2=base.filter(x=>winner2.has(x.slice(-2))).length;
   const t2=projected.filter(x=>winner2.has(x.slice(-2))).length;
   const exp=eligible.size?base.length*[...eligible].filter(x=>winner3.has(x)).length/eligible.size:0;
   rows.push({date:day.date,turn,heads:actual,baseline:base,translated:projected,
    selection,hitsBaseline:hb,hitsTranslated:ht,vt2Baseline:b2,
    vt2Translated:t2,physicalPoolSize:eligible.size,expectedPhysical:exp});
   picks+=base.length;movementEligible+=selection.movementEligible;changed+=selection.changed;
   baselineHits+=hb;translatedHits+=ht;vt2Baseline+=b2;vt2Translated+=t2;
   expectedPhysical+=exp;
   if(ht>hb)turnsImproved++;else if(ht<hb)turnsWorsened++;else turnsEqual++;
   for(const item of selection.translated)if(item.proofs.length){
    // Se informa UNA dirección representativa por candidata, sin usar su acierto
    // ni multiplicar por cantidad de trayectos históricos equivalentes.
    directionCounts[item.proofs[0].movement]++;
   }
  }
 }
 return {protocol:'VT3_TRANSLATED_WINNER_GEOMETRY_D14_D7_V1',
  turns:rows.length,picks,movementEligible,changed,baselineHits,translatedHits,
  vt2Baseline,vt2Translated,turnsImproved,turnsWorsened,turnsEqual,
  expectedPhysical,directionCounts,rows,notes:[
   'Todas las rutas ganadoras VT3 de D−14 y D−7, mismo turno y columna, con dirección y orden de pasos iguales.',
   'Traslación requiere al menos una celda absoluta diferente. Se preservan desplazamiento vertical y lateral para estudio descriptivo.',
   'La ruta D−7 se proyecta al tablero D anterior al resultado, sin cruzar columnas ni usar cabezas del objetivo.',
   'Mismo universo VT3 D−7, mismo Top3 y ranking original para empates. La señal es binaria: ninguna suma por rutas repetidas.',
   'Se registra VT2 anidado aparte, no como acierto estadístico independiente.',
   'Los períodos históricos ya inspeccionados NO demuestran ventaja prospectiva.'
  ]};
}
