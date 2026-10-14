# VT3 · respaldo visual del recorrido antecedente

## Objetivo

En **HOJA PREDICTIVA → familia → Ver detalle**, cada recorrido muestra sus casillas actuales. Debajo de las referencias textuales, al tocar **Respaldo visual (N)** se abre una galería horizontal de mini columnas históricas, con la ruta exacta de cada raíz anterior resaltada y numerada 1–3 (VT3), incluida lectura histórica. También funciona para raíces VT2; VT4 conserva la atribución a su madre VT3 sin inventar raíces directas.

## Regla de genealogía (no modificar motor)

- Sólo se permite mostrar un respaldo cuyo `root.id` esté registrado en `route.rootIds` del **recorrido actual**, no todos los antecedentes de la familia y no antecedentes de otra hija VT4.
- `RootRef.oldCells` viene del camino observado en `historic.sheet.matches` que **explicó** una cabeza histórica, y el motor ya verificó contacto físico, fuente original, terminación y hoja.
- Se resuelve `root.date + root.period` en las hojas históricas ya cargadas (`hist`), con `oldTurn` y `sourceId` precisos. Se utilizan `source.values` **de esa fecha**, nunca cifras de la columna actual.
- `visualAntecedent` vuelve a comprobar: 2/3 celdas en filas 0–5 y columnas 0–1, sin reutilización, adyacencia y lectura coincidente con terminación de la cabeza. Cuando la hoja histórica no existe o no coincide, devuelve `null` y no crea imagen falsa.
- Dos cabezas históricas independientes que respaldaron el mismo camino físico generan **dos tarjetas separadas**. Dibujos inversos y referencias repetidas del mismo evento no se duplican.
- El bloque de historial usa `PanoramaRoute.antecedents` como **metadato visual opcional**. `buildMotorLalo`, puntuación, Top3/Top10, VT4 y POST no cambian.

## Archivos

- `src/panoramaModel.ts`: tipo `PanoramaAntecedent`, `visualAntecedent` y vinculación con la ruta visible.
- `src/ui/RouteMiniBoard.tsx`: grilla 6×2 reutilizable, tamaño normal para recorrido actual y compacto para antecedente.
- `src/ui/MiniRoutePreview.tsx`: acordeón y carrusel horizontal por recorrido.
- `App.tsx`: pasa `hist` ya cargado a `buildPredictivePanorama`.
- `scripts/test-antecedentes-visuales.ts`: regresiones del origen histórico, múltiples cabezas, separación PRE/POST y ninguna alteración del ranking.

## Cómo verificar

Ejecutar `npm install && npx tsc --noEmit && npx --yes tsx scripts/test-antecedentes-visuales.ts`, o revisar GitHub Actions.

Abrir una familia VT3 con antecedentes en PREDICTIVA. En cada tarjeta de recorrido:

1. Se mantiene **su mini tablero actual** y la lectura actual.
2. Aparecen las leyendas de los antecedentes ya presentes.
3. `▸ Respaldo visual (N)` abre las columnas anteriores con fuente, fecha, sorteo, jurisdicción, cabeza, casillas numeradas y **terminación histórica** (que puede ser distinta de la familia actual). `▾` cierra sin ocupar altura cuando no se consulta.

No se genera APK como parte de esta tarea. No hay nueva predicción ni acceso a datos futuros.
