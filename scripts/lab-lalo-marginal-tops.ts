/**
 * Modelo Lalo / AUX · ANÁLISIS MARGINAL DE LOS PUESTOS 1..6.
 *
 * Solo consume replay PRE previamente computado. No genera cabezas ni tops
 * nuevos, no reentrena métodos, no modifica MV1.
 *
 * Unidad de exposición hipotética: una terminación distinta apostada una vez
 * en CADA jurisdicción del turno con cabeza disponible. Por lo tanto:
 * tickets = (# terminaciones por modalidad) * (# jurisdicciones activas).
 * Para cada tamaño n la esperanza de azar = tickets / 10^n.
 * Es una métrica de comparación, no la liquidación real de la quiniela.
 *
 * Se distingue un premio por modalidad / por jurisdicción y una cabeza
 * distinta cubierta entre modalidades. Si el ticket VT2 no se apuesta,
 * la coincidencia VT2 de una VT3 NO significa cobro de VT2.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';

type N=2|3|4;
type Mode='LALO_MV1'|'AUX_RAICES'|'AUX_GEOMETRIA'|'AUX_ALEATORIO';
type Family={family:string;values:string[]};
type Cut={
 year:string;date:string;turn:string;heads:{jur:string;head:string}[];
 ranks:Record<N,Record<Mode,Family[]>>;
};
const years=['2024','2025','2026'];
const kinds:N[]=[2,3,4];
const modes:Mode[]=['LALO_MV1','AUX_RAICES','AUX_GEOMETRIA','AUX_ALEATORIO'];
const cuts:Cut[]=years.flatMap(year=>{
 const x=JSON.parse(readFileSync('lab-results/lalo-triple-modalidad-'+year+'.json','utf8'));
 return x.cuts as Cut[];
}).filter(c=>c.turn!=='Previa');

type Contribution={hits:number;tickets:number;expected:number;activeCuts:number;
 extraNumbers:number};
const empty=():Contribution=>({hits:0,tickets:0,expected:0,activeCuts:0,extraNumbers:0});
const rnd=(n:number,d=3)=>Number(n.toFixed(d));
const selected=(c:Cut,kind:N,mode:Mode,k:number)=>
 new Set(c.ranks[kind][mode].slice(0,k).flatMap(x=>x.values));
function metric(c:Cut,kind:N,values:Set<string>):Contribution{
 const n=values.size,h=c.heads.length;
 return {hits:c.heads.filter(x=>values.has(x.head.slice(-kind))).length,
  tickets:n*h,expected:n*h/(10**kind),activeCuts:Number(n>0),extraNumbers:n};
}
function diff(a:Contribution,b:Contribution):Contribution{
 return {hits:a.hits-b.hits,tickets:a.tickets-b.tickets,
  expected:a.expected-b.expected,activeCuts:a.activeCuts-b.activeCuts,
  extraNumbers:a.extraNumbers-b.extraNumbers};
}
function plus(a:Contribution,b:Contribution):Contribution{
 return {hits:a.hits+b.hits,tickets:a.tickets+b.tickets,
  expected:a.expected+b.expected,activeCuts:a.activeCuts+b.activeCuts,
  extraNumbers:a.extraNumbers+b.extraNumbers};
}
function format(m:Contribution){
 return {...m,expected:rnd(m.expected),excessVsUniform:rnd(m.hits-m.expected),
  ratioVsUniform:m.expected>0?rnd(m.hits/m.expected):null,
  prizeMultiplierToBreakEven:m.hits>0?rnd(m.tickets/m.hits,1):null};
}
const totalsBy=(rows:Cut[],kind:N,mode:Mode,k:number)=>{
 let s=empty();
 for(const c of rows)s=plus(s,metric(c,kind,selected(c,kind,mode,k)));
 return s;
};
const group=(rows:Cut[],kind:N,mode:Mode)=>{
 const full=Array.from({length:7},(_,k)=>totalsBy(rows,kind,mode,k));
 return {byRank:full.slice(1).map((value,i)=>({
   rank:i+1,added:format(diff(value,full[i])),cumulative:format(value)
  })),
  top3:format(full[3]),top5:format(full[5]),top6:format(full[6]),
  addedRanks4and5:format(diff(full[5],full[3])),
  addedRank6:format(diff(full[6],full[5]))
 };
};
const yearReports=years.map(year=>{
 const rows=cuts.filter(c=>c.year===year);
 return {year,days:new Set(rows.map(c=>c.date)).size,cuts:rows.length,
  heads:rows.reduce((n,c)=>n+c.heads.length,0),
  modes:Object.fromEntries(modes.map(mode=>
   [mode,Object.fromEntries(kinds.map(kind=>[
    'VT'+kind,group(rows,kind,mode)
   ]))]))};
});
const allYear={years:years.join('+'),cuts:cuts.length,
 modes:Object.fromEntries(modes.map(mode=>[mode,
  Object.fromEntries(kinds.map(kind=>['VT'+kind,group(cuts,kind,mode)]))]))};
function combined(c:Cut,mode:Mode,allocation:{[k in N]:number}){
 const sets=kinds.map(kind=>selected(c,kind,mode,allocation[kind]));
 return {headsUnique:c.heads.filter(head=>kinds.some((kind,i)=>
  sets[i].has(head.head.slice(-kind)))).length,
  prizeEvents:c.heads.reduce((n,head)=>n+kinds.reduce((s,kind,i)=>
   s+Number(sets[i].has(head.head.slice(-kind))),0),0),
  tickets:sets.reduce((n,x)=>n+x.size*c.heads.length,0),
  rawNumbers:sets.reduce((n,x)=>n+x.size,0),
  byKind:Object.fromEntries(kinds.map((kind,i)=>['VT'+kind,{
   hits:c.heads.filter(x=>sets[i].has(x.head.slice(-kind))).length,
   tickets:sets[i].size*c.heads.length}]))};
}
const ALLOCATIONS=[
 {label:'VT2 1 + VT3 1 + VT4 1',2:1,3:1,4:1},
 {label:'VT2 3 + VT3 3 + VT4 3',2:3,3:3,4:3},
 {label:'VT2 5 + VT3 5 + VT4 5',2:5,3:5,4:5},
 {label:'VT2 3 + VT3 2 + VT4 1',2:3,3:2,4:1},
 {label:'VT2 2 + VT3 3 + VT4 1',2:2,3:3,4:1},
 {label:'VT2 4 + VT3 1 + VT4 1',2:4,3:1,4:1},
 {label:'VT2 4 + VT3 2 + VT4 0',2:4,3:2,4:0},
 {label:'VT2 2 + VT3 4 + VT4 0',2:2,3:4,4:0},
] as Array<{label:string;2:number;3:number;4:number}>;
function scenario(rows:Cut[],mode:Mode,a:typeof ALLOCATIONS[number]){
 const aggregate=rows.map(c=>combined(c,mode,a));
 const sum=(key:'headsUnique'|'prizeEvents'|'tickets'|'rawNumbers')=>
  aggregate.reduce((n,x)=>n+x[key],0);
 const byKind=Object.fromEntries(kinds.map(k=>['VT'+k,{
  hits:aggregate.reduce((n,x)=>n+x.byKind['VT'+k].hits,0),
  tickets:aggregate.reduce((n,x)=>n+x.byKind['VT'+k].tickets,0)
 }]));
 return {allocation:a.label,headsUnique:sum('headsUnique'),
  prizeEvents:sum('prizeEvents'),hypotheticalTickets:sum('tickets'),
  avgRawNumbersPerCut:rnd(sum('rawNumbers')/rows.length),
  distinctHeadsPer1000Tickets:rnd(1000*sum('headsUnique')/Math.max(1,sum('tickets'))),
  byKind};
}
const scenarios=years.map(year=>{
 const rows=cuts.filter(c=>c.year===year);
 return {year,scenario:Object.fromEntries(
  ['LALO_MV1','AUX_RAICES'].map(mode=>
   [mode,ALLOCATIONS.map(a=>scenario(rows,mode as Mode,a))]))};
});
function testIntegrity(){
 for(const c of cuts)for(const kind of kinds)for(const mode of modes){
  let earlier=new Set<string>();
  for(let rank=1;rank<=6;rank++){
   const now=selected(c,kind,mode,rank);
   if([...earlier].some(v=>!now.has(v)))throw Error('Ranking no acumulativo');
   const m=metric(c,kind,now),prev=metric(c,kind,earlier);
   if(m.hits<prev.hits||m.tickets<prev.tickets)
    throw Error('Aciertos o exposiciones negativos en incrementos');
   for(const f of c.ranks[kind][mode].slice(0,rank))
    for(const n of f.values)if(n.length!==kind)
     throw Error('Número de longitud incorrecta '+kind+' '+n);
   earlier=now;
  }
 }
}
testIntegrity();
// Un control sintético: un candidato repetido en dos familias no añade ticket.
const exampleCut:Cut={year:'2024',date:'2024-08-01',turn:'Primera',
 heads:[{jur:'Ciudad',head:'3142'},{jur:'Provincia',head:'0082'}],
 ranks:{2:{LALO_MV1:[{family:'24/42',values:['24','42']},
  {family:'42/24',values:['42','24']}],AUX_RAICES:[],AUX_GEOMETRIA:[],
  AUX_ALEATORIO:[]},3:{LALO_MV1:[],AUX_RAICES:[],AUX_GEOMETRIA:[],
  AUX_ALEATORIO:[]},4:{LALO_MV1:[],AUX_RAICES:[],AUX_GEOMETRIA:[],
  AUX_ALEATORIO:[]}}};
if(metric(exampleCut,2,selected(exampleCut,2,'LALO_MV1',2)).tickets!==4)
 throw Error('Se duplican apuestas de una misma terminación');
const result={description:'Aporte marginal de los puestos 1 a 6, familias y exposición real por jurisdicción',
 definition:'Una unidad de apuesta hipotética = una terminación exacta en una jurisdicción con cabeza publicada; apuesta en 1a cabeza solamente',
 date:'2026-10-21',
 rules:'Sin modificar Tops; cortes PRE solo Primera-Nocturno. No se trata de cobros reales.',
 years:yearReports,combined:allYear,scenarios,
 notes:[
  'TopK es K familias, no K números exactos apostables',
  'VT2 también es acierto propio. Un premio solo existe si se apuesta esa modalidad',
  'El punto de equilibrio es unidades de apuestas / premios por modalidad; no son pagos publicados',
  'Los rangos 4-6 pueden aportar hits sin aportar eficiencia; no elegir k por sobreajuste retrospectivo',
  'No confundir más coincidencias con mayor retorno monetario sin tabla real de premios'
 ]};
mkdirSync('lab-results',{recursive:true});
writeFileSync('lab-results/lalo-marginal-top1-top6.json',JSON.stringify(result,null,2));
for(const x of yearReports)console.log('MARGINAL_ANO',JSON.stringify({
 year:x.year,cuts:x.cuts,heads:x.heads,
 modos:Object.fromEntries(['LALO_MV1','AUX_RAICES'].map(m=>[m,
  Object.fromEntries(kinds.map(n=>['VT'+n,{
   byRank:x.modes[m]['VT'+n].byRank.map((v:any)=>({
    rank:v.rank,addedHits:v.added.hits,addedTickets:v.added.tickets,
    expected:v.added.expected,cumulativeHits:v.cumulative.hits
   })),
   top3:x.modes[m]['VT'+n].top3,top5:x.modes[m]['VT'+n].top5,
   extra4and5:x.modes[m]['VT'+n].addedRanks4and5
  }]))]))}));
for(const x of scenarios)console.log('MARGINAL_ESCENARIO',JSON.stringify(x));
console.log('MARGINAL_TOTAL',JSON.stringify({
 years:allYear.years,cuts:allYear.cuts,
 method:Object.fromEntries(['LALO_MV1','AUX_RAICES'].map(m=>[m,
 Object.fromEntries(kinds.map(n=>['VT'+n,{
  top3:allYear.modes[m]['VT'+n].top3,
  top5:allYear.modes[m]['VT'+n].top5,
  add4and5:allYear.modes[m]['VT'+n].addedRanks4and5,
  add6:allYear.modes[m]['VT'+n].addedRank6
 }]))]))}));
