export const TURNOS=['Previa','Primera','Matutino','Vespertino','Nocturno'] as const;
export const JURS=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'] as const;
export type Turno=typeof TURNOS[number];
export type Jurisdiccion=typeof JURS[number];
export type Tabla=Record<string,string>;
export type CabezasDia=Record<string,Tabla>;
export const tablaVacia=():Tabla=>Object.fromEntries(JURS.map(j=>[j,'----']));
export const diaVacio=():CabezasDia=>Object.fromEntries(TURNOS.map(t=>[t,tablaVacia()]));
export const mas11=(cabeza:string)=>{
  if(!/^\d{4}$/.test(cabeza)) return '----';
  return String((Number(cabeza.slice(-2))+11)%100).padStart(2,'0');
};
export const sufijosValidos=(cabeza:string)=>/^\d{4}$/.test(cabeza)
  ? {vt2:cabeza.slice(-2),vt3:cabeza.slice(-3),vt4:cabeza}
  : null;
