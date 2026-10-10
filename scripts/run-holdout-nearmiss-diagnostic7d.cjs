// Diagnóstico POST-HOLDOUT (SIN resultados): condiciones que faltaron.
// NO altera decisiones ya congeladas ni transforma figuras en candidaturas.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const argv=Object.fromEntries(process.argv.slice(2).filter(s=>s.startsWith('--')&&s.includes('='))
 .map(s=>s.slice(2).split(/=(.*)/s).slice(0,2)));
const input=path.resolve(root,argv.input||'out/holdout-ciego-16-23');
const output=path.resolve(root,argv.out||'out/holdout-diagnostico-sin-resultados');
const uniq=x=>[...new Set(x)];
function diagnose(cut){
 assert.equal(cut.target,'Matutino');
 const stages={withTwoHeads:[],withTwoShapes:[],twoTouchedShapes:[],
  withTwoTouchedHeads:[],candidatePairs:[],nearMiss:[]};
 for(const f of cut.families.filter(x=>x.kind==='vt3')){
  const heads=uniq(f.paths.map(p=>p.originHead));
  const shapes=uniq(f.paths.map(p=>p.shape));
  const touched=f.paths.filter(p=>p.matchesKnownFirst.length);
  const touchedShapes=uniq(touched.map(p=>p.shape));
  const touchedHeads=uniq(touched.map(p=>p.originHead));
  const summary={id:f.id,readings:f.readings,heads:heads.length,
   physicalShapes:shapes.length,touchedPhysicalShapes:touchedShapes.length,
   touchedHeads:touchedHeads.length,firstContactHeads:uniq(touched.flatMap(
    p=>p.matchesKnownFirst.map(k=>k.head))),
   touches:touched.length};
  if(heads.length>=2)stages.withTwoHeads.push(summary);
  if(heads.length>=2&&shapes.length>=2)stages.withTwoShapes.push(summary);
  if(heads.length>=2&&shapes.length>=2&&touchedShapes.length>=2)stages.twoTouchedShapes.push(summary);
  if(heads.length>=2&&shapes.length>=2&&touchedHeads.length>=2)
   stages.withTwoTouchedHeads.push(summary);
  if(f.meetsFrozenVT3Rule)stages.candidatePairs.push(summary);
  if(heads.length>=2||shapes.length>=2||touchedShapes.length>=2)
   stages.nearMiss.push({...summary,reason:heads.length<2?'SOLO_UNA_CABEZA':
    shapes.length<2?'UNA_SOLa_FORMA':
    touchedShapes.length<2?'NO_HAY_DOS_FORMAS_TOCADAS':
    touchedHeads.length<2?'NO_HAY_DOS_CABEZAS_TOCADAS':
    'NO_EXISTE_PAREJA_VALIDADA_MISMO_ORIGEN'});
 }
 return {date:cut.date,category:cut.category,
  vt2Count:cut.families.filter(f=>f.kind==='vt2').length,
  vt3Count:cut.families.filter(f=>f.kind==='vt3').length,
  vt4Count:cut.families.filter(f=>f.kind==='vt4').length,
  status:cut.status,eligible:cut.eligibleFamilyIds,
  stages};
}
function main(){
 const registry=JSON.parse(fs.readFileSync(path.join(input,'REGISTRO_CIEGO_PREVIO.json'),'utf8'));
 const records=registry.map(row=>{
  const c=JSON.parse(fs.readFileSync(path.join(input,row.date+'-ANTES-Matutino.json'),'utf8'));
  assert.deepEqual(c.eligibleFamilyIds,row.eligibleFamilyIds,
   'No modificar la precalificación congelada');
  const result=diagnose(c);
  assert.equal(result.stages.candidatePairs.length,row.eligibleFamilyIds.length);
  return result;
 });
 fs.mkdirSync(output,{recursive:true});
 const lines=['# Diagnóstico secundario: ¿qué condiciones faltaron?','',
  'Esta auditoría se diseñó DESPUÉS de obtener el resultado del contraste',
  'ciego externo. No se cambió la definición congelada, ni se derivan pronósticos.',
  'Se usan sólo los expedientes ciegos ya publicados: ninguna cabeza',
  'del turno objetivo entra en este diagnóstico.','',
  '| Fecha | VT2 | VT3 | VT4 | VT3 con ≥2 cabezas | De éstas ≥2 dibujos | De éstas ≥2 dibujos tocados por Primera | Pares válidos |',
  '|---|---:|---:|---:|---:|---:|---:|---:|'];
 for(const r of records){
  const a=r.stages;
  lines.push('| '+r.date+' | '+r.vt2Count+' | '+r.vt3Count+' | '+r.vt4Count+
   ' | '+a.withTwoHeads.length+' | '+a.withTwoShapes.length+
   ' | '+a.twoTouchedShapes.length+' | '+a.candidatePairs.length+' |');
  console.log('DIAGNOSTICO_CIEGO '+r.date+' '+JSON.stringify({
   vt3:r.vt3Count,twoHeads:a.withTwoHeads.length,
   twoShapes:a.withTwoShapes.length,twoTouchedShapes:a.twoTouchedShapes.length,
   twoTouchedHeads:a.withTwoTouchedHeads.length,
   frozenEligible:a.candidatePairs.length}));
 }
 lines.push('','## Familias cercanas al criterio, incluso las negativas','');
 for(const r of records){
  lines.push('### '+r.date+' · '+r.category,'');
  const a=r.stages.nearMiss;
  if(!a.length)lines.push('Sin familias VT3 de múltiple cabeza/forma/contacto.','');
  for(const v of a)lines.push('- '+v.id+' lecturas '+v.readings.join('/')+
   ' · cabezas='+v.heads+' · dibujos='+v.physicalShapes+
   ' · dibujos tocados='+v.touchedPhysicalShapes+
   ' · cabezas tocadas='+v.touchedHeads+
   ' · falta='+v.reason);
  lines.push('');
 }
 lines.push('## Límite metodológico','',
  'No se promueve retrospectivamente ninguna condición más blanda.',
  'Si se estudiara otra hipótesis, necesitaría un NUEVO protocolo',
  'con fechas futuras de comprobación y los casos negativos completos.',
  'El 23/09 está solapado con el período original y nunca se incluye',
  'en el balance externo.','');
 fs.writeFileSync(path.join(output,'DIAGNOSTICO_NO_CAMBIA_REGLA.md'),lines.join('\n'));
 fs.writeFileSync(path.join(output,'DIAGNOSTICO_NO_CAMBIA_REGLA.json'),JSON.stringify(records,null,2));
 console.log('DIAGNOSTICO_HOLDOUT_FIN '+records.length+' cortes, criterios congelados conservados');
}
main();
