// VT3 prioritario: reserva D−14 solo para puestos libres de Top3 D−7.
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
const {auditD14ReserveVT3}=load('src/vt3D14Reserve7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from,to=args.to,out=args.out||'out/vt3-d14-reserve.json';
const asTime=x=>Date.parse(x+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from||'')||!/^\d{4}-\d{2}-\d{2}$/.test(to||'')||
 !Number.isFinite(asTime(from))||!Number.isFinite(asTime(to))||asTime(to)<asTime(from)||
 asTime(to)-asTime(from)>366*86400000)throw Error('Período inválido');
async function main(){
 const data=[],missing=[];
 for(let t=asTime(from);t<=asTime(to);t+=86400000){
  const d=new Date(t);if(d.getUTCDay()===0)continue;
  const date=d.toISOString().slice(0,10),heads=await descargarCabezas(date,true);
  if(!hasDrawResults(heads)||!hasNocturnoBase(heads)){missing.push(date);continue}
  data.push({date,heads});
 }
 if(data.length<16)throw Error('Faltan resultados de inicio para D14');
 const dated=data.slice(1).map((x,i)=>({date:x.date,sheet:buildSheet(x.heads,data[i].heads)}));
 const audit=auditD14ReserveVT3(dated),months={};
 for(const x of audit.rows){
  const m=x.date.slice(0,7),v=months[m]||(months[m]={turns:0,
   originalPicks:0,reservePicks:0,originalHits:0,reserveHits:0,
   randomExpected:0,oracleExtra:0,oracleWithSpace:0});
  v.turns++;v.originalPicks+=x.selection.original.length;
  v.reservePicks+=x.selection.added.length;
  v.originalHits+=x.originalHits;v.reserveHits+=x.addedHits;
  v.randomExpected+=x.randomExpectedAdditions;
  v.oracleExtra+=x.oracleExtraHits;v.oracleWithSpace+=x.physicalRescueWithSpace;
 }
 const report={period:{from,to},source:'Viví tu Suerte',drawDays:data.length,
  missedDates:missing,runAt:new Date().toISOString(),audit,months};
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log('RESERVA_VT3: '+from+' a '+to+' | turnos='+audit.turns+
  ' | con_D14='+audit.eligibleTurns+' | top3_inicial='+audit.originalPicks+
  ' | reservas='+audit.reservePicks+' | total='+audit.combinedPicks);
 console.log('RESERVA_RESULTADO: original='+audit.originalHits+
  ' | extendido='+audit.combinedHits+
  ' | aciertos_adicionales='+ (audit.combinedHits-audit.originalHits)+
  ' | azar_mismo_presupuesto='+audit.randomExpectedAdditions.toFixed(3)+
  ' | oraculo_D14_exclusivo='+audit.oracleExtraHits+
  ' | rescates_con_cupo='+audit.physicalRescueWithSpace);
 for(const [month,v] of Object.entries(months))console.log('MES '+month+
  ' | orig='+v.originalHits+'/'+v.originalPicks+
  ' | reserva='+v.reserveHits+'/'+v.reservePicks+
  ' | azar_reserva='+v.randomExpected.toFixed(3)+
  ' | techo_con_cupo='+v.oracleWithSpace);
 console.log('Por turno: '+out);
 console.log('Las reservas aumentan el numero de candidatas donde el Top3 estaba incompleto. NO es una mejora de ranking validada.');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
