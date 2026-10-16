# Ablaciones de Geometría completa, estabilidad y Top3 mixtos
**Laboratorio ejecutado 16/10/2026 — sin modificar la APK ni los motores de producción.**

## Protocolo
- 27 jornadas / 135 cortes cronológicos / 675 cabezas de las cinco jurisdicciones argentinas. Montevideo se incorpora a las grillas como fuente de cifras cuando estaba disponible.
- Cada PRE reconstruido usa solo cifras de los turnos anteriores, más hojas previas; **no se recuperaron predicciones selladas para todos estos cortes**. Tanto septiembre como parte de octubre fueron estudiados previamente y la sección 12–15/10 tampoco constituye prueba virgen.
- **Comprobación dura de implementación:** en los 135 cortes la copia experimental **BASE** reprodujo exactamente la lista completa de candidatos, cantidad de familias y cantidad de recorridos de `src/vt3Shadow.ts`; si hubiera divergencias el script habría abortado.
- Se evaluaron 8 estrategias definidas antes de ejecutar **esta comparación**, sin reordenarlas después de ver los resultados.

## Aciertos de familias VT3 en tres puestos
| Estrategia | 115 cortes hasta 10/10 | 20 cortes 12–15/10 | Total 135 |
|---|---:|---:|---:|
| **Geometría completa original** | 9 | 1 | **10** |
| **Lalo oficial original** | 5 | 0 | **5** |
| Sin prioridad de ayer | 9 | 1 | **10** |
| Sin prioridad de misma semana | 9 | 1 | **10** |
| Antecedentes verificados primero | 5 | 1 | **6** |
| Columna incorporada más recientemente primero | 4 | 1 | **5** |
| Dos primeras Lalo + primera exclusiva de Geometría | 8 | 0 | **8** |
| Dos primeras Geometría + primera exclusiva Lalo | 8 | 1 | **9** |

Son aciertos de familias reversibles de tres cifras en 675 cabezas; no significan predicción exacta de 4 cifras ni rendimiento financiero.

## Sensibilidad real del Top3
Frente al Top 3 de Geometría original:
- **Sin ayer**: se alteraron las tres primeras familias en solo **5/135** cortes, **0 ganancias y 0 pérdidas** de aciertos.
- **Sin semana anterior**: **2/135** cortes cambiados, **0 ganancias y 0 pérdidas**.
- **Antecedentes primero**: 112/135 cortes cambiados, **1 acierto nuevo frente al original, 5 perdidos**, total 6.
- **Nueva fuente primero**: 108/135 cortes cambiados, **3 nuevos y 8 perdidos**, total 5.
- **Oficial 2 + Geo 1**: 135/135 cambiados, **3 nuevos y 5 perdidos**, total 8.
- **Geo 2 + Oficial 1**: 130/135 cambiados, **2 nuevos y 3 perdidos**, total 9.

El parecido de conteos en la variante sin ayer / sin semana **no es prueba de que no aporten información nunca**: existe una pequeña modificación real de puestos. Pero bajo esta jerarquía prioritaria, su influencia marginal observada fue limitada.

## Inercia versus cambio de columna
- En los 108 pasos comparables entre turnos de una misma fecha, el Top 3 de **Geometría completa cambió en 8** y mantuvo exactamente las mismas tres familias en **100**.
- **Lalo oficial** cambió su Top 3 en **44/108**.
- La variante que favorece primero la **última columna disponible** cambió su Top 3 en **108/108**, sin mejorar aciertos. Más movimiento de los Tops no significa mejores candidatos.
- Geometría y Lalo no compartieron ninguna de sus tres primeras familias en **100/135** cortes; compartieron una en 34 y dos en 1. La diferencia de enfoque es tangible, pero no garantiza que mezclarlos mejore el resultado.

## Incertidumbre y lectura práctica
- Geometría − Lalo: **+5 aciertos sobre 135 cortes**, con remuestreo pareado por jornada (12.000 repeticiones, semilla 20261016) de **−2 a +12** de diferencia total; intervalo **descriptivo**, sin corrección por múltiples modelos ya explorados.
- El resultado reciente de **20 turnos** fue solo **1 versus 0** (familia 426/624 del 15/10 Nocturno), demasiado pequeño para una conclusión.
- Geometría original es el mejor de estas ocho estrategias en aciertos Top3 históricos; **no se obtuvo evidencia para cambiar sus pesos o introducir el híbrido en el motor estable**.
- Tampoco queda validado que el movimiento de la forma prediga el turno; el Top 3 ya existía desde la Previa en muchos de los casos acertados.
- No convertir el 10/135 en probabilidad de acertar cuando se juega ni venderlo como tasa prospectiva.

## Siguiente experimento sensato
1. Estudiar el mecanismo de **inercia** por familia y por fuente física: cuándo nace, cuándo reaparece en columnas nuevas y cuántos respaldos genuinamente independientes tiene. No contar otra ruta sobre la misma fuente como testimonio nuevo.
2. Revisar si el desplazamiento espacial parece discriminativo **frente a una selección neutral emparejada por fuente y disponibilidad de rutas**, no solo frente a azar simple sobre toda la bolsa.
3. Separar estudio del histórico de **validación futura**, sellando el Top 3 en cada turno antes de conocer sus cabezas.
4. Mantener la APK 0.3.5, Geometría y Lalo separados, sin alterar sus reglas hasta probar un criterio que generalice.

## Evidencia reproducible
- Ejecución: https://github.com/y0t3/Modelo-Papa/actions/runs/38847911001
- Artefacto `LAB-GEOMETRIA-LALO-HISTORICO-2026`: `GEOMETRIA_ABLACIONES_15SEP_15OCT2026.json` (ocho estrategias y resultados por corte) y `GEOMETRIA_LALO_RETRO_15SEP_15OCT2026.json` (auditoría completa).
- Scripts: `scripts/lab-geo-variants.ts` y `scripts/lab-geo-lalo-retro-2026.ts` en la rama de laboratorio.
