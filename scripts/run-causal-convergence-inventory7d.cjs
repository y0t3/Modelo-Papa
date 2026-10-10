// Diagnóstico descriptivo de convergencias entre rutas YA MARCADAS.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const dir=path.resolve(root,args.input||'out/examen-visual-ciego-septiembre');
const OUT=path.resolve(root,args.out||'out/convergencias-causales-septiembre');
const T=['Previa','Primera','Matutino','Vespertino','Nocturno'];
function crosswalk(cut){
 const groups=new Map();
 for(const t of cut.inherited){
  assert(['vt2','vt3','vt4'].includes(t.kind));
  assert(cut.columns.some(c=>c.id===t.sourceId),'Columna inexistente');
  const origin=[t.turn,t.jurisdiction,t.fullHead].join('|');
  assert(/^\d{2,4}$/.test(t.todayReading),'Lectura heredada incompleta');
  const direct=t.todayReading,reverse=direct.split('').reverse().join('');
  const orientations=[{orientation:'directo',value:direct}];
  if(reverse!==direct)orientations.push({orientation:'invertido',value:reverse});
  for(const {orientation,value} of orientations){
   const k=t.kind+'|'+value;
   if(!groups.has(k))groups.set(k,{kind:t.kind,value,origins:new Map()});
   const group=groups.get(k);
   if(!group.origins.has(origin))group.origins.set(origin,[]);
   const seen=group.origins.get(origin);
   const routeId=[t.sourceId,t.cells.join('>'),orientation].join('|');
   if(!seen.some(x=>x.routeId===routeId))
    seen.push({routeId,orientation,sourceId:t.sourceId,cells:t.cells,
     markedValue:t.value,originHead:t.fullHead,originTurn:t.turn,jurisdiction:t.jurisdiction});
  }
 }
 const all=[...groups.values()].map(g=>{
  const origins=[...g.origins.entries()].map(([head,readings])=>({head,readings}));
  const setD=new Set(origins.filter(o=>o.readings.some(x=>x.orientation==='directo')).map(o=>o.head));
  const setR=new Set(origins.filter(o=>o.readings.some(x=>x.orientation==='invertido')).map(o=>o.head));
  const mixed=[...setD].some(h=>[...setR].some(k=>k!==h));
  return {kind:g.kind,value:g.value,independentHeads:origins.length,mixedDirectInverse:mixed,origins};
 }).sort((a,b)=>a.kind.localeCompare(b.kind)||a.value.localeCompare(b.value));
 return {all,multiple:all.filter(x=>x.independentHeads>=2),
  mixed:all.filter(x=>x.independentHeads>=2&&x.mixedDirectInverse)};
}
function tests(){
 const cols=[{id:'prevNocturno',values:['58','18','87','07','03','23']}];
 const traces=[
  {kind:'vt3',todayReading:'778',sourceId:'prevNocturno',
   cells:['3:1','2:1','1:1'],value:'983',fullHead:'4983',turn:'Primera',jurisdiction:'Entre Ríos'},
  {kind:'vt3',todayReading:'877',sourceId:'prevNocturno',
   cells:['2:0','2:1','3:1'],value:'289',fullHead:'7289',turn:'Matutino',jurisdiction:'Ciudad'}
 ];
 const result=crosswalk({columns:cols,inherited:traces});
 const x=result.mixed.find(x=>x.kind==='vt3'&&x.value==='778');
 assert(x,'Convergencia directa+inversa de 778 no detectada');
 assert.equal(x.independentHeads,2);
 assert(!result.all.some(x=>x.kind==='vt4'));
 const repeated={...traces[0],cells:['3:1','2:1','1:1']};
 const duplicate=crosswalk({columns:cols,inherited:[...traces,repeated]});
 assert.equal(duplicate.mixed.find(x=>x.value==='778').independentHeads,2);
 console.log('TEST_CONVERGENCIAS_OK: directo/inverso, dos cabezas independientes y duplicación descartada');
}
function main(){
 tests();if(args['test-only']==='true')return;
 const files=fs.readdirSync(dir).filter(x=>/^\d{4}-\d{2}-\d{2}-ANTES-(Previa|Primera|Matutino|Vespertino|Nocturno)\.json$/.test(x));
 const cases=files.map(filename=>{
  const cut=JSON.parse(fs.readFileSync(path.join(dir,filename),'utf8'));
  const r=crosswalk(cut);
  return {date:cut.date,target:cut.target,previousDate:cut.priorDate,
   inherited:cut.inherited.length,readings:r.all.length,
   multiHead:r.multiple.length,mixed:r.mixed.length,
   multiple:r.multiple};
 }).sort((a,b)=>a.date.localeCompare(b.date)||T.indexOf(a.target)-T.indexOf(b.target));
 assert.equal(cases.length,30,'Esperados 30 cortes causales');
 const lines=['# Convergencias sobre huellas marcadas, en cortes ANTES del objetivo','',
  '**Sólo diagnóstico visual retrospectivo; NO ranking ni pronóstico.**',
  'Se releen las rutas efectivamente marcadas de la hoja anterior. Para cada',
  'huella se distingue la orientación marcada (directa) y su inversión',
  'físicamente válida dentro de la misma columna. La lectura invertida es',
  'una opción de observación nueva, NO se la presenta como marca original.',
  'Agrupamos las lecturas con idéntica modalidad y cifras que provienen de',
  'al menos dos cabezas históricas distintas, identificadas por turno,',
  'jurisdicción y cabeza completa. Muchas rutas de la misma cabeza no',
  'constituyen dos respaldos independientes. No se usa ningún resultado',
  'del turno objetivo ni se decide una figura preferida por contar orígenes.','',
  '| Fecha | Antes de | Rutas heredadas | Lecturas distintas (incluye inversiones) | Convergencias de ≥2 cabezas | Con al menos una lectura directa y otra inversa |',
  '|---|---|---:|---:|---:|---:|'];
 for(const c of cases){
  lines.push('| '+c.date+' | '+c.target+' | '+c.inherited+
   ' | '+c.readings+' | '+c.multiHead+' | '+c.mixed+' |');
  console.log('CONVERGENCIAS '+c.date+' ANTES '+c.target+
   ' | rutas='+c.inherited+' | lecturas='+c.readings+
   ' | multiples='+c.multiHead+' | mixtas='+c.mixed);
 }
 lines.push('','## Inventario completo de convergencias, sin selección por éxito','');
 for(const c of cases){
  lines.push('### '+c.date+' · ANTES '+c.target,'',
   'Convergencias multi-origen: '+c.multiHead+'; mixtas directo+inverso: '+c.mixed+'.','');
  for(const x of c.multiple){
   lines.push('- '+x.kind.toUpperCase()+' '+x.value+' · '+x.independentHeads+
    ' cabezas históricas'+(x.mixedDirectInverse?' · combinación directa/inversa':''));
   for(const p of x.origins)for(const r of p.readings){
    lines.push('  - '+p.head+' · '+r.orientation+' · '+r.sourceId+
     ' · '+r.cells.join('→')+' · antiguo '+r.markedValue);
   }
  }
  if(!c.multiple.length)lines.push('No se registraron convergencias de dos cabezas.','');
 }
 const first=cases.find(x=>x.date==='2026-09-30'&&x.target==='Primera');
 const mat=cases.find(x=>x.date==='2026-09-30'&&x.target==='Matutino');
 const case778=first?.multiple.find(x=>x.kind==='vt3'&&x.value==='778');
 assert(case778&&case778.mixedDirectInverse,
  'El caso 778 debería observarse antes de Primera sin usar Primera');
 assert(mat?.multiple.some(x=>x.kind==='vt3'&&x.value==='778'),
  'El 778 sigue geométricamente disponible antes de Matutino');
 console.log('MOMENTO_778_ANTES_PRIMERA: disponible como convergencia directa+inversa de '+
  case778.independentHeads+' cabezas históricas; continúa antes de Matutino.');
 lines.push('','## Control concreto de no unicidad temporal: VT3 778 del 30/09','',
  'El valor 778 aparece como convergencia de dos cabezas históricas',
  'distintas YA ANTES DE PRIMERA del 30/09, y sigue disponible ANTES DE',
  'MATUTINO. El dibujo por sí solo no escoge en cuál de esos turnos',
  'ocurrirá una confirmación. El resultado real debe consultarse',
  'por separado, después de fijar una observación retrospectiva.',
  'Proponer automáticamente el 778 sería retroajustar la conclusión al',
  'sorteo conocido; no lo hacemos.','',
  'No se crean caminos nuevos sobre un tablero vacío, no se cruzan',
  'columnas, no se modifican módulos productivos y NO se declara',
  'ningún acierto prospectivo.');
 fs.mkdirSync(OUT,{recursive:true});
 fs.writeFileSync(path.join(OUT,'INVENTARIO_CONVERGENCIAS.md'),lines.join('\n')+'\n');
 fs.writeFileSync(path.join(OUT,'INVENTARIO_CONVERGENCIAS.json'),JSON.stringify(cases,null,2));
 console.log('INVENTARIO_CIEGO_OK '+cases.length+' cortes y convergencia 778 sin selección de turno');
}
main();
