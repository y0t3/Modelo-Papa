// Figura original frente a UNA traslacion elegida ANTES del resultado.
// Una traslacion cambia coordenadas de TODA la ruta con igual vector (dr,dc).
// No autoriza combinar rutas de otras columnas o modalidades, ni confundir
// huella y numero exacto, ni cambiar el selector semanal oficial.
import {TURNOS} from './domain';
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import type {Path} from './paths';
import type {DatedSheet} from './cycle7d';
import {reconstructMarkedMoments,priorMarkedMoments} from './markedSheet7d';
import {freezeFigureReadings7D} from './figureReadings7d';
import type {FigureFrozen7D} from './figureReadings7d';
import type {FigureFollowup7D} from './figureFollowup7d';

export type TranslationPair7D={date:string;turn:Turno;fixed?:FigureFrozen7D;
 shifted?:FigureFrozen7D;validTranslations:number;translation?:{row:number;col:number};
 score:{exactDraws:number;nearDraws:number;latestDate?:string};reason:string};
const point=(p:{row:number;col:number})=>p.row+':'+p.col;
const coords=(p:Path)=>p.map(point).join('>');
const parse=(id:string)=>{const parts=id.split(':').map(Number);if(parts.length!==2||!parts.every(Number.isInteger))throw Error('Coordenada invalida');return {row:parts[0],col:parts[1]};};
const valid=(p:Path,values:string[])=>p.every(c=>c.row>=0&&c.row<6&&c.col>=0&&c.col<2&&/^\d{2}$/.test(values[c.row]||''));
const shift=(path:Path,row:number,col:number):Path=>path.map(p=>({...p,row:p.row+row,col:p.col+col,digit:''}));
const origin=(x:FigureFollowup7D):Path=>x.originCoordinates.map(id=>({...parse(id),digit:''}));
const attach=(path:Path,values:string[]):Path=>path.map(p=>({...p,digit:values[p.row][p.col]}));
export function prefreezeFixedAndTranslated7D(
 memory:FigureFollowup7D,history:DatedSheet[],sheet:DailySheet,date:string,turn:Turno
):TranslationPair7D{
 const at=TURNOS.indexOf(turn);
 if(at<0||turn!==memory.target||date<=memory.dateStarted)throw Error('Turno o fecha del seguimiento invalidos');
 const col=sheet.columns.slice(0,at+1).find(x=>x.id===memory.sourceId);
 const empty={exactDraws:0,nearDraws:0};
 if(!col)return {date,turn,validTranslations:0,score:empty,reason:'No existe la columna antes del turno'};
 const root=origin(memory),values=col.values;
 if(!valid(root,values))return {date,turn,validTranslations:0,score:empty,reason:'La huella raiz no es legible'};
 const fixed=freezeFigureReadings7D(sheet,date,turn,memory.kind,memory.sourceId,attach(root,values));
 const alternatives:Path[]=[];
 for(const dr of [-1,0,1])for(const dc of [-1,0,1]){
  if(!dr&&!dc)continue;
  const path=shift(root,dr,dc);
  if(valid(path,values))alternatives.push(path);
 }
 if(alternatives.length===0)return {date,turn,fixed,validTranslations:0,score:empty,reason:'No hay traslacion fisica admisible'};
 // Solo sorteos COMPLETADOS del mismo turno, maximo seis fechas previas.
 // No se incorpora la hoja objetivo en reconstruction, aunque contenga la cabeza.
 const past=history.filter(h=>h.date<date).sort((a,b)=>a.date.localeCompare(b.date)).slice(-6);
 const moments=priorMarkedMoments(reconstructMarkedMoments(past),date,turn).filter(m=>m.turn===turn);
 const scored=alternatives.map(p=>{
  const code=coords(p),set=new Set(p.map(point));
  let exactDraws=0,nearDraws=0,latestDate:string|undefined;
  for(const m of moments){
   const related=m.marks.filter(x=>x.kind===memory.kind&&x.sourceId===memory.sourceId);
   if(related.some(x=>x.cells.join('>')===code)){exactDraws++;latestDate=m.date;}
   if(related.some(x=>x.cells.filter(c=>set.has(c)).length>=Math.max(1,p.length-1)))nearDraws++;
  }
  return {path:p,exactDraws,nearDraws,latestDate};
 }).sort((a,b)=>b.exactDraws-a.exactDraws||b.nearDraws-a.nearDraws||
  (b.latestDate||'').localeCompare(a.latestDate||'')||coords(a.path).localeCompare(coords(b.path)));
 const selected=scored[0],dr=selected.path[0].row-root[0].row,dc=selected.path[0].col-root[0].col;
 const shifted=freezeFigureReadings7D(sheet,date,turn,memory.kind,memory.sourceId,attach(selected.path,values));
 return {date,turn,fixed,shifted,validTranslations:alternatives.length,translation:{row:dr,col:dc},
  score:{exactDraws:selected.exactDraws,nearDraws:selected.nearDraws,latestDate:selected.latestDate},
  reason:'Rutas congeladas antes del sorteo; una traslacion seleccionada por marcas previas del mismo turno.'};
}
