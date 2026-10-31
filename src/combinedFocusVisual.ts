/** Solo representación del candidato estadístico ya calculado.
 * No introduce familias en Lalo ni modifica sus rankings.
 */
import type {CombinedPick} from './laloCombinedRuntime';
import type {PanoramaData,PanoramaRoute} from './panoramaModel';
import {physicalKey} from './panoramaModel';
import type {SourceId} from './sheet';

export function combinedOwnerId(family:string):string{
 return 'vt3|combinado|'+family;
}
export function combinedFocusVisual(pick:CombinedPick):PanoramaData{
 const id=combinedOwnerId(pick.family),paths=new Map<string,PanoramaRoute>();
 for(const p of pick.paths){
  const sourceId=p.source as SourceId;
  if(!/^[0-9]{3}$/.test(p.value)||p.cells.length!==3)continue;
  const key=physicalKey('vt3',sourceId,p.cells);
  const previous=paths.get(key);
  if(previous){if(!previous.readings.includes(p.value))previous.readings.push(p.value);continue}
  paths.set(key,{id:key,ownerId:id,kind:'vt3',sourceId,
   cells:p.cells,readings:[p.value],headSources:['Modelo Combinado · posición #'+pick.rank]});
 }
 return {routes:[...paths.values()],groups:[{
  id,label:pick.family,subtitle:'Combinado · puesto #'+pick.rank+' · recorridos en hoja +11',
  routeCount:paths.size,kinds:paths.size?['vt3']:[]}
 ]};
}
