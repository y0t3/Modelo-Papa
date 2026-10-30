/**
 * Cotejo POST del explorador de extensiones.
 * NUNCA devuelve candidatos PRE ni altera los Tops. La UI lo usa
 * sólo para iluminar resultados ya publicados del turno elegido.
 */
export type PublishedExtensionHead={jur:string;head:string};
export type ExtensionMatch={
 jur:string;head:string;ending:string;direction:'DIRECTA'|'INVERSA';
};
export type ExtensionReview={
 status:'PENDIENTE'|'COINCIDIO'|'SIN_COINCIDENCIA_PUBLICADA';
 observed:number;
 matches:ExtensionMatch[];
};
export function extensionReviewPOST(value:string,
 heads:readonly PublishedExtensionHead[]):ExtensionReview{
 if(!/^\d{3}$/.test(value))throw Error('Extensión VT3 inválida');
 const reverse=[...value].reverse().join('');
 const observed=heads.filter(h=>/^\d{4,5}$/.test(h.head));
 const matches:ExtensionMatch[]=[];
 const seen=new Set<string>();
 for(const result of observed){
  const ending=result.head.slice(-3);
  const direction:ExtensionMatch['direction']|null=ending===value?
   'DIRECTA':ending===reverse?'INVERSA':null;
  const key=result.jur+'|'+result.head;
  if(direction&&!seen.has(key)){
   seen.add(key);
   matches.push({jur:result.jur,head:result.head,ending,direction});
  }
 }
 return {status:matches.length?'COINCIDIO':
  observed.length?'SIN_COINCIDENCIA_PUBLICADA':'PENDIENTE',
  observed:observed.length,matches};
}
export type Vt3Plus11Rank={engine:'LALO'|'FORMAS_PRIMERO';family:string;rank:number};
export function plus11Rankings(value:string,
 candidates:readonly Vt3Plus11Rank[]){
 if(!/^\d{3}$/.test(value))return [];
 const inverse=[...value].reverse().join('');
 const label=[value,inverse].sort().join('/');
 return candidates.filter(x=>x.family===label&&x.rank>=1&&x.rank<=10)
  .sort((a,b)=>a.rank-b.rank||a.engine.localeCompare(b.engine));
}
