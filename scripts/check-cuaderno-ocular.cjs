// Verifica que una OBSERVACIÓN HUMANA referencie un corte sin modificar.
// No determina si la observación se registró antes del sorteo; un archivo local
// y su fecha autocontenida jamás son prueba de anterioridad.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const argv=Object.fromEntries(process.argv.slice(2).filter(s=>s.startsWith('--')&&s.includes('=')).map(s=>s.slice(2).split(/=(.*)/s).slice(0,2)));
const sha=cut=>crypto.createHash('sha256').update(JSON.stringify(cut)).digest('hex');
const rev=a=>[...a].reverse();
const uniq=a=>[...new Set(a)];
const id=t=>t.kind+'|'+t.sourceId+'|'+[t.cells.join('>'),rev(t.cells).join('>')].sort()[0];
function index(cut){
 const cols=new Map(cut.columns.map(c=>[c.id,c]));
 const m=new Map();
 for(const [source,items] of [['D-1',cut.inherited],['D-7',cut.d7Inherited||[]]]){
  for(const t of items){
   assert(['vt2','vt3','vt4'].includes(t.kind));
   assert.equal(t.cells.length,Number(t.kind.slice(-1)));
   const col=cols.get(t.sourceId);assert(col,'Ruta no disponible');
   const val=t.cells.map(x=>{const [r,s]=x.split(':').map(Number);return col.values[r]?.[s]||''}).join('');
   assert(/^\d{2,4}$/.test(val)&&val.length===t.cells.length);
   for(let i=0;i<t.cells.length;i++){
    const [r,c]=t.cells[i].split(':').map(Number);
    assert(Number.isInteger(r)&&r>=0&&r<6&&(c===0||c===1));
    assert(t.cells.indexOf(t.cells[i])===i);
    if(i){const [pr,pc]=t.cells[i-1].split(':').map(Number);
     assert(Math.max(Math.abs(r-pr),Math.abs(c-pc))===1);}
   }
   const key=id(t);
   if(!m.has(key))m.set(key,{id:key,kind:t.kind,sourceId:t.sourceId,
    cells:[...t.cells],direct:val,inverse:rev(val).join(''),heads:[],historicSources:[]});
   const item=m.get(key),label=source+' | '+t.turn+' | '+t.jurisdiction+' | '+t.fullHead;
   if(!item.heads.includes(label))item.heads.push(label);
   if(!item.historicSources.includes(source))item.historicSources.push(source);
  }
 }
 return m;
}
const goodText=x=>typeof x==='string'&&x.trim().length>=16;
function check(record,cut){
 assert.equal(record.protocol,'CUADERNO_OCULAR_COMPARATIVO_V1');
 assert.equal(record.trial,'REPLAY_HISTORICO_NO_PROSPECTIVO');
 assert.equal(record.date,cut.date);
 assert.equal(record.target,cut.target);
 assert.equal(record.priorDate,cut.priorDate);
 assert.equal(record.d7Date,cut.d7Date||null);
 assert.deepEqual(record.availableSources,cut.columns.map(c=>c.id));
 assert.equal(record.sourceDigest,sha(cut),'El tablero/corte fuente fue cambiado');
 assert.equal(record.hasTargetResult,false,'El registro no debe contener resultado objetivo');
 assert(['HIPOTESIS_VISUAL','OBSERVAR_NO_JUGAR'].includes(record.mode));
 assert(Array.isArray(record.candidates));
 const all=index(cut);
 if(record.mode==='OBSERVAR_NO_JUGAR'){
  assert.equal(record.candidates.length,0,'Abstención exige cero números');
  assert(goodText(record.abstentionReason),'Justificar la abstención');
 }else{
  assert(record.candidates.length>=1&&record.candidates.length<=3);
  assert(record.abstentionReason===null);
  const used=new Set();
  for(const selected of record.candidates){
   const p=all.get(selected.pathId);
   assert(p,'Huella no marcada en una hoja histórica');
   assert(!used.has(p.id),'Doble figura o inversión contada como figura independiente');
   used.add(p.id);
   assert(['directa','inversa'].includes(selected.direction));
   const reversed=selected.direction==='inversa';
   assert.equal(selected.kind,p.kind);
   assert.equal(selected.sourceId,p.sourceId);
   assert.deepEqual(selected.cells,reversed?rev(p.cells):p.cells);
   assert.equal(selected.value,reversed?p.inverse:p.direct);
   assert.equal(selected.otherReading,reversed?p.direct:p.inverse);
   assert.deepEqual(selected.historicHeads,p.heads);
   assert.deepEqual(selected.historicSources,p.historicSources);
   assert(goodText(selected.reason),'Explicar la selección visual');
   assert(goodText(selected.rivalReason),'Explicar por qué otra figura no fue elegida');
   assert(selected.rivalPathId!==selected.pathId,'Misma figura no puede ser rival');
   if(selected.rivalPathId==='SIN_ALTERNATIVA_VISIBLE')
    assert.equal(all.size,1,'No puede decir que no hay rivales si los hay');
   else assert(all.has(selected.rivalPathId),'Rival inexistente en tablero visible');
  }
 }
 return {date:record.date,target:record.target,decision:record.mode,
  pathsCompared:all.size,decisions:record.candidates.length,
  sourceDigest:record.sourceDigest,
  chronology:'NO_CERTIFICADA_POR_ARCHIVO_LOCAL'};
}
function tests(){
 const t=(head,cells)=>({kind:'vt2',sourceId:'prevNocturno',cells,turn:'Previa',
  jurisdiction:'Ciudad',fullHead:head,value:'99'});
 const cut={date:'2026-09-24',target:'Previa',priorDate:'2026-09-23',
  d7Date:null,columns:[{id:'prevNocturno',values:['12','34','56','78','90','12']}],
  inherited:[t('1234',['1:0','2:0']),t('9990',['3:0','4:0'])],d7Inherited:[]};
 const m=index(cut),arr=[...m.values()],p=arr[0],r=arr[1];
 const record={protocol:'CUADERNO_OCULAR_COMPARATIVO_V1',
  trial:'REPLAY_HISTORICO_NO_PROSPECTIVO',date:cut.date,target:cut.target,
  priorDate:cut.priorDate,d7Date:null,
  availableSources:['prevNocturno'],sourceDigest:sha(cut),
  hasTargetResult:false,mode:'HIPOTESIS_VISUAL',abstentionReason:null,
  candidates:[{pathId:p.id,kind:p.kind,sourceId:p.sourceId,
   cells:[...p.cells].reverse(),direction:'inversa',value:p.inverse,otherReading:p.direct,
   historicHeads:p.heads,historicSources:p.historicSources,
   rivalPathId:r.id,reason:'Este dibujo parece diferente al otro.',
   rivalReason:'La segunda huella no conserva el giro previo.'}]};
 assert.equal(check(record,cut).decisions,1);
 assert.throws(()=>check({...record,sourceDigest:'fake'},cut));
 assert.throws(()=>check({...record,candidates:[{...record.candidates[0],value:'00'}]},cut));
 assert.throws(()=>check({...record,candidates:[{...record.candidates[0],rivalPathId:p.id}]},cut));
 assert.throws(()=>check({...record,candidates:[record.candidates[0],record.candidates[0]]},cut));
 assert.equal(check({...record,mode:'OBSERVAR_NO_JUGAR',candidates:[],
  abstentionReason:'No se puede distinguir entre las figuras que aparecen.'},cut).decisions,0);
 console.log('TEST_CUADERNO_VALIDACION_OK hash fuente, inversión, cabezas, rival, no duplicar, abstención');
}
function main(){
 tests();if(argv['test-only']==='true')return;
 assert(argv.record&&argv.cut,
  'Uso: node scripts/check-cuaderno-ocular.cjs --record=archivo.json --cut=YYYY-MM-DD-ANTES-Turno.json');
 const cut=JSON.parse(fs.readFileSync(path.resolve(argv.cut),'utf8'));
 const record=JSON.parse(fs.readFileSync(path.resolve(argv.record),'utf8'));
 const r=check(record,cut);
 console.log('CUADERNO_VERIFICADO '+JSON.stringify(r));
 console.log('ADVERTENCIA: verifica integridad de datos y geometría, no hora real previa al sorteo.');
}
if(require.main===module)main();
module.exports={check,sha,index};
