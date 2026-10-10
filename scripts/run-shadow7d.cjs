// Uso: node scripts/run-shadow7d.cjs --from=2026-06-01 --to=2026-09-30
// Comparacion VT2 emparejada: lector D-7 original vs figura fija/trasladada.
// No modifica la aplicacion, no selecciona nuevos pesos, no opera la APK.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const cache=new Map(),base=path.resolve(__dirname,'..');
function load(file){
 const resolved=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(resolved))return cache.get(resolved).exports;
 const source=fs.readFileSync(resolved,'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(resolved,mod);
 const req=n=>n.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(resolved),n))):require(n);
 vm.runInThisContext('(function(require,module,exports){'+compiled+'\n})',{filename:resolved})(req,mod,mod.exports);
 return mod.exports;
}
const {descargarCabezas}=load('src/cabezas.ts');
const {buildSheet}=load('src/sheet.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {auditCombinedChronologically7D}=load('src/causalReplay7d.ts');
const {auditShadow7D}=load('src/dualFocusShadow7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from,to=args.to,output=args.out||'out/dual-focus-shadow-7d.json';
const rule=args.rule||'REPOSO_Y_RECONFIRMACION';
if(!['REPOSO_Y_RECONFIRMACION','REPOSO_Y_ACTIVIDAD'].includes(rule))throw Error('Regla sombra no permitida');
const dateRe=/^\d{4}-\d{2}-\d{2}$/;
const at=x=>Date.parse(x+'T12:00:00Z');
if(!dateRe.test(from||'')||!dateRe.test(to||'')||!Number.isFinite(at(from))||
 !Number.isFinite(at(to))||at(to)<at(from)||at(to)-at(from)>366*86400000){
 console.error('Fechas inválidas: --from=YYYY-MM-DD --to=YYYY-MM-DD, máximo 367 días.');
 process.exit(2);
}
async function main(){
 const complete=[],skipped=[];
 for(let ms=at(from);ms<=at(to);ms+=86400000){
  const d=new Date(ms);if(d.getUTCDay()===0)continue;
  const date=d.toISOString().slice(0,10);
  const heads=await descargarCabezas(date,true);
  if(!hasDrawResults(heads)||!hasNocturnoBase(heads)){skipped.push(date);continue}
  complete.push({date,heads});
 }
 if(complete.length<8)throw Error('Falta base Nocturna + seis jornadas de memoria y fecha objetivo');
 const days=complete.slice(1).map((d,i)=>({date:d.date,sheet:buildSheet(d.heads,complete[i].heads)}));
 const baseline=auditCombinedChronologically7D(days);
 const shadow=auditShadow7D(days,baseline.rows,rule);
 const byMonth={};
 for(const row of shadow.rows){
  const key=row.date.slice(0,7);
  const item=byMonth[key]||(byMonth[key]={turns:0,picks:0,fixedHits:0,shadowHits:0,
   changes:0,gained:0,lost:0,expectedSameBudget:0});
  item.turns++;item.picks+=row.baseline.length;item.fixedHits+=row.hitsBaseline;
  item.shadowHits+=row.hitsShadow;item.changes+=row.replaced;
  item.gained+=Number(row.hitsShadow>row.hitsBaseline);
  item.lost+=Number(row.hitsShadow<row.hitsBaseline);
  item.expectedSameBudget+=row.expectedSameBudget;
 }
 const report={period:{from,to},source:'Viví tu Suerte / descargarCabezas',completeDrawDays:complete.length,
  skippedDates:skipped,createdAt:new Date().toISOString(),baselineStats:baseline.byKind,
  shadow,byMonth};
 fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 console.log('DUAL_FOCUS_SHADOW: '+from+' a '+to+' | regla='+shadow.rule+' | turnos='+shadow.turns+
  ' | candidatas iguales='+shadow.candidatesEach);
 console.log('VT2_FOCUS: fijo='+shadow.baselineHits+' sombra='+shadow.shadowHits+
  ' | elegidos_traslado='+shadow.selectedShift+' | reemplazos='+shadow.actualChanges+
  ' | turnos_gana='+shadow.gained+' | turnos_pierde='+shadow.lost+
  ' | turnos_empata='+shadow.ties+' | azar_union='+shadow.physicalExpectedBoth.toFixed(3));
 for(const [month,x] of Object.entries(byMonth))console.log('MES '+month+' | fijo='+x.fixedHits+
  ' | sombra='+x.shadowHits+' | cambios='+x.changes+
  ' | gana='+x.gained+' | pierde='+x.lost+
  ' | azar_union='+x.expectedSameBudget.toFixed(3));
 const allChoices=shadow.rows.flatMap(row=>row.choices);
 const supported=allChoices.filter(c=>c.priorObservations>0);
 const rootedRest=supported.filter(c=>c.rootPhase==='REPOSO');
 const shifting=supported.filter(c=>c.shiftedPhase==='REACTIVACION_1'||c.shiftedPhase==='REACTIVACION_CONFIRMADA');
 const reconfirmed=supported.filter(c=>c.shiftedPhase==='REACTIVACION_CONFIRMADA');
 const both=reconfirmed.filter(c=>c.rootPhase==='REPOSO');
 console.log('SHADOW_DIAGNOSTIC: total='+allChoices.length+
  ' | estados_con_seguimiento='+supported.length+
  ' | traslacion_legible='+supported.filter(c=>!!c.shifted).length+
  ' | raiz_en_reposo='+rootedRest.length+
  ' | traslacion_reactivada='+shifting.length+
  ' | traslacion_reconfirmada='+reconfirmed.length+
  ' | ambas_condiciones='+both.length);
 console.log('JSON: '+output);
 console.log('Interpretacion exploratoria: datos ya inspeccionados, sin evidencia prospectiva.');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
