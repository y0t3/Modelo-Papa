// Ensayo comparativo de VT3 D14/D7, geometrías verdaderamente reconfirmadas.
// Uso: node scripts/run-vt3-repeat-d14d7.cjs --from=2025-01-01 --to=2025-12-31
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const cache=new Map(),base=path.resolve(__dirname,'..');
function load(file){
 const resolved=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(resolved))return cache.get(resolved).exports;
 const js=ts.transpileModule(fs.readFileSync(resolved,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(resolved,mod);
 const req=x=>x.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(resolved),x))):require(x);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:resolved})(req,mod,mod.exports);
 return mod.exports;
}
const {descargarCabezas}=load('src/cabezas.ts');
const {buildSheet}=load('src/sheet.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {auditRepeatedGeometryVT3}=load('src/vt3RepeatedD14d7.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from,to=args.to,out=args.out||'out/vt3-repeat-d14-d7.json';
const time=x=>Date.parse(x+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from||'')||!/^\d{4}-\d{2}-\d{2}$/.test(to||'')||
 !Number.isFinite(time(from))||!Number.isFinite(time(to))||time(to)<time(from)||
 time(to)-time(from)>366*86400000)throw Error('Periodo inválido');
async function main(){
 const days=[],missed=[];
 for(let ms=time(from);ms<=time(to);ms+=86400000){
  const d=new Date(ms);if(d.getUTCDay()===0)continue;
  const date=d.toISOString().slice(0,10),heads=await descargarCabezas(date,true);
  if(!hasDrawResults(heads)||!hasNocturnoBase(heads)){missed.push(date);continue}
  days.push({date,heads});
 }
 if(days.length<16)throw Error('Insuficiente historia para D14');
 const input=days.slice(1).map((x,i)=>({date:x.date,sheet:buildSheet(x.heads,days[i].heads)}));
 const audit=auditRepeatedGeometryVT3(input);
 const months={};
 for(const x of audit.rows){
  const month=x.date.slice(0,7);
  const m=months[month]||(months[month]={turns:0,picks:0,repeatedEligible:0,
   changes:0,baselineHits:0,repeatedHits:0,expectedPhysical:0});
  m.turns++;m.picks+=x.baseline.length;m.repeatedEligible+=x.selection.repeatEligible;
  m.changes+=x.selection.changes;m.baselineHits+=x.hitsBaseline;
  m.repeatedHits+=x.hitsRepeated;m.expectedPhysical+=x.expectedPhysical;
 }
 const report={source:'Viví tu Suerte / cabezas',from,to,drawDays:days.length,
  missedDates:missed,recordedAt:new Date().toISOString(),audit,months};
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log('VT3_D14_D7: '+from+' a '+to+' | turnos_ambas_semanas='+audit.turns+
  ' | candidatas='+audit.selectedPicks+' | elegibles_con_ruta_repetida='+audit.repeatEligible);
 console.log('VT3_REPETICION: base='+audit.baselineHits+' | prioridad_geometria='+audit.repeatedHits+
  ' | cambiados='+audit.changes+' | mejora_turnos='+audit.turnsWon+
  ' | empeora_turnos='+audit.turnsLost+' | empata='+audit.turnsTied+
  ' | azar_fisico='+audit.expectedPhysical.toFixed(3)+
  ' | sufijo_VT2_base='+audit.vt2Baseline+' | sufijo_VT2_repetido='+audit.vt2Repeated);
 for(const [month,m] of Object.entries(months))console.log('MES '+month+
  ' | base='+m.baselineHits+' | repeticion='+m.repeatedHits+
  ' | candidatas='+m.picks+' | repeticiones_disponibles='+m.repeatedEligible+
  ' | cambios='+m.changes+' | azar='+m.expectedPhysical.toFixed(3));
 console.log('Detalle del trazo D14/D7, turno, origen y resultado D: '+out);
 console.log('Prioridad de figuras repetidas es experimental; no valida aciertos futuros.');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
