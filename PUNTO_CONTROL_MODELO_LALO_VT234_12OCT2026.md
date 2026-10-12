# Punto de control — Modelo Lalo con un único motor VT2/VT3/VT4
**12 de octubre de 2026. Primera integración funcional experimental.**

## Congelación y limpieza
- Referencia anterior preservada: `checkpoint-ui-motor-12oct2026` (commit `7d9b2ce37a447f79a1d7b9c9d175cc3d750e46f1`).
- Rama de diseño previo: `ui-refactor-hoja-12oct2026`.
- **Nueva rama activa experimental:** `modelo-lalo-motor-unificado-vt234`.
- **Eliminados de esta rama 52 módulos TypeScript legados y 114 scripts/workflows obsoletos** (Visual 6D, 7D, V1 semanal, antiguos selectores y auxiliares). Todos recuperables desde el checkpoint anterior o rama de investigación. Ninguno sigue importado por `App.tsx`.
- Se mantienen las capas independientes `sheet.ts`, `paths.ts`, `domain.ts`, `cabezas.ts`, `drawHistory.ts` y la presentación `PanoramaSheet`. Única entrada de selección: `buildMotorLalo()` de `src/motorLalo.ts`.
- Marca de Hoja: cabezas ya publicadas → coincidencias físicas POST, sin imponer trazos predictivos.
- Marca de Predictiva: rutas físicas calculadas ANTES del turno, sin consultar resultados objetivo.

## Motor Lalo v0 experimental

| Modalidad | Candidatura PRE | Condición física |
|---|---|---|
| **VT2** | Figuras de dos celdas confirmadas en D−7 / D−1, trasladadas a la misma fuente + caminos de dos celdas derivados de madres VT3 elegidas | Cada propuesta conserva su recorrido VT2 propio. |
| **VT3** | Traslados rígidos de huellas de tres celdas **confirmadas por cabezas completas anteriores** en D−7 / D−1, y nuevas bifurcaciones de la misma madre que conservan un borde consecutivo de dos casillas | Mismo origen de fuente; camino actual comprobable. |
| **VT4** | Prolongaciones válidas, por ambos extremos y sentidos, de padres VT3 dentro de su Top10; **cada hija de cuatro cifras** se almacena y ordena de forma separada | Obligatoria ruta de 4 celdas de la hija **exacta**; no prestar camino entre hermanas. |

- VT3 es el **motor madre**, pero VT2 también puede tener raíces propias y VT4 sólo nace de una VT3 físicamente apoyada.
- Los resultados se ordenan por familias reversibles; inversiones no multiplican familias ni confirman nuevos eventos.
- El archivo `motorLalo.ts` contiene **heurísticas explícitas descriptivas no calibradas**, inspiradas por las observaciones históricas D−7/D−1, fuentes/bloques, raíces únicas y bifurcaciones. **NO es una traducción exacta de un ranking de laboratorio de 115 cortes ni un modelo con ventaja predictiva demostrada**. Hay que evaluar históricamente antes de promover.
- Las confirmaciones se deduplican por **evento de cabeza completa anterior: fecha + turno + jurisdicción + número**, no por la cantidad de caminos que forma.
- D−7 = semana calendario previa; D−1 = última **jornada sorteada** real, desde `loadPreviousDraws`. Si falta D−7 no se inventa su antecedente.
- En raíz se usa sólo una de las **cinco jurisdicciones argentinas** como confirmación histórica. Montevideo alimenta los seis renglones de la hoja +11 pero no crea raíces históricas para el criterio argentino.
- Turno objetivo y columnas posteriores no están disponibles para generar candidatos. La función `compareMotorLaloAfterDraw()` devuelve coincidencias posteriormente y **no modifica los Tops**.
- Los Top3, Top5 y Top10 son familias **por modalidad** y muestran fuente, número de bloques, madre/antecedentes y estado observacional, nunca probabilidad estimada.

## Interfaz
- **MODELO LALO** es nombre visible y slug Expo (`modelo-lalo`); Android conserva `com.y0t3.modelopapa` como ID técnico, para no romper futuras actualizaciones de instalaciones existentes.
- Hoja +11: bordes/rellenos, sin líneas sobre las cifras; carrusel de cabezas por turno.
- Predictiva: marca las rutas reales de **las tres modalidades del motor nuevo** y conserva miniatura por ruta, antecedentes o madre.
- Predicción: fecha/turno y Top3/5/10 **VT2, VT3, VT4**, mostrando explicación accesible; contacto abre la misma familia de Predictiva.
- Cabezas: tabla propia, coincidencias por sufijo y no coincidentes atenuadas.
- Info: actividad geométrica de VT2/VT3/VT4; sin fingir estados de decadencia temporal todavía no demostrados.
- APK workflow actualizado: nombre Modelo Lalo, monograma ML y pruebas del motor actual en lugar de tests 6D.

## Validaciones y pendientes
Se agregó el flujo de Github Actions `validar-modelo-lalo.yml`: instalación, `npx tsc --noEmit`, y regresiones sintéticas `scripts/test-motor-lalo.ts`, incluidas:
- ninguna filtración PRE por resultados del turno objetivo ni columnas futuras,
- pertenencia a la misma fuente, sin reutilizar celdas,
- coincidencias de cabezas históricas completas, deduplicación de rutas,
- VT2/VT3/VT4, orientación reversible y **testigos físicos separados de hijas VT4**,
- comparación POST apartada de la clasificación PRE.

**Todavía pendiente:** ejecutar el nuevo algoritmo contra los 115 cortes históricos y controles igualados; evaluar en fechas prospectivas no empleadas para diseñar los criterios; probar el rendimiento, touch, legibilidad y el ensamblado APK Android en hardware real. No proclamar mejora de aciertos ni empaquetar como predicción verificada.

## Regla permanente
El checkpoint congelado jamás se altera. Los viejos motores no pueden ejecutarse en la app nueva. Se puede regresar al código anterior desde la rama de respaldo si algo no convence. Las nuevas reglas se conservan en esta rama de laboratorio hasta terminar las pruebas.
