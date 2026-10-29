import assert from 'node:assert/strict';
import {TURNOS,diaVacio} from '../src/domain';
import type {DailySheet,SheetColumn} from '../src/sheet';
import type {InfoVisualDay} from '../src/infoTurnHistory';
import type {LaloView,LaloFamily} from '../src/motorLalo';
import type {FormKind} from '../src/motorFormasPrimero';
import {buildFormFirstVt2,buildFormFirstMotor,formPositions} from '../src/motorFormasPrimero';
import {buildFigureRescueAudit} from '../src/figureRescueAudit';
import {classifyFigureMotion,exactActivationTimeline} from '../src/figureMotionAudit';
import {reversibleFamily} from '../src/motorLalo';

const date='2026-10-29';
const columns=(values:string[]):SheetColumn[]=>TURNOS.map((turn,i)=>({
 id:i===0?'prevNocturno':TURNOS[i-1] as SheetColumn['id'],
 turno:turn,sourceLabel:turn,values:i===0?values:Array(6).fill('--')
}));
const sheet=(values:string[]):DailySheet=>({columns:columns(values),
 heads:Object.fromEntries(TURNOS.map(t=>[t,[]])),
 matches:Object.fromEntries(TURNOS.map(t=>[t,[]]))});
const past=sheet(['12','34','56','78','90','12']);
past.matches.Previa=[{turno:'Previa',jurisdiccion:'Ciudad',cabeza:'9123',
 hits:[
  {kind:'vt2',sourceId:'prevNocturno',sourceTurn:'Nocturno anterior',value:'23',
   paths:[[{row:0,col:1,digit:'2'},{row:1,col:0,digit:'3'}]]},
  {kind:'vt3',sourceId:'prevNocturno',sourceTurn:'Nocturno anterior',value:'123',
   paths:[[{row:0,col:0,digit:'1'},{row:0,col:1,digit:'2'},{row:1,col:0,digit:'3'}]]}
 ]}];
const days:InfoVisualDay[]=[{date:'2026-10-28',sheet:past,heads:diaVacio()}];
const today=sheet(['45','67','89','01','23','45']);
const mkFamily=(name:string,rank:number,kind:FormKind):LaloFamily=>({
 kind,family:name,rank,paths:[],sourceCount:1,directRoots:0,
 d7Roots:0,d1Roots:0,physicalBlocks:0,branchBlocks:0,parentFamilies:[],
 state:'EN_FORMACIÓN',rationale:'fixture'
});
const empty:LaloView={date,target:'Previa',status:'EXPERIMENTAL_SIN_VALIDACIÓN',
 roots:[],ranks:{vt2:[],vt3:[],vt4:[]}};
for(const kind of ['vt2','vt3'] as const){
 const forms=kind==='vt2'?buildFormFirstVt2(today,date,'Previa',days):
  buildFormFirstMotor(today,date,'Previa',days);
 assert(forms.top.length>1,kind+' fixture debe formar >1 familia');
 const lalo:LaloView={...empty,ranks:{...empty.ranks,
  [kind]:[mkFamily(forms.top[1].family,1,kind)]}};
 const chosen=forms.top[0];
 const head='0'.repeat(5-chosen.value.length)+chosen.value;
 const published=[{jur:'Santa Fe',head},
  {jur:'Montevideo',head},{jur:'Ciudad',head:'bad'}];
 const audit=buildFigureRescueAudit(date,'Previa',today,forms,lalo,published);
 assert.equal(audit.kind,kind);
 assert.equal(audit.publicationCount,1);
 assert.equal(audit.rescueCount,forms.top.length-1);
 assert.equal(audit.sharedCount,1);
 assert.equal(audit.rescueHeadHits,1);
 const first=audit.forms[0];
 assert.equal(first.kind,'RESCATE');
 assert.equal(first.published[0].suffix,chosen.value);
 assert(first.published[0].selectedPositionMatches);
 const expected=formPositions(today,'Previa',kind).filter(p=>{
  const col=today.columns.find(c=>c.id===p.source)!;
  const value=p.cells.map(c=>col.values[c.row][c.col]).join('');
  return value===chosen.value||[...value].reverse().join('')===chosen.value;
 });
 assert.equal(first.published[0].physicalPaths.length,expected.length,
  kind+' debe revelar todos los recorridos físicos de esa terminación');
 assert(first.published[0].physicalPaths.every(p=>p.cells.length===(kind==='vt2'?2:3)));
 const motion=classifyFigureMotion(chosen);
 assert.equal(motion.source,chosen.source);
 assert(motion.categories.length>0);
 const unranked=buildFigureRescueAudit(date,'Previa',today,forms,lalo,[]);
 assert.equal(unranked.rescueHeadHits,0);
 assert.deepEqual(unranked.forms.map(x=>x.choice.positionKey),audit.forms.map(x=>x.choice.positionKey),
  'POST no puede modificar las posiciones ya seleccionadas');
 const poisoned={...today,heads:{...today.heads,Previa:['9999']},
  matches:{...today.matches,Previa:past.matches.Previa},
  columns:today.columns.map((c,i)=>i>0?{...c,values:Array(6).fill('99')}:c)};
 assert.deepEqual(buildFigureRescueAudit(date,'Previa',poisoned,forms,lalo,published),audit,
  'La hoja PRE debe ignorar cabezas y columnas POST');
 console.log('MOVIMIENTO_IGUALDAD_VT2_VT3_OK',JSON.stringify({
  kind,rescues:audit.rescueCount,routes:first.published[0].physicalPaths.length,
  motionCategories:motion.categories,postedSuffix:head.slice(-(kind==='vt2'?2:3))
 }));
}
// Controlled physical movement example with same source / shifted / different source.
const loc=buildFormFirstMotor(today,date,'Previa',days).top[0];
const root=loc.support.roots[0];
const other={
 ...loc,support:{...loc.support,roots:[
  {...root,cells:loc.cells,source:loc.source},
  {...root,event:'V',date:'2026-10-27',anchor:Math.min(5,loc.anchor+1),
    cells:loc.cells.map(x=>({...x,row:Math.min(5,x.row+1)}))},
  {...root,event:'C',date:'2026-10-26',source:'Previa' as const}
 ]}
};
const m=classifyFigureMotion(other);
assert(m.exactEvents>=1);
assert(m.verticalEvents>=1);
assert(m.sourceChangeEvents>=1);
assert(m.categories.includes('MISMA_POSICION')&&
 m.categories.includes('DESPLAZAMIENTO_VERTICAL')&&m.categories.includes('CAMBIO_FUENTE'));
// A two-cell upright shape can slide LEFT/RIGHT without any row change.
const v2=buildFormFirstVt2(today,date,'Previa',days).top[0];
const left=[{row:0,col:0},{row:1,col:0}],right=[{row:0,col:1},{row:1,col:1}];
const horizontalCase={...v2,source:'prevNocturno' as const,
 shape:'0:0>1:0',anchor:0,cells:right,
 support:{...v2.support,roots:[
  {...v2.support.roots[0],source:'prevNocturno' as const,
   shape:'0:0>1:0',anchor:0,cells:left,event:'H'},
  {...v2.support.roots[0],source:'prevNocturno' as const,
   shape:'0:0>1:0',anchor:1,cells:[
    {row:1,col:0},{row:2,col:0}],event:'D'}
 ]}};
const hm=classifyFigureMotion(horizontalCase);
assert.equal(hm.exactEvents,0);
assert.equal(hm.horizontalEvents,1,'Mover sólo una columna no es desplazamiento vertical');
assert.equal(hm.verticalEvents,0);
assert.equal(hm.diagonalEvents,1,'Mover fila y columna es diagonal');
assert(hm.categories.includes('DESPLAZAMIENTO_HORIZONTAL')&&
 hm.categories.includes('DESPLAZAMIENTO_DIAGONAL'));
const six=['2026-10-28','2026-10-27','2026-10-26','2026-10-25',
 '2026-10-24','2026-10-23'];
const positionRoot=loc.support.roots[0];
const sequence=(dates:string[])=>exactActivationTimeline({
 ...loc,support:{...loc.support,roots:dates.map((date,i)=>({
  ...positionRoot,source:loc.source,shape:loc.shape,
  cells:loc.cells,anchor:loc.anchor,date,event:'TEST-'+i
 }))}},six);
assert.equal(sequence([]).state,'SIN_ACTIVACION_EXACTA');
assert.equal(sequence([six[0]]).state,'ACTIVACION_NUEVA');
assert.equal(sequence([six[0],six[1]]).state,'ACTIVA_REPETIDA');
assert.equal(sequence([six[0],six[2]]).state,'REAPARECIO_TRAS_PAUSA');
assert.equal(sequence([six[1],six[3]]).state,'SIN_ACTIVACION_RECIENTE');
assert.equal(sequence([six[0],six[2]]).currentStreak,1);
assert.equal(sequence([six[0],six[2]]).days,2);
console.log('TEST_MOVIMIENTOS_DOBLE_OK');
