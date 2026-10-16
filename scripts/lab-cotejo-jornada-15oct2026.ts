// Diagnóstico externo del 15/10/2026. NO modifica el motor ni rankings.
// El único PRE efectivamente sellado antes del sorteo es Previa (ver snapshot A/B).
// Los cuatro cortes posteriores son reconstrucciones cronológicas (replays), NO sellos.
import {writeFileSync,mkdirSync} from 'node:fs';
import {diaVacio,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {descargarCabezas} from '../src/cabezas';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import {auditVt3Family} from '../src/vt3Audit';
import {buildVt3Shadow} from '../src/vt3Shadow';

const date='2026-10-15';
const jurs=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos'] as const;
type Jur=typeof jurs[number];
// Comprobadas previamente contra Ruta1000 (jueves 15/10).
const official:Record<Turno,Record<Jur,string>>={
 Previa:{Ciudad:'1184',Provincia:'1918',Córdoba:'7563','Santa Fé':'5115','Entre Ríos':'0212'},
 Primera:{Ciudad:'0900',Provincia:'7595',Córdoba:'8242','Santa Fé':'9101','Entre Ríos':'8005'},
 Matutino:{Ciudad:'8997',Provincia:'4942',Córdoba:'4991','Santa Fé':'0244','Entre Ríos':'1301'},
 Vespertino:{Ciudad:'7654',Provincia:'2073',Córdoba:'4001','Santa Fé':'6076','Entre Ríos':'3897'},
 Nocturno:{Ciudad:'7791',Provincia:'9020',Córdoba:'6204','Santa Fé':'5197','Entre Ríos':'6624'}
};
function preCut(target:Turno,live:CabezasDia):CabezasDia{
 const out=diaVacio();
 for(const t of TURNOS.slice(0,TURNOS.indexOf(target))){
  for(const jur of jurs)out[t][jur]=official[t][jur];
  // Montevideo es una fila física. No se puntúa, pero sí influye en la hoja
  // una vez que el resultado fue publicado antes del turno objetivo.
  out[t]['Montevideo']=live[t]['Montevideo'];
 }
 return out;
}
function postCut(target:Turno,live:CabezasDia):CabezasDia{
 const out=preCut(target,live);
 for(const jur of jurs)out[target][jur]=official[target][jur];
 return out;
}
const familyOf=(head:string,n:2|3)=>
 reversibleFamily(head.slice(-n));
function countHeadAtRank(rank:number|null,top:number){return rank!==null&&rank<=top?1:0;}
async function main(){
 const dates=['2026-10-14','2026-10-13','2026-10-08','2026-10-07'] as const;
 const [prev,prevprev,week,weekprev,live15]=await Promise.all([
  ...dates.map(d=>descargarCabezas(d,true)),descargarCabezas(date,true)
 ]);
 const differences=[];
 for(const turn of TURNOS)for(const jur of jurs){
  const live=live15[turn][jur];
  if(live!==official[turn][jur])differences.push({turn,jur,source:live,verified:official[turn][jur]});
 }
 const sheetPrev=buildSheet(prev,prevprev);
 const sheetWeek=buildSheet(week,weekprev);
 const historical=[
  {date:'2026-10-14',period:'D−1' as const,sheet:sheetPrev},
  {date:'2026-10-08',period:'D−7' as const,sheet:sheetWeek}
 ];
 const rows:any[]=[];
 const turns:any[]=[];
 const geometricTurns:any[]=[];
 for(const turn of TURNOS){
  const input=preCut(turn,live15);
  const before=buildSheet(input,prev);
  const view=buildMotorLalo(before,date,turn,historical);
  const after=buildSheet(postCut(turn,live15),prev);
  const geo=buildVt3Shadow(before,date,turn,historical,view);
  const geoFamilies=geo.top.map((x,i)=>({...x,rank:i+1}));
  const winnersGeo=jurs.map(jur=>{
   const head=official[turn][jur],family=familyOf(head,3);
   const row=geoFamilies.find(x=>x.family===family);
   return {jur,head,family,rank:row?.rank??null,
    source:row?.source??null,cells:row?.cells??null,value:row?.value??null,
    anchored:row?.anchored??false,d1Distance:row?.d1Distance??null,
    d7Distance:row?.d7Distance??null,rootEvents:row?.rootEvents??null};
  });
  const geoWinnerEvidence=winnersGeo.filter(w=>w.rank!==null).map(w=>{
   const family=view.ranks.vt3.find(f=>f.family===w.family);
   const rootIds=new Set(family?.paths.flatMap(p=>p.rootIds)||[]);
   return {...w,officialRank:family?.rank??null,
    officialReasons:family?{d1:family.d1Roots,d7:family.d7Roots,
      branchBlocks:family.branchBlocks,physicalBlocks:family.physicalBlocks,
      sources:family.sourceCount}:null,
    officialPaths:family?.paths.map(p=>({source:p.sourceId,
      value:p.value,origin:p.origin,coords:p.path.map(c=>c.row+':'+c.col),
      roots:p.rootIds})),
    realRootReferences:view.roots.filter(r=>rootIds.has(r.id)).map(r=>({
      period:r.period,date:r.date,head:r.head,jurisdiction:r.jurisdiction,
      oldTurn:r.oldTurn,sourceId:r.sourceId,oldCells:r.oldCells
    }))
   };
  });
  geometricTurns.push({turn,geoWinnerEvidence,
   availableFamilies:geo.availableFamilies,allPhysicalRoutes:geo.routes,
   top3:geoFamilies.slice(0,3),top10:geoFamilies,
   winners:winnersGeo,
   matchCounts:{top3:winnersGeo.filter(x=>x.rank!==null&&x.rank<=3).length,
    top5:winnersGeo.filter(x=>x.rank!==null&&x.rank<=5).length,
    top10:winnersGeo.filter(x=>x.rank!==null&&x.rank<=10).length}
  });
  const stats={
   turn,cut:TURNOS.indexOf(turn),totalCandidates:{
    vt2:view.ranks.vt2.length,vt3:view.ranks.vt3.length,vt4:view.ranks.vt4.length},
   realPhysical:{vt2:0,vt3:0,vt4:0},
   rankedTop3:{vt2:0,vt3:0,vt4:0},
   rankedTop5:{vt2:0,vt3:0,vt4:0},
   rankedTop10:{vt2:0,vt3:0,vt4:0},
   candidatesOutsideTop10:{vt2:0,vt3:0,vt4:0},
   withoutCandidate:{vt2:0,vt3:0,vt4:0},
   heads:[] as any[]
  };
  for(const jur of jurs){
   const head=official[turn][jur];
   const match=after.matches[turn].find(m=>m.jurisdiccion===jur&&m.cabeza===head);
   const physical={
    vt2:!!match?.hits.some(h=>h.kind==='vt2'),
    vt3:!!match?.hits.some(h=>h.kind==='vt3'),
    vt4:!!match?.hits.some(h=>h.kind==='vt4')
   };
   const family2=familyOf(head,2),family3=familyOf(head,3);
   const ids:{vt2:string,vt3:string,vt4:string}={vt2:family2,vt3:family3,vt4:head};
   const ranks:{vt2:number|null,vt3:number|null,vt4:number|null}={
    vt2:view.ranks.vt2.find(x=>x.family===family2)?.rank||null,
    vt3:view.ranks.vt3.find(x=>x.family===family3)?.rank||null,
    vt4:view.ranks.vt4.find(x=>x.paths.some(p=>p.value===head))?.rank||null
   };
   const vt3Audit=auditVt3Family(before,view,turn,head);
   const entry={turn,jur,head,physical,families:ids,ranks,
    vt3Audit:vt3Audit?{
     status:vt3Audit.status,physicalRoutes:vt3Audit.physicalRoutes,
     admittedRoutes:vt3Audit.admittedRoutes,unadmittedRoutes:vt3Audit.unadmittedRoutes,
     independentRootEvents:vt3Audit.independentRootEvents,
     priorityReasons:vt3Audit.priorityReasons,
     explanation:vt3Audit.explanation}:null,
    rootEvents:{
     vt2:view.ranks.vt2.find(x=>x.family===family2)?.directRoots||0,
     vt3:view.ranks.vt3.find(x=>x.family===family3)?.directRoots||0
    },
    vt3SourceCount:view.ranks.vt3.find(x=>x.family===family3)?.sourceCount||0,
    vt3BranchBlocks:view.ranks.vt3.find(x=>x.family===family3)?.branchBlocks||0
   };
   rows.push(entry);stats.heads.push(entry);
   for(const kind of ['vt2','vt3','vt4'] as const){
    if(physical[kind])stats.realPhysical[kind]++;
    for(const cutoff of [3,5,10] as const)
     stats[('rankedTop'+cutoff) as 'rankedTop3'][kind]+=countHeadAtRank(ranks[kind],cutoff);
    if(ranks[kind]!==null&&(ranks[kind] as number)>10)stats.candidatesOutsideTop10[kind]++;
    if(ranks[kind]===null)stats.withoutCandidate[kind]++;
   }
  }
  turns.push(stats);
 }
 // Sello original, generado a las 01:23 de Argentina. Fuente: prospectivo-vt4-a-b-previa-15oct2026.
 const sealedVt3=['397/793','427/724','407/704','426/624','739/937','062/260','424/424','206/602','244/442','042/240'];
 const sealedRounds=[
  ['3397','3793'],['0427','0724'],['2407','2704'],['0426','0624'],
  ['3739','3937'],['4062','4260'],['0424'],['4206'],['0244','0442'],['4042','4240']
 ];
 const sealedConcentrated=[
  ['3397','3793'],['0427','0724'],['6724'],['4427'],['2407','2704'],
  ['6704'],['4407'],['0426','0624'],['7624'],['4426']
 ];
 const srow=jurs.map(jur=>{
  const head=official.Previa[jur],vt3=familyOf(head,3);
  const rank3=sealedVt3.indexOf(vt3)+1||null;
  const rounds=sealedRounds.findIndex(values=>values.includes(head));
  const concentrated=sealedConcentrated.findIndex(values=>values.includes(head));
  return {jur,head,vt3,vt3Rank:rank3,
   vt4RoundsExact:rounds<0?null:rounds+1,vt4ConcentratedExact:concentrated<0?null:concentrated+1};
 });
 const sealed={date,turn:'Previa',phase:'PRE_ANTES_DEL_SORTEO',
  atArgentina:'2026-10-15 01:23',note:'A/B sellado sin conocer cabezas objetivo; Santa Fé Nocturna 14/10 ausente',
  vt3Top10:sealedVt3,vt4RoundTop10:sealedRounds,
  vt4ConcentratedTop10:sealedConcentrated,comparisons:srow
 };
 const report={date,montevideoFromAppSource:Object.fromEntries(TURNOS.map(t=>[t,live15[t]['Montevideo']])),source:'Lotería pública validada + VivíTuSuerte históricos para reproducir cortes',
  type:'4 replays retrospectivos y 1 sello independiente de Previa; la Previa recreada NO reemplaza el sello',
  priorNocturno:Object.fromEntries(jurs.map(j=>[j,prev.Nocturno[j]])),
  sourceDifferences:differences,historicalSample:{
   day14Nocturno:Object.fromEntries(jurs.map(j=>[j,prev.Nocturno[j]])),
   day08Nocturno:Object.fromEntries(jurs.map(j=>[j,week.Nocturno[j]]))
  },
  sealed,turns,rows,geometricTurns};
 mkdirSync('lab-results',{recursive:true});
 writeFileSync('lab-results/COTEJO_15OCT2026.json',JSON.stringify(report,null,2));
 console.log('COTEJO_15OCT_2026_REPORT_START');
 console.log(JSON.stringify({sourceDifferences:differences,history:report.historicalSample,
  seal:sealed.comparisons,byTurn:turns.map(({heads,...metrics})=>metrics),
  geometry:geometricTurns,
  vt3HeadDetails:rows.map(({turn,jur,head,physical,families,ranks,rootEvents,vt3SourceCount,vt3BranchBlocks})=>
   ({turn,jur,head,physicalVT3:physical.vt3,actualFamily:families.vt3,rankVT3:ranks.vt3,
    physicalVT4:physical.vt4,rankVT4:ranks.vt4,rootEvents,vt3SourceCount,vt3BranchBlocks}))},null,2));
 console.log('COTEJO_15OCT_2026_REPORT_END');
}
main().catch(e=>{console.error('COTEJO_ERROR',e);process.exitCode=1});
