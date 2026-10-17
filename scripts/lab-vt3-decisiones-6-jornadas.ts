// Auditoría PRE de decisiones VT3: 6 jornadas completas de octubre.
// SOLAMENTE cuentan cabezas con terminación VT3 físicamente formada en +11.
// No se evalúan ni se usan para extraer reglas las cabezas NO formables.
// No modifica el motor. Alternativas de ranking fijadas ANTES de ver salidas.
import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {descargarCabezas} from '../src/cabezas';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {Turno,CabezasDia} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {SourceId} from '../src/sheet';
import {allPhysicalVt3,buildVt3Shadow} from '../src/vt3Shadow';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloFamily,LaloHistorical} from '../src/motorLalo';

const targetDates=['2026-10-10','2026-10-12','2026-10-13',
 '2026-10-14','2026-10-15','2026-10-16'];
const historyFrom='2026-10-01',historyTo='2026-10-16';
const targetJur=JURS.filter(j=>j!=='Montevideo');
const sources:SourceId[]=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const dated=(x:string)=>Date.parse(x+'T12:00:00Z');
const back=(date:string,n:number)=>
 new Date(dated(date)-n*86400000).toISOString().slice(0,10);
const calendar=(a:string,b:string)=>{
 const result:string[]=[];for(let d=dated(a);d<=dated(b);d+=86400000)
  result.push(new Date(d).toISOString().slice(0,10));return result;
};
const complete=(d:CabezasDia)=>TURNOS.every(turn=>targetJur.every(j=>
 /^\d{4}$/.test(d[turn][j])));
const hasBase=(d:CabezasDia)=>targetJur.some(j=>/^\d{4}$/.test(d.Nocturno[j]));
const reverseKey=(p:{row:number;col:number}[])=>
 [p.map(c=>c.row+':'+c.col).join('>'),[...p].reverse().map(c=>c.row+':'+c.col).join('>')].sort()[0];
type Physical={source:SourceId;cells:string[];value:string};
type FamilyPhysical={family:string;paths:Physical[];sources:SourceId[]};
function physicalFamilies(sheet:ReturnType<typeof buildSheet>,turn:Turno){
 const out=new Map<string,FamilyPhysical>();
 for(const column of sheet.columns.slice(0,TURNOS.indexOf(turn)+1)){
  for(const path of allPhysicalVt3(column.values)){
   const value=path.map(c=>c.digit).join(''),family=reversibleFamily(value);
   let row=out.get(family);
   if(!row){row={family,paths:[],sources:[]};out.set(family,row)}
   if(!row.sources.includes(column.id))row.sources.push(column.id);
   const key=reverseKey(path);
   if(!row.paths.some(p=>p.source===column.id&&
    reverseKey(p.cells.map(c=>{const [r,k]=c.split(':').map(Number);return {row:r,col:k}}))===key)){
    row.paths.push({source:column.id,value,cells:path.map(c=>c.row+':'+c.col)});
   }
  }
 }
 return out;
}
type Scheme='OFICIAL'|'RAIZ_D1_PRIMERO'|'RAIZ_TOTAL_PRIMERO';
const schemes:Scheme[]=['OFICIAL','RAIZ_D1_PRIMERO','RAIZ_TOTAL_PRIMERO'];
const cmp=(a:number[],b:number[])=>{
 for(let i=0;i<Math.max(a.length,b.length);i++){
  const d=(b[i]||0)-(a[i]||0);if(d)return d;
 }return 0;
};
export function rankWithoutNewCandidates(original:LaloFamily[],scheme:Scheme):LaloFamily[]{
 if(scheme==='OFICIAL')return original;
 const key=(x:LaloFamily):number[]=>
  scheme==='RAIZ_D1_PRIMERO'?
  [Number(x.d1Roots>0),x.d1Roots,Number(x.d7Roots>0),x.d7Roots,
   Number(x.branchBlocks>0),x.branchBlocks,x.sourceCount,x.physicalBlocks]:
  [Number(x.directRoots>0),x.directRoots,Number(x.branchBlocks>0),
   x.branchBlocks,x.d1Roots,x.d7Roots,x.sourceCount,x.physicalBlocks];
 return [...original].sort((a,b)=>cmp(key(a),key(b))||a.rank-b.rank);
}
type Head={jur:string;head:string;family:string;originSources:SourceId[];
 physicalPaths:Physical[];admitted:boolean;rankOfficial:number|null;
 rankD1:number|null;rankRoots:number|null;geometryRank:number|null;
 familyTraits:{d1:number;d7:number;direct:number;branch:number;
  sources:number;blocks:number;state:string}|null};
type Cut={date:string;turn:Turno;headsPhysical:Head[];
 physicallyAvailableFamilies:number;admittedFamilies:number;admittedNonWinners:number;
 variants:Record<Scheme,{top3:number;top5:number;top6:number;top10:number;
  familiesTop6:string[]}>;geometry:{top3:number;top5:number;top6:number};
 rankedFamilyRows:{family:string;hit:number;rank:number;rankD1:number;rankRoots:number;
 d1:number;d7:number;roots:number;branches:number;blocks:number;
 sourceCount:number;source:SourceId|null}[];
 negativeControls:{rootOnly:{families:number;heads:number};branch:{families:number;heads:number};
 rootAndBranch:{families:number;heads:number};neither:{families:number;heads:number}};
};
function classify(f:LaloFamily){
 return f.directRoots>0&&f.branchBlocks===0?'rootOnly':
  f.directRoots>0&&f.branchBlocks>0?'rootAndBranch':
  f.branchBlocks>0?'branch':'neither';
}
async function main(){
 const allDates=calendar(historyFrom,historyTo);
 const downloaded=await Promise.all(allDates.map(async date=>{
  let result:CabezasDia|null=null;
  for(let attempt=0;attempt<3&&!result;attempt++)try{
   result=await descargarCabezas(date,true);
  }catch(e){if(attempt===2)throw Error('Descarga: '+date+': '+String(e))}
  return {date,heads:result!};
 }));
 const byDate=new Map(downloaded.map(x=>[x.date,x]));
 for(const date of targetDates){
  const row=byDate.get(date);
  if(!row||!complete(row.heads))
   throw Error('Jornada objetivo incompleta: '+date);
 }
 const drawDays=downloaded.filter(x=>hasBase(x.heads));
 const drawIndex=new Map(drawDays.map((d,i)=>[d.date,i]));
 for(const date of targetDates)if(!drawIndex.has(date))
  throw Error('Día incompleto/nocturna ausente '+date);
 const sheets=new Map<string,ReturnType<typeof buildSheet>>();
 for(let i=1;i<drawDays.length;i++)sheets.set(drawDays[i].date,
  buildSheet(drawDays[i].heads,drawDays[i-1].heads));
 const cuts:Cut[]=[];
 for(const date of targetDates){
  const day=byDate.get(date)!;
  const index=drawIndex.get(date)!;
  if(index<1)throw Error('Sin Nocturna previa '+date);
  const prior=drawDays[index-1];
  const d7=byDate.get(back(date,7));
  const hist:LaloHistorical[]=[{
   date:prior.date,period:'D−1',
   sheet:sheets.get(prior.date)||buildSheet(prior.heads,drawDays[index-2].heads)
  }];
  if(d7&&hasBase(d7.heads)){
   const idx=drawIndex.get(d7.date);
   if(idx===undefined||idx<1)throw Error('Sin base de D-7 '+d7.date);
   hist.push({date:d7.date,period:'D−7',sheet:sheets.get(d7.date)||
    buildSheet(d7.heads,drawDays[idx-1].heads)});
  }
  for(const turn of TURNOS){
   const current=diaVacio(),idx=TURNOS.indexOf(turn);
   for(const t of TURNOS.slice(0,idx))
    for(const j of JURS)current[t][j]=day.heads[t][j];
   const pre=buildSheet(current,prior.heads);
   if(pre.heads[turn].length!==0||pre.matches[turn].length!==0)
    throw Error('Fuga de cabezas objetivo '+date+' '+turn);
   const physical=physicalFamilies(pre,turn);
   const model=buildMotorLalo(pre,date,turn,hist);
   const geometry=buildVt3Shadow(pre,date,turn,hist,model);
   const alternatives=Object.fromEntries(schemes.map(s=>[
    s,rankWithoutNewCandidates(model.ranks.vt3,s)])) as Record<Scheme,LaloFamily[]>;
   const rankMaps=Object.fromEntries(schemes.map(s=>[
    s,new Map(alternatives[s].map((x,i)=>[x.family,i+1]))])) as
    Record<Scheme,Map<string,number>>;
   const geoRanks=new Map(geometry.top.map((x,i)=>[x.family,i+1]));
   const eligibleHeads:Head[]=[];
   for(const jur of targetJur){
    const head=day.heads[turn][jur];
    const family=reversibleFamily(head.slice(-3));
    const witness=physical.get(family);
    if(!witness)continue; // Exclusión TOTAL de cabezas no formables.
    const official=model.ranks.vt3.find(x=>x.family===family);
    eligibleHeads.push({jur,head,family,
     originSources:witness.sources,physicalPaths:witness.paths,
     admitted:!!official,rankOfficial:rankMaps.OFICIAL.get(family)||null,
     rankD1:rankMaps.RAIZ_D1_PRIMERO.get(family)||null,
     rankRoots:rankMaps.RAIZ_TOTAL_PRIMERO.get(family)||null,
     geometryRank:geoRanks.get(family)||null,
     familyTraits:official?{d1:official.d1Roots,d7:official.d7Roots,
      direct:official.directRoots,branch:official.branchBlocks,
      sources:official.sourceCount,blocks:official.physicalBlocks,
      state:official.state}:null});
   }
   const hitMap=new Map<string,number>();
   for(const h of eligibleHeads)hitMap.set(h.family,(hitMap.get(h.family)||0)+1);
   const rankedFamilyRows=model.ranks.vt3.map(f=>({
    family:f.family,hit:hitMap.get(f.family)||0,rank:f.rank,
    rankD1:rankMaps.RAIZ_D1_PRIMERO.get(f.family)!,
    rankRoots:rankMaps.RAIZ_TOTAL_PRIMERO.get(f.family)!,
    d1:f.d1Roots,d7:f.d7Roots,roots:f.directRoots,
    branches:f.branchBlocks,blocks:f.physicalBlocks,sourceCount:f.sourceCount,
    source:f.paths[0]?.sourceId||null
   }));
   const controls={rootOnly:{families:0,heads:0},branch:{families:0,heads:0},
    rootAndBranch:{families:0,heads:0},neither:{families:0,heads:0}};
   for(const f of model.ranks.vt3){
    const type=classify(f);
    controls[type].families++;
    controls[type].heads+=hitMap.get(f.family)||0;
   }
   const variants=Object.fromEntries(schemes.map(s=>{
    const names=alternatives[s].map(x=>x.family);
    const count=(n:number)=>eligibleHeads.filter(x=>names.slice(0,n).includes(x.family)).length;
    return [s,{top3:count(3),top5:count(5),top6:count(6),top10:count(10),
     familiesTop6:names.slice(0,6)}];
   })) as Cut['variants'];
   const g=(n:number)=>eligibleHeads.filter(x=>geoRanks.get(x.family)!>0&&
    geoRanks.get(x.family)!<=n).length;
   cuts.push({date,turn,headsPhysical:eligibleHeads,
    physicallyAvailableFamilies:physical.size,
    admittedFamilies:model.ranks.vt3.length,
    admittedNonWinners:model.ranks.vt3.filter(f=>!hitMap.has(f.family)).length,
    variants,geometry:{top3:g(3),top5:g(5),top6:g(6)},
    rankedFamilyRows,negativeControls:controls});
  }
 }
 if(cuts.length!==30||new Set(cuts.map(x=>x.date)).size!==6)
  throw Error('No se procesaron 30 PRE de seis jornadas cerradas');
 for(const cut of cuts){
  const totalHits=cut.headsPhysical.length;
  if(cut.variants.OFICIAL.top6>totalHits)throw Error('Acierto imposible');
  if(cut.rankedFamilyRows.length!==cut.admittedFamilies)throw Error('Se alteraron las familias admitidas');
  for(const s of schemes){
   const baseline=new Set(cut.rankedFamilyRows.map(x=>x.family));
   if(cut.variants[s].familiesTop6.some(x=>!baseline.has(x)))
    throw Error('Ranking alternativo inventó familia');
  }
 }
 const totals=(items:Cut[])=>{
  const qualifying=items.flatMap(x=>x.headsPhysical);
  const byScenario=Object.fromEntries(schemes.map(s=>[s,
   {top3:items.reduce((n,x)=>n+x.variants[s].top3,0),
    top5:items.reduce((n,x)=>n+x.variants[s].top5,0),
    top6:items.reduce((n,x)=>n+x.variants[s].top6,0),
    top10:items.reduce((n,x)=>n+x.variants[s].top10,0)}]));
  return {cuts:items.length,qualifiedHeads:qualifying.length,
   qualifiedAdmitted:qualifying.filter(x=>x.admitted).length,
   qualifiedNotAdmitted:qualifying.filter(x=>!x.admitted).length,
   officialAdmittedFamilies:items.reduce((n,x)=>n+x.admittedFamilies,0),
   physicallyAvailableFamilies:items.reduce((n,x)=>n+x.physicallyAvailableFamilies,0),
   byScenario,geometry:{
    top3:items.reduce((n,x)=>n+x.geometry.top3,0),
    top6:items.reduce((n,x)=>n+x.geometry.top6,0)},
   byRankBin:Object.fromEntries(['1–3','4–6','7–10','11+','NO_ADMITIDA'].map(bin=>[
    bin,qualifying.filter(x=>
     bin==='NO_ADMITIDA'?!x.admitted:
     x.rankOfficial!==null&&(
      bin==='1–3'?x.rankOfficial<=3:
      bin==='4–6'?x.rankOfficial>=4&&x.rankOfficial<=6:
      bin==='7–10'?x.rankOfficial>=7&&x.rankOfficial<=10:
       x.rankOfficial>=11)).length
   ])),
   traits:Object.fromEntries(['rootOnly','rootAndBranch','branch','neither'].map(k=>[
    k,{families:items.reduce((n,c)=>n+c.negativeControls[k as keyof typeof c.negativeControls].families,0),
       qualifiedHeads:items.reduce((n,c)=>n+c.negativeControls[k as keyof typeof c.negativeControls].heads,0)}]))
  };
 };
 const total=totals(cuts);
 const report={protocol:{
  period:targetDates,mode:'RECONSTRUCCION_HISTORICA_SIN_PRE_SELLADO',
  eligible:'Cabezas con VT3 formado físicamente dentro de columna +11, otras no entran en numerador ni denominador analítico',
  fixedAlternatives:'D1-prioridad y raíz-total-prioridad sobre las mismas familias ya ADMITIDAS por Lalo; no crean candidatas',
  negativeControls:'Familias físicamente posibles y admitidas que no salieron; agrupadas por bifurcación y raíz',
  modelUnmodified:true,
  inputHash:createHash('sha256').update(JSON.stringify(targetDates.map(d=>
   [d,byDate.get(d)!.heads]))).digest('hex')
 },totals:total,byDate:Object.fromEntries(targetDates.map(d=>[
  d,totals(cuts.filter(x=>x.date===d))])),
 byTurn:Object.fromEntries(TURNOS.map(t=>[
  t,totals(cuts.filter(x=>x.turn===t))])),
 cases:cuts.filter(x=>x.headsPhysical.length>0).map(c=>({
  date:c.date,turn:c.turn,qualified:c.headsPhysical.length,
  qualifiedHeads:c.headsPhysical.map(h=>({
   head:h.head,jur:h.jur,family:h.family,
   physicallyValidSources:h.originSources,physicalPaths:h.physicalPaths,
   officialRank:h.rankOfficial,rootFirstRank:h.rankRoots,
   d1FirstRank:h.rankD1,geometryRank:h.geometryRank,
   traits:h.familyTraits
  })),
  officialTop6:c.variants.OFICIAL.familiesTop6,
  d1FirstTop6:c.variants.RAIZ_D1_PRIMERO.familiesTop6,
  rootFirstTop6:c.variants.RAIZ_TOTAL_PRIMERO.familiesTop6,
  admittedNonWinnerCount:c.admittedNonWinners,
  competingPhysicalCandidates:c.rankedFamilyRows.filter(f=>
   f.rank<=6||f.rankD1<=6||f.rankRoots<=6),
  admittedDistribution:c.negativeControls
 }))};
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/DECISIONES_VT3_ULTIMAS_6_JORNADAS.json',
  JSON.stringify(report,null,2)+'\n');
 console.log('DECISIONES_VT3_INICIO');
 console.log(JSON.stringify(report,null,2));
 console.log('DECISIONES_VT3_FIN');
}
main().catch(e=>{console.error(e);process.exitCode=1});
