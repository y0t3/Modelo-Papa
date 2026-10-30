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
