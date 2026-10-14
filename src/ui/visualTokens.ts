import type {PanoramaKind} from '../panoramaModel';

export type KindColor={line:string;fill:string;label:string};
export const KIND_COLOR:Record<PanoramaKind,KindColor>={
 vt2:{line:'#cf365c',fill:'#fce7ed',label:'2 cifras'},
 vt3:{line:'#087d88',fill:'#ddf5f3',label:'3 cifras'},
 vt4:{line:'#b47700',fill:'#fff1c9',label:'4 cifras'}
};
/** Una marca contiene todas sus modalidades, sin convertirlas en rutas nuevas. */
export const KINDS:PanoramaKind[]=['vt2','vt3','vt4'];
export const strongestKind=(kinds:PanoramaKind[]):PanoramaKind|null=>
 kinds.includes('vt4')?'vt4':kinds.includes('vt3')?'vt3':kinds.includes('vt2')?'vt2':null;
