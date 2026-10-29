/**
 * LAB: asignación de hasta dos familias VT2 de Lalo sin ampliar presupuesto.
 * Prioridad por familia que GANÓ antes en la misma jornada y sigue en el
 * Top10 PRE del turno. No modifica el ranking ni el motor.
 */
import fs from 'node:fs';
import {TURNOS} from '../src/domain';
type Head={jur:string;head:string;family:string;position:number|null};
type Cut={date:string;turn:string;rankedFamilies:string[];heads:Head[]};
const src=JSON.parse(fs.readFileSync('auditorias/vt2-posiciones-libres/resultados.json','utf8'));
const rows=src.rows as Cut[];
if(rows.length!==635||src.baselineTop.top10!==674||src.baselineTop.top3!==220)
 throw Error('PRE de VT2 no coincide con base control');
const dates=[...new Set(rows.map(x=>x.date))].sort();
const byDate=new Map(rows.map(r=>[r.date+'|'+r.turn,r]));
const get=(date:string,turn:string)=>{const v=byDate.get(date+'|'+turn);
 if(!v)throw Error('Falta hoja PRE '+date+' '+turn);return v;};
const period=(date:string)=>date<='2026-07-31'?'JUN_JUL':
 date<='2026-09-30'?'AGO_SEP':date<='2026-10-24'?'OCT_1_24':'OCT_26_28';
type Detail={date:string;turn:string;period:string;heads:number;hits10:number;
 hitsTop2:number;hitsPriority:number;hitsSixHistory:number;
 priority:number[];wonFamilyRanks:number[];priorWinners:{turn:string;rank:number;family:string;head:string;jur:string}[];
 matches:{jur:string;head:string;family:string;rank:number;hitTop2:boolean;hitPriority:boolean}[]};
const out:Detail[]=[];
for(let i=0;i<dates.length;i++){
 const date=dates[i];const won:{turn:string;rank:number;family:string;head:string;jur:string}[]=[];
 const previous6=new Set<string>();
 for(const old of dates.slice(Math.max(0,i-6),i))
  for(const turn of TURNOS)for(const head of get(old,turn).heads)
   if(head.position!==null)previous6.add(head.family);
 for(const turn of TURNOS){
  const board=get(date,turn);const cur=board.rankedFamilies;
  const previousWon=new Set(won.map(x=>x.family));
  const wonFamilyRanks=cur.flatMap((f,j)=>previousWon.has(f)?[j+1]:[]);
  // Conservar orden del Top10 en la priorización: dos familias máximo.
  const priority=[...wonFamilyRanks,...cur.map((_,j)=>j+1).filter(j=>!wonFamilyRanks.includes(j))].slice(0,2);
  const fromHistory=cur.flatMap((f,j)=>previous6.has(f)?[j+1]:[]);
  const historyPriority=[...fromHistory,...cur.map((_,j)=>j+1).filter(j=>!fromHistory.includes(j))].slice(0,2);
  const match=board.heads.filter(h=>h.position!==null).map(h=>({
   jur:h.jur,head:h.head,family:h.family,rank:h.position!,
   hitTop2:h.position!<=2,hitPriority:priority.includes(h.position!),
  }));
  out.push({date,turn,period:period(date),heads:board.heads.length,hits10:match.length,
   hitsTop2:match.filter(x=>x.hitTop2).length,
   hitsPriority:match.filter(x=>x.hitPriority).length,
   hitsSixHistory:match.filter(x=>historyPriority.includes(x.rank)).length,
   priority,wonFamilyRanks,priorWinners:[...won],matches:match});
  for(const head of match)won.push({turn,rank:head.rank,family:head.family,head:head.head,jur:head.jur});
 }
}
function summarize(rows:Detail[]){
 const accum=Object.fromEntries(TURNOS.map(turn=>[turn,{} as any]));
 for(const turn of TURNOS){
  const sub=rows.filter(x=>x.turn===turn);
  accum[turn]={days:sub.length,top10:sub.reduce((n,x)=>n+x.hits10,0),
   top2:sub.reduce((n,x)=>n+x.hitsTop2,0),
   withPriorFamily:sub.reduce((n,x)=>n+x.hitsPriority,0),
   withSixPreviousDays:sub.reduce((n,x)=>n+x.hitsSixHistory,0)};
 }
 return accum;
}
const periods=['JUN_JUL','AGO_SEP','OCT_1_24','OCT_26_28'];
const byPeriod=Object.fromEntries([...periods,'ALL'].map(p=>[p,
 summarize(p==='ALL'?out:out.filter(x=>x.period===p))]));
const all=byPeriod.ALL;
if(out.length!==635||dates.length!==127||out.reduce((n,x)=>n+x.heads,0)!==3401||
 Object.values(all).reduce((n:any,x:any)=>n+x.top10,0)!==674||
 all.Nocturno.top2!==27||all.Nocturno.withPriorFamily!==41||
 all.Nocturno.withSixPreviousDays!==28)
 throw Error('Invariantes de estudio no reproducidas '+JSON.stringify(all));
const night=out.filter(x=>x.turn==='Nocturno');
let onlyPriority=0,onlyTop2=0,shared=0;
const deltaPerDay:number[]=[];
for(const r of night){
 let d=0;
 for(const head of r.matches){
  if(head.hitPriority&&!head.hitTop2){onlyPriority++;d++}
  else if(head.hitTop2&&!head.hitPriority){onlyTop2++;d--}
  else if(head.hitPriority&&head.hitTop2)shared++;
 }
 deltaPerDay.push(d);
}
let seed=20261029;
const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
const draws=[] as number[];
for(let z=0;z<12000;z++){
 let v=0;for(let i=0;i<deltaPerDay.length;i++)v+=deltaPerDay[Math.floor(rand()*deltaPerDay.length)];
 draws.push(v);
}
draws.sort((a,b)=>a-b);
const summary={kind:'EXPLORATORY_RETROSPECTIVE_PRE_RECONSTRUCTION',
 source:'Lalo MV1 VT2 sin alterar la selección oficial',
 days:dates.length,cuts:out.length,heads:3401,
 byPeriod,
 nocturnalPaired:{shared,onlyPriority,onlyTop2,
  net:onlyPriority-onlyTop2,
  dayBootstrap95:[draws[Math.floor(draws.length*.025)],draws[Math.floor(draws.length*.975)]]},
 note:'Prior family winners only from earlier turns; exact winner head/orientation not needed to define reversible VT2 family. No prospective validation.'};
const dest='auditorias/vt2-relaciones-familias';
fs.mkdirSync(dest,{recursive:true});
fs.writeFileSync(dest+'/dos-familias-resumen.json',JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(dest+'/dos-familias-cortes.json',JSON.stringify(out,null,2)+'\n');
console.log('VT2_FAMILIAS_DOS_CUPOS',JSON.stringify(summary));
