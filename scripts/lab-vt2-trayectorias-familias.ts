/**
 * LAB — VT2 Lalo: trazas de familias Top10 entre turnos, posición y estado
 * de ventanas 5/6 jornadas. SOLO lectura de resultados PRE archivados.
 * Top10 del motor oficial NO cambia; selección de hasta dos familias es
 * analítica y NO PRE auténtico ni propuesta de apuesta.
 */
import fs from 'node:fs';
import {TURNOS} from '../src/domain';

type Head={jur:string;head:string;family:string;position:number|null};
type Cut={date:string;turn:string;turnIndex:number;rankedFamilies:string[];heads:Head[]};
type Win={turn:string;rank:number;family:string;jur:string;head:string;turnIndex:number};
type Trace={family:string;currentRank:number;turn:string;date:string;
 previousRanks:{turn:string;rank:number;won:boolean}[];
 firstSeenRank:number|null;lastSeenRank:number|null;
 mostRecentWinRank:number|null;lastWinningTurn:string|null;
 lastWinningTurnIndex:number;priorWon:boolean;priorWinCount:number;
 priorSeen:boolean;priorSeenCount:number;persisted:boolean;reappeared:boolean;
 movement:'SUBE'|'BAJA'|'IGUAL'|'NUEVA';delta:number|null;
 priorFiveNightPresence:number;priorFiveNightWins:number;
 hitHeads:{jur:string;head:string}[];
};
type Night={date:string;turn:string;traces:Trace[];wins:Win[];
 predictions:Record<string,number[]>;eligibleWinFamilies:number;hitCount:number};
const base=JSON.parse(fs.readFileSync('auditorias/vt2-posiciones-libres/resultados.json','utf8'));
const rows=base.rows as Cut[];
if(rows.length!==635||base.days!==127||base.heads!==3401||
 base.baselineTop.top3!==220||base.baselineTop.top5!==351||base.baselineTop.top10!==674)
 throw Error('VT2 oficial no reproduce baseline 127x5');
const dates=[...new Set(rows.map(r=>r.date))].sort();
const index=new Map(rows.map(r=>[r.date+'|'+r.turn,r]));
const get=(d:string,t:string)=>{const v=index.get(d+'|'+t);if(!v)throw Error('Falta '+d+'/'+t);return v;};
const getWins=(r:Cut):Win[]=>(r.heads||[]).filter(h=>h.position!==null)
 .map(h=>({turn:r.turn,turnIndex:r.turnIndex,rank:h.position!,family:h.family,jur:h.jur,head:h.head}));
const policies=['TOP2','FAMILIA_GANO_HOY','GANO_HOY_SUBE','GANO_HOY_BAJA','GANO_HOY_PERSISTE','GANO_HOY_REAPARECE','GANO_HOY_RECIENTE','FAMILIA_VISTA_HOY','FAMILIA_5_DIAS'] as const;
type Policy=typeof policies[number];
const allDays:Night[][]=[];
function select(trace:Trace[],policy:Policy):number[]{
 const vals=trace.map(t=>({t,score:0}));
 if(policy==='TOP2')return trace.slice(0,2).map(x=>x.currentRank);
 for(const c of vals){
  const t=c.t;
  // Prioridad de una familia que EFECTIVAMENTE acertó hoy; no una familia
  // meramente presente en una lista anterior.
  switch(policy){
   case 'FAMILIA_GANO_HOY':c.score=Number(t.priorWon)*100;break;
   case 'GANO_HOY_SUBE':c.score=Number(t.priorWon)*100+(t.movement==='SUBE'?20:0);break;
   case 'GANO_HOY_BAJA':c.score=Number(t.priorWon)*100+(t.movement==='BAJA'?20:0);break;
   case 'GANO_HOY_PERSISTE':c.score=Number(t.priorWon)*100+(t.persisted?20:0);break;
   case 'GANO_HOY_REAPARECE':c.score=Number(t.priorWon)*100+(t.reappeared?20:0);break;
   case 'GANO_HOY_RECIENTE':c.score=Number(t.priorWon)*100+t.lastWinningTurnIndex;break;
   case 'FAMILIA_VISTA_HOY':c.score=Number(t.priorSeen)*100;break;
   case 'FAMILIA_5_DIAS':c.score=Number(t.priorFiveNightWins>0)*100;break;
  }
 }
 vals.sort((a,b)=>b.score-a.score||a.t.currentRank-b.t.currentRank);
 return vals.slice(0,2).map(x=>x.t.currentRank);
}
for(let di=0;di<dates.length;di++){
 const date=dates[di],recent=dates.slice(Math.max(0,di-5),di);
 // Past-night ranked family in previous five actual completed jornadas.
 const lastFiveNightFamilySets=recent.map(day=>new Set(get(day,'Nocturno').rankedFamilies));
 const lastFiveNightWinners=recent.map(day=>new Set(getWins(get(day,'Nocturno')).map(w=>w.family)));
 const today:Night[]=[];
 const prior:Cut[]=[];
 for(const turn of TURNOS){
  const cut=get(date,turn);
  const earlierWins=prior.flatMap(getWins);
  const previous=prior.length?prior[prior.length-1]:null;
  const traces:Trace[]=cut.rankedFamilies.map((family,i)=>{
   const rank=i+1;
   const previousRanks=prior.map(p=>({turn:p.turn,rank:p.rankedFamilies.indexOf(family)+1,
    won:getWins(p).some(w=>w.family===family)})).filter(x=>x.rank>0);
   const prevWin=earlierWins.filter(w=>w.family===family);
   const lastWinning=prevWin.length?prevWin[prevWin.length-1]:null;
   const prevRank=previousRanks.length?previousRanks[previousRanks.length-1].rank:null;
   const priorSeen=previousRanks.length>0, persisted=!!previous?.rankedFamilies.includes(family);
   const reappeared=priorSeen&&!persisted;
   const delta=prevRank!==null?rank-prevRank:null;
   const movement:Trace['movement']=delta===null?'NUEVA':delta<0?'SUBE':delta>0?'BAJA':'IGUAL';
   const hitHeads=cut.heads.filter(h=>h.family===family&&h.position===rank).map(h=>({jur:h.jur,head:h.head}));
   return {family,currentRank:rank,turn,date,previousRanks,
    firstSeenRank:priorSeen?previousRanks[0].rank:null,lastSeenRank:prevRank,
    mostRecentWinRank:lastWinning?.rank??null,lastWinningTurn:lastWinning?.turn??null,
    lastWinningTurnIndex:lastWinning?.turnIndex??-1,priorWon:prevWin.length>0,
    priorWinCount:new Set(prevWin.map(w=>w.turn)).size,
    priorSeen,priorSeenCount:previousRanks.length,persisted,reappeared,movement,delta,
    priorFiveNightPresence:lastFiveNightFamilySets.filter(set=>set.has(family)).length,
    priorFiveNightWins:lastFiveNightWinners.filter(set=>set.has(family)).length,
    hitHeads};
  });
  // Assertions about temporal causality, including negative controls.
  if(traces.some(t=>t.previousRanks.some(p=>TURNOS.indexOf(p.turn)>=TURNOS.indexOf(turn))))
   throw Error('FUGA: turno actual en historia previa '+date+' '+turn);
  if(traces.some(t=>t.priorWon&&!t.priorSeen))throw Error('Una familia ganó sin estar en Top10 anterior');
  const predictions=Object.fromEntries(policies.map(p=>[p,select(traces,p)])) as Record<string,number[]>;
  if(Object.values(predictions).some(x=>x.length!==Math.min(2,traces.length)||new Set(x).size!==x.length))
   throw Error('Cupo 2 incorrecto '+date+'/'+turn);
  const wins=getWins(cut);
  today.push({date,turn,traces,wins,predictions,
   eligibleWinFamilies:new Set(wins.map(w=>w.family)).size,
   hitCount:wins.length});
  prior.push(cut);
 }
 allDays.push(today);
}
const nights=allDays.map(day=>day[4]);
const sum=(arr:number[])=>arr.reduce((a,b)=>a+b,0);
function period(d:string){
 if(d<='2026-07-31')return 'JUN_JUL';
 if(d<='2026-09-30')return 'AGO_SEP';
 if(d<='2026-10-24')return 'OCT_1_24';
 return 'OCT_26_28';
}
function reportNightSet(rows:Night[]){
 const scores=Object.fromEntries(policies.map(policy=>[policy,
  sum(rows.map(n=>n.wins.filter(w=>n.predictions[policy].includes(w.rank)).length))])) as Record<string,number>;
 const rankMovement=Object.fromEntries(['SUBE','BAJA','IGUAL','NUEVA'].map(label=>{
  const slots=rows.flatMap(n=>n.traces.filter(t=>t.priorWon&&t.movement===label));
  return [label,{slots:slots.length,hitHeads:sum(slots.map(t=>t.hitHeads.length)),
   winningSlots:slots.filter(t=>t.hitHeads.length>0).length}];
 }));
 const persistVsReappear=Object.fromEntries(['persistido','reaparece','no_visto'].map(k=>{
  const relevant=rows.flatMap(n=>n.traces.filter(t=>k==='persistido'?t.persisted:k==='reaparece'?t.reappeared:!t.priorSeen));
  return [k,{slots:relevant.length,hitHeads:sum(relevant.map(t=>t.hitHeads.length))}];
 }));
 const priorityHeads=rows.flatMap(n=>n.wins.map(w=>({
  base:n.predictions.TOP2.includes(w.rank),prior:n.predictions.FAMILIA_GANO_HOY.includes(w.rank)})));
 const both=priorityHeads.filter(x=>x.base&&x.prior).length;
 return {nights:rows.length,top10Heads:sum(rows.map(x=>x.hitCount)),
  policies:scores,sharedBaselineAndPrior:both,
  exclusivePrior:priorityHeads.filter(x=>x.prior&&!x.base).length,
  exclusiveBaseline:priorityHeads.filter(x=>x.base&&!x.prior).length,
  rankMovement,persistVsReappear,
  withAnyPriorWinner:rows.filter(x=>x.traces.some(t=>t.priorWon)).length};
}
const periods=['JUN_JUL','AGO_SEP','OCT_1_24','OCT_26_28','ALL'];
const results=Object.fromEntries(periods.map(p=>[p,reportNightSet(nights.filter(x=>p==='ALL'||period(x.date)===p))]));
if(results.ALL.policies.TOP2!==27||results.ALL.policies.FAMILIA_GANO_HOY!==41||
 results.ALL.top10Heads!==140)throw Error('No coincide baseline top2 (27) vs repetidas (41): '+JSON.stringify(results.ALL.policies));
// "adaptativo": elige entre Top2 y familias ganadoras del día usando resultados
// de LAS 5 o 6 jornadas anteriores. Solo diagnóstico, no selector aceptado.
const adaptive:Record<string,any>={};
for(const lookback of [5,6]){
 const evaluated=[] as {date:string;policy:string;observed:number;base:number;prior:number;pastPriorNet:number}[];
 for(let i=lookback;i<nights.length;i++){
  const priorN=nights.slice(i-lookback,i);
  const deltaPrior=sum(priorN.map(n=>n.wins.filter(w=>n.predictions.FAMILIA_GANO_HOY.includes(w.rank)).length-
   n.wins.filter(w=>n.predictions.TOP2.includes(w.rank)).length));
  const rule=deltaPrior>0?'FAMILIA_GANO_HOY':'TOP2';
  const n=nights[i];const wins=n.wins;
  evaluated.push({date:n.date,policy:rule,
   observed:wins.filter(w=>n.predictions[rule].includes(w.rank)).length,
   base:wins.filter(w=>n.predictions.TOP2.includes(w.rank)).length,
   prior:wins.filter(w=>n.predictions.FAMILIA_GANO_HOY.includes(w.rank)).length,
   pastPriorNet:deltaPrior});
 }
 adaptive['VENTANA_'+lookback]={
  nights:evaluated.length,
  selectedPrior:evaluated.filter(x=>x.policy==='FAMILIA_GANO_HOY').length,
  hitsAdaptive:sum(evaluated.map(x=>x.observed)),
  hitsTop2:sum(evaluated.map(x=>x.base)),
  hitsPrior:sum(evaluated.map(x=>x.prior)),
  byPeriod:Object.fromEntries(periods.map(p=>{
   const s=evaluated.filter(x=>p==='ALL'||period(x.date)===p);
   return [p,{nights:s.length,chosenPrior:s.filter(x=>x.policy==='FAMILIA_GANO_HOY').length,
    hitsAdaptive:sum(s.map(x=>x.observed)),top2:sum(s.map(x=>x.base)),prior:sum(s.map(x=>x.prior))}];
  })),
  lastTen:evaluated.slice(-10)
 };
}
const lastSix=allDays.slice(-6).map(day=>({
 date:day[0].date,
 turns:day.map(n=>({turn:n.turn,
  headsTop10:n.wins.map(w=>({family:w.family,rank:w.rank,jur:w.jur,head:w.head})),
  top10:n.traces.map(t=>({rank:t.currentRank,family:t.family,
   firstSeenRank:t.firstSeenRank,lastSeenRank:t.lastSeenRank,
   prevWon:t.priorWon,winningTurn:t.lastWinningTurn,movement:t.movement,
   persisted:t.persisted,reappeared:t.reappeared,
   priorFiveNightWins:t.priorFiveNightWins,
   hitHeads:t.hitHeads})),
  twoFamilyObservation:n.predictions.FAMILIA_GANO_HOY}))
}));
const output={kind:'RETROSPECTIVE_PRE_RECONSTRUCTION_NOT_SEALED',
 dates:{first:dates[0],last:dates[dates.length-1]},
 baseline:{days:dates.length,cuts:rows.length,heads:base.heads,top2Nocturno:27,priorWonTop2Nocturno:41},
 definitions:{
  SUBE:'La familia ocupaba un puesto numéricamente mayor en su última aparición anterior del día',
  BAJA:'La familia ocupaba un puesto numéricamente menor en su última aparición anterior del día',
  IGUAL:'Mismo puesto que en la última aparición anterior del día',
  NUEVA:'No había aparecido en ningún Top10 anterior de ese día',
  priorWon:'La familia reversible exacta había acertado en el Top10 PRE de un turno anterior del día',
  history:'Seis jornadas anteriores para los Tops nocturnos, sin usar resultados del día objetivo'
 },
 results,adaptive,
 warnings:[
  'Todas las políticas de ranking alternativo fueron exploradas sobre el mismo histórico y no son predicciones selladas.',
  'La señal es de familias VT2 reversibles, no de orientación exacta ni de trayectorias físicas +11.',
  'Moverse en el ranking no es desplazarse físicamente en el tablero +11.',
  'El control Top2 es #1 y #2 de Lalo, y cada política usa exactamente dos familias, sin ampliar el cupo.',
  'Solo se miden aciertos de cabezas con familia realmente incluida en el Top10 Lalo. No se inventan sorteos.',
  'La política ganadora por pocos días puede sufrir sobreajuste, aun si la ventana de decisión no mira el objetivo.'
 ]};
const out='auditorias/vt2-trayectorias';
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(out+'/resumen.json',JSON.stringify(output,null,2)+'\n');
fs.writeFileSync(out+'/ventana-6-dias.json',JSON.stringify(lastSix,null,2)+'\n');
fs.writeFileSync(out+'/nocturnas-127.json',JSON.stringify(nights,null,2)+'\n');
console.log('VT2_TRAYECTORIAS_SUMMARY',JSON.stringify({
 baseline:output.baseline,results,adaptive,
 lastSix: lastSix.map(d=>({date:d.date,nightWinners:d.turns[4].headsTop10.map(w=>({
 rank:w.rank,family:w.family,head:w.head}))}))
}));
