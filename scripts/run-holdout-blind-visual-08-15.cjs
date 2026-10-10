// Modelo Papá — contraste exterior congelado, fase SOLO ANTES de Matutina.
// 16..23 septiembre (23 se reporta pero NO es holdout independiente).
// Exclusivamente huellas de cabezas previas conocidas y marcas de Primera
// ya sorteada; ninguna cabeza de Matutina se consulta ni se guarda aquí.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const arg=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const INPUT=path.resolve(root,arg.input||'out/cadena-visual-holdout-08-15');
const OUT=path.resolve(root,arg.out||'out/holdout-ciego-08-15');
const HEADS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const EXPECTED=['2026-09-08','2026-09-09','2026-09-10','2026-09-11',
 '2026-09-12','2026-09-13','2026-09-14','2026-09-15'];
const columnIds=['prevNocturno','Previa','Primera'];
const pos=s=>s.split(':').map(Number);
const uniq=v=>[...new Set(v)];
const escape=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
 .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
function readFile(date,turnIndex){
 const filename=date+'-'+turnIndex+'-'+HEADS[turnIndex-1]+'.json';
 const p=path.join(INPUT,filename);
 if(!fs.existsSync(p))return null;
 const x=JSON.parse(fs.readFileSync(p,'utf8'));
 assert.equal(x.date,date);
 assert.equal(x.closedTurn,HEADS[turnIndex-1]);
 return x;
}
function validate(t){
 assert(['vt2','vt3','vt4'].includes(t.kind));
 assert(t.cells.length===Number(t.kind.slice(2)));
 assert.equal(uniq(t.cells).length,t.cells.length);
 for(let i=0;i<t.cells.length;i++){
  const [r,c]=pos(t.cells[i]);assert(r>=0&&r<6&&(c===0||c===1));
  if(i){const [pr,pc]=pos(t.cells[i-1]);
   assert(Math.max(Math.abs(pr-r),Math.abs(pc-c))===1,'Salto no contiguo');}
 }
}
function headKey(t){return [t.turn,t.jurisdiction,t.fullHead].join('|');}
function physical(t){return t.sourceId+'|'+[t.cells.join('>'),[...t.cells].reverse().join('>')].sort()[0];}
function orientation(d){return [d,[...d].reverse().join('')].sort()[0];}
function contact(a,b){
 return a.sourceId===b.sourceId&&a.cells.some(c=>b.cells.includes(c));
}
function currentValue(trace,columns){
 const col=columns.find(c=>c.id===trace.sourceId);
 if(!col)return null;
 const chars=trace.cells.map(p=>{const [r,s]=pos(p);return col.values[r]?.[s];});
 return chars.every(c=>typeof c==='string'&&/^\d$/.test(c))?chars.join(''):null;
}
function analyze(date,prior,stage){
 assert.equal(stage.date,date);
 const cols=stage.columns.slice(0,3).map(c=>({id:c.id,label:c.label,values:[...c.values]}));
 assert.deepEqual(cols.map(c=>c.id),columnIds);
 assert.equal(stage.columns.length,3,
  'No se permite un estado posterior a Primera (fuga posible del objetivo)');
 assert(stage.strokes.every(t=>['Previa','Primera'].includes(t.turn)),
  'Fuga de Matutina o turno posterior');
 assert(stage.annotations.every(t=>['Previa','Primera'].includes(t.turn)));
 const knownFirst=stage.strokes.filter(t=>t.turn==='Primera');
 const knownToday=stage.strokes.map(x=>({...x,cells:[...x.cells]}));
 const inherited=prior.strokes.filter(t=>cols.some(c=>c.id===t.sourceId)).map(t=>{
  validate(t);
  const value=currentValue(t,cols);
  return {...t,cells:[...t.cells],todayReading:value};
 }).filter(t=>t.todayReading!==null);
 for(const trace of knownToday)validate(trace);
 const grouped=new Map();
 for(const trace of inherited){
  const id=trace.kind+'|'+orientation(trace.todayReading);
  if(!grouped.has(id))grouped.set(id,{id,kind:trace.kind,
   readings:uniq([trace.todayReading,[...trace.todayReading].reverse().join('')]).sort(),
   paths:[]});
  const f=grouped.get(id);
  const origin=headKey(trace);
  if(f.paths.some(x=>x.originHead===origin&&x.sourceId===trace.sourceId&&
   x.cells.join('>')===trace.cells.join('>')))continue;
  const touches=knownFirst.filter(k=>contact(trace,k));
  f.paths.push({originHead:origin,sourceId:trace.sourceId,cells:trace.cells,
   shape:physical(trace),priorMarkedValue:trace.value,directReading:trace.todayReading,
   matchesKnownFirst:touches.map(k=>({head:headKey(k),kind:k.kind,
    cells:k.cells,shared:k.cells.filter(c=>trace.cells.includes(c))}))});
 }
 const families=[...grouped.values()].map(f=>{
  const priorHeads=uniq(f.paths.map(p=>p.originHead));
  const distinctShapes=uniq(f.paths.map(p=>p.shape));
  const connected=f.paths.filter(p=>p.matchesKnownFirst.length);
  const qualifyingPairs=[];
  if(f.kind==='vt3'){
   for(let i=0;i<connected.length;i++)for(let j=i+1;j<connected.length;j++){
    const a=connected[i],b=connected[j];
    if(a.originHead!==b.originHead&&a.shape!==b.shape&&
     a.sourceId===b.sourceId){
     qualifyingPairs.push({firstHead:a.originHead,secondHead:b.originHead,
      firstShape:a.shape,secondShape:b.shape,originColumn:a.sourceId,
      firstContactHeads:uniq(a.matchesKnownFirst.map(x=>x.head)),
      secondContactHeads:uniq(b.matchesKnownFirst.map(x=>x.head))});
    }
   }
  }
  const reasons=[];
  if(priorHeads.length<2)reasons.push('MENOS_DE_DOS_CABEZAS');
  if(distinctShapes.length<2)reasons.push('MENOS_DE_DOS_DIBUJOS');
  if(connected.length<2)reasons.push('MENOS_DE_DOS_DIBUJOS_TOCADOS');
  if(f.kind!=='vt3')reasons.push('VT2_VT4_OBSERVADO_SIN_REGLA');
  if(f.kind==='vt3'&&!qualifyingPairs.length)
   reasons.push('NINGUNA_PAREJA_DE_CABEZAS_Y_DIBUJOS_DISTINTOS_CON_CONTACTO_DE_PRIMERA');
  return {...f,oldHeadCount:priorHeads.length,uniquePhysicalShapeCount:distinctShapes.length,
   touchingPaths:connected.length,touchingShapes:uniq(connected.map(p=>p.shape)).length,
   qualifyingPairs,meetsFrozenVT3Rule:f.kind==='vt3'&&qualifyingPairs.length>0,reasons};
 }).sort((a,b)=>a.kind.localeCompare(b.kind)||a.readings[0].localeCompare(b.readings[0]));
 const eligible=families.filter(f=>f.meetsFrozenVT3Rule);
 const record={protocol:'HOLDOUT_CIEGO_MATUTINA_VT3_REGLA_CONGELADA_V1',
  date,priorDate:prior.date,target:'Matutino',
  category:date==='2026-09-23'?'SOLAPAMIENTO_DESCRIPTIVO':'EXTERNO_A_FORMULACION',
  columns:cols,priorMarkedTraces:prior.strokes.length,inherited,
  knownToday,knownPrimera:knownFirst.length,families,
  eligibleFamilyIds:eligible.map(f=>f.id),
  status:eligible.length===0?'OBSERVAR_SIN_FAMILIA':
   eligible.length===1?'UNA_FAMILIA_SIN_ORIENTACION_ELEGIDA':'AMBIGUO_OBSERVAR_VARIAS',
  noSingleNumberChosen:true,noFutureDrawResults:true};
 assert(!Object.prototype.hasOwnProperty.call(record,'targetHeads'));
 assert(record.knownToday.every(s=>HEADS.indexOf(s.turn)<HEADS.indexOf('Matutino')));
 return record;
}
function page(v){
 const rows=v.families.map(f=>'<tr><td>'+escape(f.kind.toUpperCase()+' '+f.readings.join('/'))+
  '</td><td>'+f.oldHeadCount+'</td><td>'+f.uniquePhysicalShapeCount+
  '</td><td>'+f.touchingShapes+'</td><td>'+escape(f.meetsFrozenVT3Rule?'SÍ':'No')+
  '</td><td>'+escape(f.reasons.join(', ')||'Pareja comprobable en ficha')+'</td></tr>').join('');
 const svg=board(v);
 const details=v.families.map(f=>'<details'+(f.meetsFrozenVT3Rule?' open':'')+
  '><summary>'+escape(f.kind.toUpperCase()+' '+f.readings.join('/'))+
  ' · '+f.oldHeadCount+' cabezas, '+f.uniquePhysicalShapeCount+' formas, '+
  f.touchingShapes+' tocadas</summary><ol>'+
  f.paths.map(p=>'<li><b>'+escape(p.originHead)+'</b> · '+escape(p.sourceId)+
   ' · '+escape(p.cells.join('→'))+' · valor histórico '+escape(p.priorMarkedValue)+
   ' → ahora '+escape(p.directReading)+' · '+(p.matchesKnownFirst.length?
   'toca Primera: '+escape(uniq(p.matchesKnownFirst.map(k=>k.head)).join('; ')):'no toca Primera')+'</li>').join('')+
  '</ol></details>').join('');
 return '<!doctype html><html lang="es"><head><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>Modelo Papá · externo ciego '+v.date+'</title>'+
 '<style>body{font:14px system-ui;background:#faf8fc;color:#312642;max-width:1400px;margin:auto;padding:20px}'+
 '.cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}.card{border:1px solid #dcd3e9;background:white;border-radius:10px;padding:12px;min-width:0;overflow:auto}'+
 'iframe{width:100%;height:640px;border:0}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd4e9;padding:7px;text-align:left}'+
 'th{background:#eee8f7}details{margin:8px 0;padding:9px;border:1px solid #ddd4e9;border-radius:7px}a{color:#6940a0}'+
 '@media(max-width:900px){.cols{grid-template-columns:1fr}}</style></head><body>'+
 '<h1>Observación externa · '+v.date+' · ANTES de Matutina</h1>'+
 '<p>Resultado objetivo ausente. La izquierda muestra TODA la hoja marcada después de Nocturna del '+v.priorDate+
 ', con cabezas completas y todos los VT2/VT3/VT4. A la derecha está el +11 físico que existía ANTES de Matutina, '+
 'con huellas heredadas (violeta) y marcas confirmadas de Primera (verde).'+
 'No hay predicción individual: las lecturas directa/inversa permanecen juntas.</p>'+
 '<p><b>'+v.status+'</b> · elegibles VT3: '+v.eligibleFamilyIds.length+
 ' · '+(v.category==='SOLAPAMIENTO_DESCRIPTIVO'?'23/09 solapa con período de formulación':
 'corte externo de 08–15')+'</p><div class="cols"><div class="card"><h2>Hoja anterior ya marcada</h2>'+
 '<iframe src="'+v.priorDate+'-5-Nocturno.html"></iframe></div>'+
 '<div class="card"><h2>Tablero actual y contactos de Primera</h2>'+
 '<div style="overflow:auto">'+svg+'</div></div></div>'+
 '<h2>Inventario de TODAS las familias, incluidas las no elegibles</h2><table><thead>'+
 '<tr><th>VT / familia</th><th>Cabezas</th><th>Formas físicas</th><th>Formas tocadas</th><th>Cumple</th><th>Motivo</th></tr>'+
 '</thead><tbody>'+rows+'</tbody></table>'+details+
 '<p>Regla congelada previamente: una familia VT3 con dos cabezas distintas, dos dibujos distintos en una sola columna '+
 'y ambos tocados por marcas ya comprobadas de Primera. No se adapta al resultado.</p>'+
 '<p><a href="index.html">Volver a todas las jornadas</a></p></body></html>';
}
function board(record){
 const w=150+3*135,h=430;
 const at=(i,s)=>{const [r,c]=pos(s);return [107+i*135+c*39,100+r*50];};
 const labels=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
 const g=['<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" viewBox="0 0 '+w+' '+h+'">'];
 record.columns.forEach((col,i)=>{
  g.push('<text x="'+(90+i*135)+'" y="28" font-size="12">'+escape(col.label||col.id)+'</text>');
  for(let r=0;r<6;r++)for(let c=0;c<2;c++){
   const [x,y]=at(i,r+':'+c),v=col.values[r],num=/^\d{2}$/.test(v)?v[c]:'—';
   g.push('<rect x="'+(x-17)+'" y="'+(y-18)+'" width="34" height="36" rx="4" fill="white" stroke="#ddd0e9"/>',
   '<text x="'+x+'" y="'+(y+7)+'" font-size="20" text-anchor="middle">'+escape(num)+'</text>');
  }
 });
 labels.forEach((l,i)=>g.push('<text x="2" y="'+(105+i*50)+'" font-size="10">'+escape(l)+'</text>'));
 const put=(tr,color,width=3)=>{
  const i=record.columns.findIndex(c=>c.id===tr.sourceId);assert(i>=0);
  const points=tr.cells.map(c=>at(i,c)).map(x=>x.join(',')).join(' ');
  g.push('<polyline points="'+points+'" fill="none" stroke="'+color+
   '" stroke-width="'+width+'" opacity=".5" stroke-linejoin="round" stroke-linecap="round"/>');
 };
 for(const tr of record.inherited)put(tr,'#8053bc',2);
 for(const tr of record.knownToday.filter(t=>t.turn==='Primera'))put(tr,'#109d80',4);
 g.push('</svg>');
 return g.join('');
}
function test(){
 const t=(head,cells,kind='vt3',turn='Primera')=>({kind,sourceId:'prevNocturno',
  cells,fullHead:head,turn,jurisdiction:'Ciudad',value:'123'});
 const prior={date:'2026-09-07',strokes:[
  t('0123',['0:0','1:0','2:1']),t('9231',['0:1','1:0','2:1'])]};
 const now={date:'2026-09-08',columns:[
  {id:'prevNocturno',values:['55','55','55','55','55','55']},
  {id:'Previa',values:['44','44','44','44','44','44']},
  {id:'Primera',values:['33','33','33','33','33','33']}],
  strokes:[t('9543',['1:0','2:1'],'vt2','Primera')],
  annotations:[{turn:'Primera'}]};
 const x=analyze('2026-09-08',prior,now);
 assert.equal(x.eligibleFamilyIds.length,1);
 assert.equal(x.families.find(x=>x.meetsFrozenVT3Rule).uniquePhysicalShapeCount,2);
 const same={...prior,strokes:[prior.strokes[0],{...prior.strokes[0],
  fullHead:'9999',cells:[...prior.strokes[0].cells].reverse()}]};
 assert.equal(analyze('2026-09-08',same,now).eligibleFamilyIds.length,0,
  'Misma geometría invertida no equivale a dos dibujos');
 const sameHead={...prior,strokes:[prior.strokes[0],{...prior.strokes[1],fullHead:'0123'}]};
 assert.equal(analyze('2026-09-08',sameHead,now).eligibleFamilyIds.length,0,
  'Dos dibujos de una sola cabeza tampoco cumplen');
 const otherCol={...prior,strokes:[prior.strokes[0],
  {...prior.strokes[1],sourceId:'Previa'}]};
 assert.equal(analyze('2026-09-08',otherCol,now).eligibleFamilyIds.length,0,
  'No admitir dibujos de distintas columnas como una misma formación');
 const future={...now,strokes:[...now.strokes,t('7777',['0:0','1:0','2:1'],'vt3','Matutino')]};
 assert.throws(()=>analyze('2026-09-08',prior,future));
 console.log('TEST_HOLDOUT_CIEGO_OK frozen two heads, two nonreversible drawings, same column, Primera contacts; target censoring');
}
function main(){
 test();if(arg['test-only']==='true')return;
 fs.mkdirSync(OUT,{recursive:true});
 const dates=EXPECTED.filter(x=>x!=='2026-09-13'),records=[];
 for(const date of dates){
  const ti=EXPECTED.indexOf(date);
  const prev=date==='2026-09-08'?'2026-09-07':EXPECTED[ti-1]||null;
  const priorDate=date==='2026-09-14'?'2026-09-12':prev;
  const old=readFile(priorDate,5),current=readFile(date,2);
  if(!old||!current){console.log('HOLDOUT_NO_DATA '+date+' prev='+priorDate+
   ' previous_exists='+!!old+' stage_exists='+!!current);continue;}
  const r=analyze(date,old,current);
  fs.writeFileSync(path.join(OUT,date+'-ANTES-Matutino.json'),JSON.stringify(r,null,2));
  fs.writeFileSync(path.join(OUT,date+'-ANTES-Matutino.html'),page(r));
  const hist=priorDate+'-5-Nocturno.html';
  if(!fs.existsSync(path.join(OUT,hist)))
   fs.copyFileSync(path.join(INPUT,hist),path.join(OUT,hist));
  records.push({date,priorDate:priorDate,category:r.category,
   status:r.status,eligibleFamilyIds:r.eligibleFamilyIds,
   countVT2:r.families.filter(x=>x.kind==='vt2').length,
   countVT3:r.families.filter(x=>x.kind==='vt3').length,
   countVT4:r.families.filter(x=>x.kind==='vt4').length,
   allFamilies:r.families.length});
  console.log('HOLDOUT_CIEGO '+date+' | anterior='+priorDate+
   ' | estado='+r.status+' | familias_VT3_elegibles='+r.eligibleFamilyIds.join(',')+
   ' | TOTAL_vt2='+r.families.filter(x=>x.kind==='vt2').length+
   ' VT3='+r.families.filter(x=>x.kind==='vt3').length+
   ' VT4='+r.families.filter(x=>x.kind==='vt4').length);
 }
 assert.deepEqual(records.map(x=>x.date),dates,'Los siete cortes congelados deben estar completos; no ocultar fechas faltantes');
 const summary=['# Semana externa visual congelada: antes de Matutina 08–15/09','',
  '**NO predicción realizada antes del sorteo.** Interpretación pre-objetivo',
  'basada exclusivamente en hojas MARCADAS anteriores y marcas de Primera ya sorteada.',
  'Todos los días 08–15 están fuera del período de formulación,',
  'sin superposición con los casos 29–30.','',
  'Regla única preespecificada: VT3, dos cabezas históricas diferentes',
  'con dos huellas físicas diferentes en la misma columna, ambas tocadas',
  'por marcas ya comprobadas de Primera del día actual.',
  'Una huella y su inversa cuentan como UNA forma; las lecturas numéricas',
  'directa e inversa permanecen en el expediente sin elegir orientación.','',
  '| Fecha | Base | Carácter | Estado antes de Matutina | Familias VT3 calificadas |',
  '|---|---|---|---|---|'];
 for(const r of records)summary.push('| '+r.date+' | '+r.priorDate+
  ' | '+r.category+' | '+r.status+' | '+(r.eligibleFamilyIds.join(' / ')||'Ninguna')+' |');
 summary.push('','Los expedientes HTML y JSON conservan todas las familias',
  'VT2/VT3/VT4 y rutas no calificadas. El resultado de Matutina',
  '**NO** está incluido en estos archivos.','');
 fs.writeFileSync(path.join(OUT,'REGISTRO_CIEGO_PREVIO.md'),summary.join('\n'));
 fs.writeFileSync(path.join(OUT,'REGISTRO_CIEGO_PREVIO.json'),JSON.stringify(records,null,2));
 const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Holdout visual 08–15</title>'+
 '<style>body{font:16px system-ui;background:#faf8fc;max-width:900px;margin:auto;padding:25px;color:#322643}'+
 'a{display:block;padding:12px;background:white;margin:8px;border:1px solid #e5dcef;border-radius:8px;color:#59379d}</style>'+
 '</head><body><h1>Examen visual histórico externo 08–15/09</h1>'+
 '<p>Hojas ya marcadas, todas las rutas y tres modalidades. Resultados objetivo ocultos. '+
 'Ningún día pertenece al período de formulación.</p>'+
 records.map(r=>'<a href="'+r.date+'-ANTES-Matutino.html">'+r.date+
 ' · '+r.status+' · VT3 calificadas '+r.eligibleFamilyIds.length+'</a>').join('')+
 '<p>No son números jugados ni pronósticos prospectivos.</p></body></html>';
 fs.writeFileSync(path.join(OUT,'index.html'),html);
 console.log('HOLDOUT_CIEGO_FIN '+records.length+' expedientes sin resultado posterior');
}
main();
