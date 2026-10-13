import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';

const OUT='auditorias/vt4-13oct2026/';
const APP='lab-vt3-turnos-13oct2026-pre-primera-sello-mat';
const SOURCE='fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64';
const JUR=['Ciudad','Provincia','Córdoba','Santa Fé','Entre Ríos','Montevideo'];
const DATE='2026-10-13';
const HEADS_PUBLISHED={
 Previa:['6448','6337','5546','5119','1495'],
 Primera:['5485','0310','8857','3385','4084']
};
const sha=s=>createHash('sha256').update(s).digest('hex');
const jread=p=>JSON.parse(readFileSync(p,'utf8'));
const read=p=>readFileSync(p,'utf8');
const save=(p,v)=>writeFileSync(OUT+p,JSON.stringify(v,null,2)+'\n');
const canon=h=>{const x=h.slice(-3);return[x,[...x].reverse().join('')].sort().join('/')};
mkdirSync(OUT,{recursive:true});
const runtime='resultados/runtime-vt3-13oct-live';
for(const k of ['domain','dates','paths','sheet','motorLalo','vt3Audit']){
 const dest=resolve(runtime,k+'.mjs');mkdirSync(dirname(dest),{recursive:true});
 const js=stripTypeScriptTypes(read('src/'+k+'.ts')).replace(/from '(\.{1,2}\/[^']+)'/g,(_,path)=>"from '"+path+".mjs'");
 writeFileSync(dest,js);
}
const load=async k=>import(pathToFileURL(resolve(runtime,k+'.mjs')).href);
const {TURNOS,diaVacio}=await load('domain');
const {buildSheet}=await load('sheet');
const {buildMotorLalo}=await load('motorLalo');
const {auditVt3Family}=await load('vt3Audit');
const raw=JSON.parse(gunzipSync(Buffer.from(read(SOURCE).trim(),'base64')).toString('utf8'));
assert.equal(Object.keys(raw).length,30);
assert.ok(!raw[DATE],'No debe existir el día objetivo en el fixture histórico');
// El fixture histórico de 30 fechas termina el 10/10. Agregar como D−1
// la jornada del lunes 12/10 ya PUBLICADA; nunca son objetivos del 13/10.
// Cabezas Ciudad/Provincia/Córdoba/Santa Fé/Entre Ríos verificadas en
// quinielacorrentina.com, lanacion.com.ar, tujugada.com.ar y fuentes oficiales.
// Montevideo se conserva ---- porque no hay cabeza publicada verificable
// para 12/10; nunca se inventa la sexta cifra del tablero.
raw['2026-10-12']=[
 ['7447','0334','5276','4616','2403','----'],
 ['3825','9554','3107','2696','7634','----'],
 ['2436','3489','1099','8362','2400','----'],
 ['2716','3433','4801','4903','3245','----'],
 ['9851','1615','7242','8290','3264','----']
];
for(const date of ['2026-10-05','2026-10-06','2026-10-10','2026-10-12'])assert.ok(raw[date]);
function draw(d){
 const result=diaVacio();
 for(let t=0;t<TURNOS.length;t++)
  for(let j=0;j<JUR.length;j++)result[TURNOS[t]][JUR[j]]=raw[d][t][j];
 return result;
}
const LAST='2026-10-12', BEFORE_LAST='2026-10-10', D7='2026-10-06', D7PREV='2026-10-05';
const history=[
 {date:LAST,period:'D−1',sheet:buildSheet(draw(LAST),draw(BEFORE_LAST))},
 {date:D7,period:'D−7',sheet:buildSheet(draw(D7),draw(D7PREV))}
];
assert.equal(history.length,2);
function stage(turn){
 const targetIdx=TURNOS.indexOf(turn);
 const now=diaVacio();
 for(let ti=0;ti<targetIdx;ti++){
  const earlier=TURNOS[ti],list=HEADS_PUBLISHED[earlier];
  assert.ok(list?.length===5,'Corte anterior incompleto: '+earlier);
  for(let j=0;j<5;j++)now[earlier][JUR[j]]=list[j];
 }
 const sheet=buildSheet(now,draw(LAST));
 assert.equal(sheet.heads[turn].length,0,'Una cabeza objetivo entró en PRE');
 for(const col of sheet.columns.slice(targetIdx+1))
  assert.ok(col.values.every(x=>x==='--'),'Columna futura disponible en PRE');
 const view=buildMotorLalo(sheet,DATE,turn,history);
 const top=view.ranks.vt3;
 assert.ok(top.length>=10);
 const inventorySources=sheet.columns.slice(0,targetIdx+1).map(x=>({source:x.id,values:x.values}));
 return {turn,sheet,view,rootCount:view.roots.length,
  sourceColumns:inventorySources,
  rankings:top.map(x=>({
   family:x.family,rank:x.rank,paths:x.paths.length,
   sources:x.sourceCount,physicalBlocks:x.physicalBlocks,branchBlocks:x.branchBlocks,
   d1:x.d1Roots,d7:x.d7Roots,roots:x.directRoots,explanation:x.rationale
  })),
  top3:top.slice(0,3).map(x=>x.family),
  top5:top.slice(0,5).map(x=>x.family),
  top10:top.slice(0,10).map(x=>x.family)};
}
const turns=['Previa','Primera','Matutino'];
const staged=turns.map(stage);
assert.deepEqual(staged.map(x=>x.turn),turns);
const trim=s=>({
 date:DATE,turn:s.turn,sourceColumns:s.sourceColumns,
 previousDates:[LAST,D7],rootCount:s.rootCount,
 ranking:s.rankings,top3:s.top3,top5:s.top5,top10:s.top10
});


const archived='auditorias/vt4-13oct2026/RECONSTRUCCION_PRE_VT4.json';
const old=jread(archived);
const originalSeal='067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41';
const originalText=readFileSync('auditorias/vt3-en-vivo-13oct2026/MATUTINA_PRE_SELLADA.json','utf8');
assert.equal(sha(originalText),originalSeal);
const oldMat=JSON.parse(originalText);
assert.deepEqual(staged[2].top10,oldMat.top10);
assert.equal(staged[2].rootCount,oldMat.rootCount);
assert.deepEqual(staged[2].sourceColumns,oldMat.sourceColumns);
const expected={
 Primera:{family:'5485/5845',head:'5485'},
 Matutino:{family:'1057/7501',head:'1057'}
};
const reports=[];
for(const stage of staged.slice(1)){
 const vt3=stage.view.ranks.vt3;
 const groups=stage.view.ranks.vt4;
 const prior=old.stages.find(x=>x.turn===stage.turn);
 const original=prior.vt4Rankings;
 const parentRank=new Map(vt3.map(x=>[x.family,x.rank]));
 const problems=[];
 const uniquePathGroups=new Map();
 const makePath=p=>p.path.map(c=>c.row+':'+c.col);
 for(const g of groups){
  for(const route of g.paths){
   assert.equal(route.path.length,4);
   const v=route.value;
   const [left,right]=g.family.split('/');
   assert.ok(v===left||v===right,'VT4 incluye un valor fuera de sus madres: '+g.family+' > '+v);
   assert.ok(route.mother&&g.parentFamilies.includes(route.mother));
   assert.ok(parentRank.has(route.mother));
   assert.ok(parentRank.get(route.mother)<=10,'Madre fuera Top10');
   const c=route.addedDigit;
   const [a,b]=route.mother.split('/');
   const expectedVals=[c+a,c+b,a+c,b+c];
   assert.ok(expectedVals.includes(v),'VT4 derivada no es madre+digit');
   assert.ok(v===route.path.map(z=>z.digit).join(''),'Dígitos diferentes al camino físico');
   const cells=makePath(route);
   assert.equal(new Set(cells).size,4,'Celdas repetidas');
   for(let i=1;i<4;i++)assert.equal(Math.max(
    Math.abs(route.path[i].row-route.path[i-1].row),
    Math.abs(route.path[i].col-route.path[i-1].col)
   ),1,'No hay adyacencia');
   if((v===c+a||v===c+b) && (v===a+c||v===b+c))problems.push('ambigüedad por dígito igual');
   const k=g.family;
   const counter=uniquePathGroups.get(k)||0;
   uniquePathGroups.set(k,counter+1);
  }
 }
 const oldFamilies=new Set(original.map(x=>x.family));
 const newFamilies=new Set(groups.map(x=>x.family));
 const oldTop10=original.slice(0,10).map(x=>x.family),newTop10=groups.slice(0,10).map(x=>x.family);
 const target=stage.turn==='Primera'?'5485':'1057';
 const family=stage.turn==='Primera'?'5485/5845':'1057/7501';
 const targetGroups=groups.filter(g=>g.paths.some(p=>p.value===target));
 const tested={
   turn:stage.turn,sourceColumns:stage.sourceColumns.map(x=>x.source),
   vt3Top10:vt3.slice(0,10).map(x=>x.family),
   priorVT4Pool:original.length,newVT4Pool:groups.length,
   beforeTop10:oldTop10,afterTop10:newTop10,
   beforeTop3:oldTop10.slice(0,3),afterTop3:newTop10.slice(0,3),
   totalPathsNew:groups.reduce((s,g)=>s+g.paths.length,0),
   numberGroupsWithSameLabel:[...uniquePathGroups.values()].filter(x=>x>1).length,
   legacyReversalOnlyExamples:oldTop10.filter(x=>!newFamilies.has(x)),
   resultHead:target,
   representedInNewBy:targetGroups.map(x=>({
    family:x.family,rank:x.rank,paths:x.paths.map(p=>({
     digits:p.value,source:p.sourceId,mother:p.mother,cells:makePath(p),
     added:p.addedDigit
    })),mothers:x.parentFamilies
   })),
   archivedLegacyFamily:original.find(g=>g.family===family)||null,
   ambiguities:problems
 };
 reports.push(tested);
}
function findFamilyByValue(report,v){
 return report.representedInNewBy.filter(x=>x.paths.some(p=>p.digits===v));
}
const first=reports[0],mat=reports[1];
assert.ok(findFamilyByValue(first,'5485').length,'La cuaterna legítima de Primera ha desaparecido');
assert.equal(findFamilyByValue(mat,'1057').length,0,'1057 no debe entrar sin madre admitida');
const sample=staged[1].view.ranks.vt4.filter(g=>g.paths.some(p=>p.value==='3226'));
assert.ok(sample.length,'Esperábamos formación física 3226');
assert.ok(sample.every(g=>!g.family.includes('6223')),'Se conserva la inversa de 4 cifras indebidamente');
const lesson={
 example:'3226',mother:'226/622',addedDigit:'3',position:'prefix',
 allowedFamily:'3226/3622',
 presentVariants:sample.flatMap(g=>g.paths.map(p=>p.value)).filter((v,i,a)=>a.indexOf(v)===i),
 displayedGroups:sample.map(g=>g.family),
 note:'La otra orientación de la madre solamente se considera como lectura válida si hay recorrido propio de cuatro casillas. La etiqueta de familia expresa el par teórico, no afirma que las dos se dibujen.',
};
const pre={
 date:'2026-10-13',phase:'EXPLORATORY_RETROSPECTIVE',
 originalVt3MatSeal:originalSeal,
 originalCodeUnaffected:false,
 codeUpdate:'solo rama experimental, agrupa VT4 por madre VT3 + dígito y lado de extensión',
 reports,lesson,
 warning:'No fue sellado antes de los sorteos; no es nuevo acierto prospectivo.'
};
save('RECONSTRUCCION_VT4_MADRE.json',pre);
const seal={oldVT3MatSeal:originalSeal,code:sha(readFileSync('src/motorLalo.ts','utf8')),
 new:sha(readFileSync(OUT+'RECONSTRUCCION_VT4_MADRE.json','utf8'))};
save('SELLO.json',seal);
console.log('VT4_MADRE_CORREGIDA_OK',JSON.stringify({lesson,reports:reports.map(({turn,priorVT4Pool,newVT4Pool,beforeTop10,afterTop10,resultHead,representedInNewBy})=>
({turn,priorVT4Pool,newVT4Pool,beforeTop10,afterTop10,resultHead,representedInNewBy}))},null,2));
