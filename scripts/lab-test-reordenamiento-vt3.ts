/**
 * Análisis fijo para comparar selectores sobre resultados PRE ya reconstruidos.
 * Se usa para informes de laboratorio y NO altera los motores.
 * Entrada: combinar las filas VT3 de `por-cabeza.json` de ambas
 * auditorías históricas (laboratorio ago-oct y holdout jul+23oct).
 * Estructura: {date,turn,kind,original:number|null,variant:number|null}.
 */
import fs from 'node:fs';

const files=process.argv.slice(2);
if(files.length!==2)throw Error('Uso: tsx scripts/lab-test-reordenamiento-vt3.ts <antiguo.json> <holdout.json>');
const rows=files.flatMap(f=>JSON.parse(fs.readFileSync(f,'utf8')))
 .filter((x:any)=>x.kind==='vt3');
const isTop3=(r:number|null)=>r!==null&&r<=3;
const gains=rows.filter((x:any)=>!isTop3(x.original)&&isTop3(x.variant));
const losses=rows.filter((x:any)=>isTop3(x.original)&&!isTop3(x.variant));
const binomialTail=(n:number,k:number)=>{
 const combinations=(n:number,r:number)=>{
  let v=1;for(let i=1;i<=r;i++)v=v*(n-r+i)/i;return v;
 };
 let p=0;for(let i=k;i<=n;i++)p+=combinations(n,i)/2**n;
 return p;
};
const pairedP=binomialTail(gains.length+losses.length,gains.length);
const success10=rows.filter((x:any)=>x.original!==null&&x.original<=10);
const weighted=new Map<string,Map<number,number>>();
for(const e of success10){
 const key=e.date+'|'+e.turn;
 let m=weighted.get(key);if(!m){m=new Map();weighted.set(key,m);}
 m.set(e.original,(m.get(e.original)||0)+1);
}
let seed=20261024;
const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
const sims:number[]=[];
for(let rep=0;rep<50000;rep++){
 let successes=0;
 for(const weights of weighted.values()){
  const ranks=Array.from({length:10},(_,i)=>i+1);
  for(let j=0;j<3;j++){
   const p=j+Math.floor(rand()*(10-j));
   [ranks[j],ranks[p]]=[ranks[p],ranks[j]];
   successes+=weights.get(ranks[j])||0;
  }
 }
 sims.push(successes);
}
console.log('LALO_HOLDOUT_PAREADO',JSON.stringify({
 heads:rows.length,top3Before:rows.filter((x:any)=>isTop3(x.original)).length,
 top3After:rows.filter((x:any)=>isTop3(x.variant)).length,
 gains:gains.length,losses:losses.length,pOneSided:pairedP
}));
console.log('LALO_HOLDOUT_ALEATORIO_CONDICIONAL',JSON.stringify({
 top10Wins:success10.length,positiveCuts:weighted.size,
 randomMean:sims.reduce((a,b)=>a+b,0)/sims.length,
 percentileGteActual:sims.filter(x=>x>=rows.filter((r:any)=>isTop3(r.variant)).length).length/sims.length
}));
