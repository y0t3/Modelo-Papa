export type Cell={row:number;col:number;digit:string};
export type Path=Cell[];
export type PathMatch={value:string;paths:Path[]};
const adj=(a:Cell,b:Cell)=>a!==b&&Math.abs(a.row-b.row)<=1&&Math.abs(a.col-b.col)<=1;
export function cellsFromPlus11(values:string[]):Cell[]{
 const out:Cell[]=[]; values.forEach((v,row)=>{if(!/^\d{2}$/.test(v))return;out.push({row,col:0,digit:v[0]},{row,col:1,digit:v[1]})});return out;
}
export function findPaths(values:string[],target:string):Path[]{
 if(!/^[0-9]{2,4}$/.test(target))return [];
 const cells=cellsFromPlus11(values),out:Path[]=[];
 const walk=(path:Path)=>{
  if(path.length===target.length){out.push(path);return}
  const last=path[path.length-1],want=target[path.length];
  for(const c of cells)if(c.digit===want&&!path.includes(c)&&adj(last,c))walk([...path,c]);
 };
 for(const c of cells)if(c.digit===target[0])walk([c]);
 return out;
}
