export const isoToDisplay=(iso:string)=>{const [y,m,d]=iso.split('-');return y&&m&&d?`${d}/${m}/${y}`:iso};
export const displayToIso=(v:string)=>{const m=v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(!m)return null;const [,d,mo,y]=m;const dt=new Date(`${y}-${mo}-${d}T12:00:00`);return dt.getFullYear()===+y&&dt.getMonth()+1===+mo&&dt.getDate()===+d?`${y}-${mo}-${d}`:null};
export const shiftDay=(iso:string,n:number)=>{const d=new Date(`${iso}T12:00:00`);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
export const previousDrawDay=(iso:string)=>{let x=shiftDay(iso,-1);while(new Date(`${x}T12:00:00`).getDay()===0)x=shiftDay(x,-1);return x};
export const shiftDrawDay=(iso:string,dir:1|-1)=>{let x=shiftDay(iso,dir);while(new Date(`${x}T12:00:00`).getDay()===0)x=shiftDay(x,dir);return x};
