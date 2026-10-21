/**
 * Caso real Vivitusuerte: martes 20/10/2026, sin adaptar reglas a cabezas.
 * Registrar para pantalla la secuencia POST que desemboca en siguientes PRE.
 */
import {descargarCabezas} from '../src/cabezas';
import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
import {buildSheet} from '../src/sheet';
import {sameDaySequence} from '../src/withinDayMarkContinuity';
import {timelineFamilyChoices,timelineForFamily} from '../src/withinDayTimeline';
async function main(){
 const [day,prev,source]=await Promise.all([
  descargarCabezas('2026-10-20',true),descargarCabezas('2026-10-19',true),
  fetchAuxiliaryHeads('2026-10-20')
 ]);
 const aux=source.heads;
 if(aux.Previa.Santiago!=='8067'||aux.Primera.Santiago!=='6142'||
 aux.Matutino.Santiago!=='9634'||aux.Previa.Neuquen!=='0469'||
 aux.Primera.Neuquen!=='0245'||aux.Matutino.Neuquen!=='0210')
  throw Error('Valores auxiliares distintos a los confirmados por el usuario');
 const frames=sameDaySequence('2026-10-20',day,buildSheet(day,prev),aux,'Nocturno');
 const totals=[2,3,4] as const;
 const overview=frames.map(frame=>({
  turn:frame.target,
  preAvailable:{plus:frame.visiblePlus,aux:frame.visibleAux},
  post:Object.fromEntries(totals.map(n=>['VT'+n,frame.post[n]
   .map(m=>({jur:m.jur,head:m.head,family:m.family,
    routePlus:m.plusPaths,routeAux:m.auxPaths}))])),
  previouslyMarked:Object.fromEntries(totals.map(n=>['VT'+n,{
   families:frame.rooted[n].length,
   gainedSource:frame.rooted[n].filter(f=>f.status==='FUENTE_NUEVA').map(f=>({
    family:f.family,roots:f.rootEvents,plus:f.newPlusSources,
    aux:f.newAuxSources
   }))
  }]))
 }));
 const families=totals.map(n=>({
  modality:'VT'+n,choices:timelineFamilyChoices(frames,n).length,
  cases:timelineFamilyChoices(frames,n).slice(0,12).map(choice=>({
   family:choice.family,markAt:choice.firstPosted,
   history:timelineForFamily(frames,n,choice.family,'Nocturno').map(st=>({
    turn:st.turn,priorRoots:st.priorRoots,status:st.change,
    newPlus:st.newPlus,newAux:st.newAux,posted:st.posted.map(m=>m.head)
   }))
  }))
 }));
 console.log('LINEA_20OCT_AUDIT',JSON.stringify({date:'2026-10-20',
  overview,choices:families.map(x=>({modality:x.modality,number:x.choices})),
  headline:families.flatMap(x=>x.cases).filter(x=>
   x.history.some(z=>z.newPlus.length||z.newAux.length)).slice(0,16)
 }));
}
void main().catch(err=>{console.error('LINEA_20OCT_ERROR',err);process.exitCode=1});
