// Cinco expedientes pre-turno reconstruidos desde hojas reales +11.
// Después de guardar las cinco vistas, separar el resultado real.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const full=path.resolve(root,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(full))return cache.get(full).exports;
 const js=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};cache.set(full,m);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:full})(
  x=>x.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(full),x))):require(x),m,m.exports);
 return m.exports;
}
const {TURNOS,JURS}=load('src/domain.ts');
const {descargarCabezas}=load('src/cabezas.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {buildSheet}=load('src/sheet.ts');
const {buildVisualDossierBefore7D,renderVisualDossierMarkdown7D}=load('src/vt3VisualDossier7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(s=>s.startsWith('--')).map(s=>s.slice(2).split(/=(.*)/s).slice(0,2)));
const date=args.date||'2026-09-30',out=args.out||'out/expediente-vt3-'+date;
if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Fecha inválida');
async function main(){
 const days=[],missing=[];
 const ms=Date.parse(date+'T12:00:00Z');
 for(let t=ms-24*86400000;t<=ms;t+=86400000){
  const dt=new Date(t);if(dt.getUTCDay()===0)continue;
  const day=dt.toISOString().slice(0,10),heads=await descargarCabezas(day,true);
  if(hasDrawResults(heads)&&hasNocturnoBase(heads))days.push({date:day,heads});
  else missing.push(day);
 }
 if(days.length<12||days[days.length-1].date!==date)throw Error('Historia insuficiente');
 const sheets=days.slice(1).map((d,i)=>({date:d.date,sheet:buildSheet(d.heads,days[i].heads)}));
 const today=sheets[sheets.length-1],history=sheets.slice(0,-1).slice(-10);
 const dir=path.resolve(root,out);fs.mkdirSync(dir,{recursive:true});
 const previews=[];
 for(const [i,turn] of TURNOS.entries()){
  const p=buildVisualDossierBefore7D(history,today.sheet,date,turn,3);
  const name=String(i+1)+'-'+turn;
  fs.writeFileSync(path.join(dir,name+'-ANTES.md'),renderVisualDossierMarkdown7D(p)+'\n');
  fs.writeFileSync(path.join(dir,name+'-ANTES.json'),JSON.stringify(p,null,2)+'\n');
  previews.push({turn,name,p});
  console.log('VISTA '+turn+' | columnas='+p.columns.length+' | top='+p.top3.map(x=>x.value+'@'+x.sourceId).join(',')+
   ' | otras='+p.alternatives.map(x=>x.value).join(',')+' | sin_D7='+!p.hasPreviousWeek);
 }
 const results=previews.map(({turn,p,name})=>{
  const heads=JURS.map(j=>days[days.length-1].heads[turn][j]).filter(x=>/^\d{4}$/.test(x));
  const winning=new Set(heads.map(x=>x.slice(-3)));
  return {name,turn,heads,winningVT3:[...winning],top3:p.top3.map(x=>x.value),
   top3Hits:p.top3.filter(x=>winning.has(x.value)).map(x=>x.value)};
 });
 fs.writeFileSync(path.join(dir,'99-DESPUES.json'),JSON.stringify(results,null,2)+'\n');
 fs.writeFileSync(path.join(dir,'00-LEEME.md'),
  '# Expedientes VT3 '+date+'\n\nCinco vistas previas de la tabla +11, reconstruidas con datos históricos. '+
  'Las cabezas de cada objetivo sólo están en 99-DESPUES.json. '+
  'Se muestra el Top3 del adaptativo original, no una nueva regla de predicción.\n');
 console.log('EXPEDIENTES_COMPLETOS '+date+' | archivos='+out);
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
