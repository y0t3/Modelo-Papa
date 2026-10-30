/**
 * Radar de apariciones cortas (observacional, no pronóstico).
 * Vigila posiciones, familias y respaldos físicos entre hojas por separado.
 * NO aprende de meses para reordenar candidatos; usa 5-6 jornadas para
 * describir cuándo NACE, se mantiene, REAPARECE o termina un seguimiento.
 *
 * Un "puesto" es una etiqueta de ranking, NO una figura fija.
 * La corroboración entre motores de +11 tampoco equivale a 3 tableros.
 */
export type Source='LALO'|'GEOMETRIA'|'CONECTADAS'|'FORMAS_PRIMERO'|'AUX_AYER'|'AUX_HOY';
export type Sheet='PLUS11'|'AUX_AYER'|'AUX_HOY';
export type Length='VT2'|'VT3'|'VT4';
export type Entry={
 date:string;turn:string;source:Source;sheet:Sheet;length:Length;
 rank:number;family:string;physicalRoutes:string[];
 // Sólo se asigna cuando la cabeza YA salió. Jamás influencia ranking PRE.
 matchedHeads:string[];
 preReconstructed:boolean;
};
export type State='SIN_APARICION'|'NACIMIENTO'|'EN_SEGUIMIENTO'|'PAUSA'|
 'REAPARICION'|'FINALIZADO';
export type Pulse={date:string;source:Source;length:Length;rank:number;
 family:string;state:State;pastSix:number;lastThree:number;
 missStreak:number;history:string;hit:boolean;physicalRoutes:number};
const hit=(p:Entry)=>p.matchedHeads.length>0;
export const familyLetters=(value:string)=>value.split('/').filter(Boolean);
export function maternalExtension(vt2:string,vt3:string):boolean{
 const two=new Set(familyLetters(vt2));
 // La extensión tiene una 3ª cifra A LA IZQUIERDA del recorrido madre VT2.
 return familyLetters(vt3).some(v=>v.length===3&&two.has(v.slice(1)));
}
export function pulseOfRank(entries:Entry[]):Pulse[]{
 if(!entries.length)return [];
 const [initial]=entries;
 if(entries.some(e=>e.source!==initial.source||
  e.length!==initial.length||e.rank!==initial.rank||
  e.turn!==initial.turn))throw Error('No mezclar series de puesto/turno/motor');
 const sorted=[...entries].sort((a,b)=>a.date.localeCompare(b.date));
 if(new Set(sorted.map(x=>x.date)).size!==sorted.length)
  throw Error('No duplicar jornadas de una serie');
 let active=false,miss=0;
 const result:Pulse[]=[];
 for(let i=0;i<sorted.length;i++){
  const e=sorted[i],yes=hit(e);
  const trailing=sorted.slice(Math.max(0,i-5),i+1);
  const recent=trailing.slice(-3);
  const count=trailing.filter(hit).length,third=recent.filter(hit).length;
  let state:State='SIN_APARICION';
  if(active){
   if(yes){
    state=miss>=2?'REAPARICION':'EN_SEGUIMIENTO';miss=0;
   }else{
    miss++;
    if(miss>=4){state='FINALIZADO';active=false;miss=0;}
    else state='PAUSA';
   }
  }else if(yes&&third>=2){
   // Se prende sólo DESPUÉS de contar dos éxitos observados en <=3 sorteos,
   // nunca se usa para explicar uno anterior a este nacimiento.
   state='NACIMIENTO';active=true;miss=0;
  }
  result.push({date:e.date,source:e.source,length:e.length,rank:e.rank,
   family:e.family,state,pastSix:count,lastThree:third,
   missStreak:miss,history:trailing.map(x=>hit(x)?'✓':'·').join(''),
   hit:yes,physicalRoutes:e.physicalRoutes.length});
 }
 return result;
}
export function detectCooccurrence(entries:Entry[]){
 const byDay=new Map<string,Entry[]>();
 for(const p of entries){
  const id=p.date+'|'+p.turn+'|'+p.length;
  const old=byDay.get(id)||[];old.push(p);byDay.set(id,old);
 }
 return [...byDay].flatMap(([id,items])=>{
  const fam=new Map<string,Entry[]>();
  for(const x of items){const a=fam.get(x.family)||[];a.push(x);fam.set(x.family,a)}
  return [...fam].filter(([,x])=>x.length>=2).map(([family,x])=>({
   id,family,engines:[...new Set(x.map(z=>z.source))],
   physicalSheets:[...new Set(x.map(z=>z.sheet))],
   ranks:x.map(z=>({engine:z.source,rank:z.rank})),
   matchedHeads:[...new Set(x.flatMap(z=>z.matchedHeads))],
   // Dos motores trabajando en el MISMO tablero no son dos hojas.
   acrossIndependentBoards:new Set(x.map(z=>z.sheet)).size>=2
  }));
 });
}
export function trackableSignals(entries:Entry[]){
 const groups=new Map<string,Entry[]>();
 for(const x of entries){
  const key=[x.turn,x.length,x.source,x.rank].join('|');
  const old=groups.get(key)||[];old.push(x);groups.set(key,old);
 }
 const signals=[...groups.values()].flatMap(pulseOfRank).filter(p=>
  p.state==='NACIMIENTO'||p.state==='REAPARICION'||
  p.state==='FINALIZADO');
 return signals.sort((a,b)=>a.date.localeCompare(b.date)||
  a.source.localeCompare(b.source)||a.rank-b.rank);
}
