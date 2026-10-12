// Modelo Papá — genealogía VT3->VT4 en laboratorio, NO cambia la app ni los motores.
// Una madre reversible VT3 + un dígito genera DOS HIJAS ORIENTADAS;
// la inversión numérica de una hija NO crea otra madre.
const assert=require('node:assert/strict');
const reverse=s=>[...s].reverse().join('');
const canon=s=>s<=reverse(s)?s:reverse(s);
function children(mother,digit){
 assert(/^\d{3}$/.test(mother));assert(/^\d$/.test(digit));
 const orientations=[digit+mother,digit+reverse(mother)];
 return [...new Set(orientations.map(canon))].map(fam=>{
  const literal=orientations.find(s=>canon(s)===fam);
  return {oriented:literal,inverse:reverse(literal),family:fam,physicalWitnesses:[]};
 });
}
function attachWitness(siblings,grids,source,cells){
 assert(Number.isInteger(source)&&source>=0&&source<grids.length);
 assert(Array.isArray(cells)&&cells.length===4);
 const C=cells.map(x=>{assert(Array.isArray(x)&&x.length===2&&x.every(Number.isInteger));return x});
 const distinct=new Set(C.map(x=>x.join(':')));assert.equal(distinct.size,4,'No reutilizar celda');
 for(let i=0;i<C.length;i++){
  const [r,k]=C[i];assert(r>=0&&r<6&&k>=0&&k<2&&/^\d{2}$/.test(grids[source][r]||''),'Celda vacía o fuera de fuente');
  if(i){const [pr,pk]=C[i-1];assert(Math.max(Math.abs(pr-r),Math.abs(pk-k))===1,'Salto/celda no vecina')}
 }
 const reading=C.map(([r,k])=>grids[source][r][k]).join('');
 const family=canon(reading);
 const daughter=siblings.find(x=>x.family===family);
 assert(daughter,'El recorrido no es una hija de la madre/cifra indicadas');
 const key=source+':'+[C.map(x=>x.join(':')).join('>'),[...C].reverse().map(x=>x.join(':')).join('>')].sort()[0];
 if(!daughter.physicalWitnesses.some(w=>w.key===key))daughter.physicalWitnesses.push({key,source,cells:C,reading});
 return daughter.family;
}
function coverage(siblings,head){const family=canon(head),d=siblings.find(x=>x.family===family);return {numeric:!!d,physical:!!(d&&d.physicalWitnesses.length)}}
function selfTest(){
 const a=children('729','3');
 assert.deepEqual(a.map(x=>x.oriented),['3729','3927']);
 assert.deepEqual(a.map(x=>x.inverse),['9273','7293']);
 const b=children('283','4');assert.deepEqual(b.map(x=>x.oriented),['4283','4382']);
 const grids=[['02','04','40','85','31','28'],['00','71','37','10','23','--'],
              ['84','37','58','27','77','--'],['12','48','77','97','13','--'],['90','68','14','17','10','--']];
 assert.equal(attachWitness(b,grids,2,[[0,1],[1,0],[2,1],[3,0]]),'2834');
 assert.deepEqual(coverage(b,'4283'),{numeric:true,physical:false});
 assert.deepEqual(coverage(b,'4382'),{numeric:true,physical:true});
 assert.throws(()=>attachWitness(b,grids,2,[[0,1],[2,0],[2,1],[3,0]]));
 assert.throws(()=>attachWitness(b,grids,2,[[0,1],[1,0],[1,0],[3,0]]));
 assert.deepEqual(children('111','1').length,1);
 console.log('FAMILIAS_VT4_HERMANAS_TEST_OK');
}
if(require.main===module)selfTest();
module.exports={children,attachWitness,coverage,selfTest};
