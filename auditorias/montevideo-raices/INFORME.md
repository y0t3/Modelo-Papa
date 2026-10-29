# ¿Aporta Montevideo como raíz histórica? — Lalo / Conectadas, VT2 / VT3

**Estudio realizado el 29/10/2026 · rama LAB aislada.** No se modifica `main`, APK, MV1 oficial ni sus valores por defecto.

## Diseño

Se reconstruyeron cronológicamente **127 jornadas, 635 cortes PRE y 3.401 cabezas publicadas evaluables** desde 01/06 hasta 28/10/2026. Se excluyó de la evaluación Santa Fé Nocturna 28/10, todavía pendiente de segunda corroboración en el conjunto auditado. Todas las variantes usan **las mismas columnas +11 y resultados de destino**, fuentes por jurisdicción con la última Nocturna auténtica y ventanas D−1/D−7 / seis jornadas reales según cada motor. La única variable es **permitir que Montevideo sea origen de recorridos históricos ganadores**, exclusivamente para los turnos y cabezas realmente publicados.

La comparación es pareada, por cabeza y corte. Se mantienen **hasta diez familias por Top10, cinco por Top5 y tres por Top3**, sin ampliar el presupuesto para incorporar Montevideo. **PRE reconstruidos en retrospectiva, no predicciones selladas antes del sorteo.**

- `src/motorLalo.ts`: argumento opcional **`montevideoHistoricalRoots=false`**; raíz histórica incluida solo si true; resto de MV1 sin cambios.
- `src/connectedVt3.ts`: argumento opcional **`montevideoHistoricalMarks=false`**; solo modifica los testigos ganadores anteriores; el modo vigente se mantiene por defecto.
- `src/connectedVt2LabMontevideo.ts`: lector independiente VT2 experimental con pares de dos trazos históricos (comparten exactamente una celda), proyectados íntegros a otra columna sin cruzar celdas para formar un valor. No entra en la app.
- `scripts/lab-montevideo-raices-635.ts`: ejecución reproducible y artefacto `resultados.json`.

El cierre reprodujo el histórico oficial anterior: Lalo VT3 **17/35/60**, Conectadas VT3 **25/46/81** y Lalo VT2 **17 Top10 en los 15 cortes nuevos**. La acción CI incluyó regresiones de Lalo y Conectadas.

## Resultados — Top3 / Top5 / Top10

| Motor | Top3 sin → con | Top5 sin → con | Top10 sin → con | Diferencia Top10 |
|---|---:|---:|---:|---:|
| **Lalo VT2** | 220 → 217 | 351 → 361 | 674 → 690 | **+16** |
| **Lalo VT3** | 17 → 20 | 35 → 34 | 60 → 63 | **+3** |
| **Conectadas VT2** | 209 → 207 | 324 → 324 | 675 → 664 | **−11** |
| **Conectadas VT3** | 25 → 28 | 46 → 49 | 81 → 88 | **+7** |

Una coincidencia es la **cabeza publicada** cuya familia VT2 o VT3 reversible aparece en el Top correspondiente. No son apuestas independientes ni probabilidades.

### Aciertos que ganan vs. aciertos que se pierden (Top10)

| Motor | Compartidos | Solo sin Montevideo como raíz | Solo con Montevideo | Saldo | Cortes con ranking Top10 cambiado |
|---|---:|---:|---:|---:|---:|
| Lalo VT2 | 646 | 28 | 44 | +16 | 482/635 |
| Lalo VT3 | 57 | 3 | 6 | +3 | 301/635 |
| Conectadas VT2 | 564 | 111 | 100 | −11 | 312/635 |
| Conectadas VT3 | 74 | 7 | 14 | +7 | 214/635 |

La variación de Top10 es alta comparada con los saldos: en Lalo VT2 se incorporaron 366 familias nuevas a los cupos acumulados y se retiraron 366 anteriores, consiguiendo 16 coincidencias adicionales. No se puede atribuir automáticamente todas las nuevas familias a una mejora.

### Pruebas emparejadas exploratorias (Top10)

Prueba binomial exacta bilateral sobre cabezas discordantes, además de bootstrap por jornada (6.000 remuestreos, percentiles 95 %; intervalos del saldo absoluto en 635 cortes):

| Motor | p bilateral (sin ajuste por múltiples pruebas) | Intervalo bootstrap por día del saldo |
|---|---:|---:|
| Lalo VT2 | 0,076 | [−2, +36] |
| Lalo VT3 | 0,508 | [−2, +9] |
| Conectadas VT2 | 0,491 | [−40, +16] |
| Conectadas VT3 | 0,189 | [−1, +15] |

**Ninguna diferencia es confirmatoria**, y hay 4 motores × 3 cupos × varios períodos; los p-valores no están ajustados y el experimento se ha generado tras investigaciones previas del mismo histórico. El bootstrap por jornada respeta parte de la dependencia intradía, pero tampoco valida capacidad predictiva.

### Cambios en el tiempo (Top10)

| Período | Lalo VT2 | Lalo VT3 | Conectadas VT2 | Conectadas VT3 |
|---|---:|---:|---:|---:|
| Junio–julio | +6 | +2 | −1 | +1 |
| Agosto–septiembre | +10 | +1 | −11 | +3 |
| Octubre 1–24 | 0 | 0 | −1 | +3 |
| Octubre 26–28 | 0 | 0 | +2 | 0 |
| **Total** | **+16** | **+3** | **−11** | **+7** |

La ganancia acumulada de **Lalo VT2** proviene íntegramente de junio–septiembre; octubre no aporta mejora Top10. Conectadas VT2 pierde en el acumulado. No conviene tomar la señal de verano/invierno como regla para el turno siguiente.

### ¿Ayudó específicamente a acertar más Montevideo?

| Motor Top10 | Destino Montevideo, sin → con | Destino otras cinco jurisdicciones, sin → con |
|---|---:|---:|
| Lalo VT2 | 48 → 48 | 626 → 642 |
| Lalo VT3 | 5 → 5 | 55 → 58 |
| Conectadas VT2 | 46 → 43 | 629 → 621 |
| Conectadas VT3 | 4 → 4 | 77 → 84 |

**El efecto neto no consiste en mejorar premios en Montevideo**; sus cabezas históricas actúan como testigos geométricos que alteran la prioridad para todo el tablero. Los sorteos inexistentes no se imputan.

## Decisión

- **Mantener Montevideo excluido como raíz por defecto de MV1 y Conectadas VT3**, porque no hay ventaja estable ni estadísticamente confirmada y abrirlo cambia muchos rankings.
- **Conservar dos variantes de seguimiento PRE auténtico**, especialmente **Lalo VT2 con Montevideo** y **Conectadas VT3 con Montevideo**, pero registrar los cuatro motores y comparar sin cambiar el cupo. 
- **Conectadas VT2:** no promover la inclusión, dado que produjo más desplazamientos perjudiciales que beneficios.
- **No elegir retrospectivamente el mejor motor según mes o turno**, ni mezclar sus Tops sumando cupos. Las diferencias históricas quedan como hipótesis para validación prospectiva.
- **Revisión del calendario**: los feriados parciales 20/06 y 09/07 mantienen cabezas uruguayas legítimas en los turnos efectivamente publicados. La base Nocturna +11 se arma por jurisdicción. Esta preparación de datos es separada de usar sus cabezas ganadoras como *raíces*.

## Ejecuciones y rastros

- [CI: comparación 635 cortes Montevideo VT2/VT3](https://github.com/y0t3/Modelo-Papa/actions/runs/40820733251), **success**, con `resultados.json` disponible como artefacto adjunto.
- `src/motorLalo.ts`, `src/connectedVt3.ts`, `src/connectedVt2LabMontevideo.ts` y `scripts/lab-montevideo-raices-635.ts` en esta rama.
- El modelo original de producción continúa idéntico porque ambos parámetros opcionales usan `false` por defecto.

**Advertencia:** Las comparaciones son retrospectivas de familias reversibles, no resultados prospectivos sellados. No demuestran ventaja estadística ni ganancia en apuestas.
