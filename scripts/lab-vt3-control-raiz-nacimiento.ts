// Contrastes de familias físicas VT3 sin modificar la selección oficial.
// Unidad: familia × corte PRE. Respuesta: cabezas argentinas posteriores al PRE.
// No realizar selección de reglas desde los aciertos de un turno.
import {TURNOS} from '../src/domain';
import type {Turno} from '../src/domain';
type PhysicalRow={
 firstSource:string;status:string;routeCount:number;physicalRouteCount:number;sourceCount:number;
 directRoots:number;branchBlocks:number;winnerHeads:number;admitted:boolean;
};
type PhysicalCut={date:string;period:string;turn:Turno;rows:PhysicalRow[]};
const band=(n:number)=>n<=1?'1':n<=2?'2':n<=5?'3-5':n<=12?'6-12':'13+';
type Comparison={id:string;label:string;hypothesis:string;
 first:(x:PhysicalRow)=>boolean;second:(x:PhysicalRow)=>boolean;
 bucket:(x:PhysicalRow)=>string};
type Totals={
 familyExposures:number;winningHeads:number;cutExposures:number;
 distinctDays:number;winRatePer1000:number;
};
const display=(items:{date:string;row:PhysicalRow}[]):Totals=>{
 const heads=items.reduce((n,x)=>n+x.row.winnerHeads,0);
 return {familyExposures:items.length,winningHeads:heads,
  cutExposures:new Set(items.map(x=>x.date)).size,
  distinctDays:new Set(items.map(x=>x.date)).size,
  winRatePer1000:items.length?Math.round(heads/items.length*100000)/100:0};
};
const comparisons:Comparison[]=[
 {id:'A_RAIZ_UNICA_SIN_BIFURCACION',label:'Raíz propia única, sin bifurcación vs sin raíces',
  hypothesis:'Dentro del mismo PRE + columna de nacimiento + banda de rutas + cantidad de fuentes; no premiar automáticamente raíz única.',
  first:x=>x.directRoots===1&&x.branchBlocks===0&&x.admitted,
  second:x=>x.directRoots===0&&x.branchBlocks===0,
  bucket:x=>x.firstSource+'|'+band(x.physicalRouteCount)+'|'+(x.sourceCount===1?'una':'varias')},
 {id:'A_BIFURCADA_RAIZ_PROPIA',label:'Con raíz propia: sin bifurcación vs con bifurcación',
  hypothesis:'Comparar dentro del mismo PRE + columna de nacimiento + banda de rutas + cantidad de fuentes, exclusivamente familias ancladas.',
  first:x=>x.directRoots>=1&&x.branchBlocks===0&&x.admitted,
  second:x=>x.directRoots>=1&&x.branchBlocks>0&&x.admitted,
  bucket:x=>x.firstSource+'|'+band(x.physicalRouteCount)+'|'+(x.sourceCount===1?'una':'varias')},
 {id:'B_NACE_DURANTE_DIA_SIN_RAIZ',label:'Familia no anclada que nace ahora vs familia intradía previa no anclada',
  hypothesis:'Dentro del mismo PRE y banda de rutas, solo familias intradía de una fuente y sin raíz. Control por edad, no por origen de columna.',
  first:x=>x.firstSource!=='prevNocturno'&&x.status==='NUEVA_FAMILIA'&&
   x.directRoots===0&&x.branchBlocks===0&&!x.admitted&&x.sourceCount===1,
  second:x=>x.firstSource!=='prevNocturno'&&x.status==='SIN_CAMBIO'&&
   x.directRoots===0&&x.branchBlocks===0&&!x.admitted&&x.sourceCount===1,
  bucket:x=>band(x.physicalRouteCount)},
 {id:'B_NACE_VS_NOCTURNA_SIN_RAIZ',label:'Nacimiento intradía sin raíz vs Nocturna anterior sin raíz',
  hypothesis:'Mismo PRE, rutas y solo una fuente. Comparación descriptiva: origen fuente/antigüedad difieren.',
  first:x=>x.firstSource!=='prevNocturno'&&x.status==='NUEVA_FAMILIA'&&
   x.directRoots===0&&x.branchBlocks===0&&!x.admitted&&x.sourceCount===1,
  second:x=>x.firstSource==='prevNocturno'&&x.directRoots===0&&
   x.branchBlocks===0&&!x.admitted&&x.sourceCount===1,
  bucket:x=>band(x.physicalRouteCount)}
];
function compare(cuts:PhysicalCut[],choice:Comparison){
 const first:{date:string;row:PhysicalRow}[]=[];
 const second:{date:string;row:PhysicalRow}[]=[];
 let expected=0,observed=0,expectedControl=0,comparable=0;
 let matchedFirst=0,matchedSecond=0,matchedWinnerFirst=0,matchedWinnerSecond=0;
 let allStrata=0,uniqueDays=new Set<string>();
 for(const cut of cuts){
  const groups=new Map<string,PhysicalRow[]>();
  for(const row of cut.rows){
   const isFirst=choice.first(row),isSecond=choice.second(row);
   if(isFirst&&isSecond)throw Error('Categorías de control superpuestas');
   if(!isFirst&&!isSecond)continue;
   const w={date:cut.date,row};
   (isFirst?first:second).push(w);
   const key=choice.bucket(row);
   if(!groups.has(key))groups.set(key,[]);
   groups.get(key)!.push(row);
  }
  for(const values of groups.values()){
   allStrata++;
   const a=values.filter(choice.first),b=values.filter(choice.second);
   if(!a.length||!b.length)continue;
   comparable++;uniqueDays.add(cut.date);
   const wa=a.reduce((n,x)=>n+x.winnerHeads,0),wb=b.reduce((n,x)=>n+x.winnerHeads,0);
   matchedFirst+=a.length;matchedSecond+=b.length;
   matchedWinnerFirst+=wa;matchedWinnerSecond+=wb;
   const total=(wa+wb);
   observed+=wa;expected+=a.length/(a.length+b.length)*total;
   expectedControl+=b.length/(a.length+b.length)*total;
  }
 }
 return {id:choice.id,label:choice.label,hypothesis:choice.hypothesis,
  treated:display(first),control:display(second),
  comparable:{
   comparableStrata:comparable,strataChecked:allStrata,datesWithComparisons:uniqueDays.size,
   treatedExposures:matchedFirst,controlExposures:matchedSecond,
   treatedWinningHeads:matchedWinnerFirst,controlWinningHeads:matchedWinnerSecond,
   treatedRatePer1000:matchedFirst?Math.round(100000*matchedWinnerFirst/matchedFirst)/100:0,
   controlRatePer1000:matchedSecond?Math.round(100000*matchedWinnerSecond/matchedSecond)/100:0,
   neutralTreatedExpected:Math.round(expected*100)/100,
   observedTreated:observed,difference:Math.round((observed-expected)*100)/100,
   neutralControlExpected:Math.round(expectedControl*100)/100,
   warning:!comparable?'No hay estratos con ambos grupos; no atribuir valor al contraste.':
    'Neutralidad dentro de cada estrato, no prueba confirmatoria ni eventos independientes.'
  }};
}
export function contrastPhysicalFamilies(cuts:PhysicalCut[]){
 const byGroup={
  TOTAL:cuts,
  JUNIO_JULIO:cuts.filter(x=>x.period==='JUNIO_JULIO'),
  AGOSTO_OCTUBRE:cuts.filter(x=>x.period==='AGOSTO_OCTUBRE')
 };
 return {
  protocol:{
   unit:'Familia reversible VT3 por PRE y cabeza objetivo posteriormente publicada; 5 cortes de cada día no independientes.',
   groups:'A: una cabeza ganadora histórica independiente admitida (directRoots=1), bifurcación cero; B: familia nacida ahora tras Nocturna, un origen físico, ningún antecedente admitido.',
   controls:'Sin selección de una sola familia ganadora: todos los candidatos físicamente posibles y negativos.',
   matched:'Estratos PRE por PRE; A empareja origen, banda de rutas y fuentes, B empareja rutas y fuente única porque edad y fuente de primera aparición difieren por construcción.',
   limits:'Estudio retrospectivo repetidamente explorado. Comparaciones con cero estratos mixtos no aportan evidencia. No identificar exposición de familia con evento de sorteo independiente.'
  },
  sample:{days:new Set(cuts.map(x=>x.date)).size,cuts:cuts.length,
   families:cuts.reduce((n,x)=>n+x.rows.length,0),
   physicallyAvailableWinners:cuts.reduce((n,x)=>n+x.rows.reduce((m,r)=>m+r.winnerHeads,0),0)},
  sections:Object.fromEntries(Object.entries(byGroup).map(([name,items])=>
    [name,Object.fromEntries(comparisons.map(x=>[x.id,compare(items,x)]))])),
  byTurn:Object.fromEntries(TURNOS.map(turn=>[turn,
    Object.fromEntries(comparisons.map(x=>[x.id,compare(cuts.filter(c=>c.turn===turn),x)]))
  ]))
 };
}
