# Auditoría de calidad: cabezas de cinco caracteres frente al tablero +11 (115 cortes)

**11/10/2026. Auditoría de sensibilidad reproducida**, no nuevo método predictivo ni nuevo ajuste de ranking. **Se conserva el PRE prospectivo de Previa 12/10 previamente sellado e independiente.** No cambiar `main`, APK o tablero.

## Hallazgo y corrección determinista

Se revisaron **30 archivos JSON originales** del artefacto de GitHub Actions run `38107717643` / artefacto `11690333869`, del 07/09 al 10/10. Había **25 entradas numéricas con cinco caracteres**: 10 de las **seis jurisdicciones del tablero físico** `1,2,7,3,5,4` (Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos, Montevideo), las otras 15 en jurisdicciones adicionales no dibujadas por ese tablero.

El programa Python histórico de los 115 cortes excluía esas cabezas como no cuatro cifras y convertía su +11 en `--`, omitiendo casillas y posibles recorridos. Sin embargo, la app actual `src/cabezas.ts` normaliza a **últimas cuatro cifras**, p. ej. Santa Fe Nocturno 10/10 `26215` → `6215`; de `6215` sale columna +11 `26`. La corrección reintroduce esa fila en el tablero (no agrega nuevos turnos o fuentes; solo repara los dígitos dentro de la misma pareja de columnas).

## Qué se repitió, sin retocar el ranking

Se copiaron los treinta JSON crudos, se modificaron **exclusivamente esas 10 entradas de seis filas** por las últimas cuatro cifras, y se reejecutaron `1_preparar_PRE.py` original y `1_generar_ranking_PRE.py` con las mismas tres políticas y desempates. El único cambio en el generador de ranking fueron rutas locales de archivo y hash obligatorio de su nuevo PRE. Se cotejó usando las mismas 5 jurisdicciones argentinas de salida, con normalización concordante; ningún resultado target se usó en elección PRE.

| Magnitud | LEGACY | Lectura 4 cifras corregida |
|---|---:|---:|
| Grupos madre VT3+dígito generados en 115 cortes | **30.320** | **36.550** (+6.230) |
| Cortes que cambian cantidad de madres elegibles | — | **39/115** |
| Cortes que cambian conjunto de cabezas objetivo POST | — | **8/115** |
| PRE de `D7_MADRES_DIGITO_FIJO` Top3/5/10 con cambios en sus lecturas | — | **33 / 37 / 37** |
| PRE de `D7_MADRES_ROCE` Top3/5/10 con cambios en sus lecturas | — | **33 / 37 / 37** |
| PRE de `MULTIRRUTA_MADRES_ROCE` Top3/5/10 con cambios en sus lecturas | — | **27 / 33 / 36** |

Aciertos retrospectivos, **número de cortes con al menos uno**:

| Política | Top3 LEGACY → nuevo | Top5 LEGACY → nuevo | Top10 LEGACY → nuevo |
|---|---:|---:|---:|
| D7 madres, dígito fijo | 0→0 | 1→1 | 1→1 |
| D7 madres, roce | 0→1 | 1→1 | 1→1 |
| Multirruta madres, roce | **1→0** | **2→1** | **3→2** |

El resultado original `MULTIRRUTA Top10 = 3/115` **depende del defecto de normalización**; con la lectura de tablero acorde a la app, queda `2/115`. Las dos versiones son retrospectivas y ninguna demuestra ventaja predictiva. Un cambio de 10 entradas puede afectar varias fechas posteriores al convertirse en bases D−7 o Nocturna anterior; por eso 39 cortes cambian elegibilidad.

## Reproducción

ZIP de conversación `modelo-papa-auditoria-parser-cuatro-cifras-vt4-115-cortes.zip`, SHA256 **`ff2635c93938d61fa34933475028ca81f948cb88445a91b5982b41448d117fe0`**, **2.359.664 bytes**, 44 archivos; `ZipFile.testzip()` OK. Incluye 30 fuentes normalizadas, PRE antiguo y normalizado, POST original, scripts `1_preparar_PRE.py`, `1_generar_ranking_PRE.py` y `comparar_sensibilidad.py`, y el balance automático `AUDITORIA_REPRODUCIDA.json`. Comandos de reproducción en `LEEME.md`.

**El PRE auténticamente anterior al sorteo del lunes 12/10, Previa**, ya publicado con commit **`0eb93d85f43d9b798e6560bf74a00f4a6fb358da`**, declaró antes del resultado que usaría normalización de últimas cuatro cifras; su abstención total fue registrada antes de este informe. Ver `prospectivo/PRE_2026-10-12_Previa.json`.

**Estado: cierre de control de calidad histórico.** Mantener separado de la hipótesis primaria VT2 V9, que sigue sin código exacto recuperado. Abstenciones y fechas nuevas continúan evaluándose bajo captura PRE estricta, sin retoques retrospectivos.
