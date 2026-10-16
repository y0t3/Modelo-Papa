// Auditoría solo-lectura: fecha consultada no prueba fecha de sorteo real.
// No borra sorteos, no crea hojas nuevas ni modifica los motores.
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {FUENTE,descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS,mas11,diaVacio} from '../src/domain';
import type {CabezasDia} from '../src/domain';
import {hasDrawResults,hasNocturnoBase} from '../src/drawHistory';
import {montevideoProgramado} from '../src/laloJurisdicciones';

const selected=[
 '2026-06-18','2026-06-19','2026-06-20','2026-06-21','2026-06-22','2026-06-23',
 '2026-07-07','2026-07-08','2026-07-09','2026-07-10','2026-07-11','2026-07-12',
 '2026-10-12','2026-10-13'
];
const sha=(obj:unknown)=>createHash('sha256').update(JSON.stringify(obj)).digest('hex');
const valid=(v:string)=>/^\d{4}$/.test(v);
const momentNames:Record<string,string>={
 momento_5:'Previa',momento_1:'Primera',momento_2:'Matutino',
 momento_3:'Vespertino',momento_4:'Nocturno'
};
const jurisIds:Record<string,string>={
 '1':'Ciudad','2':'Provincia','3':'Santa Fé',
 '4':'Montevideo','5':'Entre Ríos','7':'Córdoba'
};
const normalizeNumber=(x:unknown)=>{
 if(x===null||x===undefined||x==='----')return '----';
 const s=String(x),m=s.match(/\d+/);
 return m?m[0].slice(-4).padStart(4,'0'):'----';
};
type ReportRow={
 date:string;weekday:number;rawSha256:string;apiKeys:string[];
 apiStatus:string|null;rawMetaDates:string[];
 rawDatosKeys:string[];headCount:number;validNocturna:boolean;
 normalizedHeadSha:string;normalized:CabezasDia;
 exactRawMomentDiffs:{turn:string;jur:string;sourceValue:string;parsedValue:string}[];
 discrepanciesWithOtherDate:string[];
 flags:string[];
};
const isoDay=(s:string)=>new Date(s+'T12:00:00Z').getUTCDay();
const rawDates=(obj:unknown)=>{const out=new Set<string>(),stack:[unknown,number][]=[[obj,0]];
 while(stack.length){
  const [value,level]=stack.pop()!;
  if(level>3||!value||typeof value!=='object')continue;
  for(const [k,v] of Object.entries(value)){
   if(/fecha|date|dia|sorteo/i.test(k)&&typeof v==='string'&&
    (/\d{4}-\d{2}-\d{2}/.test(v)||/\d{2}\/\d{2}\/\d{4}/.test(v)))
    out.add(k+'='+v.slice(0,35));
   if(v&&typeof v==='object'&&level<3)stack.push([v,level+1]);
  }
 }
 return [...out].slice(0,40);
};
const fetching=async(date:string):Promise<ReportRow>=>{
 const r=await fetch(FUENTE+'?fecha='+date+'&_='+Date.now(),{
  headers:{Accept:'application/json','Cache-Control':'no-cache'}
 });
 if(!r.ok)throw Error('Proveedor histórico no disponible '+date+' status '+r.status);
 const raw=await r.json();
 const parsed=await descargarCabezas(date,true);
 const datos=raw?.datos&&typeof raw.datos==='object'?raw.datos:{};
 const rawMismatches:ReportRow['exactRawMomentDiffs']=[];
 for(const [key,row] of Object.entries(datos)){
  const jur=jurisIds[key];if(!jur||!row||typeof row!=='object')continue;
  for(const [field,turn] of Object.entries(momentNames)){
   const reported=(row as Record<string,unknown>)[field];
   if(reported===undefined)continue;
   const asObject=typeof reported==='object'&&reported!==null?
    reported as Record<string,unknown>:null;
   const inner=asObject?(asObject.numero??asObject.cabeza??asObject.resultado??
    asObject.valor??asObject.primero??asObject.numero_1):reported;
   const value=normalizeNumber(inner);
   if(value!=='----'&&parsed[turn][jur]!==value)
    rawMismatches.push({turn,jur,sourceValue:value,parsedValue:parsed[turn][jur]});
  }
 }
 const count=TURNOS.reduce((n,t)=>n+JURS.filter(j=>valid(parsed[t][j])).length,0);
 const weekday=isoDay(date),flags:string[]=[];
 if(weekday===0&&count)flags.push('DOMINGO_CON_CABEZAS_REPORTADAS');
 if(rawMismatches.length)flags.push('PARSER_DIFIERE_DATOS_NUMERICOS');
 if(!raw?.datos)flags.push('NO_HAY_BLOQUE_DATOS_ESPERADO');
 if(!hasNocturnoBase(parsed)&&count)flags.push('TIENE_OTROS_TURNOS_PERO_SIN_NOCTURNA');
 if(weekday===6&&(valid(parsed.Matutino.Montevideo)||valid(parsed.Previa.Montevideo)||
    valid(parsed.Primera.Montevideo)||valid(parsed.Vespertino.Montevideo)))
  flags.push('MONTEVIDEO_FUERA_HORARIO_SABADO');
 if(TURNOS.some(t=>!montevideoProgramado(date,t)&&
  valid(parsed[t].Montevideo)))flags.push('MONTEVIDEO_TURNO_NO_PROGRAMADO');
 if(TURNOS.some(t=>t==='Nocturno'?false:false))throw Error('unreachable');
 return {date,weekday,rawSha256:sha(raw),apiKeys:Object.keys(raw||{}),
  apiStatus:String(raw?.estado??raw?.status??raw?.mensaje??'')||null,
  rawMetaDates:rawDates(raw),rawDatosKeys:Object.keys(datos),
  headCount:count,validNocturna:hasNocturnoBase(parsed),
  normalizedHeadSha:sha(parsed),normalized:parsed,
  exactRawMomentDiffs:rawMismatches,discrepanciesWithOtherDate:[],flags};
};
async function main(){
 // Invariantes que deben permanecer exactos, también con ceros iniciales.
 if(mas11('4038')!=='49'||mas11('0000')!=='11'||mas11('0099')!=='10'||
  normalizeNumber('40387')!=='0387'||normalizeNumber(387)!=='0387'||
  normalizeNumber('0000')!=='0000')throw Error('Regresión +11 o normalización de cuatro cifras');
 const rows:ReportRow[]=[];
 for(let i=0;i<selected.length;i+=4){
  rows.push(...await Promise.all(selected.slice(i,i+4).map(fetching)));
 }
 const comparisons:{date:string;previous:string;duplicates:{turn:string;jur:string;head:string}[]}[]=[];
 for(let i=1;i<rows.length;i++){
  const a=rows[i-1],b=rows[i];
  // Sólo comparar fechas calendario consecutivas (no 20/06 con 07/07).
  const adjacent=Date.parse(b.date)-Date.parse(a.date)===86400000;
  if(!adjacent)continue;
  const duplicates=TURNOS.flatMap(turn=>JURS.filter(jur=>
   valid(a.normalized[turn][jur])&&a.normalized[turn][jur]===b.normalized[turn][jur])
   .map(jur=>({turn,jur,head:b.normalized[turn][jur]})));
  if(duplicates.length)comparisons.push({date:b.date,previous:a.date,duplicates});
  if(duplicates.length>8)b.flags.push('ALTA_REPETICION_FECHAS_CONSECUTIVAS');
 }
 const audits=rows.map(({normalized,...r})=>({
  ...r,
  byTurn:Object.fromEntries(TURNOS.map(turn=>[turn,{
   valid:JURS.filter(j=>valid(normalized[turn][j])).length,
   values:Object.fromEntries(JURS.map(j=>[j,normalized[turn][j]]))
  }]))
 }));
 const report={
  status:'AUDITORIA_DATOS_NO_APROBACION_AUTOMATICA',
  provenance:'La API sólo indica datos reportados; hace falta constancia independiente del sorteo real por jurisdicción y turno.',
  api:FUENTE,consultedAt:new Date().toISOString(),
  datesChecked:audits.length,
  principles:['No dar por válido un sorteo por ser feriado o día hábil',
   'Ninguna fuente debe rellenar silenciosamente un turno faltante',
   'Conservar ceros y últimas cuatro cifras','Montevideo solo programación real'],
  audits,adjacentDuplicates:comparisons,
  noDrawDayMustBeVerifiedSeparately:true,
  nextStep:'Verificar fuentes oficiales/autorizadas y fechas reales turno por turno. No cambiar motor ni borrar históricos sellados.'
 };
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/AUDITORIA_PROCEDENCIA_CABEZAS_2026.json',
  JSON.stringify(report,null,2)+'\n');
 console.log('AUDITORIA_PROCEDENCIA_START');
 console.log(JSON.stringify({
  datesChecked:audits.length,
  days:audits.map(x=>({date:x.date,count:x.headCount,night:x.validNocturna,
   flags:x.flags,digest:x.normalizedHeadSha.slice(0,16),
   ciudad:x.byTurn.Previa.values.Ciudad,
   provincia:x.byTurn.Previa.values.Provincia,
   montNight:x.byTurn.Nocturno.values.Montevideo,
   firstMeta:x.rawMetaDates.slice(0,4)})),
  adjacentDuplicates:comparisons
 },null,2));
 console.log('AUDITORIA_PROCEDENCIA_END');
}
main().catch(e=>{console.error('AUDITORIA_PROCEDENCIA_ERROR',e);process.exitCode=1;});
