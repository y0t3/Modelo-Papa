import type {PanoramaKind} from './panoramaModel';
/**
 * Los trazos comprobados nunca desaparecen al seleccionar turno o cabeza.
 * La selección sólo cambia contraste y color de primer plano.
 */
export function describeBoardCell(allKinds:PanoramaKind[],selectedKinds:PanoramaKind[],focusMode:boolean){
 const focus=focusMode&&selectedKinds.length>0;
 return {
  visibleKinds:allKinds,
  emphasisKinds:focus?selectedKinds:allKinds,
  focus,
  muted:focusMode&&!focus&&allKinds.length>0
 };
}
