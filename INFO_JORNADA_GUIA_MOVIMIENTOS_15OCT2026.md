# INFO · Jornada y guía · Modelo Lalo v0.3.0

## Objetivo
Sustituir el antiguo duplicado de cinco familias VT2/VT3/VT4 y la sección de «decaimiento» sin medición por **información útil, comprensible y trazable**. No tocar el motor ni sus pronósticos históricos.

## Estado de jornada
La pantalla recibe `date`, `turn`, `data`, `sheet`, `hist` y `motor` del App real. Muestra fecha, turno, jurisdicciones con cabeza cargada, las habituales sin resultado, columnas ya visibles y si contienen cifras auténticas. Montevideo sólo se considera habitual cuando corresponde a la programación conocida, sin identificar guiones como cancelación. Ningún dato se inventa para llenar una columna.

## Panorama interpretativo
La señal **actual** procede exclusivamente de `view.ranks.vt3.slice(0,10)` y sus recorridos físicos PRE. Cuenta una unidad por familia y fuente física, sin multiplicar los caminos alternativos del mismo respaldo; la zona de cada camino se calcula por el promedio de filas (0–1 superior, 2–3 central, 4–5 inferior). Si existen empates en fuente o zona, no se declara un dominante. Se compara descriptivamente con el POST histórico más reciente disponible (mismo turno en D−1/D−7 o turno anterior de hoy). **No se predice continuidad real ni se atribuye probabilidad.**

## Movimiento congelado e interactivo
Una tira de mini-tableros 6×2 muestra `D−7 · turno` (POST), `D−1 · turno` (POST), último turno ya publicado de hoy (POST) cuando existe, y `Hoy · candidatos` (PRE). Cada cuadro indica claramente PRE/POST. Se puede tocar para ampliar, cambiar con flechas, ver fuente/sector dominante y sumar recorridos distintos por celda. Es una **secuencia estática de posiciones seleccionables**, no un GIF, sin animación que pudiera sugerir seguimiento ficticio de una misma cabeza.

POST: cuenta unidades por cabeza completa + jurisdicción + fuente en coincidencias VT3 confirmadas. PRE: familias VT3 + fuente. Los conteos son **descriptivos de grupos diferentes**, no magnitudes equiparables de probabilidad.

## Guía
Secciones desplegables de tablero +11, geometría física VT2/VT3/VT4, jerarquía de Tops, navegación, PRE manual de Lalo, bajada 4→3→2, apuestas y términos PRE/POST. Colores existentes light/dark y botones de acceso a Hoja/Predictiva/Predicción/Lalo/Cabezas. Sin duplicar los rankings.

## Seguridad de cambios
- No cambia código de `src/motorLalo.ts`, `src/papaPronostico.ts`, `src/laloApuestas.ts`, `src/papaRegistro.ts`, almacenamiento local ni escalado/zoom.
- `src/infoInterpretacion.ts` es un módulo de análisis de sólo lectura.
- `src/ui/InfoDashboard.tsx` se reescribe sólo en presentación.
- `App.tsx` pasa las estructuras ya cargadas y la navegación entre pestañas.
- Prueba de no-filtración: alterar las cabezas del **turno objetivo** en la estructura POST no modifica el cuadro PRE ni sus comparaciones físicas anteriores.
- `app.json` versión 0.3.0 / Android versionCode 6.

## Límite de firma Android
El `assembleRelease` actual de GitHub Actions no administra una clave de firma persistente entre compilaciones. Si Android rechaza instalar esta versión sobre la anterior, **no desinstalar sin respaldo**: las apuestas y PRE/POST personales usan almacenamiento interno y podrían perderse. Una versión productiva necesita una firma estable y una migración segura.
