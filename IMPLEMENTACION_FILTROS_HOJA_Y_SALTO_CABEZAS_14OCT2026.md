# Hoja por turno y navegación desde Cabezas · 14/10/2026

## 1. Chip de recorrido completo por turno (HOJA)
- La Hoja mantiene un tablero +11 físico único con todos los orígenes (Nocturna anterior, Previa, Primera, Matutino, Vespertino).
- Sobre el tablero se encuentra el selector de turnos. **Tocar Previa, Primera, Matutino, Vespertino o Nocturno filtra inmediatamente las marcas a las rutas de TODAS las cabezas coincidentes de ese turno**.
- Se conservan todas las modalidades (VT2, VT3 y VT4) y todos los caminos físicos legítimos por cada cabeza; **no se crea ni deduce ningún camino nuevo**.
- Los chips `Toda la hoja` y `Solo [turno]` permiten comparar rápidamente el tablero completo con el turno seleccionado.
- Debajo del tablero se conservan las tarjetas individuales del turno para elegir una cabeza concreta. Tocar una cabeza aísla sus rutas, y se sigue pudiendo abrir su detalle con miniaturas.
- Los turnos sin cabezas o sin recorridos muestran el tablero sin marcas, nunca marcas de un turno ajeno.
- La app recupera las marcas previas al salir del filtro; ninguna filtración modifica datos, coincidencias ni el ranking Lalo.

## 2. Saltar de CABEZAS a HOJA
- En Cabezas, sólo una cabeza cuya terminación VT2, VT3 o VT4 esté efectivamente formada en la Hoja presenta `↗ Ver en hoja` y admite un toque.
- Se navega a `HOJA` con **exactamente ese turno y esa cabeza** seleccionados por su identificador `turno|jurisdicción|cuatro cifras`, que es idéntico al de `buildDailyPanorama`.
- Se resaltan sus recorridos, se excluyen las marcas de otras cabezas, y la pantalla se desplaza al tablero para permitir observar su posición. El usuario conserva la opción `Ver detalle`.
- Cabezas sin marca permanecen visibles pero inactivas; no se infiere ni se inventa una coincidencia.

## Archivos
- `src/panoramaModel.ts`: `dailyHeadOwnerId` y `routesForDailyTurn`, transformaciones puras y comprobables.
- `src/PanoramaSheet.tsx`: filtro de recorridos por turno, vista completa y recepción de foco externo.
- `src/ui/HeadsTable.tsx`: tocar únicamente cabezas con ruta.
- `App.tsx`: navegación a Hoja y desplazamiento al tablero.
- `scripts/test-hoja-turnos-cabezas.ts`: test de turno múltiple, identidad unívoca de la cabeza, deduplicación inversa, no contaminación entre turnos y cabezas sin coincidencia.
- `.github/workflows/validar-lalo-unificado.yml`: ejecuta las regresiones junto al resto del motor Lalo.

**No se genera APK en este cambio**. El motor `src/motorLalo.ts`, las genealogías VT3 y VT4, la pestaña Papá, el POST y las prioridades oficiales permanecen sin modificar.
