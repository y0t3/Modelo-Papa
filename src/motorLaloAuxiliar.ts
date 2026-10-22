/**
 * MODELO LALO AUXILIAR · lector INDEPENDIENTE de Santiago–Neuquén.
 *
 * Entrada: cabezas crudas RAW de Santiago y Neuquén + marcas ganadoras
 * auxiliares POST de D−1 y D−7 (sin ninguna hoja +11).
 * Sus familias, rutas y Tops no dependen de Lalo MV1 ni del Integral 65/35.
 *
 * Antes de Primera no existe hoja auxiliar; el corte temporal se aplica
 * dentro de auxiliaryBoard. VT4 conserva madre VT3 del propio AUX.
 */
import type {Turno,CabezasDia} from './domain';
import type {AuxiliaryHeads} from './auxSantiagoNeuquen';
import type {AuxSourceTurn} from './auxSantiagoNeuquen';
import {buildAuxIndependent,extractIntegralAuxHistory} from './motorLaloIntegral';
import type {AuxiliaryHistorical,IntegralKind} from './motorLaloIntegral';
export type AuxiliarHistory=AuxiliaryHistorical & {heads?:AuxiliaryHeads};
export type AuxiliarFamily={
 family:string;mother:string|null;rank:number;values:string[];
 roots:number;d1:number;d7:number;paths:number;crossing:boolean;
 sources:AuxSourceTurn[]
};
export type AuxiliarView={
 date:string;turn:Turno;status:'LABORATORIO';
 ranks:Record<IntegralKind,AuxiliarFamily[]>;
 statement:string
};
export const extractAuxiliarHistory=extractIntegralAuxHistory;
export function buildMotorLaloAuxiliar(date:string,turn:Turno,
 aux:AuxiliaryHeads,history:AuxiliarHistory[]):AuxiliarView{
 if(history.some(h=>h.date>=date||h.aux.date!==h.date))
  throw Error('Fuga temporal AUX: la memoria debe ser anterior a la fecha objetivo');
 const ranked=buildAuxIndependent(date,turn,aux,history);
 return {date,turn,status:'LABORATORIO',
  ranks:Object.fromEntries(([2,3,4] as IntegralKind[]).map(kind=>[kind,
   ranked[kind].map(f=>({
    family:f.family,mother:f.mother,rank:f.rank,values:[...new Set(f.values)],
    roots:f.roots,d1:f.d1,d7:f.d7,paths:f.paths.length,
    crossing:f.crossing,sources:f.sources
   }))
  ])) as Record<IntegralKind,AuxiliarFamily[]>,
  statement:'Solo Santiago–Neuquén RAW: raíces ganadoras históricas AUX. '+
   'Sin hoja +11, sin mezcla de Tops; VT4 depende de madre VT3 AUX.'
 };
}
