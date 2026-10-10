// Modelo Papá — anatomía RETROSPECTIVA de TODAS las huellas, no ranking.
// Separación formal: se ejecuta sólo tras publicar 95 cortes PRE-sorteo.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache=new Map();
const arg=Object.fromEntries(process.argv.slice(2).filter(s=>s.startsWith('--')&&s.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const blindDir=path.resolve(root,arg.input||'out/examen-ciego-95-septiembre');
const viewsDir=path.resolve(root,arg.views||'out/cadena-visual-08-30-septiembre');
const out=path.resolve(root,arg.out||'out/atlas-completo-negativos-08-30');
const TURNOS=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const JURS=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const CATS=['misma_huella','traslacion','giro_extremo','roce_interno','sin_relacion'];
const uniq=x=>[...new Set(x)];
function load(name){
 const p=path.resolve(root,name.endsWith('.ts')?name:name+'.ts');
 if(cache.has(p))return cache.get(p).exports;
 const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};cache.set(p,m);
 vm.runInThisContext('(function(require,module,exports){'+js+'\n})',{filename:p})(
  n=>n.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(p),n))):require(n),m,m.exports);
 return m.exports;
}
const {descargarCabezas}=load('src/cabezas.ts');
function xy(x){const [r,c]=x.split(':').map(Number);
 assert(Number.isInteger(r)&&r>=0&&r<6&&(c===0||c===1),'celda ilegal: '+x);
 return [r,c];}
function validate(t){
 assert(['vt2','vt3','vt4'].includes(t.kind),'Modalidad ilegal');
 assert(t.cells.length===Number(t.kind.slice(-1)),'Largo errado');
 assert(uniq(t.cells).length===t.cells.length,'Reutilización de celda');
 for(let i=0;i<t.cells.length;i++){const [r,c]=xy(t.cells[i]);
  if(i){const [rr,cc]=xy(t.cells[i-1]);
   assert(Math.max(Math.abs(r-rr),Math.abs(c-cc))===1,'Salto físico');}
 }
 assert(t.sourceId);
}
function canonical(cells){return [cells.join('>'),[...cells].reverse().join('>')].sort()[0];}
function key(t){return t.kind+'|'+t.sourceId+'|'+canonical(t.cells);}
function increments(cells){
 return cells.slice(1).map((c,i)=>{const [r,x]=xy(c),[p,y]=xy(cells[i]);
  return (r-p)+','+(x-y);}).join(';');
}
function shape(t){return [increments(t.cells),increments([...t.cells].reverse())].sort()[0];}
function compress(strokes){
 const m=new Map();
 for(const t of strokes){
  validate(t);const id=key(t);
  if(!m.has(id))m.set(id,{id,kind:t.kind,sourceId:t.sourceId,
   cells:t.cells.slice(),heads:[],values:[]});
  const v=m.get(id),h=[t.turn,t.jurisdiction,t.fullHead].join('|');
  if(!v.heads.includes(h))v.heads.push(h);
  if(!v.values.includes(t.value))v.values.push(t.value);
 }
 return [...m.values()].sort((a,b)=>a.id.localeCompare(b.id));
}
function relation(a,b){
 assert(a.kind===b.kind&&a.sourceId===b.sourceId);
 if(a.id===b.id)return 'misma_huella';
 if(shape(a)===shape(b))return 'traslacion';
 const endpoints=x=>[x.cells[0],x.cells[x.cells.length-1]];
 if(endpoints(a).some(x=>endpoints(b).includes(x)))return 'giro_extremo';
 if(a.cells.some(x=>b.cells.includes(x)))return 'roce_interno';
 return null;
}
function compare(previous,current){
 const old=compress(previous),now=compress(current);
 const entries=[],linkedNow=new Set();
 for(const p of old){
  const links=[];
  for(const q of now){
   if(p.kind!==q.kind||p.sourceId!==q.sourceId)continue;
   const type=relation(p,q);
   if(type){links.push({type,newId:q.id,newHeads:q.heads});
    linkedNow.add(q.id);}
  }
  const category=CATS.find(cat=>links.some(l=>l.type===cat))||'sin_relacion';
  entries.push({id:p.id,kind:p.kind,sourceId:p.sourceId,
   cells:p.cells,heads:p.heads,oldValues:p.values,
   category,relations:links});
 }
 const stats={};
 for(const kind of ['vt2','vt3','vt4']){
  const subset=entries.filter(e=>e.kind===kind);
  stats[kind]={old:subset.length,new:now.filter(x=>x.kind===kind).length,
   ...Object.fromEntries(CATS.map(cat=>[cat,subset.filter(x=>x.category===cat).length])),
   noCorrespondingNew:now.filter(x=>x.kind===kind&&!linkedNow.has(x.id)).length};
  assert.equal(CATS.reduce((sum,cat)=>sum+stats[kind][cat],0),stats[kind].old);
 }
 return {oldUnique:old.length,newUnique:now.length,old:entries,
  newWithoutLink:now.filter(x=>!linkedNow.has(x.id)),stats};
}
function truth(cut,heads){
 assert(cut.columns.length===TURNOS.indexOf(cut.target)+1);
 const past=TURNOS.indexOf(cut.target);
 assert(cut.knownToday.every(x=>TURNOS.indexOf(x.turn)<past),'Fuga de resultado objetivo');
 const all=JURS.map(j=>({jurisdiction:j,head:heads?.[cut.target]?.[j]||'----'}));
 const complete=all.every(x=>/^\d{4}$/.test(x.head));
 const groups=new Map();
 for(const t of cut.inherited){
  validate(t);
  assert(cut.columns.some(c=>c.id===t.sourceId),'Origen futuro');
  const direct=t.todayReading,reverse=[...direct].reverse().join('');
  const fam=[direct,reverse].sort();
  const id=t.kind+'|'+fam[0];
  if(!groups.has(id))groups.set(id,{id,kind:t.kind,readings:uniq(fam).sort(),
   routes:[],oldHeadSources:[]});
  const g=groups.get(id),origin=[t.turn,t.jurisdiction,t.fullHead].join('|');
  if(!g.oldHeadSources.includes(origin))g.oldHeadSources.push(origin);
  const k=key(t);
  if(!g.routes.includes(k))g.routes.push(k);
 }
 const rows=[...groups.values()].map(g=>{
  const last=Number(g.kind.slice(-1)),matching=all.filter(x=>/^\d{4}$/.test(x.head)&&
   g.readings.includes(x.head.slice(-last)));
  return {...g,matchingHeads:matching,
   result:matching.length?'MATCH_RETROSPECTIVO_SIN_ELECCION':
    complete?'SIN_MATCH_6_CABEZAS':'NO_CONCLUYENTE_COBERTURA'};
 }).sort((a,b)=>a.kind.localeCompare(b.kind)||a.id.localeCompare(b.id));
 return {date:cut.date,target:cut.target,priorDate:cut.priorDate,
  availableColumns:cut.columns.map(c=>c.id),
  fullHeads:all,fullHeadsAvailable:all.filter(x=>/^\d{4}$/.test(x.head)).length,
  inheritedPaths:cut.inherited.length,distinctFamilies:rows.length,rows,
  stats:Object.fromEntries(['vt2','vt3','vt4'].map(kind=>{
   const x=rows.filter(r=>r.kind===kind);
   return [kind,{families:x.length,matched:x.filter(r=>r.matchingHeads.length).length,
    noMatchComplete:x.filter(r=>r.result==='SIN_MATCH_6_CABEZAS').length,
    incomplete:x.filter(r=>r.result==='NO_CONCLUYENTE_COBERTURA').length}];
  }))};
}
function tests(){
 const tr=(kind,cells)=>({kind,sourceId:'Previa',cells,turn:'Previa',
  fullHead:'1298',jurisdiction:'Ciudad',value:'98',todayReading:'98'});
 const a=tr('vt3',['1:0','2:0','3:1']);
 assert.equal(relation({...a,id:key(a)}, {...a,id:key(a)}),'misma_huella');
 const moved=tr('vt3',['2:0','3:0','4:1']);
 assert.equal(relation({...a,id:key(a)},{...moved,id:key(moved)}),'traslacion');
 const turn=tr('vt3',['1:0','2:1','3:0']);
 assert.equal(relation({...a,id:key(a)},{...turn,id:key(turn)}),'giro_extremo');
 const reverse=tr('vt3',[...a.cells].reverse());
 assert.equal(key(a),key(reverse),'La inversa no crea segundo dibujo físico');
 const cross=tr('vt3',a.cells);cross.sourceId='Primera';
 const cmp=compare([a],[cross]);assert.equal(cmp.stats.vt3.sin_relacion,1);
 assert.equal(cmp.stats.vt3.noCorrespondingNew,1);
 const src={date:'2026-09-22',target:'Previa',priorDate:'2026-09-21',
  columns:[{id:'Previa'}],knownToday:[],inherited:[{...a,todayReading:'298'}]};
 assert.equal(truth(src,{Previa:{Ciudad:'1298'}}).stats.vt3.matched,1);
 const wrong={...src,knownToday:[{turn:'Previa'}]};
 assert.throws(()=>truth(wrong,{}));
 console.log('TEST_COMPLETITUD_OK geometría única/inversa/traslación/giro/cruce, negativo y censura');
}
async function main(){
 tests();if(arg['test-only']==='true')return;
 const audit=JSON.parse(fs.readFileSync(path.join(blindDir,'AUDITORIA_CORTES.json'),'utf8'));
 assert.equal(audit.length,95,'Debe haber 95 cortes ciegos de septiembre');
 const dates=uniq(audit.map(x=>x.date)).sort(),period=[...new Set([audit[0].old,...dates])];
 assert.equal(period.length,20,'20 hojas originales / 19 transiciones');
 const cutFiles=audit.map(record=>{
  const cut=JSON.parse(fs.readFileSync(path.join(blindDir,record.date+'-ANTES-'+record.turn+'.json'),'utf8'));
  assert.equal(cut.target,record.turn);
  assert.equal(cut.date,record.date);
  assert(!Object.hasOwn(cut,'heads'));
  return cut;
 });
 const marked=new Map(period.map(date=>{
  const v=JSON.parse(fs.readFileSync(path.join(viewsDir,date+'-5-Nocturno.json'),'utf8'));
  assert.equal(v.date,date);assert.equal(v.closedTurn,'Nocturno');
  return [date,v];
 }));
 // All pre-turn files are loaded, verified and immutable before we fetch
 // target heads and consult any after-draw marks for outcome summaries.
 fs.mkdirSync(out,{recursive:true});
 const actual={};
 for(const day of dates)actual[day]=await descargarCabezas(day,true);
 const evolution=[];
 for(let i=1;i<period.length;i++){
  const previous=period[i-1],date=period[i];
  const r=compare(marked.get(previous).strokes,marked.get(date).strokes);
  const doc={protocol:'RETROSPECTIVA_DE_DOS_HOJAS_MARCADAS_V1',
   priorDate:previous,date,stats:r.stats,
   oldUnique:r.oldUnique,newUnique:r.newUnique,
   old:r.old,newWithoutLink:r.newWithoutLink};
  fs.writeFileSync(path.join(out,'TRANSICION-'+previous+'-A-'+date+'.json'),JSON.stringify(doc,null,2));
  evolution.push({priorDate:previous,date,old:r.oldUnique,new:r.newUnique,stats:r.stats});
  console.log('MOVIMIENTO '+previous+'->'+date+' '+JSON.stringify(r.stats));
 }
 const cases=cutFiles.map(cut=>truth(cut,actual[cut.date]));
 for(const c of cases)fs.writeFileSync(path.join(out,
  'POST-'+c.date+'-'+c.target+'.json'),JSON.stringify(c,null,2));
 const movement=['# Evolución de TODAS las huellas marcadas, incluidos negativos','',
  '**RETROSPECTIVO. NO ES UN SELECTOR DE NÚMEROS.**',
  'Las columnas de fuente son físicas e independientes. Una figura',
  'y su inversión cuentan como UNA geometría cuando se mide la continuidad.',
  'Las relaciones con marcas de hoy se clasifican DESPUÉS de su sorteo.',
  'Por cada huella vieja se guardan TODAS las relaciones, y una categoría',
  'exclusiva de resumen con precedencia misma → traslación → giro → roce → ninguna.',
  '«Sin relación» indica que no comparte ninguno de esos vínculos geométricos,',
  'no es un fracaso de pronóstico. Las cabezas repetidas no inflan figuras.','',
  '| Jornada previa → actual | VT | Figuras previas | Nuevas | Igual huella | Trasladadas | Giro en extremo | Roce | Sin relación | Nuevas sin antecedente en catálogo |',
  '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|'];
 for(const e of evolution)for(const kind of ['vt2','vt3','vt4']){
  const s=e.stats[kind];
  movement.push('| '+e.priorDate+'→'+e.date+' | '+kind.toUpperCase()+' | '+
   [s.old,s.new,s.misma_huella,s.traslacion,s.giro_extremo,s.roce_interno,
   s.sin_relacion,s.noCorrespondingNew].join(' | ')+' |');
 }
 movement.push('','Todos los registros fuente y destino (incluyendo los sin vínculo)',
  'están en JSON por transición. La salida visual de los 95 cortes',
  'está en un artefacto independiente SIN los resultados del objetivo.','');
 fs.writeFileSync(path.join(out,'ATLAS_NEGATIVOS_Y_MOVIMIENTOS.md'),movement.join('\n'));
 const perTurn=['# Relectura de TODAS las huellas ANTES de cada turno y resultados DESPUÉS','',
  '**Estos matches retrospectivos NO SON ACIERTOS DE PRONÓSTICO.**',
  'Se admiten ambas orientaciones de cada familia y se comparan TODOS',
  'los valores contra hasta seis cabezas reales por turno. No se eligió',
  'ningún número ni sentido pre-sorteo. El elevado número de lecturas',
  'VT2 hace especialmente fácil encontrar coincidencias por azar.','',
  '| Fecha | Antes de | Cabezas publicadas | VT2 familias/coincidencias | VT3 familias/coincidencias | VT4 familias/coincidencias |',
  '|---|---|---:|---:|---:|---:|'];
 for(const c of cases)perTurn.push('| '+c.date+' | '+c.target+' | '+
  c.fullHeadsAvailable+'/6 | '+['vt2','vt3','vt4'].map(k=>
   c.stats[k].families+'/'+c.stats[k].matched).join(' | ')+' |');
 perTurn.push('','Cada uno de los 95 archivos POST-* contiene TAMBIÉN las',
  'familias no coincidentes, las cabezas completas y la procedencia histórica.',
  'Si falta alguna jurisdicción, una ausencia es indeterminada.','');
 fs.writeFileSync(path.join(out,'CONTROL_95_CORTES_POSITIVOS_Y_NEGATIVOS.md'),perTurn.join('\n'));
 fs.writeFileSync(path.join(out,'RESUMEN_ESTUDIO.json'),
  JSON.stringify({dates:period,cuts:cases.map(c=>({date:c.date,target:c.target,
   publishedHeads:c.fullHeadsAvailable,stats:c.stats})),evolution},null,2));
 console.log('ESTUDIO_MOVIMIENTOS_COMPLETO_OK '+evolution.length+
  ' transiciones y '+cases.length+' cortes, todos los negativos conservados');
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});
