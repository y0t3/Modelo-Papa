// Ejecutar: node scripts/run-vt3study7d.cjs --from=2026-06-01 --to=2026-09-30
// Estudio VISUAL VT3: Top 3 vs Top 5, sufijo VT2 y extensiones físicas VT4.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const cache=new Map(),base=path.resolve(__dirname,'..');
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
const {auditVT3Chronological7D}=load('src/vt3Study7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from,to=args.to,out=args.out||'out/vt3-study-7d.json';
const day=x=>Date.parse(x+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from||'')||!/^\d{4}-\d{2}-\d{2}$/.test(to||'')||
 !Number.isFinite(day(from))||!Number.isFinite(day(to))||day(to)<day(from)||
 day(to)-day(from)>366*86400000)throw Error('Fechas inválidas o ventana superior a un año');
async function main(){
 const complete=[],skipped=[];
 for(let m=day(from);m<=day(to);m+=86400000){
  const d=new Date(m);if(d.getUTCDay()===0)continue;
  const date=d.toISOString().slice(0,10);
  const heads=await descargarCabezas(date,true);
  if(!hasDrawResults(heads)||!hasNocturnoBase(heads)){skipped.push(date);continue}
  complete.push({date,heads});
 }
 if(complete.length<8)throw Error('Sin historial suficiente para evaluar VT3');
 const dated=complete.slice(1).map((v,i)=>({date:v.date,sheet:buildSheet(v.heads,complete[i].heads)}));
 const top3=auditVT3Chronological7D(dated,3);
 const top5=auditVT3Chronological7D(dated,5);
 if(top3.turns!==top5.turns)throw Error('No se evaluaron los mismos turnos');
 for(let i=0;i<top3.rows.length;i++){
  const a=top3.rows[i],b=top5.rows[i];
  if(a.date!==b.date||a.turn!==b.turn||a.ranked.length>b.ranked.length||
   a.ranked.some((v,j)=>v.value!==b.ranked[j].value||
    v.sourceId!==b.ranked[j].sourceId||
    v.cells.join('>')!==b.ranked[j].cells.join('>')))
    throw Error('Top5 modificó el orden de los candidatos del Top3');
 }
 const months={};
 for(let i=0;i<top3.rows.length;i++){
  const a=top3.rows[i],b=top5.rows[i];
  const month=a.date.slice(0,7);
  const x=months[month]||(months[month]={turns:0,picks3:0,picks5:0,
   vt3hits3:0,vt3hits5:0,vt2only3:0,vt2only5:0,expected3:0,expected5:0,
   extensionCoverage3:0,extensionCoverage5:0});
  x.turns++;x.picks3+=a.ranked.length;x.picks5+=b.ranked.length;
  x.vt3hits3+=a.foundVT3;x.vt3hits5+=b.foundVT3;
  x.vt2only3+=a.vt2Only;x.vt2only5+=b.vt2Only;
  x.expected3+=a.expectedPhysicalHits;x.expected5+=b.expectedPhysicalHits;
  x.extensionCoverage3+=a.extensionCoverage;x.extensionCoverage5+=b.extensionCoverage;
 }
 const report={protocol:'VT3_PRIMARY_BLIND_D7_V1',from,to,days:complete.length,
  skippedDays:skipped,createdAt:new Date().toISOString(),top3,top5,months};
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log('VT3_7D: '+from+' a '+to+' | días='+complete.length+' turnos='+top3.turns);
 for(const x of [top3,top5]){
  console.log('TOP '+x.top+' | candidatos='+x.picks+' | aciertos_VT3='+x.exactVT3+
   ' | azar_fisico_D7='+x.physicalExpectedVT3.toFixed(3)+
   ' | VT2_embebido='+x.vt2Covered+' | VT2_sin_VT3='+x.vt2Only+
   ' | coberturas_VT4_sin_prediccion='+x.extensionCoverage+
   ' | abstenciones='+x.abstentions);
  console.log('GEOMETRIAS_TOP_'+x.top+': '+JSON.stringify(
   Object.entries(x.geometricDescriptions).sort((a,b)=>b[1].picks-a[1].picks).slice(0,10)));
 }
 for(const [k,v] of Object.entries(months)){
  console.log('MES '+k+' | Top3 '+v.vt3hits3+'/'+v.picks3+
   ' (azar '+v.expected3.toFixed(3)+') | Top5 '+v.vt3hits5+'/'+v.picks5+
   ' (azar '+v.expected5.toFixed(3)+') | VT2_no_VT3_3='+v.vt2only3+
   ' | VT2_no_VT3_5='+v.vt2only5);
 }
 console.log('Reporte detallado: '+out);
 console.log('Los sufijos VT2 y las extensiones VT4 no son aciertos independientes adicionales.');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
