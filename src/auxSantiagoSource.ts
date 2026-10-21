/**
 * Adapter SOLO LAB del JSON usado por la app.
 *
 * Importante: id10 Santiago carece habitualmente de Primera en la pizarra
 * consultada: 20/10/26 momento_1 = 6142 se verifica como MATUTINO,
 * momento_2 = 9634 como VESPERTINO. NO atribuir momento_1 a Primera.
 * id11 Neuquén sí sigue el mapa ordinario: 5 previa, 1 primera, 2 mat.
 *
 * No incorporar aquí Mendoza ni otros; únicamente las dos filas auxiliares.
 */
import {FUENTE} from './cabezas';
import {emptyAuxiliaryHeads} from './auxSantiagoNeuquen';
import type {AuxiliaryHeads} from './auxSantiagoNeuquen';
const numeric=(x:any)=>{
 if(x===undefined||x===null||x==='----'||x==='')return '----';
 const v=typeof x==='object'?(x?.cabeza??x?.numero??x?.resultado??x?.valor??''):x;
 const m=String(v).match(/^\d{1,5}$/);
 return m?m[0].slice(-4).padStart(4,'0'):'----';
};
export type AuxSourceObservation={date:string;heads:AuxiliaryHeads;
 mapping:'PROVEEDOR_ID_10_11_NORMALIZADO';rawSantiago:{
 previa:string;matutino:string;vespertino:string};
 rawNeuquen:{previa:string;primera:string;matutino:string}};
export async function fetchAuxiliaryHeads(date:string):Promise<AuxSourceObservation>{
 const response=await fetch(FUENTE+'?fecha='+encodeURIComponent(date)+'&_='+Date.now(),{
  headers:{Accept:'application/json','Cache-Control':'no-cache'}
 });
 if(!response.ok)throw Error('Aux: proveedor respondió '+response.status);
 const json:any=await response.json();
 const raw=json?.datos;
 if(!raw||typeof raw!=='object')throw Error('Aux: datos no encontrados '+date);
 const s=raw['10']||{},n=raw['11']||{};
 const heads=emptyAuxiliaryHeads();
 const Santiago={
  previa:numeric(s.momento_5),matutino:numeric(s.momento_1),
  vespertino:numeric(s.momento_2)
 };
 const Neuquen={
  previa:numeric(n.momento_5),primera:numeric(n.momento_1),
  matutino:numeric(n.momento_2)
 };
 heads.Previa.Santiago=Santiago.previa;
 heads.Primera.Santiago='----'; // no inferir datos futuros de la etiqueta del proveedor
 heads.Matutino.Santiago=Santiago.matutino;
 heads.Previa.Neuquen=Neuquen.previa;
 heads.Primera.Neuquen=Neuquen.primera;
 heads.Matutino.Neuquen=Neuquen.matutino;
 return {date,heads,mapping:'PROVEEDOR_ID_10_11_NORMALIZADO',
  rawSantiago:Santiago,rawNeuquen:Neuquen};
}
