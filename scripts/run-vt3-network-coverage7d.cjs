// Censo de redes VT3 ganadoras y techos de cobertura, sin selección nueva.
// --from=AAAA-MM-DD --to=AAAA-MM-DD --out=out/archivo.json
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
const {buildSheet}=load('src/sheet.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {auditVT3NetworkCoverage7D}=load('src/vt3NetworkCoverage7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(a=>a.startsWith('--')&&a.includes('='))
 .map(a=>a.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from,to=args.to,out=args.out||'out/vt3-network-coverage.json';
const ms=x=>Date.parse(x+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from||'')||!/^\d{4}-\d{2}-\d{2}$/.test(to||'')||
 !Number.isFinite(ms(from))||!Number.isFinite(ms(to))||ms(to)<ms(from)||
 ms(to)-ms(from)>366*86400000)throw Error('Fechas inválidas o período mayor a un año');
async function main(){
 const data=[],missing=[];
 for(let t=ms(from);t<=ms(to);t+=86400000){
  const d=new Date(t);if(d.getUTCDay()===0)continue;
  const date=d.toISOString().slice(0,10),heads=await descargarCabezas(date,true);
  if(!hasDrawResults(heads)||!hasNocturnoBase(heads)){missing.push(date);continue}
  data.push({date,heads});
 }
 if(data.length<16)throw Error('Sin hojas suficientes para D14, D7 y turno objetivo');
 const dated=data.slice(1).map((day,i)=>({date:day.date,sheet:buildSheet(day.heads,data[i].heads)}));
 const audit=auditVT3NetworkCoverage7D(dated),months={};
 for(const x of audit.rows){
  const m=x.date.slice(0,7),v=months[m]||(months[m]={turns:0,outcomes:0,
   any:0,d7:0,d14:0,union:0,top3:0,missingD7:0,rescuedD14:0,
   graphRoutes:0,forks:0,convergences:0,shifts:0,zoneMoves:0});
  v.turns++;v.outcomes+=x.outcomes.length;v.any+=x.covered.anyPhysical;
  v.d7+=x.covered.d7;v.d14+=x.covered.d14;v.union+=x.covered.union;
  v.top3+=x.covered.top3;v.missingD7+=x.missedByD7.length;
  v.rescuedD14+=x.newFromD14.length;
  v.graphRoutes+=x.graphD7.uniqueRoutes;v.forks+=x.graphD7.forkCells;
  v.convergences+=x.graphD7.convergenceCells;
  v.shifts+=x.change?.routesTranslated||0;v.zoneMoves+=x.change?.zoneMoved||0;
 }
 const record={source:'Viví tu Suerte / cabezas',period:{from,to},drawDays:data.length,
  skippedDates:missing,recordedAt:new Date().toISOString(),audit,months};
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(record,null,2)+'\n');
 console.log('RED_VT3: '+from+' a '+to+' | turnos='+audit.turns+
  ' | con_D14='+audit.turnsWithBothWeeks+' | cabezas_VT3_distintas='+audit.observedDistinctVT3);
 console.log('COBERTURA_VT3: cualquier_ruta='+audit.physicalHits+
  ' | oraculo_D7='+audit.d7OracleHits+
  ' | oraculo_D14='+audit.d14OracleHits+
  ' | union_D7_D14='+audit.unionOracleHits+
  ' | Top3_REAL='+audit.top3Hits+
  ' | FUERA_D7='+audit.missedByD7+
  ' | rescatadas_D14='+audit.newFromD14+
  ' | imposibles_fisicamente='+audit.notPhysical);
 console.log('RED_HISTORICA: rutas_D7='+audit.network.routesD7+
  ' | celdas_compartidas='+audit.network.sharedCellsD7+
  ' | bifurcaciones='+audit.network.forkCellsD7+
  ' | convergencias='+audit.network.convergenceCellsD7+
  ' | traslaciones_D14_D7='+audit.network.translatedRoutes+
  ' | cambios_zona='+audit.network.zoneMoves);
 for(const [month,v] of Object.entries(months))
  console.log('MES '+month+' | resultados='+v.outcomes+' | físico='+v.any+
   ' | D7='+v.d7+' | D14='+v.d14+' | unión='+v.union+
   ' | Top3='+v.top3+' | rescate_D14='+v.rescuedD14+
   ' | redes='+v.graphRoutes+' | bifurca='+v.forks+
   ' | converge='+v.convergences+' | traslado='+v.shifts);
 console.log('Informe individual con marcas, celdas, rutas y techos: '+out);
 console.log('ATENCIÓN: cotas oráculo de cobertura son observación posterior, NO pronóstico.');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
