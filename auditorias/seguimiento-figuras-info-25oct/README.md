# Integración experimental: Seguimiento de figuras — INFO · 25/10/2026

**Rama de trabajo:** `feature/seguimiento-figuras-info-25oct2026`.

## Qué agrega

Se añadió la tarjeta **«05 · Seguimiento de figuras»** en la pestaña **Info**, inmediatamente después de la galería de minihojas +11 y Santiago–Neuquén. Se conserva sin cambios la navegación principal, se desplaza la Guía del sistema a la sección 06 y se añade en el detalle de las familias VT3 del lector Lalo un acceso **«Seguir esta figura en Info»**.

La tarjeta empieza **cerrada**: no satura el tablero. Al abrirla:

- Recuentos de familias VT3 físicamente formables, no reconocidas y no reconocidas que tienen una marca ganadora histórica comprobada.
- Filtros **«Con rastro, fuera de Lalo»**, **«Reconocidas Top10»**, **«Todas»**, y buscador por familia/terminación. Lista de 12 por vez, con opción de continuar; **no es un Top predictivo**.
- Selección de una familia con minihoja **real**: cifras de la fuente del corte actual, recorrido de 3 celdas resaltado con orden 1–2–3, ruta histórica equivalente sobre los dígitos antiguos, fuente, fecha, evento ganador previo, cambio vertical y columna de aparición. Las dos figuras visualizadas corresponden a la **misma silueta exacta**, no a una similar forzada.
- Si hay múltiples recorridos o marcas históricas, muestra la cantidad y hasta seis antecedentes en el detalle sin sumar votos inventados por repeticiones de una misma ruta.
- Estados independientes de **Modelo Lalo +11**, **Auxiliar AYER** y **Auxiliar HOY**: formable o no, reconocida o no, puesto cuando está en el ranking. El lado AUX se comprueba en su **propia grilla**, no se superpone geométricamente al tablero +11.
- Botón **«Ver AUX AYER / HOY»** para iluminar un recorrido real de la familia dentro del tablero Santiago–Neuquén 2×12 del modo seleccionado, y acceso a su predictiva si el auxiliar la reconoce. Para Lalo se habilita acceso al recorrido únicamente cuando la familia está reconocida, evitando enseñar un trazo inventado desde el motor.
- Panel independiente de VT2 y VT4: la herramienta **observa VT3**; no modifica genealogías ni cuarta cifra, no modifica candidatos ni aumenta cupos.

## Qué computa y qué NO

El cálculo está implementado en `src/figureTracking.ts`, consumiendo la hoja del día y el conjunto de minihojas históricas **ya cargado** por Info. No requiere descargar nuevos resultados para generar las figuras. No cambia `src/motorLalo.ts`, `src/motorLaloAuxiliar.ts` ni `src/motorLaloIntegral.ts`.

- El objetivo se construye estrictamente desde `preSheetAtCut(sheet, turn, index)`. **No se utilizan cabezas ni marcas del turno que queremos predecir, ni de turnos posteriores**, aunque la pantalla se consulte días después.
- Los antecedentes históricos usan solo hojas de fecha **anterior** a la fecha examinada. Una raíz existe si `sheet.matches` explica una **cabeza real publicada** de VT3, con ruta exacta que usa celdas válidas. Se excluyen los eventos de Montevideo para mantener el criterio de raíces del motor oficial +11.
- La silueta VT3 es una cadena geométrica con inversión equivalente. Para el diagnóstico se compara la **misma silueta**, admitiendo un cambio de hasta dos filas. Se etiqueta si se mantuvo la fuente, si está en una fuente vecina o si apareció en otra fuente. No significa cruzar físicamente columnas de una misma hoja.
- Los números **actuales** salen solo de celdas visibles en el corte PRE. El antecedente tiene sus **dígitos y cabeza antiguos**; nunca se transfiere su valor numérico como propuesta.
- La rama permite tanto AYER, cuya grilla completa es utilizable desde Previa, como HOY, cuyos sectores solo existen una vez publicados los turnos anteriores de la misma jornada. Si faltan datos de una variante, se indica **«Sin datos»**, no se atribuye una predicción.
- **La mera presencia física, los testigos antiguos o las coincidencias entre motores no son señales validadas de mayor probabilidad de sorteo.** El orden del panel es un orden de consulta explicativo: primero formas no reconocidas con rastros, después las reconocidas y, por último, el resto.

## Pruebas

- `scripts/test-figure-tracking.ts` verifica rutas y familias reversibles, evento ganador histórico de fuente real, que alterar los resultados objetivo/futuros no altera el PRE, que no se aceptan antecedentes fechados en el día objetivo y que AUX HOY en Primera utiliza Previa publicada pero no antes.
- `tsconfig.seguimiento.json` permite revisar el código de app y su prueba aislada sin incorporar scripts de investigación histórica que están fuera del build, los cuales contienen avisos TypeScript previos y se ejecutan por separado mediante `tsx`.
- `.github/workflows/test-seguimiento-figuras.yml` verifica la compilación, la prueba nueva, regresión `test-motor-lalo.ts` y pruebas de las dos variantes auxiliares, galería y comparación.
- `.github/workflows/apk-seguimiento-figuras.yml` genera una **APK de prueba** de la rama con Expo/Gradle y guarda `app-release.apk` en el artefacto **`Modelo-Lalo-Seguimiento-Figuras-APK`** de su ejecución GitHub Actions.
- La reproducción del seguimiento no altera `main`, el motor MV1 congelado ni el APK previamente instalado por el usuario.

## Límites explícitos

- La visualización muestra las rutas físicas del tablero real actual y hasta seis eventos anteriores en el listado. En AUX ilumina la primera ruta física del modo, sin eliminar las demás. No es un GIF animado ni constituye prueba de que una figura continuará su trayectoria después del sorteo.
- El histórico de minihojas disponible en Info fija la memoria visual de esta pantalla (semana actual/anterior según la fecha seleccionada). No sustituye la memoria oficial D−1/D−7 de los motores.
- El salto hacia una hoja predictiva se ofrece para familias reconocidas. Una familia física **no reconocida** muestra su ruta de estudio en la tarjeta, sin inyectarse en los Tops.
- Las comparaciones retrospectivas no son sellos ex ante. Un futuro módulo podría registrar fotografías PRE de este panel antes de cada turno, pero **no está implementado aquí**.
