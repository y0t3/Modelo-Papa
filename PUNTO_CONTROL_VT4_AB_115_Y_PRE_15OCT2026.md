# Punto de control — VT4 concentrado versus intercalado por madres

**15/10/2026. Rama de laboratorio solamente. `main` permanece intacta; no APK.**

## Diseño experimental

- Misma versión de motor, mismos 115 cortes (23 días históricos; 575 cabezas) y **los mismos candidatos VT4 físicos prefijados** en ambos casos.
- **Control concentrado**: el ranking físico vigente antes del reparto por rondas, con prioridad a la mejor madre VT3 y después sus hijas.
- **Alternativa por rondas**: la primera hija física de cada madre VT3, luego las segundas de cada una, etc., conservando el criterio intramadre.
- Se controló, para **cada uno de los 115 cortes**, igualdad completa de `roots`, rankings VT2 y VT3 y catálogo de familias/hijas VT4 y testigos físicos. **Sólo cambian las posiciones VT4.**
- PRE calculado sin objetivos futuros: GitHub Actions movió `OBJETIVOS_POST_115.json` y el fixture con sorteos posteriores fuera del directorio de ejecución PRE. El archivo `PRE_115.json` se guardó con huella SHA256 `0cbec3f253adb1e1835c3a5cf6c7ed0440975e57922293483c310b7b578cd02d`. Recién entonces se restauraron objetivos para POST.
- **Limitación central:** prueba **retrospectiva**, no pronósticos emitidos realmente antes de los 115 sorteos. El método de rondas se eligió después de inspeccionar parte del historial: no inferir rendimiento prospectivo probado.

## Aciertos en 115 cortes

| Indicador | Concentrado | Rondas |
| --- | ---: | ---: |
| Cortes con al menos un acierto Top3 | 0 | 0 |
| Cortes con al menos un acierto Top5 | 0 | **3** |
| Cortes con al menos un acierto Top10 | 0 | **3** |
| Cabezas individuales acertadas Top10 | 0 | **3** |
| Número promedio de madres VT3 en Top10 | 2,42 | **10** |
| Valores VT4 exactos distintos cubiertos por Top10, promedio | 15,69 | **18** |

**Casos recuperados únicamente por rondas**:
- 24/09/2026 **Previa**: cabeza **3159**, grupo físico `3159/3951`.
- 03/10/2026 **Matutino**: cabeza **2592**, grupo `2295/2592`.
- 10/10/2026 **Nocturno**: cabeza **2654**, grupo `2456/2654`.

En los 115 cortes hubo tres ganancias y ninguna pérdida frente al control. **La diferencia en cobertura numérica (18 versus 15,69 valores exactos) puede explicar una parte del rendimiento:** no se debe confundir mayor exposición con una mejor clasificación probabilística. Tres aciertos no son evidencia estadística sólida y los cortes intradiarios no son independientes.

## PRE auténtico prospectivo del 15/10/2026 (Previa)

Se almacenó **antes del sorteo** en una rama separada:

- [PRE sellado con ambas listas](https://github.com/y0t3/Modelo-Papa/blob/prospectivo-vt4-a-b-previa-15oct2026/auditorias/prospectivo-vt4-ab-previa-15oct2026/PRE_15OCT_PREVIA.json)
- [Huella SHA256](https://github.com/y0t3/Modelo-Papa/blob/prospectivo-vt4-a-b-previa-15oct2026/auditorias/prospectivo-vt4-ab-previa-15oct2026/SELLO_SHA256.json)
- [Ejecución de GitHub Actions](https://github.com/y0t3/Modelo-Papa/actions/runs/38681189619)

Sellado UTC **2026-10-15T04:23:34.445Z** (01:23 Argentina). SHA256 **`f251926160d0d0bea9ea4d93a7d88b1c8646c7a304add5e07d206749992c0bb9`**.

| Puesto | Concentrado VT4 | Rondas VT4 |
| ---: | --- | --- |
| 1 | 3397/3793 | 3397/3793 |
| 2 | 0427/0724 | 0427/0724 |
| 3 | 6427/6724 | 2407/2704 |
| 4 | 4427/4724 | 0426/0624 |
| 5 | 2407/2704 | 3739/3937 |
| 6 | 6407/6704 | 4062/4260 |
| 7 | 4407/4704 | 0424 |
| 8 | 0426/0624 | 4206/4602 |
| 9 | 7426/7624 | 0244/0442 |
| 10 | 4426/4624 | 4042/4240 |

El PRE conserva en sus `paths` los números exactos válidos para cotejar, que **pueden ser un subconjunto de las orientaciones mostradas por la familia**. Nunca considerar acierto una orientación sin camino físico propio.

**Fuente parcial documentada:** Santa Fé Nocturna del 14/10 quedó `----` porque no había una cabeza verificable en el histórico usado. No se suplió ese dato artificialmente; puede afectar ambos Tops por igual. El sorteo del 15/10 no se consultó durante PRE.

## Decisión operativa

**Mantener el reparto por rondas ya incorporado a `main` como política de diversidad provisional**, pero no afirmar que es mejor predictor por sí mismo. El siguiente paso requiere medir resultados POST de las listas selladas y repetir las capturas prospectivas en diferentes jornadas sin alterar sus posiciones. **No crear otra APK hasta terminar estas comprobaciones**, según solicitud.
