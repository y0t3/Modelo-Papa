import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {buildSheet} from '../src/sheet';
import type {DailySheet} from '../src/sheet';
import {diaVacio,JURS,TURNOS} from '../src/domain';
import type {CabezasDia,Turno} from '../src/domain';
import {shiftDay} from '../src/dates';
import {buildMotorLalo,compareMotorLaloAfterDraw,reversibleFamily} from '../src/motorLalo';
import type {LaloHistorical,LaloKind} from '../src/motorLalo';

const dir='resultados/replay-lalo-115';
mkdirSync(dir,{recursive:true});
const jurs=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const kinds:['vt2','vt3','vt4']=['vt2','vt3','vt4'];
const src='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const SHA='7e393c54b073cae83ae972b8511e533b61fbc087fe574a8dde84ae9100530217';
const sha=(v:Buffer|string)=>createHash('sha256').update(v).digest('hex');
const json=(s:string)=>JSON.parse(readFileSync(join(dir,s),'utf8'));
const save=(name:string,v:unknown)=>writeFileSync(join(dir,name),JSON.stringify(v,null,2)+'\n');

function prepare(){
 const gz=readFileSync(src,'utf8').trim();
 const raw=gunzipSync(Buffer.from(gz,'base64'));
 assert.equal(sha(raw),SHA,'Los datos históricos cambiaron');
 const rawDays=JSON.parse(raw.toString()) as Record<string,string[][]>;
 const days=Object.keys(rawDays).sort();
 assert.equal(days.length,30);
 const turnMap=new Map(TURNOS.map((t,i)=>[t,i]));
 const draw=(d:string):CabezasDia=>{
  const day=rawDays[d];assert.ok(day,'Falta jornada histórica '+d);
  const result=diaVacio();
  for(let t=0;t<TURNOS.length;t++)for(let j=0;j<jurs.length;j++)
   result[TURNOS[t]][jurs[j]]=day[t][j];
  return result;
 };
 const evaluation=days.filter(d=>d>='2026-09-15');
 assert.equal(evaluation.length,23,'23 jornadas objetivo');
 const pre=[],post=[];
 for(const date of evaluation){
  const prev=days.filter(d=>d<date),d1=prev.at(-1),d2=prev.at(-2);
  const d7=shiftDay(date,-7);
  assert.ok(d1&&d2);
  const day=draw(date);
  for(const turn of TURNOS){
   const ti=turnMap.get(turn)!;
   // Preparar el PRE SIN la cabeza objetivo ni turnos posteriores.
   const current=draw(date);
   for(const t of TURNOS.slice(ti))for(const j of JURS)current[t][j]='----';
   const targetHeads=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos']
    .map(j=>day[turn][j]).filter(x=>/^\d{4}$/.test(x));
   const past:LaloHistorical[]=[
    {date:d1,period:'D−1',sheet:buildSheet(draw(d1),draw(d2))}
   ];
   if(rawDays[d7]){
    const index=days.indexOf(d7),prevWeek=days[index-1];
    assert.ok(prevWeek,'Falta base Nocturna histórica de D−7');
    past.push({date:d7,period:'D−7',sheet:buildSheet(draw(d7),draw(prevWeek))});
   }
   // Serializar únicamente las estructuras anteriores al turno objetivo.
   // No escribir cabezas del turno objetivo en ninguna parte de PRE_INPUT.
   pre.push({date,turn,
    current:buildSheet(current,draw(d1)),
    history:past});
   post.push({date,turn,targetHeads});
  }
 }
 assert.equal(pre.length,115);
 save('INPUT_PRE_115.json',{description:'Sólo información cronológicamente anterior al turno; ningún objetivo del corte',rows:pre});
 save('OBJETIVOS_POST_115.json',{description:'Sólo resultados; prohibido durante ejecución PRE',rows:post});
 console.log('PREPARE_115_OK: 30 fechas crudas, 23 jornadas, 115 cortes, sha',SHA);
}

function runPre(){
 // ¡Nunca abrir ni importar OBJETIVOS_POST_115.json aquí!
 const input=json('INPUT_PRE_115.json');
 assert.equal(input.rows.length,115);
 const reports=[];
 let count=0;
 for(const row of input.rows){
  const {date,turn,current,history}=row as {
   date:string;turn:Turno;current:DailySheet;history:LaloHistorical[]};
  assert.ok(history.every(h=>h.date<date));
  assert.equal(current.heads[turn].length,0,
   'Fuga de objetivo en PRE');
  const t=TURNOS.indexOf(turn);
  for(const c of current.columns.slice(t+1))
   assert.ok(c.values.every(v=>v==='--'),'Fuga de columna posterior a PRE');
  const m=buildMotorLalo(current,date,turn,history);
  const rankings={} as Record<LaloKind,{pool:string[];top:{
   family:string;rank:number;paths:number;sourceCount:number;
   physicalBlocks:number;directRoots:number;parentFamilies:string[];rationale:string;}[]}>;
  for(const kind of kinds){
   rankings[kind]={pool:m.ranks[kind].map(f=>f.family),
    top:m.ranks[kind].slice(0,10).map(f=>({family:f.family,rank:f.rank,
     paths:f.paths.length,sourceCount:f.sourceCount,
     physicalBlocks:f.physicalBlocks,directRoots:f.directRoots,
     parentFamilies:f.parentFamilies,rationale:f.rationale}))};
   for(const f of m.ranks[kind].slice(0,10))
    assert.ok(f.paths.length&&f.paths.every(p=>p.path.length===Number(kind.slice(-1))),
     'Candidatura sin testigo físico exacto '+kind+' '+f.family);
  }
  reports.push({date,turn,nroots:m.roots.length,rankings});
  count++;if(count%25===0)console.log('PRE_PROCESSED',count,'/115');
 }
 save('REPLAY_PRE_115.json',{description:'Tops y bolsas congelados SIN POST, sin alterar motor',rows:reports});
 console.log('PRE_115_OK: 115 propuestas selladas; ninguna cabeza objetivo cargada');
}

const probHit=(population:number,successes:number,count:number)=>{
 // Probabilidad hipergeométrica exacta de >=1 familia acertada
 let no=1;
 for(let i=0;i<count;i++)no*=(population-successes-i)/(population-i);
 return 1-no;
};
function runPost(){
 const pre=json('REPLAY_PRE_115.json'),post=json('OBJETIVOS_POST_115.json');
 assert.equal(pre.rows.length,115);assert.equal(post.rows.length,115);
 const rows=[];
 const balance=Object.fromEntries(kinds.map(kind=>[kind,{
  tops:Object.fromEntries([3,5,10].map(n=>[n,0])),
  expected:Object.fromEntries([3,5,10].map(n=>[n,0])),
  coverage:0,withCandidates:0,totalFamilies:0,top10Slots:0,physicalWinningFamilies:0,
  months:{} as Record<string,{cuts:number;top10:number}>
 }])) as Record<LaloKind,any>;
 for(let i=0;i<115;i++){
  const p=pre.rows[i],o=post.rows[i];
  assert.equal(p.date,o.date);assert.equal(p.turn,o.turn);
  const record:any={date:p.date,turn:p.turn,targets:o.targetHeads};
  for(const kind of kinds){
   const n=Number(kind.slice(-1));
   const families=p.rankings[kind],pool:string[]=families.pool;
   const targets=new Set((o.targetHeads as string[]).map(h=>reversibleFamily(h.slice(-n))));
   const hitNames=pool.filter(f=>targets.has(f)),numSuccess=hitNames.length;
   const b=balance[kind];
   b.totalFamilies+=pool.length;b.top10Slots+=Math.min(10,pool.length);
   if(pool.length)b.withCandidates++;
   if(numSuccess)b.coverage++;
   b.physicalWinningFamilies+=numSuccess;
   const topValues=families.top.map((f:{family:string})=>f.family);
   record[kind]={pool:pool.length,targets:[...targets],available:numSuccess,
    top10:topValues,matched:topValues.filter((f:string)=>targets.has(f))};
   for(const k of [3,5,10]){
    const count=Math.min(k,topValues.length);
    const matched=topValues.slice(0,count).some((f:string)=>targets.has(f));
    if(matched)b.tops[k]++;
    if(pool.length)b.expected[k]+=probHit(pool.length,numSuccess,count);
    record[kind]['top'+k+'Hit']=matched;
   }
   const month=p.date.slice(0,7);
   if(!b.months[month])b.months[month]={cuts:0,top10:0};
   b.months[month].cuts++;
   if(record[kind].top10Hit)b.months[month].top10++;
  }
  rows.push(record);
 }
 const summary={nCuts:115,nDays:23,
  dataSha256:SHA,method:'PRE previo por fuente y turno; POST separado; azar uniforme misma bolsa por corte y cupo',
  disclaimer:'Criterio investigado sobre estas fechas previamente; control exploratorio, NO validación externa',
  balance};
 save('REPLAY_POST_115.json',{summary,rows});
 save('RESUMEN_115.json',summary);
 const csv=['Fecha,Turno,Modalidad,Pool,Top3,Top5,Top10,FamiliasCoincidentesTop10'];
 for(const r of rows)for(const kind of kinds){
  const x=r[kind];
  csv.push([r.date,r.turn,kind,x.pool,Number(x.top3Hit),Number(x.top5Hit),
   Number(x.top10Hit),x.matched.join('|')].join(','));
 }
 writeFileSync(join(dir,'BALANCE_115.csv'),csv.join('\n')+'\n');
 console.log('REPLAY_115_POST_OK',JSON.stringify(summary));
}
const mode=process.argv[2];
if(mode==='prepare')prepare();
else if(mode==='pre')runPre();
else if(mode==='post')runPost();
else throw new Error('Usar prepare | pre | post');
