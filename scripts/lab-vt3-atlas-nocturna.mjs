import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const dir='auditorias/vt3-transiciones-individuales-115-13oct2026/';
const source='auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/NOCTURNA_SIMULACION.json';
const original='auditorias/vt3-nocturna-12oct2026/NOCTURNA_PRE_SELLADO.json';
const template='scripts/atlas-vt3-transiciones-template.html';
const date='2026-10-12';
const sha=s=>createHash('sha256').update(s).digest('hex');
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sealed=json(original),pre=json(dir+'NOCTURNA_PRE.json'),
      raw=json(source).row,post=json(dir+'NOCTURNA_POST.json');
assert.equal(sealed.date,date);
assert.equal(pre.date,date);
assert.equal(raw.date,date);
assert.equal(pre.turn,'Nocturno');
assert.equal(sealed.sourceColumns.length,5);
assert.equal(post.heads.length,5);
const declaredCols=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
assert.deepEqual(sealed.sourceColumns.map(x=>x.id),declaredCols);
for(const c of sealed.sourceColumns){
 assert.equal(c.values.length,6);
 assert.ok(c.values.every(v=>/^\d{2}$/.test(v)||v==='--'));
}
const dataPaths=new Map(raw.witnesses.map(x=>[x.family,x.paths]));
assert.equal(dataPaths.size,raw.witnesses.length);
const profileMap=new Map(pre.profiles.map(x=>[x.family,x]));
assert.equal(profileMap.size,dataPaths.size);
const heads=post.heads.map(x=>x.slice(-3));
const winning=new Set(post.heads.map(h=>{const f=h.slice(-3),r=[...f].reverse().join('');return [f,r].sort().join('/')}));
const focus=['158/851','516/615','242/242'];
assert.ok(focus.every(x=>winning.has(x)&&dataPaths.has(x)));
const negativeExamples=[],peers={};
for(const f of focus){
 const target=profileMap.get(f);
 const choices=pre.profiles.filter(p=>p.family!==f&&!winning.has(p.family)&&dataPaths.has(p.family));
 choices.sort((a,b)=>{
  const as=Number(a.stratum===target.stratum)*100+Number(a.state===target.state)*25+
   Number(a.anchored===target.anchored)*15+Number(a.firstSource===target.firstSource)*5-
   Math.abs(a.blockCount-target.blockCount)*3-Math.abs(a.ageTurns-target.ageTurns);
  const bs=Number(b.stratum===target.stratum)*100+Number(b.state===target.state)*25+
   Number(b.anchored===target.anchored)*15+Number(b.firstSource===target.firstSource)*5-
   Math.abs(b.blockCount-target.blockCount)*3-Math.abs(b.ageTurns-target.ageTurns);
  return bs-as||a.family.localeCompare(b.family);
 });
 const selected=choices.slice(0,3).map(p=>p.family);
 assert.equal(selected.length,3);
 peers[f]=selected;
 negativeExamples.push(...selected);
}
const families=Object.fromEntries(raw.witnesses.map(w=>[w.family,{
 paths:w.paths.map(p=>({source:p.source,cells:p.cells,value:p.value,anchored:p.anchored,rootIds:p.rootIds}))
}]));
const profiles=Object.fromEntries(pre.profiles.map(p=>[p.family,p]));
for(const [f,paths] of Object.entries(families)){
 const current=profiles[f];assert.ok(current);
 assert.equal(current.pathCount,paths.paths.length);
 for(const p of paths.paths){
  assert.ok(declaredCols.includes(p.source));assert.equal(p.cells.length,3);
  if(!p.anchored)assert.equal(p.rootIds.length,0);
 }
}
const data={date,columns:sealed.sourceColumns,focus,
 negativeExamples:[...new Set(negativeExamples)],peers,
 families,profiles,
 sourceHashes:{sealedNocturna:sha(read(original)),pre:sha(read(dir+'NOCTURNA_PRE.json')),
  physicalWitnesses:sha(read(source)),post:sha(read(dir+'NOCTURNA_POST.json'))}};
const tpl=read(template);
assert.equal(tpl.split('__INLINE_DATA_JSON__').length,2);
const escaped=JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
const html=tpl.replace('__INLINE_DATA_JSON__',escaped);
assert.ok(html.includes('"158/851"')&&html.includes('Nocturna del 12/10/2026'));
assert.ok(!html.includes('__INLINE_DATA_JSON__'));
const out=dir+'ATLAS_NOCTURNA_12OCT_POST.html';
writeFileSync(out,html);
writeFileSync(dir+'ATLAS_MANIFIESTO.json',JSON.stringify({
 date:'2026-10-13',status:'DIAGNOSTICO_POST',
 file:out,htmlSha256:sha(html),bytes:Buffer.byteLength(html),
 focus,matchedNegativePeers:peers,physicalFamilyCount:Object.keys(families).length,
 totalPhysicalPaths:Object.values(families).reduce((s,v)=>s+v.paths.length,0),
 sourceHashes:data.sourceHashes
},null,2)+'\n');
console.log('ATLAS_VT3_OK',JSON.stringify({htmlSha256:sha(html),
 bytes:Buffer.byteLength(html),familyCount:Object.keys(families).length,
 focus,matchedNegativePeers:peers},null,2));