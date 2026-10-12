/**
 * Modelo Lalo · auditoría de un día nuevo (12 octubre de 2026), sin alterar motor.
 * Preparar antes del objetivo, PRE aislado físicamente, POST en fase independiente.
 * No se mezcla una hija VT4 con su hermana ni se cuentan recorridos múltiples como aciertos.
 */
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {descargarCabezas} from '../src/cabezas';
import {TURNOS,JURS,diaVacio} from '../src/domain';
import type {Turno,CabezasDia} from '../src/domain';
import {buildSheet} from '../src/sheet';
import type {DailySheet} from '../src/sheet';
import {buildMotorLalo,reversibleFamily} from '../src/motorLalo';
import type {LaloKind,LaloHistorical} from '../src/motorLalo';

const DAY='2026-10-12',PREV='2026-10-10',PREV2='2026-10-09',D7='2026-10-05',D7BASE='2026-10-03';
const dir='resultados/modelo-lalo-12oct2026';
const KINDS:['vt2','vt3','vt4']=['vt2','vt3','vt4'];
const completed:Turno[]=['Previa','Primera','Matutino','Vespertino'];
mkdirSync(dir,{recursive:true});
const save=(file:string,body:any)=>writeFileSync(join(dir,file),JSON.stringify(body,null,2)+'\n');
const load=(file:string)=>JSON.parse(readFileSync(join(dir,file),'utf8'));
const validHead=(s:string)=>/^\d{4}$/.test(s);
const normalize=(d:CabezasDia)=>Object.fromEntries(TURNOS.map(t=>[t,Object.fromEntries(JURS.map(j=>[j,d[t][j]]))])) as CabezasDia;
function redact(todays:CabezasDia,turn:Turno):CabezasDia{
 const x=normalize(todays),i=TURNOS.indexOf(turn);
 for(const t of TURNOS.slice(i))for(const j of JURS)x[t][j]='----';
 return x;
}
async function prepare(){
 const dates=[DAY,PREV,PREV2,D7,D7BASE] as const;
 const out=await Promise.all(dates.map(async date=>{
  const rows=await descargarCabezas(date,true);
  const counts=Object.fromEntries(TURNOS.map(t=>[t,JURS.filter(j=>validHead(rows[t][j])).length]));
  console.log('FETCH',date,JSON.stringify(counts));
  return {date,rows};
 }));
 const x=Object.fromEntries(out.map(e=>[e.date,e.rows])) as Record<string,CabezasDia>;
 for(const date of [PREV,PREV2,D7,D7BASE]){
  assert.ok(JURS.some(j=>validHead(x[date].Nocturno[j])),'Falta Nocturna histórica de '+date);
 }
 const history:LaloHistorical[]=[
  {date:PREV,period:'D−1',sheet:buildSheet(x[PREV],x[PREV2])},
  {date:D7,period:'D−7',sheet:buildSheet(x[D7],x[D7BASE])}
 ];
 const preRows=completed.map(turn=>({
  date:DAY,turn,current:buildSheet(redact(x[DAY],turn),x[PREV]),history
 }));
 const postRows=completed.map(turn=>({
  date:DAY,turn,heads:Object.fromEntries(JURS.map(j=>[j,x[DAY][turn][j]]))
 }));
 // El PRE contiene cabezas viejas reales; jamás contiene ninguna cabeza futura.
 for(const p of preRows)for(const t of TURNOS.slice(TURNOS.indexOf(p.turn))){
  assert.equal(p.current.heads[t].length,0,'Cabezas futuras en entrada PRE');
  assert.equal(p.current.matches[t].length,0,'Marcas objetivo en entrada PRE');
 }
 save('INPUT_PRE.json',{asOf:DAY,periods:[PREV,D7],rows:preRows});
 save('OBJETIVOS_POST.json',{asOf:DAY,rows:postRows});
 console.log('PREPARADO: 4 cortes sellables; los objetivos están en archivo separado');
}
function pre(){
 // NO LEER OBJETIVOS_POST NI NINGÚN RESULTADO FUTURO.
 const rows=load('INPUT_PRE.json').rows as {date:string;turn:Turno;current:DailySheet;history:LaloHistorical[]}[];
 const report=[];
 for(const row of rows){
  assert.equal(row.current.heads[row.turn].length,0);
  const m=buildMotorLalo(row.current,row.date,row.turn,row.history);
  const families=Object.fromEntries(KINDS.map(k=>[k,m.ranks[k].map(f=>({
   rank:f.rank,family:f.family,paths:f.paths.length,sourceCount:f.sourceCount,
   directRoots:f.directRoots,branchBlocks:f.branchBlocks,physicalBlocks:f.physicalBlocks,
   parentFamilies:f.parentFamilies,rationale:f.rationale
  }))]));
  report.push({date:row.date,turn:row.turn,roots:m.roots.length,families});
  console.log('PRE',row.turn,JSON.stringify(KINDS.map(k=>({
   kind:k,count:m.ranks[k].length,top3:m.ranks[k].slice(0,3).map(f=>f.family)
  }))));
 }
 save('PROPUESTAS_PRE.json',{note:'Candidatas congeladas sin resultados del 12/10',rows:report});
 console.log('PRE_OK');
}
function post(){
 const preRows=load('PROPUESTAS_PRE.json').rows;
 const actual=load('OBJETIVOS_POST.json').rows;
 const report=[];
 const totals=Object.fromEntries(KINDS.map(k=>[k,{eligibleCuts:0,top3:0,top5:0,top10:0,available:0,
  unavailable:0,covered4DigitHeads:0,expectedTop10:0}])) as Record<LaloKind,any>;
 for(let i=0;i<preRows.length;i++){
  const row=preRows[i],p=actual[i];assert.equal(row.turn,p.turn);
  const heads=Object.entries(p.heads as Record<string,string>)
   .filter(([j,h])=>j!=='Montevideo'&&validHead(h)).map(([jur,head])=>({jur,head}));
  const entry:any={turn:row.turn,heads,modalities:{}};
  for(const kind of KINDS){
   const n=Number(kind.slice(-1)),pool=row.families[kind] as {
    rank:number;family:string;paths:number;sourceCount:number;directRoots:number;
    branchBlocks:number;physicalBlocks:number;parentFamilies:string[];rationale:string
   }[];
   const targets=[...new Set(heads.map(({head})=>reversibleFamily(head.slice(-n))))];
   const hits=pool.filter(f=>targets.includes(f.family));
   const missed=heads.map(({jur,head})=>({jur,head,family:reversibleFamily(head.slice(-n)),
    rank:pool.find(f=>f.family===reversibleFamily(head.slice(-n)))?.rank||null}));
   const expected=pool.length?1-
     Array.from({length:Math.min(10,pool.length)},(_,x)=>x)
     .reduce((p,x)=>p*((pool.length-hits.length-x)/(pool.length-x)),1):0;
   const T=totals[kind];T.eligibleCuts+=Number(heads.length>0);
   T.top3+=Number(hits.some(f=>f.rank<=3));T.top5+=Number(hits.some(f=>f.rank<=5));
   T.top10+=Number(hits.some(f=>f.rank<=10));
   T.available+=Number(hits.length>0);T.unavailable+=Number(hits.length===0);
   T.covered4DigitHeads+=missed.filter(h=>h.rank!==null).length;
   T.expectedTop10+=expected;
   entry.modalities[kind]={
    pool:pool.length,targets,top3:pool.slice(0,3).map(f=>f.family),
    top5:pool.slice(0,5).map(f=>f.family),top10:pool.slice(0,10).map(f=>f.family),
    hits:missed,hitTop10:hits.filter(f=>f.rank<=10).map(f=>f.family),
    availableRanked:hits.map(f=>({
     family:f.family,rank:f.rank,routes:f.paths,sourceCount:f.sourceCount,
     directRoots:f.directRoots,parentFamilies:f.parentFamilies,rationale:f.rationale
    })),expectedTop10:expected
   };
  }
  report.push(entry);
  console.log('POST',entry.turn,heads.length,'argentinas',JSON.stringify(KINDS.map(k=>({
   kind:k,top3:entry.modalities[k].hitTop10.slice(0,3),
   winners:entry.modalities[k].hits.map((x:any)=>x.family+'@'+(x.rank||'NO RECUPERADA'))
  }))));
 }
 save('CONTRASTE_POST.json',{date:DAY,cuts:report.length,report,totals,
  note:'No se actualizó ni calibró el motor con estos objetivos. Muestra de 4 cortes exploratoria.'});
 const csv=['Turno,Jurisdicción,Cabeza,Modalidad,Familia,Puesto,Estado'];
 for(const row of report)for(const kind of KINDS)for(const x of row.modalities[kind].hits)
  csv.push([row.turn,x.jur,x.head,kind,x.family,x.rank||'',
    x.rank===null?'NO RECUPERADA':x.rank<=10?'TOP10':'FUERA TOP10'].join(','));
 writeFileSync(join(dir,'DIAGNOSTICO_POR_CABEZA.csv'),csv.join('\n')+'\n');
 console.log('BALANCE_CUATRO_TURNOS',JSON.stringify(totals));
}
const mode=process.argv[2];if(mode==='prepare')await prepare();else if(mode==='pre')pre();
else if(mode==='post')post();else throw Error('Usar prepare|pre|post');
