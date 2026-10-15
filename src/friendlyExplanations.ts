// Presentación en lenguaje corriente de motivos ya calculados por el motor.
export function explainFamilyRationale(value:string):string{
 const qty=(n:string,singular:string,plural:string)=>n+' '+(Number(n)===1?singular:plural);
 return value
  .replace(/(\d+) raíz\/raíces D−1/g,(_,n:string)=>qty(n,'coincidencia de la jornada anterior','coincidencias de la jornada anterior'))
  .replace(/(\d+) raíz\/raíces D−7/g,(_,n:string)=>qty(n,'coincidencia de la semana pasada','coincidencias de la semana pasada'))
  .replace(/(\d+) bifurcación\(es\)/g,(_,n:string)=>qty(n,'nuevo camino conectado','nuevos caminos conectados'))
  .replace(/(\d+) fuente\(s\)/g,(_,n:string)=>qty(n,'columna de la hoja','columnas de la hoja'))
  .replace(/(\d+) bloque\(s\) propios de cuatro cifras/g,(_,n:string)=>qty(n,'recorrido completo de 4 cifras','recorridos completos de 4 cifras'))
  .replace(/(\d+) madre\(s\) VT3/g,(_,n:string)=>qty(n,'familia de 3 cifras de origen','familias de 3 cifras de origen'))
  .replace(/Extensión física de /g,'Se forma a partir de ')
  .replace(/\bVT2\b/g,'2 cifras')
  .replace(/\bVT3\b/g,'3 cifras')
  .replace(/\bVT4\b/g,'4 cifras')
  .replace(/\bD−1\b/g,'jornada anterior')
  .replace(/\bD−7\b/g,'semana pasada');
}
