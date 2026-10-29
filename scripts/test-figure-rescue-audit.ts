import assert from 'node:assert/strict';
import {TURNOS,diaVacio} from '../src/domain';
import type {DailySheet,SheetColumn} from '../src/sheet';
import type {InfoVisualDay} from '../src/infoTurnHistory';
import type {LaloView,LaloFamily} from '../src/motorLalo';
import {reversibleFamily} from '../src/motorLalo';
import {buildFormFirstMotor,formPositions} from '../src/motorFormasPrimero';
import {buildFigureRescueAudit} from '../src/figureRescueAudit';

const date='2026-10-29';
const columns=(values:string[]):SheetColumn[]=>
 TURNOS.map((t,i)=>({id:i===0?'prevNocturno':TURNOS[i-1] as SheetColumn['id'],
  turno:t,sourceLabel:t,values:i===0?values:Array(6).fill('--')}));
const blank=(values:string[]):DailySheet=>({columns:columns(values),
 heads:Object.fromEntries(TURNOS.map(t=>[t,[]])),
 matches:Object.fromEntries(TURNOS.map(t=>[t,[]]))});
const old=blank(['12','34','56','78','90','12']);
old.matches.Previa=[{turno:'Previa',jurisdiccion:'Ciudad',cabeza:'9123',
 hits:[{kind:'vt3',sourceId:'prevNocturno',sourceTurn:'Nocturno anterior',
  value:'123',paths:[[
   {row:0,col:0,digit:'1'},{row:0,col:1,digit:'2'},
   {row:1,col:0,digit:'3'}
  ]]}]}];
const days:InfoVisualDay[]=[{date:'2026-10-28',sheet:old,heads:diaVacio()}];
const pre=blank(['45','67','89','01','23','45']);
const forms=buildFormFirstMotor(pre,date,'Previa',days);
assert(forms.top.length>=2);
const shared=forms.top[1].family;
const family=(name:string,rank:number):LaloFamily=>({
 kind:'vt3',family:name,rank,paths:[],sourceCount:1,directRoots:0,
 d7Roots:0,d1Roots:0,physicalBlocks:0,branchBlocks:0,parentFamilies:[],
 state:'EN_FORMACIÓN',rationale:'test'
});
const exclusive=formPositions(pre,'Previa').map(p=>{
 const col=pre.columns.find(c=>c.id===p.source)!;
 return reversibleFamily(p.cells.map(c=>col.values[c.row][c.col]).join(''));
}).find(f=>!forms.top.some(x=>x.family===f));
assert(exclusive,'El fixture necesita familia física fuera del Top de Formas');
const lalo:LaloView={date,target:'Previa',status:'EXPERIMENTAL_SIN_VALIDACIÓN',
 roots:[],ranks:{vt2:[],vt3:[family(shared,1),family(exclusive!,2)],vt4:[]}};
const rescue=forms.top.find(x=>x.family!==shared)!;
const head='00'+rescue.family.split('/')[0]; // 5 cifras, preservar ceros iniciales
const observed=[
 {jur:'Santa Fe',head},
 {jur:'Montevideo',head}, // expresamente omitida
 {jur:'Ciudad',head:'bad'}
];
const audit=buildFigureRescueAudit(date,'Previa',pre,forms,lalo,observed);
assert.equal(audit.publicationCount,1);
assert.equal(audit.sharedCount,1);
assert.equal(audit.rescueCount,forms.top.length-1);
assert.equal(audit.laloOnlyCount,1);
assert.equal(audit.rescueHeadHits,1);
assert.equal(audit.sharedHeadHits,0);
assert.equal(audit.laloOnlyHeadHits,0);
const entry=audit.forms.find(x=>x.choice.family===rescue.family)!;
assert.equal(entry.kind,'RESCATE');
assert.equal(entry.published[0].head,head);
assert.equal(entry.published[0].suffix,rescue.family.split('/')[0]);
assert(entry.published[0].selectedPositionMatches);
const all=entry.published[0].physicalPaths;
assert(all.length>0);
assert(all.every(x=>x.reading===head.slice(-3)));
const expected=formPositions(pre,'Previa').filter(p=>{
 const col=pre.columns.find(x=>x.id===p.source)!;
 const reading=p.cells.map(c=>col.values[c.row][c.col]).join('');
 return reversibleFamily(reading)===rescue.family;
});
assert.equal(all.length,expected.length,
 'POST debe mostrar TODAS las rutas físicas que explican la cabeza, sin elegir una sola');
const empty=buildFigureRescueAudit(date,'Previa',pre,forms,lalo,[]);
assert.equal(empty.rescueHeadHits,0);
assert.equal(empty.publicationCount,0);
const full={...pre,
 heads:{...pre.heads,Previa:['9999']},
 matches:{...pre.matches,Previa:old.matches.Previa},
 columns:pre.columns.map((c,i)=>i>0?{...c,values:Array(6).fill('99')}:c)};
assert.deepEqual(buildFigureRescueAudit(date,'Previa',full,forms,lalo,observed),audit,
 'No debe depender de POST dentro de la hoja ni de columnas futuras');
assert.throws(()=>buildFigureRescueAudit(date,'Primera',pre,forms,lalo,observed),
 /no coinciden/);
assert.throws(()=>buildFigureRescueAudit(date,'Previa',pre,{...forms,date:'2026-10-30'},lalo,observed),
 /no coinciden/);
assert.equal(forms.top[0].support.roots.every(r=>r.date<date),true);
console.log('AUDITORIA_RESCATES_VT3_OK',JSON.stringify({
 candidates:forms.top.length,rescues:audit.rescueCount,
 shared:audit.sharedCount,laloOnly:audit.laloOnlyCount,
 matchedHead:head,physicalRoutes:all.length,
 temporalLeak:false,completePaths:true
}));
