// Sella una prediccion ANTES del sorteo y guarda el commit del codigo.
// Rechaza cualquier turno si YA hay una cabeza real registrada en la fuente.
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const cache=new Map(),base=path.resolve(__dirname,'..');
function load(file){
 const resolved=path.resolve(base,file.endsWith('.ts')?file:file+'.ts');
 if(cache.has(resolved))return cache.get(resolved).exports;
 const source=fs.readFileSync(resolved,'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};cache.set(resolved,mod);
 const localRequire=n=>n.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(resolved),n))):require(n);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:resolved})(localRequire,mod,mod.exports);
 return mod.exports;
}
const {descargarCabezas}=load('src/cabezas.ts');
const {loadPreviousDraws}=load('src/drawHistory.ts');
const {buildSheet}=load('src/sheet.ts');
const {freezeBeforeTurn7D}=load('src/causalReplay7d.ts');
const {readCombined7D}=load('src/combinedReader7d.ts');
const {selectShadowForTurn7D}=load('src/dualFocusShadow7d.ts');
const {previewVT4Extra7D}=load('src/vt4Extra7d.ts');
const {TURNOS,JURS}=load('src/domain.ts');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const date=args.date,turn=args.turn,output=args.out||'out/prospective-frozen-7d.json';
if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!TURNOS.includes(turn)){
 throw Error('Uso: --date=YYYY-MM-DD --turn=Previa|Primera|Matutino|Vespertino|Nocturno');
}
const minus7=d=>{const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()-7);return x.toISOString().slice(0,10)};
async function main(){
 // Cada lectura de la fuente ocurre antes de crear este archivo.
 const currentHeads=await descargarCabezas(date,true);
 const existing=JURS.filter(j=>/^\d{4}$/.test(currentHeads[turn]?.[j]||''));
 if(existing.length)throw Error('ABORTAR: el sorteo objetivo ya figura publicado. NO es una prediccion prospectiva');
 const prev=await loadPreviousDraws(date,9,d=>descargarCabezas(d,true),38);
 const dated=prev.slice(1).map((entry,i)=>({date:entry.date,sheet:buildSheet(entry.heads,prev[i].heads)}));
 const latest=prev[prev.length-1];
 const full=buildSheet(currentHeads,latest.heads);
 const before=freezeBeforeTurn7D(full,turn);
 const d7=minus7(date);
 if(!dated.some(x=>x.date===d7))throw Error('ABSTENERSE: falta la hoja D-7 exacta en el historial');
 const base=readCombined7D(dated,before,date,turn);
 const raw=base.candidates.map(c=>({kind:c.kind,value:c.value,sourceId:c.sourceId,
  cells:c.path.map(p=>p.row+':'+p.col),signals:c.signals.map(x=>x.name),hit:false}));
 const activity=selectShadowForTurn7D(dated,before,date,turn,raw,'REPOSO_Y_ACTIVIDAD');
 const strict=selectShadowForTurn7D(dated,before,date,turn,raw,'REPOSO_Y_RECONFIRMACION');
 // Anexo puramente experimental; jamás altera el lector ni su cantidad de candidatos.
 const vt3=base.candidates.filter(c=>c.kind==='vt3');
 const prefixRules=['ULTIMO_VT2','ULTIMA_CABEZA','MODA_6D'];
 const extras=Object.fromEntries(prefixRules.map(rule=>[rule,vt3.map(c=>{
  const x=previewVT4Extra7D(dated,before,date,turn,c,rule);
  return {vt3:x.vt3,vt2:x.vt2,prefix:x.prefix||null,
   candidateVT4:x.candidateVT4||null,physicalVT4:x.physicalVT4,
   provenance:x.physicalVT4?'RUTA_FISICA_COMPATIBLE':'EXTRA_SIN_TRAZO_FISICO',
   sourceId:x.sourceId,route:x.route,reason:x.reason};
 })]));

 const record={
  protocol:'FROZEN_PRE_DRAW_7D_V1',date,turn,
  frozenAt:new Date().toISOString(),commit:process.env.GITHUB_SHA||null,
  runId:process.env.GITHUB_RUN_ID||null,
  source:'Viví tu Suerte',previousNocturnoDate:latest.date,
  referenceWeekDate:d7,historyDates:dated.map(x=>x.date),
  targetResultObserved:false,
  original:{decision:base.decision,reason:base.reason,
   candidates:base.candidates.map(c=>({kind:c.kind,value:c.value,
    sourceId:c.sourceId,coordinates:c.path.map(p=>p.row+':'+p.col),
    signals:c.signals.map(s=>s.name),score:c.score}))},
  doubleFocusStrict:{rule:'REPOSO_Y_RECONFIRMACION',
   vt2:strict.choices.map(x=>({value:x.chosen,root:x.original,focus:x.focus,
    sourceId:x.sourceId,rootCells:x.root,shiftedCells:x.shifted,priorObservations:x.priorObservations}))},
  doubleFocusActivity:{rule:'REPOSO_Y_ACTIVIDAD',
   vt2:activity.choices.map(x=>({value:x.chosen,root:x.original,focus:x.focus,
    sourceId:x.sourceId,rootCells:x.root,shiftedCells:x.shifted,priorObservations:x.priorObservations}))},
  vt4ExtraExperimental:{notSelector:true,rules:extras,
   disclaimer:'Prefijos generados de memoria histórica sin ventaja validada; no reemplazan VT3 ni VT4 físico.'},
  note:'Proyeccion congelada antes del resultado, no recomendacion de apuesta ni evidencia de ventaja sobre el azar.'
 };
 // Comprobar OTRA VEZ antes de finalizar el sello: si el resultado aparece entre
 // lecturas, se aborta y no se guarda ningun archivo como prospectivo.
 const check=await descargarCabezas(date,true);
 if(JURS.some(j=>/^\d{4}$/.test(check[turn]?.[j]||'')))
  throw Error('ABORTAR: resultado publicado durante el sellado. Nada prospectivo se publica');
 fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,JSON.stringify(record,null,2)+'\n');
 console.log('FROZEN_7D: fecha='+date+' | turno='+turn+' | candidatos_lector='+base.candidates.length+
  ' | VT2_original='+base.candidates.filter(x=>x.kind==='vt2').map(x=>x.value).join(',')+
  ' | VT2_actividad='+activity.choices.map(x=>x.chosen).join(','));
 console.log('Sello: '+output+' | commit='+record.commit+' | previo='+latest.date);
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
