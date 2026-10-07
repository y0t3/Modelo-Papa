import type {PredictiveView,PredictiveFamily} from './predictive';

export type AnalysisStrength='FUERTE'|'MEDIA'|'DÉBIL'|'DISPERSA';
export type AnalysisDecision='TOP 3'|'TOP 5'|'OBSERVAR'|'NO JUGAR';
export type AnalysisResult={
 target:string;strength:AnalysisStrength;decision:AnalysisDecision;
 selected:PredictiveFamily[];actualTernas:number;activeRoutes:number;confirmedRoutes:number;
 concentration:number;reason:string;experimental:true;
};

const cost=(family:string)=>{const [a,b]=family.split('/');return a===b?1:2};

export function analyzePredictive(view:PredictiveView):AnalysisResult{
 const ranked=view.hotFamilies;
 const activeRoutes=view.routes.filter(r=>r.state==='ACTIVA').length;
 const confirmedRoutes=view.routes.filter(r=>r.state==='CONFIRMA').length;
 const strong=ranked.filter(x=>x.state==='ACTIVA'||x.state==='CONFIRMA');
 const pool=strong.length?strong:ranked.filter(x=>x.state==='OBSERVAR');
 let selected:PredictiveFamily[]=[],spent=0;
 for(const f of pool){const n=cost(f.family);if(spent+n>5)continue;selected.push(f);spent+=n;if(selected.length>=5)break}
 const topSupport=ranked.slice(0,5).reduce((n,x)=>n+x.support,0);
 const allSupport=ranked.reduce((n,x)=>n+x.support,0);
 const concentration=allSupport?topSupport/allSupport:0;
 let strength:AnalysisStrength='DÉBIL',decision:AnalysisDecision='OBSERVAR',reason='Hay señales, pero todavía no concentran suficiente sostén.';
 if(!ranked.length||!selected.length){strength='DISPERSA';decision='NO JUGAR';reason='No hay recorridos confirmados suficientes para formar un paquete pequeño.'}
 else if(strong.length<=3&&activeRoutes>=2&&concentration>=.22){strength='FUERTE';decision=spent<=3?'TOP 3':'TOP 5';reason='Pocas familias concentran recorridos activos o confirmados.'}
 else if(strong.length<=6&&concentration>=.14){strength='MEDIA';decision=spent<=5?'TOP 5':'OBSERVAR';reason='Existe concentración, aunque todavía hay dispersión entre varias familias.'}
 else if(strong.length>10){strength='DISPERSA';decision='NO JUGAR';reason='Demasiadas familias tienen evidencia similar; el motor no fuerza una selección.'}
 return {target:view.target,strength,decision,selected,actualTernas:spent,activeRoutes,confirmedRoutes,concentration,reason,experimental:true};
}
