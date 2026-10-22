/** Control temporal de HOJA para un día sin resultados todavía. */
import {strict as assert} from 'node:assert';
import {diaVacio} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {auxiliaryBoard} from '../src/auxSantiagoNeuquen';
import {auxiliarySourceDate,fetchAuxiliaryBaseForDate} from '../src/auxSantiagoSource';

async function run(){
 const objective='2026-10-22',previous='2026-10-21';
 assert.equal(auxiliarySourceDate(objective),previous);
 assert.equal(auxiliarySourceDate(previous),'2026-10-20');
 assert.equal(auxiliarySourceDate('2026-10-19'),'2026-10-17');
 // Cifras de 21/10 visibles en captura del usuario: son la base del 22/10.
 const fixture={datos:{
  '10':{momento_5:'4904',momento_1:'3086',momento_2:'2793'},
  '11':{momento_5:'0490',momento_1:'2922',momento_2:'0405'}
 }};
 const originalFetch=globalThis.fetch;
 const urls:string[]=[];
 globalThis.fetch=async (url)=>{urls.push(String(url));return {
  ok:true,json:async()=>fixture
 } as Response;};
 let base:Awaited<ReturnType<typeof fetchAuxiliaryBaseForDate>>;
 try{base=await fetchAuxiliaryBaseForDate(objective)}
 finally{globalThis.fetch=originalFetch}
 assert.deepEqual(urls.length,1);
 assert(urls[0].includes('fecha=2026-10-21'));
 assert(!urls[0].includes('fecha=2026-10-22'));
 assert.equal(base.date,objective);
 assert.equal(base.sourceDate,previous);
 const preview=auxiliaryBoard(base.heads,'Previa');
 assert.equal(preview.cells.length,24);
 assert(preview.cells.some(x=>x.row===0&&x.col===11&&x.digit==='3'));
 assert(preview.cells.some(x=>x.row===1&&x.col===8&&x.digit==='0'));
 const nocturnaAyer=diaVacio();
 nocturnaAyer.Nocturno.Ciudad='3487'; // Ejemplo sintético de Nocturna 21/10.
 const nuevoDia=diaVacio();
 const plus=buildSheet(nuevoDia,nocturnaAyer);
 assert.equal(plus.columns[0].values[0],'98','Nocturna anterior +11');
 assert(plus.columns.slice(1).every(col=>col.values.every(v=>v==='--')),
  '22/10: todo +11 posterior a Previa sigue vacío');
 for(const target of ['Previa','Primera','Matutino','Vespertino','Nocturno'] as const){
  const board=auxiliaryBoard(base.heads,target);
  assert.equal(board.cells.length,24,'AUX fija de AYER durante todo el día');
  assert.deepEqual(board.cells,preview.cells);
 }
 console.log('HOJA_SIGUIENTE_22OCT_OK',JSON.stringify({
  target:objective,auxSourceDate:base.sourceDate,
  santiago:[base.heads.Previa.Santiago,base.heads.Primera.Santiago,base.heads.Matutino.Santiago],
  neuquen:[base.heads.Previa.Neuquen,base.heads.Primera.Neuquen,base.heads.Matutino.Neuquen],
  plusVisible:plus.columns.map(c=>c.values.filter(v=>v!=='--').length)
 }));
}
void run().catch(e=>{console.error(e);process.exitCode=1});
