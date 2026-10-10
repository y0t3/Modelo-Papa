// Estudio cronológico de UNA regla cualitativa VT3 ya congelada:
// puente entre figura ganadora de ayer, marca de hoy y giro físico sobre
// columna +11 disponible. Exacto mismo Top3 y universo adaptativo.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const p=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const code=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(p,mod);
 const req=n=>n.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(p),n))):require(n);
 vm.runInThisContext('(function(require,module,exports){'+code+'\n})',{filename:p})(req,mod,mod.exports);
 return mod.exports;
}
const {descargarCabezas}=load('src/cabezas.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {buildSheet}=load('src/sheet.ts');
const {auditQualitativeVT3Transition7D}=load('src/vt3QualitativeTransition7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from,to=args.to,out=args.out||'out/vt3-qualitative-transition.json';
const ms=x=>Date.parse(x+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from||'')||!/^\d{4}-\d{2}-\d{2}$/.test(to||'')||
 !Number.isFinite(ms(from))||!Number.isFinite(ms(to))||ms(to)<ms(from)||
 ms(to)-ms(from)>366*86400000)throw Error('Período inválido');
async function main(){
 const all=[],skipped=[];
 for(let t=ms(from);t<=ms(to);t+=86400000){
  const d=new Date(t);if(d.getUTCDay()===0)continue;
  const date=d.toISOString().slice(0,10),heads=await descargarCabezas(date,true);
  if(!hasDrawResults(heads)||!hasNocturnoBase(heads)){skipped.push(date);continue}
  all.push({date,heads});
 }
 if(all.length<8)throw Error('Insuficiente historia para una memoria cronológica');
 const dated=all.slice(1).map((x,i)=>({date:x.date,sheet:buildSheet(x.heads,all[i].heads)}));
 const audit=auditQualitativeVT3Transition7D(dated);
 const months={};
 for(const row of audit.rows){
  const key=row.date.slice(0,7),v=months[key]||(months[key]={
   turns:0,picks:0,changes:0,base:0,visual:0,
   bridges:0,intraday:0,expected:0,wins:0,losses:0
  });
  v.turns++;v.picks+=row.budget;v.changes+=row.changed;
  v.base+=row.originalHits;v.visual+=row.visualHits;
  v.bridges+=row.bridgeSelected;v.intraday+=row.intradaySelected;
  v.expected+=row.expectedSamePool;
  v.wins+=Number(row.visualHits>row.originalHits);
  v.losses+=Number(row.visualHits<row.originalHits);
 }
 const report={dateCreated:new Date().toISOString(),period:{from,to},
  completedDays:all.length,skipped,audit,months};
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log('VT3_GIRO_CUALITATIVO: '+from+' a '+to+
  ' | turnos='+audit.turns+' | cupo='+audit.picks+
  ' | cambios='+audit.changedPicks+
  ' | turnos_cambiados='+audit.turnsChanged);
 console.log('VT3_GIRO_RESULTADO: original='+audit.baselineHits+
  ' | giro='+audit.visualHits+
  ' | azar_pool='+audit.randomExpectedSamePool.toFixed(3)+
  ' | mejora_turnos='+audit.turnsImproved+
  ' | empeora_turnos='+audit.turnsWorsened+
  ' | igual='+audit.turnsEqual+
  ' | puentes_ayer_hoy='+audit.totalBridges+
  ' | giros_hoy='+audit.totalIntraday);
 for(const [turn,x] of Object.entries(audit.byTurn))
  console.log('TURNO '+turn+' | cambios='+x.changed+
   ' | orig='+x.baselineHits+'/'+x.picks+
   ' | giro='+x.visualHits+'/'+x.picks+
   ' | azar='+x.expectedSamePool.toFixed(3));
 for(const [month,v]of Object.entries(months))
  console.log('MES '+month+' | orig='+v.base+'/'+v.picks+
   ' | giro='+v.visual+'/'+v.picks+' | cambios='+v.changes+
   ' | puentes='+v.bridges+' | azar='+v.expected.toFixed(3));
 console.log('Detalle reproducible de cada turno: '+out);
 console.log('Experimento retrospectivo con períodos explorados, NO validación prospectiva.');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
