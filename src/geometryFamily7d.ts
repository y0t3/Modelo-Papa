// Familias de GEOMETRIAS GANADORAS ancladas en una ruta fisica D-7.
// Relaciones estrictas con la raiz. Nunca cierres transitivos A~B~C que fusionan A con C.
import type {Path} from './paths';
import type {SourceId} from './sheet';
import type {CycleKind} from './cycle7d';

export type FamilyIdentity7D={kind:CycleKind;sourceId:SourceId;route:Path};
export type FamilyRelation7D='EXACTA'|'TRASLACION_CERCANA'|'RAMA_CERCANA'|'NO_RELACION';
const at=(p:Path)=>p.map(c=>c.row+':'+c.col).join('>');
const edges=(p:Path)=>new Set(p.slice(1).map((c,i)=>p[i].row+':'+p[i].col+'>'+c.row+':'+c.col));
const motion=(p:Path)=>p.slice(1).map((c,i)=>(c.row-p[i].row)+','+(c.col-p[i].col)).join(';');
export function familyRelation7D(root:FamilyIdentity7D,other:FamilyIdentity7D):FamilyRelation7D{
 if(root.kind!==other.kind||root.sourceId!==other.sourceId)return 'NO_RELACION';
 const a=root.route,b=other.route;
 if(a.length!==b.length||a.length<2||a.length>4)return 'NO_RELACION';
 if(at(a)===at(b))return 'EXACTA';
 const dRow=b[0].row-a[0].row,dCol=b[0].col-a[0].col;
 if(Math.abs(dRow)<=1&&Math.abs(dCol)<=1&&motion(a)===motion(b)&&
    a.every((p,i)=>b[i].row-p.row===dRow&&b[i].col-p.col===dCol))
   return 'TRASLACION_CERCANA';
 // VT2: compartir una celda da muchas falsas familias; no promover por ramas VT2.
 if(a.length>=3){
  const base=new Set(a.map(x=>x.row+':'+x.col));
  const common=b.filter(x=>base.has(x.row+':'+x.col)).length;
  const ea=edges(a),eb=edges(b);
  if(common>=a.length-1&&[...ea].some(e=>eb.has(e)))return 'RAMA_CERCANA';
 }
 return 'NO_RELACION';
}
export const belongsToFamily7D=(root:FamilyIdentity7D,other:FamilyIdentity7D)=>
 familyRelation7D(root,other)!=='NO_RELACION';
export const familyIdentityKey7D=(a:FamilyIdentity7D)=>a.kind+'|'+a.sourceId+'|'+at(a.route);
