/**
 * Selección geométrica del motor +11, sin cambiar candidatos ni MV1.
 * Replays PRE por turno. Familias contadas como equivalencias reversibles
 * VT2 / VT3, rutas contiguas ya derivadas por motor Lalo existente.
 * Evaluar periodos y diferencias PAREADAS entre Top3/5/10.
 */
import fs from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {previousDrawDay,shiftDay} from '../src/dates';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloFamily,LaloKind,LaloHistorical} from '../src/motorLalo';
const dates:string[]=[];
for(let day='2026-08-17';day<='2026-08-31';day=shiftDay(day,1))
 if(new Date(day+'T12:00:00').getDay()!==0)dates.push(day);
const CUTS=[3,5,10] as const,kindNames=['vt2','vt3'] as const;
const METHODS=['ORIGINAL','D1_PRIMERO','D7_PRIMERO',
 'FUENTES_PRIMERO','BLOQUES_PRIMERO','BIFURCACION_PRIMERO',
 'BIFURCACION_LUEGO_D1'] as const;
type Method=typeof METHODS[number];
type Kind=typeof kindNames[number];
const cache=new Map<string,Promise<CabezasDia>>();
function get(day:string):Promise<CabezasDia>{
 if(!cache.has(day))cache.set(day,descargarCabezas(day,true));
 return cache.get(day)!;
}
function preOnly(full:CabezasDia,target:Turno):CabezasDia{
 const masked=diaVacio();
 for(const t of TURNOS.slice(0,TURNOS.indexOf(target)))
  masked[t]={...full[t]};
 return masked;
}
function props(f:LaloFamily){
 return {
  d1:f.d1Roots,d7:f.d7Roots,total:f.directRoots,
  sources:f.sourceCount,blocks:f.physicalBlocks,
  branch:f.branchBlocks,activeBranch:f.branchBlocks>0?1:0
 };
}
const METHODS_KEYS:Record<Exclude<Method,'ORIGINAL'>,
 Array<keyof ReturnType<typeof props>>>={
 D1_PRIMERO:['d1','total','activeBranch','branch','d7','sources','blocks'],
 D7_PRIMERO:['d7','total','activeBranch','branch','d1','sources','blocks'],
 FUENTES_PRIMERO:['sources','activeBranch','branch','d1','d7','blocks'],
 BLOQUES_PRIMERO:['blocks','activeBranch','branch','d1','d7','sources'],
 BIFURCACION_PRIMERO:['branch','activeBranch','d1','d7','sources','blocks'],
 BIFURCACION_LUEGO_D1:['activeBranch','d1','branch','d7','sources','blocks']
};
function reorder(families:LaloFamily[],m:Method):LaloFamily[]{
 if(m==='ORIGINAL')return families;
 const attrs=METHODS_KEYS[m];
 return [...families].sort((a,b)=>{
  const x=props(a),y=props(b);
  for(const k of attrs)if(y[k]!==x[k])return y[k]-x[k];
  return a.rank-b.rank;
 }).map((f,i)=>({...f,rank:i+1}));
}
function periodOf(d:string){
 return d<='2026-08-23'?'AUG_17_23':
  d<='2026-08-31'?'AUG_24_31':
  d<='2026-09-14'?'SEP_01_14':
  d<='2026-09-30'?'SEP_15_30':
  d<='2026-10-21'?'OCT_01_21':'OCT_22';
}
const eventKey=(x:any)=>[x.date,x.turn,x.jur,x.head].join('|');
async function main(){
 const entries:any[]=[];
 for(const date of dates){
  const prior=previousDrawDay(date),prior2=previousDrawDay(prior);
  const week=shiftDay(date,-7),weekPrior=previousDrawDay(week);
  const [today,yesterday,before,weekDraw,weekBefore]=await Promise.all([
   get(date),get(prior),get(prior2),get(week),get(weekPrior)
  ]);
  const historic:LaloHistorical[]=[
   {date:prior,period:'D−1',sheet:buildSheet(yesterday,before)},
   {date:week,period:'D−7',sheet:buildSheet(weekDraw,weekBefore)}
  ];
  for(const turn of TURNOS){
   const visible=buildSheet(preOnly(today,turn),yesterday);
   const view=buildMotorLalo(visible,date,turn,historic);
   for(const kind of kindNames){
    const rankings=Object.fromEntries(METHODS.map(m=>[
     m,reorder(view.ranks[kind],m)
    ])) as Record<Method,LaloFamily[]>;
    for(const jur of JURS){
     const head=today[turn]?.[jur]||'';
     if(!/^\d{4}$/.test(head))continue;
     const suffix=head.slice(-Number(kind.slice(-1)));
     const family=reversibleFamily(suffix);
     const places={} as Record<Method,number|null>;
     for(const m of METHODS){
      const match=rankings[m].find(f=>f.family===family);
      places[m]=match?.rank||null;
     }
     const current=view.ranks[kind].find(x=>x.family===family);
     const evidence=current?{
      rank:current.rank,branch:current.branchBlocks,
      blocks:current.physicalBlocks,d1:current.d1Roots,
      d7:current.d7Roots,sources:current.sourceCount,
      roots:current.directRoots,pathCount:current.paths.length,
      sourcesList:[...new Set(current.paths.map(p=>p.sourceId))]
     }:null;
     entries.push({date,period:periodOf(date),turn,jur,head,
      kind,family,rankings:places,evidence,candidateCount:view.ranks[kind].length,
      sourceColumns:visible.columns.slice(0,TURNOS.indexOf(turn)+1).map(c=>c.id)});
    }
   }
  }
  console.log('LALO_DIA',date,entries.filter(x=>x.date===date).length);
 }
 if(entries.length<300)throw Error('Incompleto: '+entries.length+' entradas');
 const summary:any[]=[];
 for(const kind of kindNames)
  for(const period of ['AUG_17_23','AUG_24_31','TOTAL'] as const)
   for(const method of METHODS){
    const pool=entries.filter(e=>e.kind===kind&&
     (period==='TOTAL'||e.period===period));
    const hits=(k:number)=>pool.filter(e=>e.rankings[method]!==null&&
     e.rankings[method]<=k);
    const same=pool.filter(e=>e.rankings.ORIGINAL!==null&&
     e.rankings.ORIGINAL<=10&&e.rankings[method]!==null&&e.rankings[method]<=10).length;
    const won=pool.filter(e=>(e.rankings.ORIGINAL===null||
     e.rankings.ORIGINAL>10)&&e.rankings[method]!==null&&e.rankings[method]<=10).length;
    const lost=pool.filter(e=>e.rankings.ORIGINAL!==null&&e.rankings.ORIGINAL<=10&&
     (e.rankings[method]===null||e.rankings[method]>10)).length;
    summary.push({kind,period,method,examined:pool.length,
     top3:hits(3).length,top5:hits(5).length,top10:hits(10).length,
     gained10:won,lost10:lost,retained10:same,
     winners3:hits(3).map(e=>({date:e.date,turn:e.turn,jur:e.jur,head:e.head,
      family:e.family,rank:e.rankings[method]})),
     winners10:hits(10).map(e=>({date:e.date,turn:e.turn,jur:e.jur,head:e.head,
      family:e.family,rank:e.rankings[method]}))
    });
   }
 const byTurn:any[]=[];
 for(const kind of kindNames)for(const turn of TURNOS)for(const method of METHODS){
  const pool=entries.filter(e=>e.kind===kind&&e.turn===turn&&e.date<'2026-10-22');
  byTurn.push({kind,turn,method,total:pool.length,top3:pool.filter(e=>
   e.rankings[method]!==null&&e.rankings[method]<=3).length,
   top10:pool.filter(e=>e.rankings[method]!==null&&e.rankings[method]<=10).length});
 }
 const diagnostics=entries.filter(e=>e.kind==='vt3'&&e.date==='2026-10-22');
 const output='auditorias/lalo-selector-agosto-control-23oct/resultados';
 fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(output+'/resumen-por-bloques.json',JSON.stringify(summary,null,2));
 fs.writeFileSync(output+'/evaluacion-por-cabeza.json',JSON.stringify(entries,null,2));
 fs.writeFileSync(output+'/turnos.json',JSON.stringify(byTurn,null,2));
 const selected=summary.filter(e=>e.kind==='vt3').map(({period,method,examined,
  top3,top5,top10,gained10,lost10})=>({period,method,examined,
   top3,top5,top10,gained10,lost10}));
 console.log('LALO_VT3_PERIODOS',JSON.stringify(selected));
 console.log('LALO_VT2_PERIODOS',JSON.stringify(summary.filter(e=>e.kind==='vt2')
  .map(({period,method,examined,top3,top5,top10})=>({period,method,examined,top3,top5,top10}))));
 console.log('LALO_VT3_CASOS_22',JSON.stringify(diagnostics.filter(e=>e.evidence)
  .map(e=>({turn:e.turn,jur:e.jur,head:e.head,family:e.family,
   evidence:e.evidence,ranks:e.rankings}))));
}
void main().catch(e=>{console.error('LALO_SELECTOR_ERROR',e);process.exitCode=1});
