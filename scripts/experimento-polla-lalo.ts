/**
 * PRUEBA INDEPENDIENTE - usa exactamente src/motorLalo.ts y src/sheet.ts.
 * Sin editar ni recalibrar el motor Lalo; no toca el APK.
 * Entrada: clone nfgalindez-aiko/sorteos-ar en /tmp/sorteos-ar.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import {execFileSync} from 'node:child_process';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo} from '../src/motorLalo';
import type {LaloHistorical,LaloView} from '../src/motorLalo';
import type {CabezasDia} from '../src/domain';
import {JURS,TURNOS,diaVacio} from '../src/domain';

const ROOT=process.env.POLLA_DATA_ROOT||'/tmp/sorteos-ar/data/quiniela';
const N_SIM=10000;
const END_DATE='2026-11-13',START_WEEK='2026-09-14';
const jurisdictions:Record<string,string>={Ciudad:'ciudad',Provincia:'provincia',Córdoba:'cordoba',
'Santa Fé':'santafe','Entre Ríos':'entrerios',Montevideo:'uruguay'};
const turnMap:Record<string,string>={Previa:'previa',Primera:'primera',
Matutino:'matutina',Vespertino:'vespertina',Nocturno:'nocturna'};
type TurnData={turno:string;numeros:string[];validado?:boolean};
type FileData={turnos:TurnData[];fecha:string};
const files=new Map<string,FileData|null>();
function raw(dt:string,jur:string):FileData|null{
 const loc=jurisdictions[jur],key=loc+'/'+dt;
 if(files.has(key))return files.get(key)!;
 const p=path.join(ROOT,loc,dt+'.json');let x:FileData|null=null;
 if(fs.existsSync(p))try{const v=JSON.parse(fs.readFileSync(p,'utf8')) as FileData;
  if(v.fecha===dt&&Array.isArray(v.turnos))x=v;}catch{}
 files.set(key,x);return x;
}
function draw(dt:string,jur:string,turno:string):TurnData|null{
 return raw(dt,jur)?.turnos.find(t=>t.turno===turnMap[turno])||null;
}
function head(dt:string,jur:string,turno:string):string{
 const n=draw(dt,jur,turno)?.numeros?.[0];
 // Montevideo se publica con 3 cifras; el cero inicial no altera las dos últimas.
 return typeof n==='string'&&/^\d{3,4}$/.test(n)?n.padStart(4,'0'):'----';
}
const allDays=fs.readdirSync(path.join(ROOT,'ciudad')).filter(n=>/^2026-\d{2}-\d{2}\.json$/.test(n))
 .map(n=>n.slice(0,10)).filter(d=>d<=END_DATE).sort();
const dayIndex=new Map(allDays.map((d,i)=>[d,i]));
const isoDate=(s:string)=>new Date(s+'T12:00:00Z');
function monday(dt:string):string{
 const date=isoDate(dt);date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);
 return date.toISOString().slice(0,10);
}
function headsOf(dt:string,removeNocturno=false):CabezasDia{
 const out=diaVacio();
 for(const t of TURNOS)for(const j of JURS)
  out[t][j]=removeNocturno&&t==='Nocturno'?'----':head(dt,j,t);
 return out;
}
const sheetCache=new Map<string,ReturnType<typeof buildSheet>>();
function sheetOf(dt:string){
 if(sheetCache.has(dt))return sheetCache.get(dt)!;
 const ix=dayIndex.get(dt);
 if(ix===undefined||ix<1)throw Error('Sin antecedente para '+dt);
 const s=buildSheet(headsOf(dt),headsOf(allDays[ix-1]));
 sheetCache.set(dt,s);return s;
}
function viewOf(dt:string):LaloView{
 const ix=dayIndex.get(dt);
 if(ix===undefined||ix<3)throw Error('Historia D-1 insuficiente para '+dt);
 const before=allDays[ix-1],weekMonday=monday(dt);
 const current=buildSheet(headsOf(dt,true),headsOf(before));
 // NO EXISTEN cabeceras nocturnas del día objetivo en la entrada PRE.
 if(current.heads.Nocturno.length!==0)throw Error('Fuga de Nocturna al PRE');
 const hist:LaloHistorical[]=[{date:before,period:'D−1',sheet:sheetOf(before)}];
 // Replica la forma en que App.tsx carga su segunda raíz (lunes de la semana).
 if(weekMonday<dt&&dayIndex.has(weekMonday))
  hist.push({date:weekMonday,period:'D−7',sheet:sheetOf(weekMonday)});
 return buildMotorLalo(current,dt,'Nocturno',hist);
}
const cache=new Map<string,LaloView>();
function model(dt:string){if(!cache.has(dt))cache.set(dt,viewOf(dt));return cache.get(dt)!}
const exact=(n:number)=>String(n).padStart(2,'0');
const tail=(s:string)=>Number(s.slice(-2));
const city20=(dt:string)=>draw(dt,'Ciudad','Nocturno')?.numeros||[];
function isValidated(dt:string):boolean{
 const a=draw(dt,'Ciudad','Nocturno');
 return a?.validado===true&&a.numeros?.length===20&&a.numeros.every(n=>/^\d{4}$/.test(n));
}
const targets=new Map(allDays.map(dt=>[dt,new Set(city20(dt).map(tail))]));
const past=(dt:string)=>allDays.filter(d=>d<dt&&city20(d).length===20);
function hot(dt:string):number[]{
 const freq=Array(100).fill(0);
 for(const d of past(dt).slice(-5))for(const n of city20(d))freq[tail(n)]++;
 return Array.from({length:100},(_,i)=>i).sort((a,b)=>freq[b]-freq[a]||a-b);
}
function overdue(dt:string):number[]{
 const pp=past(dt),wait=Array(100).fill(pp.length);
 for(let i=0;i<pp.length;i++)for(const n of targets.get(pp[pp.length-1-i])!)
  if(wait[n]===pp.length)wait[n]=i;
 return Array.from({length:100},(_,i)=>i).sort((a,b)=>wait[b]-wait[a]||a-b);
}
function vt2(dt:string,style:'parejas'|'diversidad'):number[]{
 const rows=model(dt).ranks.vt2.map(f=>f.family.split('/').map(Number));
 // Polla diferencia 37 y 73: los inversos ocupan boletos distintos.
 const seq=style==='parejas'?rows.flat():[...rows.map(x=>x[0]),...rows.map(x=>x[1])];
 // Fallback determinista, sin mirar los puestos futuros.
 const out=new Set<number>();
 for(const n of [...seq,...Array.from({length:100},(_,i)=>i)])
  if(Number.isInteger(n)&&n>=0&&n<=99)out.add(n);
 return [...out];
}
const methods:Record<string,(dt:string)=>number[]>={'VT2-parejas':dt=>vt2(dt,'parejas'),
 'VT2-diversidad':dt=>vt2(dt,'diversidad'),'Calientes':hot,'Atrasados':overdue};
const weekday=(s:string)=>isoDate(s).getUTCDay();
const weeks=[...new Set(allDays.map(monday))].filter(w=>w>=START_WEEK&&w<='2026-11-09');
const accepted:{week:string;days:string[]}[]=[],excluded:{week:string;reason:string}[]=[];
for(const w of weeks){
 const days=allDays.filter(dt=>monday(dt)===w&&weekday(dt)>=1&&weekday(dt)<=5);
 if(days.length!==5){excluded.push({week:w,reason:'Faltan días lunes-viernes'});continue}
 const invalid=days.filter(d=>!isValidated(d));
 if(invalid.length){excluded.push({week:w,reason:'Nocturna sin validación explícita: '+invalid.join(', ')});continue}
 if(days.some(d=>(dayIndex.get(d)||0)<3)){excluded.push({week:w,reason:'Sin antecedentes'});continue}
 accepted.push({week:w,days});
}
function simulate(days:string[],method:(dt:string)=>number[],dynamic:boolean){
 const locked=new Set<number>();let chosen:number[]=[];
 const detail:{dia:string;propuestos:string[];nuevos:string[];acumulados:number}[]=[];
 for(const [i,dt] of days.entries()){
  if(i===0||dynamic){const order=method(dt);
   chosen=[...locked,...order.filter(n=>!locked.has(n)).slice(0,10-locked.size)]}
  if(chosen.length!==10||new Set(chosen).size!==10)throw Error('Boleta incorrecta '+dt);
  const fresh=chosen.filter(n=>targets.get(dt)!.has(n)&&!locked.has(n));
  for(const n of fresh)locked.add(n);
  detail.push({dia:dt,propuestos:chosen.map(exact),nuevos:fresh.map(exact),acumulados:locked.size});
 }
 return {count:locked.size,detail};
}
let seed=19112026;
function random01(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296}
function randomTen(locked:Set<number>){
 const array=Array.from({length:100},(_,i)=>i).filter(n=>!locked.has(n));
 const need=10-locked.size;
 for(let i=0;i<need;i++){const j=i+Math.floor(random01()*(array.length-i));
  [array[i],array[j]]=[array[j],array[i]]}
 return [...locked,...array.slice(0,need)];
}
function simulateRandom(days:string[],dynamic:boolean){
 const locked=new Set<number>();let chosen:number[]=[];
 for(const [i,dt] of days.entries()){
  if(i===0||dynamic)chosen=randomTen(locked);
  for(const n of chosen)if(targets.get(dt)!.has(n))locked.add(n);
 }
 return locked.size;
}
const stats=(a:number[])=>({suma:a.reduce((x,y)=>x+y,0),
 promedio:Number((a.reduce((x,y)=>x+y,0)/a.length).toFixed(3)),
 ge8:a.filter(x=>x>=8).length,ge9:a.filter(x=>x>=9).length,
 win10:a.filter(x=>x===10).length});
const evaluations:Record<string,any>={};
for(const [name,method] of Object.entries(methods)){
 evaluations[name]={};
 for(const dynamic of [false,true]){
  const mode=dynamic?'dinamica':'fija';
  const weekly=accepted.map(w=>({semana:w.week,...simulate(w.days,method,dynamic)}));
  evaluations[name][mode]={...stats(weekly.map(w=>w.count)),weekly};
 }
}
const randomSums:{fija:number[];dinamica:number[]}={fija:[],dinamica:[]},
 randomHist:{fija:number[];dinamica:number[]}={fija:[],dinamica:[]};
for(let i=0;i<N_SIM;i++){
 let fixed=0,dynamic=0;
 for(const w of accepted){
  const a=simulateRandom(w.days,false),b=simulateRandom(w.days,true);
  fixed+=a;dynamic+=b;randomHist.fija.push(a);randomHist.dinamica.push(b);
 }
 randomSums.fija.push(fixed);randomSums.dinamica.push(dynamic);
}
const randomStats={fija:stats(randomHist.fija),dinamica:stats(randomHist.dinamica)};
const compare:Record<string,Record<string,number>>={};
for(const [name,obj] of Object.entries(evaluations)){
 compare[name]={};
 for(const mode of ['fija','dinamica'] as const){
  const sum=obj[mode].suma;
  compare[name][mode]=Number(((randomSums[mode].filter(x=>x>=sum).length+1)/(N_SIM+1)).toFixed(4));
 }
}
let datasetRevision='no-disponible';
try{datasetRevision=execFileSync('git',['rev-parse','HEAD'],
 {cwd:path.resolve(ROOT,'../..'),encoding:'utf8'}).trim()}catch{}
const report={
 generated:'2026-11-19',dataset:'nfgalindez-aiko/sorteos-ar',
 datasetRevision,datasetRoot:ROOT,period:{from:allDays[0],to:allDays[allDays.length-1]},
 method:'buildMotorLalo original; buildSheet original; corte antes de Nocturno',
 schema:'Polla 10 exactos; cambios sin retroactividad',
 sampling:{nSim:N_SIM,randomSeed:19112026},
 target:'Ciudad Nocturna, veinte puestos, lunes-viernes, validado=true',
 acceptedWeeks:accepted.map(x=>x.week),excludedWeeks:excluded,
 evaluations,randomStats,randomControlTailProbability:compare,
 limits:['Sin Santiago del Estero ni Neuquén, ausentes del dataset.',
 'Validación de fuente secundaria; extractos no auditados uno por uno contra PDF oficial.',
 'Exploración retrospectiva, muestra pequeña, NO demuestra ventaja predictiva.',
 'Los inversos de VT2 se evalúan como números distintos, no como un mismo acierto.']
};
fs.mkdirSync('research',{recursive:true});
const out='research/polla-reporte-2026-11-19.json';
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('SISTEMA POLLA — MOTOR VT2 ORIGINAL (PRE SIN FUTURO)');
console.log('Dataset SHA:',datasetRevision,'Días:',allDays.length);
console.log('Semanas incluidas:',accepted.map(x=>x.week).join(', '));
console.log('Excluidas:',JSON.stringify(excluded));
for(const [name,mode] of Object.entries(evaluations))for(const variant of ['fija','dinamica']){
 const x=(mode as any)[variant];
 console.log(name,variant,'semanas='+x.weekly.map((z:any)=>z.count).join('/'),
  'prom='+x.promedio,'8+='+x.ge8,'9+='+x.ge9,'10='+x.win10,
  'azar>=suma='+compare[name][variant]);
}
console.log('AZAR fijo',JSON.stringify(randomStats.fija));
console.log('AZAR dinámico',JSON.stringify(randomStats.dinamica));
console.log('DETALLE:',out);
if(accepted.length<4)throw Error('Insuficientes semanas válidas para emitir reporte');

// Control experimental: los datos AUX se comprueban en una etapa separada.
