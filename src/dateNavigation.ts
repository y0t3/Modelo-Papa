/** Política de navegación: las fechas elegidas manualmente se conservan.
 * Las respuestas de una carga anterior nunca deben modificar la fecha visible.
 */
export function followsNextDraw(manual:boolean,selectedTurn:string|null):boolean{
 return !manual&&!selectedTurn;
}
export function shouldAdvanceCompletedDay(input:{
 manual:boolean;selectedTurn:string|null;busy:boolean;date:string|null;today:string;complete:boolean
}):boolean{
 return followsNextDraw(input.manual,input.selectedTurn)&&!input.busy&&
  input.date!==null&&input.date===input.today&&input.complete;
}
export function acceptsDateResponse(start:number,current:number):boolean{
 return start===current;
}
