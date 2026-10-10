// Uso: node scripts/run-vt4extra7d.cjs --from=2025-01-01 --to=2025-12-31
// Nunca promueve estos VT4 al selector. Compara tres reglas de memoria
// con elegir al azar un dígito 0..9, condicionado a VT3 previamente acertado.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const cache=new Map(),base=path.resolve(__dirname,'..');
function load(file){
 const resolved=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(resolved))return cache.get(resolved).exports;
 const js=ts.transpileModule(fs.readFileSync(resolved,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(resolved,mod);
 const req=n=>n.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(resolved),n))):require(n);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:resolved})(req,mod,mod.exports);
 return mod.exports;
}
const {descargarCabezas}=load('src/cabezas.ts');
const {buildSheet}=load('src/sheet.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {auditVT4Extra7D}=load('src/vt4Extra7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from,to=args.to,out=args.out||'out/vt4-extra.json';
const toTime=x=>Date.parse(x+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from||'')||!/^\d{4}-\d{2}-\d{2}$/.test(to||'')||
 !Number.isFinite(toTime(from))||!Number.isFinite(toTime(to))||toTime(to)<toTime(from)||
 toTime(to)-toTime(from)>366*86400000)throw Error('Periodo invalido');
async function main(){
 const full=[],missing=[];
 for(let ms=toTime(from);ms<=toTime(to);ms+=86400000){
  const d=new Date(ms);if(d.getUTCDay()===0)continue;
  const date=d.toISOString().slice(0,10),heads=await descargarCabezas(date,true);
  if(!hasDrawResults(heads)||!hasNocturnoBase(heads)){missing.push(date);continue}
  full.push({date,heads});
 }
 if(full.length<8)throw Error('Faltan seis jornadas anteriores y referencia Nocturna');
 const dated=full.slice(1).map((x,i)=>({date:x.date,sheet:buildSheet(x.heads,full[i].heads)}));
 const audit=auditVT4Extra7D(dated,3);
 const monthly={};
 for(const row of audit.rows){
  const m=row.date.slice(0,7),v=monthly[m]||(monthly[m]={turns:0,byRule:{}});
  v.turns++;
  for(const [rule,picks] of Object.entries(row.byRule)){
   const x=v.byRule[rule]||(v.byRule[rule]={proposed:0,matchedVT3:0,exactVT4:0,
    nonPhysicalVT4:0,nonPhysicalHits:0,randomExpected:0});
   for(const p of picks){
    if(!p.candidateVT4)continue;
    x.proposed++;x.matchedVT3+=Number(p.vt3Matched);
    x.exactVT4+=Number(p.vt4Matched);
    x.nonPhysicalVT4+=Number(!p.physicalVT4);
    x.nonPhysicalHits+=Number(!p.physicalVT4&&p.vt4Matched);
    x.randomExpected+=p.expectedRandomVT4;
   }
  }
 }
 const result={period:{from,to},source:'Viví tu Suerte',completeDays:full.length,
  skippedDays:missing,createdAt:new Date().toISOString(),audit,monthly};
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
 console.log('VT4_EXTRA: '+from+' a '+to+' | jornadas='+full.length+' | turnos='+audit.rows.length);
 for(const x of audit.byRule){
  console.log('REGLA '+x.rule+' | extra='+x.proposedVT4+' | VT3_confirmados='+x.vt3MatchedWithProposal+
   ' | VT4_exactos='+x.vt4Exact+' | azar_condicional='+x.uniformExpected.toFixed(3)+
   ' | no_fisicos='+x.nonPhysicalProposals+' | aciertos_no_fisicos='+x.nonPhysicalHits+
   ' | fisicos='+x.physicalProposals+' | abstenciones='+x.abstained);
 }
 for(const [month,group] of Object.entries(monthly)){
  console.log('MES '+month+': '+Object.entries(group.byRule).map(([rule,x])=>
   rule+'='+x.exactVT4+'/'+x.proposed+'(azar '+x.randomExpected.toFixed(2)+')').join(' | '));
 }
 console.log('Reporte: '+out);
 console.log('No atribuir capacidad predictiva por una muestra de VT3 confirmados pequena.');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
