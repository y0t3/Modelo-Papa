/**
 * Radar de FORMAS en ventana corta: la unidad es el recorrido físico.
 *
 * NO ordena números, no fusiona recorridos de tableros diferentes, y separa
 * seleccionar una huella en un Top de su simple disponibilidad geométrica.
 * El resultado de un sorteo SOLO se anexa POST en una auditoría aparte.
 */
export type Board='PLUS11'|'AUX_AYER'|'AUX_HOY';
export type Kind='VT2'|'VT3'|'VT4';
export type Source='LALO'|'GEOMETRIA'|'CONECTADAS'|'FORMAS_PRIMERO'|'AUX_AYER'|'AUX_HOY';
export type Point={row:number;col:number};
export type ShapeRoute={
 date:string;turn:string;board:Board;source:string;
 kind:Kind;engine:Source;rank:number;cells:Point[];
 // cifra sólo metadato para mostrar, nunca para asociar figuras
 family?:string;reading?:string;
};
export type Figure={
 id:string;date:string;turn:string;board:Board;source:string;
 kind:Kind;shape:string;site:string;cells:Point[];
 engines:Source[];bestRanks:Record<string,number>;
 families:string[];readings:string[];
};
export type LinkKind='MISMO_SITIO'|'DESPLAZAMIENTO_VERTICAL_1'|
 'FUENTE_VECINA_MISMO_SITIO'|'MISMA_SILUETA_LEJANA';
export type Motion={
 from:string;to:string;type:LinkKind;figureFrom:string;
 figureTo:string;turnFrom:string;turnTo:string;
 structuralAvailability:boolean;distinctFamilies:boolean;
};
const place=(p:Point)=>p.row+':'+p.col;
const SOURCES=['prevNocturno','Previa','Primera','Matutino','Vespertino'];
const stringify=(path:Point[])=>path.map(place).join('>');
const canonical=(path:Point[])=>[
 stringify(path),stringify([...path].reverse())].sort()[0];
export function silhouette(path:Point[]){
 if(path.length<2||path.length>4)throw Error('Solo formas de 2, 3 o 4 casillas');
 const r=Math.min(...path.map(p=>p.row));
 const c=Math.min(...path.map(p=>p.col));
 const coords=path.map(p=>({row:p.row-r,col:p.col-c}));
 return canonical(coords);
}
const valid=(route:ShapeRoute)=>{
 const n=route.kind==='VT2'?2:route.kind==='VT3'?3:4;
 if(route.cells.length!==n||new Set(route.cells.map(place)).size!==n)
  throw Error('Recorrido inválido: faltan o se repiten casillas');
 if(route.cells.some((p,i)=>p.row<0||p.col<0||!Number.isInteger(p.row)||
  !Number.isInteger(p.col)||!!i&&
  Math.max(Math.abs(p.row-route.cells[i-1].row),
   Math.abs(p.col-route.cells[i-1].col))!==1))
  throw Error('Recorrido inválido: salto físico');
 if(route.board==='PLUS11'&&route.cells.some(p=>p.col>1||p.row>5))
  throw Error('La hoja +11 solo tiene 6 filas y 2 cifras por columna');
 if(route.rank<1||!Number.isInteger(route.rank))throw Error('Rank inválido');
};
export function figuresInTop(routes:ShapeRoute[]):Figure[]{
 const unique=new Map<string,Figure>();
 for(const route of routes){
  valid(route);
  const site=canonical(route.cells);
  const id=[route.date,route.turn,route.board,route.source,route.kind,site].join('|');
  const old=unique.get(id)||{
   id,date:route.date,turn:route.turn,board:route.board,
   source:route.source,kind:route.kind,shape:silhouette(route.cells),
   site,cells:route.cells.map(c=>({...c})),
   engines:[],bestRanks:{},families:[],readings:[]
  };
  if(!old.engines.includes(route.engine))old.engines.push(route.engine);
  old.bestRanks[route.engine]=Math.min(
   old.bestRanks[route.engine]??Infinity,route.rank);
  if(route.family&&!old.families.includes(route.family))
   old.families.push(route.family);
  if(route.reading&&!old.readings.includes(route.reading))
   old.readings.push(route.reading);
  unique.set(id,old);
 }
 return [...unique.values()].sort((a,b)=>a.id.localeCompare(b.id));
}
const rowMin=(p:Figure)=>Math.min(...p.cells.map(c=>c.row));
const colMin=(p:Figure)=>Math.min(...p.cells.map(c=>c.col));
const compareSource=(a:string,b:string)=>
 Math.abs(SOURCES.indexOf(a)-SOURCES.indexOf(b))===1 &&
 SOURCES.includes(a)&&SOURCES.includes(b);
export function classifyMotion(a:Figure,b:Figure):LinkKind|null{
 if(a.kind!==b.kind||a.board!==b.board||a.shape!==b.shape)return null;
 if(a.source===b.source&&a.site===b.site)return 'MISMO_SITIO';
 if(a.source===b.source&&colMin(a)===colMin(b)&&
  Math.abs(rowMin(a)-rowMin(b))===1)
  return 'DESPLAZAMIENTO_VERTICAL_1';
 if(a.board==='PLUS11'&&compareSource(a.source,b.source)&&
  a.site===b.site)
  return 'FUENTE_VECINA_MISMO_SITIO';
 return 'MISMA_SILUETA_LEJANA';
}
/** Return only close physical relationships: shared site, 1 row shift or
 * same position in neighboring +11 source. Far template-only repeats are
 * too common to be evidence. Exact site within a day is typically a
 * structural persistence, but its continued inclusion in Top isn't. */
export function nearMotions(past:Figure[],now:Figure[]):Motion[]{
 const links:Motion[]=[];
 for(const a of past)for(const b of now){
  const type=classifyMotion(a,b);
  if(!type||type==='MISMA_SILUETA_LEJANA')continue;
  const structuralAvailability=a.date===b.date&&
   type==='MISMO_SITIO';
  links.push({
   from:a.date,to:b.date,type,figureFrom:a.id,figureTo:b.id,
   turnFrom:a.turn,turnTo:b.turn,structuralAvailability,
   distinctFamilies:!a.families.some(x=>b.families.includes(x))
  });
 }
 return links;
}
export type Summary={
 from:string;to:string;previous:number;current:number;
 persistentExact:number;moveOneRow:number;moveSource:number;
 newSites:number;retainedSameFamily:number;retainedChangedFamily:number;
 crossEngineSameSite:number;nearLinks:number;
};
export function compareSnapshots(before:Figure[],after:Figure[]):Summary{
 const links=nearMotions(before,after);
 const exact=links.filter(x=>x.type==='MISMO_SITIO');
 const matched=new Set(links.map(x=>x.figureTo));
 const currentExact=new Set(exact.map(x=>x.figureTo));
 const beforeById=new Map(before.map(x=>[x.id,x]));
 const afterById=new Map(after.map(x=>[x.id,x]));
 let retainedSameFamily=0,retainedChangedFamily=0;
 for(const x of exact){
  const a=beforeById.get(x.figureFrom)!,b=afterById.get(x.figureTo)!;
  if(a.families.some(f=>b.families.includes(f)))retainedSameFamily++;
  else retainedChangedFamily++;
 }
 return {
  from:before[0]?.date+'|'+before[0]?.turn,
  to:after[0]?.date+'|'+after[0]?.turn,
  previous:before.length,current:after.length,
  persistentExact:currentExact.size,
  moveOneRow:new Set(links.filter(x=>x.type==='DESPLAZAMIENTO_VERTICAL_1')
   .map(x=>x.figureTo)).size,
  moveSource:new Set(links.filter(x=>x.type==='FUENTE_VECINA_MISMO_SITIO')
   .map(x=>x.figureTo)).size,
  newSites:after.filter(x=>!matched.has(x.id)).length,
  retainedSameFamily,retainedChangedFamily,
  crossEngineSameSite:after.filter(x=>x.engines.length>1).length,
  nearLinks:links.length
 };
}
/**
 * Reports PRE movements only, not next-draw wins. A figure can appear in
 * multiple turn snapshots; one physical site only counts once per frame.
 */
export function scanRecent(snapshots:{date:string;turn:string;routes:ShapeRoute[]}[],
 window=6){
 const selected=snapshots.slice(-window).map(x=>({
  date:x.date,turn:x.turn,figures:figuresInTop(x.routes)
 }));
 return selected.slice(1).map((now,i)=>compareSnapshots(selected[i].figures,
  now.figures));
}
