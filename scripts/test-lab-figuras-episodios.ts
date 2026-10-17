import assert from 'node:assert/strict';
import {episodeEvidence,episodeFlag,episodeModes} from './lab-figuras-episodios';
import type {EpisodeMark,EpisodePath} from './lab-figuras-episodios';
const dates=['2026-10-09','2026-10-10','2026-10-12','2026-10-13','2026-10-14','2026-10-15'];
const path:EpisodePath={source:'Matutino',shape:'0,1;-1,0',cells:['0:0','1:1','1:0'],value:'357'};
const event=(date:string,source:EpisodeMark['source']):EpisodeMark=>
 ({date,source,shape:path.shape,head:'1234',turn:'Nocturno',jur:'Ciudad'});
const silence=episodeEvidence(path,[event(dates[0],'Matutino'),
 event(dates[3],'Matutino'),event(dates[5],'Matutino')],dates);
assert.equal(silence.comeback,true);
assert.equal(silence.returnSame,true);
assert.equal(silence.returnOther,false);
assert.equal(silence.multiYesterday,false);
const moved=episodeEvidence(path,[event(dates[1],'Previa'),
 event(dates[4],'Previa'),event(dates[5],'Matutino')],dates);
assert.equal(moved.comeback,false);
assert.equal(moved.sourceReentry,false);
const afterGap=episodeEvidence(path,[event(dates[1],'Previa'),
 event(dates[5],'Matutino')],dates);
assert.equal(afterGap.returnOther,true);
assert.equal(afterGap.returnSame,false);
const multi=episodeEvidence(path,[event(dates[1],'Previa'),
 event(dates[1],'Matutino'),event(dates[5],'Matutino'),
 event(dates[5],'Previa'),event(dates[5],'Previa')],dates);
assert.equal(multi.multiYesterday,true);
assert.equal(multi.multiPersistent,true);
assert.equal(multi.lastDaySources.length,2);
assert.equal(multi.shapeDays,2,'Dos cabezas de misma fuente no equivalen a dos jornadas');
const reentered=episodeEvidence(path,[event(dates[0],'Matutino'),
 event(dates[4],'Previa'),event(dates[5],'Matutino')],dates);
assert.equal(reentered.sourceReentry,true);
const fake=episodeEvidence(path,[event(dates[0],'Matutino'),
 {...event(dates[5],'Matutino'),shape:'forma-irrelevante'}],dates);
assert.equal(fake.comeback,false,'Una forma distinta no es continuidad');
assert.equal(episodeFlag(multi,'MULTIFUENTE_AYER'),true);
assert.equal(episodeFlag(multi,'MULTIFUENTE_PERSISTENTE'),true);
// Las categorías NO son mutuamente excluyentes: una figura puede regresar
// después de una pausa y manifestarse en dos fuentes a la vez.
assert.throws(()=>episodeEvidence(path,[],dates.slice(1)));
console.log('OK: pausas físicas, cambio de fuente, varias fuentes misma fecha, deduplicación, límites temporales');
