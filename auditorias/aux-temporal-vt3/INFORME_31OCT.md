# VT3 AUX: distribución de antecedentes en distintas jornadas
**Laboratorio retrospectivo PRE — 31/10/2026.** Rama `lab/aux-vt3-respaldo-temporal-31oct2026`.

## Pregunta de estudio
Para una familia VT3 del ranking original AUX, ¿conviene valorar más **eventos ganadores distintos** agrupados en una jornada, o evidencias geométricas compatibles distribuidas en varios días? ¿Se sostiene el criterio entre AUX Ayer y AUX Hoy, especialmente desde la Vespertina, cuando ambas hojas ya tienen sus 24 cifras?

Este informe **no modifica el motor Lalo, MV1, el selector auxiliar oficial, la interfaz ni la APK**.

## Reglas y diseño de prueba
- 119 jornadas completas desde junio a agosto (77) y septiembre–octubre 12–29 (42); 5 jurisdicciones evaluables por turno, sin Montevideo. En junio–agosto se descartan dos jornadas con resultados incompletos.
- PRE reconstruido: hojas AUX Ayer (24 cifras desde Previa) y AUX Hoy (0,8,16,24,24 cifras según turno). **Geometrías independientes**; caminos VT3 válidos de 3 celdas sin saltar, contacto vertical, horizontal y diagonal, cruce entre bandas de la **misma** hoja.
- Ranking auténtico construido únicamente con raíces ganadoras de la jornada anterior y el mismo día semanal anterior, no se reescribe. Sobre **sus primeras 20 familias**, se ensayan selectores alternativos de **diez** puestos. Solo cuentan cortes que poseen 20 familias para la tabla comparativa.
- Para analizar fechas, se usan las **últimas seis jornadas sorteables previas** con testigos de forma; la clave es **una cabeza ganadora histórica única**, deduplicada aunque tenga múltiples rutas. Geometría comparable por silueta reversible y traslado de máximo dos columnas. **No** equivale a afirmar que esa misma familia de cifras ganó antes; es una memoria de recorridos físicos compatibles.
- Selectores fijados: `spread` = más fechas distintas; `effective` = número efectivo de fechas `eventCount² / suma(eventos_en_día²)`; `cluster` = más eventos en un solo día; `recent` = más eventos en el último día disponible; `volume` = más eventos históricos únicos. Si hay empate se conserva el puesto original. Se conservan el Top10 oficial, puestos 11–20 y cinco controles neutrales deterministas entre las veinte familias.
- Se prueba sobre ambos períodos en GitHub Actions. Sus resultados conocidos motivaron el estudio: **no se puede considerar un test prospectivo ciego**.
- No se confunden eventos múltiples con múltiples recorridos. Los resultados del propio turno se incorporan solo a POST y únicamente para evaluación.

## Resultado comparable: hojas completas, Vespertina y Nocturna

| Selección | AUX Ayer: 234 cortes | AUX Hoy: 228 cortes |
| --- | ---: | ---: |
| Top10 original | 21 | 19 |
| Puestos 11–20 | 25 | **27** |
| Más jornadas con recuerdos geométricos | 22 | 22 |
| Distribución temporal más equilibrada | **25** | 20 |
| Mayor acumulación en una jornada | 23 | 23 |
| Más eventos del día previo | **25** | 22 |
| Más eventos únicos en seis jornadas | 23 | 22 |
| Control neutral (media de 5) | 21,4 | 24,0 |

Los números indican **coincidencias con cabezas**, no apuestas ni pruebas de rentabilidad. Una cabeza puede aportar una coincidencia por hoja si tiene recorrido en ambas; no se suman como resultados independientes.

En AUX Ayer, dos políticas alcanzan 25 y empatan con el bloque 11–20; frente a Top10 original la mejora aparente es **+4**. En AUX Hoy, ninguna política temporal se acerca a los **27** del bloque 11–20, y la mayoría obtiene resultados comparables o inferiores al control neutral.

### Períodos independientes en el análisis (sin ser validación prospectiva)

| Hoja completa | Período | Top10 | Fechas más distribuidas (`effective`) | Más recientes (`recent`) | Puestos 11–20 |
| --- | --- | ---: | ---: | ---: | ---: |
| AUX Ayer | Junio–agosto | 15 | 18 | 18 | 17 |
| AUX Ayer | Septiembre–octubre | 6 | 7 | 7 | 8 |
| AUX Hoy | Junio–agosto | 12 | 12 | 13 | 16 |
| AUX Hoy | Septiembre–octubre | 7 | 8 | 9 | 11 |

La mejora de AUX Ayer es modesta en ambos períodos. AUX Hoy no replica la mejora con estabilidad.

### Cuánto varía al remuestrear días enteros
Bootstrap descriptivo con **9.000 muestras** de jornadas completas (no candidatos aislados), comparación de la misma hoja/turno entre variante y Top10 original:

| Hoja completa | Variante | Diferencia de aciertos | Intervalo aproximado 95 % |
| --- | --- | ---: | ---: |
| AUX Ayer | `effective` | +4 | **−4 a +12** |
| AUX Ayer | `recent` | +4 | **−4 a +12** |
| AUX Hoy | `cluster` | +4 | **−5 a +14** |
| AUX Hoy | Puestos 11–20 | +8 | **−5 a +22** |

Todos los intervalos incluyen **0**. Tampoco corrigieron la selección por probar varias políticas; la evidencia es insuficiente para promover una variante. El control neutral es igualmente importante.

## Qué nos enseñan los casos del rango 11–20
- **29/10, Nocturna, Santa Fe 2813 (VT3 318/813), AUX Ayer puesto #12:** 4 raíces del ranking original (3 anteriores, 1 semanal). En la memoria ampliada de seis jornadas tenía **5 eventos geométricos compatibles en 5 fechas distintas**, uno por jornada; número efectivo de fechas = **5**. No tenía cruces entre franjas en los cuatro sitios físicos identificados. Esta información explica por qué es interesante para la hipótesis temporal, pero no prueba que deba promocionarse.
- **28/10, Nocturna, Entre Ríos 2547 (VT3 547/745), AUX Ayer #11:** 4 raíces originales y **5 eventos en 3 fechas** (distribución 1,2,2), número efectivo ~2,78.
- **27/10, Nocturna, Córdoba 1066 (VT3 066/660), AUX Ayer #15:** 4 raíces y **4 eventos en 3 fechas** (1,1,2), número efectivo ~2,67.

Las tres familias fueron descubiertas como casos del rango 11–20 mirando el POST; no ajustar la política a esas tres.

## La ventaja temprana y sus límites

| Hoja, primeros turnos | Top10 oficial | Fechas distintas | Distribución efectiva | Bloque 11–20 |
| --- | ---: | ---: | ---: | ---: |
| AUX Ayer, 351 cortes comparables | **38** | 33 | 32 | 39 |
| AUX Hoy, 176 cortes comparables | **20** | 14 | 14 | 18 |

**No trasladar el criterio temporal a los primeros turnos.** En AUX Hoy muchos cortes todavía ni siquiera tienen veinte candidatas; la tabla se restringe a los comparables. Los dos criterios de distribución pierden aciertos frente al Top10 original en esta etapa.

El criterio de concentración `cluster` cae de **20 a 13** en AUX Hoy temprana: señal de deterioro en estos datos (bootstrap de jornada: −13 a −2), aunque exploratoria por múltiples comparaciones. **No usarlo** en producción.

## Conclusiones

1. La cantidad de fechas con testigos físicos y la densidad de eventos en una sola jornada **no son equivalentes**. Guardarlas por separado es útil para explicar candidatas, no para imponer un pronóstico.
2. **AUX Ayer completa** mantiene una señal pequeña a favor de distribución equilibrada/recencia, pero **no supera controles rigurosos** y el tamaño de la diferencia es insuficiente.
3. **AUX Hoy completa** sigue mostrando resultados interesantes en los puestos 11–20, sin que una regla temporal reconstruida explique consistentemente qué familias promocionar.
4. El motor ya deduplica raíces y cuenta eventos ganadores, por lo que **no existe un fallo genérico de multiplicar votos por caminos** que debamos corregir.
5. Mantener **Top10 oficial intacto**, sin ampliar la cantidad de apuestas. Cualquier próxima política debe registrarse antes de revisar nuevas jornadas, contrastarse con controles neutrales, y comprobarse en PRE prospectivo sellado.

## Reproducción
- `src/labAuxTemporalVT3.ts`: índice de eventos por fecha, índice de diversidad y políticas de selección exclusivamente PRE.
- `scripts/test-aux-temporal-vt3.ts`: verifica deduplicación de rutas inversas, fechas, conteos, anti-fuga y selección exacta de diez.
- `scripts/lab-aux-temporal-vt3.ts`: replay, resultados por cortes/día/mes/turno y exportación JSON con explicación física por cada candidata.
- `.github/workflows/lab-aux-vt3-temporal.yml`: dos períodos y regresión del motor Lalo.
- [GitHub Actions, ejecución satisfactoria](https://github.com/y0t3/Modelo-Papa/actions/runs/41163156328), ambos trabajos **success**. Artifacts `aux-temporal-vt3-junio-agosto` y `aux-temporal-vt3-septiembre-octubre`.
