#!/usr/bin/env node
// Modelo Papá — verificadores de un paquete experimental externo; NO motor oficial.
// Uso: node scripts/verificar-observatorio-discrepancias-115.cjs RUTA_ZIP_EXTRAIDO
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||'');
assert(process.argv[2],'Se exige ruta de carpeta con ZIP extraído');
const required=['estudio_observatorio.py','verificar.py','generar_visores.py',
 'VT2_RANKING_PRE_ORIGINAL.json','VT3_MADRES_PRE_CORREGIDO.json',
 'OBJETIVOS_POST.json','OBSERVATORIO_PRE.json','OBSERVATORIO_POST.json'];
for(const p of required)assert(fs.statSync(path.join(root,p)).isFile(),'Falta '+p);
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const expected='83a5721f84f9b6abfd3cedd26db5900a620ef4c1e9fa11418b134a96d1e10109';
assert.equal(hash('OBSERVATORIO_PRE.json'),expected,'PRE original diferente');
const python=process.env.PYTHON_BIN||'python';
for(const args of [['estudio_observatorio.py','pre'],['estudio_observatorio.py','post'],['verificar.py'],['generar_visores.py']]){
 const x=cp.spawnSync(python,args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
 if(x.status!==0)throw Error('Falló '+args.join(' ')+'\n'+x.stdout+'\n'+x.stderr);
 process.stdout.write(x.stdout);
}
assert.equal(hash('OBSERVATORIO_PRE.json'),expected,'PRE mutó');
const rows=JSON.parse(fs.readFileSync(path.join(root,'OBSERVATORIO_POST.json'),'utf8')).rows;
assert.equal(rows.length,115);assert.equal(rows.reduce((a,r)=>a+r.hitD7,0),33);
assert.equal(rows.reduce((a,r)=>a+r.hitV9,0),36);
const categories={};
for(const r of rows)categories[r.winnerClass]=(categories[r.winnerClass]||0)+1;
assert.deepEqual(categories,{ninguno:67,ambos:21,solo_V9:15,solo_D7:12});
console.log('OBSERVATORIO_EXPERIMENTAL_REPRODUCIDO_OK',JSON.stringify(categories));
