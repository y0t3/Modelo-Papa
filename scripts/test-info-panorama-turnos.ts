import assert from 'node:assert/strict';
import {diaVacio} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo} from '../src/motorLalo';
import type {LaloView,LaloKind} from '../src/motorLalo';
import {readFileSync} from 'node:fs';
import {buildTurnHistory,readableWeekday,visibleTurnRoutes} from '../src/infoTurnHistory';
import type {InfoVisualDay} from '../src/infoTurnHistory';

const before=diaVacio();
before.Nocturno.Ciudad='0000';   // +11 -> 11
before.Nocturno.Provincia='0001'; // +11 -> 12
const day=()=>{
 const heads=diaVacio();
 heads.Previa.Ciudad='0100';
 heads.Vespertino.Ciudad='0112'; // Coincide con 1-1-2 en nocturna anterior
 heads.Nocturno.Ciudad='1200';
 return heads;
};
const dates=['2026-10-14','2026-10-13','2026-10-12','2026-10-08'];
const visuals:InfoVisualDay[]=dates.map(date=>({date,heads:day(),sheet:buildSheet(day(),before)}));
const future=day();
future.Vespertino.Ciudad='9999';
const full=buildSheet(future,before);
const date='2026-10-15';
const view=buildMotorLalo(full,date,'Vespertino',[]);
const gallery=buildTurnHistory(date,'Vespertino',full,view,visuals);
assert.deepEqual(gallery.frames.map(f=>f.id),
 dates.map(d=>'dia-'+d).concat(['proximo']));
assert.deepEqual(gallery.frames.map(f=>f.title),[
 'Última jornada','Dos jornadas atrás','Tres jornadas atrás','Hace una semana',
 'Para el próximo Vespertino'
]);
assert.equal(readableWeekday('2026-10-08'),'Jueves 08/10');
assert.equal(readableWeekday('2026-10-14'),'Miércoles 14/10');
assert.ok(gallery.frames.slice(0,4).every(f=>
 f.kind==='historico'&&f.markedHeads>=1&&f.routes.every(r=>
 ['vt2','vt3','vt4'].includes(r.kind))));
assert.equal(gallery.frames[0].routes.length,visibleTurnRoutes(gallery.frames[0],'todos').length);
assert.ok(visibleTurnRoutes(gallery.frames[0],'vt3').every(r=>r.kind==='vt3'));
const coming=gallery.frames[4];
assert.equal(coming.kind,'proximo');
assert.deepEqual(coming.sheet.columns.map(c=>c.id),
 ['prevNocturno','Previa','Primera','Matutino']);
assert.deepEqual(coming.sheet.heads.Vespertino,[]);
assert.deepEqual(coming.sheet.matches.Vespertino,[]);
const changed=day();
changed.Vespertino.Ciudad='8888';
changed.Nocturno.Ciudad='4444';
const changedGallery=buildTurnHistory(date,'Vespertino',
 buildSheet(changed,before),view,visuals);
assert.deepEqual(changedGallery.frames.slice(0,4),gallery.frames.slice(0,4),
 'Los sorteos posteriores no deben alterar las cuatro hojas históricas');
assert.ok(!coming.sheet.columns.some(c=>c.id==='Vespertino'),
 'Nunca exponer la fuente que sólo existe después del objetivo');
assert.ok(!gallery.summary.includes('garantiza'));
const noDuplicates=buildTurnHistory(date,'Vespertino',full,view,[visuals[0],visuals[0]]);
assert.equal(noDuplicates.frames.filter(f=>f.kind==='historico').length,1);
console.log('OK: INFO por jornadas del mismo turno, fechas, filtros y sin resultados futuros');

// Prueba de control: aunque el motor entregue cuatro o más familias por
// modalidad, el panorama sólo muestra las tres primeras de cada una.
const family=(kind:LaloKind,n:number)=>({
 family:String(n).padStart(kind==='vt2'?2:kind==='vt3'?3:4,'0'),
 rationale:'Familia de prueba',paths:[{
  kind,sourceId:'prevNocturno',value:String(n).padStart(3,'0'),
  path:[{row:0,col:0,digit:'1'},{row:0,col:1,digit:'2'}],rootIds:[]
 }]
});
const fabricatedView={date,target:'Vespertino',roots:[],ranks:{
 vt2:[0,1,2,3].map(n=>family('vt2',n)),
 vt3:[0,1,2,3].map(n=>family('vt3',n)),
 vt4:[0,1,2,3].map(n=>family('vt4',n))
}} as unknown as LaloView;
const topOnly=buildTurnHistory(date,'Vespertino',full,fabricatedView,visuals);
const preview=topOnly.frames.at(-1)!;
assert.equal(preview.familyCount,9);
assert.equal(new Set(preview.routes.map(r=>r.ownerId)).size,9);
for(const kind of ['vt2','vt3','vt4'] as const){
 const chosen=new Set(fabricatedView.ranks[kind].slice(0,3).map(f=>kind+'|'+f.family));
 assert.ok(preview.routes.filter(r=>r.kind===kind).every(r=>chosen.has(r.ownerId)),
  'No incluir ninguna familia de cuarto puesto o inferior');
 assert.ok(!preview.routes.some(r=>r.ownerId===kind+'|'+fabricatedView.ranks[kind][3].family));
}
const app=readFileSync('App.tsx','utf8');
const info=readFileSync('src/ui/InfoDashboard.tsx','utf8');
const board=readFileSync('src/PanoramaSheet.tsx','utf8');
const galleryUi=readFileSync('src/ui/InfoTurnGallery.tsx','utf8');
assert.ok(app.includes('onOpenFrame={openInfoFrame}'));
assert.ok(app.includes('setHistoricalPreview({day,turn:target})'));
assert.ok(app.includes('showingSheet&&showingHoja'));
assert.ok(app.includes('setHistoricalPreview(null);'));
assert.ok(board.includes('initialTurnOnly={')===false,
 'PanoramaSheet recibe la propiedad, no debe montar otra instancia');
assert.ok(board.includes('setTurnOnly(initialTurnOnly)'));
assert.ok(galleryUi.includes('Abrir este día en HOJA'));
assert.ok(galleryUi.includes('Abrir en PREDICTIVA'));
assert.ok(!info.includes('InfoCandidateMovement'),
 'La visualización indescifrable se retira de INFO, sin cambiar el motor');
console.log('OK: Top3 de cada modalidad, apertura histórica y predictiva, regreso y INFO simplificada');
