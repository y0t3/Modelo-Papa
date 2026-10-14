import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const ROOT='auditorias/vt3-madres-vt4-cobertura-115-13oct2026/';
const OUT='auditorias/vt3-rangos-exposicion-vt4-115-13oct2026/';
const read=(name)=>readFileSync(ROOT+name,'utf8');
const json=(name)=>JSON.parse(read(name));
const sha=(buf)=>createHash('sha256').update(buf).digest('hex');
const pre=json('PRE_115.json'), map=json('MAPAS_FISICOS_PRE_115.json');
const post=json('POST_115.json'), seal=json('SELLO.json');
assert.equal(sha(read('PRE_115.json')),seal.pre,'PRE seal mismatch');
assert.equal(sha(read('MAPAS_FISICOS_PRE_115.json')),seal.packed,'map seal mismatch');
assert.equal(pre.records.length,115);
assert.equal(post.rows.length,115);
assert.equal(map.cuts,115);
const packed=gunzipSync(Buffer.from(map.data,'base64'));
assert.equal(sha(packed),map.rawSha256,'raw map seal mismatch');
assert.equal(packed.length,115*30000);
const bands=[
 {key:'R1_3',label:'madres #1–#3'},
 {key:'R4_5',label:'madres #4–#5'},
 {key:'R6_10',label:'madres #6–#10'},
 {key:'R11_25',label:'madres #11–#25'},
 {key:'R26_PLUS',label:'madres #26+ con raíz'},
 {key:'FISICA_SIN_RAIZ',label:'física sin raíz materna'},
 {key:'NO_FISICA',label:'sin ruta VT4 física'}
];
const classify=(rank,physical)=>rank<=3?0:rank<=5?1:rank<=10?2:rank<=25?3:
  rank<65535?4:physical?5:6;
const N=bands.length;
const stats=bands.map(b=>({...b,eligibleTotal:0,observedHeads:0,observedCuts:0,
 expectedHeads:0,expectedCuts:0,varianceHeads:0,varianceCuts:0,
 probsHeads:[],probsCuts:[],byMonth:{'2026-09':{obs:0,exp:0,cuts:0},'2026-10':{obs:0,exp:0,cuts:0}}}));
for(let i=0;i<115;i++){
 const a=pre.records[i],r=post.rows[i];
 assert.equal(a.date+'|'+a.turn,r.date+'|'+r.turn,'cut alignment');
 assert.equal(r.heads.length,5,'exactly five drawn heads');
 assert.equal(new Set(r.heads).size,5,'distinct five heads for this benchmark');
 const counts=Array(N).fill(0);
 const off=i*30000;
 for(let num=0;num<10000;num++){
  const rank=packed.readUInt16LE(off+num*2),physical=packed[off+20000+num]!==0;
  assert.ok(rank===65535||physical,'physical route missing for rooted mother');
  counts[classify(rank,physical)]++;
 }
 assert.equal(counts.reduce((sum,v)=>sum+v,0),10000);
 const hits=Array(N).fill(0);
 for(const h of r.heads){
  assert.match(h,/^\d{4}$/);
  const num=Number(h),rank=packed.readUInt16LE(off+num*2);
  hits[classify(rank,packed[off+20000+num]!==0)]++;
 }
 const mo=r.date.slice(0,7);
 for(let j=0;j<N;j++){
  const s=stats[j],p=counts[j]/10000,q=1-Math.pow(1-p,5);
  s.eligibleTotal+=counts[j];
  s.observedHeads+=hits[j];s.observedCuts+=Number(hits[j]>0);
  s.expectedHeads+=5*p;s.expectedCuts+=q;
  s.varianceHeads+=5*p*(1-p);s.varianceCuts+=q*(1-q);
  for(let k=0;k<5;k++)s.probsHeads.push(p);
  s.probsCuts.push(q);
  s.byMonth[mo].obs+=hits[j];s.byMonth[mo].exp+=5*p;s.byMonth[mo].cuts++;
 }
}
assert.equal(stats.reduce((s,x)=>s+x.observedHeads,0),575);
function distribution(probs){
 const out=new Float64Array(probs.length+1);out[0]=1;
 for(let i=0;i<probs.length;i++){
  const p=probs[i];
  for(let k=i+1;k>=0;k--)out[k]=(out[k]||0)*(1-p)+(k?out[k-1]*p:0);
 }
 return out;
}
function pv(probs,k){
 const d=distribution(probs);
 let lower=0,upper=0;
 for(let j=0;j<d.length;j++){
  if(j<=k)lower+=d[j];
  if(j>=k)upper+=d[j];
 }
 return {left:lower,right:upper,twoSided:Math.min(1,2*Math.min(lower,upper))};
}
const result={
 date:'2026-10-13',type:'EXPLORATORIO_POSTHOC',
 cuts:115,drawnHeads:575,groups:stats.map(s=>{
  const headTest=pv(s.probsHeads,s.observedHeads);
  const cutTest=pv(s.probsCuts,s.observedCuts);
  return {key:s.key,label:s.label,
   averageEligibleHeadsPerCut:+(s.eligibleTotal/115).toFixed(2),
   observedHeads:s.observedHeads,expectedHeads:+s.expectedHeads.toFixed(4),
   ratioObsExp:s.expectedHeads>0?+(s.observedHeads/s.expectedHeads).toFixed(3):null,
   stdDevHeads:+Math.sqrt(s.varianceHeads).toFixed(3),
   pHeadsTwoSided:headTest.twoSided,pHeadsBonferroni:Math.min(1,N*headTest.twoSided),
   observedCuts:s.observedCuts,expectedCuts:+s.expectedCuts.toFixed(4),
   pCutsTwoSided:cutTest.twoSided,pCutsBonferroni:Math.min(1,N*cutTest.twoSided),
   byMonth:s.byMonth};
 }),
 checks:{sourcePreHash:seal.pre,mapHash:seal.packed,
 sourceMapDataSHA256:map.rawSha256,completePartition:true,
 note:'Tests retrospectivos; categorías examinadas luego de estudiar esta muestra, p no valida un pronóstico.'}
};
mkdirSync(OUT,{recursive:true});
writeFileSync(OUT+'RESULTADO_115.json',JSON.stringify(result,null,2)+'\n');
const rows=result.groups.map(g=>
 '| '+g.label+' | '+g.averageEligibleHeadsPerCut+' | '+g.observedHeads+' / '+g.expectedHeads+
 ' | '+g.pHeadsTwoSided.toFixed(5)+' | '+g.pHeadsBonferroni.toFixed(5)+
 ' | '+g.observedCuts+' / '+g.expectedCuts+' |').join('\n');
const md='# Control exploratorio de exposición VT3 a VT4 — 115 cortes\n\n'+
'**No se cambiaron los Tops ni la app.** Entradas físicas PRE y mapa verificados por hashes; resultados POST sólo para cotejo.\n\n'+
'| Categoría de mejor madre | Candidatas físicas medias/corte | Cabezas observadas / esperadas | p bilateral | p Bonferroni (7) | Cortes observados / esperados |\n'+
'|---|---:|---:|---:|---:|---:|\n'+rows+'\n\n'+
'Referencia nula de 5 valores uniformes e independientes por corte; distribución Poisson-binomial exacta para exposición variable en los 115 turnos. Las siete clases son disjuntas: se atribuye cada cuaterna a su **mejor rango de madre propia**, nunca a varios rangos simultáneamente.\n\n'+
'**Advertencia:** elección de hipótesis posdatos y muestra muy explorada: p y razones son señales descriptivas; no prueban capacidad predictiva. Contrastes futuros requieren sellado genuinamente prospectivo. Archivo detallado: RESULTADO_115.json.\n';
writeFileSync(OUT+'LECTURA.md',md);
console.log(JSON.stringify({groups:result.groups.map(g=>({range:g.key,
 obs:g.observedHeads,expected:g.expectedHeads,pAdj:g.pHeadsBonferroni,
 cutObs:g.observedCuts,cutExpected:g.expectedCuts,months:g.byMonth}))},null,2));
