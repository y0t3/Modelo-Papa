// Modelo Papá: TOPOLOGÍA de contactos entre huellas marcadas y marcas
// ya confirmadas, SIN usar cabezas del sorteo objetivo ni seleccionar números.
// El reporte describe el dibujo completo y conserva sus alternativas.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const input=path.resolve(root,args.input||'out/examen-visual-ciego-septiembre');
const out=path.resolve(root,args.out||'out/topologia-contactos-ciegos');
const turns=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const headKey=t=>[t.turn,t.jurisdiction,t.fullHead].join('|');
function unique(arr){return [...new Set(arr)];}
function validate(t){
 assert(['vt2','vt3','vt4'].includes(t.kind));
 assert(t.cells.length===Number(t.kind.slice(2)));
 assert(new Set(t.cells).size===t.cells.length);
 for(let i=0;i<t.cells.length;i++){
  const [r,c]=t.cells[i].split(':').map(Number);
  assert(Number.isInteger(r)&&r>=0&&r<6&&[0,1].includes(c));
  if(i){const [pr,pc]=t.cells[i-1].split(':').map(Number);
   assert(Math.abs(r-pr)<=1&&Math.abs(c-pc)<=1&&(r!==pr||c!==pc));}
 }
}
function topology(old,known){
 // A contact is a meeting between two already established physical paths.
 // Each old-head x new-head x geometry pair is stored for audit, but repeated
 // heads are deduplicated for interpretation.
 if(old.sourceId!==known.sourceId)return null;
 const shared=unique(old.cells.filter(c=>known.cells.includes(c)));
 if(!shared.length)return null;
 const ix=(r,c)=>r.cells.indexOf(c);
 const location=(r,c)=>ix(r,c)===0?'inicio':ix(r,c)===r.cells.length-1?'final':'interior';
 const forward=old.cells.join('>')===known.cells.join('>');
 const backward=old.cells.join('>')===[...known.cells].reverse().join('>');
 return {sourceId:old.sourceId,shared,relation:forward?'misma_ruta_ordenada':
  backward?'ruta_invertida':shared.length>=2?'segmento_compartido':'contacto_puntual',
  atOld:shared.map(c=>({cell:c,role:location(old,c)})),
  atKnown:shared.map(c=>({cell:c,role:location(known,c)}))};
}
const orient=v=>[v,[...v].reverse().join('')].sort()[0];
const geometry=t=>t.sourceId+'|'+t.cells.join('>');
function classify(cut){
 const ti=turns.indexOf(cut.target);assert(ti>=0);
 assert.equal(cut.columns.length,ti+1,'Columnas futuras incluidas');
 const columns=new Set(cut.columns.map(c=>c.id));
 assert(cut.knownToday.every(k=>turns.indexOf(k.turn)<ti),
  'Marca futura/objetivo en ventana histórica');
 for(const t of [...cut.inherited,...cut.knownToday]){validate(t);assert(columns.has(t.sourceId));}
 const families=new Map();
 for(const trace of cut.inherited){
  const value=trace.todayReading;assert(/^\d{2,4}$/.test(value));
  const key=trace.kind+'|'+orient(value);
  if(!families.has(key))families.set(key,{id:key,kind:trace.kind,
   readings:unique([value,[...value].reverse().join('')]).sort(),paths:[]});
  const f=families.get(key),orig=headKey(trace);
  if(!f.paths.some(p=>p.head===orig&&p.sourceId===trace.sourceId&&
   p.cells.join('>')===trace.cells.join('>'))){
   const all=[];
   for(const known of cut.knownToday){
    const touch=topology(trace,known);
    if(touch)all.push({...touch,knownHead:headKey(known),knownKind:known.kind,
     knownMarkedValue:known.value,knownCells:known.cells});
   }
   const contactHeads=unique(all.map(x=>x.knownHead)).sort();
   f.paths.push({head:orig,kind:trace.kind,originValue:trace.value,
    directToday:value,reverseToday:[...value].reverse().join(''),
    sourceId:trace.sourceId,cells:[...trace.cells],
    orientationAlternatives:'directa_e_invertida_sin_prioridad',
    contacts:all,distinctKnownHeads:contactHeads});
  }
 }
 const records=[...families.values()].map(f=>{
  const prevHeads=unique(f.paths.map(p=>p.head));
  const touchingPaths=f.paths.filter(p=>p.contacts.length>0);
  const contactKnownHeads=unique(f.paths.flatMap(p=>p.distinctKnownHeads)).sort();
  const touchedTurns=unique(contactKnownHeads.map(h=>h.split('|')[0])).sort();
  return {...f,independentHistoricalHeads:prevHeads.length,
   independentTouchingHistoricalHeads:unique(touchingPaths.map(p=>p.head)).length,
   touchingPaths:touchingPaths.length,distinctKnownHeads:contactKnownHeads,
   touchedTurns,allContacts:f.paths.reduce((sum,p)=>sum+p.contacts.length,0)};
 }).sort((a,b)=>a.kind.localeCompare(b.kind)||a.readings[0].localeCompare(b.readings[0]));
 return {date:cut.date,target:cut.target,priorDate:cut.priorDate,
  columns:cut.columns,knownTodayCount:cut.knownToday.length,
  allHistoricalRoutes:cut.inherited.length,knownToday:cut.knownToday,
  families:records};
}
function tests(){
 const t=(head,kind,sourceId,cells,turn='Previa')=>({fullHead:head,
  jurisdiction:'Ciudad',turn,kind,sourceId,cells,value:'22',todayReading:'22'});
 const old=t('1234','vt3','Previa',['1:0','2:0','3:1']);
 const one=t('4321','vt2','Previa',['2:0','3:1']);
 const sameHead=t('4321','vt2','Previa',['2:0','2:1']);
 assert.equal(topology(old,one).relation,'segmento_compartido');
 assert.equal(topology(old,{...old,fullHead:'4321'}).relation,'misma_ruta_ordenada');
 assert.equal(topology(old,{...old,cells:[...old.cells].reverse()}).relation,'ruta_invertida');
 assert.equal(topology(old,{...one,sourceId:'Primera'}),null);
 const sample={date:'2026-09-30',target:'Matutino',priorDate:'2026-09-29',
  columns:[{id:'prevNocturno'},{id:'Previa'},{id:'Primera'}],
  inherited:[old],knownToday:[one,sameHead]};
 const r=classify(sample);
 assert.equal(r.families[0].touchingPaths,1);
 assert.equal(r.families[0].distinctKnownHeads.length,1,
  'Varias rutas de una cabeza conocida no equivalen a varias confirmaciones');
 assert.throws(()=>classify({...sample,target:'Primera'}),'No debe aceptar columnas futuras');
 console.log('TEST_TOPOLOGIA_OK: dos-celdas, ruta igual/invertida, columna independiente, cabeza deduplicada, causalidad');
}
function markdownCase(caseRecord){
 const lines=['# Observación de todos los trazos conocidos',
  '',caseRecord.date+' · ANTES DE '+caseRecord.target+' · hoja anterior '+caseRecord.priorDate,
  '','**Retrospectivo, objetivo censurado.** Las familias no son candidatos propuestos;',
  'se muestran todas sin ranking, ni elección basada en resultados futuros.','',
  'Celdas en formato fila:lado (comenzando en cero). Cada recorrido usa una sola columna.','',
  '| Familia física de lectura (sentidos incluidos) | Cabezas anteriores distintas | Caminos históricos | Caminos que contactan marcas de hoy | Cabezas comprobadas de hoy contactadas | Turnos de contacto |',
  '|---|---:|---:|---:|---:|---|'];
 for(const f of caseRecord.families){
  lines.push('| '+f.kind.toUpperCase()+' '+f.readings.join('/')+
   ' | '+f.independentHistoricalHeads+' | '+f.paths.length+
   ' | '+f.touchingPaths+' | '+f.distinctKnownHeads.length+
   ' | '+(f.touchedTurns.join(', ')||'—')+' |');
 }
 lines.push('','## Cada figura, sin ocultar las que no contactan','');
 for(const f of caseRecord.families){
  lines.push('### '+f.kind.toUpperCase()+' '+f.readings.join('/')+
   ' · '+f.independentHistoricalHeads+' cabezas previas','');
  for(const p of f.paths){
   lines.push('- Cabeza anterior '+p.head+' · origen '+p.sourceId+
    ' · celdas '+p.cells.join('→')+' · antes '+p.originValue+
    ' · hoy directa '+p.directToday+' / inversa '+p.reverseToday);
   if(!p.contacts.length)lines.push('  - Sin contacto con marcas comprobadas hoy.');
   else for(const c of p.contacts){
    lines.push('  - Toca cabeza ya comprobada '+c.knownHead+
     ' ('+c.knownKind.toUpperCase()+' '+c.knownMarkedValue+
     '), '+c.relation+' · celdas '+c.shared.join(', ')+
     ' · roles vieja '+c.atOld.map(x=>x.role).join('/')+
     ' / actual '+c.atKnown.map(x=>x.role).join('/'));
   }
  }
  lines.push('');
 }
 return lines.join('\n');
}
function main(){
 tests();if(args['test-only']==='true')return;
 const files=fs.readdirSync(input).filter(x=>
  /^\d{4}-\d{2}-\d{2}-ANTES-(Previa|Primera|Matutino|Vespertino|Nocturno)\.json$/.test(x));
 assert.equal(files.length,30,'Deben estar los 30 cortes progresivos');
 fs.mkdirSync(out,{recursive:true});
 const summaries=[];
 for(const filename of files){
  const cut=JSON.parse(fs.readFileSync(path.join(input,filename),'utf8'));
  const classified=classify(cut);
  const prefix=cut.date+'-ANTES-'+cut.target;
  fs.writeFileSync(path.join(out,prefix+'.json'),JSON.stringify(classified,null,2));
  fs.writeFileSync(path.join(out,prefix+'.md'),markdownCase(classified));
  const contested=classified.families.filter(f=>f.independentHistoricalHeads>=2);
  const withContact=contested.filter(f=>f.touchingPaths>0);
  summaries.push({date:cut.date,target:cut.target,
   inherited:classified.allHistoricalRoutes,allFamilies:classified.families.length,
   convergentFamilies:contested.length,convergentContactFamilies:withContact.length,
   families:contested.map(f=>({kind:f.kind,readings:f.readings,
    previousHeads:f.independentHistoricalHeads,
    touchingPaths:f.touchingPaths,
    touchingPriorHeads:f.independentTouchingHistoricalHeads,
    contactedTodayHeads:f.distinctKnownHeads,
    contactedTurns:f.touchedTurns}))});
  console.log('TOPOLOGIA '+cut.date+' ANTES '+cut.target+
   ' | anteriores='+classified.allHistoricalRoutes+' familias='+classified.families.length+
   ' convergentes='+contested.length+' convergentes_con_contacto='+withContact.length);
 }
 const fok=files.find(x=>x==='2026-09-30-ANTES-Matutino.json');
 assert(fok,'Falta ficha focal 30/09 Matutino');
 const mat=JSON.parse(fs.readFileSync(path.join(out,'2026-09-30-ANTES-Matutino.json'),'utf8'));
 const first=JSON.parse(fs.readFileSync(path.join(out,'2026-09-30-ANTES-Primera.json'),'utf8'));
 const f=(v,kind,number)=>v.families.find(x=>x.kind===kind&&x.readings.includes(number));
 for(const [kind,n] of [['vt3','778'],['vt2','37'],['vt2','10'],['vt2','15']]){
  const x=f(mat,kind,n),prev=f(first,kind,n);
  assert(x,'Falta familia '+n);
  console.log('FICHA_30_MAT '+kind+' '+n+' '+JSON.stringify({
   antesPrimera:prev?{touches:prev.touchingPaths,touchedHeads:prev.distinctKnownHeads}:null,
   antesMatutina:{readings:x.readings,previousHeads:x.independentHistoricalHeads,
    routes:x.paths.length,touchingPaths:x.touchingPaths,
    touchedHeads:x.distinctKnownHeads,turnos:x.touchedTurns,
    contacts:x.paths.flatMap(p=>p.contacts.map(c=>({oldHead:p.head,oldCells:p.cells,
     source:p.sourceId,knownHead:c.knownHead,knownKind:c.knownKind,
     knownCells:c.knownCells,relation:c.relation,shared:c.shared,rolesOld:c.atOld,
     rolesKnown:c.atKnown})))} }));
 }
 for(const s of summaries.filter(x=>x.target==='Matutino')){
  console.log('CONTROL_MATUTINO '+s.date+' '+JSON.stringify(s.families));
 }
 const doc=['# Atlas causal de contacto físico: 30 cortes','',
  'Hoja MARCADA anterior → huellas relevadas de hoy → contactos con marcas',
  'que ya existían antes de cada turno. No se leyó ningún resultado objetivo.',
  'Conserva TODOS los caminos, todas las modalidades y ambas orientaciones.',
  'No hay elección automática ni ranking. Los contactos no son apuestas.','',
  '| Fecha | Antes de | Huellas anteriores | Familias de lectura | Familias con ≥2 cabezas | De ellas con contactos |',
  '|---|---|---:|---:|---:|---:|'];
 for(const s of summaries)doc.push('| '+s.date+' | '+s.target+' | '+s.inherited+
  ' | '+s.allFamilies+' | '+s.convergentFamilies+' | '+s.convergentContactFamilies+' |');
 doc.push('','## Casos focales sin privilegio retrospectivo','',
  'Se documentan todas las familias de Matutina en cada jornada y no sólo la figura 778.',
  'El archivo individual muestra la cabeza completa, la secuencia de celdas',
  'de cada huella y exactamente qué marca previa de hoy entra en contacto,',
  'incluyendo posiciones de comienzo, centro y final. Los contactos con',
  'varios recorridos de la misma cabeza se deduplican por identidad de cabeza.','',
  'Los resultados objetivos quedan separados. El contacto no identifica',
  'por sí mismo la modalidad, la orientación o el turno que saldrá.','');
 fs.writeFileSync(path.join(out,'RESUMEN_TOPOLOGIA.md'),doc.join('\n'));
 fs.writeFileSync(path.join(out,'RESUMEN_TOPOLOGIA.json'),JSON.stringify(summaries,null,2));
 console.log('TOPOLOGIA_COMPLETA_OK '+summaries.length+' cortes analizados sin resultados de destino');
}
main();
