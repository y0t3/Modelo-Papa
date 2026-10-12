# Modelo Lalo — medición PRE/POST de las tres modalidades (115 cortes)

**12/10/2026 · Experimento ejecutado sobre el motor exacto `src/motorLalo.ts` congelado previo al cotejo.** Resultados verificables en [GitHub Actions #38232286113](https://github.com/y0t3/Modelo-Papa/actions/runs/38232286113), artefacto `Modelo-Lalo-medicion-115-PRE-POST` (ID 11739505794). **No son pronósticos prospectivos ni ventaja de azar comprobada**: los criterios se concibieron tras estudiar reiteradamente estas fechas.

## Procedencia y aislamiento real de objetivos

30 jornadas crudas de Viví tu Suerte (07/09–10/10/2026), normalizadas a **las últimas cuatro cifras de cada resultado** igual que `src/cabezas.ts`, comprimidas en `fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64`; SHA256 del JSON canónico sin comprimir: `7e393c54b073cae83ae972b8511e533b61fbc087fe574a8dde84ae9100530217`.

Fechas objetivo: **23 jornadas, 15/09–10/10/2026, 115 cortes fecha×turno** (70 septiembre, 45 octubre). Antes de generar cada corte se borró la cabeza completa de **ese turno y todos los posteriores** de la entrada actual. El motor recibió únicamente fuentes +11 que precedían al turno y dos referencias:
- **D−7:** misma fecha calendario de la semana previa, con hoja comprobada anterior; y
- **D−1 operativa:** último día efectivamente sorteado, con propia base Nocturna anterior.

El flujo de GitHub Actions ejecutó `prepare`, **movió físicamente `OBJETIVOS_POST_115.json` fuera del directorio**, ejecutó `pre` sellando los 115 Tops y bolsas, y solo después restituyó `OBJETIVOS_POST_115.json` para `post`. PRE no abre ni contiene cabezas del turno objetivo. El código exacto está en `scripts/replay-lalo115.ts`; informes y CSV verificables descargables en el artefacto.

Criterio Top N: hasta **N familias reversibles**, no lecturas ni caminos por separado; cuenta **cortes con al menos una coincidencia** entre cinco cabezas argentinas; Montevideo participa en las fuentes geométricas, no entre los cinco objetivos.

## Resultados del motor Lalo actual

| Modalidad | Top3/115 | Top5/115 | Top10/115 | Esperanza Top10 de elegir al azar en **esa misma bolsa de familias** y cupo |
|---|---:|---:|---:|---:|
| **VT2** | **37** | **48** | **80** | **75,145** |
| **VT3** | **5** | **8** | **15** | **10,631** |
| **VT4** | **0** | **0** | **0** | **1,215** |

| Medida de cobertura física /115 | VT2 | VT3 | VT4 |
|---|---:|---:|---:|
| Cortes con alguna familia objetivo **en toda la bolsa PRE** | **111** | **46** | **7** |
| Exposiciones de familia objetivo dentro de la bolsa | 319 | 64 | 8 |
| Familias candidatas acumuladas (115 cortes) | 3.529 | 6.389 | 7.669 |
| Promedio de familias/corte | **30,69** | **55,56** | **66,69** |
| Cortes de septiembre con Top10 acertado /70 | 51 | 10 | 0 |
| Cortes de octubre con Top10 acertado /45 | 29 | 5 | 0 |

La esperanza aleatoria se calculó **exactamente por corte** con distribución hipergeométrica: misma bolsa, misma cantidad de familias seleccionadas y mismas familias objetivo alcanzables; luego se suman esperanzas. Es un control básico de cobertura, no iguala formas/densidad/orígenes, no aplica correcciones por muchas políticas ensayadas y no constituye prueba confirmatoria.

**Interpretación crítica**:
- VT2 Top10 80 contra 75,15 esperadas: gran proporción de cortes con coincidencia, pero gran parte explicable por elegir diez de las relativamente pocas familias VT2 disponibles.
- VT3 Top10 15 contra 10,63 esperadas: pista retrospectiva débil, no demuestra una señal que sobreviva a controles morfológicos equivalentes o a nuevas fechas.
- VT4 Top10 **cero**; sólo siete cortes tenían alguna hija ganadora físicamente posible entre TODAS las hijas del motor y quedaron fuera de diez primeras. No ocultar ni «corregir» la selección viendo POST. Primero investigar recuperación y elección de madre/dígito/hija, sin confundir apoyos prestados entre hijas.

Esta prueba difiere de rankings experimentales VT3 D−7 (16/115) y D−1 (18/115) estudiados antes; sus reglas y bolsas no son iguales y no deben tratarse como una comparación pareada directa.

## Decisiones inmediatas

1. **Congelar el motor medido** y los Tops entregados en este informe; no reajustar basándose en POST.
2. **Preparar APK de prueba** de Modelo Lalo para verificar su interfaz, legibilidad, flujo de turnos y que Hoja/Predictiva/Predicción muestran el mismo motor. Su uso exploratorio no implica recomendación de apuesta.
3. En iteraciones siguientes, inspeccionar los **7 casos VT4 con familia objetivo físicamente disponible pero no seleccionada**, y comparar controles de densidad por fuentes y bloques. Proponer ajustes en una rama separada y probar en fechas sin haber intervenido en su diseño.

**Archivo de resultados:** artefacto de Actions `Modelo-Lalo-medicion-115-PRE-POST`: `INPUT_PRE_115.json`, `REPLAY_PRE_115.json`, `OBJETIVOS_POST_115.json`, `REPLAY_POST_115.json`, `RESUMEN_115.json`, `BALANCE_115.csv`. Se generó íntegramente en el runner oficial, con resultados objetivo ausentes durante la fase PRE.
