# Modelo Lalo VT2: cruce de señales dentro del día y D−7

**29/10/2026 · laboratorio experimental, sin alterar MV1, app, APK, Montevideo ni los Tops.** Se reproducen los **635 cortes PRE VT2 Lalo**, 127 jornadas y 3.401 cabezas; control original **Top3/Top5/Top10 = 220/351/674**. Se exigen fechas de referencia **D−7** que efectivamente figuren en el histórico, sin simular feriados: **119 pares válidos**. Los PRE son **reconstrucciones retrospectivas, no pronósticos sellados**.

## Qué representan las marcas

- **HOY:** la familia reversible VT2 ya tuvo una cabeza coincidente en el Top10 de un turno anterior de la misma jornada; para Primera, solamente Previa; para Nocturna, todos los cuatro anteriores.
- **SEMANA:** estaba presente en el Top10 del mismo turno exactamente siete días antes, aunque no hubiera sido ganadora ni ocupe el mismo puesto.
- **DOS MARCAS:** satisface ambas señales.
- **PRIORIDAD ENCADENADA:** hasta dos familias del Top10 actual, primero ganadoras del día; si faltan, las presentes D−7; si falta, completar desde el ranking Lalo. No suma cupos ni crea candidatos nuevos.

## Resultados más relevantes: cada familia acertada se cuenta una vez por turno

| Política de dos familias | Primera (119 cortes) | Nocturna (119 cortes) |
|---|---:|---:|
| Top2 original | 19 | 26 |
| Priorizar familias ganadoras de turnos anteriores hoy | 24 | **39** |
| Priorizar familias presentes D−7 | 24 | 31 |
| **Primero hoy y después D−7** | **29** | 38 |
| Exigir ambas señales y completar con Top2 | 20 | 30 |

**La doble marca no resultó una señal más confiable:** Primera registró **11 puestos** con dos marcas y **una cabeza coincidente**; Nocturna **56 puestos** y **10 cabezas**. Un control aleatorio intercambiando las máscaras semanales entre fechas del mismo mes y día de semana (20.000 réplicas) esperaba **2,3** y **9,7** coincidencias, respectivamente. No demuestra aumento por acumulación de dos marcas.

En Primera la prioridad encadenada obtuvo **29 familias coincidentes frente a 19 del Top2**. Por períodos: Jun–Jul 8 vs. 9; Ago–Sep 14 vs. 8; Oct 1–24 5 vs. 2; Oct 26–28 2 vs. 0. La señal mejora en los períodos posteriores, pero la política se investigó sobre el histórico conocido. No es validación prospectiva.

## Controles que limitan la interpretación

A nivel de **cabezas** (que pueden contar varias jurisdicciones para una sola familia), Primera fue **30 vs. 19** contra Top2; 20 ganancias exclusivas y 9 pérdidas, prueba exacta bilateral **p≈0,061** sin corrección. Contra «ganó hoy» fueron **30 vs. 24** (p≈0,286), y contra «estuvo D−7» **30 vs. 26** (p≈0,344).

Una permutación del respaldo semanal entre fechas de mismo mes y día de semana, respetando resultados actuales y ganadoras previas, calculó **26,4 cabezas esperadas** para «hoy y luego D−7», frente a **30** observadas en Primera; **p unilateral ≈0,169**. **No quedó demostrado que D−7 aporte información predictiva adicional**.

En Nocturna la combinación de señales **no mejora** el uso de las familias que ya ganaron antes ese mismo día: **38 vs. 39 familias**.

Una prueba retrospectiva con ventana de cinco días para activar la prioridad encadenada tampoco reconoció oportunamente las fases favorables. Su umbral se eligió a posteriori y no debe convertirse en fórmula automática.

## Un ejemplo útil para la lectura visual: Primera 27/10

- Previa: **1680** de Entre Ríos, familia **08/80**, puesto **#3**.
- Primera PRE: **08/80** en **#4**, marcada por el acierto de Previa.
- Primera D−7 (20/10): familia **38/83** ocupaba el puesto **#2**.
- Primera PRE 27/10: **38/83** estaba en **#8**.
- Resultados Primera 27/10: **1308** (08/80, Entre Ríos), **7638** y **7438** (38/83, Provincia y Santa Fe). La selección de **#4 y #8** habría capturado **dos familias y tres cabezas**, antes del resultado. Es un ejemplo especialmente favorable; no una garantía de repetición.

## Decisión

Mantener **Top10 original y MV1 completos**. No exigir que las dos marcas concurran ni alterar rankings. En la futura interfaz de VT2 mostrar **por separado** «familia acertó hoy: turno/puesto» y «familia presente en D−7: puesto», y resaltar coincidencias POST desde el primer vistazo con Top10 siempre visible. Retirar «Nueva Prueba» de la sección visible cuando se haga la actualización pactada, sin perder PRE antiguos.

**Reproducible:** `scripts/lab-vt2-cruce-previa-semana.py` consume el JSON de PRE VT2 generado por `scripts/lab-vt2-posiciones-libres.ts`, verifica 635 cortes y vuelca resultados y cortes individuales. Ver [GitHub Actions #40834161462](https://github.com/y0t3/Modelo-Papa/actions/runs/40834161462), ejecución completada correctamente. El laboratorio estadístico ampliado con controles aleatorios y su JSON están adjuntos a la conversación.

**Advertencia:** todos los análisis son exploratorios, con numerosas hipótesis examinadas sobre resultados conocidos. No prueban un rendimiento futuro superior al azar ni una ventaja monetaria.
