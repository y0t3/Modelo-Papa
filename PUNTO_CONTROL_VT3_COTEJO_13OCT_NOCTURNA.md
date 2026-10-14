# Punto de control VT3/VT4 con jornada completa 13/10/2026

**Cotejo realizado después de la Nocturna, con datos publicados y cinco cortes secuenciales reconstruidos.** GitHub Actions [#38503989927](https://github.com/y0t3/Modelo-Papa/actions/runs/38503989927) finalizada correctamente, PRE intermedio versionado y objetivos físicamente ocultos durante cálculo del ranking. `main`, app y motor oficial sin modificaciones.

## Resultados de las cinco cabezas por corte

| Turno | Oficial VT3 Top3 / Top5 / Top10 | Tercera plaza D−1: Top3 / Top5 / Top10 | Candidata ascenso |
|---|---|---|---|
| Previa | 0 / 0 / 0 | 0 / 0 / 0 | `305/503` (#3, sin cambio) |
| Primera | 0 / **1** / **1** | 0 / 0 / **1** | `063/360` desde #10 |
| Matutina | 0 / 0 / 0 | 0 / 0 / 0 | `699/996` (#3, sin cambio) |
| Vespertina | 0 / 0 / 0 | 0 / 0 / 0 | `699/996` (#3, sin cambio) |
| Nocturna | 0 / 0 / 0 | 0 / 0 / 0 | `305/503` desde #4 |
| **Total (5 cortes, 25 cabezas)** | **0 / 1 / 1** | **0 / 0 / 1** | **Sin recuperación Top3** |

El control neutral por hash ascendió `485/584` de puesto #5 al tercero en Primera y obtuvo **1 Top3 de cinco cortes**. **No prueba eficacia de un criterio por hash**, es un control negativo que ilustra que las mejoras anecdóticas pueden no responder al mecanismo histórico.

## Casos explicativos prioritarios

**Primera / Ciudad `5485`**: familia VT3 `485/584`, rango oficial **#5**, 2 recorridos físicos, 2 admitidos y raíces independientes D−1 y D−7. Es la única familia ganadora Top10 VT3 del día. La política D−1 ascendió `063/360` del puesto #10 al #3: `485/584` fue desplazada al puesto **#6** y perdió el corte Top5. La cabeza **`5485` sí tenía cuaterna VT4 física y admitida en el ranking nativo (puesto #52)**, pero NO estaba en Top10 VT4.

**Primera / Provincia `0310`**: familia `013/310`, 1 recorrido VT3 físico, sin anclaje histórico, sin rango.
**Primera / Córdoba `8857`**: familia `758/857`, un recorrido VT3 admitido con respaldo D−7, rango **#42**.
**Matutina / Provincia `1057`**: familia `057/750`, **2 caminos físicos**, sin raíz VT3, sin rango; el Top3 Matutino oficial existía previamente sellado y no incluía esta terna.
**Nocturna / Provincia `1234`**: familia `234/432`, **2 caminos físicos anclados**, rango oficial **#21**, respaldo D−7; no alcanzó Top10.
**Nocturna / Santa Fe `4625`**: familia `526/625`, 2 caminos físicos, **sin anclaje**.
**Nocturna / Entre Ríos `9192`**: familia `192/291`, 1 camino físico, **sin anclaje**.
Las otras 18 cabezas no formaron ningún recorrido VT3 físico válido entre las fuentes visibles de su corte.

Inventario agregado: 7/25 cabezas forman un VT3 físico, 3/25 están admitidas con raíz propia, sólo 1/25 alcanza Top10 y ninguna Top3. **Cero coincidencias exactas en el Top10 VT4 corregido**. No confundir una familia VT3 acertada con acierto de cuaterna, ni negar existencia física de VT4 por quedar fuera del Top10.

## Comparación con muestra 15/09–10/10 (115 cortes)

Hasta el 10/10, el motor oficial acumulaba **5/115 cortes Top3, 8/115 Top5 y 15/115 Top10**. Sumando los cinco cortes del 13/10 solo como **lectura histórica exploratoria**, serían **5/120 Top3, 9/120 Top5 y 16/120 Top10**.

La challenger `MAS_D1` de tercera plaza en su laboratorio de los 115 cortes alcanzó **8/115 Top3, 9/115 Top5, 15/115 Top10**. Sumando este 13/10 retrospectivo, resulta **8/120 Top3, 9/120 Top5, 16/120 Top10**. Estas dos cifras combinadas no son validación prospectiva, porque regla y datos del 13/10 ya eran conocidos al realizar el cotejo.

## Integridad temporal

La Matutina se había **sellado el 13/10 a las 16:52:03 UTC (13:52:03 Argentina), antes del sorteo de las 15:00**, SHA `067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41`. La nueva reconstrucción comprobó **el ranking completo, rutas/bloques, D−1/D−7, fuentes y columnas**, comparándolo contra ese sello. No hay cambios en ese Top oficial.

**Importante:** las normas de la nueva challenger D−1 se formularon esa noche **después** de la Matutina, por lo que incluso aplicadas a un PRE oficial auténtico no constituyen pronóstico prospectivo de esa challenger. Las otras cuatro reconstrucciones PRE son retrospectivas.

## Conclusión

La jornada **no respalda que priorizar D−1 en la tercera plaza produzca una mejora inmediata**. La dificultad principal hoy se observó antes del ranking: 18 cabezas sin formación VT3 física, seis cabezas con formación válida pero fuera del Top10 y una sola ganadora dentro del Top10. En Nocturna las tres cabezas físicamente presentes fueron `1234`, `4625` y `9192`, sin candidatas oficiales Top10.

No implementar ningún cambio automático por este día. Mantener la única challenger D−1 congelada para evidencia futura auténtica junto al Top3 oficial y neutral. Revisión posterior sobre geometría/raíces sin transformar en nuevas reglas diseñadas con cabezas conocidas.

## Archivos de auditoría

- `PROTOCOLO_VT3_COTEJO_NOCTURNA_13OCT2026.md`
- `scripts/lab-vt3-cotejo-nocturna-13oct2026.mjs`
- `auditorias/vt3-cotejo-nocturna-13oct2026/{OBJETIVOS_POST_13OCT.json,INPUT_PRE_13OCT.json,PRE_13OCT.json,SELLO.json,POST_13OCT.json,RESUMEN.json,LECTURA.md}`.
- [GitHub Actions #38503989927](https://github.com/y0t3/Modelo-Papa/actions/runs/38503989927).

Sorteos de quiniela aleatorios; ninguna habilidad de pronóstico de la variación D−1 está demostrada.
