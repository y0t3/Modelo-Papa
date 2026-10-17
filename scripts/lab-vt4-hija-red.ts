// Experimento geométrico VT4: la cuarta casilla se lee físicamente
// en la rama compañera de la configuración ganadora de dos recorridos VT3.
// No genera hijos: SOLO reordena extensiones existentes de madres ya elegidas.
import type {Proposal} from './lab-vt3-configuraciones-conectadas';
import type {Vt4Candidate} from './lab-conectadas-derivaciones-vt2-vt4';
const canon=(a:string[])=>[a.join('>'),[...a].reverse().join('>')].sort()[0];
const shift=(path:string[],n:number)=>path.map(c=>{
 const [r,col]=c.split(':').map(Number);return (r+n)+':'+col;
});
export function configurationCurrentCells(mother:Proposal):Set<string>{
 const pool=mother.proof;
 const row=mother.currentOffset;
 if(!Number.isInteger(row)||row<0||row>=6)throw Error('Desplazamiento físico inválido');
 const projected=pool.map(p=>shift(p,row));
 if(projected.some(p=>p.some(c=>Number(c.split(':')[0])>=6))||
  !projected.some(p=>canon(p)===canon(mother.cells)))
  throw Error('La madre elegida no pertenece a la configuración en su desplazamiento concreto');
 return new Set(projected.flat());
}
export function networkSupport(candidate:Vt4Candidate,mother:Proposal):number{
 if(candidate.mother!==mother.family||candidate.source!==mother.source)return 0;
 const network=configurationCurrentCells(mother);
 const motherCells=new Set(mother.cells);
 return candidate.paths.filter(p=>p.cells.length===4&&
  p.cells[0]&&!motherCells.has(p.cells[0])&&network.has(p.cells[0])&&
  canon(p.cells.slice(1))===canon(mother.cells)).length;
}
export type NetworkPolicy='RED_PRIMERO'|'SOLO_HIJAS_RED';
export function reorderDaughtersByNetwork(
 daughters:Vt4Candidate[],mothers:Proposal[],policy:NetworkPolicy
):Vt4Candidate[]{
 const byMother=new Map<string,Proposal>();
 for(const m of mothers)if(!byMother.has(m.family))byMother.set(m.family,m);
 const childByMother=new Map<string,{child:Vt4Candidate;score:number;index:number}[]>();
 daughters.forEach((child,index)=>{
  const m=byMother.get(child.mother);
  if(!m)throw Error('Hija VT4 sin madre VT3 seleccionada');
  const score=networkSupport(child,m);
  if(!childByMother.has(child.mother))childByMother.set(child.mother,[]);
  childByMother.get(child.mother)!.push({child,score,index});
 });
 const groups=mothers.filter((m,i)=>mothers.findIndex(x=>x.family===m.family)===i)
  .map(m=>{
   const entries=(childByMother.get(m.family)||[]).slice()
    .sort((a,b)=>b.score-a.score||a.index-b.index);
   return policy==='SOLO_HIJAS_RED'?entries.filter(x=>x.score>0):entries;
  });
 const result:Vt4Candidate[]=[];
 const max=Math.max(0,...groups.map(g=>g.length));
 for(let round=0;round<max;round++)for(const g of groups)
  if(g[round])result.push(g[round].child);
 if(new Set(result.map(x=>x.mother+'|'+x.addedDigit)).size!==result.length)
  throw Error('Familia VT4 duplicada en ranking');
 if(result.some(child=>!daughters.includes(child)))throw Error('Se creó una hija inexistente');
 if(policy==='RED_PRIMERO'&&result.length!==daughters.length)
  throw Error('Se descartó una VT4 física durante reordenación');
 return result;
}
