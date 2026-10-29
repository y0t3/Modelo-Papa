import assert from 'node:assert/strict';
import {shapeOf,cellSite,footprintsOf,inspectSlots,overlap} from '../src/labHuellasPorPuesto';
import type {LaloFamily} from '../src/motorLalo';
const make=(family:string,path:{row:number;col:number;digit:string}[],source='prevNocturno'):LaloFamily=>({
 kind:'vt2',family,rank:7,paths:[{kind:'vt2',family,
 sourceId:source as 'prevNocturno',path,
 value:path.map(c=>c.digit).join(''),origin:'TRASLADO',rootIds:[]}],
 sourceCount:1,directRoots:1,d7Roots:0,d1Roots:1,
 physicalBlocks:1,branchBlocks:0,parentFamilies:[],state:'EN_SEGUIMIENTO',
 rationale:'test'
});
const horiz=[{row:0,col:0,digit:'4'},{row:0,col:1,digit:'5'}];
const diagA=[{row:0,col:0,digit:'4'},{row:1,col:1,digit:'5'}];
const diagB=[{row:0,col:1,digit:'4'},{row:1,col:0,digit:'5'}];
assert.equal(shapeOf(horiz),'HORIZONTAL');
assert.equal(shapeOf(diagA),'DIAGONAL_A');
assert.equal(shapeOf(diagB),'DIAGONAL_B');
assert.equal(cellSite('Previa',horiz as any),cellSite('Previa',[...horiz].reverse() as any));
const x=make('45/54',horiz),y=make('10/01',[
 {row:0,col:0,digit:'1'},{row:0,col:1,digit:'0'}]);
const a=footprintsOf(x),b=footprintsOf(y);
assert.equal(a[0].signature,b[0].signature,
 'Figura idéntica aunque cambie por completo la familia');
const s=inspectSlots([x],[{jur:'Ciudad',head:'9945'}]);
const t=inspectSlots([y],[{jur:'Ciudad',head:'9910'}]);
assert(s[0].hits.length===1&&t[0].hits.length===1);
assert(overlap(s[0],t[0]).sameDominantShape);
assert.equal(overlap(s[0],t[0]).siteJaccard,1);
assert.deepEqual(s[0].hits[0].physicalSites,[a[0].site]);
const z=inspectSlots([x],[{jur:'Ciudad',head:'1234'}]);
assert.equal(z[0].hits.length,0);
console.log('HUELLAS_FIGURAS_TEST_OK');
