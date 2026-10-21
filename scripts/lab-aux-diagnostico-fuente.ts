/** Verificador acotado de proveedor público, no modifica parser oficial. */
import {descargarCabezas,FUENTE} from '../src/cabezas';
import {TURNOS} from '../src/domain';
async function main(){
 for(const date of ['2026-10-13','2026-10-19','2026-10-20']){
  const url=FUENTE+'?fecha='+date;
  const res=await fetch(url,{headers:{Accept:'application/json'}});
  if(!res.ok)throw Error(date+' estado '+res.status);
  const json=await res.json() as any;
  const rows=json?.datos||{};
  const compact=Object.entries(rows).map(([id,v])=>({
   id,values:Object.fromEntries((['momento_5','momento_1','momento_2'] as const).map(t=>[t,
    (v as any)?.[t]??null]))
  })).filter(r=>Object.values(r.values).some(v=>v!==null&&v!==''&&v!=='----'));
  const known=await descargarCabezas(date,true);
  console.log('AUX_FUENTE',JSON.stringify({date,rows:compact,
   reference:TURNOS.slice(0,3).map(t=>({turn:t,ciudad:known[t].Ciudad,
    provincia:known[t].Provincia}))}));
 }
}
void main().catch(e=>{console.error('AUX_DIAG_ERROR',e);process.exitCode=1});
