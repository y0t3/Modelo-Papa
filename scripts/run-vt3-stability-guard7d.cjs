// Comparación cronológica controlada del mecanismo de EXPIRACIÓN VT3.
// El experimento retiene el Top3 anterior SÓLO cuando el turno terminado
// no confirmó ninguna marca VT3 y no creó nuevos valores elegibles.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
function load(file){
 const p=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};cache.set(p,m);vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:p})(
  x=>x.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(p),x))):require(x),m,m.exports);
 return m.exports;
}
const {descargarCabezas}=load('src/cabezas.ts');
const {hasDrawResults,hasNocturnoBase}=load('src/drawHistory.ts');
const {buildSheet}=load('src/sheet.ts');
const {auditStabilityGuardVT37D}=load('src/vt3StabilityGuard7d.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const from=args.from,to=args.to,out=args.out||'out/vt3-stability.json';
const ms=x=>Date.parse(x+'T12:00:00Z');
if(!/^\d{4}-\d{2}-\d{2}$/.test(from||'')||!/^\d{4}-\d{2}-\d{2}$/.test(to||'')||
 !Number.isFinite(ms(from))||!Number.isFinite(ms(to))||ms(to)<ms(from)||
 ms(to)-ms(from)>366*86400000)throw Error('Intervalo inválido');
async function main(){
 const draws=[],missing=[];
 for(let t=ms(from)-24*86400000;t<=ms(to);t+=86400000){
  const d=new Date(t);if(d.getUTCDay()===0)continue;
  const date=d.toISOString().slice(0,10),heads=await descargarCabezas(date,true);
  if(hasDrawResults(heads)&&hasNocturnoBase(heads))draws.push({date,heads});
  else missing.push(date);
 }
 if(draws.length<13)throw Error('Insuficientes sorteos para memoria causal');
 const all=draws.slice(1).map((x,i)=>({date:x.date,sheet:buildSheet(x.heads,draws[i].heads)}));
 const audit=auditStabilityGuardVT37D(all);
 const scoped=audit.rows.filter(x=>x.date>=from&&x.date<=to);
 const months={};let changed=0,base=0,guard=0,random=0,eligible=0,improved=0,worse=0;
 for(const row of scoped){
  const key=row.date.slice(0,7),v=months[key]||(months[key]={
   turns:0,changed:0,oldHits:0,guardHits:0,expected:0,improved:0,worsened:0
  });
  v.turns++;if(!row.changed)continue;
  changed++;base+=row.originalHits;guard+=row.conservativeHits;
  random+=row.randomUnionExpected;
  v.changed++;v.oldHits+=row.originalHits;v.guardHits+=row.conservativeHits;
  v.expected+=row.randomUnionExpected;
  if(row.conservativeHits>row.originalHits){improved++;v.improved++}
  else if(row.conservativeHits<row.originalHits){worse++;v.worsened++}
 }
 const rows=scoped.filter(x=>x.changed);
 const record={protocol:audit.protocol,period:{from,to},
  selectedTurns:scoped.length,changedTurns:changed,
  changedHits:{old:base,hold:guard,randomUnionExpected:random},
  improved,worse,months,changedCases:rows,
  notes:audit.notes,skippedDays:missing};
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(record,null,2)+'\n');
 console.log('RETENCION_VT3: '+from+' a '+to+
  ' | turnos='+scoped.length+' | sustituciones_sin_nuevas_marcas_ni_elegibles='+changed);
 console.log('RETENCION_RESULTADO: anterior='+base+' | conservador='+guard+
  ' | azar_union_mismo_cupo='+random.toFixed(3)+
  ' | mejora_turnos='+improved+' | empeora_turnos='+worse);
 for(const [k,v]of Object.entries(months))console.log('MES '+k+
  ' | casos='+v.changed+' | original='+v.oldHits+
  ' | retener='+v.guardHits+' | referencia='+v.expected.toFixed(3));
 console.log('Casos completos y controles con mismas candidatas: '+out);
 console.log('Ensayo retrospectivo: no prueba ventaja predictiva futura.');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
