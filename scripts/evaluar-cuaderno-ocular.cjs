// Modelo Papá — cotejo DESPUÉS de registrar una decisión manual.
// Compara SOLO el sentido previamente elegido, nunca "cualquiera de ambos".
// Siempre usa el mismo rótulo retrospectivo salvo prueba externa verificable
// del momento real de registro, que este programa no puede certificar.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {check,sha,index}=require('./check-cuaderno-ocular.cjs');
const JURS=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const args=Object.fromEntries(process.argv.slice(2).filter(s=>s.startsWith('--')&&s.includes('=')).map(s=>s.slice(2).split(/=(.*)/s).slice(0,2)));
function evaluate(cut,record,results){
 const validated=check(record,cut);
 assert.equal(results.date,cut.date,'Resultados de otra jornada');
 assert.equal(results.target,cut.target,'Resultados de otro turno');
 assert(results.heads&&typeof results.heads==='object');
 const heads=JURS.map(j=>({jurisdiction:j,head:results.heads[j]||'----'}));
 const available=heads.filter(h=>/^\d{4}$/.test(h.head));
 assert.equal(available.length,heads.filter(h=>/^\d{4}$/.test(h.head)).length);
 const complete=available.length===JURS.length;
 const records=record.candidates.map(p=>{
  const k=Number(p.kind.slice(-1));
  const matches=available.filter(h=>h.head.slice(-k)===p.value).map(h=>({
   jurisdiction:h.jurisdiction,fullHead:h.head,suffix:h.head.slice(-k)}));
  const opposite=available.filter(h=>h.head.slice(-k)===p.otherReading).map(h=>({
   jurisdiction:h.jurisdiction,fullHead:h.head,suffix:h.head.slice(-k)}));
  return {pathId:p.pathId,sourceId:p.sourceId,kind:p.kind,selectedOrientation:p.direction,
   selectedValue:p.value,otherOrientationValue:p.otherReading,
   selectedMatches:matches,oppositeMatchesNotCounted:opposite,
   state:matches.length?'COINCIDENCIA_RETROSPECTIVA_EN_SENTIDO_ELEGIDO':
    complete?'NO_COINCIDE_EN_SEIS_CABEZAS':'INDETERMINADO_COBERTURA_PARCIAL',
   rivalPathId:p.rivalPathId,
   comparisonNote:'El rival no tuvo orientación numérica fijada y no cuenta como apuesta contrafactual.'};
 });
 return {protocol:'CUADERNO_OCULAR_COTEJO_POST_V1',
  date:cut.date,target:cut.target,mode:record.mode,
  fullHeads:heads,availableHeads:available.length,
  cutDigest:sha(cut),registration:validated,
  candidates:records,abstention:record.mode==='OBSERVAR_NO_JUGAR',
  chronology:'HISTORICO_SIN_CERTIFICACION_DE_ANTERIORIDAD',
  disclaimer:'El registro local y la coincidencia con el corte NO prueban que la decisión se haya tomado antes del sorteo real.'};
}
function tests(){
 const pathA=(head,cells)=>({kind:'vt2',sourceId:'prevNocturno',cells,turn:'Previa',jurisdiction:'Ciudad',fullHead:head,value:'12'});
 const cut={date:'2026-09-24',target:'Previa',priorDate:'2026-09-23',d7Date:null,
  columns:[{id:'prevNocturno',values:['12','34','56','78','90','12']}],
  inherited:[pathA('1234',['1:0','2:0']),pathA('7890',['3:0','4:0'])],d7Inherited:[]};
 const entries=[...index(cut).values()],p=entries[0],r=entries[1];
 const rec={protocol:'CUADERNO_OCULAR_COMPARATIVO_V1',
  trial:'REPLAY_HISTORICO_NO_PROSPECTIVO',
  date:cut.date,target:cut.target,priorDate:cut.priorDate,d7Date:null,
  availableSources:['prevNocturno'],sourceDigest:sha(cut),hasTargetResult:false,
  mode:'HIPOTESIS_VISUAL',abstentionReason:null,
  candidates:[{pathId:p.id,sourceId:p.sourceId,kind:p.kind,cells:p.cells,
   direction:'directa',value:p.direct,otherReading:p.inverse,
   historicHeads:p.heads,historicSources:p.historicSources,
   rivalPathId:r.id,reason:'El trazo presenta una forma más reconocible.',
   rivalReason:'El rival también es posible, pero resulta distinto.'}]};
 const first={date:cut.date,target:cut.target,heads:{Ciudad:'000'+p.inverse,
  Provincia:'9999',Córdoba:'9999','Santa Fé':'9999','Entre Ríos':'9999',Montevideo:'9999'}};
 // Four-digit heads: one leading zero/two-digit suffix as required.
 first.heads.Ciudad='00'+p.inverse;
 const inv=evaluate(cut,rec,first);
 assert.equal(inv.candidates[0].selectedMatches.length,0,
  'No convertir el éxito de la inversión NO elegida en acierto');
 assert.equal(inv.candidates[0].oppositeMatchesNotCounted.length,1);
 assert.equal(inv.candidates[0].state,'NO_COINCIDE_EN_SEIS_CABEZAS');
 const direct=evaluate(cut,rec,{...first,heads:{...first.heads,Ciudad:'00'+p.direct}});
 assert.equal(direct.candidates[0].selectedMatches.length,1);
 assert.equal(direct.candidates[0].state,'COINCIDENCIA_RETROSPECTIVA_EN_SENTIDO_ELEGIDO');
 const missing=evaluate(cut,rec,{...first,heads:{...first.heads,Ciudad:'----'}});
 assert.equal(missing.candidates[0].state,'INDETERMINADO_COBERTURA_PARCIAL');
 const abst=evaluate(cut,{...rec,mode:'OBSERVAR_NO_JUGAR',candidates:[],
  abstentionReason:'No hay una ventaja de una figura sobre las demás.'},first);
 assert.equal(abst.abstention,true);assert.equal(abst.candidates.length,0);
 assert.throws(()=>evaluate(cut,rec,{...first,date:'2026-09-25'}));
 console.log('TEST_COTEJO_POST_OK orientación elegida distinta de la inversa, abstención, cobertura y día');
}
function main(){
 tests();if(args['test-only']==='true')return;
 assert(args.cut&&args.record&&args.results,
  'Uso: node scripts/evaluar-cuaderno-ocular.cjs --cut=CORTE.json --record=CUADERNO.json --results=RESULTADOS.json');
 // Validation of human note takes place BEFORE the results file is read.
 const cut=JSON.parse(fs.readFileSync(path.resolve(args.cut),'utf8'));
 const record=JSON.parse(fs.readFileSync(path.resolve(args.record),'utf8'));
 check(record,cut);
 const results=JSON.parse(fs.readFileSync(path.resolve(args.results),'utf8'));
 const report=evaluate(cut,record,results);
 const text=JSON.stringify(report,null,2);
 if(args.out){fs.writeFileSync(path.resolve(args.out),text);console.log('REPORTE_POST_GUARDADO '+args.out);}
 else console.log(text);
 console.log('ADVERTENCIA: cotejo histórico; no certifica que la decisión precediera al sorteo.');
}
if(require.main===module)main();
module.exports={evaluate};
