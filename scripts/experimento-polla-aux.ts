/**
 * Sistema Polla: backtest de los motores reales AUX e INTEGRAL, modalidad AYER.
 * Fuente auxiliar: cabezasDiarias de vivitusuerte, Santiago 10 y Neuquen 11.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import {createHash} from 'node:crypto';
import {buildSheet} from '../src/sheet';
import {buildMotorLaloAuxiliar,extractAuxiliarHistory} from '../src/motorLaloAuxiliar';
import {buildMotorLaloIntegral} from '../src/motorLaloIntegral';
import type {IntegralPast} from '../src/motorLaloIntegral';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import type {AuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import type {CabezasDia} from '../src/domain';
import {diaVacio,TURNOS,JURS} from '../src/domain';
const ROOT=process.env.POLLA_DATA_ROOT||'/tmp/sorteos-ar/data/quiniela';
const jurs:Record<string,string>={Ciudad:'ciudad',Provincia:'provincia',Córdoba:'cordoba',
 'Santa Fé':'santafe','Entre Ríos':'entrerios',Montevideo:'uruguay'};
const turns:Record<string,string>={Previa:'previa',Primera:'primera',Matutino:'matutina',
 Vespertino:'vespertina',Nocturno:'nocturna'};
const prior=JSON.parse(fs.readFileSync('research/polla-reporte-2026-11-19.json','utf8'));
const days=fs.readdirSync(path.join(ROOT,'ciudad'))
 .filter(n=>/^2026-\d{2}-\d{2}\.json$/.test(n)).map(n=>n.slice(0,10))
 .filter(d=>d<='2026-11-13').sort();
const lookup=new Map(days.map((d,i)=>[d,i]));
const cache=new Map<string,any>();
function raw(dt:string,j:string):any{
 const key=dt+'|'+j;if(cache.has(key))return cache.get(key);
 const p=path.join(ROOT,jurs[j],dt+'.json');let x=null;
 try{x=JSON.parse(fs.readFileSync(p,'utf8'))}catch{}
 cache.set(key,x);return x;
}
function head(dt:string,j:string,t:string):string{
 const s=raw(dt,j)?.turnos?.find((x:any)=>x.turno===turns[t])?.numeros?.[0];
 return typeof s==='string'&&/^\d{3,4}$/.test(s)?s.padStart(4,'0'):'----';
}
function heads(dt:string,mask=false):CabezasDia{
 const x=diaVacio();
 for(const t of TURNOS)for(const j of JURS)
 x[t][j]=t==='Nocturno'&&mask?'----':head(dt,j,t);
 return x;
}
function previous(dt:string):string{
 const i=lookup.get(dt);if(i===undefined||i<1)throw Error('sin anterior a '+dt);
 return days[i-1];
}
function monday(dt:string):string{
 const d=new Date(dt+'T12:00:00Z');
 d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);
 return d.toISOString().slice(0,10);
}
const sheetCache=new Map<string,ReturnType<typeof buildSheet>>();
function sheet(dt:string){
 if(!sheetCache.has(dt))
  sheetCache.set(dt,buildSheet(heads(dt),heads(previous(dt))));
 return sheetCache.get(dt)!;
}
const source=new Map<string,AuxiliaryHeads>();
const sourceErrors:Record<string,string>={};
async function retrieve(){
 let i=0;
 async function worker(){while(i<days.length){
  const d=days[i++];
  try{source.set(d,(await fetchAuxiliaryHeads(d)).heads)}
  catch(e){sourceErrors[d]=String(e)}
 }}
 await Promise.all(Array.from({length:6},worker));
}
function complete(x:AuxiliaryHeads|undefined){
 return !!x&&Object.values(x).every(z=>Object.values(z).every(n=>/^\d{4}$/.test(n)));
}
function base(dt:string):AuxiliaryHeads|undefined{
 try{return source.get(previous(dt))}catch{return undefined}
}
function entries(dt:string){
 const before=previous(dt),mon=monday(dt);
 return [{date:before,period:'D−1' as const},
 ...(mon<dt&&lookup.has(mon)?[{date:mon,period:'D−7' as const}]:[])];
}
const candidateCache=new Map<string,{family:string;evidence?:string}[]>();
function candidates(dt:string,kind:'AUX'|'INTEGRAL'|'DOBLE',
 style:'parejas'|'diversidad'){
 const key=dt+'|'+kind;let families=candidateCache.get(key);
 if(!families){
  const aux=base(dt);
  if(!complete(aux))throw Error('AUX actual incompleto '+dt);
  const history=entries(dt).map(ref=>{
   const input=base(ref.date);
   if(!complete(input))throw Error('AUX histórico incompleto '+ref.date);
   return {date:ref.date,period:ref.period,sourceDate:previous(ref.date),
    heads:input!,aux:extractAuxiliarHistory(ref.date,input!,heads(ref.date))};
  });
  let fresh:{family:string;evidence?:string}[]=[];
  if(kind==='AUX')
   fresh=buildMotorLaloAuxiliar(dt,'Nocturno',aux!,history).ranks[2];
  else {
   // El integral no admite fechas duplicadas: D-1 gana ante D-7 el martes.
   const unique=history.filter((h,i)=>history.findIndex(x=>x.date===h.date)===i);
   const past:IntegralPast[]=unique.map(x=>({
    date:x.date,period:x.period,plus11:sheet(x.date),aux:x.aux}));
   const current=buildSheet(heads(dt,true),heads(previous(dt)));
   if(current.heads.Nocturno.length)throw Error('Nocturna futura en PRE');
   const view=buildMotorLaloIntegral(dt,'Nocturno',current,aux!,past);
   fresh=kind==='DOBLE'?[...view.ranks[2]].sort((a,b)=>
    Number(b.evidence==='DOS_HOJAS')-Number(a.evidence==='DOS_HOJAS')||a.rank-b.rank)
    :view.ranks[2];
  }
  families=fresh;candidateCache.set(key,families);
 }
 const rows=families.map(f=>f.family.split('/').map(Number));
 const seq=style==='parejas'?rows.flat():
  [...rows.map(r=>r[0]),...rows.map(r=>r[1])];
 return [...new Set([...seq,...Array.from({length:100},(_,i)=>i)])]
  .filter(n=>Number.isInteger(n)&&n>=0&&n<=99);
}
const tail=(n:string)=>Number(n.slice(-2));
function noct(dt:string):Set<number>{
 const t=raw(dt,'Ciudad')?.turnos?.find((x:any)=>x.turno==='nocturna');
 return new Set((t?.numeros||[]).map(tail));
}
function simulation(dts:string[],f:(d:string)=>number[],dynamic:boolean){
 let chosen:number[]=[],hit=new Set<number>();const detail:any[]=[];
 for(const [i,dt] of dts.entries()){
  if(i===0||dynamic)
   chosen=[...hit,...f(dt).filter(x=>!hit.has(x)).slice(0,10-hit.size)];
  if(chosen.length!==10||new Set(chosen).size!==10)throw Error('Tarjeta inválida '+dt);
  const fresh=chosen.filter(x=>noct(dt).has(x)&&!hit.has(x));
  fresh.forEach(x=>hit.add(x));
  detail.push({date:dt,picks:chosen.map(x=>String(x).padStart(2,'0')),
   newHits:fresh,accumulated:hit.size});
 }
 return {count:hit.size,detail};
}
let randomSeed=19112026;
function rnd(){
 randomSeed=(Math.imul(randomSeed,1664525)+1013904223)>>>0;
 return randomSeed/4294967296;
}
function randomTen(lock:Set<number>){
 const a=Array.from({length:100},(_,i)=>i).filter(x=>!lock.has(x));
 const n=10-lock.size;
 for(let i=0;i<n;i++){
  const j=i+Math.floor(rnd()*(a.length-i));
  [a[i],a[j]]=[a[j],a[i]];
 }
 return [...lock,...a.slice(0,n)];
}
function randomGame(dts:string[],dynamic:boolean){
 let c:number[]=[],hit=new Set<number>();
 for(const [i,d] of dts.entries()){
  if(i===0||dynamic)c=randomTen(hit);
  for(const n of c)if(noct(d).has(n))hit.add(n);
 }
 return hit.size;
}
(async()=>{
 await retrieve();
 const available=prior.acceptedWeeks.map((w:string)=>({
  week:w,days:days.filter(d=>monday(d)===w&&
   new Date(d+'T12:00:00Z').getUTCDay()>=1&&
   new Date(d+'T12:00:00Z').getUTCDay()<=5)}));
 const accepted:typeof available=[],excluded:any[]=[];
 for(const w of available)try{
  for(const dt of w.days){
   if(!complete(base(dt)))throw Error('Falta base para '+dt);
   for(const x of entries(dt))
    if(!complete(base(x.date)))throw Error('Falta raíz '+x.date);
  }
  accepted.push(w);
 }catch(e){excluded.push({week:w.week,error:String(e)})}
 const methods:{[key:string]:(dt:string)=>number[]}={
  'Aux-parejas':dt=>candidates(dt,'AUX','parejas'),
  'Aux-diversidad':dt=>candidates(dt,'AUX','diversidad'),
  'Integral-parejas':dt=>candidates(dt,'INTEGRAL','parejas'),
  'Integral-diversidad':dt=>candidates(dt,'INTEGRAL','diversidad'),
  'Integral-dos-hojas':dt=>candidates(dt,'DOBLE','parejas')
 };
 const results:any={};
 for(const [name,f] of Object.entries(methods)){
  results[name]={};
  for(const dynamic of [false,true]){
   const key=dynamic?'dinamica':'fija';
   const weekly=accepted.map(w=>({week:w.week,...simulation(w.days,f,dynamic)}));
   results[name][key]={
    weekly,avg:Number((weekly.reduce((t,x)=>t+x.count,0)/weekly.length).toFixed(3)),
    total:weekly.reduce((t,x)=>t+x.count,0),
    wins:weekly.filter(x=>x.count===10).length};
  }
 }
 const simN=10000,sums:{fija:number[];dinamica:number[]}={fija:[],dinamica:[]};
 for(let i=0;i<simN;i++){
  let f=0,d=0;
  for(const w of accepted){f+=randomGame(w.days,false);d+=randomGame(w.days,true)}
  sums.fija.push(f);sums.dinamica.push(d);
 }
 const p:any={};
 for(const [name,v] of Object.entries(results)){
  p[name]={};
  for(const key of ['fija','dinamica'] as const)
   p[name][key]=(sums[key].filter(x=>x>=(v as any)[key].total).length+1)/(simN+1);
 }
 const snapshot=Object.fromEntries([...source.entries()].map(([d,h])=>[d,h]));
 const digest=createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
 const report={date:'2026-11-19',datasetSHA:prior.datasetRevision,
  auxSource:'vivitusuerte cabezasDiarias ids 10/11',
  auxDigest:digest,auxSnapshot:snapshot,auxErrors:sourceErrors,
  accepted:accepted.map(w=>w.week),excluded,results,p,simN,
  limits:['Fuente AUX no auditada individualmente contra extractos oficiales',
   'Integral se evalúa sin fechas duplicadas en el historial',
   'Solo fuentes anteriores a la nocturna objetivo',
   'No se calibraron pesos según los resultados de Polla']};
 fs.mkdirSync('research',{recursive:true});
 fs.writeFileSync('research/polla-reporte-aux-2026-11-19.json',
  JSON.stringify(report,null,2));
 console.log('POLLA AUX — cobertura:',source.size,'de',days.length,
  'jornadas; semanas:',accepted.length,'excluidas:',JSON.stringify(excluded),
  'SHA:',digest);
 for(const [name,v] of Object.entries(results))
  for(const key of ['fija','dinamica'] as const){
   const x=(v as any)[key];
   console.log('AUX_RESULT',name,key,
    'semanas='+x.weekly.map((z:any)=>z.count).join('/'),
    'media='+x.avg,'10/10='+x.wins,
    'azar>=total='+p[name][key].toFixed(4));
  }
 if(accepted.length<4)
  console.log('AUX_ADVERTENCIA: insuficientes semanas para conclusión');
})().catch(e=>{console.error(e);process.exitCode=1});
