// Modelo Papá: prueba cronológica del ADAPTATIVO EXISTENTE conectado
// a toda la tabla +11 creciente, sin llave obligatoria D−7.
// No se cambian pesos ni se integra en la app.
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
const {auditLiveVT3Pilot7D}=load('src/liveVT3Pilot7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from,to=args.to,out=args.out||'out/live-vt3-pilot7d.json';
const ms=x=>Date.parse(x+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from||'')||!/^\d{4}-\d{2}-\d{2}$/.test(to||'')||
 !Number.isFinite(ms(from))||!Number.isFinite(ms(to))||ms(to)<ms(from)||
 ms(to)-ms(from)>366*86400000)throw Error('Fechas inválidas o período mayor a un año');
async function main(){
 const full=[],skipped=[];
 for(let t=ms(from);t<=ms(to);t+=86400000){
  const d=new Date(t);if(d.getUTCDay()===0)continue;
  const date=d.toISOString().slice(0,10),heads=await descargarCabezas(date,true);
  if(!hasDrawResults(heads)||!hasNocturnoBase(heads)){skipped.push(date);continue}
  full.push({date,heads});
 }
 if(full.length<8)throw Error('Insuficiente historial de sorteos');
 const dated=full.slice(1).map((day,i)=>({date:day.date,sheet:buildSheet(day.heads,full[i].heads)}));
 const audit=auditLiveVT3Pilot7D(dated);
 const months={};
 for(const row of audit.rows){
  const key=row.date.slice(0,7),x=months[key]||(months[key]={
   turns:0,picks:0,hits:0,oldPicks:0,oldHits:0,fromToday:0,
   physicalExpected:0,withSignal:0
  });
  x.turns++;x.picks+=row.live.candidates.length;x.hits+=row.liveHits;
  x.oldPicks+=row.legacyVT3.length;x.oldHits+=row.legacyHits;
  x.withSignal+=Number(row.live.candidates.length>0);
  x.fromToday+=row.live.candidates.filter(c=>c.supportedByToday).length;
  x.physicalExpected+=row.randomExpected;
 }
 const report={protocol:audit.protocol,from,to,completeDays:full.length,
  skipped,recordedAt:new Date().toISOString(),audit,months};
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log('VT3_PILOTO_VIVO: '+from+' a '+to+' | turnos='+audit.turns+
  ' | con_candidatos='+audit.withPilot+
  ' | VT3_propuestos='+audit.pilotPicks+
  ' | VT3_aciertos='+audit.pilotHits+
  ' | azar_fisico='+audit.randomPhysicalExpected.toFixed(3)+
  ' | marcas_hoy_en_top='+audit.pilotFromToday);
 console.log('LECTOR_D7_RESTRINGIDO: propuestas='+audit.legacyPicks+
  ' | aciertos='+audit.legacyHits+
  ' | ADVERTENCIA: presupuestos distintos, no comparar aciertos como mérito causal');
 for(const [turn,x] of Object.entries(audit.byTurn))console.log(
  'TURNO '+turn+' | objetivos='+x.turns+' | piloto='+x.hits+'/'+x.picks+
  ' | legado_D7_aciertos='+x.legacyHits+
  ' | azar='+x.expected.toFixed(3)+
  ' | VT3_hoy_como_apoyo='+x.fromToday);
 for(const [month,x]of Object.entries(months))console.log(
  'MES '+month+' | piloto='+x.hits+'/'+x.picks+
  ' | D7='+x.oldHits+'/'+x.oldPicks+
  ' | azar='+x.physicalExpected.toFixed(3)+
  ' | apoyo_hoy='+x.fromToday);
 console.log('JSON completo: '+out);
 console.log('Prueba retrospectiva exploratoria. Ninguna mejora es evidencia predictiva prospectiva.');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
