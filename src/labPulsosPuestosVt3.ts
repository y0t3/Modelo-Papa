/**
 * Observaciones de un puesto VT3 en el MISMO turno.
 * PRE: alerta sólo por los resultados de jornadas anteriores.
 * POST: mide si uno o más VT2 físicos ocultos dentro de ese puesto
 * coincidieron con alguna de las cinco cabezas del turno objetivo.
 * No persigue familias numéricas entre días, persigue el PUESTO/turno.
 */
export type RankObservation={
 date:string;turn:string;rank:number;
 exposed:number;hits:number;
 mothers:string[];families:string[];
};
export type RankAlert={
 date:string;turn:string;rank:number;
 window:number;minimum:number;priorHits:number;alert:boolean;
 exposed:number;hit:boolean;hits:number;eligible:boolean;
};
export type PulseSummary={
 window:number;minimum:number;eligible:number;alerts:number;
 alertedHits:number;nonAlerts:number;nonAlertHits:number;
 alertHitRate:number|null;nonAlertHitRate:number|null;
 slots:Record<string,{eligible:number;hits:number;
  alerts:number;alertHits:number}>;
 recent:RankAlert[];
};
const key=(x:Pick<RankObservation,'turn'|'rank'>)=>x.turn+'|'+x.rank;
export function evaluateRankPulses(
 rows:RankObservation[],window=3,minimum=2
):PulseSummary{
 if(window<2||window>8||minimum<1||minimum>window)
  throw Error('Ventana o mínimo inválido');
 const bySlot=new Map<string,RankObservation[]>();
 const seen=new Set<string>();
 for(const row of rows){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(row.date)||
   row.rank<1||row.rank>10||row.exposed<0||row.hits<0)
   throw Error('Observación inválida');
  const id=row.date+'|'+key(row);
  if(seen.has(id))throw Error('Duplicación de fecha y puesto');
  seen.add(id);
  const slot=key(row),ls=bySlot.get(slot)||[];
  ls.push(row);bySlot.set(slot,ls);
 }
 const events:RankAlert[]=[];
 for(const [slot,items] of bySlot){
  const sorted=[...items].sort((a,b)=>a.date.localeCompare(b.date));
  for(let i=0;i<sorted.length;i++){
   const now=sorted[i],prev=sorted.slice(Math.max(0,i-window),i);
   const eligible=prev.length===window&&now.exposed>0;
   const priorHits=prev.filter(p=>p.exposed>0&&p.hits>0).length;
   const alert=eligible&&priorHits>=minimum;
   events.push({date:now.date,turn:now.turn,rank:now.rank,
    window,minimum,priorHits,alert,exposed:now.exposed,
    eligible,hit:now.hits>0,hits:now.hits});
  }
 }
 const eligible=events.filter(x=>x.eligible);
 const alerts=eligible.filter(x=>x.alert),normal=eligible.filter(x=>!x.alert);
 const slots=Object.fromEntries([...bySlot.keys()].sort().map(slot=>{
  const group=eligible.filter(x=>key(x)===slot);
  return [slot,{eligible:group.length,
   hits:group.filter(x=>x.hit).length,
   alerts:group.filter(x=>x.alert).length,
   alertHits:group.filter(x=>x.alert&&x.hit).length}];
 }));
 return {window,minimum,eligible:eligible.length,
  alerts:alerts.length,alertedHits:alerts.filter(x=>x.hit).length,
  nonAlerts:normal.length,nonAlertHits:normal.filter(x=>x.hit).length,
  alertHitRate:alerts.length?alerts.filter(x=>x.hit).length/alerts.length:null,
  nonAlertHitRate:normal.length?normal.filter(x=>x.hit).length/normal.length:null,
  slots,recent:events.sort((a,b)=>a.date.localeCompare(b.date))
   .filter(x=>x.date>=events.at(-1)?.date!).slice(-50)};
}

/** Al pasar de un sorteo al siguiente dentro de LA MISMA jornada,
 * ¿el puesto VT3 que dio una cabeza VT2 extra vuelve a hacerlo?
 * La señal para turno actual usa exclusivamente el turno ANTERIOR.
 * Reportar exposición: una Previa con menos columnas no es igual
 * que una Nocturna con más columnas.
 */
export function evaluateAdjacentTurnPulses(rows:RankObservation[]){
 const turns=['Previa','Primera','Matutino','Vespertino','Nocturno'];
 const map=new Map(rows.map(x=>[x.date+'|'+x.turn+'|'+x.rank,x]));
 const pairs:{date:string;rank:number;from:string;to:string;
  priorHit:boolean;currentHit:boolean;priorExposure:number;
  currentExposure:number}[]=[];
 for(const now of rows){
  const index=turns.indexOf(now.turn);
  if(index<=0||now.exposed===0)continue;
  const past=map.get(now.date+'|'+turns[index-1]+'|'+now.rank);
  if(!past||!past.exposed)continue;
  pairs.push({date:now.date,rank:now.rank,
   from:turns[index-1],to:now.turn,
   priorHit:past.hits>0,currentHit:now.hits>0,
   priorExposure:past.exposed,currentExposure:now.exposed});
 }
 const summary=(data:typeof pairs)=>{
  const alerted=data.filter(x=>x.priorHit),normal=data.filter(x=>!x.priorHit);
  return {compared:data.length,
   alerted:alerted.length,alertHits:alerted.filter(x=>x.currentHit).length,
   nonAlerts:normal.length,nonAlertHits:normal.filter(x=>x.currentHit).length,
   meanExposureAlerts:alerted.length?
    alerted.reduce((n,x)=>n+x.currentExposure,0)/alerted.length:null,
   meanExposureNonAlerts:normal.length?
    normal.reduce((n,x)=>n+x.currentExposure,0)/normal.length:null};
 };
 return {all:summary(pairs),
  byTransition:Object.fromEntries(turns.slice(1).map(t=>
   [t,summary(pairs.filter(x=>x.to===t))])),
  byRank:Object.fromEntries(Array.from({length:10},(_,i)=>i+1).map(rank=>
   [rank,summary(pairs.filter(x=>x.rank===rank))]))};
}
