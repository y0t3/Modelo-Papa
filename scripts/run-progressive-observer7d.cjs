// Auditoría descriptiva de toda la lectura progresiva +11.
// Cada turno se abre con solo las columnas anteriores; el resultado objetivo
// se consulta DESPUÉS para comprobar cobertura de ternas YA confirmadas.
// No convierte esos hallazgos en candidatas ni ajusta prioridades.
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
const {TURNOS}=load('src/domain.ts');
const {descargarCabezas}=load('src/cabezas.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {buildSheet}=load('src/sheet.ts');
const {observeProgressiveBoard7D}=load('src/progressiveBoard7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from,to=args.to,out=args.out||'out/progressive-observer7d.json';
const ms=x=>Date.parse(x+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from||'')||!/^\d{4}-\d{2}-\d{2}$/.test(to||'')||
 !Number.isFinite(ms(from))||!Number.isFinite(ms(to))||ms(to)<ms(from)||
 ms(to)-ms(from)>366*86400000)throw Error('Fechas inválidas o periodo > 1 año');
const blank=turn=>({turn,draws:0,columns:0,withTodayVT3:0,
 withCrossTurnVT3:0,withCrossColumnVT3:0,withLastDayVT3:0,
 withWeekVT3:0,uniqueVT3Seen:0,nestedVT2Overlaps:0,
 vt3ValueOverlapWithNextResult:0,vt3Results:0,
 withAtLeastOneValueOverlap:0,withD7:0});
async function main(){
 const complete=[],skipped=[];
 for(let t=ms(from);t<=ms(to);t+=86400000){
  const dt=new Date(t);if(dt.getUTCDay()===0)continue;
  const date=dt.toISOString().slice(0,10),heads=await descargarCabezas(date,true);
  if(!hasDrawResults(heads)||!hasNocturnoBase(heads)){skipped.push(date);continue}
  complete.push({date,heads});
 }
 if(complete.length<3)throw Error('Insuficientes jornadas');
 const dated=complete.slice(1).map((x,i)=>({date:x.date,sheet:buildSheet(x.heads,complete[i].heads)}));
 const perTurn=Object.fromEntries(TURNOS.map(t=>[t,blank(t)])),rows=[];
 for(let i=0;i<dated.length;i++){
  const d=dated[i],history=dated.slice(Math.max(0,i-10),i);
  for(const turn of TURNOS){
   const actual=[...new Set((d.sheet.heads[turn]||[]).filter(x=>/^\d{4}$/.test(x)))];
   if(!actual.length)continue;
   const before=observeProgressiveBoard7D(history,d.sheet,d.date,turn);
   const support=before.marksToday.filter(x=>x.kind==='vt3');
   const distinct=[...new Set(support.map(x=>x.value))];
   const winners=new Set(actual.map(x=>x.slice(-3)));
   const overlap=distinct.filter(x=>winners.has(x)).length;
   const suffixes=new Set(actual.map(x=>x.slice(-2)));
   const vt2Only=distinct.filter(x=>suffixes.has(x.slice(-2))&&!winners.has(x)).length;
   const summary=perTurn[turn];summary.draws++;summary.columns=before.visibleColumns.length;
   summary.withTodayVT3+=Number(support.length>0);
   summary.withCrossTurnVT3+=Number(before.crossTurnSameDay.some(x=>x.kind==='vt3'));
   summary.withCrossColumnVT3+=Number(before.crossColumnSameDay.some(x=>x.kind==='vt3'));
   summary.withLastDayVT3+=Number(before.linksToLastDraw.some(x=>x.kind==='vt3'));
   summary.withWeekVT3+=Number(before.linksToPreviousWeek.some(x=>x.kind==='vt3'));
   summary.withD7+=Number(!!before.previousWeek);
   summary.uniqueVT3Seen+=distinct.length;
   summary.nestedVT2Overlaps+=vt2Only;
   summary.vt3ValueOverlapWithNextResult+=overlap;
   summary.vt3Results+=winners.size;
   summary.withAtLeastOneValueOverlap+=Number(overlap>0);
   rows.push({date:d.date,turn,columns:before.visibleColumns.map(x=>x.id),
    priorMarksVT3:support.length,distinctVT3:distinct.length,
    crossTurnVT3:before.crossTurnSameDay.filter(x=>x.kind==='vt3').length,
    crossColumnVT3:before.crossColumnSameDay.filter(x=>x.kind==='vt3').length,
    linkWithPreviousDayVT3:before.linksToLastDraw.filter(x=>x.kind==='vt3').length,
    weekAvailable:!!before.previousWeek,hasVT3Overlap:overlap>0,
    priorVT3SeenAgain:overlap,vt2Only,actualVT3:winners.size});
  }
 }
 const report={protocol:'PROGRESSIVE_VISUAL_OBSERVATION_V1',period:{from,to},
  completeDays:complete.length,skipped,perTurn,rows,
  limits:[
   'Las marcas VT3 del mismo día pertenecen únicamente a turnos ya sorteados y a rutas físicamente válidas.',
   'Coincidencia de valor VT3 anterior con el turno siguiente es cobertura descriptiva, NO candidatos elegidos ni aciertos predictivos.',
   'Las relaciones de formas entre columnas o jornadas no permiten cruzar celdas de dos columnas para formar una ruta.',
   'La disponibilidad de la semana anterior es opcional; se informa sólo como contexto.',
   'Los períodos históricos ya explorados no son validación de una regla nueva.'
  ]};
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log('LECTURA_11_PROGRESIVA: '+from+' a '+to+' | jornadas='+complete.length+
  ' | turnos='+rows.length+' | D−7 no requerido');
 for(const turn of TURNOS){
  const s=perTurn[turn];
  console.log('TURNO '+turn+' | disponibles='+s.columns+
   ' | sorteos='+s.draws+' | con_VT3_hoy='+s.withTodayVT3+
   ' | entre_turnos='+s.withCrossTurnVT3+
   ' | entre_columnas='+s.withCrossColumnVT3+
   ' | enlace_ayer='+s.withLastDayVT3+
   ' | D7_presente='+s.withD7+
   ' | VT3_repetido_en_siguiente='+s.vt3ValueOverlapWithNextResult+
   ' | turnos_con_coincidencia='+s.withAtLeastOneValueOverlap+
   ' | formas_anteriores_distintas='+s.uniqueVT3Seen);
 }
 console.log('Informe descriptivo detallado: '+out);
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
