// VT3 primario — mismo cupo Top3, apoyo VT2 de otras fechas/sorteos.
// No modifica motor original, selector semanal, APK ni reglas geométricas.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const resolved=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(resolved))return cache.get(resolved).exports;
 const source=fs.readFileSync(resolved,'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(resolved,mod);
 const req=n=>n.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(resolved),n))):require(n);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:resolved})(req,mod,mod.exports);
 return mod.exports;
}
const {descargarCabezas}=load('src/cabezas.ts');
const {buildSheet}=load('src/sheet.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {auditIndependentVT2ForVT37D}=load('src/vt3IndependentSupport7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from,to=args.to,out=args.out||'out/vt3-independent-vt2.json';
const asTime=x=>Date.parse(x+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from||'')||!/^\d{4}-\d{2}-\d{2}$/.test(to||'')||
 !Number.isFinite(asTime(from))||!Number.isFinite(asTime(to))||
 asTime(to)<asTime(from)||asTime(to)-asTime(from)>366*86400000)throw Error('Fechas inválidas');
async function main(){
 const complete=[],skipped=[];
 for(let ms=asTime(from);ms<=asTime(to);ms+=86400000){
  const d=new Date(ms);if(d.getUTCDay()===0)continue;
  const date=d.toISOString().slice(0,10),h=await descargarCabezas(date,true);
  if(!hasDrawResults(h)||!hasNocturnoBase(h)){skipped.push(date);continue;}
  complete.push({date,heads:h});
 }
 if(complete.length<8)throw Error('No hay jornadas suficientes para ensayo causal');
 const dated=complete.slice(1).map((x,i)=>({date:x.date,sheet:buildSheet(x.heads,complete[i].heads)}));
 const audit=auditIndependentVT2ForVT37D(dated);
 const monthly={};
 for(const row of audit.rows){
  const month=row.date.slice(0,7);
  const v=monthly[month]||(monthly[month]={turns:0,candidates:0,
   original:0,support:0,vt2Original:0,vt2Support:0,changes:0,expectedPhysical:0,
   exactAvailable:0,contactAvailable:0});
  v.turns++;v.candidates+=row.baseline.length;v.original+=row.hitsBaseline;
  v.support+=row.hitsSupported;v.vt2Original+=row.vt2Baseline;
  v.vt2Support+=row.vt2Supported;v.changes+=row.selected.changed;
  v.expectedPhysical+=row.physicalExpected;
  v.exactAvailable+=row.selected.poolWithExact;
  v.contactAvailable+=row.selected.poolWithContact;
 }
 const record={protocol:audit.protocol,from,to,completeDays:complete.length,
  skipped,recordedAt:new Date().toISOString(),audit,monthly};
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(record,null,2)+'\n');
 console.log('VT3_VT2_INDEPENDIENTE: '+from+' a '+to+' | turnos='+audit.turns+
  ' | candidatas='+audit.selectedPicks+' | cambio_VT3='+audit.changedPicks);
 console.log('VT3_RESULT: original='+audit.baselineHits+' | apoyoVT2='+audit.supportedHits+
  ' | azar_fisico_mismo_presupuesto='+audit.expectedPhysical.toFixed(3)+
  ' | turnos_mejora='+audit.turnsImproved+' | empeora='+audit.turnsWorsened+
  ' | igual='+audit.turnsEqual+
  ' | VT2_original='+audit.baselineVT2+' | VT2_apoyo='+audit.supportedVT2);
 console.log('EVIDENCIA: posiciones_con_apoyo_exacto='+audit.independentPoolExact+
  ' | posiciones_con_contacto='+audit.independentPoolContact);
 for(const [month,v] of Object.entries(monthly))console.log('MES '+month+
  ' | original='+v.original+'/'+v.candidates+
  ' | apoyo='+v.support+'/'+v.candidates+
  ' | cambios='+v.changes+
  ' | azar_fisico='+v.expectedPhysical.toFixed(3)+
  ' | vt2='+v.vt2Original+'/'+v.vt2Support);
 console.log('Reporte con fechas y rutas de cada evidencia: '+out);
 console.log('Esta es una comparación retrospectiva; no una validación prospectiva.');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
