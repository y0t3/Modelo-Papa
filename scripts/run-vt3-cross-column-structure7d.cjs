// Censo de las relaciones VT3 numéricas/espaciales entre columnas +11
// antes de cada sorteo, con contraste de distribución de dígitos.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const p=path.resolve(root,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};cache.set(p,m);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:p})(
  n=>n.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(p),n))):require(n),m,m.exports);
 return m.exports;
}
const {TURNOS}=load('src/domain.ts');
const {buildSheet}=load('src/sheet.ts');
const {descargarCabezas}=load('src/cabezas.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {inspectCrossColumnVT37D}=load('src/vt3CrossColumnStructure7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(s=>s.startsWith('--')&&s.includes('='))
 .map(s=>s.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from,to=args.to,out=args.out||'out/vt3-cross-column.json';
const count=Number(args.permutations||32),ms=s=>Date.parse(s+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from||'')||!/^\d{4}-\d{2}-\d{2}$/.test(to||'')||
 !Number.isFinite(ms(from))||!Number.isFinite(ms(to))||
 ms(from)>ms(to)||ms(to)-ms(from)>45*86400000||
 !Number.isInteger(count)||count<4||count>128)throw Error('Parámetros inválidos');
async function main(){
 const draws=[],missing=[];
 // Se descarga la última Nocturna anterior incluso si el día anterior
 // no tuvo sorteos. Para el primer día apto se necesita el día anterior.
 for(let t=ms(from)-8*86400000;t<=ms(to);t+=86400000){
  const d=new Date(t);if(d.getUTCDay()===0)continue;
  const date=d.toISOString().slice(0,10);
  const heads=await descargarCabezas(date,true);
  if(hasDrawResults(heads)&&hasNocturnoBase(heads))draws.push({date,heads});
  else missing.push(date);
 }
 const selected=draws.filter(x=>x.date>=from&&x.date<=to);
 const reports=[],summary={
  days:0,turns:0,fullColumnObservations:0,
  shapeComparisonsIdentical:0,
  repeatedVT3Values:0,expectedRepeatedVT3Values:0,
  sameValueSameShape:0,expectedSameValueSameShape:0,
  sameValueSameCoordinates:0,expectedSameValueSameCoordinates:0,
  byTurn:{}
 };
 for(const day of selected){
  const index=draws.findIndex(x=>x.date===day.date);
  if(index<=0)continue;
  const sheet=buildSheet(day.heads,draws[index-1].heads);
  const targetRows=[];
  for(const target of TURNOS){
   const result=inspectCrossColumnVT37D(sheet,day.date,target,count);
   targetRows.push(result);
   const x=result.observed,c=result.control;
   summary.turns++;summary.fullColumnObservations+=result.available.filter(a=>a.complete).length;
   summary.shapeComparisonsIdentical+=Number(
    result.available.length>1&&result.available.every(a=>a.complete&&a.distinctShapes===38)&&
    x.shapesPresentInEveryCompleteColumn===38);
   summary.repeatedVT3Values+=x.repeatedValueAcrossColumns;
   summary.expectedRepeatedVT3Values+=c.expectedRepeatedValue;
   summary.sameValueSameShape+=x.sameValueSameShape;
   summary.expectedSameValueSameShape+=c.expectedValueSameShape;
   summary.sameValueSameCoordinates+=x.sameValueSameCoordinates;
   summary.expectedSameValueSameCoordinates+=c.expectedValueSameCoordinates;
   const p=summary.byTurn[target]||(summary.byTurn[target]={
    turns:0,repeated:0,expectedRepeated:0,sameCoords:0,
    expectedSameCoords:0,fullShapeOverlap:0
   });
   p.turns++;p.repeated+=x.repeatedValueAcrossColumns;
   p.expectedRepeated+=c.expectedRepeatedValue;
   p.sameCoords+=x.sameValueSameCoordinates;
   p.expectedSameCoords+=c.expectedValueSameCoordinates;
   p.fullShapeOverlap+=Number(x.columns>1&&
    result.available.every(a=>a.complete)&&x.shapesPresentInEveryCompleteColumn===38);
  }
  reports.push({date:day.date,rows:targetRows});summary.days++;
  if(day.date===from&&day.date===to){
   for(const row of targetRows)console.log('CASO '+day.date+' '+row.target+
    ' | columnas='+row.observed.columns+
    ' | formas_comunes='+row.observed.shapesPresentInEveryCompleteColumn+
    ' | valores_VT3_multicolumna='+row.observed.repeatedValueAcrossColumns+
    ' (barajado_promedio='+row.control.expectedRepeatedValue.toFixed(2)+')'+
    ' | mismas_3_celdas='+row.observed.sameValueSameCoordinates+
    ' (barajado_promedio='+row.control.expectedValueSameCoordinates.toFixed(2)+')'+
    ' | VT3_ejemplo='+row.examples.slice(0,4).map(x=>x.value+'['+x.sourceIds.join(',')+']').join(' '));
  }
 }
 if(!summary.days)throw Error('No hay días reconstruibles con Nocturna anterior');
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify({period:{from,to},permutations:count,
  missedDates:missing,summary,reports,
  warning:'La coincidencia numérica o espacial del tablero no predice el sorteo. Control de dígitos barajados no es control de aciertos.'},null,2)+'\n');
 console.log('VT3_ESTRUCTURA: '+from+' a '+to+' | jornadas='+summary.days+
  ' | cortes='+summary.turns+' | repeticiones_forma_invariantes='+summary.shapeComparisonsIdentical);
 console.log('VT3_VALORES_COMPARTIDOS: observados='+summary.repeatedVT3Values+
  ' | barajado_esperado='+summary.expectedRepeatedVT3Values.toFixed(2));
 console.log('VT3_MISMAS_CELDAS: observados='+summary.sameValueSameCoordinates+
  ' | barajado_esperado='+summary.expectedSameValueSameCoordinates.toFixed(2));
 console.log('VT3_MISMA_FORMA_Y_VALOR: observados='+summary.sameValueSameShape+
  ' | barajado_esperado='+summary.expectedSameValueSameShape.toFixed(2));
 for(const [turn,r]of Object.entries(summary.byTurn))console.log('TURNO '+turn+
  ' | cortes='+r.turns+' | valor_multicol='+r.repeated+'/'+r.expectedRepeated.toFixed(2)+
  ' | celdas_identicas='+r.sameCoords+'/'+r.expectedSameCoords.toFixed(2));
 console.log('JSON: '+out);
 console.log('Estas son propiedades de la hoja +11, NO aciertos de candidatos.');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
