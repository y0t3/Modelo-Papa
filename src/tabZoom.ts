export const ZOOM_TABS=['inicio','hoja','predictiva','prediccion','papa','cabezas','info'] as const;
export type ZoomTab=typeof ZOOM_TABS[number];
export const ZOOM_MIN=1,ZOOM_MAX=2.5;
export const ZOOM_STORAGE_KEY='modelo-lalo:zoom-pestanas-v1';
export type TabZoomLevels=Record<ZoomTab,number>;
export const defaultZoomLevels=():TabZoomLevels=>({
 inicio:1,hoja:1,predictiva:1,prediccion:1,papa:1,cabezas:1,info:1
});
export function clampZoom(value:number){
 if(!Number.isFinite(value))return ZOOM_MIN;
 return Math.round(Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,value))*100)/100;
}
export function decodeTabZoom(value:string|null):TabZoomLevels{
 const output=defaultZoomLevels();
 if(!value)return output;
 try{
  const raw:unknown=JSON.parse(value);
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return output;
  for(const tab of ZOOM_TABS){
   const current=(raw as Record<string,unknown>)[tab];
   if(typeof current==='number'&&Number.isFinite(current))
    output[tab]=clampZoom(current);
  }
 }catch{}
 return output;
}
export function applyTabZoom(levels:TabZoomLevels,tab:ZoomTab,next:number):TabZoomLevels{
 return {...levels,[tab]:clampZoom(next)};
}

/** Pan horizontal real del contenido ampliado, acotado a ambos bordes. */
export function clampPanX(offset:number,scale:number,viewportWidth:number):number{
 const width=Math.max(1,viewportWidth);
 const total=width*clampZoom(scale);
 const maxPan=width-total;
 if(!Number.isFinite(offset))return 0;
 return Math.min(0,Math.max(maxPan,offset));
}
/** Al pellizcar, el punto bajo los dedos queda en su posición horizontal. */
export function pinchAtX(startX:number,fromZoom:number,toZoom:number,focalX:number,width:number):number{
 const ratio=clampZoom(toZoom)/clampZoom(fromZoom);
 return clampPanX(focalX-(focalX-startX)*ratio,toZoom,width);
}
