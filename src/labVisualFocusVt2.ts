/**
 * LAB de FOCO VISUAL: una/dos familias VT2 y una zona física por familia.
 * No genera pronósticos, no cambia los rankings oficiales, ni lee resultados
 * del turno objetivo. Historial permitido: marcas ganadoras de fechas anteriores.
 */
import type {Turno} from './domain';
import type {DailySheet} from './sheet';
import type {AuxiliarHistory} from './motorLaloAuxiliar';
import type {Vt2Vt3Result,Vt2Vt3Trace} from './labVt2Vt3Extension';
export type VisualCell={row:number;col:number;digit:string};
export type VisualMark={date:string;turn:string;jur:string;head:string;
 source:string;cells:VisualCell[]};
export type FocusMode='SITIO_EXACTO'|'VECINDAD';
export type FocusZone={
 source:string;cells:VisualCell[];shape:string;
 sameDays:number;nearDays:number;latestAge:number;
 witnesses:{date:string;head:string;turn:string;jur:string;source:string;cells:VisualCell[]}[];
 extensions:string[];
};
export type VisualFocus={family:string;originalRank:number;zone:FocusZone;hasWitness:boolean};
const key=(x:{row:number;col:number})=>x.row+':'+x.col;
const normal=(cells:{row:number;col:number}[])=>cells.map(key).sort().join('|');
const shape=(cells:{row:number;col:number}[])=>{
 if(cells.length!==2)return '';
 const a=cells[0],b=cells[1];
 return Math.abs(a.row-b.row)+':'+Math.abs(a.col-b.col);
};
const anchor=(cells:{row:number;col:number}[])=>({
 row:Math.min(...cells.map(x=>x.row)),col:Math.min(...cells.map(x=>x.col))
});
const sameSource=(a:string,b:string)=>a===b;
const near=(a:VisualCell[],b:VisualCell[])=>{
 const x=anchor(a),y=anchor(b);
 return shape(a)===shape(b)&&Math.abs(x.row-y.row)<=1&&Math.abs(x.col-y.col)<=1;
};
const auxSource=(cells:{col:number}[])=>
 [...new Set(cells.map(c=>['Previa','Primera','Matutino'][Math.floor(c.col/4)]))]
 .sort().join('+');
const pairOf=(t:Vt2Vt3Trace)=>t.cells.slice(1);
const pairSource=(t:Vt2Vt3Trace)=>t.board==='PLUS11'?t.source:auxSource(pairOf(t));
export function previousPlusVt2Marks(days:{date:string;sheet:DailySheet}[]):VisualMark[]{
 const out:VisualMark[]=[];
 for(const d of days)for(const [turn,matches] of Object.entries(d.sheet.matches))
  for(const m of matches)if(/^\d{4}$/.test(m.cabeza))
   for(const hit of m.hits)if(hit.kind==='vt2')
    for(const p of hit.paths)if(p.length===2){
     out.push({date:d.date,turn,jur:m.jurisdiccion,head:m.cabeza,
      source:hit.sourceId,cells:p.map(c=>({...c}))});
    }
 return out;
}
export function previousAuxVt2Marks(days:AuxiliarHistory[]):VisualMark[]{
 const out:VisualMark[]=[];
 for(const day of days)for(const event of day.aux.events[2])
  for(const p of event.paths)if(p.length===2)
   out.push({date:day.date,turn:event.turn,jur:event.jur,head:event.head,
    source:auxSource(p),cells:p.map(c=>({row:c.row,col:c.col,digit:c.digit}))});
 return out;
}
export function findVisualFoci(result:Vt2Vt3Result,
 parentFamilies:string[],marks:VisualMark[],targetDate:string,
 mode:FocusMode='SITIO_EXACTO',limit:1|2=2):VisualFocus[]{
 if(marks.some(m=>m.date>=targetDate))throw Error('Fuga temporal en foco visual');
 if(result.date!==targetDate)throw Error('Fecha PRE inconsistente');
 const groups=result.candidates.flatMap(c=>c.traces);
 const ranked=parentFamilies.slice(0,10).map((family,i)=>{
  const traces=groups.filter(t=>t.parent===family);
  const byZone=new Map<string,Vt2Vt3Trace[]>();
  for(const t of traces){
   const pk=pairSource(t)+'|'+normal(pairOf(t));
   const old=byZone.get(pk)||[];old.push(t);byZone.set(pk,old);
  }
  const zones:FocusZone[]=[...byZone].map(([zoneKey,paths])=>{
   const pair=pairOf(paths[0]),source=pairSource(paths[0]);
   const exact=marks.filter(m=>sameSource(source,m.source)&&normal(m.cells)===normal(pair));
   const vicinity=marks.filter(m=>sameSource(source,m.source)&&near(pair,m.cells));
   const days=(arr:VisualMark[])=>new Set(arr.map(m=>m.date)).size;
   const ages=vicinity.map(m=>Math.max(0,Math.round(
    (Date.parse(targetDate+'T12:00:00Z')-Date.parse(m.date+'T12:00:00Z'))/86400000)));
   const witnesses=[...new Map(vicinity.map(m=>[
    [m.date,m.turn,m.jur,m.head].join('|'),m])).values()]
    .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4)
    .map(m=>({date:m.date,head:m.head,turn:m.turn,jur:m.jur,
      source:m.source,cells:m.cells}));
   return {source,cells:pair.map(x=>({...x})),shape:shape(pair),
    sameDays:days(exact),nearDays:days(vicinity),
    latestAge:ages.length?Math.min(...ages):999,witnesses,
    extensions:[...new Set(paths.map(t=>t.value))].sort()};
  });
  const score=(z:FocusZone):number[]=>mode==='SITIO_EXACTO'?
   [z.sameDays,z.nearDays,-z.latestAge]:
   [z.nearDays,z.sameDays,-z.latestAge];
  zones.sort((a,b)=>{
   const aa=score(a),bb=score(b);
   for(let k=0;k<aa.length;k++)if(aa[k]!==bb[k])return bb[k]-aa[k];
   return a.source.localeCompare(b.source)||
    normal(a.cells).localeCompare(normal(b.cells));
  });
  const zone=zones[0]||null;
  return zone?{family,originalRank:i+1,zone,
    hasWitness:mode==='SITIO_EXACTO'?zone.sameDays>0:zone.nearDays>0}:null;
 }).filter((x):x is VisualFocus=>x!==null);
 const score=(f:VisualFocus):number[]=>mode==='SITIO_EXACTO'?
  [f.zone.sameDays,f.zone.nearDays,-f.zone.latestAge]:
  [f.zone.nearDays,f.zone.sameDays,-f.zone.latestAge];
 ranked.sort((a,b)=>{
  const aa=score(a),bb=score(b);
  for(let i=0;i<aa.length;i++)if(aa[i]!==bb[i])return bb[i]-aa[i];
  return a.originalRank-b.originalRank;
 });
 return ranked.slice(0,limit);
}
export function evaluateFoci(result:Vt2Vt3Result,foci:VisualFocus[],heads:string[]){
 const valid=heads.filter(h=>/^\d{4}$/.test(h));
 const families=new Set(foci.map(f=>f.family));
 const traces=result.candidates.flatMap(c=>c.traces);
 const familyMatch=(head:string,parents:Set<string>)=>
  traces.some(t=>parents.has(t.parent)&&t.value===head.slice(-3));
 const exact=valid.filter(h=>familyMatch(h,families)).length;
 const zoneMatch=(h:string)=>foci.some(f=>traces.some(t=>t.parent===f.family&&
  t.value===h.slice(-3)&&pairSource(t)===f.zone.source&&
  normal(pairOf(t))===normal(f.zone.cells)));
 const zoneExact=valid.filter(zoneMatch).length;
 const availableParents=new Set(traces.map(t=>t.parent));
 const ordered=[...availableParents];
 const meanRandom=valid.reduce((sum,head)=>sum+
   2*ordered.filter(parent=>familyMatch(head,new Set([parent]))).length/
   Math.max(1,ordered.length),0);
 return {exact,zoneExact,meanRandom,count:valid.length,
  focusedFamilies:foci.length,withWitness:foci.filter(f=>f.hasWitness).length};
}
