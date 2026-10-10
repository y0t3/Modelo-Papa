// Primer expediente REAL previo al sorteo. NO crea ni selecciona un número.
// Si el resultado objetivo ya existe o se pasó el corte seguro, FALLA.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const crypto=require('crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),mods=new Map();
const arg=Object.fromEntries(process.argv.slice(2).filter(s=>s.startsWith('--')&&s.includes('=')).map(s=>s.slice(2).split(/=(.*)/s).slice(0,2)));
const turns=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const jurs=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
function load(name){
 const p=path.resolve(root,name.endsWith('.ts')?name:name+'.ts');
 if(mods.has(p))return mods.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};mods.set(p,mod);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:p})(
  x=>x.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(p),x))):require(x),mod,mod.exports);
 return mod.exports;
}
const {descargarCabezas}=load('src/cabezas.ts');
const {buildSheet}=load('src/sheet.ts');
const {buildVisualMarkedSheet7D,renderVisualMarkedSheetHTML7D}=load('src/visualMarkedSheet7d.ts');
const {hasNocturnoBase}=load('src/drawHistory.ts');
const {makeCut,page}=require('./run-blind-visual-95cuts.cjs');
const {html,digest}=require('./build-cuaderno-ocular95.cjs');
const ymd=d=>new Date(Date.parse(d+'T12:00:00Z')).toISOString().slice(0,10);
const offset=(date,days)=>new Date(Date.parse(date+'T12:00:00Z')+days*86400000).toISOString().slice(0,10);
const nValid=h=>jurs.filter(j=>/^\d{4}$/.test(h.Nocturno?.[j]||'')).length;
function preflight(now,deadline,date,target,heads){
 assert(/^\d{4}-\d{2}-\d{2}$/.test(date)&&ymd(date)===date);
 assert(turns.includes(target));
 assert(Number.isFinite(Date.parse(deadline)),'Fecha límite inválida');
 assert(now<Date.parse(deadline),'Fuera de plazo: no se puede sellar un expediente pre-sorteo');
 const local=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Argentina/Buenos_Aires',
  year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
 assert.equal(local,date,'No es hoy en Buenos Aires');
 const ix=turns.indexOf(target);
 const future=turns.slice(ix).flatMap(turn=>jurs.filter(j=>/^\d{4}$/.test(heads[turn]?.[j]||'')).map(j=>turn+'/'+j));
 assert.equal(future.length,0,'Ya existe información del objetivo o posterior: '+future.join(', '));
 const earlier=turns.slice(0,ix);
 for(let i=0;i<earlier.length;i++){
  const t=earlier[i];assert(jurs.some(j=>/^\d{4}$/.test(heads[t]?.[j]||'')),
   'Falta una jornada anterior en el mismo día: '+t);
 }
 return {local,date,target,earlier};
}
function guardInputs(current,prior,base,week,weekbase,date,target,now,deadline){
 const pre=preflight(now,deadline,date,target,current);
 assert(hasNocturnoBase(prior),'Sin Nocturno en la jornada anterior');
 assert(hasNocturnoBase(base),'Sin Nocturno de base para reconstruir la hoja previa');
 if(week||weekbase)assert(week&&weekbase&&hasNocturnoBase(week)&&hasNocturnoBase(weekbase),
  'Memoria D-7 incompleta; nunca representar una hoja como completa');
 return {pre,baseCoverage:nValid(base),priorCoverage:nValid(prior),
  weeklyCoverage:week?nValid(week):null};
}
function tests(){
 const no=Object.fromEntries(turns.map(t=>[t,Object.fromEntries(jurs.map(j=>[j,'----']))]));
 const time=Date.parse('2026-10-10T08:45:00-03:00');
 const date='2026-10-10',limit='2026-10-10T10:05:00-03:00';
 assert.equal(preflight(time,limit,date,'Previa',no).target,'Previa');
 assert.throws(()=>preflight(Date.parse('2026-10-10T10:06:00-03:00'),limit,date,'Previa',no));
 assert.throws(()=>preflight(time,limit,date,'Previa',{...no,Previa:{...no.Previa,Ciudad:'0123'}}));
 assert.throws(()=>preflight(time,limit,date,'Previa',{...no,Nocturno:{...no.Nocturno,Ciudad:'1111'}}));
 assert.throws(()=>preflight(time,limit,'2026-10-09','Previa',no));
 console.log('TEST_CAPTURA_PROSPECTIVA_OK: plazo estricto, fecha local, resultados futuros prohibidos');
}
async function main(){
 tests();if(arg['test-only']==='true')return;
 const date=arg.date,target=arg.target||'Previa',deadline=arg.deadline;
 assert(date&&deadline,'Se exigen --date=AAAA-MM-DD y --deadline=ISO con -03:00');
 const now=Date.now();
 assert(now<Date.parse(deadline),'Fuera de plazo incluso antes de descargar datos');
 const prevDate=offset(date,-1),baseDate=offset(date,-2);
 const weeklyDate=offset(date,-7),weeklyBase=offset(date,-8);
 // Capturar SIN escribir nada hasta validar plazo y ausencia de cabeza objetivo.
 const [current,prior,base,week,weekbase]=await Promise.all([
  descargarCabezas(date,true),descargarCabezas(prevDate,true),
  descargarCabezas(baseDate,true),descargarCabezas(weeklyDate,true),
  descargarCabezas(weeklyBase,true)
 ]);
 const captureAt=Date.now();
 const verified=guardInputs(current,prior,base,week,weekbase,date,target,captureAt,deadline);
 const priorSheet=buildSheet(prior,base);
 const priorView=buildVisualMarkedSheet7D(priorSheet,prevDate,'Nocturno');
 const weekSheet=buildSheet(week,weekbase);
 const weekView=buildVisualMarkedSheet7D(weekSheet,weeklyDate,'Nocturno');
 const targetSheet=buildSheet(current,prior);
 const ix=turns.indexOf(target);
 const stage=buildVisualMarkedSheet7D(targetSheet,date,ix?turns[ix-1]:'Previa');
 // For Previa: stage metadata constructed after synthetic "Previa closed" but
 // there are ZERO target heads (enforced above), and makeCut drops all strokes.
 const cut=makeCut(priorView,stage,ix,weekView);
 assert.equal(cut.target,target);
 assert.equal(cut.date,date);
 assert.equal(cut.knownToday.filter(t=>turns.indexOf(t.turn)>=ix).length,0);
 assert(cut.columns.every(c=>c.values.every(v=>v==='--'||/^\d{2}$/.test(v))));
 const nowAtWrite=Date.now();
 assert(nowAtWrite<Date.parse(deadline),'Plazo vencido durante la construcción');
 // Strict recheck immediately before writing to keep result-free source state.
 const verifyFresh=await descargarCabezas(date,true);
 preflight(Date.now(),deadline,date,target,verifyFresh);
 const out=path.resolve(root,arg.out||'out/captura-prospectiva-'+date+'-'+target);
 fs.mkdirSync(out,{recursive:true});
 const stem=date+'-ANTES-'+target;
 fs.writeFileSync(path.join(out,stem+'.json'),JSON.stringify(cut,null,2));
 fs.writeFileSync(path.join(out,'MIRADA-'+stem+'.html'),html(cut,{session:'LIVE'}));
 fs.writeFileSync(path.join(out,stem+'.html'),page(cut));
 fs.writeFileSync(path.join(out,prevDate+'-5-Nocturno.html'),renderVisualMarkedSheetHTML7D(priorView));
 fs.writeFileSync(path.join(out,weeklyDate+'-5-Nocturno.html'),renderVisualMarkedSheetHTML7D(weekView));
 for(const [src,dst] of [
  ['scripts/lab-comparativa95.js','lab-comparativa.js'],
  ['scripts/lab-comparativa95.css','lab-comparativa.css'],
  ['scripts/visor-ciego7d.js','visor-ciego.js'],
  ['scripts/visor-ciego7d.css','visor-ciego.css']
 ])fs.copyFileSync(path.join(root,src),path.join(out,dst));
 const manifest={protocol:'CAPTURA_PROSPECTIVA_SIN_DECISION_V1',date,target,
  actionRunId:process.env.GITHUB_RUN_ID||null,actionSha:process.env.GITHUB_SHA||null,
  source:'vivitusuerte.com/api/juegos/cabezasDiarias',
  capturedAtUtc:new Date(captureAt).toISOString(),deadline,cutSha256:digest(cut),
  previousDate:prevDate,previousNocturnoCoverage:verified.priorCoverage,
  baseDate,baseNocturnoCoverage:verified.baseCoverage,
  d7Date:weeklyDate,weeklyNocturnoCoverage:verified.weeklyCoverage,
  knownHeadsToday:verified.pre.earlier.map(t=>({turn:t,
   available:jurs.filter(j=>/^\d{4}$/.test(current[t]?.[j]||'')).length})),
  targetHeadCountInSnapshot:0,postTargetHeadCountInSnapshot:0,
  inheritedPaths:cut.inherited.length,
  inheritedD7Paths:cut.d7Inherited.length,
  knownTodayStrokes:cut.knownToday.length,
  humanSelections:0,forecastMade:false,registrationSealType:'GITHUB_ACTION_ARTIFACT_ONLY',
  note:'Tablero y huellas históricas antes de un sorteo; NO es una predicción y NO contiene ninguna selección humana.'};
 fs.writeFileSync(path.join(out,'MANIFIESTO_CAPTURA.json'),JSON.stringify(manifest,null,2));
 fs.writeFileSync(path.join(out,'index.html'),'<!doctype html><html lang="es"><meta charset="utf-8">'+
  '<title>Captura pre-sorteo Modelo Papá '+date+'</title>'+
  '<body style="font:16px system-ui;max-width:760px;margin:35px auto;padding:16px">'+
  '<h1>Modelo Papá · expediente previo al sorteo</h1>'+
  '<p>'+date+' · ANTES de '+target+' · corte límite '+deadline+
  '</p><p><strong>Sin número elegido ni pronóstico registrado.</strong> '+ 
  'La lámina reúne los recorridos que ya estaban marcados en la hoja anterior y '+ 
  'los relee sobre la tabla nueva.</p>'+
  '<p><a href="MIRADA-'+stem+'.html">Abrir cuaderno de observación visual</a></p>'+
  '<p><a href="'+stem+'.html">Abrir visor físico para dibujar manualmente</a></p>'+
  '<p><a href="'+prevDate+'-5-Nocturno.html">Ver hoja anterior completa y sus cabezas</a></p>'+
  '<p>La exportación local de una decisión NO certifica que se hizo antes del sorteo. '+ 
  'Para esa prueba, guardá el JSON externamente con hora verificable.</p></body></html>');
 console.log('CAPTURA_PRE_REAL_OK '+JSON.stringify(manifest));
}
main().catch(e=>{console.error('CAPTURA_ABORTADA '+(e.stack||e));process.exitCode=1;});
