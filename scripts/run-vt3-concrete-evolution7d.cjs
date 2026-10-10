// Informe de evoluciones VT3 concretas de una jornada histórica.
// PRIMERO se reconstruyen las cinco hojas ANTES; ningún resultado del turno
// objetivo interviene en la genealogía o en la relectura de celdas.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const p=path.resolve(root,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};cache.set(p,m);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:p})(
  x=>x.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(p),x))):require(x),m,m.exports);
 return m.exports;
}
const {TURNOS}=load('src/domain.ts'),{descargarCabezas}=load('src/cabezas.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {buildSheet}=load('src/sheet.ts');
const {traceConcreteVT3Before7D}=load('src/vt3ConcreteEvolution7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const date=args.date||'2026-09-30',out=args.out||'out/vt3-concrete-'+date;
const ms=x=>Date.parse(x+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(ms(date)))
 throw Error('Fecha inválida');
async function main(){
 const raw=[],skipped=[];
 for(let t=ms(date)-23*86400000;t<=ms(date);t+=86400000){
  const d=new Date(t);if(d.getUTCDay()===0)continue;
  const day=d.toISOString().slice(0,10),heads=await descargarCabezas(day,true);
  if(hasDrawResults(heads)&&hasNocturnoBase(heads))raw.push({date:day,heads});
  else skipped.push(day);
 }
 if(raw.length<8||raw[raw.length-1].date!==date)
  throw Error('Historial real o fecha objetivo sin datos suficientes');
 const days=raw.slice(1).map((x,i)=>({
  date:x.date,sheet:buildSheet(x.heads,raw[i].heads)
 }));
 const full=days[days.length-1];
 const history=days.slice(0,-1).slice(-10);
 const previews=TURNOS.map(turn=>traceConcreteVT3Before7D(history,full.sheet,date,turn,6));
 const dir=path.resolve(root,out);fs.mkdirSync(dir,{recursive:true});
 const overview=[
  '# Modelo Papá · genealogía VT3 concreta de '+date,'',
  '**Todas las lecturas siguientes se construyeron ANTES de destapar su turno objetivo.**',
  'Se reconstruyen automáticamente figuras que explicaron cabezas previamente conocidas.',
  'Ninguna trayectoria fue acreditada como trazo manual del padre.','',
  '| Turno pendiente | Columnas +11 | Rutas testigo | Relecturas en tablero actual | Misma huella anterior | Traslaciones | Ramificaciones | Cifras cambiadas |',
  '|---|---:|---:|---:|---:|---:|---:|---:|'
 ];
 for(const preview of previews){
  const file=String(TURNOS.indexOf(preview.target)+1)+'-'+preview.target;
  const reps=[...preview.projections].sort((a,b)=>
   Number(!!b.predecessor)-Number(!!a.predecessor)||
   Number(b.anchor.date===date)-Number(a.anchor.date===date)||
   b.anchor.date.localeCompare(a.anchor.date)||
   a.anchor.sourceId.localeCompare(b.anchor.sourceId)||
   a.anchor.cells.join('>').localeCompare(b.anchor.cells.join('>')));
  const byProvenance=new Map();
  for(const projection of preview.projections){
   const e=projection.anchor,key=[e.date,e.turn,e.sourceId,e.wonVT3].join('|');
   const v=byProvenance.get(key)||{paths:new Set(),readings:new Set()};
   v.paths.add(e.cells.join('>'));
   if(projection.todayValue)v.readings.add(projection.todayValue);
   byProvenance.set(key,v);
  }
  const multipleRoutes=[...byProvenance.values()].filter(x=>x.paths.size>1);
  const divergentReadings=multipleRoutes.filter(x=>x.readings.size>1);
  console.log('AMBIGUEDAD_VT3 '+preview.target+
   ' | ternas_historicas='+byProvenance.size+
   ' | ternas_con_varias_rutas='+multipleRoutes.length+
   ' | distintas_relecturas_actuales='+divergentReadings.length);
  const lines=[
   '# '+date+' — ANTES de '+preview.target,'',
   '**Columnas disponibles:** '+preview.visibleSources.join(', '),
   '**Turnos anteriores de hoy:** '+(preview.completedToday.join(', ')||'ninguno'),
   '**Jornadas anteriores consultadas:** '+preview.previousDrawDates.join(', '),'',
   '**Rutas VT3 testigo:** '+preview.anchors+' · **relecturas válidas:** '+preview.readableProjections,
   '**Antecesores físicos:** exactos '+preview.exactPredecessors+
    ', traslaciones '+preview.translatedPredecessors+
    ', ramificaciones '+preview.branchPredecessors,
   '',
   '## Recorridos concretos y sus cifras',''
  ];
  for(const p of reps.slice(0,15)){
   const predecessor=p.predecessor;
   lines.push('### '+p.anchor.wonVT3+' → '+(p.todayValue||'no legible')+
    ' · '+p.anchor.sourceId+' · '+p.anchor.cells.join(' → '),'',
    '- Testigo previo: '+p.anchor.date+' / '+p.anchor.turn+
     ' (cabeza/s '+p.anchor.heads.join(', ')+')',
    '- Misma ruta física leída HOY: '+(p.todayValue||'no disponible')+
     ' (terminación VT2 '+(p.todayVT2||'sin lectura')+')',
    '- Figura: '+p.anchor.shape,
    '- Antecedente geométrico: '+(predecessor?
      predecessor.relation+' en '+predecessor.earlier.date+' / '+
      predecessor.earlier.turn+' de '+predecessor.earlier.wonVT3+
      (predecessor.move?' traslado '+predecessor.move.rows+' filas, '+
       predecessor.move.columns+' columnas internas':''):'sin relación previa de la familia'),
    '- Analogías de MISMO VALOR en OTRAS fuentes: '+p.independentOtherColumnAnalogies.length,
    '');
  }
  lines.push('## Límites','',...preview.warnings.map(x=>'- '+x));
  fs.writeFileSync(path.join(dir,file+'-ANTES.md'),lines.join('\n')+'\n');
  fs.writeFileSync(path.join(dir,file+'-ANTES.json'),JSON.stringify(preview,null,2)+'\n');
  overview.push('| '+preview.target+' | '+preview.visibleSources.length+' | '+preview.anchors+
   ' | '+preview.readableProjections+' | '+preview.exactPredecessors+
   ' | '+preview.translatedPredecessors+' | '+preview.branchPredecessors+
   ' | '+preview.digitChanges+' |');
  console.log('GENEALOGIA '+date+' '+preview.target+
   ' | columnas='+preview.visibleSources.length+
   ' | episodios='+preview.episodesInMemory+
   ' | rutas_testigo='+preview.anchors+
   ' | proyectadas='+preview.readableProjections+
   ' | exactas='+preview.exactPredecessors+
   ' | traslaciones='+preview.translatedPredecessors+
   ' | ramas='+preview.branchPredecessors+
   ' | cifras_nuevas='+preview.digitChanges);
  for(const p of reps.filter(x=>x.availableInCurrentBoard).slice(0,3))
   console.log('TRAZA_VT3 '+preview.target+' | origen='+p.anchor.sourceId+
    ' | testigo='+p.anchor.date+' '+p.anchor.turn+
    ' '+p.originalVT3+'@'+p.anchor.cells.join('>')+
    ' | relectura_hoy='+p.todayValue+
    ' | antecedente='+ (p.predecessor?
      p.predecessor.relation+' '+p.predecessor.earlier.date+' '+
      p.predecessor.earlier.wonVT3:'sin_familia_previa'));
 }
 overview.push('','## Interpretación','',
  'Un «testigo» es un recorrido que explicó alguna cabeza YA CONOCIDA, no un pronóstico del siguiente turno.',
  'La proyección sobre HOY relee las mismas celdas de la misma columna de origen;',
  'su nueva cifra sólo tiene valor descriptivo hasta comprobar eficacia predictiva en un futuro congelado.',
  'Si D−7 no está presente se continúa igual. VT2 es terminación contenida de VT3, no un evento adicional.',
  '');
 fs.writeFileSync(path.join(dir,'00-RESUMEN.md'),overview.join('\n'));
 console.log('INFORMES_GENEALOGIA_COMPLETOS: '+out);
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
