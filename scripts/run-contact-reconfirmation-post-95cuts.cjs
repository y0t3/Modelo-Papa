// RECONCILIACIÓN POSTERIOR: archivos PRE cerrados y resultados históricos
// publicados por el otro flujo, SIN rankear cifras ni modificar expedientes.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function flag(name,fallback){
 const a=process.argv.find(x=>x.startsWith('--'+name+'='));
 return path.resolve(root,a?a.slice(name.length+3):fallback);
}
const preDir=flag('input','out/contactos-antes-95');
const postDir=flag('post','out/atlas-completo-negativos-08-30');
const views=flag('views','out/cadena-visual-08-30-septiembre');
const output=flag('out','out/contactos-post-95');
const turns=['Previa','Primera','Matutino','Vespertino','Nocturno'];
const kinds=['vt2','vt3','vt4'];
const cats=['MISMA_GEOMETRIA','DOS_O_MAS_CELDAS','UNA_CELDA','NINGUN_CONTACTO'];
const unique=a=>[...new Set(a)];
const geom=t=>t.kind+'|'+t.sourceId+'|'+[t.cells.join('>'),[...t.cells].reverse().join('>')].sort()[0];
function assess(pre,post,after){
 assert.equal(pre.date,post.date);
 assert.equal(pre.target,post.target);
 assert.equal(after.date,pre.date);
 assert.equal(after.closedTurn,pre.target);
 assert.equal(pre.mode,'SIN_RESULTADO_OBJETIVO');
 const complete=post.fullHeadsAvailable===6;
 const target=after.strokes.filter(t=>t.turn===pre.target);
 const known=new Map();
 for(const t of target){
  assert(pre.columns.includes(t.sourceId));
  const id=geom(t);
  if(!known.has(id))known.set(id,[]);
  const h=[t.turn,t.jurisdiction,t.fullHead].join('|');
  if(!known.get(id).includes(h))known.get(id).push(h);
 }
 const rows=pre.records.map(p=>{
  assert(p.id===geom(p));
  const confirmedHeads=known.get(p.id)||[];
  const digits=Number(p.kind.slice(-1));
  const numericHeads=post.fullHeads.filter(h=>/^\d{4}$/.test(h.head) &&
   p.readings.includes(h.head.slice(-digits)));
  return {...p,confirmedHeads,numericHeads,
   exact:confirmedHeads.length?true:complete?false:null,
   numeric:numericHeads.length?true:complete?false:null};
 });
 assert.equal(rows.length,pre.distinctPhysicalPaths);
 const totals={};
 for(const kind of kinds)for(const cat of cats){
  const list=rows.filter(x=>x.kind===kind&&x.type===cat);
  totals[kind+'|'+cat]={n:list.length,
   yes:list.filter(x=>x.exact===true).length,
   no:list.filter(x=>x.exact===false).length,
   unknown:list.filter(x=>x.exact===null).length,
   numericYes:list.filter(x=>x.numeric===true).length};
 }
 return {date:pre.date,target:pre.target,coverage:post.fullHeadsAvailable,
  totals,rows,fullHeads:post.fullHeads};
}
function tests(){
 const tr={kind:'vt3',sourceId:'Previa',cells:['1:0','2:0','3:1'],
  readings:['298','892'],type:'UNA_CELDA'};
 tr.id=geom(tr);
 const p={date:'2026-09-22',target:'Matutino',mode:'SIN_RESULTADO_OBJETIVO',
  columns:['prevNocturno','Previa','Primera'],
  distinctPhysicalPaths:1,records:[tr]};
 const out={date:p.date,target:p.target,fullHeadsAvailable:6,
  fullHeads:[{jurisdiction:'Ciudad',head:'3298'}]};
 const stage={date:p.date,closedTurn:p.target,strokes:[
  {turn:'Matutino',kind:'vt3',sourceId:'Previa',
   cells:[...tr.cells].reverse(),jurisdiction:'Ciudad',fullHead:'3298'}]};
 const yes=assess(p,out,stage).rows[0];
 assert.equal(yes.exact,true);assert.equal(yes.numeric,true);
 assert.equal(assess(p,out,{...stage,strokes:[]}).rows[0].exact,false);
 assert.equal(assess(p,{...out,fullHeadsAvailable:5},
  {...stage,strokes:[]}).rows[0].exact,null);
 assert.throws(()=>assess(p,out,{...stage,strokes:[{
  ...stage.strokes[0],sourceId:'Vespertino'}]}));
 console.log('TEST_POST_CONTACTO_OK ruta inversa, ausencia, cobertura, fuente');
}
function main(){
 tests();if(process.argv.includes('--test-only=true'))return;
 const names=fs.readdirSync(preDir).filter(x=>/^\d{4}-\d{2}-\d{2}-ANTES-(Previa|Primera|Matutino|Vespertino|Nocturno)\.json$/.test(x));
 assert.equal(names.length,95);
 fs.mkdirSync(output,{recursive:true});
 const all=[];
 for(const file of names){
  const pre=JSON.parse(fs.readFileSync(path.join(preDir,file),'utf8'));
  const date=pre.date,target=pre.target,turnIndex=turns.indexOf(target)+1;
  const post=JSON.parse(fs.readFileSync(path.join(postDir,'POST-'+date+'-'+target+'.json'),'utf8'));
  const view=JSON.parse(fs.readFileSync(path.join(views,date+'-'+turnIndex+'-'+target+'.json'),'utf8'));
  const result=assess(pre,post,view);
  all.push(result);
  fs.writeFileSync(path.join(output,date+'-POST-'+target+'.json'),JSON.stringify(result,null,2));
 }
 const summary={};
 for(const kind of kinds)for(const cat of cats){
  const id=kind+'|'+cat;summary[id]={n:0,yes:0,no:0,unknown:0,numericYes:0};
  for(const r of all)for(const k of Object.keys(summary[id]))summary[id][k]+=r.totals[id][k];
 }
 const strata=[];
 for(const r of all)for(const kind of kinds){
  for(const sourceId of unique(r.rows.filter(x=>x.kind===kind).map(x=>x.sourceId))){
   const a=r.rows.filter(x=>x.kind===kind&&x.sourceId===sourceId);
   const t=a.filter(x=>x.type!=='NINGUN_CONTACTO');
   const n=a.filter(x=>x.type==='NINGUN_CONTACTO');
   if(!t.length||!n.length)continue;
   const tally=x=>({count:x.length,yes:x.filter(p=>p.exact===true).length,
    no:x.filter(p=>p.exact===false).length,
    unknown:x.filter(p=>p.exact===null).length});
   strata.push({date:r.date,target:r.target,kind,sourceId,
    touching:tally(t),notTouching:tally(n)});
  }
 }
 const lines=['# Contacto previo y reconfirmación posterior, 95 cortes','',
  '**REPLAY HISTÓRICO. No hay pronósticos elegidos.**',
  'Las categorías de contacto se fijaron antes de consultar resultados.',
  'La misma geometría se deduplica por inversión; nunca se unen columnas.',
  'Se incluyen todas las ausencias de marca y casos con cabezas faltantes.','',
  '| VT | Contacto previo | Exposiciones | Reconfirmación física | No reconfirmó | Indeterminado | Coincidencia numérica permisiva |',
  '|---|---|---:|---:|---:|---:|---:|'];
 for(const kind of kinds)for(const cat of cats){
  const x=summary[kind+'|'+cat];
  lines.push('| '+kind.toUpperCase()+' | '+cat+' | '+x.n+
   ' | '+x.yes+' | '+x.no+' | '+x.unknown+' | '+x.numericYes+' |');
 }
 lines.push('','## Contrastes dentro de la misma fecha, turno, fuente y VT','',
  'Cada estrato tiene rutas con contacto y sin él; no se preseleccionan valores.',
  '| Fecha | Turno | VT | Fuente | Contacto exactas/total | Sin contacto exactas/total |',
  '|---|---|---|---|---:|---:|');
 for(const s of strata)lines.push('| '+s.date+' | '+s.target+' | '+s.kind+
  ' | '+s.sourceId+' | '+s.touching.yes+'/'+s.touching.count+
  ' | '+s.notTouching.yes+'/'+s.notTouching.count+' |');
 lines.push('','Advertencia: huellas repetidas en varios cortes, cabezas compartidas,',
  'múltiples orientaciones y seis jurisdicciones. Esto no prueba una ventaja',
  'predictiva sobre el azar ni justifica asignar puntajes al motor.','');
 fs.writeFileSync(path.join(output,'INFORME_CONTACTOS_PRE_VS_POST.md'),lines.join('\n'));
 fs.writeFileSync(path.join(output,'RESUMEN_CONTACTOS_PRE_VS_POST.json'),
  JSON.stringify({summary,strata,cutCount:all.length},null,2));
 const paired={};
 for(const kind of kinds){
  const a=strata.filter(x=>x.kind===kind);
  const group=['touching','notTouching'];
  const totals=Object.fromEntries(group.map(label=>[label,{yes:0,no:0,unknown:0}]));
  let ahead=0,behind=0,tied=0,indeterminate=0;
  for(const row of a){
   for(const label of group){
    totals[label].yes+=row[label].yes;
    totals[label].no+=row[label].no;
    totals[label].unknown+=row[label].unknown;
   }
   const touchedKnown=row.touching.yes+row.touching.no;
   const coldKnown=row.notTouching.yes+row.notTouching.no;
   if(!touchedKnown||!coldKnown){indeterminate++;continue;}
   const delta=row.touching.yes/touchedKnown-row.notTouching.yes/coldKnown;
   if(delta>0)ahead++;else if(delta<0)behind++;else tied++;
  }
  paired[kind]={strata:a.length,totals,
   strataTouchedHigher:ahead,strataColdHigher:behind,
   strataTied:tied,strataIndeterminate:indeterminate};
 }
 fs.writeFileSync(path.join(output,'CONTROL_ESTRATOS_RESUMIDO.json'),JSON.stringify(paired,null,2));
 console.log('CONTROL_APAREADO '+JSON.stringify(paired));
 for(const [date,target,values] of [
  ['2026-09-29','Matutino',['289','384']],
  ['2026-09-30','Matutino',['778','37']]]){
  const c=all.find(x=>x.date===date&&x.target===target);
  if(!c)continue;
  const shapes=c.rows.filter(x=>values.some(v=>x.readings.includes(v)));
  console.log('EJEMPLO_VISUAL_Y_NEGATIVO '+date+' '+target+' '+JSON.stringify(shapes.map(x=>({
   id:x.id,kind:x.kind,readings:x.readings,cells:x.cells,
   type:x.type,contacts:x.contacts.map(k=>({head:k.knownHead,cells:k.shared})),
   confirmedHeads:x.confirmedHeads,numericHeads:x.numericHeads}))));
 }
 console.log('CONTACTO_POST_OK '+all.length+' cortes; estratos '+strata.length);
 console.log('CONTACTO_POST_SUMMARY '+JSON.stringify(summary));
}
main();
