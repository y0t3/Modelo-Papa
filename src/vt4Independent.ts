/** VT4 experimental independiente. Cada valor exacto es un puesto.
 * Replica criterio bloques físicos del laboratorio 24/11; no afirma ventaja.
 * El motor no consulta las cabezas objetivo, madres VT3 ni otras hojas.
 */
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import {cellsFromPlus11} from './paths';
import type {Path} from './paths';
import {buildMotorLalo} from './motorLalo';
import type {LaloFamily,LaloHistorical,LaloView,LaloRoute} from './motorLalo';
import {buildMotorLaloAuxiliar} from './motorLaloAuxiliar';
import type {AuxiliarFamily,AuxiliarHistory,AuxiliarView} from './motorLaloAuxiliar';
import {auxiliaryBoard,enumerateAuxPaths} from './auxSantiagoNeuquen';
import type {AuxiliaryHeads,AuxPath} from './auxSantiagoNeuquen';

const hash=(s:string)=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const block=(path:{row:number;col:number}[])=>path.map(c=>c.row+':'+c.col).sort().join('|');
const tie=(date:string,turn:Turno,a:string,b:string)=>hash(date+'|'+turn+'|'+a)-hash(date+'|'+turn+'|'+b)||a.localeCompare(b);
const valueOf=(p:{digit:string}[])=>p.map(c=>c.digit).join('');
export function rankPlusVt4(sheet:DailySheet,date:string,turn:Turno):LaloFamily[]{
 const idx=TURNOS.indexOf(turn);if(idx<0)throw Error('Turno inválido');
 const groups=new Map<string,LaloRoute[]>();
 for(const col of sheet.columns.slice(0,idx+1)){
  const cells=cellsFromPlus11(col.values);
  const visit=(p:Path)=>{
   if(p.length===4){
    const value=valueOf(p);
    if(!/^\d{4}$/.test(value))return;
    const routes=groups.get(value)||[];
    routes.push({kind:'vt4',family:value,value,sourceId:col.id,path:p,origin:'FISICO_VT4',rootIds:[]});
    groups.set(value,routes);return;
   }
   const last=p[p.length-1];
   for(const cell of cells)if(!p.includes(cell)&&Math.max(Math.abs(cell.row-last.row),Math.abs(cell.col-last.col))===1)visit([...p,cell]);
  };
  for(const cell of cells)visit([cell]);
 }
 const ranked:LaloFamily[]=[...groups].map(([family,paths])=>{
  const physicalBlocks=new Set(paths.map(p=>p.sourceId+'|'+block(p.path))).size;
  const sourceCount=new Set(paths.map(p=>p.sourceId)).size;
  return {kind:'vt4',family,rank:0,paths,sourceCount,physicalBlocks,directRoots:0,d1Roots:0,d7Roots:0,
   branchBlocks:0,parentFamilies:[],state:sourceCount>=2?'CON_APOYO':'EN_FORMACIÓN',
   rationale:physicalBlocks+' bloque(s) distintos · '+sourceCount+' columna(s). Sin madre VT3.'};
 });
 return ranked.sort((a,b)=>b.physicalBlocks-a.physicalBlocks||tie(date,turn,a.family,b.family)).map((f,i)=>({...f,rank:i+1}));
}
export type AuxVt4Exact=AuxiliarFamily&{physicalBlocks:number;routes:AuxPath[]};
export function rankAuxVt4(heads:AuxiliaryHeads,date:string,turn:Turno):AuxVt4Exact[]{
 const groups=new Map<string,AuxPath[]>();
 for(const path of enumerateAuxPaths(auxiliaryBoard(heads,turn),4)){
  const value=valueOf(path),p=groups.get(value)||[];p.push(path);groups.set(value,p);
 }
 const ranked:AuxVt4Exact[]=[...groups].map(([family,routes])=>({
  family,rank:0,mother:null,values:[family],roots:0,d1:0,d7:0,paths:routes.length,routes,
  physicalBlocks:new Set(routes.map(block)).size,
  crossing:routes.some(p=>new Set(p.map(c=>c.source)).size>1),
  sources:[...new Set(routes.flatMap(p=>p.map(c=>c.source)))].sort()
 }));
 return ranked.sort((a,b)=>b.physicalBlocks-a.physicalBlocks||tie(date,turn,a.family,b.family)).map((f,i)=>({...f,rank:i+1}));
}
/** Conserva exactamente las salidas VT2/VT3 del motor anterior. */
export function buildMotorLaloApp(sheet:DailySheet,date:string,turn:Turno,history:LaloHistorical[],
 priority:Parameters<typeof buildMotorLalo>[4]='ORIGINAL'):LaloView{
 const old=buildMotorLalo(sheet,date,turn,history,priority);
 return {...old,ranks:{...old.ranks,vt4:rankPlusVt4(sheet,date,turn)}};
}
/** La entrada debe ser la hoja AYER u HOY ya enmascarada con auxAtCut. */
export function buildMotorLaloAuxiliarApp(date:string,turn:Turno,heads:AuxiliaryHeads,history:AuxiliarHistory[]):AuxiliarView{
 const old=buildMotorLaloAuxiliar(date,turn,heads,history);
 return {...old,ranks:{...old.ranks,4:rankAuxVt4(heads,date,turn)},
  statement:'Solo Santiago–Neuquén. VT4 exacto independiente por bloques físicos; criterio experimental.'};
}
