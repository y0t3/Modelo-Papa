import assert from 'node:assert/strict';
import {buildPredictivePanorama} from '../src/panoramaModel';
import {vt4PrefixFamily,reversibleFamily,compareMotorLaloAfterDraw} from '../src/motorLalo';
import type {LaloView,LaloRoute} from '../src/motorLalo';
import {findPaths} from '../src/paths';
import type {Path} from '../src/paths';

const cell=(row:number,col:number,digit:string)=>({row,col,digit});
const p4:Path=[cell(0,0,'3'),cell(0,1,'0'),cell(1,0,'4'),cell(1,1,'4')];
const p4Sister:Path=[cell(2,0,'3'),cell(2,1,'4'),cell(3,1,'4'),cell(3,0,'0')];
const p3:Path=[cell(0,1,'0'),cell(1,0,'4'),cell(1,1,'4')];
const p2:Path=p3.slice(0,2);
const route=(kind:LaloRoute['kind'],family:string,value:string,path:Path):LaloRoute=>({
 kind,family,value,path,sourceId:'prevNocturno',
 origin:kind==='vt4'?'DESDE_VT3':'TRASLADO',rootIds:[],
 ...(kind==='vt4'?{mother:'044/440',mothers:['044/440'],addedDigit:'3'}:{})
});
const mother='044/440';
const daughters=vt4PrefixFamily(mother,'3');
assert.deepEqual(daughters,['3044','3440'],
 'Nunca agregar cuarta cifra a la derecha ni invertir VT4 completo');
assert.equal(reversibleFamily('044'),'044/440');
const view={
 target:'Previa',date:'2026-10-16',status:'EXPERIMENTAL_SIN_VALIDACIÓN',
 roots:[],ranks:{
  vt2:[{family:'04/40',paths:[route('vt2','04/40','04',p2)]}],
  vt3:[{family:mother,paths:[route('vt3',mother,'044',p3)]}],
  vt4:[{family:daughters.join('/'),
    paths:[route('vt4',daughters.join('/'),'3044',p4)]}]
 }
} as unknown as LaloView;
const panorama=buildPredictivePanorama(view);
const vt4=panorama.routes.filter(r=>r.kind==='vt4');
assert.equal(vt4.length,1,'Hay una sola ruta física propia para 3044');
assert.deepEqual(vt4[0].readings,['3044'],
 'No presentar 4403 como una variante de 3044');
assert.ok(!panorama.routes.some(r=>r.kind==='vt4'&&r.readings.includes('4403')),
 'La inversión completa VT4 no se inventa en ninguna ruta predictiva');
assert.deepEqual(panorama.routes.find(r=>r.kind==='vt3')?.readings,['044','440'],
 'No cambiar la reversibilidad legítima de VT3');
assert.deepEqual(panorama.routes.find(r=>r.kind==='vt2')?.readings,['04','40'],
 'No cambiar la reversibilidad legítima de VT2');
assert.deepEqual(compareMotorLaloAfterDraw(view,['4403']).vt4,[],
 'POST no puede acreditar la inversión inventada');
assert.deepEqual(compareMotorLaloAfterDraw(view,['3044']).vt4,[daughters.join('/')],
 'POST confirma la hija física propia');
const sheet=['30','44','34','04','--','--'];
assert.ok(findPaths(sheet,'3044').length>0,'3044 es un camino real de cuatro contactos');
assert.ok(findPaths(sheet,'3440').length>0,
 'La hermana 3440 también necesita su propio camino físico en la misma fuente');
const keys=(p:Path)=>p.map(c=>c.row+':'+c.col).join('>');
assert.ok(findPaths(sheet,'3044').some(p=>keys(p)===keys(p4)),
 'El testigo de 3044 respeta las cifras reales de cada casilla');
assert.ok(findPaths(sheet,'3440').some(p=>keys(p)===keys(p4Sister)),
 'El testigo propio de 3440 respeta las cifras reales de cada casilla');
// Una hermana de la misma madre solamente se exhibe si existe su propio trazo.
// En esta prueba su testigo independiente se agrega explícitamente.
const twoSisters={
 ...view,ranks:{...view.ranks,vt4:[{
  family:daughters.join('/'),paths:[
   route('vt4',daughters.join('/'),'3044',p4),
   route('vt4',daughters.join('/'),'3440',p4Sister)
  ]}]}
} as LaloView;
const readings=buildPredictivePanorama(twoSisters).routes.filter(r=>r.kind==='vt4')
 .flatMap(r=>r.readings);
assert.ok(readings.includes('3044')&&readings.includes('3440'),
 'Una hermana expresamente respaldada conserva su lectura propia');
assert.ok(!readings.includes('4403')&&!readings.includes('0443'),
 'Ninguna inversión completa ni extensión a derecha, ni con dos hermanas');
console.log('VT4_INVARIANTE_PANORAMA_OK: lecturas exclusivas con testigos, VT2/3 reversibles y POST exacto.');
