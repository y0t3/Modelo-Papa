// Almacenamiento local opcional de la bitácora experimental.
// Nunca guarda decisiones automáticamente al consultar una fecha histórica.
import AsyncStorage from '@react-native-async-storage/async-storage';
import {emptyDecisionMemory7D} from './decisionMemory7d';
import type {DecisionMemory7D} from './decisionMemory7d';
const KEY='modeloPapa:decisionMemory7d:v1';
export async function loadDecisionMemory7D():Promise<DecisionMemory7D>{
 const raw=await AsyncStorage.getItem(KEY);
 if(!raw)return emptyDecisionMemory7D();
 const data=JSON.parse(raw) as DecisionMemory7D;
 if(data.version!==1||!Array.isArray(data.records))throw Error('Formato de bitácora incompatible');
 return data;
}
export async function saveDecisionMemory7D(memory:DecisionMemory7D):Promise<void>{
 if(memory.version!==1||!Array.isArray(memory.records))throw Error('Bitácora inválida');
 await AsyncStorage.setItem(KEY,JSON.stringify(memory));
}
