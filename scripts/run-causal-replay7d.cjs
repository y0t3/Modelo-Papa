// Uso: node scripts/run-causal-replay7d.cjs --from=2026-06-01 --to=2026-09-30
// Evalua el lector 7D desde el historial real, sin construir candidatas con
// las cabezas del turno objetivo. No toca el motor, selector ni la APK.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const cache=new Map(),base=path.resolve(__dirname,'..');
function load(file){
 const resolved=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(resolved))return cache.get(resolved).exports;
 const source=fs.readFileSync(resolved,'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const module={exports:{}};cache.set(resolved,module);
 const localRequire=name=>name.startsWith('.')?
  load(path.relative(base,path.resolve(path.dirname(resolved),name))):require(name);
 vm.runInThisContext('(function(require,module,exports){'+compiled+'\n})',
  {filename:resolved})(localRequire,module,module.exports);
 return module.exports;
}
const {descargarCabezas}=load('src/cabezas.ts');
const {buildSheet}=load('src/sheet.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {auditCombinedChronologically7D}=load('src/causalReplay7d.ts');
const {TURNOS}=load('src/domain.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from,to=args.to,output=args.out||'out/causal-replay-7d.json';
const dateRe=/^\d{4}-\d{2}-\d{2}$/;
const asTime=x=>Date.parse(x+'T12:00:00Z');
if(!dateRe.test(from||'')||!dateRe.test(to||'')||
 !Number.isFinite(asTime(from))||!Number.isFinite(asTime(to))||
 asTime(to)<asTime(from)||asTime(to)-asTime(from)>366*86400000){
 console.error('Uso: --from=AAAA-MM-DD --to=AAAA-MM-DD [--out=archivo.json], máximo 367 días');
 process.exit(2);
}
function* dates(){
 for(let ms=asTime(from);ms<=asTime(to);ms+=86400000){
  const dt=new Date(ms);if(dt.getUTCDay()===0)continue;yield dt.toISOString().slice(0,10);
 }
}
async function main(){
 const days=[],skipped=[];
 for(const date of dates()){
  // Descargar con el mismo parser de cabezas que ya usa la app.
  // Error de red o API => falla la corrida; NUNCA se trata como feriado.
  const heads=await descargarCabezas(date,true);
  if(!hasDrawResults(heads)||!hasNocturnoBase(heads)){skipped.push(date);continue}
  days.push({date,heads});
 }
 if(days.length<8)throw Error('Insuficientes días completos para replay causal (base + seis jornadas + objetivo)');
 const data=days.slice(1).map((d,i)=>({date:d.date,sheet:buildSheet(d.heads,days[i].heads)}));
 const audit=auditCombinedChronologically7D(data);
 const document={source:'Viví tu Suerte via src/cabezas.ts',from,to,
  drawingDays:days.length,skippedDays:skipped,recordedAt:new Date().toISOString(),
  audit};
 fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,JSON.stringify(document,null,2)+'\n');
 console.log('REPLAY 7D: '+days.length+' jornadas completas; '+skipped.length+' omitidas; '+audit.evaluatedTurns+' turnos evaluados.');
 for(const x of audit.byKind){
  console.log([x.kind,'candidatas='+x.candidates,'aciertos='+x.hits,
   'turnos_con_acierto='+x.turnsWithHit,'abstenciones='+x.abstentions,
   'azar_esperado='+x.randomExpectedHits.toFixed(3)].join(' | '));
 }
 // Corte mensual DESCRIPTIVO: no cambia candidatos ni reentrena pesos.
 const widths={vt2:2,vt3:3,vt4:4},universes={vt2:100,vt3:1000,vt4:10000};
 const monthly=new Map();
 for(const row of audit.rows){
  const month=row.date.slice(0,7);
  if(!monthly.has(month))monthly.set(month,Object.fromEntries(['vt2','vt3','vt4'].map(kind=>[
   kind,{turns:0,selected:0,hits:0,hitTurns:0,expected:0,abstentions:0}
  ])));
  for(const kind of ['vt2','vt3','vt4']){
   const x=monthly.get(month)[kind],p=row.candidates.filter(c=>c.kind===kind);
   x.turns++;x.selected+=p.length;x.hits+=p.filter(c=>c.hit).length;
   if(p.some(c=>c.hit))x.hitTurns++;
   if(!p.length)x.abstentions++;
   const winners=new Set(row.heads.map(h=>h.slice(-widths[kind]))).size;
   x.expected+=p.length*winners/universes[kind];
  }
 }
 for(const [month,group] of monthly)for(const kind of ['vt2','vt3','vt4']){
  const x=group[kind];
  console.log('MES '+month+' '+kind+' | candidatas='+x.selected+
   ' | aciertos='+x.hits+' | turnos_acertados='+x.hitTurns+
   ' | abstenciones='+x.abstentions+' | azar_esperado='+x.expected.toFixed(3));
 }
 console.log('Detalle reproducible: '+output);
 console.log('IMPORTANTE: referencia uniforme preliminar; no demuestra ventaja fuera de muestra.');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
