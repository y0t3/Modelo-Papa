/** Auditoría de diferencias MV1 vs Integral y del uso efectivo de ambas hojas.
 * Solo lee los Tops PRE previamente generados. La cabeza real entra en el
 * cotejo POST, jamás para reordenar familias.
 */
import {readFileSync,writeFileSync} from 'node:fs';
type Kind=2|3|4;
type Candidate={family:string;values:string[];
 rankLalo?:number|null;rankAux?:number|null;roots?:number;sources?:string};
type Rank={method:string;mode:string;k:number;kind:Kind;
 result:{hits:number;ticketUnits:number};candidates:Candidate[]};
type Cut={date:string;turn:string;heads:{jur:string;head:string}[];
 ranking:Rank[]};
const data=JSON.parse(readFileSync('lab-results/modelo-lalo-integral-4semanas.json','utf8'));
const cuts=(data.cuts as Cut[]).filter(c=>c.turn!=='Previa');
const kinds:Kind[]=[2,3,4];
const diffs:any[]=[];
function record(c:Cut,k:Kind,top:3|5,method:string){
 const found=c.ranking.find(x=>x.kind===k&&x.k===top&&x.method===method&&
  x.mode==='IGUAL_PRESUPUESTO');
 if(!found)throw Error('Rango no encontrado '+c.date);
 return found;
}
for(const kind of kinds)for(const limit of [3,5] as const){
 const detail:{date:string;turn:string;jur:string;head:string;
 difference:'SUMA_INTEGRAL'|'PIERDE_INTEGRAL';
 picked:{family:string;source:string}[]}[]=[];
 let gained=0,lost=0,both=0,neither=0;
 let auxOnlyCandidates=0,sharedCandidates=0,laloOnlyCandidates=0;
 let numberIntegral=0,numberBaseline=0;
 for(const cut of cuts){
  const a=record(cut,kind,limit,'MV1'),b=record(cut,kind,limit,'INTEGRAL');
  const va=new Set(a.candidates.flatMap(x=>x.values));
  const vb=new Set(b.candidates.flatMap(x=>x.values));
  numberIntegral+=vb.size;numberBaseline+=va.size;
  for(const c of b.candidates){
   const l=c.rankLalo!==undefined&&c.rankLalo!==null;
   const x=c.rankAux!==undefined&&c.rankAux!==null;
   if(l&&x)sharedCandidates++;
   else if(l)laloOnlyCandidates++;
   else if(x)auxOnlyCandidates++;
  }
  for(const h of cut.heads){
   const suffix=h.head.slice(-kind);
   const inA=va.has(suffix),inB=vb.has(suffix);
   if(inA&&inB){both++;continue;}
   if(!inA&&!inB){neither++;continue;}
   if(inB)gained++;else lost++;
   detail.push({date:cut.date,turn:cut.turn,jur:h.jur,head:h.head,
    difference:inB?'SUMA_INTEGRAL':'PIERDE_INTEGRAL',
    picked:b.candidates.filter(x=>x.values.includes(suffix)).map(x=>({
     family:x.family,source:x.rankLalo&&x.rankAux?'DOS H':x.rankAux?'AUX':'LALO'
    }))});
  }
 }
 diffs.push({kind,limit,gained,lost,both,neither,net:gained-lost,
  selectedFamilies:{
   laloOnly:laloOnlyCandidates,auxOnly:auxOnlyCandidates,both:sharedCandidates
  },
  exposedNumbers:{lalo:numberBaseline,integral:numberIntegral},
  positiveExamples:detail.filter(x=>x.difference==='SUMA_INTEGRAL').slice(0,20),
  negativeExamples:detail.filter(x=>x.difference==='PIERDE_INTEGRAL').slice(0,20)});
}
const out={window:data.window,days:data.commonTurns.days,
 cuts:cuts.length,observedHeads:data.commonTurns.heads,
 methods:'MV1 vs Integral 65/35; IGUAL_PRESUPUESTO por corte',
 explanation:'Gana/pierde = cabeza cubre o deja de cubrir un sufijo en el Top; no dinero ni premios abonados',
 results:diffs};
console.log('INTEGRAL_DIAGNOSTICO',JSON.stringify(out));
writeFileSync('lab-results/modelo-lalo-integral-diagnostico.json',
 JSON.stringify(out,null,2));
