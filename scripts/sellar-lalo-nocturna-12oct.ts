/** Modelo Lalo: propuesta Nocturna 12/10 sellada antes del sorteo, sin POST. */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {descargarCabezas} from '../src/cabezas';
import {JURS,TURNOS} from '../src/domain';
import {buildSheet} from '../src/sheet';
import {buildMotorLalo} from '../src/motorLalo';
import type {LaloKind,LaloHistorical} from '../src/motorLalo';
const DAYS=['2026-10-12','2026-10-10','2026-10-09','2026-10-05','2026-10-03'];
const kinds:['vt2','vt3','vt4']=['vt2','vt3','vt4'];
async function main(){
 const rows=await Promise.all(DAYS.map(date=>descargarCabezas(date,true)));
 const today=rows[0];
 for(const j of JURS)assert.ok(today.Nocturno[j]==='----',
  'No se puede sellar PRE: ya existen resultados de Nocturna');
 for(const t of ['Previa','Primera','Matutino','Vespertino'] as const){
  const n=JURS.filter(j=>j!=='Montevideo'&&/^\d{4}$/.test(today[t][j])).length;
  assert.equal(n,5,'Falta alguna cabeza en '+t);
 }
 const history:LaloHistorical[]=[
  {date:DAYS[1],period:'D−1',sheet:buildSheet(rows[1],rows[2])},
  {date:DAYS[3],period:'D−7',sheet:buildSheet(rows[3],rows[4])}
 ];
 const sheet=buildSheet(today,rows[1]);
 assert.equal(sheet.heads.Nocturno.length,0);
 assert.equal(sheet.matches.Nocturno.length,0);
 const output=buildMotorLalo(sheet,DAYS[0],'Nocturno',history);
 const files={date:DAYS[0],target:'Nocturno',
  sealedAtUtc:new Date().toISOString(),commit:process.env.GITHUB_SHA||'desconocido',
  note:'PRE ANTES DEL SORTEO: no contiene cabeza Nocturna. Candidatas experimentales, no probabilidades.',
  previousDates:['2026-10-10','2026-10-05'],
  sourceColumns:sheet.columns,
  roots:output.roots.length,
  ranks:Object.fromEntries(kinds.map(kind=>[kind,output.ranks[kind].map(f=>({
   family:f.family,rank:f.rank,sourceCount:f.sourceCount,paths:f.paths.length,
   physicalBlocks:f.physicalBlocks,directRoots:f.directRoots,d7Roots:f.d7Roots,
   d1Roots:f.d1Roots,branchBlocks:f.branchBlocks,parentFamilies:f.parentFamilies,
   rationale:f.rationale
  }))]))
 };
 mkdirSync('resultados/modelo-lalo-nocturna-12oct',{recursive:true});
 writeFileSync('resultados/modelo-lalo-nocturna-12oct/NOCTURNA_PRE_SELLADO.json',
  JSON.stringify(files,null,2)+'\n');
 console.log('NOCTURNA_PRE_SELLADA',files.sealedAtUtc,JSON.stringify(kinds.map(k=>({
  kind:k,pool:output.ranks[k].length,
  top10:output.ranks[k].slice(0,10).map(f=>f.family)
 }))));
}
void main().catch(error=>{console.error(error);process.exitCode=1});
