import type {Turno} from './domain';
export type AppTab='inicio'|'hoja'|'predictiva'|'prediccion'|'papa'|'cabezas'|'info';
export type NavigationEntry={
 screen:AppTab;scrollY:number;
 selectedTurn:Turno|null;focused:string|null;
 hojaFocused:string|null;hojaTurn:Turno;
};
export const safeScrollY=(y:number)=>Number.isFinite(y)?Math.max(0,y):0;
export function pushNavigation(history:readonly NavigationEntry[],
 entry:NavigationEntry,next:AppTab):NavigationEntry[]{
 if(entry.screen===next)return [...history];
 // Limitar sólo el historial interno de navegación, no el registro de pronósticos.
 return [...history.slice(-49),{...entry,scrollY:safeScrollY(entry.scrollY)}];
}
export function backNavigation(history:readonly NavigationEntry[]):{
 entry:NavigationEntry|null;remaining:NavigationEntry[]
}{
 if(!history.length)return {entry:null,remaining:[]};
 return {entry:history[history.length-1],remaining:history.slice(0,-1)};
}
