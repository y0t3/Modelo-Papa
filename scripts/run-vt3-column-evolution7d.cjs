// Censo sin pronósticos: cómo modifica cada nuevo turno la lectura VT3
// de la tabla +11, siempre antes del turno que se quiere estudiar.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
function load(name){
 const p=path.resolve(base,name.endsWith('.ts')?name:name+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const code=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};cache.set(p,m);vm.runInThisContext('(function(require,module,exports){'+code+'\n})',{filename:p})(
 x=>x.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(p),x))):require(x),m,m.exports);
 return m.exports;
}
const {descargarCabezas}=load('src/cabezas.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {buildSheet}=load('src/sheet.ts');
const {traceDayColumnEvolution7D}=load('src/vt3ColumnEvolution7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(s=>s.startsWith('--')).map(s=>s.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from||'2026-09-30',to=args.to||from;
const out=args.out||'out/vt3-column-evolution-'+from;
const time=x=>Date.parse(x+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to)||
 !Number.isFinite(time(from))||!Number.isFinite(time(to))||time(to)<time(from)||
 time(to)-time(from)>125*86400000)throw Error('Fechas inválidas o período demasiado largo');
async function main(){
 const raw=[],missing=[];
 for(let t=time(from)-23*86400000;t<=time(to);t+=86400000){
  const d=new Date(t);if(d.getUTCDay()===0)continue;
  const date=d.toISOString().slice(0,10),heads=await descargarCabezas(date,true);
  if(hasDrawResults(heads)&&hasNocturnoBase(heads))raw.push({date,heads});
  else missing.push(date);
 }
 if(raw.length<11)throw Error('Historial insuficiente para +11');
 const days=raw.slice(1).map((d,i)=>({date:d.date,sheet:buildSheet(d.heads,raw[i].heads)}));
 const targets=days.filter(x=>x.date>=from&&x.date<=to);
 const report=[],summary={
  days:0,stages:0,stagesChanged:0,top3Entries:0,unchangedStages:0,
  newlyEligible:0,newlyEligibleNewColumn:0,newlyEligibleOldColumn:0,
  rankChangesOfExisting:0,physicalNewValues:0,markVT3FromCompleted:0,
  fromStage:{}
 };
 const lines=['# Evolución de la lectura VT3 en la tabla +11', '',
  'Reconstrucción histórica con cortes previos al sorteo; **no es un motor nuevo ni una recomendación de apuestas**.',
  'Los cambios al Top3 usan el ranking ADAPTATIVO anterior sin alterar pesos o candidatos.',
  'Valores físicamente formables ≠ cifras elegidas. El objetivo posterior permanece invisible.',
  ''];
 const fmt=a=>a.length?a.join(', '):'ninguno';
 for(const day of targets){
  const i=days.findIndex(x=>x.date===day.date);
  const history=days.slice(Math.max(0,i-10),i);
  if(history.length<7)continue;
  const trace=traceDayColumnEvolution7D(history,day.sheet,day.date);
  report.push(trace);summary.days++;
  lines.push('## '+day.date,'','| Corte | +11 agregada | Top3 antes | Top3 después | Entraron | Salieron |','|---|---|---|---|---|---|');
  for(const s of trace.stages){
   const key=s.justCompletedTurn+'→'+s.nextTarget;
   const v=summary.fromStage[key]||(summary.fromStage[key]={
    days:0,changed:0,entries:0,newPoolSource:0,newPoolOld:0,
    newPhysical:0,addedWinningVT3Marks:0
   });
   summary.stages++;summary.stagesChanged+=Number(s.enteredTop3.length>0);
   summary.unchangedStages+=Number(!s.enteredTop3.length);
   summary.top3Entries+=s.enteredTop3.length;summary.newlyEligible+=s.newlyEligible;
   summary.newlyEligibleNewColumn+=s.newlyEligibleFromNewColumn;
   summary.newlyEligibleOldColumn+=s.newlyEligibleFromOldColumns;
   summary.rankChangesOfExisting+=s.rankOrStatusChangeWithoutEntering;
   summary.physicalNewValues+=s.physicalNewValues;
   summary.markVT3FromCompleted+=s.newVerifiedVT3Marks;
   v.days++;v.changed+=Number(s.enteredTop3.length>0);
   v.entries+=s.enteredTop3.length;v.newPoolSource+=s.newlyEligibleFromNewColumn;
   v.newPoolOld+=s.newlyEligibleFromOldColumns;
   v.newPhysical+=s.physicalNewValues;v.addedWinningVT3Marks+=s.newVerifiedVT3Marks;
   lines.push('| '+key+' | '+s.newColumn.id+' | '+fmt(s.top3Before)+' | '+
    fmt(s.top3After)+' | '+fmt(s.enteredTop3)+' | '+fmt(s.leftTop3)+' |');
   console.log('DELTA '+day.date+' '+key+' | +col='+s.newColumn.id+
    ' | old='+fmt(s.top3Before)+' | new='+fmt(s.top3After)+
    ' | nuevas_en_top='+fmt(s.enteredTop3)+
    ' | marcas_VT3_recien_cerradas='+s.newVerifiedVT3Marks+
    ' | nuevos_pool='+s.newlyEligible+
    ' (nueva_col='+s.newlyEligibleFromNewColumn+
    ',otras_col='+s.newlyEligibleFromOldColumns+')');
   if(s.newVerifiedVT3Marks===0&&s.newlyEligible===0&&s.enteredTop3.length>0){
    console.log('SIN_NUEVA_MARCA_NI_ELEGIBLES '+day.date+' '+key+
     ' | antes='+s.beforeTop3Details.map(x=>x.value+':'+x.state+'#'+x.rank+'→'+
      (x.stillEligibleAfter?x.stateAfter+'#'+x.rankAfter:'FUERA_POOL')).join(',')+
     ' | despues='+s.top3After.map(v=>{
      const x=s.candidateDetails.find(c=>c.value===v);
      return v+':'+x.newState+'#'+x.newRank+'(antes '+(x.oldRank??'no')+')';
     }).join(','));
   }
  }
  lines.push('','### Lectura de cada transición, sin sumar candidatas','');
  for(const s of trace.stages){
   lines.push('**'+s.justCompletedTurn+' → '+s.nextTarget+'** — columna física añadida: '+
    s.newColumn.id+', seis pares +11: '+s.newColumn.values.join(' / '),
    '',
    'Se confirmaron '+s.newVerifiedVT3Marks+' recorridos VT3 del turno que terminó. '+
    'Aparecieron '+s.physicalNewValues+' valores físicamente legibles nuevos (no propuestas); '+
    s.newlyEligibleFromNewColumn+' valores ingresaron al conjunto adaptativo desde la columna nueva y '+
    s.newlyEligibleFromOldColumns+' desde columnas antiguas. El resto sólo pudo cambiar de orden o estado.',
    '');
   for(const value of s.top3After){
    const c=s.candidateDetails.find(x=>x.value===value);
    if(!c)throw Error('Top3 desapareció del historial de figuras');
    const why=c.newlyEligible?
     'recién elegible '+(c.comesFromNewColumn?'en NUEVA columna':'en columna ya existente'):
     'ya elegible, posición anterior '+c.oldRank;
    lines.push('- **'+value+'** ('+c.sourceId+': '+c.cells.join('→')+
     ', forma '+c.shape+'): '+why+
     '. Marcas del turno terminado con misma forma y origen: '+
     c.newMarks.sameShapeSameColumn+
     '; con forma análoga en otra columna: '+c.newMarks.sameShapeOtherColumn+
     '; contacto físico en mismo origen: '+c.newMarks.contactSameColumn+'.');
   }
   lines.push('');
  }
 }
 if(!report.length)throw Error('No hay jornadas objetivo con historia suficiente');
 const folder=path.resolve(base,out);fs.mkdirSync(folder,{recursive:true});
 fs.writeFileSync(path.join(folder,'reporte-previo.json'),JSON.stringify({from,to,missing,summary,days:report,
  note:'Los cortes sólo utilizan sorteo cerrado. No se incorporan resultados del turno objetivo.'},null,2)+'\n');
 fs.writeFileSync(path.join(folder,'lectura-por-columna.md'),lines.join('\n')+'\n');
 console.log('RESUMEN '+from+' a '+to+' | jornadas='+summary.days+
  ' | cambios_de_top3='+summary.stagesChanged+'/'+summary.stages+
  ' | entradas='+summary.top3Entries+
  ' | nuevas_candidatas_pool_fuente='+summary.newlyEligibleNewColumn+
  ' | activadas_en_fuentes_viejas='+summary.newlyEligibleOldColumn+
  ' | valores_fisicos_nuevos='+summary.physicalNewValues);
 console.log('Archivo: '+out+'/lectura-por-columna.md');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
