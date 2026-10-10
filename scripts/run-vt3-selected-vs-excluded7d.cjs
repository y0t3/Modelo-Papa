// Inspección cronológica de figuras VT3 que el Top3 ELIGIÓ y DEJÓ AFUERA.
// Mismas cabezas de fuente, mismas columnas +11, mismos pesos.
// No propone otro selector: datos de resultados sólo para auditoría POSTERIOR.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const p=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(p,mod);
 const req=n=>n.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(p),n))):require(n);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:p})(req,mod,mod.exports);
 return mod.exports;
}
const {descargarCabezas}=load('src/cabezas.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {buildSheet}=load('src/sheet.ts');
const {auditSelectedVsExcludedVT37D}=load('src/vt3SelectedVsExcluded7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from,to=args.to,out=args.out||'out/vt3-selected-vs-excluded.json';
const ms=x=>Date.parse(x+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from||'')||!/^\d{4}-\d{2}-\d{2}$/.test(to||'')||
 !Number.isFinite(ms(from))||!Number.isFinite(ms(to))||ms(to)<ms(from)||
 ms(to)-ms(from)>366*86400000)throw Error('Fecha o intervalo inválido');
async function main(){
 const full=[],skipped=[];
 for(let t=ms(from);t<=ms(to);t+=86400000){
  const d=new Date(t);if(d.getUTCDay()===0)continue;
  const date=d.toISOString().slice(0,10),heads=await descargarCabezas(date,true);
  if(!hasDrawResults(heads)||!hasNocturnoBase(heads)){skipped.push(date);continue}
  full.push({date,heads});
 }
 if(full.length<8)throw Error('Faltan jornadas para historial causal');
 const dated=full.slice(1).map((d,i)=>({date:d.date,sheet:buildSheet(d.heads,full[i].heads)}));
 const audit=auditSelectedVsExcludedVT37D(dated);
 const document={from,to,drawDays:full.length,skipped,
  evaluatedAt:new Date().toISOString(),audit};
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(document,null,2)+'\n');
 console.log('VT3_DIAGNOSTICO: '+from+' a '+to+
  ' | turnos='+audit.turns+' | elegidos='+audit.selectedCandidates+
  ' | acertados='+audit.selectedHits+' | pool_total='+audit.eligibleCandidates+
  ' | posibles_en_pool='+audit.eligibleWinningValues+
  ' | ganadores_omitidos='+audit.missedEligibleWinners+
  ' | ganadores_fuera_pool='+audit.winnersOutsideAdaptivePool+
  ' | ganadores_fisicos='+audit.physicalWinningValues);
 for(const [turn,x]of Object.entries(audit.byTurn))
  console.log('TURNO '+turn+' | seleccionados='+x.selected+
   ' | aciertos='+x.hits+' | elegibles_ganadores='+x.eligibleWinners+
   ' | omitidos='+x.missedWinners+' | fuera_pool='+x.outsidePool);
 for(const [key,x]of Object.entries(audit.featureCounts))
  console.log('RASGO '+key+' | ELEGIDOS='+x.selectedHits+'/'+x.selectedCount+
   ' | OMITIDOS='+x.excludedHits+'/'+x.excludedCount);
 console.log('EJEMPLOS_OMITIDOS='+audit.examples.length+
  ' | detalle_fecha_turno_columna_ruta_y_evidencia='+out);
 console.log('Aciertos de candidatos omitidos son resultados POSTERIORES: no implican una regla prospectiva.');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
