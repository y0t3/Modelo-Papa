# Modelo Papá — protocolo descriptivo previo al atlas de 95 cortes (08–30/09)

**Fecha:** 10/10/2026. **Rama experimental:** `experimento-analisis-visual-5d`.

Se amplía el trabajo previo a **todas las huellas históricas marcadas**, tanto las que luego reaparecen como las que no. No se formula ni valida una regla predictiva nueva.

## Base y prohibición de fuga temporal

- Se reconstruyen las **20 jornadas con sorteos del 08 al 30 de septiembre de 2026**, con domingos 13, 20 y 27 excluidos. Hay **19 transiciones de jornada** y **95 cortes** antes de cada turno de la segunda a la última hoja. Esas hojas se reconstruyen de todas las cabezas conocidas, con absolutamente todos los caminos válidos VT2/VT3/VT4 post-sorteo, sin cruzar columnas y conservando cabeceras completas bajo la hoja.
- El visor **anterior al turno objetivo** muestra sólo fuentes +11 disponibles, reinterpreta las huellas completas realmente marcadas la jornada anterior y ve únicamente las marcas del día ya publicadas. Las inversiones son lecturas experimentales de un recorrido físico preexistente, **no tinta histórica original**.
- Los 95 archivos previos se guardan y publican **antes** de consultar cabezas del objetivo o de comparar con las marcas de la jornada nueva.
- El estudio posterior, en job separado, consulta cabezas del objetivo y hojas ya marcadas **después** de los sorteos. Sus cifras y categorías quedan en otro ZIP; **las hojas ciegas no se sobrescriben**.
- La fecha 23 forma parte de los días previamente vistos; la evaluación sigue siendo **retrospectiva descriptiva**, no un holdout nuevo ni prueba prospectiva.

## Unidad física y etiquetas congeladas para el reporte

- **Geometría física única**: combinación modalidad VT2/3/4 + columna de origen + secuencia de celdas, tomando esa secuencia o exactamente su reverso como **una sola forma**. Múltiples cabezas que marcaron una misma geometría no multiplican formas. No mezclar orígenes distintos en una unión física.
- Para cada geometría de la hoja anterior se buscan **todas** las geometrías confirmadas al cierre de la jornada nueva, siempre de la **misma modalidad y misma fuente física**; no se elige la más bonita ni se elimina una ruta por su posterior fracaso.
- **Misma huella**: igual lista de celdas, orientación directa/inversa considerada equivalente sólo para comparar figura.
- **Traslación**: el mismo orden relativo de pasos bajo orientación directa o invertida, desplazado a otro lugar **dentro de la misma fuente**.
- **Giro con extremo común**: comparten alguna celda de comienzo o final, pero no son la misma huella ni traslación.
- **Roce sin extremo**: comparten al menos una celda, pero no satisfacen ninguna de las anteriores.
- **Sin relación catalogada**: ni huella exacta, ni traslación, ni giro ni roce dentro de la misma fuente y modalidad. No equivale a ausencia de cualquier parecido posible ni a predicción fallida.
- Conservar **todas** las relaciones entre pares de dibujos, pero el balance suma **una sola vez cada geometría anterior** usando la primera categoría en precedencia exacta → traslación → giro → roce → sin relación. Reportar las geometrías nuevas sin antecedente además de las antiguas sin continuación. VT2, VT3 y VT4 siempre por separado.
- Cotejo posterior por turno: para cada corte se toman **TODAS** las lecturas de las huellas heredadas visibles; se muestran directa/invertida juntas, se comparan frente a **todas** las cabezas reales del turno y sus sufijos por modalidad. Sin cifra ni orientación preseleccionadas, coincidencia posterior significa **coincidencia permisiva**, nunca acierto pronosticado. Si faltan cabezas, ausencia de match queda indeterminada.

## Controles negativos

- Reportar por día y VT2/3/4 cantidad de figuras anteriores, figuras actuales, exactas, trasladadas, giros, roces y **sin relación**.
- Reportar para cada uno de los 95 cortes todas las familias de lectura con match posterior **y sin match**. No declarar eficacia, señal visual discriminante ni seleccionar candidaturas automáticamente.
- El atlas visual comparativo retrospectivo de `run-morphology-atlas7d.cjs` puede seguir mostrando similitudes entre distintas fuentes **sólo como analogía**, nunca enlazando físicamente sus dígitos.

El propósito es **aprender qué recorridos aparecen, desaparecen y varían de forma**, no fabricar una nueva fórmula. `main`, APK, selector congelado y motor oficial permanecen intactos.