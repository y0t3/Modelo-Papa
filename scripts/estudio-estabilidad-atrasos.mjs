// Repetibilidad de atrasos entre períodos disjuntos.
// Fuente idéntica a la app; sólo cabezas válidas y cinco jurisdicciones, sin Montevideo.
// No toca el código de los motores ni modifica la aplicación.
import fs from 'node:fs';
const url='https://vivitusuerte.com/api/juegos/cabezasDiarias';
const ids=[['Ciudad','1'],['Provincia','2'],['Santa Fé','3'],['Córdoba','7'],['Entre Ríos','5']];
const turns={Matutino:'momento_2',Vespertino:'momento_3',Nocturno:'momento_4',
 Previa:'momento_5',Primera:'momento_1'};
const start='2024-09-01',end='2026-11-14',windows=[60,110],primaryWindow=110;
const segments=[
 {label:'2025 primer semestre',from:'2025-01-01',to:'2025-06-30'},
 {label:'2025 segundo semestre',from:'2025-07-01',to:'2025-12-31'},
 {label:'2026 primer semestre',from:'2026-01-01',to:'2026-06-30'},
 {label:'2026 segundo semestre',from:'2026-07-01',to:'2026-11-14'}
];
const shift=(str,n)=>{const d=new Date(str+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const allDates=[];for(let d=start;d<=end;d=shift(d,1))if(new Date(d+'T12:00:00Z').getUTCDay()!==0)allDates.push(d);
function head(x){const raw=typeof x==='object'?(x?.numero??x?.cabeza??x?.valor??x?.resultado??x?.primero??x?.numero_1??''):x;
 const m=String(raw??'').match(/\d+/);return m?m[0].slice(-4).padStart(4,'0'):null;}
async function read(date){
 for(let attempt=0;attempt<4;attempt++){
  try{
   const r=await fetch(url+'?fecha='+date,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(18000)});
   if(!r.ok)throw Error('HTTP '+r.status);
   const json=await r.json(),turnData={};
   for(const [t,key] of Object.entries(turns))turnData[t]=ids.map(([j,id])=>head(json?.datos?.[id]?.[key]));
   return {date,turnData};
  }catch(e){if(attempt===3)return {date,error:String(e)};await new Promise(r=>setTimeout(r,350*(attempt+1)**2));}
 }
}
const fetched=[],workers=4;let next=0;
await Promise.all(Array.from({length:workers},async()=>{while(next<allDates.length){
 const i=next++;fetched[i]=await read(allDates[i]);
 if(i%80===0)console.log('CARGA '+Math.min(next,allDates.length)+'/'+allDates.length);
 await new Promise(r=>setTimeout(r,75));
}}));
const ok=fetched.filter(x=>x?.turnData),errors=fetched.filter(x=>x?.error);
const methods=['atraso_cinco','atraso_individual','calientes_cinco','frios_cinco','azar_cinco'];
const values=Array.from({length:100},(_,i)=>i);
function rankings(rows,kind){
 const last=Array(100).fill(-1),counts=Array(100).fill(0);
 for(let i=0;i<rows.length;i++)for(const v of rows[i]){last[v]=i;counts[v]++;}
 const sorted=values.map(v=>({v,last:last[v],count:counts[v]}));
 if(kind==='atraso')sorted.sort((a,b)=>a.last-b.last||a.v-b.v);
 else if(kind==='calientes')sorted.sort((a,b)=>b.count-a.count||b.last-a.last||a.v-b.v);
 else sorted.sort((a,b)=>a.count-b.count||a.last-b.last||a.v-b.v);
 return sorted.filter(x=>kind!=='atraso'||x.last>=0).slice(0,3).map(x=>x.v);
}
function random3(key){let seed=2166136261>>>0;for(const c of key)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
 const arr=[...values];for(let i=0;i<3;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const j=i+Math.floor(seed/4294967296*(100-i));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr.slice(0,3);}
const rand=(()=>{let s=43337411>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296)})();
function ci(rows,field,iterations=2000){
 if(rows.length<8)return null;
 const n=rows.length,arr=new Array(iterations);
 for(let b=0;b<iterations;b++){
  let sum=0;for(let j=0;j<n;j++)sum+=rows[Math.floor(rand()*n)][field];
  arr[b]=sum/(n*5)*100;
 }
 arr.sort((a,b)=>a-b);
 return [Number(arr[Math.floor(.025*iterations)].toFixed(2)),Number(arr[Math.floor(.975*iterations)].toFixed(2))];
}
function analyzeTurn(turn,window){
 const valid=ok.filter(x=>x.turnData[turn].every(v=>/^\d{4}$/.test(v||'')))
 .map(x=>({date:x.date,numbers:x.turnData[turn].map(v=>Number(v.slice(-2)))}));
 const evals=[];
 for(let i=window;i<valid.length;i++){
  const old=valid.slice(i-window,i),day=valid[i],pool=old.map(x=>x.numbers);
  const joint=rankings(pool,'atraso'),hot=rankings(pool,'calientes'),cold=rankings(pool,'frios');
  const individual=Array.from({length:5},(_,j)=>rankings(old.map(d=>[d.numbers[j]]),'atraso'));
  const random=random3('azar|'+turn+'|'+day.date);
  const hits=Object.fromEntries(methods.map(m=>[m,0]));
  for(let j=0;j<5;j++){
   const v=day.numbers[j];
   const lists=[joint,individual[j],hot,cold,random];
   for(let m=0;m<methods.length;m++)hits[methods[m]]+=Number(lists[m].includes(v));
  }
  evals.push({date:day.date,...hits,localMinusJoint:hits.atraso_individual-hits.atraso_cinco});
 }
 return {validDays:valid.length,evals};
}
const results={};
for(const window of windows)for(const turn of Object.keys(turns)){
 const {validDays,evals}=analyzeTurn(turn,window);
 const byPeriod=[];
 for(const segment of segments){
  const rows=evals.filter(x=>x.date>=segment.from&&x.date<=segment.to);
  const n=rows.length*5;
  const score=Object.fromEntries(methods.map(m=>{
   const hits=rows.reduce((s,x)=>s+x[m],0);
   return [m,{aciertos:hits,porcentaje:n?+(100*hits/n).toFixed(2):null,
    intervalo95:ci(rows,m)}];
  }));
  const d=rows.reduce((s,x)=>s+x.localMinusJoint,0);
  byPeriod.push({period:segment.label,from:segment.from,to:segment.to,
   jornadas:rows.length,cabezas:n,metodos:score,
   diferenciaIndividualVsConjunto:{aciertos:d,porcentaje:n?+(100*d/n).toFixed(2):null,intervalo95:ci(rows,'localMinusJoint')},
   limitedSample:n<250});
 }
 const overallRows=evals;
 const overallN=overallRows.length*5;
 const overall=Object.fromEntries(methods.map(m=>{
  const hits=overallRows.reduce((s,r)=>s+r[m],0);
  return [m,{aciertos:hits,porcentaje:overallN?+(100*hits/overallN).toFixed(2):null,intervalo95:ci(overallRows,m)}];
 }));
 results[turn+'_'+window]={turn,ventana:window,totalJornadas:validDays,
  totalEvaluado:evals.length,periodos:byPeriod,acumulado:overall};
}
const report={source:url,retrievedAt:new Date().toISOString(),historico:{
 desde:start,hasta:end,fechasPosibles:allDates.length,respuestas:ok.length,errores:errors.length,
 muestrasErrores:errors.slice(0,8).map(x=>({fecha:x.date,error:x.error})),
 diasCompletosPorTurno:Object.fromEntries(Object.keys(turns).map(t=>[t,
  ok.filter(x=>x.turnData[t].every(v=>/^\d{4}$/.test(v||''))).length]))
},methodology:{
 premio:'cabezas primer premio; terminación exacta 2 cifras; cinco jurisdicciones',
 periodos:'sin superposición; los rankings se actualizan con resultados previos',
 muestras:'cada fecha completa de cinco jurisdicciones cuenta 5 observaciones',
 ventanas:'60 y 110 jornadas previas completas del mismo turno',
 atrasado:'número con última aparición más antigua dentro de la ventana; nunca vistos se excluyen',
 desempate:'igual que investigación original, orden numérico o última aparición',
 nota:'muestreo retrospectivo por segmentos, no confirmación prospectiva independiente',
 azar:'3 números exactos por cabeza: referencia teórica 3%, si uniformidad e independencia',
 intervalos:'bootstrap por jornada completa, 2000 repeticiones, aproximado',
 riesgos:'comparaciones múltiples, indicadores correlacionados, disponibilidad histórica y sesgo retrospectivo'
 },results};
fs.mkdirSync('research-output',{recursive:true});
fs.writeFileSync('research-output/estabilidad-atrasos-2026.json',JSON.stringify(report,null,2));
console.log('COBERTURA '+JSON.stringify(report.historico));
for(const key of Object.keys(results)){
 if(!key.endsWith('_110'))continue;
 const row=results[key];
 console.log('ESTABILIDAD '+row.turn+' 110 '+JSON.stringify({totalDias:row.totalJornadas,periodos:row.periodos.map(p=>({
  periodo:p.period,jornadas:p.jornadas,atrasosConjunto:p.metodos.atraso_cinco.porcentaje,
  atrasosIndividual:p.metodos.atraso_individual.porcentaje,
  calientes:p.metodos.calientes_cinco.porcentaje,azar:p.metodos.azar_cinco.porcentaje,
  diferencia:p.diferenciaIndividualVsConjunto
 })),acumulado:row.acumulado}));
}
console.log('ARCHIVO research-output/estabilidad-atrasos-2026.json');
