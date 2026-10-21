/**
 * Experimento predefinido COMPACTO:
 * 1) Lalo MV1 Top3; 2) AUX ganadoras Top3;
 * 3) 2 Lalo + 1 AUX; 4) Lalo Top6 reordenado si hay apoyo auxiliar;
 * 5) "Puente" dos hojas (hasta Top6 cada una, elegir Top3).
 * Control: mismo pool con orden aleatorio fijo.
 *
 * Para cada candidato medir familias (sin partir familia) y terminaciones
 * REALMENTE seleccionadas. En modalidad CON_PRESUPUESTO no puede sobrepasar
 * el número de terminaciones del MV1 Top3 en ese corte, preservando grupos.
 *
 * NUNCA genera candidatos con sorteos posteriores: los replays vienen de
 * salidas PRE y el soporte auxiliar se obtiene de cuadrícula PRE.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
type N=2|3|4;
type Mode='LALO_MV1'|'AUX_RAICES';
type Family={family:string;values:string[];roots:number;d1:number;d7:number;
 blocks:number;crossing:boolean};
type Support={sourceTurns:string[];crossTurn:boolean;newSecondSource:boolean;
 justAddedSources:string[];hadEarlier:boolean;physicalPaths:number};
type Cut={year:string;date:string;turn:string;heads:{jur:string;head:string}[];
 ranks:Record<N,Record<Mode,Family[]>>;
 auxPhysicalSupport:Record<N,Record<string,Support>>};
type Option='MV1'|'AUX'|'DOS_UNO'|'CONFIRMACION'|'PUENTE'|'AZAR_POOL';
const OPTIONS:Option[]=['MV1','AUX','DOS_UNO','CONFIRMACION','PUENTE','AZAR_POOL'];
const KINDS:N[]=[2,3,4];
const all:Cut[]=['2024','2025','2026'].flatMap(y=>{
 const src=JSON.parse(readFileSync('lab-results/lalo-triple-modalidad-'+y+'.json','utf8'));
 return (src.cuts as Cut[]).filter(c=>c.turn!=='Previa');
});
const hash=(s:string)=>{let h=2166136261;for(const ch of s){
 h^=ch.charCodeAt(0);h=Math.imul(h,16777619);
 }return h>>>0;};
const unique=<T>(values:T[])=>[...new Set(values)];
const familyKey=(x:Family)=>x.family;
const values=(families:Family[])=>new Set(families.flatMap(f=>f.values));
function rankPool(c:Cut,kind:N,option:Option){
 const lal=c.ranks[kind].LALO_MV1.slice(0,6);
 const aux=c.ranks[kind].AUX_RAICES.slice(0,6);
 const auxBy=new Map(aux.map((f,i)=>[f.family,{fam:f,rank:i+1}]));
 const lalBy=new Map(lal.map((f,i)=>[f.family,{fam:f,rank:i+1}]));
 // Lalo conserva prioridad ante familia idéntica y orientaciones distintas.
 const pool=unique([...lal,...aux].map(f=>f.family)).map(f=>
  lalBy.get(f)?.fam||auxBy.get(f)!.fam);
 if(option==='MV1')return lal;
 if(option==='AUX')return aux;
 if(option==='DOS_UNO'){
  const start=lal.slice(0,2);
  const add=aux.find(a=>!start.some(b=>b.family===a.family));
  return [...start,...(add?[add]:[]),...lal.slice(2),...aux];
 }
 const sup=c.auxPhysicalSupport[kind]||{};
 if(option==='CONFIRMACION')return [...lal].sort((a,b)=>{
  const score=(f:Family)=>{
   const t=sup[f.family],mate=auxBy.get(f.family);
   return [Number(!!mate),Number(!!t?.newSecondSource),
    Number((t?.sourceTurns.length||0)>=2),Number(!!t?.crossTurn),
    mate?.fam.roots||0];
  };
  const x=score(a),y=score(b);
  for(let j=0;j<x.length;j++)if(x[j]!==y[j])return y[j]-x[j];
  return (lalBy.get(a.family)?.rank||99)-(lalBy.get(b.family)?.rank||99);
 });
 if(option==='AZAR_POOL')return pool.sort((a,b)=>
  hash(c.date+'|'+c.turn+'|VT'+kind+'|pool|'+a.family)-
  hash(c.date+'|'+c.turn+'|VT'+kind+'|pool|'+b.family)||
  a.family.localeCompare(b.family));
 // PUENTE: (1) confirmado por ambos lectores, (2) segunda fuente nueva
 // (3) varias fuentes actuales, (4) historial propio, (5) lugar menor.
 return pool.sort((a,b)=>{
  const score=(f:Family)=>{
   const l=lalBy.get(f.family),u=auxBy.get(f.family),sp=sup[f.family];
   return [Number(!!l&&!!u),Number(!!sp?.newSecondSource),
    Number((sp?.sourceTurns.length||0)>=2),
    Number(!!l)+Number(!!u),Number(!!sp?.crossTurn),
    Math.max(0,7-Math.min(l?.rank||99,u?.rank||99))];
  };
  const x=score(a),y=score(b);
  for(let j=0;j<x.length;j++)if(x[j]!==y[j])return y[j]-x[j];
  return a.family.localeCompare(b.family);
 });
}
function choose(families:Family[],maxCount:number,budget:number|null):Family[]{
 const chosen:Family[]=[],covered=new Set<string>(),seen=new Set<string>();
 for(const family of families){
  if(chosen.length===maxCount)break;
  if(seen.has(family.family))continue;
  seen.add(family.family);
  const additions=family.values.filter(v=>!covered.has(v));
  if(additions.length===0)continue;
  if(budget!==null&&covered.size+additions.length>budget)continue;
  chosen.push(family);additions.forEach(v=>covered.add(v));
 }
 return chosen;
}
type RecordOne={hits:number;expected:number;tickets:number;raw:number;
 families:number;diffVsMv1Hits:number;diffVsMv1ChanceAdjusted:number};
type RankingRow={year:string;date:string;turn:string;kind:N;heads:number;
 method:Option;budgeted:boolean;chosen:Family[];rootSources:string[];
 baseline:RecordOne;result:RecordOne};
const rows:RankingRow[]=[];
const histDays=new Map<string,Record<N,number>>();
for(const c of all)for(const kind of KINDS){
 const baselineList=choose(rankPool(c,kind,'MV1'),3,null);
 const baselineRaw=values(baselineList).size;
 const payoff=(fs:Family[]):RecordOne=>{
  const terminal=values(fs);
  const hits=c.heads.filter(h=>terminal.has(h.head.slice(-kind))).length;
  return {hits,expected:c.heads.length*terminal.size/(10**kind),
   tickets:c.heads.length*terminal.size,raw:terminal.size,
   families:fs.length,diffVsMv1Hits:0,diffVsMv1ChanceAdjusted:0};
 };
 const base=payoff(baselineList);
 for(const option of OPTIONS)for(const budgeted of [false,true]){
  const order=rankPool(c,kind,option);
  const picked=option==='MV1'?baselineList:
   choose(order,3,budgeted?baselineRaw:null);
  const perf=payoff(picked);
  perf.diffVsMv1Hits=perf.hits-base.hits;
  perf.diffVsMv1ChanceAdjusted=(perf.hits-perf.expected)-(base.hits-base.expected);
  rows.push({year:c.year,date:c.date,turn:c.turn,kind,heads:c.heads.length,
   method:option,budgeted,chosen:picked,
   rootSources:picked.map(x=>{
    const sp=c.auxPhysicalSupport[kind]?.[x.family];
    return [x.family,sp?.sourceTurns.join('+')||'NO_AUX',sp?.newSecondSource?'NEW2':''].join(':');
   }),
   baseline:base,result:perf});
 }
}
function sum(rows:RankingRow[]){
 const keys=['hits','expected','tickets','raw','families','diffVsMv1Hits','diffVsMv1ChanceAdjusted'] as const;
 const stats=Object.fromEntries(keys.map(k=>[k,rows.reduce((x,r)=>x+r.result[k],0)])) as
  Record<typeof keys[number],number>;
 return {cuts:rows.length,heads:rows.reduce((n,x)=>n+x.heads,0),
  hit:stats.hits,expected:Number(stats.expected.toFixed(3)),
  excessVsUniform:Number((stats.hits-stats.expected).toFixed(3)),
  ratioVsUniform:stats.expected?Number((stats.hits/stats.expected).toFixed(3)):null,
  tickets:stats.tickets,avgRaw:rows.length?Number((stats.raw/rows.length).toFixed(3)):0,
  avgFamilies:rows.length?Number((stats.families/rows.length).toFixed(3)):0,
  differenceHits:stats.diffVsMv1Hits,
  differenceVsMv1Adjusted:Number(stats.diffVsMv1ChanceAdjusted.toFixed(3))};
}
const byYear=['2024','2025','2026'].map(year=>({
 year,turns:276,modalities:KINDS.map(kind=>({
 kind,
 byMethod:OPTIONS.map(method=>({
  method,open:sum(rows.filter(x=>x.year===year&&x.kind===kind&&x.method===method&&!x.budgeted)),
  budget:sum(rows.filter(x=>x.year===year&&x.kind===kind&&x.method===method&&x.budgeted))
 }))
 }))}));
const global=KINDS.map(kind=>({
 kind,
 byMethod:OPTIONS.map(method=>({
  method,open:sum(rows.filter(x=>x.kind===kind&&x.method===method&&!x.budgeted)),
  budget:sum(rows.filter(x=>x.kind===kind&&x.method===method&&x.budgeted))
 }))
}));
// Bootstrap pareado por día, y años estratificados. Diferencia observada
// (hits - esperados) del selector contra MV1, sin ajustar al período ganador.
let rng=hash('compact-2026-10-21');
const random=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return(rng>>>0)/4294967296;};
const confidence:Record<string,any>={};
for(const kind of KINDS)for(const method of OPTIONS.filter(x=>x!=='MV1'))
 for(const budgeted of [false,true]){
  const key='VT'+kind+'|'+method+'|'+(budgeted?'budget':'open');
  const groups=['2024','2025','2026'].map(year=>{
   const period=rows.filter(r=>r.year===year&&r.kind===kind&&r.method===method&&r.budgeted===budgeted);
   const dates=unique(period.map(r=>r.date));
   return dates.map(date=>period.filter(r=>r.date===date).reduce(
    (n,r)=>n+r.result.diffVsMv1ChanceAdjusted,0));
  });
  const original=groups.flat().reduce((a,b)=>a+b,0);
  const trial:number[]=[];
  for(let rep=0;rep<1999;rep++){
   let s=0;
   for(const g of groups)for(let i=0;i<g.length;i++)s+=g[Math.floor(random()*g.length)];
   trial.push(s);
  }
  trial.sort((a,b)=>a-b);
  confidence[key]={differenceAgainstMV1:Number(original.toFixed(3)),
   bootstrapCI95:[Number(trial[Math.floor(trial.length*.025)].toFixed(3)),
    Number(trial[Math.floor(trial.length*.975)].toFixed(3))],
   unit:'diferencia de exceso de aciertos sobre uniforme, muestreo por jornada'};
 }
const day20=rows.filter(r=>r.year==='2026'&&r.date==='2026-10-20'&&
 r.budgeted&&(['MV1','PUENTE','CONFIRMACION','DOS_UNO'] as Option[]).includes(r.method))
 .map(r=>({turn:r.turn,kind:r.kind,method:r.method,
  heads:r.result.hits,raw:r.result.raw,families:r.chosen.map(f=>f.family),
  sources:r.rootSources}));
const out={hypothesis:'Mismo Top3 y límite de terminaciones exactas que MV1, sin partir familias',
 noLeakage:'usa replays PRE ya reconstruidos, con soportes físicos auxiliares hasta turno anterior',
 cutoff:'01 agosto - 20 octubre 2024/2025/2026; Primera a Nocturno',
 budget:'tope de terminaciones igual a Top3 MV1 por corte. Puede quedar cupo sin usar',
 protocols:['MV1','AUX','DOS_UNO','CONFIRMACION','PUENTE','AZAR_POOL'],
 retrospective:'Configuraciones predefinidas ANTES de ver este barrido pero con historia previamente inspeccionada; no son validación independiente',
 years:byYear,overall:global,uncertainty:confidence,day20,rows};
mkdirSync('lab-results',{recursive:true});
writeFileSync('lab-results/lalo-top3-doble-hoja.json',JSON.stringify(out,null,2));
for(const data of byYear)console.log('PUENTE_ANO',JSON.stringify({year:data.year,
 results:data.modalidades.map(x=>({kind:x.kind,
  methods:x.byMethod.map(m=>({method:m.method,open:m.open,budget:m.budget}))}))}));
console.log('PUENTE_TOTAL',JSON.stringify({results:global,uncertainty:confidence}));
console.log('PUENTE_20OCT',JSON.stringify(day20));
