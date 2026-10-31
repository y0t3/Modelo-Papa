import type {LaloFamily} from './motorLalo';
import type {FormChoice} from './motorFormasPrimero';

export type LaloPool='deep'|'unranked'|'outside20';
export type LaloQuota=1|3;
export type LaloAdmission={family:string;rankOriginal:number|null;formRank:number;source:string;days:number;events:number};
export type LaloHybrid={top:string[];admissions:LaloAdmission[];dropped:string[];pool:number;originalSize:number};

const seedHash=(s:string)=>{
 let h=2166136261;
 for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
 return h>>>0;
};
export const poolAccept=(rank:number|null,k:LaloPool)=>
 k==='deep'?rank!==null&&rank>20:
 k==='unranked'?rank===null:rank===null||rank>20;

export function selectLalo7mas3(args:{
 ranks:readonly LaloFamily[];forms:readonly FormChoice[];
 poolKind:LaloPool;quota:LaloQuota;seed:string;neutral?:boolean;
}):LaloHybrid{
 const {ranks,forms,poolKind,quota,seed,neutral=false}=args;
 const base=ranks.slice(0,10).map(x=>x.family);
 const known=new Map(ranks.map(r=>[r.family,r.rank]));
 if(new Set(base).size!==base.length||new Set(forms.map(x=>x.family)).size!==forms.length)
  throw Error('Familias duplicadas');
 const eligible=forms.filter(f=>poolAccept(known.get(f.family)??null,poolKind)&&!base.includes(f.family));
 const n=Math.min(quota,eligible.length,base.length);
 const chosen=neutral?[...eligible].sort((a,b)=>
  seedHash(seed+'|'+a.family)-seedHash(seed+'|'+b.family)||a.family.localeCompare(b.family)).slice(0,n)
  :eligible.slice(0,n);
 const admissions=chosen.map(f=>({family:f.family,rankOriginal:known.get(f.family)??null,
  formRank:f.rank,source:f.source,days:f.support.days,events:f.support.events}));
 const top=base.slice(0,base.length-n).concat(admissions.map(x=>x.family));
 if(top.length!==base.length||new Set(top).size!==top.length)throw Error('Presupuesto distinto');
 return {top,admissions,dropped:base.slice(base.length-n),pool:eligible.length,originalSize:base.length};
}
