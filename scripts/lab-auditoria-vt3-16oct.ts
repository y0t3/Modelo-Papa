// Auditoría retrospectiva de la jornada 16/10/2026 — NO altera ningún motor.
// Cabezas argentinas: quinielahoy.net/quiniela-de-ayer (16/10), /resultados/2026-10-15
// y /resultados/2026-10-14; 08/10 y 09/10: nacionalquiniela.com/resultados-quinielas.php?del-dia=...
// Montevideo: fuente física solamente; sus 3 dígitos originales de 08/09 se normalizan
// a 4 para imitar el comportamiento de src/cabezas.ts.
// Se comparan exclusivamente las cinco jurisdicciones argentinas en cada corte.
import {diaVacio,JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno,Jurisdiccion} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical} from '../src/motorLalo';
import {buildVt3Shadow} from '../src/vt3Shadow';
import {buildVt3Trial} from '../src/vt3Trial';
import {auditVt3Family} from '../src/vt3Audit';
import {preSheetAtCut} from '../src/infoCandidatos';

const jurs=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos'] as const;
type MainJur=typeof jurs[number];
const asDay=(values:Record<MainJur,string[]>,mv:[string,string]):CabezasDia=>{
 const d=diaVacio();
 for(const j of jurs)TURNOS.forEach((t,i)=>{
  const s=values[j][i];
  if(!/^\d{4}$/.test(s))throw Error('Cifra argentina inválida '+j+' '+t+' '+s);
  d[t][j]=s;
 });
 d.Matutino.Montevideo=mv[0].padStart(4,'0');
 d.Nocturno.Montevideo=mv[1].padStart(4,'0');
 return d;
};
const eight=asDay({
 Ciudad:['7218','4599','9179','2710','4534'],
 Provincia:['4103','1006','9643','9532','6859'],
 Córdoba:['2504','3765','9800','7409','4553'],
 'Santa Fé':['6655','3754','6316','5125','3625'],
 'Entre Ríos':['3684','3448','7071','0848','6873'],
},['0850','0165']);
const nine=asDay({
 Ciudad:['5001','9159','4327','1056','9226'],
 Provincia:['7310','3514','3977','4059','6844'],
 Córdoba:['8242','3903','2232','3694','7952'],
 'Santa Fé':['4843','8369','8759','7730','0336'],
 'Entre Ríos':['0534','2240','1094','7148','7354'],
},['0202','0231']);
const fourteen=asDay({
 Ciudad:['0081','7056','3537','7823','1856'],
 Provincia:['9229','9852','5982','1130','3209'],
 Córdoba:['9799','8675','5586','1736','2033'],
 'Santa Fé':['4065','9206','2431','0686','7393'],
 'Entre Ríos':['5992','5872','9868','0531','5122'],
},['3892','1968']);
const fifteen=asDay({
 Ciudad:['1184','0900','8997','7654','7791'],
 Provincia:['1918','7595','4942','2073','9020'],
 Córdoba:['7563','8242','4991','4001','6204'],
 'Santa Fé':['5115','9101','0244','6076','5197'],
 'Entre Ríos':['0212','8005','1301','3897','6624'],
},['8312','7116']);
const sixteen=asDay({
 Ciudad:['0080','5166','5751','8369','4264'],
 Provincia:['2949','9696','4992','0319','8329'],
 Córdoba:['8077','8042','5524','9656','9132'],
 'Santa Fé':['7166','0025','3253','2481','5807'],
 'Entre Ríos':['8430','2116','7100','4996','9965'],
},['5898','0192']);
const mainSheet=buildSheet(sixteen,fifteen);
const history:LaloHistorical[]=[
 {date:'2026-10-15',period:'D−1',sheet:buildSheet(fifteen,fourteen)},
 {date:'2026-10-09',period:'D−7',sheet:buildSheet(nine,eight)}
];
type Slot={date:string;turn:Turno;head:string;jur:string;family:string;
 physical:number;admitted:number;origin:string|null;
 official:number|null;geometric:number|null;trial:number|null;
 rootEvents:number;d1:number;d7:number;vt2:boolean;vt4:boolean};
const rows:Slot[]=[];
const summary:any={};
const getRank=(families:{family:string}[],family:string)=>{
 const idx=families.findIndex(x=>x.family===family);
 return idx<0?null:idx+1;
};
const count=(arr:Slot[],key:'official'|'geometric'|'trial',max:number)=>
 arr.filter(x=>x[key]!==null&&x[key]!<=max).length;
for(const turn of TURNOS){
 const cut=TURNOS.indexOf(turn);
 const pre=preSheetAtCut(mainSheet,turn,cut);
 const view=buildMotorLalo(pre,'2026-10-16',turn,history);
 const geometry=buildVt3Shadow(pre,'2026-10-16',turn,history,view);
 const trial=buildVt3Trial(view,geometry);
 const byTurn:Slot[]=[];
 for(const jurisdiction of jurs){
  const head=sixteen[turn][jurisdiction];
  const family=reversibleFamily(head.slice(-3));
  const physical=auditVt3Family(pre,view,turn,head);
  if(!physical)throw Error('Sin diagnóstico de '+head);
  const match=mainSheet.matches[turn].find(m=>m.jurisdiccion===jurisdiction&&m.cabeza===head);
  const hit=(kind:'vt2'|'vt4')=>Boolean(match?.hits.some(h=>h.kind===kind));
  const born=physical.evolution.find(s=>s.routes>0)?.source??null;
  const row:Slot={
   date:'2026-10-16',turn,head,jur:jurisdiction,family,
   physical:physical.physicalRoutes,admitted:physical.admittedRoutes,
   origin:born,
   official:getRank(view.ranks.vt3,family),
   geometric:getRank(geometry.top,family),
   trial:getRank(trial.top,family),
   rootEvents:physical.independentRootEvents,d1:physical.d1Events,d7:physical.d7Events,
   vt2:hit('vt2'),vt4:hit('vt4')
  };
  rows.push(row);byTurn.push(row);
 }
 summary[turn]={
  physical:byTurn.filter(x=>x.physical>0).length,
  admitted:byTurn.filter(x=>x.admitted>0).length,
  vt2:byTurn.filter(x=>x.vt2).length,
  vt4:byTurn.filter(x=>x.vt4).length,
  officialTop3:count(byTurn,'official',3),geoTop3:count(byTurn,'geometric',3),
  trialTop3:count(byTurn,'trial',3),
  officialTop5:count(byTurn,'official',5),geoTop5:count(byTurn,'geometric',5),
  trialTop5:count(byTurn,'trial',5),
  officialTop10:count(byTurn,'official',10),geoTop10:count(byTurn,'geometric',10),
  trialTop10:count(byTurn,'trial',10),
  tops:{
   Lalo:view.ranks.vt3.slice(0,10).map(x=>x.family),
   Geometria:geometry.top.map(x=>x.family),
   Nueva:trial.top.map(x=>x.family)
  }
 };
 console.log('RESUMEN_TURNO '+turn+' '+JSON.stringify(summary[turn]));
}
const total={...Object.fromEntries(['physical','admitted','vt2','vt4',
 'officialTop3','geoTop3','trialTop3','officialTop5','geoTop5',
 'trialTop5','officialTop10','geoTop10','trialTop10'].map(x=>
 [x,Object.values(summary).reduce((n:number,s:any)=>n+(s as any)[x],0)]))};
console.log('AUDITORIA_16OCT_JSON_INICIO');
console.log(JSON.stringify({date:'2026-10-16',method:'RETROSPECTIVA_CORTES_PRE',sources:{
 target:'quinielahoy 16oct',d1:'quinielahoy 15/14oct',
 d7:'nacionalquiniela 9/8oct',montevideo:'fuente física sin cabeza objetivo'},
 totals:total,rows,summary},null,2));
console.log('AUDITORIA_16OCT_JSON_FIN');
