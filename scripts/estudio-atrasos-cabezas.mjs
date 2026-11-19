import fs from 'node:fs';
const endpoint='https://vivitusuerte.com/api/juegos/cabezasDiarias',end='2026-11-14';
const juris=['Ciudad','Provincia','Santa Fé','Córdoba','Entre Ríos'], ids=['1','2','3','7','5'];
const turns={Previa:'momento_5',Primera:'momento_1',Matutino:'momento_2',Vespertino:'momento_3',Nocturno:'momento_4'};
const win=[60,110];
const shift=(date,n)=>{let d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const dates=Array.from({length:220},(_,i)=>shift(end,i-219)).filter(d=>new Date(d+'T12:00:00Z').getUTCDay()!==0);
const head=x=>{const raw=typeof x==='object'?(x?.numero??x?.cabeza??x?.valor??x?.resultado??x?.primero??x?.numero_1??''):x;
 const n=String(raw??'').match(/\d+/);return n?n[0].slice(-4).padStart(4,'0'):null};
async function read(date){
 for(let attempt=0;attempt<3;attempt++){
  try{
   const r=await fetch(endpoint+'?fecha='+date,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)});
   if(!r.ok)throw Error('HTTP '+r.status);
   const obj=await r.json(),out={};for(const [t,key] of Object.entries(turns)){
    out[t]=Object.fromEntries(juris.map((j,i)=>[j,head(obj?.datos?.[ids[i]]?.[key])]));
   }
   return {date,turns:out};
  }catch(e){if(attempt===2)return {date,error:String(e)};await new Promise(r=>setTimeout(r,400*(attempt+1)))}
 }
}
const downloaded=[];let pointer=0;
await Promise.all(Array.from({length:3},async()=>{while(pointer<dates.length){
 const idx=pointer++;downloaded[idx]=await read(dates[idx]);
 if(idx%30===0)console.log('Descargas '+idx+'/'+dates.length);
 await new Promise(r=>setTimeout(r,80));
}}));
const good=downloaded.filter(r=>r.turns).sort((a,b)=>a.date.localeCompare(b.date));
const errors=downloaded.filter(r=>r.error);
console.log('Fechas con JSON '+good.length+'/'+dates.length+'; errores '+errors.length);
console.log('Ejemplo recibido '+JSON.stringify(good.at(-1)||{}).slice(0,700));
const names=['atraso_cinco','atraso_individual','calientes_cinco','frios_cinco','azar_cinco','azar_individual'];
const nums=Array.from({length:100},(_,i)=>i);
function pick(series,which){
 const last=Array(100).fill(-1),n=Array(100).fill(0);
 series.forEach((day,i)=>day.forEach(v=>{last[v]=i;n[v]++}));
 const rows=nums.map(x=>({x,last:last[x],n:n[x]}));
 if(which==='atrasado')rows.sort((a,b)=>a.last-b.last||a.x-b.x);
 else if(which==='caliente')rows.sort((a,b)=>b.n-a.n||b.last-a.last||a.x-b.x);
 else rows.sort((a,b)=>a.n-b.n||a.last-b.last||a.x-b.x);
 return rows.filter(x=>which!=='atrasado'||x.last>=0).slice(0,3).map(x=>x.x);
}
function random3(s){let seed=2166136261>>>0;for(const c of s)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
 const a=[...nums];for(let i=0;i<3;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;let j=i+Math.floor(seed/4294967296*(100-i));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,3)}
function result(window){
 const perTurn={},total={evaluated:0,days:0,hits:Object.fromEntries(names.map(n=>[n,0])),repeat:0,poolRepeat:0,overlap:0,comparisons:0};
 for(const t of Object.keys(turns)){
  const complete=good.map(r=>({date:r.date,heads:r.turns[t]}))
   .filter(r=>juris.every(j=>/^\d{4}$/.test(r.heads?.[j]||'')))
   .map(r=>({...r,values:juris.map(j=>+r.heads[j].slice(-2))}));
  const count={completeDays:complete.length,evaluated:0,days:0,hits:Object.fromEntries(names.map(n=>[n,0])),repeat:0,poolRepeat:0,overlap:0,comparisons:0};
  for(let i=window;i<complete.length;i++){
   const previous=complete.slice(i-window,i),now=complete[i],pool=previous.map(r=>r.values);
   const delayed=pick(pool,'atrasado'),hot=pick(pool,'caliente'),cold=pick(pool,'frio');
   const perJur=juris.map((_,j)=>pick(previous.map(r=>[r.values[j]]),'atrasado'));
   const randomPool=random3(t+'|'+now.date+'|pool');
   for(let j=0;j<5;j++){
    const value=now.values[j],lists=[delayed,perJur[j],hot,cold,randomPool,random3(t+'|'+now.date+'|'+juris[j])];
    names.forEach((n,k)=>{if(lists[k].includes(value))count.hits[n]++});
    count.repeat+= +(previous.at(-1).values[j]===value);
    count.poolRepeat+= +previous.at(-1).values.includes(value);
    count.overlap+=perJur[j].filter(v=>delayed.includes(v)).length;count.comparisons++;
   }
   count.evaluated+=5;count.days++;
  }
  perTurn[t]=count;
  total.evaluated+=count.evaluated;total.days+=count.days;
  names.forEach(n=>total.hits[n]+=count.hits[n]);
  ['repeat','poolRepeat','overlap','comparisons'].forEach(n=>total[n]+=count[n]);
 }
 const summarize=raw=>({cabezasEvaluadas:raw.evaluated,jornadasEvaluadas:raw.days,
  metodos:Object.fromEntries(names.map(n=>[n,{aciertos:raw.hits[n],
   porcentaje:raw.evaluated?+(100*raw.hits[n]/raw.evaluated).toFixed(2):null}])),
  repeticion_mismo_numero_jurisdiccion_prev:raw.evaluated?+(100*raw.repeat/raw.evaluated).toFixed(2):null,
  repeticion_en_cualquiera_de_las_cinco_prev:raw.evaluated?+(100*raw.poolRepeat/raw.evaluated).toFixed(2):null,
  media_traslape_listas_top3:raw.comparisons?+(raw.overlap/raw.comparisons).toFixed(2):null});
 return {window,total:summarize(total),porTurno:Object.fromEntries(Object.entries(perTurn)
 .map(([t,x])=>[t,{diasCompletos:x.completeDays,...summarize(x)}]))};
}
const report={fuente:endpoint,cobertura:{desde:dates[0],hasta:end,fechasConsultadas:dates.length,
 fechasConDatos:good.length,errores:errors.slice(0,12)},
criterios:{premio:'solo primera cabeza',jurisdicciones:juris,turnos:Object.keys(turns),
seleccion:'exactamente 3 terminaciones por cabeza en todos los metodos',
retrospectivo:'solo usa fechas anteriores; nunca resultados del turno a evaluar',
atrasos_sin_origen:'no se inventan; números nunca vistos en ventana no entran como atraso confirmado',
referenciaProbabilidad:'3% por cabeza uniforme; no indica ventaja real',
comparabilidad:'para atraso individual se generan 3 candidatos por jurisdiccion, conjunto usa 3 comunes'}, 
evaluaciones:win.map(result)};
fs.mkdirSync('research-output',{recursive:true});fs.writeFileSync('research-output/estudio-atrasos.json',JSON.stringify(report,null,2));
for(const x of report.evaluaciones)console.log('RESULTADO VENTANA '+x.window+' '+JSON.stringify(x));
