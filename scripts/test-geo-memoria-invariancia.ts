// Verificación contrafactual de la memoria D-1/D-7 en Geometría completa.
// Conserva cifras actuales y raíces históricas: modifica SOLAMENTE los dígitos
// en los tableros usados como memoria visual de días anteriores.
// No altera ningún motor ni producto de la APK.
import assert from 'node:assert/strict';
import {JURS,TURNOS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {DailySheet} from '../src/sheet';
import {buildMotorLalo} from '../src/motorLalo';
import {buildVt3Shadow,allPhysicalVt3} from '../src/vt3Shadow';

function historicalDay(seed:number):CabezasDia{
 const out=diaVacio();
 for(const [t,turn] of TURNOS.entries())
  JURS.forEach((jur,j)=>out[turn][jur]=String((seed+j*117+t*493+j*t*29)%10000).padStart(4,'0'));
 return out;
}
function beforeTurn(target:Turno):CabezasDia{
 const full=historicalDay(4620),out=diaVacio();
 for(const t of TURNOS.slice(0,TURNOS.indexOf(target)))
  for(const jur of JURS)out[t][jur]=full[t][jur];
 return out;
}
const old1=buildSheet(historicalDay(1920),historicalDay(2730));
const old7=buildSheet(historicalDay(5021),historicalDay(1590));
const historical=[
 {date:'2026-10-14',period:'D−1' as const,sheet:old1},
 {date:'2026-10-08',period:'D−7' as const,sheet:old7}
];
function distortDigits(sheet:DailySheet):DailySheet{
 return {...sheet,columns:sheet.columns.map(col=>({...col,
  values:col.values.map(value=>/^\d{2}$/.test(value)?'77':value)
 }))};
}
function signatures(values:string[]){
 return allPhysicalVt3(values).map(p=>p.map(x=>x.row+':'+x.col).join('>')).sort();
}
let pathChecks=0,rankChecks=0,roots=0;
for(const target of TURNOS){
 const present=buildSheet(beforeTurn(target),historicalDay(8520));
 assert.equal(present.heads[target].length,0);
 const official=buildMotorLalo(present,'2026-10-15',target,historical);
 roots+=official.roots.length;
 const baseline=buildVt3Shadow(present,'2026-10-15',target,historical,official);
 const falsified=historical.map(h=>({...h,sheet:distortDigits(h.sheet)}));
 for(let i=0;i<historical.length;i++)
  for(const col of historical[i].sheet.columns){
   const changed=falsified[i].sheet.columns.find(c=>c.id===col.id)!;
   assert.deepEqual(signatures(col.values),signatures(changed.values),
    'Los dígitos cambian pero la geometría admisible por casilla es idéntica');
   pathChecks++;
  }
 const shifted=buildVt3Shadow(present,'2026-10-15',target,falsified,official);
 assert.deepEqual(shifted,baseline,
  'No deben cambiar ni Top, ni distancias de ayer/semana, ni selección');
 assert.ok(baseline.top.every(r=>r.d1Distance>=0&&r.d7Distance>=0));
 rankChecks++;
}
console.log('INVARIANCIA_MEMORIA_OK '+JSON.stringify({
 turnos:rankChecks,comparacionesColumnas:pathChecks,
 rootsFromOfficial:roots,
 conclusion:'Con raíces oficiales y hoja actual fijas, la memoria geométrica de todas las rutas de D-1 y D-7 es idéntica al reemplazar TODAS las cifras históricas por 7; únicamente se conserva el patrón de casillas presentes.',
 scope:'No implica que cambiar las cabezas anteriores y recalcular las raíces oficiales no cambie el resultado: esa es otra fuente de información.',
}));
