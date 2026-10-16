# Auditoría de formas físicas, posiciones y distancia respecto de ayer

**Laboratorio completado · 16/10/2026.** Rama experimental. No modificar `main`, motor Lalo, Geometría completa ni APK 0.3.5.

## Alcance y controles
- 53 jornadas completas · 265 turnos PRE reconstruidos · 1.325 cabezas de Ciudad, Provincia, Córdoba, Santa Fe y Entre Ríos, con Montevideo incluido como fuente de la hoja cuando corresponda.
- El objetivo de cada sorteo no entra en el motor. Las predicciones de este laboratorio **no estaban selladas antes de los sorteos**; todas las fechas ya eran conocidas y algunas fueron muy exploradas.
- Reproducción exacta de las primeras **10 familias y sus caminos representantes** de Geometría completa para cada uno de los 265 cortes. La auditoría se detiene si hay una diferencia. Sin modificar los motores base.
- Cada familia reversible VT3 se trata como unidad; las rutas en varias orientaciones no cuentan como múltiples aciertos ni múltiples familias.

## Hallazgo 1: 321 exclusiones por prioridad, 2 por desempate
De **1.325 cabezas**, **334** tenían alguna ruta VT3 válida físicamente en el PRE, **11** lograron Top3 geométrico, **323** quedaron por debajo. De estas últimas:
- **321** tenían un puntaje geométrico inferior al tercer puesto.
- **2** empataban en puntaje total con el tercer puesto, pero quedaron cuartas por los desempates de fuente/posición: **05/09 Matutino, familia 308/803**; **10/10 Nocturno, 465/564**.

Dentro de las 321 exclusiones por puntaje, el **primer factor de la comparación lexicográfica** que distinguió al ganador del tercero fue:
| Primer criterio inferior | Cabezas |
|---|---:|
| **Distancia máxima de la forma respecto de ayer** | **264** |
| Existencia de traslado de dos filas con raíces ganadoras verificadas | 41 |
| Distancia máxima con raíces verificadas | 6 |
| Existencia de traslado de dos filas respecto de ayer | 5 |
| Cantidad de cabezas anteriores independientes | 4 |
| Distancia máxima respecto de semana pasada | 1 |
| **Total** | **321** |

**Interpretación importante:** ser el primer criterio distinto NO implica causalidad. Otros criterios pueden ser colineales y producir casi el mismo orden cuando se elimina el primero.

## Hallazgo 2: tres ablaciones confirman redundancia del primer criterio
Se definieron cuatro estrategias sin usar las cabezas objetivo para seleccionar:
1. **ORIGINAL**: prioridades geométricas F_D1 de la APK, sin cambios.
2. **SIN_MAX_DISTANCIA_AYER**: eliminar *solo* el segundo campo del puntaje, distancia máxima D−1.
3. **TOPE_DISTANCIA_AYER_2**: reducir ese campo a `min(distancia, 2)`, preservando el resto.
4. **SIN_REFERENCIA_AYER**: eliminar los dos campos geométricos D−1 (traslado grande y máxima distancia), manteniendo D−7 y raíces comprobadas.

| Estrategia | Turnos en que cambió el Top3 | Aciertos Top3 15/08–14/09 | Aciertos 15/09–15/10 | Total |
|---|---:|---:|---:|---:|
| Original | 0 | 1 | 10 | **11** |
| Sin máxima distancia de ayer | 10/265 | 1 | 10 | **11** |
| Distancia de ayer limitada a 2 | 10/265 | 1 | 10 | **11** |
| Sin referencia geométrica de ayer | 10/265 | 1 | 10 | **11** |

**0 ganancias y 0 pérdidas** de coincidencias VT3 Top3 en las tres alternativas. Las diez alteraciones se reparten en cinco del primer período y cinco del segundo. La distancia de ayer aparece en la primera diferencia de prioridad de muchas familias, pero **no controla de forma exclusiva** la selección Top3 actual.

## Hallazgo 3: sesgo estable entre formas y fuentes
De las 795 posiciones Top3 (265 × 3):
- **739 (93,0%)** tenían testigo en la **Nocturna anterior**; 56 en la Matutina.
- **295** eran recorridos con un paso horizontal y uno vertical.
- **201** un paso diagonal y uno horizontal.
- **190** un paso diagonal y uno vertical.
- **109** una recta vertical de tres casillas.
- **0** con **dos pasos diagonales**.

Los caminos de dos pasos diagonales **sí existen** en las hojas: se contabilizaron **5.448 rutas físicas** de esa forma en los 265 PRE. Para **24 cabezas ganadoras físicamente presentes**, el *mejor recorrido de su familia bajo el puntaje actual* era de ese tipo. Aun así, **ninguno** fue elegido en el Top3, ni siquiera al quitar o limitar la distancia a ayer. Esto es un sesgo de selección que merece explicación, **no** prueba de que subir diagonales produciría más aciertos.

Formas representantes elegidas por mes:
| Forma | 15/08–14/09 (390 puestos) | 15/09–15/10 (405 puestos) |
|---|---:|---:|
| Horizontal + vertical | 137 | 158 |
| Diagonal + horizontal | 109 | 92 |
| Diagonal + vertical | 91 | 99 |
| Recta vertical | 53 | 56 |
| Dos diagonales | 0 | 0 |

Las mezclas son relativamente parecidas y **no explican por sí solas** el salto de un acierto Top3 en agosto a diez en septiembre/octubre. La cobertura física VT3 ganadora se mantuvo cerca del 25% en ambos períodos, como mostraron auditorías previas.

## Conclusión / próxima hipótesis
- **No activar ninguna de las tres ablaciones**: ninguna mejoró el histórico. No descartar que otros períodos respondan distinto.
- **No cambiar la APK** y no introducir recompensas automáticas por diagonales, fuentes o más rutas.
- Próximo examen causal: estudiar el origen de la exclusión sistemática de trayectorias **doble diagonal**, comparando el puntaje de sus *mejores representantes de familia* con figuras de la misma fuente y nivel de soporte real. Realizar controles de posición y forma sin usar resultados objetivo para configurar cambios. Separar en bloques temporales si se ensaya alguna variante.
- Mantener diferenciados **familia físicamente trazable**, **familia admitida** y **familia en Top3**. Estos resultados son retrospectivos, no estimaciones de probabilidad ni recomendaciones de apostar.

## Reproducción
- [GitHub Actions: 265 cortes y ablaciones aprobadas](https://github.com/y0t3/Modelo-Papa/actions/runs/38855388713)
- `scripts/lab-geo-shape-audit.ts` y `scripts/lab-geo-roots-265.ts` de la rama `lab/geo-ablacion-distancia-ayer-265-16oct2026`.
- Artefacto de workflow `HUELLAS-GANADORAS-265-CORTES`: `GEOMETRIA_FORMAS_POSICION_265_CORTES.json` con cada figura, rango, score y variantes A/B por corte, además de los JSON previos de huellas y desempates.
