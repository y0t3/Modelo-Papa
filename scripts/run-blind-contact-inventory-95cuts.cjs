// Modelo Papá — contactos físicos preturno de TODAS las huellas anteriores.
// SIN usar resultado objetivo, ni comparar con marcas de turnos futuros.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const opts=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('='))
 .map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const input=path.resolve(root,opts.input||'out/examen-ciego-95-septiembre');
const out=path.resolve(root,opts.out||'out/contactos-antes-95');
const turns=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const kinds=['vt2','vt3','vt4'];
const cats=['MISMA_GEOMETRIA','DOS_O_MAS_CELDAS','UNA_CELDA','NINGUN_CONTACTO'];
const unique=v=>[...new Set(v)];
const reverse=a=>[...a].reverse();
function validate(t){
 assert(kinds.includes(t.kind),'Modalidad no permitida');
 assert(t.cells.length===Number(t.kind.slice(2)));
 assert(unique(t.cells).length===t.cells.length,'Reutilización de celdas');
 for(let i=0;i<t.cells.length;i++){
  const [r,c]=t.cells[i].split(':').map(Number);
  assert(Number.isInteger(r)&&r>=0&&r<6&&[0,1].includes(c));
  if(i){const [pr,pc]=t.cells[i-1].split(':').map(Number);
   assert(Math.max(Math.abs(r-pr),Math.abs(c-pc))===1,'Salto inválido');}
 }
 assert(t.sourceId);
}
function geom(t){
 return t.kind+'|'+t.sourceId+'|'+[t.cells.join('>'),reverse(t.cells).join('>')].sort()[0];
}
function sameCells(a,b){
 return a.cells.length===b.cells.length&&
  (a.cells.join('>')===b.cells.join('>')||
   a.cells.join('>')===reverse(b.cells).join('>'));
}
function touch(a,b){
 if(a.sourceId!==b.sourceId)return null;
 const shared=unique(a.cells.filter(c=>b.cells.includes(c)));
 if(!shared.length)return null;
 return {knownHead:[b.turn,b.jurisdiction,b.fullHead].join('|'),
  knownKind:b.kind,sourceId:b.sourceId,knownCells:b.cells,
  shared,relation:sameCells(a,b)?'MISMA_GEOMETRIA':
   shared.length>=2?'DOS_O_MAS_CELDAS':'UNA_CELDA'};
}
function categorize(path,known){
 const contacts=known.map(x=>touch(path,x)).filter(Boolean);
 const type=cats.find(cat=>contacts.some(c=>c.relation===cat))||'NINGUN_CONTACTO';
 return {type,contacts,contactedKnownHeads:unique(contacts.map(x=>x.knownHead)).sort()};
}
function build(cut){
 const ti=turns.indexOf(cut.target);assert(ti>=0);
 assert.equal(cut.mode,'ANTES_DEL_SORTEO_OBJETIVO');
 assert.equal(cut.noAutomatedCandidate,true);
 assert.equal(cut.columns.length,ti+1,'Columna futura incluida');
 const allowed=new Set(cut.columns.map(c=>c.id));
 assert(cut.knownToday.every(t=>turns.indexOf(t.turn)>=0&&turns.indexOf(t.turn)<ti),
  'Información del turno objetivo o futuro presente');
 for(const t of [...cut.inherited,...cut.knownToday]){
  validate(t);assert(allowed.has(t.sourceId),'Cruce a fuente futura');
 }
 const paths=new Map();
 for(const p of cut.inherited){
  const id=geom(p),direct=p.todayReading;
  assert(/^\d{2,4}$/.test(direct)&&direct.length===p.cells.length);
  if(!paths.has(id))paths.set(id,{id,kind:p.kind,sourceId:p.sourceId,
   cells:p.cells,readings:unique([direct,reverse(direct).join('')]).sort(),
   priorHeads:[],priorMarkedValues:[]});
  const item=paths.get(id);
  assert(item.readings.includes(direct),'Inversión inconsistente en mismo dibujo');
  const head=[p.turn,p.jurisdiction,p.fullHead].join('|');
  if(!item.priorHeads.includes(head))item.priorHeads.push(head);
  if(!item.priorMarkedValues.includes(p.value))item.priorMarkedValues.push(p.value);
 }
 const records=[...paths.values()].map(p=>({...p,...categorize(p,cut.knownToday)}))
  .sort((a,b)=>a.kind.localeCompare(b.kind)||a.id.localeCompare(b.id));
 const stats=Object.fromEntries(kinds.map(kind=>[kind,{
  total:records.filter(x=>x.kind===kind).length,
  ...Object.fromEntries(cats.map(cat=>[cat,records.filter(x=>x.kind===kind&&x.type===cat).length]))
 }]));
 for(const k of kinds)assert.equal(cats.reduce((n,cat)=>n+stats[k][cat],0),stats[k].total);
 return {protocol:'CONTACTO_HUELLA_PRETURNO_V1',date:cut.date,target:cut.target,
  priorDate:cut.priorDate,mode:'SIN_RESULTADO_OBJETIVO',
  columns:cut.columns.map(c=>c.id),knownHeads:unique(cut.knownToday.map(c=>
   [c.turn,c.jurisdiction,c.fullHead].join('|'))).sort(),
  inheritedPaths:cut.inherited.length,distinctPhysicalPaths:records.length,
  knownTodayPaths:cut.knownToday.length,stats,records};
}
function test(){
 const tr=(kind,sourceId,cells,turn='Previa',head='2398')=>({
  kind,sourceId,cells,turn,jurisdiction:'Ciudad',
  fullHead:head,value:'98',todayReading:kind==='vt3'?'398':'98'});
 const original=tr('vt3','Previa',['1:0','2:0','3:1'],'Previa','1398');
 const reversed={...original,cells:reverse(original.cells),todayReading:'893',fullHead:'7398'};
 const old={date:'2026-09-24',target:'Matutino',mode:'ANTES_DEL_SORTEO_OBJETIVO',
  noAutomatedCandidate:true,columns:[{id:'prevNocturno'},{id:'Previa'},{id:'Primera'}],
  inherited:[original,reversed],knownToday:[
   tr('vt2','Previa',['2:0','3:1'],'Primera','5098')]};
 const result=build(old);
 assert.equal(result.stats.vt3.total,1);
 assert.equal(result.records[0].priorHeads.length,2);
 assert.equal(result.records[0].type,'DOS_O_MAS_CELDAS');
 assert.equal(build({...old,knownToday:[]}).records[0].type,'NINGUN_CONTACTO');
 assert.equal(build({...old,knownToday:[{...original,turn:'Primera'}]}).records[0].type,'MISMA_GEOMETRIA');
 assert.equal(build({...old,knownToday:[tr('vt2','Primera',['2:0','3:1'],'Primera')]}).records[0].type,
  'NINGUN_CONTACTO','Celdas de otra columna no pueden tocar');
 assert.throws(()=>build({...old,knownToday:[{...original,turn:'Matutino'}]}));
 const gap={...original,cells:['0:0','2:0','3:1']};
 assert.throws(()=>validate(gap));
 console.log('TEST_CONTACTO_CIEGO_OK: deduplicar inversión/cabeza, 4 clases, no cruzar fuente, excluir futuro');
}
function main(){
 test();if(opts['test-only']==='true')return;
 const audit=JSON.parse(fs.readFileSync(path.join(input,'AUDITORIA_CORTES.json'),'utf8'));
 assert.equal(audit.length,95);
 fs.mkdirSync(out,{recursive:true});
 const all=[],summary=['# Inventario CIEGO de contactos preturno','',
  'NO CONTIENE RESULTADOS DEL TURNO OBJETIVO. Parte de huellas MARCADAS',
  'en la hoja anterior, examina las columnas ya disponibles y conserva',
  'cualquier alternativa, incluyendo ausencia de contacto. Cada geometría',
  'de una fuente/modalidad se cuenta una vez, con inversión deduplicada.',
  'La clase de contacto no elige una cifra ni orientación futura.','',
  '| Día | Antes de | VT | Huellas anteriores distintas | Misma forma hoy | 2+ celdas compartidas | 1 celda | Sin contacto |',
  '|---|---|---|---:|---:|---:|---:|---:|'];
 for(const x of audit){
  const cut=JSON.parse(fs.readFileSync(path.join(input,x.date+'-ANTES-'+x.turn+'.json'),'utf8'));
  assert.equal(cut.target,x.turn);
  assert.equal(cut.date,x.date);
  const r=build(cut);
  fs.writeFileSync(path.join(out,x.date+'-ANTES-'+x.turn+'.json'),JSON.stringify(r,null,2));
  all.push({date:r.date,target:r.target,stats:r.stats,knownToday:r.knownTodayPaths,
   inherited:r.inheritedPaths,unique:r.distinctPhysicalPaths});
  for(const k of kinds){const v=r.stats[k];
   summary.push('| '+r.date+' | '+r.target+' | '+k.toUpperCase()+' | '+v.total+
    ' | '+cats.map(cat=>v[cat]).join(' | ')+' |');
  }
  console.log('CONTACTO_PRE '+r.date+' '+r.target+' '+JSON.stringify(r.stats));
 }
 assert.equal(all.length,95);
 const combined={};
 for(const k of kinds)combined[k]=Object.fromEntries(['total',...cats].map(x=>
  [x,all.reduce((sum,c)=>sum+c.stats[k][x],0)]));
 summary.push('','## Totales por modalidad sin resultados','');
 for(const k of kinds)summary.push('- '+k.toUpperCase()+': '+JSON.stringify(combined[k]));
 summary.push('','### Advertencia','',
  'Los 95 cortes repiten huellas durante un mismo día; no son 95 ensayos',
  'estadísticamente independientes. Las marcas conocidas de Previa son cero',
  'por definición. El archivo posterior estudia las confirmaciones REALES',
  'del objetivo por separado, sin alterar este registro.','');
 fs.writeFileSync(path.join(out,'CONTACTOS_PREVIOS_95_CORTES.md'),summary.join('\n'));
 fs.writeFileSync(path.join(out,'CONTACTOS_PREVIOS_95_CORTES.json'),JSON.stringify({all,combined},null,2));
 console.log('CONTACTO_PRE_LISTO '+all.length+' cortes, completos y sin resultado objetivo');
}
main();
