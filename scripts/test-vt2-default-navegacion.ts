import assert from 'node:assert/strict';
import fs from 'node:fs';
import {combinedFocusVisual,combinedOwnerId} from '../src/combinedFocusVisual';

const read=(p:string)=>fs.readFileSync(p,'utf8');
const main=read('App.tsx');
const info=read('src/ui/InfoDashboard.tsx');
const prediction=read('src/ui/PredictionSummary.tsx');
const combined=read('src/ui/CombinedVt3Panel.tsx');
const pano=read('src/PanoramaSheet.tsx');
const aux=read('src/ui/AuxiliaryPredictiveSheet.tsx');
assert(pano.includes("{vt2:true,vt3:false,vt4:false}"));
assert(pano.includes("mode==='predictiva'?'vt2':'all'"));
assert(pano.includes("if(active)return data.routes.filter(r=>r.ownerId===active)"));
assert(aux.includes("useState<Filter>('vt2')"));
assert(aux.includes("vt2:true,vt3:false,vt4:false"));
assert(!prediction.includes('backgroundColor:i===0?c.accent'));
assert(!combined.includes('backgroundColor:i===0?c.accent'));
assert(prediction.includes("onPress={()=>onOpenFamily?.(kind+'|'+f.family)}"));
assert(prediction.includes('Ver formación aquí'));
assert(combined.includes('onPress={()=>onOpenFamily?.(entry)}'));
assert(main.includes('onOpenFamily={showFamily}'));
assert(main.includes('onOpenFamily={showAuxFamily}'));
assert(main.includes('onOpenFamily={showCombinedFamily}'));
assert(main.includes('combinedFocusVisual(combinedFocus)'));
for(const word of ['Cómo vienen','Comparar turnos','Un vistazo rápido'])
 assert(!info.includes(word),'Info todavía contiene '+word);
assert(info.includes("section==='auxiliar'?<>\n     <TurnStrip"));
const pick={
 family:'197/791',rank:3,
 paths:[{source:'prevNocturno',value:'197',cells:[
  {row:0,col:0},{row:1,col:1},{row:2,col:0}
 ]}],
 seenPreviously:1
};
const view=combinedFocusVisual(pick);
assert.equal(view.groups[0].id,combinedOwnerId(pick.family));
assert.equal(view.groups[0].routeCount,1);
assert.equal(view.routes[0].ownerId,combinedOwnerId(pick.family));
assert.equal(view.routes[0].readings[0],'197');
assert.equal(view.routes[0].cells.length,3);
console.log('VT2_DEFAULT_Y_NAVEGACION_MOTORES_OK');
