import {strict as assert} from 'node:assert';
import {TURNOS,diaVacio} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {emptyAuxiliaryHeads} from '../src/auxSantiagoNeuquen';
import {sameDaySequence} from '../src/withinDayMarkContinuity';
import {timelineFamilyChoices,timelineForFamily} from '../src/withinDayTimeline';

const date='2026-10-20',prev=diaVacio(),day=diaVacio(),aux=emptyAuxiliaryHeads();
for(const jur of ['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'])
 prev.Nocturno[jur]='0099'; // +11 produce 10
day.Previa.Ciudad='4310';
day.Primera.Ciudad='1110';
day.Matutino.Ciudad='7510';
day.Vespertino.Ciudad='1200';
day.Nocturno.Ciudad='0055';
aux.Previa.Santiago='0010';aux.Previa.Neuquen='9867';
aux.Primera.Santiago='8067';aux.Primera.Neuquen='0245';
aux.Matutino.Santiago='9634';aux.Matutino.Neuquen='0210';

const capped=sameDaySequence(date,day,buildSheet(day,prev),aux,'Matutino');
assert.equal(capped.length,3,'solo calcula PRE/POST hasta Matutino');
const available=timelineFamilyChoices(capped,2);
assert(available.some(x=>x.family==='01/10'&&x.postedEvents>=2));
const items=timelineForFamily(capped,2,'01/10','Matutino');
assert.equal(items.length,5,'mostrar cinco hitos sin revelar futuros');
assert(items[0].posted.some(x=>x.head==='4310'));
assert.equal(items[0].priorRoots,0);
assert.equal(items[1].priorRoots,1);
assert(items[1].newAux.includes('Previa'),'fuente auxiliar nueva antes de Primera');
assert(items[1].posted.some(x=>x.head==='1110'));
assert.equal(items[2].priorRoots,2);
assert(items[2].posted.some(x=>x.head==='7510'));
assert(items[3].available===false&&items[4].available===false);
assert(items[3].posted.length===0&&items[4].posted.length===0);
assert(!capped.flatMap(f=>f.post[2]).some(x=>x.turn==='Vespertino'));
const changed=diaVacio();
for(const t of TURNOS)changed[t]={...day[t]};
changed.Vespertino.Ciudad='9999';changed.Nocturno.Ciudad='9999';
const cappedChanged=sameDaySequence(date,changed,buildSheet(changed,prev),aux,'Matutino');
assert.deepEqual(capped,cappedChanged,'no fuga de resultados posteriores en cálculos');
assert.deepEqual(items,timelineForFamily(cappedChanged,2,'01/10','Matutino'));
assert.throws(()=>timelineForFamily(
 sameDaySequence(date,day,buildSheet(day,prev),aux),
 2,'01/10','Matutino'),/futuros/,'rechaza entrada con frames posteriores');
const vt4Choices=timelineFamilyChoices(capped,4);
assert(vt4Choices.every(x=>x.exactValues.every(v=>v.length===4)));
const none=timelineForFamily(capped,3,'111/111','Matutino');
assert.equal(none.filter(x=>x.posted.length>0).length,0);
console.log('LINEA_TIEMPO_TEST_OK',JSON.stringify({
 checks:17,firstFamily:available.find(x=>x.family==='01/10'),
 steps:items.map(x=>({turn:x.turn,available:x.available,change:x.change,
  before:x.priorRoots,after:x.posted.length,newPlus:x.newPlus,newAux:x.newAux}))
}));
