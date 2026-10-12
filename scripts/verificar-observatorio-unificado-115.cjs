#!/usr/bin/env node
// Observatorio experimental Modelo Papá: VT2/V9 + VT3 + hijas VT4.
// Se ejecuta sobre el ZIP de laboratorio EXTRAÍDO, fuera del motor oficial.
// Uso: node scripts/verificar-observatorio-unificado-115.cjs /ruta/a/zip-extraido
const fs=require('node:fs');
const cp=require('node:child_process');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
assert(process.argv[2],'Indicar carpeta que contiene el laboratorio extraído');
const root=path.resolve(process.argv[2]);
const expected={
 'UNIFICADO_PRE.json':'337c9ad152fbd842356e255746f2c339ac40a1deaf3c8d90fc29a4beb16f96ca',
 'UNIFICADO_POST.json':'b9edb369f7da84ae194947e2951109100e010e7058b11e8b93238e75f9323985'
};
for(const file of ['integrar.py','verificar.py','generar_visores.py',
 'GENEALOGIA_PRE_ORIGINAL.json','VT2_OBSERVATORIO_PRE_ORIGINAL.json',
 'VT2_HISTORIA_PRE_ORIGINAL.json','RESULTADOS_POST_ORIGINAL.json',
 'UNIFICADO_PRE.json','UNIFICADO_POST.json']){
 assert(fs.statSync(path.join(root,file)).isFile(),'Falta '+file);
}
function sha(file){return crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')}
for(const [f,d] of Object.entries(expected))assert.equal(sha(f),d,'Hash del archivo original alterado '+f);
const py=process.env.PYTHON_BIN||'python3';
for(const args of [['integrar.py','pre'],['integrar.py','post'],['verificar.py']]){
 const r=cp.spawnSync(py,args,{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024});
 if(r.status!==0)throw Error(args.join(' ')+' fallo\n'+r.stdout+'\n'+r.stderr);
 process.stdout.write(r.stdout);
}
for(const [f,d] of Object.entries(expected))assert.equal(sha(f),d,'No se reprodujo '+f);
const pre=JSON.parse(fs.readFileSync(path.join(root,'UNIFICADO_PRE.json'),'utf8'));
const post=JSON.parse(fs.readFileSync(path.join(root,'UNIFICADO_POST.json'),'utf8'));
assert.equal(pre.rows.length,115);
assert.equal(pre.stats.physicalPathRecords,22653);
assert.equal(pre.stats.daughtersWithV9Border,1162);
assert.equal(post.counts.matchedPhysicalDaughters,6);
assert.equal(post.counts.matchedPhysicalAndV9Border,1);
const a=pre.rows.find(r=>r.date==='2026-09-19'&&r.turn==='Nocturno');
const g=a.mothers.find(m=>m.mother==='109').groups.find(x=>x.digit==='4');
assert.deepEqual(g.daughters.map(x=>[x.oriented,x.hasEarlierV9Border]),[['4109',false],['4901',true]]);
console.log('OBSERVATORIO_UNIFICADO_REPRODUCIDO_OK; prueba de propiedad V9 por hija aprobada');
