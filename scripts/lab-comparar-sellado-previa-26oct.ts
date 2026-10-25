/**
 * CONTRASTE POST de la Previa 26/10/2026.
 * ÚNICAMENTE lee el sello inmutable versionado; NO recalcula tops con
 * información disponible después del cierre PRE.
 * Ejecutar con --validar sin consultar jamás resultados objetivo.
 * Ejecutar sin flags SOLO cuando estén las cinco cabezas de Previa AR.
 */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {descargarCabezas} from '../src/cabezas';
import {reversibleFamily} from '../src/motorLalo';
import {JURS} from '../src/domain';
const path='auditorias/lalo-pulso-vt3-sellado-26oct/sellado-previa-2026-10-26.json';
const EXPECTED='3d4c8bc10b24f8f23290c2f41b7692aef9a1897163c1cb1d684c6609b00f8771';
const INPUT_EXPECTED='ab6b02a4bf7e8814ac0d1b4ebd92137f9d38ec470eb11e493729ac82cb094135';
type RecordSeal={
 date:string;turn:string;sealedAtUtc:string;expiryGuardUtc:string;
 payloadSha256:string;inputDigestSha256:string;
 top3Lalo:string[];top3Pulso:string[];
 top5Lalo:string[];top5Pulso:string[];
 top10Lalo:string[];top10Pulso:string[];
};
function readSeal():RecordSeal{
 const seal=JSON.parse(fs.readFileSync(path,'utf8')) as RecordSeal;
 const {payloadSha256,...fields}=seal;
 const hashed=createHash('sha256').update(JSON.stringify(fields)).digest('hex');
 if(payloadSha256!==EXPECTED||hashed!==EXPECTED||
  seal.inputDigestSha256!==INPUT_EXPECTED)
  throw Error('El sello PRE fue modificado o la huella no coincide');
 if(seal.date!=='2026-10-26'||seal.turn!=='Previa'||
  seal.sealedAtUtc>=seal.expiryGuardUtc)
  throw Error('Fecha/tiempo de sellado inválido');
 const base=new Set(seal.top10Lalo),pulso=new Set(seal.top10Pulso);
 if(base.size!==10||pulso.size!==10||
  [...base].some(f=>!pulso.has(f))||
  seal.top3Lalo.join('|')!==seal.top10Lalo.slice(0,3).join('|')||
  seal.top3Pulso.join('|')!==seal.top10Pulso.slice(0,3).join('|'))
  throw Error('Las diez familias, los Top3 o su genealogía no coinciden');
 return seal;
}
async function main(){
 const seal=readSeal();
 if(process.argv.includes('--validar')){
  console.log('SELLADO_PRE_VALIDO',JSON.stringify({
   date:seal.date,turn:seal.turn,sealedAtUtc:seal.sealedAtUtc,
   payloadSha256:seal.payloadSha256,top3Lalo:seal.top3Lalo,
   top3Pulso:seal.top3Pulso,sameTop10:true,targetQueried:false}));
  return;
 }
 if(new Date().toISOString()<seal.expiryGuardUtc)
  throw Error('Prohibido mirar el objetivo antes de su día');
 const heads=await descargarCabezas(seal.date,true);
 const mainland=JURS.filter(j=>j!=='Montevideo');
 if(mainland.some(j=>!/^\d{4}$/.test(heads.Previa?.[j]||'')))
  throw Error('PREVIA INCOMPLETA: no registrar aciertos de forma parcial');
 const actual=mainland.map(j=>({
  jurisdiction:j,head:heads.Previa[j],
  family:reversibleFamily(heads.Previa[j].slice(-3))
 }));
 const score=(list:string[])=>actual.filter(h=>list.includes(h.family))
  .map(h=>({...h,rank:list.indexOf(h.family)+1}));
 const outcome={
  target:seal.date,turn:seal.turn,
  sealedAtUtc:seal.sealedAtUtc,
  verifiedPostAtUtc:new Date().toISOString(),
  payloadSha256:EXPECTED,coveredJurisdictions:mainland,
  heads:actual,
  Lalo:{top3:score(seal.top3Lalo),top5:score(seal.top5Lalo),
   top10:score(seal.top10Lalo)},
  Pulso:{top3:score(seal.top3Pulso),top5:score(seal.top5Pulso),
   top10:score(seal.top10Pulso)},
  coincidentPredictions:seal.top3Lalo.join('|')===seal.top3Pulso.join('|'),
  notes:'Familias VT3 reversibles; cuenta cabeza con sufijo VT3 de esa familia. No evalúa VT2 ni VT4.'
 };
 const out='auditorias/lalo-pulso-vt3-sellado-26oct/resultado-posterior';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/post-previa-2026-10-26.json',JSON.stringify(outcome,null,2)+'\n');
 console.log('POST_PREVIA_26OCT',JSON.stringify(outcome));
}
main().catch(e=>{console.error('ERROR_POST',e);process.exitCode=1});
