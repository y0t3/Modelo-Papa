# Laboratorio VT4: admisión de madres fuera de Top10 y geometrías VT3 sin anclaje

**13/10/2026 · rama `lab-vt4-admision-madres-13oct2026`.** Código del motor y app no se cambian; el análisis vive en `scripts/` y `auditorias/`. No modificar `main`, VT3 oficial, sellos históricos ni predicciones publicadas.

## Problema
El reparto `CUPO_2` de VT4 con dos hijas por cada una de cinco madres VT3 recuperó 4/115 cabezas retrospectivas, pero no admite cuaternas físicamente correctas cuyas madres no estén en el Top10. En Matutina del 13/10, `1057` tiene camino completo propio, pero `105/501` y `057/750` no están admitidas en VT3. Distinguir **ausencia física**, **madre VT3 admitida de puesto >10** y **madre física sin admisión**.

## Reglas físicas y familiares inalterables
Cada candidata nace de un recorrido real de cuatro celdas distintas consecutivamente adyacentes de una misma fuente. Un tramo consecutivo de tres celdas es su **madre VT3 real**. La etiqueta sólo invierte esos tres dígitos y mantiene la cifra añadida en el mismo extremo. Ej. `3+226/622` produce `3226/3622` (prefijo); NO `3226/6223`. Reverso físico de recorrido admisible sólo si existe en la hoja. No prestar a una ruta sin anclaje las raíces de otra ruta de la misma familia. Una cuaterna física exacta ocupa a lo sumo una de las diez plazas, aunque pueda derivarse de varias madres o etiquetas.

## Niveles de admisión
- `TOP10`: sólo caminos propios de las diez primeras madres VT3 **admitidas**. Reproducir la bolsa del motor corregido actual exactamente.
- `ADMITIDAS`: todos los caminos de madres VT3 con traslado/bifurcación histórica propia, incluidos puestos 11 en adelante. Sus puestos/rutas vienen del motor PRE, sin leer el resultado.
- `FISICAS`: todos los tramos VT3 que realmente se pueden dibujar en la hoja PRE, aunque no posean raíz. Identidad por fuente/casillas/cifra; madre sin admisión explícitamente marcada `SIN_ANCLAJE`, sin inventar puesto ni pesos de raíces.

Los niveles se generan a partir de la **misma** hoja PRE. Verificar inclusión `TOP10 ⊆ ADMITIDAS ⊆ FISICAS` por identidad física de grupo+ruta.

## Métodos congelados antes de mirar etiquetas POST
Comparar Top3, Top5, Top10 con diez plazas EXACTAS, conservando nombre de madre, lado y cifra añadida:
1. `BASE_CORREGIDA`: Top10 original de la agrupación VT4 orientada, sin deduplicación numérica.
2. `TOP10_CUPO2`: dos hijas por madre, cinco madres, sin repetir cuaternas. Debe reproducir exactamente el experimento ya sellado.
3. `ADMITIDAS_CUPO2`: ampliar la bolsa a todas las madres admitidas pero mantener clasificación heredada/cupo2. **Control de admisión aislada:** si no modifica Top10, reportarlo.
4. `ADMITIDAS_ESTRATOS`: cuota orientativa de 4 plazas de madres VT3 #1–5, 2 de #6–10, 2 de #11–25 y 2 de #26 en adelante, sin más de dos por madre durante selección y con relleno físico si algún estrato no alcanza.
5. `FISICAS_ESTRATOS`: 4 de madres admitidas #1–5, 2 de #6–10, 2 de madres admitidas #11+ y 2 de madres **sin anclaje propio**; sin repetir cuaternas entre las diez.
6. `FISICAS_DOS_NUEVAS`: ocho primeras hijas priorizadas por `TOP10_CUPO2`, más dos de madres no admitidas; relleno desde disponibles.
7. `FISICAS_ORDEN_GLOBAL`: incorporar todas las madres físicas pero conservar prioridad por puesto original VT3 (las no admitidas al final). **Control para medir si ampliar admisión, sin reservar plazas, cambia algo.**

En cuotas o reservas, seleccionar el mejor grupo físico del estrato según mejor puesto real de madre, fuentes físicas, bloques, y desempate, idéntico en PRE; no premiar coincidencias posteriores. Si un estrato es insuficiente rellenar desde todas las admitidas/físicas y contabilizar falta. Todos salvo `BASE_CORREGIDA` deduplican cuaternas numéricas **reales** y nunca variantes teóricas sin recorrido.

## Evaluación y control temporal
Tomar los mismos **115 INPUT_PRE sellados previamente** (23 jornadas, cinco jurisdicciones argentinas por turno). Un workflow sacará físicamente `OBJETIVOS_POST_115.json` y fixture completo del checkout antes de procesar PRE. Crear `PRE_115.json` y `SELLO.json` versionados antes de restaurar POST. Contrastarlos posteriormente sin recalcular ranking. Comparar cada política contra las mismas diez plazas y con `TOP10_CUPO2` del experimento anterior: pruebas de reproducción exacta, ganancias/pérdidas, cantidad de cabezas ganadoras físicamente posibles pero sin madres admitidas, y proporción de cabezas cubiertas por la bolsa física total.

Separadamente, reconstruir **Primera y Matutina del 13/10** únicamente con PRE ya auditados y compruebe que la Matutina coincide con sello VT3 de 13:52 (SHA256 `067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41`). Evaluar `5485` y `1057`, explicar familia/recorrido/estrato/candidatura/puesto. Esta reconstrucción es **retrospectiva VT4**, no estaba sellada antes de las cabezas del 13/10.

## Interpretación
Los resultados de sorteos son aleatorios y el historial de 23 jornadas se investigó exhaustivamente. No confundir aumento de **cobertura física/posibles candidatos** con mejora de aciertos prospectivos. No promover nada a motor oficial antes de prueba independiente; sí producir hallazgos mecánicos reproducibles hoy mismo.
