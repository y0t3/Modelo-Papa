import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';

const base='auditorias/cotejo-14oct-vt234-15oct2026/';
const sealed=JSON.parse(readFileSync(base+'DIAGNOSTICO_POST_5_TURNOS.json','utf8'));
const targets=JSON.parse(readFileSync(base+'RESULTADOS_14OCT_VERIFICADOS.json','utf8'));
const past=JSON.parse(gunzipSync(Buffer.from(readFileSync('fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64','utf8').trim(),'base64')).toString('utf8'));
const p13=JSON.parse(readFileSync('auditorias/vt3-cotejo-nocturna-13oct2026/OBJETIVOS_POST_13OCT.json','utf8'));
const p12=[
 ['7447','0334','5276','4616','2403','----'],
 ['3825','9554','3107','2696','7634','----'],
 ['2436','3489','1099','8362','2400','----'],
 ['2716','3433','4801','4903','3245','----'],
 ['9851','1615','7242','8290','3264','----']
];
past['2026-12-12']=undefined;
past['2026-10-12']=p12;
past['2026-10-13']=Object.values(p13.turns).map(x=>[...x,'----']);
const jurs=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const runtime='resultados/runtime-madres-14oct/';
const loadTS=(name,text)=>{
 const loc=resolve(runtime,name+'.mjs');mkdirSync(dirname(loc),{recursive:true});
 writeFileSync(loc,stripTypeScriptTypes(text).replace(/from '(\.{1,2}\/[^']+)'/g,(_,p)=>"from '"+p+".mjs'"));
};
for(const k of ['domain','dates','paths','sheet'])loadTS(k,readFileSync('src/'+k+'.ts','utf8'));
const motorSource=readFileSync('src/motorLalo.ts','utf8');
assert.ok(motorSource.includes('const selectedMothers=vt3.slice(0,10);'));
for(const cap of [10,20,999])loadTS('motor'+cap,motorSource.replace('const selectedMothers=vt3.slice(0,10);',
 'const selectedMothers=vt3.slice(0,'+cap+');'));
const imp=async x=>import(pathToFileURL(resolve(runtime,x+'.mjs')).href);
const {TURNOS,diaVacio}=await imp('domain');
const {buildSheet}=await imp('sheet');
const {findPaths}=await imp('paths');
const modules=Object.fromEntries(await Promise.all([10,20,999].map(async x=>[x,await imp('motor'+x)])));
function day(a){
 const result=diaVacio();
 for(let i=0;i<5;i++)for(let j=0;j<6;j++){
  const value=a?.[i]?.[j]||'----';
  assert.match(value,/^(----|\d{4})$/);
  result[TURNOS[i]][jurs[j]]=value;
 }
 return result;
}
const draw=d=>day(past[d]);
const pastViews=[
 {date:'2026-10-13',period:'D−1',sheet:buildSheet(draw('2026-10-13'),draw('2026-10-12'))},
 {date:'2026-10-07',period:'D−7',sheet:buildSheet(draw('2026-10-07'),draw('2026-10-06'))}
];
const real=day(TURNOS.map(t=>targets.turns[t]));
const rows=[];
for(let i=0;i<5;i++){
 const target=TURNOS[i],known=diaVacio();
 for(let k=0;k<i;k++)for(const jur of jurs)known[TURNOS[k]][jur]=real[TURNOS[k]][jur];
 const sheet=buildSheet(known,draw('2026-10-13'));
 assert.equal(sheet.heads[target].length,0);
 const results={},targetHeads=jurs.slice(0,5).map(j=>real[target][j]).filter(h=>/^\d{4}$/.test(h));
 const children={};
 for(const cap of [10,20,999]){
  const view=modules[cap].buildMotorLalo(sheet,'2026-10-14',target,pastViews);
  const ranked=view.ranks.vt4;
  const hits=targetHeads.map(head=>{
   const rankedPos=ranked.findIndex(f=>f.paths.some(p=>p.value===head));
   const candidate=rankedPos<0?null:ranked[rankedPos];
   return {head,rank:rankedPos>=0?rankedPos+1:null,
    motherRank:candidate?.parentFamilies.map(m=>({mother:m,rank:view.ranks.vt3.find(x=>x.family===m)?.rank})),
    sources:candidate?[...new Set(candidate.paths.filter(p=>p.value===head).map(p=>p.sourceId))]:[]
   };
  });
  children[cap]={totalVt4Families:ranked.length,
   vt3Ranks:view.ranks.vt3.map(x=>x.family),
   vt4Top10:ranked.slice(0,10).map(x=>x.family),hits};
 }
 assert.deepEqual(children[10].vt3Ranks,children[20].vt3Ranks,'Cambiar cupo madres no afecta VT3');
 assert.deepEqual(children[10].vt3Ranks,children[999].vt3Ranks);
 assert.deepEqual(children[10].vt4Top10,children[20].vt4Top10,
  'Cupo ampliado no permite afirmar mejora Top10 con estos criterios');
 const eligible=targetHeads.map(head=>({head,
  physical:sheet.columns.slice(0,i+1).some(col=>findPaths(col.values,head).length>0),
  limit10:children[10].hits.find(x=>x.head===head).rank,
  limit20:children[20].hits.find(x=>x.head===head).rank,
  unlimited:children[999].hits.find(x=>x.head===head).rank}));
 let trace1736;
 if(target==='Vespertino'){
  const full=modules[999].buildMotorLalo(sheet,'2026-10-14',target,pastViews);
  const coord=p=>p.map(c=>c.row+':'+c.col).join('>');
  const rev=s=>s.split('>').reverse().join('>');
  const canonical=s=>[s,rev(s)].sort()[0];
  const revNumber=s=>s.split('').reverse().join('');
  const matchFamily=s=>[s,revNumber(s)].sort().join('/');
  const physical4=sheet.columns.slice(0,i+1).flatMap(col=>
   findPaths(col.values,'1736').map(path=>{
    const segments=[{side:'prefijo',part:path.slice(0,3)},{side:'sufijo',part:path.slice(1,4)}];
    return {source:col.id,cells:coord(path),segments:segments.map(a=>{
     const val=a.part.map(c=>c.digit).join(''),fam=matchFamily(val);
     const f=full.ranks.vt3.find(z=>z.family===fam);
     const witnesses=(f?.paths||[]).filter(q=>q.sourceId===col.id);
     const matching=witnesses.filter(q=>canonical(coord(q.path))===canonical(coord(a.part)));
     return {side:a.side,reading:val,family:fam,
      motherRank:f?.rank||null,
      sameSourceWitnesses:witnesses.length,
      exactPhysicalMotherWitnesses:matching.length,
      witnessExamples:witnesses.slice(0,5).map(q=>coord(q.path))};
    })};
   }));
  trace1736={physicalPaths:physical4};
 }
 rows.push({turn:target,availableSources:i+1,eligible,
  sizes:{cap10:children[10].totalVt4Families,cap20:children[20].totalVt4Families,all:children[999].totalVt4Families},
  top10SameAsBaseline:true,trace1736});
}
const main=rows.find(x=>x.turn==='Vespertino');
const target1736=main?.eligible.find(x=>x.head==='1736');
assert.ok(target1736?.physical,'La cuaterna 1736 es físicamente posible en Vespertina');
assert.equal(target1736.limit10,null,'El Top10 de madres no admite la cuaterna 1736');
const report={date:'2026-10-14',phase:'ABLACION_POSTHOC_CUPO_MADRES_VT4_10_20_TODAS',
 note:'Solo diagnóstico retrospectivo, no cambia main ni constituye validación prospectiva; PRE originales preservados.',
 result1736:target1736,rows};
writeFileSync(base+'ABLACION_CUPO_MADRES_VT4_14OCT.json',JSON.stringify(report,null,2)+'\n');
console.log('ABLACION_14OCT_VT4_OK',JSON.stringify({case1736:target1736,turns:rows.map(x=>({turn:x.turn,sizes:x.sizes,children:x.eligible.filter(z=>z.physical)}))},null,2));
