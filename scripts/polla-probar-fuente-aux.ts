import {fetchAuxiliaryHeads} from '../src/auxSantiagoSource';
const dates=['2026-09-15','2026-10-20','2026-11-12'];
(async()=>{
 for(const d of dates)try{
  const item=await fetchAuxiliaryHeads(d);
  console.log('AUX_FUENTE',d,JSON.stringify(item.rawSantiago),
   JSON.stringify(item.rawNeuquen));
  const vals=[...Object.values(item.rawSantiago),...Object.values(item.rawNeuquen)];
  if(vals.every(x=>x==='----'))console.log('AUX_AVISO',d,'sin cifras utilizables');
 }catch(e){console.log('AUX_ERROR',d,String(e))}
})().catch(e=>console.log('AUX_ERROR_GLOBAL',String(e)));
